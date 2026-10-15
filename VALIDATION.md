# Cal.com integration validation — October 15, 2026

Delivery is **local only**. No production database, Cal.com appointment, notification workflow, tracking container or Cloudflare deployment was created or changed.

## Files changed for this task

- `index.html`: replace the old consultation markup, update consultation CTAs, remove old asset references and hardcoded hours.
- `assets/booking.js`, new `assets/booking.css`: translated qualification form, save gate, official inline embed, prefills, fallback, confirmation guards, tracking and mobile CTA sizing.
- `assets/site-config.js`: single configurable Cal.com event URL.
- `assets/site.js`: consultation links route to the website booking section.
- `assets/funnel-copy.js`, `assets/i18n.js`: requested CTA translations, remove outdated booking copy.
- `server.py`, `tests/test_booking.py`: local SQLite leads replace custom reservations.
- New `cloudflare/worker.mjs`, `cloudflare/leads.mjs`, `migrations/0001_leads.sql`, `wrangler.jsonc`: Worker API and D1 persistence.
- New `tests/worker.test.mjs`, `tests/browser_booking.cjs`, `tests/browser_booking_states.cjs`: API and browser regression checks.
- `prepare_cloudflare.py`, `.gitignore`: clean public asset output and private local runtime exclusion.
- `README.md`, this file: setup, testing, tracking and deployment instructions.
- Deleted obsolete `assets/hubspot-booking.js`, `assets/hubspot-booking.css`, `assets/qualification.js`, `assets/qualification.css`, `booking-config.json`, `manage_bookings.py`. Historical private booking data was retained.

Pre-existing uncommitted edits to motion/showcase assets and other page content were preserved. Their changes appear in the overall Git diff but are not part of this booking implementation.

## Automated and runtime checks

| Check | Result |
| --- | --- |
| Python unit suite | 4 passed: persistent Unicode contact data, concurrent idempotent retries, validation, campaign allowlist, removed booking markup |
| Node Worker suite | 5 passed: validated input, unavailable storage, origin checks, persisted response/rate limits/failure, bounded request body |
| JavaScript syntax and Git whitespace checks | Passed |
| Public asset build | Passed; 61 public files; no retired integration assets, configuration or databases in the output |
| Cloudflare Worker deployment dry run | Passed with Wrangler 4.151.0; no upload/deployment |
| Actual local Cloudflare D1 migration | Applied successfully using `--local` |
| Actual local Worker API + D1 | HTTP 201, record read back from D1; repeated ID retained one row; invalid phone HTTP 400; foreign Origin HTTP 403 |
| English desktop / mobile | Passed at 1440px / 390px with the real Cal.com iframe |
| Arabic desktop / mobile | Passed at 1440px / 390px with RTL website and English Cal.com iframe |
| Extra responsive layout checks | English and Arabic at 320px, 390px and 1440px: no page overflow; all five consultation CTAs translated correctly |
| Real calendar | Event title, live dates, enabled time slots, Google Meet and timezone displayed; selected a future slot and stopped before Confirm |
| Real name/email/phone prefill | Verified in all four real-widget flows; Qatar phone country code +974 and local number preserved |
| Visitor timezone | A fresh America/New_York browser context displayed America/New_York and local meeting times; Asia/Qatar contexts displayed Qatar time |
| Lead tracking | Exactly one `fikra_lead_submitted` after each persisted submission; no booking event from calendar load/slot selection |
| Confirmation handling | Simulated official callback: pending, unpaid and missing-UID do not convert; accepted/no-payment converts once even on duplicate callback |
| Failure handling | Simulated failed API save keeps form and prevents loading embed; failed embed retains translated fallback |
| Language switch during booking | Simulated callback flow retains one calendar mount and translates confirmation |
| Old booking integration scan | No HubSpot links/loaders, old date/time controls, fake confirm logic or outdated hours/email statements remain in active public source/output |
| Browser JavaScript errors | None in the four real-widget flows |

Chrome browser checks used temporary Playwright tooling after the supplied browser connection failed to initialize. Some automated checks blocked local MP4 downloads to keep repeated runs focused on the booking UI. The portfolio video markup/sources, animation code, client content and unrelated sections were preserved. Real-widget runs did not click Cal.com's final Confirm button. Browser screenshots are in `/tmp/fikra-*` (local QA artifacts, not shipped assets).

## Remaining production checks

- Create the production D1 database, replace its placeholder ID in `wrangler.jsonc`, apply the production migration, verify the correct existing Cloudflare account/Worker, and deploy only after owner approval.
- Run one owner-approved real Cal.com booking after deployment, then verify the accepted confirmation, calendar record, Google Meet creation, actual emails/reminders and cancellation. Actual delivery is unverified; callback simulations are not an end-to-end appointment test.
- The inspected source and live HTML have no active Meta Pixel/GTM ID. Configure the existing account's GTM custom-event mappings and verify Meta delivery. No Pixel ID was invented or added.
- Configure supported hidden UTM fields in Cal.com if campaign values must appear in its booking details. The website already passes the five supported parameters and stores them with the lead.
- Cal.com email was optional during inspection. Make it required in the event settings if direct/fallback bookings must always have an email address. The website requires and prefills email.
- Cal.com notifications and its optional SMS consent field remain managed by the existing Cal.com workflows. No additional emails or WhatsApp messages are sent by this implementation.
- Full Arabic widget translation is not claimed. Arabic visitors are told that the calendar is in English.
