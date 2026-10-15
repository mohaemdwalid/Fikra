import test from 'node:test';
import assert from 'node:assert/strict';
import {handleLead, validateLead} from '../cloudflare/leads.mjs';
const lead = {id: crypto.randomUUID(), name: 'Test', email: 'test@example.com', phone: '+97412345678', project: 'New Shopify Store', budget: 'Not sure', website: '', language: 'en', utm: {utm_source: 'instagram', email: 'private@example.com'}};
const request = (body = lead, origin = 'https://example.com') => new Request('https://example.com/api/leads', {method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json'}, body: JSON.stringify(body)});
test('strict qualification and campaign whitelist', () => {
  assert.deepEqual(validateLead(lead).utm, {utm_source: 'instagram'});
  for (const bad of [{phone: '123'}, {budget: 'bad'}, {website: 'javascript:alert(1)'}, {company: 'spam'}, {id: 'bad'}]) assert.throws(() => validateLead({...lead, ...bad}));
});
test('no storage returns 503, never saved', async () => {
  assert.equal((await handleLead(request(), {})).status, 503);
});
test('reject cross-origin submissions', async () => {
  assert.equal((await handleLead(request(lead, 'https://evil.test'), {})).status, 403);
});
test('persist before returning saved; respect rate limit and database failure', async () => {
  let persisted = false;
  const database = (attempts, success) => ({prepare(sql) {return {bind() {return this;}, async first() {return {attempts};}, async run() {if (sql.startsWith('INSERT INTO leads')) persisted = success; return {success};}};}});
  const response = await handleLead(request(), {LEADS_DB: database(1, true)});
  assert.equal(response.status, 201); assert.equal(persisted, true);
  assert.equal((await response.json()).status, 'saved');
  assert.equal((await handleLead(request(), {LEADS_DB: database(11, true)})).status, 429);
  assert.equal((await handleLead(request(), {LEADS_DB: database(1, false)})).status, 503);
});
test('body size bounded even without content length', async () => {
  assert.equal((await handleLead(request({...lead, extra: 'x'.repeat(9000)}), {LEADS_DB: {}})).status, 413);
});
