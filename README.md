# FIKRA Shopify consultation page

Static HTML/CSS/JavaScript, with the existing English/Arabic language switcher, portfolio and animations. The website saves qualification leads and asks FIKRA to call; meeting scheduling happens manually afterward if the lead agrees.

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

There is no frontend package install or compilation step. `prepare_cloudflare.py` builds the public asset directory and a static ZIP, cleaning obsolete assets first. Local leads persist in `.data/leads.sqlite3`; the Python server serves only the homepage, callback request page and assets. Existing `.data/bookings.sqlite3` history is retained privately. Do not upload `.data` or run the Python server as the Cloudflare backend.

## Lead form and callback flow

The `/book/` page collects project type, optional existing website URL, estimated budget and contact details. After `POST /api/leads` confirms the lead was saved, the page thanks the visitor and explains that FIKRA will call them. If they want a meeting after the call, the owner can send the Cal.com link manually over WhatsApp. Cal.com is not embedded or loaded by the website.

The form is available in English and Arabic. Only a successful persistent save hides the form and displays the callback confirmation; a failed or unavailable API leaves the form visible and reports that the request was not sent. The page passes only allowlisted campaign UTM fields to the lead API and analytics does not receive contact or qualification data.

## Cloudflare Workers setup

The live `fikra` Worker serves static assets and `/api/leads`, with `LEADS_DB` bound to the configured `fikra-leads` D1 database. Preserve the existing Worker domains, account, bindings and settings when publishing.

The lead form does not require an application secret. Owner email alerts use the `LEAD_ALERT_EMAIL` binding and a private `LEAD_ALERT_EMAIL_TO` Worker secret; see [NOTIFICATIONS.md](NOTIFICATIONS.md). The D1 database ID in `wrangler.jsonc` is already configured. Apply pending migrations before deploying changes that depend on new columns or tables:

```sh
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

A static ZIP upload alone is insufficient: it has no lead API or D1 storage. Missing binding/schema or failed writes return HTTP 503, and the form stays visible and does not show a successful save. The API validates every field, limits request size, checks same-origin POSTs, uses parameterized SQL and idempotent lead IDs, and applies a shared D1 rate limit (10 valid submissions per IP-derived daily hash per 10 minutes). A honeypot rejects basic bots. IP hashes expire and are cleaned; raw IPs are not saved. Lead records are private; no public read endpoint exists. Review access, retention and your privacy notice for stored name, email, WhatsApp and project information. Export and delete records using authenticated D1 tools as needed. `.wrangler`, databases, ZIPs and backups remain Git-ignored.

## Tracking and confirmation

For owner email alert setup, retries and delivery status, see [NOTIFICATIONS.md](NOTIFICATIONS.md). Notification acceptance is tracked separately from lead persistence.

The form pushes `fikra_lead_submitted` to `window.dataLayer` and sends Meta `Lead` only after the lead API confirms persistence. The browser `eventID` and server `event_id` both use the saved lead UUID. Do not configure another Meta Lead sender for this dataLayer event in GTM. See [META-TRACKING.md](META-TRACKING.md) for server setup and verification. No booking or calendar-open event is sent. Only the event name and opaque lead ID enter the data layer; names, email addresses, phone numbers, URLs and qualification answers are excluded. Verify Meta delivery separately after GTM configuration.

## Manual acceptance flow

1. Open desktop and mobile views in English and Arabic. Consultation CTAs should open `/book/`, and Arabic content should use RTL.
2. Submit empty/invalid fields; confirm translated validation. Enter a full name, international phone number, project, budget and optional full HTTP(S) website URL. Client email is not requested; existing saved email addresses are retained.
3. Submit and confirm `POST /api/leads` returns `status: saved`, then read the record from the local SQLite or D1 database. An offline/503 response must retain the form and show an error.
4. After a successful save, confirm the form is replaced by the callback message, no Cal.com embed or external calendar is loaded, and one lead event is recorded. Switch languages and confirm the success message translates.
5. If the lead agrees during the callback, the owner can send the meeting link manually over WhatsApp.
6. Check navigation, language switching, portfolio videos, client marquee, FAQ, enquiry dialog and responsive layout.

Optional browser checks use Playwright with an installed Chrome, without adding a production dependency:

```sh
npm install --prefix /tmp/fikra-booking-tests playwright
PLAYWRIGHT_MODULE=/tmp/fikra-booking-tests/node_modules/playwright node tests/browser_booking_states.cjs
```

Run the Python preview first. These checks use synthetic lead data and write browser screenshots to `/tmp`.

See `VALIDATION.md` for checks performed and limits.

## VSL video

The dedicated introduction-video section is `#vsl`, inside the hero, directly after its consultation CTA and before the storefront previews. Configure it in `assets/site-config.js`:

