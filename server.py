"""Local static preview with SQLite lead persistence; Cal.com owns appointments."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import argparse
import json
import re
import sqlite3
import threading
import time
import uuid

ROOT = Path(__file__).resolve().parent
PROJECTS = {'New Shopify Store', 'Store Redesign', 'Improvements'}
BUDGETS = {'Below QAR 4,000', 'QAR 4,000–6,000', 'QAR 6,000–8,000', 'QAR 8,000–10,000', 'Not sure'}


def validate_lead(payload):
    if not isinstance(payload, dict):
        raise ValueError('Invalid details')
    fields = {}
    for key, limit in {'id': 36, 'name': 120, 'email': 254, 'phone': 32, 'project': 40, 'budget': 40, 'website': 500, 'language': 2}.items():
        value = payload.get(key)
        if not isinstance(value, str) or len(value) > limit:
            raise ValueError('Invalid details')
        fields[key] = value.strip()
    if str(uuid.UUID(fields['id'], version=4)) != fields['id'].lower():
        raise ValueError('Invalid ID')
    if not fields['name'] or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', fields['email']):
        raise ValueError('Invalid contact')
    if not re.fullmatch(r'\+[1-9]\d{6,14}', fields['phone']):
        raise ValueError('Invalid phone')
    if fields['project'] not in PROJECTS or fields['budget'] not in BUDGETS or fields['language'] not in {'en', 'ar'} or payload.get('company'):
        raise ValueError('Invalid qualification')
    if fields['website']:
        url = urlsplit(fields['website'])
        if url.scheme not in {'http', 'https'} or not url.hostname or url.username or url.password:
            raise ValueError('Invalid URL')
    utm = payload.get('utm', {})
    if not isinstance(utm, dict):
        raise ValueError('Invalid campaign')
    fields['utm'] = json.dumps({key: value for key, value in utm.items() if key in {'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'} and isinstance(value, str) and re.fullmatch(r'[a-zA-Z0-9_.~ -]{1,120}', value)})
    return fields


class LeadStore:
    def __init__(self, database):
        self.database = str(database)
        with sqlite3.connect(self.database) as db:
            db.executescript((ROOT / 'migrations/0001_leads.sql').read_text())

    def save(self, payload):
        fields = validate_lead(payload)
        with sqlite3.connect(self.database, timeout=10) as db:
            db.execute('INSERT INTO leads (id,name,email,phone,project,budget,website,language,utm) VALUES (:id,:name,:email,:phone,:project,:budget,:website,:language,:utm) ON CONFLICT(id) DO NOTHING', fields)
        return {'id': fields['id'], 'status': 'saved'}


class Handler(SimpleHTTPRequestHandler):
    store = None
    attempts = {}
    attempts_lock = threading.Lock()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def reply(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        target = Path(self.translate_path(urlsplit(self.path).path)).resolve()
        # Serve only public pages; build inputs, leads and management files stay private.
        public_dirs = {'book', 'ar', 'articles', 'shopify-store-design', 'shopify-store-redesign', 'arabic-english-shopify'}
        relative = target.relative_to(ROOT) if target.is_relative_to(ROOT) else None
        public_page = relative is not None and (
            not relative.parts or str(relative) in {'index.html', 'robots.txt', 'sitemap.xml'}
            or relative.parts[0] in public_dirs and (target.is_dir() or target.name == 'index.html')
        )
        allowed = public_page or (ROOT / 'assets') in target.parents
        if not allowed or not target.is_relative_to(ROOT):
            self.send_error(404)
            return
        super().do_GET()

    def do_HEAD(self):
        self.send_error(405)

    def do_POST(self):
        if self.path != '/api/leads':
            self.reply({'error': 'Not found'}, 404)
            return
        if self.headers.get('Origin') != 'http://' + self.headers.get('Host', ''):
            self.reply({'error': 'Invalid origin'}, 403)
            return
        try:
            length = int(self.headers.get('Content-Length', 0))
            if not 0 < length <= 8192 or self.headers.get_content_type() != 'application/json':
                raise ValueError()
            with self.attempts_lock:
                now = time.time()
                Handler.attempts = {ip: [t for t in times if now - t < 600] for ip, times in Handler.attempts.items() if any(now - t < 600 for t in times)}
                times = Handler.attempts.setdefault(self.client_address[0], [])
                if len(times) >= 10:
                    self.reply({'error': 'Too many requests'}, 429)
                    return
                times.append(now)
            self.reply(self.store.save(json.loads(self.rfile.read(length))), 201)
        except (ValueError, TypeError):
            self.reply({'error': 'Invalid lead details'}, 400)
        except (sqlite3.Error, OSError):
            self.reply({'error': 'Lead storage is unavailable'}, 503)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5184)
    parser.add_argument('--database', default=str(ROOT / '.data/leads.sqlite3'))
    args = parser.parse_args()
    Path(args.database).parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    Handler.store = LeadStore(args.database)
    print(f'FIKRA preview: http://127.0.0.1:{args.port}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
