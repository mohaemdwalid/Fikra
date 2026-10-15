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

## Editorial preview — hero and portfolio

Local design iteration, following the approved premium editorial direction. The empty hero video placeholder is replaced with the supplied Karen Wazen and Chic Homz storefront screenshots; logos and the existing package summary follow the split hero. All seven portfolio recordings stay in their original order, arranged as one large feature, two smaller features and a compact four-recording gallery. Captions sit below media. Sticky stacking and scroll dimming are removed from this section.

New `assets/editorial.css` scopes the hero layout. Portfolio styling/playback is updated in the existing showcase files, with deferred source loading, viewport playback, accessible pause/play buttons and native recording fallbacks without JavaScript. Hero/portfolio entrances use short unblurred fades; Arabic image descriptions and the new gallery label are translated. The pending mobile menu changes remain intact. Parsed comparisons confirmed the offer, testimonials, process, FAQ, contact, booking and footer markup are identical to the pre-redesign snapshot.

Checks passed: English/Arabic at 320, 390, 768 and 1440px; no horizontal overflow; all seven recordings retained; no MP4 requests before reaching the portfolio; no autoplay under reduced motion; actual recording playback, manual pause/resume and offscreen pause; readable content/native video fallback with JavaScript disabled; consultation CTA navigation; no browser JavaScript errors. Existing nine backend tests, JavaScript syntax checks and public asset packaging passed. Screenshots are available locally under `/tmp/fikra-editorial-*`. This design was validated locally; production deployment is verified separately.

## Before/after DTC demonstration

Replaced only the three problem cards with two fictional storefront mockups. The same generic tote store is shown before and after improvements to product messaging, calls to action and purchase guidance. Metrics are explicitly illustrative: 10/1,000 visits = 1.0%, 25/1,000 = 2.5%, a difference of 1.5 percentage points. The section prominently states that this is not a client result; its final note also excludes forecasts and attributes actual performance to traffic, offer and testing. No supplied client imagery is represented as a poor-performing before store.

English and Arabic labels, descriptions, figures and notes were checked at 320, 390, 768 and 1440px, with no horizontal overflow or browser JavaScript errors. Mockup controls are static illustrations, not dead interactive buttons. All other sections and booking behavior were preserved. Public asset build, JavaScript syntax and Git whitespace checks passed. Local screenshots: `/tmp/fikra-comparison-en-1440.png`, `/tmp/fikra-comparison-en-390.png`, `/tmp/fikra-comparison-ar-1440.png`, `/tmp/fikra-comparison-ar-390.png`. Production behavior must be checked after Cloudflare deployment.

## Dedicated VSL section

Added `#vsl` inside the hero, directly after its consultation CTA and before the storefront images. It keeps the hero storefront previews and provides a native video player controlled by `vslVideoUrl` and optional `vslPosterUrl` in `assets/site-config.js`. Both remain null until the owner supplies the introduction video. The current view is an honest coming-soon panel, without a fake playback control.

English/Arabic rendering and consultation navigation passed at 320, 390, 768 and 1440px, without page overflow or JavaScript errors. A test-only configuration using an existing local recording verified actual native playback, inline support, manual controls, no autoplay/preloading and no booking conversion event. Missing media showed the error/direct-link fallback; an unsafe JavaScript URL was rejected. The test recording was not configured as the actual VSL. JavaScript syntax, public asset packaging and whitespace checks passed. Screenshots: `/tmp/fikra-vsl-en-1440.png`, `/tmp/fikra-vsl-en-390.png`, `/tmp/fikra-vsl-ar-1440.png`, `/tmp/fikra-vsl-ar-390.png`. Production behavior must be checked after Cloudflare deployment.


## Hero VSL ordering and GitHub delivery

Moved the existing single `#vsl` player directly after the hero consultation CTA and before the Karen Wazen / Chic Homz image composition. The standalone VSL heading and duplicate consultation button were removed to keep the requested sequence concise. Both desktop and mobile use CTA, video, then images. No actual introduction video is configured yet. This delivery includes the previously local header/menu refinement, editorial hero and portfolio, supplied hero screenshots, illustrative DTC comparison and configurable VSL. No manual Cloudflare deployment was run.

## Process removal and Arabic sample messages

Removed the How It Works / `#approach` section and redirected the footer About link to `#home`. Added two Arabic thank-you messages mentioning Mohamed, one per review row, with matched duplicate groups for continuous scrolling. The randomly selected Qataria Abaya and Keshtban logos already in public assets match the supplied INBOX originals byte-for-byte. Each new card is explicitly labeled as a design example that is not a review from the displayed brand. No attribution is represented as verified client feedback.

Verified English and Arabic at 320, 390 and 1440px: two unique new cards, four matching marquee groups with four cards each, loaded logos, no horizontal overflow or JavaScript errors, and no stale `#approach` links. Syntax, public asset build and whitespace checks passed. Changes are local, not pushed or deployed.


## Confirmed testimonial attribution

The owner subsequently confirmed that the feedback reflected in the Qataria Abaya and Keshtban messages is real. Removed their example labels and written brand names, retaining centered logo-only footers and matched marquee duplicates. Brand mapping for the other six reviews remains pending; no arbitrary attribution was added. These updates are local.

## Remaining client logos added to testimonials

Added client logos from `/Users/aaa/Desktop/INBOX/Client Website Logos` to all 6 remaining testimonial cards that lacked logos (Bow & Note, AskAbays, Ceilo The Label, Novella, Asami, and Khadla). All 8 cards across both scrolling rows now have consistent `.fikra-testimonial-branded` styling with centered logo footers and subtle dividers. Verified seamless continuous scrolling with matched duplicate groups, 200 HTTP status on all assets, and visual regression at 1440px and 390px.

## Separate booking page

Moved qualification and scheduling from the homepage to `/book/`. All consultation links and the dynamic enquiry-dialog booking link use the new destination. The standalone Fikra-branded page uses four keyboard-accessible steps: project, optional store URL, budget and contact details. Back retains entered values; selection/URL/contact validation precedes persistence. The same six lead fields and existing `/api/leads` database contract remain unchanged. Campaign allowlisting, language persistence and legacy `#booking` redirects are handled by shared navigation. The calendar appears only after an actual save and uses the existing prefill and accepted-booking guards.

Eight browser flows passed for English/Arabic at 320, 390, 768 and 1440px: homepage CTA navigation, removed inline homepage form, language/campaign retention, invalid selection/URL handling, optional skip, back navigation, persistent save and exactly one calendar mount/lead event. SQLite readback confirmed four English and four Arabic records. Existing confirmation-state tests passed on the separate page (failed save, pending/payment/missing-ID guards, accepted-event deduplication, language changes and embed fallback). Nine backend tests and JavaScript syntax checks passed. Public asset packaging includes the new booking document; the local Cloudflare Worker served `/book/` with HTTP 200. Screenshots: `/tmp/fikra-booking-page-en-1440.png`, `/tmp/fikra-booking-page-en-390.png`, `/tmp/fikra-booking-page-ar-1440.png`, `/tmp/fikra-booking-page-ar-390.png`. Changes are local.

Additional checks passed: actual Cal.com dates/times and contact prefills on the separate page in all four English/Arabic desktop/mobile widget flows; local Worker/D1 HTTP 201 save and SQL readback; collapsed-header and expanded-menu CTA navigation; language switching followed by reload/back navigation; campaign retention on return to the website. Cloudflare deployment dry run passed. No real appointment or production deployment was created.
