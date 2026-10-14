"""Owner-only local booking management. Never exposed through the website."""
from pathlib import Path
import argparse
import json
import sqlite3

parser = argparse.ArgumentParser()
parser.add_argument('command', choices=['list', 'cancel'])
parser.add_argument('id', nargs='?')
args = parser.parse_args()
path = Path(__file__).resolve().parent / '.data' / 'bookings.sqlite3'
if not path.exists():
    parser.exit(message='No bookings database yet. Start server.py first.\n')
with sqlite3.connect(path) as db:
    db.row_factory = sqlite3.Row
    if args.command == 'cancel':
        if not args.id:
            parser.error('cancel requires a booking ID')
        cursor = db.execute('DELETE FROM bookings WHERE id = ?', (args.id,))
        print('Booking cancelled.' if cursor.rowcount else 'Booking not found.')
    else:
        print(json.dumps([dict(row) for row in db.execute('SELECT * FROM bookings ORDER BY slot')], ensure_ascii=False, indent=2))
