import test from 'node:test';
import assert from 'node:assert/strict';
import {handleLead, validateLead} from '../cloudflare/leads.mjs';
const lead = {id: crypto.randomUUID(), name: 'Test', email: 'test@example.com', phone: '+97412345678', project: 'New Shopify Store', budget: 'Not sure', website: '', language: 'en', utm: {utm_source: 'instagram', email: 'private@example.com'}};
const request = (body = lead, origin = 'https://example.com') => new Request('https://example.com/api/leads', {method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json'}, body: JSON.stringify(body)});
test('strict qualification and campaign whitelist', () => {
  assert.deepEqual(validateLead(lead).utm, {utm_source: 'instagram'});
  for (const bad of [{phone: '123'}, {budget: 'bad'}, {website: 'javascript:alert(1)'}, {company: 'spam'}, {id: 'bad'}]) assert.throws(() => validateLead({...lead, ...bad}));
});

test('email is optional for new forms and validated when present on legacy clients', () => {
  const phoneOnly = {...lead}; delete phoneOnly.email;
  assert.equal(validateLead(phoneOnly).email, '');
  assert.equal(validateLead({...phoneOnly, email: ''}).email, '');
  assert.equal(validateLead(lead).email, 'test@example.com');
  for (const email of [null, 123, 'invalid', 'a'.repeat(255)]) assert.throws(() => validateLead({...phoneOnly, email}));
});
test('no storage returns 503, never saved', async () => {
  assert.equal((await handleLead(request(), {})).status, 503);
});
test('reject cross-origin submissions', async () => {
  assert.equal((await handleLead(request(lead, 'https://evil.test'), {})).status, 403);
});
test('persist before returning saved; respect rate limit and database failure', async () => {
  let persisted = false;
  const database = (attempts, success) => ({
    async batch(statements) { persisted = success; return statements.map(() => ({success})); },
    prepare(sql) {return {bind() {return this;}, async first() {return {attempts};}, async run() {return {success};}};}
  });
  const response = await handleLead(request(), {LEADS_DB: database(1, true)});
  assert.equal(response.status, 201); assert.equal(persisted, true);
  assert.equal((await response.json()).status, 'saved');
  assert.equal((await handleLead(request(), {LEADS_DB: database(11, true)})).status, 429);
  assert.equal((await handleLead(request(), {LEADS_DB: database(1, false)})).status, 503);
});
test('body size bounded even without content length', async () => {
  assert.equal((await handleLead(request({...lead, extra: 'x'.repeat(9000)}), {LEADS_DB: {}})).status, 413);
});

test('validate product count and starting price responses, retaining legacy leads', () => {
  for (const budget of ['QAR 5,000+ — confirmed', 'QAR 5,000+ — discuss scope', 'Below QAR 5,000']) {
    assert.equal(validateLead({...lead, budget, product_count: '25 to 100'}).product_count, '25 to 100');
  }
  for (const product_count of ['Under 25', '25 to 100', '100 to 500', 'More than 500']) assert.equal(validateLead({...lead, product_count}).product_count, product_count);
  assert.throws(() => validateLead({...lead, product_count: 'invented'}));
  assert.equal(validateLead(lead).product_count, '');
});

test('low-sales service is retained in the lead data', () => {
  assert.equal(validateLead({...lead, project: 'Low store sales'}).project, 'Low store sales');
});
