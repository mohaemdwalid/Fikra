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

### Footer redesign — 2026-10-16
Replaced the oversized newsletter/address grid with a compact FIKRA brand block, section navigation, consultation CTA, and copyright/legal row. Removed the inactive newsletter and unavailable LinkedIn control. Preserved verified Instagram, Doha location, contact and pending legal dialogs. Scoped styling in `assets/footer.css`; new copy translated to Arabic with mirrored RTL layout. The CTA uses the existing `/book/` navigation and language/UTM handling.

Local Chrome checks passed in English and Arabic at 320, 390, 768 and 1440px: no horizontal overflow, no newsletter form, correct document direction, legal dialog opens, and consultation CTA reaches `/book/`. Desktop English and mobile Arabic screenshots visually inspected. `node --check assets/funnel-copy.js` and `python3 prepare_cloudflare.py` passed (73 public files). Local only; no GitHub push or deployment.

## SEO preparation — October 16, 2026

Eight public pages generated, with static English/Arabic content, metadata, reciprocal hreflang, JSON-LD, sitemap and crawler rules. Packaging completed with 84 public files. `scripts/check_seo.py http://127.0.0.1:5184` passed page, link, schema, sitemap, route and private-file checks. Three language-navigation tests, four existing Python tests and five existing Worker tests passed. Generation was checked for repeatability. Browser setup failed; rendered appearance and actual browser navigation were not verified. No deployment, indexing request or real booking was performed. See SEO-HANDOFF.md for the owner steps and remaining live checks.

## Shopify articles — October 16, 2026

Forty distinct original questions have English and Arabic source copy and 80 generated article pages, with two topic libraries. All 90 public URLs passed the SEO checker over local HTTP, and article checks passed for unique titles/answers/body sections, references, related links, dates and BlogPosting/BreadcrumbList data. Packaging completed with 167 public files. Three language-navigation tests passed.

The in-app browser still failed at connection setup; isolated local Chrome was used afterward. English/Arabic libraries and a representative Qatar payments article passed at 1440px and 390px without horizontal overflow, page errors or failed local requests. Screenshots were visually reviewed. The library → article → Arabic → checklist → FAQ → Arabic booking journey passed, and homepage library links were checked in both languages. No real booking was submitted. This does not claim exhaustive checking of every rendered article, physical-device behaviour, live indexing or ranking. No GitHub push or production deployment was performed.

## Article images — October 16, 2026

Forty original topic illustrations were drawn as SVG source and rendered to 1200 × 675 WebP, totalling approximately 390 KiB. All 80 article pages and both libraries reference their matching artwork. Article images have English/Arabic alt text and Open Graph/Twitter/BlogPosting image metadata; library image loading is deferred. All 90 SEO page checks and article image/content checks passed. English/Arabic desktop and mobile browser checks were repeated, with screenshots visually inspected. Article artwork does not depict actual client dashboards or measured business results. No deployment or GitHub push was performed.

### Electric blue visual palette — 2026-10-16
Replaced the pink UI accents with shared `--fikra-accent` #005BEA and hover #0047BD, including header/mobile/menu CTAs, footer, booking form controls, focus states, progress and Cal.com brand customization. Dark-section accent headings use pale cyan. Added a restrained violet/cyan glow with local static SVG grain around the hero video; typography, layout, content and supplied client imagery preserved. Palette lives in `assets/brand.css`, loaded by the landing and booking pages and static page metadata generator.
Chrome checks passed for English/Arabic landing pages at 390px and 1440px and booking at both widths: solid blue buttons, white labels, no horizontal overflow. Desktop header CTA separately checked after correcting a legacy vendor override. English desktop and Arabic mobile screenshots inspected. White on primary blue contrast is 5.70:1. `node --check assets/booking.js` passed. Packaging could not finish: unrelated new article content uses categories (platforms, websites, qatar) not yet supported by `scripts/articles.py`. No deployment or GitHub push.

## Expansion to 100 topics — October 16, 2026

Added 60 distinct website/platform/Qatar/operations topics in English and Arabic, with 60 additional original illustrations. The collection now has 100 topics, 200 article pages, two complete libraries, ten categories and bilingual-title search. All 210 public URLs passed local HTTP and SEO checks; the article audit passed unique titles/answers/body paragraphs, source/related links, dates, 100 distinct 1200 × 675 WebP assets and article/social image metadata. The public package has 391 files.

