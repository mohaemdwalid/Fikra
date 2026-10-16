# FIKRA Shopify consultation page

Static HTML/CSS/JavaScript, with the existing English/Arabic language switcher, portfolio and animations. Cal.com owns availability, appointments, timezone selection, Google Meet links, booking emails and configured workflows. The website saves qualification leads; it never reserves time itself.

## Preview and tests

```sh
python3 -m pip install -r requirements.txt
python3 server.py
# http://127.0.0.1:5184
python3 -m unittest discover -s tests -v
node --test tests/worker.test.mjs
node --check assets/booking.js
python3 prepare_cloudflare.py
```

There is no frontend package install or compilation step. `prepare_cloudflare.py` builds the public asset directory and a static ZIP, cleaning obsolete assets first. Local leads persist in `.data/leads.sqlite3`; the Python server serves only the homepage, booking page and assets. Existing `.data/bookings.sqlite3` history is retained privately, but the old reservation API and custom calendar are retired. Do not upload `.data` or run the Python server as the Cloudflare backend.

## Booking configuration

The **only event URL setting** is `bookingUrl` in `assets/site-config.js`. The inline path and fallback URL derive from it. No Cal.com API key is required. The official vanilla embed script is loaded once, after `POST /api/leads` confirms persistence.

Verified on October 15, 2026: the supplied event returns HTTP 200 and identifies itself as Free Shopify Consultation, 30 minutes, Google Meet, with Asia/Qatar as its schedule timezone. Timezone selection is unlocked. Cal.com displays its own availability and the visitor's selected timezone; the website does not calculate or hardcode slots. Name, email and `attendeePhoneNumber` are passed through embed config. A random website lead ID is passed as `metadata[fikraLeadId]`. Qualification answers stay in the lead database and are not asked again by the website or added as Cal.com questions. The inspected event has no duplicate project/budget questions.

The website form, errors, instructions and CTAs are translated. The embedded calendar intentionally uses English, with an Arabic explanation; full Arabic widget support has not been verified. Switching the website language does not remount the calendar or discard an in-progress booking. The fallback opens Cal.com directly, with contact prefills; no booking conversion can be detected on that external tab by this website.

Cal.com's event currently also offers an optional SMS reminder phone field from its own workflow. The website does not opt visitors into it or add another workflow. Keep that choice in Cal.com. Set email to **required** in Cal.com's event settings if every attendee must receive email details; it was optional during inspection, although the website requires and prefills it.

