"""Local FIKRA website and persistent appointment booking API (standard library)."""
from datetime import datetime, timedelta, time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from zoneinfo import ZoneInfo
from urllib.parse import urlsplit, parse_qs
import argparse
import json
import re
import sqlite3
import threading
import uuid

ROOT = Path(__file__).resolve().parent


class BookingError(Exception):
    def __init__(self, message, status=400):
        self.message, self.status = message, status


class BookingStore:
    def __init__(self, database, config_path):
        self.database, self.config_path = str(database), Path(config_path)
        with self.connect() as db:
            db.execute('CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, slot TEXT UNIQUE NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, project TEXT NOT NULL, created_at TEXT NOT NULL)')

    def connect(self):
        return sqlite3.connect(self.database, timeout=10)

    def config(self):
        config = json.loads(self.config_path.read_text())
        ZoneInfo(config['timezone'])
        if not 5 <= config['durationMinutes'] <= 240:
            raise ValueError('Invalid duration')
        if not all(type(day) is int and 0 <= day <= 6 for day in config['workingDays']):
            raise ValueError('Invalid working days')
        if time.fromisoformat(config['startTime']) >= time.fromisoformat(config['endTime']):
            raise ValueError('Invalid working hours')
        return config

    def availability(self, date_string, now=None):
        c = self.config()
        zone = ZoneInfo(c['timezone'])
        now = now or datetime.now(zone)
        try:
            day = datetime.strptime(date_string, '%Y-%m-%d').date()
        except (ValueError, TypeError):
            raise BookingError('Choose a valid date.')
        result = {'configured': bool(c['enabled'] and c['workingDays']), 'timezone': c['timezone'], 'durationMinutes': c['durationMinutes'], 'slots': []}
        if not result['configured'] or not now.date() <= day <= now.date() + timedelta(days=c['daysAhead']):
            return result
        # JavaScript/JSON days: Sunday=0, Monday=1, ..., Saturday=6.
        if (day.weekday() + 1) % 7 not in c['workingDays']:
            return result
        start = datetime.combine(day, time.fromisoformat(c['startTime']), zone)
        end = datetime.combine(day, time.fromisoformat(c['endTime']), zone)
        duration = timedelta(minutes=c['durationMinutes'])
        notice = now + timedelta(minutes=c['minimumNoticeMinutes'])
        with self.connect() as db:
            taken = {row[0] for row in db.execute('SELECT slot FROM bookings WHERE slot LIKE ?', (date_string + '%',))}
        while start + duration <= end:
            slot = start.isoformat()
            if start >= notice and slot not in taken:
                result['slots'].append({'value': slot, 'time': start.strftime('%H:%M')})
            start += duration
        return result

    def book(self, payload):
        if not isinstance(payload, dict):
            raise BookingError('Invalid booking details.')
        fields = {}
        for field, limit in [('name', 120), ('email', 254), ('project', 3000), ('slot', 50)]:
            value = payload.get(field)
            if not isinstance(value, str) or not value.strip() or len(value) > limit:
                raise BookingError('Complete all booking details.')
            fields[field] = value.strip()
        if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', fields['email']):
            raise BookingError('Enter a valid email address.')
        available = self.availability(fields['slot'][:10])
        if not available['configured']:
            raise BookingError('Booking availability has not been configured yet.', 503)
        if fields['slot'] not in {slot['value'] for slot in available['slots']}:
            raise BookingError('This time is no longer available. Choose another slot.', 409)
        booking_id = str(uuid.uuid4())
        try:
            with self.connect() as db:
                db.execute('INSERT INTO bookings VALUES (?, ?, ?, ?, ?, ?)', (booking_id, fields['slot'], fields['name'], fields['email'], fields['project'], datetime.now(ZoneInfo('UTC')).isoformat()))
        except sqlite3.IntegrityError:
            raise BookingError('This time is no longer available. Choose another slot.', 409)
        return {'id': booking_id, 'slot': fields['slot'], 'timezone': available['timezone'], 'durationMinutes': available['durationMinutes'], 'status': 'confirmed'}


class Handler(SimpleHTTPRequestHandler):
    store = None
    attempts = {}
    attempts_lock = threading.Lock()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def reply(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlsplit(self.path)
        if parsed.path == '/api/availability':
            try:
                self.reply(self.store.availability(parse_qs(parsed.query).get('date', [''])[0]))
            except BookingError as error:
                self.reply({'error': error.message}, error.status)
            except (ValueError, KeyError, OSError):
                self.reply({'error': 'Booking configuration is unavailable.'}, 503)
            return
        # Serve only public website assets, never configuration, backups or client records.
        target = Path(self.translate_path(parsed.path)).resolve()
        allowed = target == ROOT or target == ROOT / 'index.html' or (ROOT / 'assets') in target.parents
        if not allowed or not target.is_relative_to(ROOT) or target.is_dir() and target != ROOT:
            self.send_error(404)
            return
        super().do_GET()

    def do_HEAD(self):
        self.send_error(405)

    def do_POST(self):
        if self.path != '/api/bookings':
            self.reply({'error': 'Not found.'}, 404)
            return
        origin = self.headers.get('Origin')
        if origin and urlsplit(origin).netloc != self.headers.get('Host'):
            self.reply({'error': 'Invalid request origin.'}, 403)
            return
        try:
            length = int(self.headers.get('Content-Length', 0))
            if not 0 < length <= 12000 or self.headers.get_content_type() != 'application/json':
                raise BookingError('Invalid request.')
            now = datetime.now().timestamp()
            with self.attempts_lock:
                # Expire inactive clients so rate-limit storage remains bounded.
                self.attempts = {ip: [stamp for stamp in stamps if now - stamp < 600] for ip, stamps in self.attempts.items() if any(now - stamp < 600 for stamp in stamps)}
                stamps = self.attempts.setdefault(self.client_address[0], [])
                if len(stamps) >= 10:
                    raise BookingError('Too many requests. Please try again later.', 429)
                stamps.append(now)
                Handler.attempts = self.attempts
            payload = json.loads(self.rfile.read(length))
            self.reply(self.store.book(payload), 201)
        except BookingError as error:
            self.reply({'error': error.message}, error.status)
        except (ValueError, KeyError, OSError):
            self.reply({'error': 'Booking is temporarily unavailable.'}, 503)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5184)
    args = parser.parse_args()
    data = ROOT / '.data'
    data.mkdir(mode=0o700, exist_ok=True)
    Handler.store = BookingStore(data / 'bookings.sqlite3', ROOT / 'booking-config.json')
    print(f'FIKRA preview: http://127.0.0.1:{args.port}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
