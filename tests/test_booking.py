import copy
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest
import uuid
from concurrent.futures import ThreadPoolExecutor
from server import LeadStore, validate_lead


class LeadTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.path = Path(self.directory.name) / 'leads.sqlite3'
        self.store = LeadStore(self.path)
        self.payload = dict(id=str(uuid.uuid4()), name='اختبار Test', email='test@example.com', phone='+97412345678', project='New Shopify Store', budget='QAR 4,000–6,000', website='', language='ar', utm={'utm_source': 'instagram', 'email': 'secret@example.com'})

    def tearDown(self):
        self.directory.cleanup()

    def test_persistence_and_retry(self):
        with ThreadPoolExecutor(max_workers=4) as executor:
            list(executor.map(self.store.save, [self.payload] * 4))
        LeadStore(self.path)
        with sqlite3.connect(self.path) as db:
            rows = db.execute('SELECT name, phone, utm FROM leads').fetchall()
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0][:2], ('اختبار Test', '+97412345678'))
        self.assertEqual(json.loads(rows[0][2]), {'utm_source': 'instagram'})

    def test_product_count_and_starting_price_persistence(self):
        self.payload.update(product_count='25 to 100', budget='QAR 5,000+ — confirmed')
        self.store.save(self.payload)
        with sqlite3.connect(self.path) as db:
            self.assertEqual(db.execute('SELECT product_count,budget FROM leads').fetchone(), ('25 to 100', 'QAR 5,000+ — confirmed'))
        for count in ['Under 25', '25 to 100', '100 to 500', 'More than 500']:
            self.assertEqual(validate_lead(dict(self.payload, product_count=count))['product_count'], count)
        self.payload['product_count'] = 'invented'
        with self.assertRaises(ValueError):
            self.store.save(self.payload)

    def test_invalid_details(self):
        for key, value in [('email', 'bad'), ('phone', '1234'), ('budget', 'invented'), ('project', 'other'), ('website', 'javascript:alert(1)'), ('website', 'https://user:secret@example.com'), ('name', ' '), ('company', 'spam'), ('id', 'bad')]:
            with self.subTest(key=key, value=value):
                payload = copy.deepcopy(self.payload)
                payload[key] = value
                with self.assertRaises(ValueError):
                    self.store.save(payload)

    def test_missing_fields(self):
        del self.payload['phone']
        with self.assertRaises(ValueError):
            self.store.save(self.payload)

    def test_callback_flow_has_no_calendar_embed(self):
        html = Path('index.html').read_text()
        for old in ['hubspot', 'data-month', 'data-times', 'Confirm booking', '10am–3pm', 'Email confirmations are not enabled']:
            self.assertNotIn(old, html)
        booking = Path('assets/booking.js').read_text()
        page = Path('book/index.html').read_text()
        self.assertIn('/api/leads', booking)
        self.assertIn('fikra_lead_submitted', booking)
        self.assertIn('call you to discuss your project', booking)
        self.assertNotIn('bookingUrl', booking)
        self.assertNotIn('fikra-calendar-panel', page)
        self.assertNotIn('app.cal.com/embed', booking)


if __name__ == '__main__':
    unittest.main()
