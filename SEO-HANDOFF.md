# FIKRA SEO and AI search handoff

## Delivery state

Implemented locally on October 16, 2026. This work has not been pushed to GitHub or deployed. No Search Console property, external business listing, advertising account or analytics account was created. No rankings or AI recommendations are promised.

The existing README identifies `https://fikra.mohamedxmod99.workers.dev` as the supplied live URL; a read-only request returned HTTP 200 during this work. Generated canonical URLs currently use that origin. This is not confirmation that the live site contains these changes.

## Implemented

- English homepage at `/` and static Arabic homepage at `/ar/`. Arabic headings and content are present in HTML without requiring JavaScript.
- Three substantive service guides, each in English and Arabic:
  - `/shopify-store-design/` and `/ar/shopify-store-design/`
  - `/shopify-store-redesign/` and `/ar/shopify-store-redesign/`
  - `/arabic-english-shopify/` and `/ar/arabic-english-shopify/`
- Unique titles/descriptions, self-referencing canonicals, reciprocal `en`, `ar` and `x-default` hreflang links, Open Graph and Twitter metadata.
- Organization, WebSite and WebPage JSON-LD; service guides also contain Service JSON-LD. Only the existing FIKRA name and Instagram profile are used. No address, phone, ratings, founding date, official partnership, pricing or commercial results are fabricated.
- Visible links connect the funnel and service pages. The language selector links to the matching published language URL. Public page language follows the URL, not a saved browser preference. Existing `?lang=ar` links navigate to the Arabic equivalent and retain query attribution/hash. The booking form retains its existing dynamic translation behavior.
- Sitemap containing 210 indexable public pages, plus robots.txt allowing public crawling and explicitly permitting OAI-SearchBot. API paths are excluded from crawling. GPTBot training preferences have not been changed or represented as a requirement for ChatGPT search.
- Booking page retains `noindex,follow`; private build inputs and lead records stay outside the public upload.
- Cloudflare packaging automatically rebuilds and includes the language pages, service pages, sitemap, robots.txt and response-header file.

## Source and update workflow

`seo-config.json` is the single setting for the canonical site origin and verified brand identity. `seo-content.json` contains the bilingual service-page copy. `scripts/build_seo.py` updates homepage metadata and generates Arabic/service pages, sitemap and robots.txt. Existing homepage translations are reused through `scripts/export-translations.cjs`.

Edit the English homepage and translation dictionaries, then rebuild. Do not edit generated Arabic/service HTML directly; it is overwritten on the next build. Keep the Arabic dictionary consistent with any new homepage copy.

```sh
python3 prepare_cloudflare.py
python3 scripts/check_seo.py
# With the Python preview running:
python3 scripts/check_seo.py http://127.0.0.1:5184
node --test tests/seo-language.test.cjs
```

The regenerated `cloudflare-upload/` and `fikra-cloudflare-upload.zip` are local, Git-ignored artifacts. This site's form requires the Worker API and D1; uploading only the static ZIP does not provide a working lead backend. Use the existing authenticated Worker deployment process described in README.md and preserve its bindings.

## Owner steps, in order

1. **Choose the permanent domain and intended market.** If you already have a custom domain, connect it to the existing Worker and replace only `site_url` in `seo-config.json` with its HTTPS origin. Rebuild before deployment. Decide whether your main audience is Qatar or the wider GCC before adding regional service copy. The current guides are intentionally service-focused. Do not add an invented office/address to target a city.
2. **Publish the prepared version.** Push/review the project changes and deploy the existing Worker with the generated asset directory and its current API/D1 bindings. Check the homepage, `/ar/`, one service guide, `/robots.txt` and `/sitemap.xml` on the real host. Ensure Cloudflare WAF/challenges allow genuine Googlebot and OAI-SearchBot requests; robots.txt alone cannot override firewall blocking. If changing domains, redirect the old origin to the permanent domain while preserving paths. Avoid leaving duplicate public hosts with competing canonicals.
3. **Verify Google Search Console.** Add a Domain property for your custom domain with its DNS TXT record. If staying on the supplied workers.dev hostname, use a URL-prefix property and a supported verification method. Submit `https://YOUR-ACTUAL-HOST/sitemap.xml`, then inspect `/`, `/ar/` and the service pages. Request indexing after the new version is live. A sitemap submission or successful inspection does not guarantee indexing or rank.
4. **Confirm real business details and proof.** Supply the business name you use publicly, service markets, approved contact details and genuine client case studies/reviews. Add consistent profiles in relevant business directories. Create or update a Google Business Profile only if FIKRA meets Google's eligibility rules; an online-only business should not invent an office. Obtain permission before publishing client data or attributing statements to brands. The removed example analytics have not been added to schema or service copy.
5. **Connect measurement in your existing tracking setup.** Supply or configure your real GTM/GA4 IDs through the existing workflow. Do not duplicate tracking scripts. Use the existing `fikra_lead_submitted` and `fikra_booking_confirmed` events; treat the latter as a booking only under the existing confirmed-booking guards. Avoid sending names, emails, phone numbers or qualification answers to analytics. Review consent needs for the actual tools and markets you use.
6. **Track discovery and enquiries.** In Search Console record query, landing page, impressions, clicks and country. In analytics compare Google organic and ChatGPT referrals with qualified enquiries and confirmed bookings. Some AI visits lack a referral, so referral counts are incomplete. Keep a small manual list of relevant search questions and note whether FIKRA is cited, with date and sources; individual AI answers vary and are not a stable universal ranking.

