const emailAddress = value => typeof value === 'string' && /^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/.test(value);
export function enabledChannels(env) {
  const channels = [];
  if (env.LEAD_ALERT_EMAIL?.send && emailAddress(env.LEAD_ALERT_EMAIL_TO) && emailAddress(env.LEAD_ALERT_EMAIL_FROM)) channels.push('email');
  return channels;
}

export function alertText(lead) {
  return ['New FIKRA lead', '', `Name: ${lead.name}`, `Phone: ${lead.phone}`, ...(lead.email ? [`Email: ${lead.email}`] : []),
    `Project: ${lead.project}`, `Products: ${lead.product_count || 'Not supplied'}`, `Budget: ${lead.budget}`,
    `Website: ${lead.website || 'Not supplied'}`, `Received (UTC): ${lead.created_at}`, `Lead ID: ${lead.id}`].join('\n');
}

export function rawEmail(lead, env) {
  // Encoding protects headers and retains Arabic names in a plain-text message.
  const base64 = text => btoa(Array.from(new TextEncoder().encode(text), byte => String.fromCharCode(byte)).join(''));
  return [`From: FIKRA Leads <${env.LEAD_ALERT_EMAIL_FROM}>`, `To: ${env.LEAD_ALERT_EMAIL_TO}`,
    'Subject: New FIKRA lead', `Message-ID: <${lead.id}@fikra-agency.com>`,
    'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '',
    base64(alertText(lead)).match(/.{1,76}/g).join('\r\n'), ''].join('\r\n');
}

export async function dispatchAlerts(env, emailSender, {leadId, now = Math.floor(Date.now() / 1000)} = {}) {
  for (const channel of enabledChannels(env)) {
    const rows = await env.LEADS_DB.prepare(`SELECT lead_id FROM lead_alerts WHERE channel=? AND
      ((status='pending' AND next_attempt_at<=?) OR (status='sending' AND lease_until<=?))
      ${leadId ? 'AND lead_id=?' : ''} ORDER BY next_attempt_at LIMIT 10`)
      .bind(channel, now, now, ...(leadId ? [leadId] : [])).all();
    for (const row of rows.results) {
      // Atomic lease prevents simultaneous request/cron runs sending the same alert.
      const claimed = await env.LEADS_DB.prepare(`UPDATE lead_alerts SET status='sending', attempts=attempts+1, lease_until=?
        WHERE lead_id=? AND channel=? AND ((status='pending' AND next_attempt_at<=?) OR (status='sending' AND lease_until<=?))
        RETURNING attempts`).bind(now + 120, row.lead_id, channel, now, now).first();
      if (!claimed) continue;
      try {
        const lead = await env.LEADS_DB.prepare('SELECT * FROM leads WHERE id=?').bind(row.lead_id).first();
        if (!lead) throw Error('lead_missing');
        const receipt = await emailSender(lead, env);
        // Accepted by the provider does not mean delivered/read by the owner.
        await env.LEADS_DB.prepare(`UPDATE lead_alerts SET status='accepted', provider_id=?, last_error=NULL, lease_until=0,
          accepted_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE lead_id=? AND channel=?`)
          .bind(receipt || null, row.lead_id, channel).run();
      } catch {
        // Never store provider response bodies, credentials or contact details in logs.
        const code = channel + '_send_failed';
        await env.LEADS_DB.prepare(`UPDATE lead_alerts SET status=?, last_error=?, lease_until=0, next_attempt_at=?
          WHERE lead_id=? AND channel=?`).bind(claimed.attempts >= 8 ? 'failed' : 'pending', code,
          now + Math.min(3600, 60 * 2 ** (claimed.attempts - 1)), row.lead_id, channel).run();
      }
    }
  }
}