Official references: [embed instructions](https://cal.com/help/embedding/embed-instructions), [prefilling](https://cal.com/help/embedding/prefill-booking-form-embed), [event payloads](https://cal.com/help/embedding/embed-events), [UTMs](https://cal.com/help/embedding/utm-tracking-embed).

## Cloudflare Workers setup — no deployment performed

The supplied live URL is a **Worker** (`fikra.mohamedxmod99.workers.dev`); the earlier repository only packaged static Pages uploads and had no Worker/backend configuration. `wrangler.jsonc` now defines the `fikra` Worker, static assets and a D1 binding named `LEADS_DB`. Verify the existing Worker/account in the dashboard before publishing. Preserve any existing dashboard routes, domains, bindings or observability settings when reconciling this configuration.

No application secrets or environment variables are needed. Wrangler must authenticate to the correct Cloudflare account. The D1 database ID is configuration, not a secret. Provisioning and production deployment are pending owner approval; these are the commands to run **after approval**:

```sh
npx wrangler@4.151.0 login
npx wrangler@4.151.0 whoami
npx wrangler@4.151.0 d1 create fikra-leads
# Replace REPLACE_WITH_CREATED_D1_DATABASE_ID in wrangler.jsonc with the returned ID.
npx wrangler@4.151.0 d1 migrations apply fikra-leads --remote
python3 prepare_cloudflare.py
npx wrangler@4.151.0 deploy --dry-run
npx wrangler@4.151.0 deploy
```

Use the current supported Wrangler version if updating the pinned command. To exercise the actual Worker/D1 runtime without deploying:

```sh
python3 prepare_cloudflare.py
npx wrangler@4.151.0 d1 migrations apply fikra-leads --local
npx wrangler@4.151.0 dev --local --port 5188
# http://localhost:5188
npx wrangler@4.151.0 d1 execute fikra-leads --local --command 'SELECT id, project, budget, created_at FROM leads ORDER BY created_at DESC LIMIT 10'
```

A static ZIP upload alone is insufficient: it has no lead API or D1 storage. Missing binding/schema or failed writes return HTTP 503, and the form does not show a successful save or open the calendar. The API validates every field, limits request size, checks same-origin POSTs, uses parameterized SQL and idempotent lead IDs, and applies a shared D1 rate limit (10 valid submissions per IP-derived daily hash per 10 minutes). A honeypot rejects basic bots. IP hashes expire and are cleaned; raw IPs are not saved. Lead records are private; no public read endpoint exists. Review access, retention and your privacy notice for stored name, email, WhatsApp and project information. Export and delete records using authenticated D1 tools as needed. `.wrangler`, databases, ZIPs and backups remain Git-ignored.

## Tracking and confirmation

Neither inspected local source nor live HTML contained an active Meta Pixel initialization or GTM container ID. Existing placeholders are preserved; no Pixel ID has been invented. The integration pushes only these events to `window.dataLayer`, using GTM as the single delivery path:

| Website event | Trigger | Suggested Meta mapping |
| --- | --- | --- |
| `fikra_lead_submitted` | Persisted lead API response | `Lead` |
| `fikra_booking_confirmed` | Official `bookingSuccessfulV2` with a UID, status `ACCEPTED`, and no outstanding payment | `Schedule` |

Configure one GTM custom-event trigger/tag for each, using `event_id` for deduplication. Do not also send these from a second direct `fbq` handler or a calendar-open trigger. Only event names and opaque IDs enter the data layer: no names, email addresses, phone numbers, URLs or qualification answers. Event IDs are deduplicated in memory and session storage. Existing tracking can remain connected independently. Browser event simulation verifies the guards but does not prove delivery to Meta; verify in your GTM/Meta test-event tools after configuration.

A pending/unconfirmed/payment-required Cal.com response is shown as pending and does not convert. Dry-run events do not convert. Successful accepted bookings display next steps; Cal.com alone sends notifications. A booking confirmed later by the owner or made in the fallback tab cannot be reliably attributed by this page; server-side attribution would require a separate signed Cal.com webhook integration, which is not enabled here.

Only the five supported UTM keys are carried from the landing URL to the lead record and Cal.com config/fallback. Values are limited to ordinary campaign tokens. Do not put personal data in campaign parameters. For visibility in Cal.com's booking details, configure its supported hidden UTM tracking fields per the official UTM guide; do not add visible required qualification questions. Arbitrary landing query parameters are not forwarded.

## Manual acceptance flow

1. Open desktop and mobile views in English and Arabic. Every consultation CTA should open `/book/`, and Arabic website content should use RTL.
2. Submit empty/invalid fields; confirm clear translated validation and no calendar. Enter a full name, email, international WhatsApp number, project, budget and optional full HTTP(S) website URL.
3. Submit, check `POST /api/leads` returns 201 with `status: saved`, then read the record from the corresponding local SQLite or D1 database. An offline/503 response must retain the form and show an error.
4. Confirm the calendar loads once, displays real dates/times and timezone controls, and prefills name/email/attendee phone after choosing a slot. The website does not resubmit project questions.
5. Block the embed script or Cal.com iframe: the translated error and direct fallback should remain available after saving. Confirm UTMs and prefills are present in that link.
6. For an owner-approved **real** appointment test, select a slot and submit in Cal.com. This will trigger its real emails/workflows. Confirm the website message appears only after accepted booking; check the appointment, Meet link, notifications and timezone in Cal.com. Cancel the test appointment there afterward. No real appointment was created during implementation.
7. In the data layer, confirm one lead event and one accepted-booking event, no event for calendar opening, no duplicate accepted event, and no personal data. Verify Meta delivery separately after GTM configuration.
8. Check navigation, language switching, portfolio videos, client marquee, FAQ, enquiry dialog and responsive layout.

Optional browser checks use Playwright with an installed Chrome, without adding a production dependency:

```sh
npm install --prefix /tmp/fikra-booking-tests playwright
PLAYWRIGHT_MODULE=/tmp/fikra-booking-tests/node_modules/playwright node tests/browser_booking_states.cjs
PLAYWRIGHT_MODULE=/tmp/fikra-booking-tests/node_modules/playwright node tests/browser_booking.cjs
```

Run the Python preview first. Set `PREVIEW_URL=http://localhost:5188/` to use the local Worker instead. The real-widget test saves four synthetic qualification leads, reads actual Cal.com availability and stops at its booking form. The state test uses mocked Cal callbacks for confirmations and failures. Browser screenshots are written to `/tmp`. These checks never click Cal.com's final Confirm button.

See `VALIDATION.md` for checks performed and limits.

## VSL video

The dedicated introduction-video section is `#vsl`, inside the hero, directly after its consultation CTA and before the storefront previews. Configure it in `assets/site-config.js`:

```js
vslVideoUrl: 'assets/videos/fikra-vsl.mp4',
vslPosterUrl: 'assets/videos/fikra-vsl-poster.jpg',
```

Use an actual local video file or a direct HTTPS MP4/WebM URL, rather than a YouTube/Vimeo watch-page URL. The poster is optional. Keep `vslVideoUrl: null` until the real introduction video is supplied: the page displays a translated coming-soon panel with no fake play button. Once configured, it uses native playback controls, supports inline mobile playback, does not autoplay or preload the video, and provides an error message/direct link if playback fails. Watching the video does not fire booking conversions. For Cloudflare-hosted video files, keep each below the existing 25 MiB asset limit or use a direct hosted media URL. Do not rename a portfolio recording as the introduction video.


## Separate consultation page

All consultation CTAs now open `/book/`, instead of scrolling to an inline homepage form. `book/index.html` is included in the public build and served by the existing Worker asset binding; no API or database migration is required. The Python preview explicitly permits this public route while continuing to block private files.

The four steps collect project type, optional existing website URL, estimated budget and contact details. Radio choices use the same project/budget values accepted by `/api/leads`; back navigation retains answers in memory. Personal answers are not saved in browser storage. Only a successful persistent lead save reveals the existing Cal.com embed on the booking page. Confirmation guards, prefills and event deduplication remain in the existing booking controller.

`bookingPageUrl` in `assets/site-config.js` configures the website destination; `bookingUrl` remains the separate Cal.com event configuration. The shared booking-navigation script carries the current English/Arabic language and five allowlisted campaign parameters into the new page. Arbitrary query parameters are discarded, and legacy homepage `#booking` URLs redirect to `/book/`. Back-to-website links preserve the same language/campaign context. The existing i18n language setting works on both pages.

Preview: `http://127.0.0.1:5184/book/`. Additional browser regression check:

```sh
PLAYWRIGHT_MODULE=/tmp/fikra-booking-tests/node_modules/playwright node tests/browser_booking_steps.cjs
```

This check saves eight synthetic leads across both languages/four viewport sizes. Restart the Python preview between browser suites to reset its in-memory submission rate limit. Each new lead is still retained in the chosen test database. The real-widget and confirmation-state scripts have also been updated for the four-step page. No test clicks Cal.com's final booking confirmation.

## SEO and AI search

See [SEO-HANDOFF.md](SEO-HANDOFF.md) for delivery status and the owner's launch steps. `seo-config.json` defines the canonical origin (currently the existing supplied Worker URL). Set the permanent domain there before publishing if it changes. `seo-content.json` contains bilingual service-guide copy. `python3 prepare_cloudflare.py` now generates and packages the static Arabic homepage, English/Arabic service guides, sitemap, robots.txt and metadata. Rebuild after homepage or translation edits; generated language pages are overwritten.

Run `python3 scripts/check_seo.py` to check the generated assets, and pass `http://127.0.0.1:5184` to also check local HTTP routes. Language-navigation checks run with `node --test tests/seo-language.test.cjs`. Public language follows each URL; the booking form retains its existing dynamic language behavior. Booking pages are intentionally noindex.

## Shopify article library

`/articles/` and `/ar/articles/` contain 100 guides in English and Arabic, grouped by ten topics. Source copy lives in `content/articles/*.json`; `scripts/articles.py` renders it during the existing SEO build. The sitemap includes all 200 article pages and both library pages. The source JSON and owner inventory stay outside the public package. See [ARTICLE-INVENTORY.md](ARTICLE-INVENTORY.md) for the topic list and editing instructions.

Run `python3 scripts/check_articles.py` after building to audit content, references, related links and article structured data. Keep publication dates stable and update modification dates only when making actual editorial changes.

Article artwork is stored as public WebP files in `assets/article-images/`, with original SVG sources in `content/article-art/`. Normal builds use the existing WebP assets. `scripts/build_article_art.py` creates the original diagrams and image metadata; `scripts/render_article_art.cjs` optionally regenerates the WebP files using isolated Chrome/Playwright and Pillow. Article checks also verify image dimensions, distinct files, alt text and social metadata.

## Expanded website and Qatar knowledge library

The current collection has 100 topics with English/Arabic text and original illustrations (200 article pages). `/articles/` and `/ar/articles/` group them into ten categories and provide accessible browser search. All guides remain available without JavaScript. Source data is in `content/articles/`; the sitemap now covers 210 public pages. See ARTICLE-INVENTORY.md for the current list and ARTICLE-RESEARCH.md for research methods and limits. No popularity rankings or keyword volumes are claimed.

Optional browser checks: `PLAYWRIGHT_MODULE=/path/to/playwright node tests/browser_articles.cjs` with the Python preview running. These checks do not submit a real booking.

## Article editorial revisions

The October 16 editorial pass revises all 100 Arabic questions and bilingual openings, adds topic-specific examples and practical explanations, and removes repeated short-answer/checklist/mini-FAQ framing from the rendered pages. Seventeen guides include decision tables. Six complex guides have further extended sections.

Edit the current copy in `content/articles/`. `content/editorial-revisions/` and `content/editorial-followups.json` preserve the authored revision inputs. `scripts/apply_editorial_revisions.py` reapplies those inputs on request; it is not part of normal builds and can replace subsequent edits to those same passages. `python3 prepare_cloudflare.py` renders the current source copy and creates the local public package.

## Article library browsing

The English and Arabic libraries show 12 matching articles per page when JavaScript is enabled. Category buttons filter the list; selecting a category clears the search and returns to the first page. Search covers the full collection within the selected category. Previous/Next and numbered controls appear above and below results. Search, category and page are retained in URL parameters for refresh/share. Cards use shorter images and two-line excerpts. Without JavaScript, the complete linked collection remains available with category anchors.
