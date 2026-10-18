import {handleLead, json} from './leads.mjs';
import {EmailMessage} from 'cloudflare:email';
import {dispatchAlerts, rawEmail} from './notifications.mjs';
import {dispatchConversions} from './meta.mjs';
const sendEmail = async (lead, env) => {
  const receipt = await env.LEAD_ALERT_EMAIL.send(new EmailMessage(env.LEAD_ALERT_EMAIL_FROM, env.LEAD_ALERT_EMAIL_TO, rawEmail(lead, env)));
  return receipt?.messageId;
};
const runAlerts = (env, options) => dispatchAlerts(env, sendEmail, options).catch(() => {
  console.error('lead_alert_dispatch_failed');
});
const runConversions = (env, options) => dispatchConversions(env, options).catch(() => {
  console.error('meta_conversion_dispatch_failed');
});
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Consolidate public hosts without redirecting form POSTs from existing tabs.
    if (['GET', 'HEAD'].includes(request.method)) {
      let redirect = false;
      if (['www.fikra-agency.com', 'fikra.mohamedxmod99.workers.dev'].includes(url.hostname)) {
        url.hostname = 'fikra-agency.com';
        url.protocol = 'https:';
        redirect = true;
      }
      if (url.pathname === '/' || url.pathname === '/index.html') {
        url.pathname = url.searchParams.get('lang') === 'en' ? '/en/' : '/ar/';
        redirect = true;
      }
      if (redirect) return Response.redirect(url.href, 301);
    }
    const path = url.pathname;
    if (path === '/api/leads') return handleLead(request, env, leadId => {
      ctx.waitUntil(runAlerts(env, {leadId}));
      ctx.waitUntil(runConversions(env, {leadId}));
    });
    if (path.startsWith('/api/')) return json({error: 'Not found'}, 404);
    return env.ASSETS.fetch(request);
  },
  scheduled(controller, env, ctx) {
    ctx.waitUntil(runAlerts(env));
    ctx.waitUntil(runConversions(env));
  }
};
