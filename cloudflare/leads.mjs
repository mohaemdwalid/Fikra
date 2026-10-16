export const projects = ['New Shopify Store', 'Store Redesign', 'Improvements'];
export const productCounts = ['Under 25', '25 to 100', '100 to 500', 'More than 500', '1–10', '11–50', '51–100', '101–250', 'More than 250', 'Not sure yet'];
export const budgets = ['QAR 5,000+ — confirmed', 'QAR 5,000+ — discuss scope', 'Below QAR 5,000', 'Below QAR 4,000', 'QAR 4,000–6,000', 'QAR 6,000–8,000', 'QAR 8,000–10,000', 'Not sure'];
export function validateLead(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Invalid details');
  const limits = {id: 36, name: 120, email: 254, phone: 32, project: 40, budget: 40, website: 500, language: 2};
  const result = {};
  for (const [key, limit] of Object.entries(limits)) {
    if (typeof input[key] !== 'string' || input[key].length > limit) throw Error('Invalid details');
    result[key] = input[key].trim();
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result.id) ||
      !result.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email) || !/^\+[1-9]\d{6,14}$/.test(result.phone) ||
      !projects.includes(result.project) || !budgets.includes(result.budget) || !['ar', 'en'].includes(result.language) || input.company) throw Error('Invalid details');
  result.product_count = input.product_count ?? '';
  if (typeof result.product_count !== 'string' || !['', ...productCounts].includes(result.product_count)) throw Error('Invalid product count');
  if (result.website) {
    const url = new URL(result.website);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw Error('Invalid website');
  }
  result.utm = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = input.utm?.[key];
    if (typeof value === 'string' && /^[a-zA-Z0-9_.~ -]{1,120}$/.test(value)) result.utm[key] = value;
  }
  return result;
}
export const insertLead = `INSERT INTO leads (id,name,email,phone,project,budget,website,language,utm,product_count) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`;
export const leadValues = lead => [lead.id, lead.name, lead.email, lead.phone, lead.project, lead.budget, lead.website, lead.language, JSON.stringify(lead.utm), lead.product_count];
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {status, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}});
}
export async function handleLead(request, env) {
  if (request.method !== 'POST') return json({error: 'Method not allowed'}, 405);
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json({error: 'Invalid origin'}, 403);
  if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') return json({error: 'Invalid request'}, 415);
  if (!env.LEADS_DB) return json({error: 'Lead storage is unavailable'}, 503);
  let lead;
  try {
    // Bound the streamed body as well as Content-Length.
    const reader = request.body?.getReader();
    if (!reader) throw Error();
    const chunks = []; let size = 0;
    while (true) {
      const {value, done} = await reader.read(); if (done) break;
      size += value.byteLength; if (size > 8192) { await reader.cancel(); return json({error: 'Request too large'}, 413); }
      chunks.push(value);
    }
    const body = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    lead = validateLead(JSON.parse(new TextDecoder().decode(body)));
  } catch { return json({error: 'Invalid lead details'}, 400); }
  try {
    const now = Math.floor(Date.now() / 1000);
    // Hash IP + day; never store raw visitor IPs. D1 makes the throttle shared between isolates.
    const ip = request.headers.get('CF-Connecting-IP') || 'local-preview';
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${ip}:${Math.floor(now / 86400)}`));
    const client = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
    const rate = await env.LEADS_DB.prepare(`INSERT INTO lead_rate_limits VALUES (?,1,?) ON CONFLICT(client_hash) DO UPDATE SET attempts=CASE WHEN expires_at<? THEN 1 ELSE attempts+1 END, expires_at=CASE WHEN expires_at<? THEN excluded.expires_at ELSE expires_at END RETURNING attempts`).bind(client, now + 600, now, now).first();
    if (rate.attempts > 10) return json({error: 'Too many requests'}, 429);
    await env.LEADS_DB.prepare('DELETE FROM lead_rate_limits WHERE expires_at < ?').bind(now - 86400).run();
    const result = await env.LEADS_DB.prepare(insertLead).bind(...leadValues(lead)).run();
    if (!result.success) throw Error();
    return json({id: lead.id, status: 'saved'}, 201);
  } catch { return json({error: 'Lead storage is unavailable'}, 503); }
}