## Next content to supply

- Two or three real client case studies: the problem, exact work performed, named client permission, and measured results only where source data supports them.
- Confirmed service markets and business contact details.
- Approved explanations of your process, deliverables, typical project scope and any pricing you want public.

These unlock useful market-specific pages and stronger evidence. They cannot be replaced by fabricated ratings, city pages or generated results. Suggested future query research: Shopify agency Qatar, Shopify website design Qatar, and تصميم متجر شوبيفاي قطر. Search volume and competitiveness have not been measured.

## Checks completed and limits

- Generated 210 public pages and packaged 391 public files successfully, including 100 articles in English and Arabic and two article libraries.
- Checked unique page structure, canonical URLs, reciprocal language links, JSON-LD parsing, Arabic HTML, local link/asset destinations, sitemap URLs, booking noindex and private-file exclusion.
- Verified all 210 public pages plus crawler files over local HTTP; private configuration, scripts and lead files return 404.
- Three language-navigation tests passed, including campaign preservation and the legacy language query.
- Four existing Python lead tests and five Worker tests passed.
- Rebuilding SEO output is repeatable without duplicate metadata or service navigation.
- The in-app browser connection failed during setup. An isolated local Chrome subsequently verified both article libraries and a representative English/Arabic article at 1440px and 390px. Library-to-article navigation, language switching, checklist/FAQ interaction and the Arabic booking destination passed. Screenshots were visually reviewed; this is not exhaustive physical-device proof. No real booking was submitted.
- Search engine schema validation, live crawl/indexing, firewall acceptance, Google rankings, analytics delivery and ChatGPT citations remain unverified until publication and account setup.

## Official references

- Google SEO basics: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google multilingual pages: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Google structured data: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Google AI search features: https://developers.google.com/search/docs/appearance/ai-features
- OpenAI search crawler: https://developers.openai.com/api/docs/bots

Google documents no special AI schema or AI text file requirement for its AI search features. OAI-SearchBot access supports eligibility for ChatGPT search; neither crawler access nor structured data guarantees a recommendation or a first position.

## Shopify article library

Forty distinct questions now have English and Arabic article pages at `/articles/` and `/ar/articles/`. See `ARTICLE-INVENTORY.md` for the complete list. The homepage and service pages link to the library. Every article has direct answers, practical checklists, official references, related guides, a relevant service link, a consultation CTA, canonical/hreflang tags and BlogPosting/BreadcrumbList structured data. No claim is made that article quantity guarantees indexing, rankings or AI citations.

Edit original copy in `content/articles/*.json`, preserve original publication dates and update modification dates when the content changes. Rebuild using the existing public packaging command. Run `python3 scripts/check_articles.py` as well as the SEO checker after editing. Raw article sources and owner documents are not published.

All 40 article topics also have original lightweight WebP illustrations, displayed in the article headers and library cards. The artwork has translated alt text and social/structured-data image references. Editable SVG sources remain outside the public output.

## Expansion to 100 topics — October 16, 2026

The collection now includes 100 illustrated questions in English and Arabic, covering websites, Shopify, platform comparisons and Qatar business scenarios. Both libraries have ten topic groups and accessible client-side search matching titles in either language. All content remains available when JavaScript is disabled; search controls appear only when functional. The sitemap contains 210 indexable public pages, and the public package contains 391 files.

See ARTICLE-INVENTORY.md for the current list and ARTICLE-RESEARCH.md for source selection and research limits. These are curated questions, not measured highest-volume search queries. The owner’s Search Console and keyword research can refine priorities after publication. Twenty desktop/mobile browser checks and search/navigation checks passed. New content, image, link and schema audits passed. This expansion remains local; no GitHub push, deployment or real booking was performed.
