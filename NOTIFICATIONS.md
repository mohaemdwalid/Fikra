# New lead alerts

Cloudflare D1 remains the source of truth. The Worker saves the lead and its configured notification jobs in a single D1 transaction. The client receives `saved` after that transaction succeeds. Email delivery failures do not undo a saved lead.

The Worker sends alerts in the background after saving. A five-minute scheduled trigger retries due jobs. A database lease prevents concurrent request and scheduled runs from sending the same job simultaneously. Accepted jobs are not sent again when the visitor retries the form. Failed delivery retries up to eight times with exponential backoff, up to one hour between attempts. An ambiguous provider timeout or a database failure after provider acceptance can still cause a repeated notification; this is not an exactly-once delivery guarantee.

`lead_alerts.status = 'accepted'` means the provider accepted the send, not that the owner has received or read the message. Leads and alerts have no public read endpoint. Provider credentials and destination addresses belong in Worker secrets, not frontend assets or Git.

## Email

The domain must have Cloudflare Email Routing enabled and the destination address must be verified. `LEAD_ALERT_EMAIL` is the `send_email` binding; `LEAD_ALERT_EMAIL_FROM` specifies the sender. Set `LEAD_ALERT_EMAIL_TO` as a Worker secret. The implementation uses Cloudflare's supported `EmailMessage` API with a UTF-8 plain-text message including name, phone, project, product count, budget, website and lead ID. Client email is included only when provided by a legacy form; the current form asks for phone contact only. Owner email alerts remain enabled.

## WhatsApp

WhatsApp alerts are postponed at the owner’s request. No WhatsApp sender, credential or automatic message is configured. The schema reserves a channel name for possible future use; the Worker queues and sends email only.

## Deployment and checks

Apply `0003_lead_alerts.sql` to remote D1 before publishing this Worker. Run `node --test tests/worker.test.mjs tests/notifications.test.mjs` and `npx wrangler deploy --dry-run` before deployment. Preserve existing Worker domains, database binding and account configuration.

Inspect notification progress using the authenticated D1 console:

```sql
SELECT lead_id, channel, status, attempts, last_error, created_at, accepted_at
FROM lead_alerts ORDER BY created_at DESC LIMIT 30;
```

After deployment, submit one clearly marked test lead, confirm `201 saved`, read its D1 lead and alert rows, then confirm receipt in the owner's inbox. Remove only that synthetic test lead after verification; its alert rows cascade on deletion. Do not replay or delete real leads as part of testing.

Official references: [Cloudflare email sending](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/), [Cloudflare bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/).

## Live verification — October 17, 2026

Email alerts are deployed on Worker version `2eff2e11-25d4-4cb2-ae12-877c5d236df6`. The destination address was verified in Cloudflare. A synthetic submission through `https://www.fikra-agency.com/api/leads` returned `201 saved`; D1 recorded the email as `accepted` on attempt 1, and the owner confirmed arrival in Inbox. The synthetic lead and its alert row were removed after verification. WhatsApp remains postponed.

Backend checks passed: 11 tests covering real SQLite transactions, queue idempotency, concurrent claims, deferred retry, save integrity, Arabic email content and API validation. Worker dry-run and the existing 210-page SEO checks passed.
