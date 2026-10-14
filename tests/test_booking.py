import concurrent.futures
from datetime import datetime, timedelta
import json
from pathlib import Path
import tempfile
import unittest
from zoneinfo import ZoneInfo
from server import BookingError, BookingStore


class BookingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        root = Path(self.temp.name)
        self.config = root / 'config.json'
        config = json.loads(Path('booking-config.json').read_text())
        config.update(enabled=True, workingDays=list(range(7)))
        self.config.write_text(json.dumps(config))
        self.store = BookingStore(root / 'bookings.sqlite3', self.config)
        self.day = (datetime.now(ZoneInfo('Asia/Qatar')) + timedelta(days=1)).date().isoformat()

    def tearDown(self):
        self.temp.cleanup()

    def payload(self, slot):
        return {'slot': slot, 'name': 'Test Client', 'email': 'client@example.com', 'project': 'Shopify test enquiry'}

    def test_hours_and_persistence(self):
        slots = self.store.availability(self.day)['slots']
        self.assertEqual(len(slots), 10)
        self.assertEqual((slots[0]['time'], slots[-1]['time']), ('10:00', '14:30'))
        booking = self.store.book(self.payload(slots[0]['value']))
        self.assertEqual(booking['status'], 'confirmed')
        fresh = BookingStore(self.store.database, self.config)
        self.assertEqual(len(fresh.availability(self.day)['slots']), 9)

    def test_simultaneous_booking_only_succeeds_once(self):
        slot = self.store.availability(self.day)['slots'][0]['value']
        def attempt(_):
            try:
                self.store.book(self.payload(slot))
                return 201
            except BookingError as error:
                return error.status
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(attempt, range(4)))
        self.assertEqual(sorted(results), [201, 409, 409, 409])

    def test_invalid_email_and_closed_times(self):
        slot = self.store.availability(self.day)['slots'][0]['value']
        with self.assertRaises(BookingError):
            self.store.book({**self.payload(slot), 'email': 'invalid'})
        with self.assertRaises(BookingError):
            self.store.book(self.payload(self.day + 'T16:00:00+03:00'))
        self.assertEqual(self.store.availability('2020-01-01')['slots'], [])

    def test_unconfigured_calendar_cannot_confirm(self):
        config = json.loads(self.config.read_text()); config['enabled'] = False
        self.config.write_text(json.dumps(config))
        self.assertFalse(self.store.availability(self.day)['configured'])
        with self.assertRaises(BookingError) as raised:
            self.store.book(self.payload(self.day + 'T10:00:00+03:00'))
        self.assertEqual(raised.exception.status, 503)


if __name__ == '__main__':
    unittest.main()
