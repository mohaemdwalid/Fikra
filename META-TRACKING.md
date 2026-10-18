# FIKRA Meta tracking

Dataset / Pixel: `1420582636952575` (FIKRA Website).

The supplied PageView snippet is installed by `scripts/meta_pixel.py` in English and Arabic public pages, service/article pages and the lead form. `content/integrations/meta-pixel.html` preserves the owner-supplied snippet.

After `/api/leads` confirms the save, the browser calls `fbq('track', 'Lead', {}, {eventID: leadId})`. The server atomically inserts a `meta_conversions` job with the saved lead. Both use `Lead` and the same UUID to support Meta deduplication. Opening the form, clicking Continue, validation errors and failed saves do not send Lead. Do not add a second Meta Lead tag to GTM or a URL-based Lead rule for `/book/`.

## Worker configuration

- `META_PIXEL_ID`: public dataset ID, defined in `wrangler.jsonc`.
- `META_API_VERSION`: `v26.0`, the version in Meta's official Node SDK when implemented.
- `META_CAPI_ACCESS_TOKEN`: private Cloudflare Worker secret. Never put in frontend, Git, shell arguments, screenshots or logs.
- Optional `META_TEST_EVENT_CODE`: private Worker secret during verification only. Remove after testing. Each queued job keeps the test code it was created with, so a test cannot become a production conversion on retry.
- Apply migration `0004_meta_conversions.sql` before publishing the Worker.

The server sends website Lead, original submission time, UUID, source origin and `/book/` path (no query or fragment), SHA-256 of the normalized phone number, browser User-Agent and valid `_fbp`/`_fbc` cookies when available. No raw phone, name, project answers or IP address are included in the Meta payload. This integration does not need customer email. User-Agent and cookie matching identifiers are kept only while delivery is pending and cleared on acceptance or final failure. These are advertising identifiers; reflect actual sharing and user choices in the site's privacy/consent configuration before campaigns.

Pending jobs run after save and every five minutes via the existing scheduled trigger. Atomic leases prevent concurrent sends; retries retain the original UUID and event time, with up to eight attempts. Accepted jobs are not resent on visitor retry. Lead saving and owner email alerts remain independent from Meta delivery.

No historic leads are backfilled. Only submissions after the integration is enabled get conversion jobs.

## Verification

1. In Events Manager select dataset `1420582636952575`, then Test events. Copy the server test code to `META_TEST_EVENT_CODE` securely in Cloudflare and deploy it.
2. Open the live website through Test events and submit one clearly marked test lead. Confirm the actual saved lead in D1, Browser and Server Lead events, matching event IDs and deduplication. Inspect Diagnostics as well.
3. Inspect delivery metadata without exposing contact details:

```sql
SELECT lead_id,status,attempts,last_error,accepted_at
FROM meta_conversions ORDER BY rowid DESC LIMIT 20;
```

`accepted` requires an HTTP success with `events_received = 1`; it proves API acceptance, not ad attribution or successful deduplication. Numeric Meta error codes are stored without response text or credentials.

4. Delete only the exact synthetic lead after review; its conversion and email rows cascade. Remove `META_TEST_EVENT_CODE` before advertising.
5. In the website Leads ad set select this dataset and the standard Lead event. Confirm the intended ad account has access to the dataset. Campaign publishing and ad spend are separate actions.

References: [Meta parameter builder](https://github.com/facebook/capi-param-builder/tree/main/nodejs), [Meta SDK API version](https://github.com/facebook/facebook-nodejs-business-sdk/blob/main/src/api.js), [Meta deduplication](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events).
