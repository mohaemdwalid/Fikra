// Owner token stays in a Worker secret; no client-side credentials or raw-IP storage.
export const metaEnabled = env => /^\d+$/.test(env.META_PIXEL_ID || '') && !!env.META_CAPI_ACCESS_TOKEN;
const sha256 = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), byte => byte.toString(16).padStart(2, '0')).join('');

export async function conversionStatement(request, lead, env, now) {
  if (!metaEnabled(env)) return null;
  const userData = {ph: [await sha256(lead.phone.replace(/\D/g, ''))]};
  const agent = request.headers.get('User-Agent');
  if (agent) userData.client_user_agent = agent.slice(0, 2000);
  for (const name of ['fbp', 'fbc']) {
    const value = (request.headers.get('Cookie') || '').split(';').map(part => part.trim()).find(part => part.startsWith(`_${name}=`))?.slice(name.length + 2);
    if (value && value.length <= 512 && /^fb\.\d+\.\d+\.[A-Za-z0-9_.-]+$/.test(value)) userData[name] = value;
  }
  // Strip query strings to avoid exposing visitor-entered details in a URL.
  let source = new URL('/book/', request.url);
  try {
    const referer = new URL(request.headers.get('Referer'));
    if (referer.origin === source.origin && referer.pathname === '/book/') source = referer;
  } catch {}
  const event = {event_name: 'Lead', event_id: lead.id, event_time: now, action_source: 'website',
    event_source_url: source.origin + source.pathname, user_data: userData};
  const payload = {data: [event]};
  if (env.META_TEST_EVENT_CODE) payload.test_event_code = env.META_TEST_EVENT_CODE;
  return env.LEADS_DB.prepare('INSERT INTO meta_conversions (lead_id,payload) VALUES (?,?) ON CONFLICT(lead_id) DO NOTHING')
    .bind(lead.id, JSON.stringify(payload));
}

export async function dispatchConversions(env, {leadId, now = Math.floor(Date.now() / 1000)} = {}) {
  if (!metaEnabled(env)) return;
  const rows = await env.LEADS_DB.prepare(`SELECT lead_id FROM meta_conversions WHERE
    ((status='pending' AND next_attempt_at<=?) OR (status='sending' AND lease_until<=?))
    ${leadId ? 'AND lead_id=?' : ''} ORDER BY next_attempt_at LIMIT 10`)
    .bind(now, now, ...(leadId ? [leadId] : [])).all();
  for (const row of rows.results) {
    const job = await env.LEADS_DB.prepare(`UPDATE meta_conversions SET status='sending',attempts=attempts+1,lease_until=?
      WHERE lead_id=? AND ((status='pending' AND next_attempt_at<=?) OR (status='sending' AND lease_until<=?))
      RETURNING attempts,payload`).bind(now + 120, row.lead_id, now, now).first();
    if (!job) continue;
    let error = 'meta_send_failed';
    try {
      const response = await fetch(`https://graph.facebook.com/${env.META_API_VERSION || 'v26.0'}/${env.META_PIXEL_ID}/events`, {
        method: 'POST', headers: {'Content-Type': 'application/json', Authorization: `Bearer ${env.META_CAPI_ACCESS_TOKEN}`},
        body: job.payload, signal: AbortSignal.timeout(15000)
      });
      const result = await response.json();
      if (!response.ok || result.events_received !== 1) {
        // Only numerical error codes are persisted, never Meta messages or tokens.
        error = `meta_http_${response.status}_code_${Number(result.error?.code) || 0}`;
        throw Error(error);
      }
      await env.LEADS_DB.prepare(`UPDATE meta_conversions SET status='accepted',last_error=NULL,lease_until=0,
        accepted_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),payload='{}' WHERE lead_id=?`).bind(row.lead_id).run();
    } catch {
      const failed = job.attempts >= 8;
      await env.LEADS_DB.prepare(`UPDATE meta_conversions SET status=?,last_error=?,lease_until=0,next_attempt_at=?,
        payload=CASE WHEN ? THEN '{}' ELSE payload END WHERE lead_id=?`)
        .bind(failed ? 'failed' : 'pending', error, now + Math.min(3600, 60 * 2 ** (job.attempts - 1)), failed ? 1 : 0, row.lead_id).run();
    }
  }
}