Twenty isolated Chrome render checks passed at 1440px and 390px for both libraries and four representative topics in both languages. Search checks passed English/Arabic and cross-language title queries, no-result state and category reset. Search → comparison → Arabic equivalent navigation and generic article → actual Shopify booking navigation passed. No horizontal overflow, page errors or failed local requests were observed; screenshots were visually inspected. No real booking, GitHub push, indexing request or deployment was performed. Keyword search volumes and universal rankings have not been measured or promised.

## Article editorial expansion — October 16, 2026

Revised all 100 Arabic question titles and bilingual openings. Each topic has a new topic-specific explanation/example and a further practical followup in English and Arabic. Seventeen topics include comparison/decision tables; six major guides have additional extended explanations. Existing core explanatory sections remain, with selected Arabic passages also rewritten. Revised pages omit repeated short-answer labels, checklist blocks and mini FAQs. Original publication dates, images, references and language counterparts remain in the source/build.

`python3 prepare_cloudflare.py` completed after the editorial changes: 100 bilingual topics, 210 indexable pages and a 391-file local public package. Manually inspected rendered Arabic comparison/contact pages at 390px and an English cost guide at 1440px using isolated Chrome screenshots. The observed comparison page width was 390px; its 540px table content was contained within a 340px scrolling region. A mobile scrolling hint was subsequently added. These are scoped visual observations, not an exhaustive review of every page. No additional automated tests were run for the final copy expansion. No GitHub push, deployment or booking submission was performed.

## Compact article library — October 16, 2026

Added client-side pagination (12 articles per page), category filtering with an All topics option, whole-collection search within the active category, bilingual range/no-results messages and top/bottom numbered Previous/Next navigation. Category and search changes reset pagination; page changes move focus/scroll to results. URL parameters retain browsing state. All article links remain in the static document, with the full collection and category anchors available without JavaScript. Reduced card image heights and clamped excerpts to two lines; title underlines remain removed. `python3 prepare_cloudflare.py` completed: 210 indexable pages, 391 public files. Automated tests and browser checks were not run for this change. Local only; not pushed or deployed.

### Conditional URL question and seven-day headline — 2026-10-16
New Shopify Store follows project → budget → contact, with a three-question progress indicator. Redesign/Improvements retain the optional website question. Back navigation follows the selected path; switching to a new store clears stale URL data and URL validation errors. Added `tests/browser_booking_conditional.cjs`, passing English/Arabic desktop and mobile. Existing browser helper now accounts for branching and the four-question regression uses redesign.
Added owner-requested “Ready in just 7 days.” as a blue headline line, translated to Arabic. Verified blue computed color and no horizontal overflow at 320, 390, 1440px in both languages; inspected Arabic mobile screenshot. Packaging passed. Local only.

### Product qualification, starting price and larger headline — 2026-10-16
Added required product-count ranges immediately after project type. New stores use four questions; redesign and improvement clients use five, including the optional URL question. Replaced budget ranges with the owner's approved QAR 5,000 starting price and three responses: accepted, discuss scope first, below budget. All answers may continue; no rejection or additional Cal.com qualification is introduced. Python and Worker validation retain historical budget support. Product count is stored in a new column through `0002_product_count.sql`; Python preview applies this locally on restart. Production migration remains required and has not been applied.

Validation passed: 5 Python persistence/validation tests and 6 Worker tests; 12 conditional browser flows across all three project types, both languages and mobile/desktop; eight real local lead saves with product counts (four English and four Arabic), gated calendar mount and single lead event. Existing test selectors updated for the current static language link and hero CTA placement. Larger headline uses a blue “In just 7 days.” line; English/Arabic checks at 320/390/1440px confirmed correct copy, blue color and no horizontal overflow. Build and 210-page SEO checks passed. No production booking, migration, push or deployment performed.

### Animated hero Ribbon Field — 2026-10-16
Added `assets/hero-ribbon.js` and `.css` only to the English/Arabic landing hero. The WebGL canvas uses the supplied white/sky/ultramarine/iris palette, exported feathered stripe stops, angle 32 degrees and curved cross-axis sine displacement (wave 14, initial clock 20.75). RAF elapsed time advances the wave clock by phase × 1.2. Motion amount zero keeps angle modulation zero, so bands sway without spinning. Animated values are not quantized. Seeded stationary grain is rendered in the shader; native CSS export plus SVG grain provides a static fallback without JavaScript/WebGL or after context loss. No dependency added. Removed the earlier hero video halo in favor of the full hero ribbon field; added a light contrast layer behind copy.
Chrome checks passed English/Arabic at 390/1440px with no overflow or JS errors and exactly one canvas. Screenshot comparison confirmed visible animation, then identical stationary renders under reduced motion. RAF is stopped when the hero leaves the viewport or the tab is hidden. English desktop/Arabic mobile screenshots inspected. Packaging (396 public files) and 210-page SEO checks passed. Local only; no push/deployment.