```js
vslWistiaMediaId: 'k5f96jshla',
vslVideoUrl: '/assets/videos/fikra-vsl-ar.mp4',
vslPosterUrl: 'assets/videos/fikra-vsl-poster.jpg',
```

The landing-page player currently embeds Wistia media `k5f96jshla` (FIKRA-Landing-Intro-Arabic-SFX-1080p, 260.97 seconds) using Wistia’s responsive iframe embed and official E-v1 script. The account `/manage` URL is not embedded. It retains the existing 16:9 layout and CTA placement and does not autoplay. To change the hosted video, update `vslWistiaMediaId`. Embed HTML was verified through Wistia’s public oEmbed endpoint. The original and web MP4 files are preserved; the native player path below is available when the Wistia ID is unset.

Use an actual local video file or a direct HTTPS MP4/WebM URL, rather than a YouTube/Vimeo watch-page URL. The poster is optional. The supplied Arabic introduction is configured at `/assets/videos/fikra-vsl-ar.mp4`, with `/assets/videos/fikra-vsl-poster.jpg` as its poster. This is a full-duration 720p web copy of the owner-supplied 1080p source, compressed to fit the static asset limit; the original remains untouched in the source delivery folder. Once configured, it uses native playback controls, supports inline mobile playback, does not autoplay or preload the video, and provides an error message/direct link if playback fails. Watching the video does not fire booking conversions. For Cloudflare-hosted video files, keep each below the existing 25 MiB asset limit or use a direct hosted media URL. Do not rename a portfolio recording as the introduction video.


## Separate callback request page

Consultation CTAs open `/book/`, a four-step lead form that collects project type, optional existing website URL, estimated budget and contact details. Radio choices use the same project/budget values accepted by `/api/leads`; back navigation retains answers in memory. Personal answers are not saved in browser storage. The page shows a callback confirmation only after a successful persistent lead save. The owner follows up by phone and can send a Cal.com meeting link manually over WhatsApp if the lead wants to meet.

`bookingPageUrl` in `assets/site-config.js` configures the website destination. The shared booking-navigation script carries the current English/Arabic language and five allowlisted campaign parameters into the page. Arbitrary query parameters are discarded, and legacy homepage `#booking` URLs redirect to `/book/`. Back-to-website links preserve language and campaign context. Booking pages are intentionally noindex.

Preview: `http://127.0.0.1:5184/book/`.

## SEO and AI search

See [SEO-HANDOFF.md](SEO-HANDOFF.md) for delivery status and the owner's launch steps. `seo-config.json` defines the canonical origin (`https://fikra-agency.com`). The Worker redirects the root to Arabic at `/ar/`; English has a stable `/en/` homepage. Public language URLs remain indexable without automatic language redirects. `seo-content.json` contains bilingual service-guide copy. `python3 prepare_cloudflare.py` now generates and packages the static Arabic homepage, English/Arabic service guides, sitemap, robots.txt and metadata. Rebuild after homepage or translation edits; generated language pages are overwritten.

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

### Product count and starting-price qualification
The booking form asks for product count first, then the service needed on the second slide: a new store, redesign, shopping/conversion improvements, or a store getting visits without sales. Both answers are required. New-store requests skip the optional existing-store URL question, making three steps; the other services use four steps. There is no pricing or budget-confirmation question. Visitors finish with name and phone details for a callback. New requests submit the existing “Not sure” budget value for API compatibility. Historical project and budget values remain valid.

`product_count` is saved in the leads table. Python preview upgrades an existing local SQLite database automatically on restart. **Before deploying this version, apply `migrations/0002_product_count.sql` to production D1**, using the migration command above. If the initial schema was created manually and is not recorded in D1 migrations, 0001 uses `CREATE TABLE IF NOT EXISTS` and can be applied safely before 0002. Do not run the raw ALTER statement twice. Existing lead rows are retained with an empty product count. No migration or deployment has been run against production by this change.

