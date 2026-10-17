import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handleLead} from '../cloudflare/leads.mjs';
import {dispatchAlerts, enabledChannels, rawEmail} from '../cloudflare/notifications.mjs';

function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  for (const file of ['0001_leads.sql', '0002_product_count.sql', '0003_lead_alerts.sql'])
    sqlite.exec(readFileSync(new URL('../migrations/' + file, import.meta.url), 'utf8'));
  const database = {
    prepare(sql) { let args = []; return {
      bind(...values) { args = values; return this; },
      async first() { return sqlite.prepare(sql).get(...args) || null; },
      async all() { return {results: sqlite.prepare(sql).all(...args)}; },
      async run() { const result = sqlite.prepare(sql).run(...args); return {success: true, meta: {changes: result.changes}}; }
    }; },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try { const results = []; for (const statement of statements) results.push(await statement.run()); sqlite.exec('COMMIT'); return results; }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    }
  };
  const env = {LEADS_DB: database, LEAD_ALERT_EMAIL: {send() {}}, LEAD_ALERT_EMAIL_TO: 'owner@example.com', LEAD_ALERT_EMAIL_FROM: 'leads@example.com'};
  const lead = {id: crypto.randomUUID(), name: 'اختبار Test', email: 'test@example.com', phone: '+97412345678', project: 'New Shopify Store',
    budget: 'QAR 5,000+ — confirmed', product_count: '25 to 100', website: '', language: 'ar', utm: {}};
  const request = () => new Request('https://example.com/api/leads', {method: 'POST', headers: {Origin: 'https://example.com', 'Content-Type': 'application/json'}, body: JSON.stringify(lead)});
  return {sqlite, env, lead, request};
}

test('lead and alert persist together; duplicate submissions and concurrent dispatch do not resend accepted alerts', async () => {
  const {sqlite, env, request} = fixture();
  let sends = 0;
  assert.equal((await handleLead(request(), env)).status, 201);
  assert.equal((await handleLead(request(), env)).status, 201);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM lead_alerts').get().count, 1);
  const sender = async () => { sends++; return 'email-receipt'; };
  await Promise.all([dispatchAlerts(env, sender), dispatchAlerts(env, sender)]);
  await dispatchAlerts(env, sender);
  assert.equal(sends, 1);
  assert.equal(sqlite.prepare('SELECT status FROM lead_alerts').get().status, 'accepted');
  sqlite.close();
});

test('email failure keeps saved lead and retries later without duplicating accepted alerts', async () => {
  const {sqlite, env, request} = fixture();
  assert.equal((await handleLead(request(), env)).status, 201);
  let emailAttempts = 0;
  const sender = async () => { emailAttempts++; if (emailAttempts === 1) throw Error('provider failure'); return 'receipt'; };
  await dispatchAlerts(env, sender, {now: 100});
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM leads').get().count, 1);
  assert.equal(sqlite.prepare("SELECT status FROM lead_alerts WHERE channel='email'").get().status, 'pending');
  await dispatchAlerts(env, sender, {now: 159});
  assert.equal(emailAttempts, 1);
  await dispatchAlerts(env, sender, {now: 160});
  assert.equal(emailAttempts, 2);
  await dispatchAlerts(env, sender, {now: 200});
  assert.equal(emailAttempts, 2);
  sqlite.close();
});

test('background callback failures leave a durable alert for the scheduled retry', async () => {
  const {sqlite, env, request} = fixture();
  assert.equal((await handleLead(request(), env, () => { throw Error('background unavailable'); })).status, 201);
  let sent = false;
  await dispatchAlerts(env, async () => { sent = true; });
  assert.equal(sent, true);
  sqlite.close();
});

test('unconfigured channels are not queued and partial batch failures roll back the save', async () => {
  const {sqlite, env, request} = fixture();
  assert.deepEqual(enabledChannels({...env, LEAD_ALERT_EMAIL: undefined}), []);
  sqlite.exec('DROP TABLE lead_alerts');
  assert.equal((await handleLead(request(), env)).status, 503);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM leads').get().count, 0);
  sqlite.close();
});

test('email encodes Arabic text and prevents name-based header injection', () => {
  const {sqlite, env, lead} = fixture();
  lead.name += '\r\nBcc: unwanted@example.com';
  const raw = rawEmail({...lead, created_at: '2026-10-17'}, env);
  assert.equal(raw.includes('\r\nBcc:'), false);
  const decoded = Buffer.from(raw.split('\r\n\r\n')[1], 'base64').toString('utf8');
  assert.match(decoded, /اختبار Test/);
  assert.match(decoded, /Phone \/ WhatsApp: \+97412345678/);
  sqlite.close();
});