### Tilted grid hero — local integration

- `npm run build:hero` passes TypeScript checking and produces bundled React JS and Tailwind CSS in `assets/tilted-grid/`.
- `tests/browser_tilted_grid.cjs` checked English and Arabic homepages at 1440px and 390px: all facet images load, the transform animates, resizing produces no horizontal overflow, reduced motion pauses the animation, and no page errors occur. Screenshot outputs are `/tmp/fikra-tilted-{en,ar}-{1440,390}.png`.
- The supplied reduced-motion rule needed `!important` to override the inline animation shorthand. Layout comparisons also include the visibility limit.
- Six local Unsplash photos have source URLs recorded in `assets/hero-images/sources.json`.
- `python3 prepare_cloudflare.py` rebuilt the local upload ZIP; `python3 scripts/check_seo.py` passed for all 210 pages.
- The separate `npm run build` was blocked by an unrelated build entry for the missing `components/project-skyline.tsx` when checked. The hero build does not depend on that entry.
- `npm audit` reports four high-severity findings through the Tailwind CLI's development-only watcher dependency chain. `npm audit fix` did not resolve them; no forced upgrades or overrides were applied to the concurrently edited shared build.
- Local changes and upload artifacts only; no deployment or GitHub push performed.

### Owner-supplied videos in curved band — 2026-10-16
Replaced the generic carousel images before What Clients Say with the two supplied October 16 recordings (7.39.12 PM and 7.40.19 PM), retaining the curved 16-facet presentation. Converted to H.264/yuv420p MP4 at 1440x822, 24fps, silent with faststart (2.01 MB and 3.86 MB), plus poster frames. Source filenames/hashes and outputs recorded in `content/carousel-videos.json`. Original recordings remain untouched.
Added `lib/curved-video-renderer.ts`: up to two detached video decoders supply curved canvas facets, avoiding sixteen independent videos per tile. Muted looping playback loads only when visible; pauses offscreen/hidden; poster frames handle loading, playback failures and reduced motion. Existing image component support retained. Main VSL and portfolio recordings are unchanged.
`npm run build:hero` (TypeScript and production bundle) and packaging passed. Browser checks passed English/Arabic at 390/1440px: supplied video sources, real playback advancing, at most two decoders, correct placement before testimonials, no image elements remaining in the band, muted inline loops, no overflow/errors, reduced-motion and offscreen pause. Fresh reduced-motion visit requests no carousel MP4s. Visual mobile screenshot inspected. Local only, no push or deployment.

### Curved video band heading and third recording — 2026-10-16
Added “See our Shopify stores in action.” with Arabic translation as the curved band's section heading. Added the supplied 7.48.13 PM recording as the third video, converted to silent faststart H.264 1440x822/24fps (7.21 MB), with a poster and source hash in the manifest. The carousel remains immediately before testimonials. Production hero build/typecheck and static packaging passed. Updated browser regression passed English/Arabic at 390/1440px for all three sources, actual muted playback, shared decoders (at most three), reduced-motion posters and offscreen pause. Arabic mobile screenshot visually inspected. Local only.

### Replace curved-band videos with supplied screenshots — 2026-10-16
Replaced the three carousel recordings with the five supplied storefront screenshots, ordered DRVN Coffee, Nayomi, Joya, Twigs, Aura. Converted to optimized WebP without changing their content; source hashes and output paths recorded in `content/carousel-images.json`. Preserved curved layout, placement before reviews and RTL/reduced-motion behavior. Updated the heading to “Explore the storefronts.” with Arabic translation. Original recording assets remain available; the carousel no longer mounts decoders/canvases or requests its MP4s.
`npm run build:hero` (TypeScript and production bundle), static packaging and `browser_tilted_grid.cjs` passed. Browser checks cover both languages at 390/1440px: loaded supplied images, zero carousel video requests, zero video/canvas elements in the band, section heading, placement, no overflow/JS errors and paused animation under reduced motion. Desktop screenshot visually inspected. Local only; not pushed or deployed.