### Tilted Grid Hero (React island)

The curved image band in the homepage hero is a React island; surrounding content, navigation, video, and booking remain in the existing static HTML. English and Arabic pages both mount it after the introduction video. It replaces the ribbon background. The decorative band has no context providers or external state: its own `ResizeObserver` controls layout and animation iterations select images. Reduced-motion preferences pause the row, and tile width is capped on phones.

- Reusable component: `components/ui/tilted-grid-hero.tsx`; separate sample: `components/demo.tsx`.
- Mount and FIKRA props: `src/hero.tsx`; image list: `src/hero-images.ts`.
- Styles: `src/styles/hero.css`; generated browser assets: `assets/tilted-grid/hero.js` and `hero.css`.
- Image files and original Unsplash URLs: `assets/hero-images/` and its `sources.json`. These are decorative stock photos, not client work.

Setup/rebuild from a fresh checkout:

```sh
npm ci
npm run build:hero
python3 prepare_cloudflare.py
python3 scripts/check_seo.py
python3 server.py
```

React, TypeScript, Tailwind CSS v4, `clsx`, and `tailwind-merge` are installed through `package.json`. The hero build bundles React with esbuild and compiles Tailwind utilities without a global preflight reset, preserving the existing site's styles. `npm run build` and `npm run build:hero` both build the active curved storefront band.

The shadcn configuration is `components.json`: UI components resolve to `/components/ui`, shared helpers to `/lib/utils.ts`, and the default shadcn stylesheet is `/styles/components.css`. Keep `/components/ui` so generated shadcn imports resolve consistently; the `@/*` TypeScript alias points to the project root. The hero has a separate stylesheet to avoid shipping unrelated utilities. No icon package is required because this component uses no icons. Future shadcn components can be added with `npx shadcn@latest add <component>`; this repository already has the manual TypeScript/Tailwind/alias setup, so reinitialization is unnecessary. Setup follows the [Tailwind documentation](https://tailwindcss.com/docs/installation/tailwind-cli) and [shadcn configuration documentation](https://ui.shadcn.com/docs/components-json).

After changing the component, its props, images, or styles, run `npm run build:hero` before the Python packaging command. The compiled assets are kept in the repository so the static server and upload ZIP do not require a browser-side transpiler. These commands build locally; deployment is a separate action.

### Removed Shopify project skyline

The skyline graph and its mounting code, styles, generated bundle, and build entry have been removed from the site. The reusable component and portfolio JSON remain in `components/` as inactive source references. The normal build compiles the curved storefront band only.

### Arabic default and four product-count choices

Fresh visits to the homepage, service pages, article library and individual articles open their `/ar/` counterparts before the English page paints; campaign parameters and anchors are retained. The English switch uses `/?lang=en`, and a deliberately selected language preference is respected on return. Older automatically saved language values do not override Arabic. Direct visits to `/book/` default to Arabic unless a language was chosen or explicitly supplied in `?lang=`. English service and article URLs remain available through the English switch or an explicit `?lang=en`; fresh unprefixed visits open the matching Arabic page. HTML and sitemap `x-default` alternates point to Arabic. With JavaScript disabled all public English pages also forward to their static Arabic counterparts.

Product-count choices are exactly `Under 25`, `25 to 100`, `100 to 500`, and `More than 500`, translated as `أقل من ٢٥`, `من ٢٥ إلى ١٠٠`, `من ١٠٠ إلى ٥٠٠`, and `أكثر من ٥٠٠`. Both API implementations accept these values and retain support for historical lead values. No new database migration is needed for this choice update. Restart a running Python preview after changing the API validation constants.

### Homepage ecommerce wording and Shopify platform panel

The hero uses “ecommerce” in English and “متاجر إلكترونية” in Arabic. The solutions section includes a Shopify platform introduction above the service cards. `assets/platform-logos/shopify.svg` is Shopify’s unmodified primary logo, downloaded from the official brand-assets page (https://www.shopify.com/brand-assets) on 2026-10-21. The logo links to Shopify’s homepage.