### Full update verification before GitHub push — 2026-10-16

Both `npm run build` and `npm run build:hero` now pass; the skyline component source is present. Python booking tests (5) and Worker tests (6) pass. The current supplied-image carousel regression passes English/Arabic at 390/1440px, including loaded images, translated heading, no carousel video requests and reduced motion. Packaging rebuilt 420 public files; SEO validation passes all 210 pages. Delivery target is GitHub `origin/main`; no hosting deployment or production database migration is part of this push.

### Combined first booking step — 2026-10-16

Project type and product count now share one first-step container with separate accessible fieldsets. Desktop uses two columns; phones stack the questions above one Continue button. Validation focuses the unanswered group. New-store clients have three steps; existing-store clients have four. Back navigation retains both answers, and the optional website branch is preserved.
`browser_booking_conditional.cjs` passed all three project types in English/Arabic at 390/1440px. `browser_booking_steps.cjs` passed English/Arabic at 320/390/768/1440px, covering local lead persistence, saved product count, language/UTMs and the calendar gate without creating an appointment. English desktop and Arabic mobile screenshots visually inspected. No hosting deployment or production migration performed.

### Four product counts and Arabic default — 2026-10-16

The combined first booking step now offers exactly four product counts: Under 25, 25 to 100, 100 to 500, More than 500, with matching Arabic labels. Local and Worker validators accept all four, with historical values retained. Fresh root visits forward to `/ar/` in the document head; an explicit/saved English choice is respected. Direct booking visits default to Arabic, and the English switch persists after reload. The no-JavaScript root fallback also opens the static Arabic page. All 210 HTML/sitemap x-default alternates now target Arabic; existing language URLs remain available.
`browser_default_language.cjs` passed at 390/1440px for fresh Arabic entry, the English switch and preference, campaign/hash retention, fresh Arabic booking, translated labels, and no-JavaScript entry. Branching booking checks passed all project types in English/Arabic at 390/1440px; full booking flow checks passed at 320/390/768/1440px against an isolated local SQLite preview. Python (5) and Worker (6) tests passed, including all four new API values. Arabic mobile screenshot inspected. Packaging rebuilt 421 public files and SEO checks passed all 210 pages. No hosting deployment or production migration performed.

### Centered hero headline without periods — 2026-10-16

Removed the ending periods from the main headline and blue delivery line in English and Arabic. Centered the h1 text and its block, preserving the existing font sizes and blue delivery line. Updated translation keys and stylesheet cache version. Browser checks passed both languages at 390/1440px for centered alignment, no periods, preserved blue color and no overflow; English mobile screenshot visually inspected. Packaging and all 210 SEO checks passed. No hosting deployment performed.

### Centered hero kicker and sitewide Arabic entry — 2026-10-16

Centered the hero kicker independently of the supporting paragraph. Extended before-paint Arabic routing and no-JavaScript fallbacks from the homepage to every public English service/library/article page. All 210 generated pages now validate correct Arabic counterpart routing or absence of redirect on Arabic pages. Only deliberately selected language choices override Arabic; older automatically saved English values are ignored. English switches supply `?lang=en` and retain explicit selections across navigation and reload.
`browser_all_arabic.cjs` passed homepage, service, library, article and booking entry at 390/1440px with stale English storage, Arabic RTL, preserved campaign/hash, English switching and persistence; no-JavaScript public-page checks passed. Existing default-language regression passed both widths. Arabic mobile hero screenshot visually inspected. Packaging and all 210 SEO checks passed. GitHub delivery only; no hosting deployment performed.

### 100+ Shopify project counter — 2026-10-16

The section statistic now displays the owner-requested 100+ (١٠٠+ in Arabic) independently of the number of illustrated portfolio towers. On first viewport entry it counts upward over 1.6 seconds and settles at 100+; reduced motion shows the final value without animation. The accessible group label exposes the final count throughout. Cleanup cancels animation/observer listeners. Existing portfolio data is preserved.
TypeScript and the skyline production build passed. Browser checks passed English/Arabic at 320/390/1440px for increasing values, final 100+, reduced-motion behavior, no overflow and no page errors. English mobile screenshot visually inspected. Packaging and all 210 SEO checks passed. No hosting deployment performed.
