# FIKRA SEO and AI search handoff

## Scope — 2026-10-19

Target: Qatar first, Arabic and English. GEO here means visibility in generative AI answers alongside Google organic search. Changes improve discovery and relevance; no rankings or AI citations are guaranteed.

## Website implementation

- Permanent origin: **https://fikra-agency.com** in `seo-config.json`, all canonicals, sitemap entries, social metadata and structured-data IDs.
- Arabic default: `/` permanently redirects to `/ar/`. Legacy `/?lang=en` permanently redirects to `/en/`. Query attribution is retained.
- English homepage: `/en/`. Arabic homepage: `/ar/`. Both are published as static HTML, with reciprocal `en`, `ar` and Arabic `x-default` links.
- English service/article URLs remain English without forced redirects or a meta refresh. Explicit language query switches still work through the language selector.
- Public GET/HEAD requests on `www.fikra-agency.com` and the former Worker hostname redirect to the permanent origin, preserving paths and query strings. Existing same-origin form POSTs are not redirected.
- New substantive service page: `/shopify-agency-qatar/` and `/ar/shopify-agency-qatar/`. It covers actual offered services, bilingual layouts, payment-provider eligibility, project preparation, starting price and the manual callback process.
- Home copy identifies the Qatar market. An About FIKRA section makes business identity and scope visible. Each of the six solutions links to a relevant service guide or article in the current language.
- Homepage titles and descriptions now describe Shopify website design and development in Qatar. The public starting-price answer matches the QAR 5,000 qualification already used by the lead form.
- Organization and Service structured data use Qatar as the service area. Service pages have matching breadcrumb data. No office address, partnership, ratings or client performance metrics have been invented.
- Sitemap contains 212 indexable pages: two homepages, eight service pages, two guide libraries and 200 article language versions. `lastmod` uses actual recorded article revision dates and explicitly recorded dates for newly reviewed home/local-service content; ordinary deployment does not bump these dates.
- Robots allow public crawling, including `OAI-SearchBot`; `/api/` stays excluded and the lead form remains `noindex`. A permissive robots file does not prove that a real crawler passes Cloudflare security rules.
- The Pixel, server conversion queue, owner email alerts and lead database remain configured. This SEO work does not send synthetic leads or alter notification destinations.

## Owner step: Google Search Console

1. Open https://search.google.com/search-console/welcome using the Google account that should manage FIKRA.
2. Add a **Domain** property: `fikra-agency.com` (without https or a path).
3. Google supplies a public DNS TXT verification value beginning `google-site-verification=`. In Cloudflare DNS add a TXT record at `@` using that exact value. Keep existing DNS records.
4. Click Verify in Search Console. A TXT record can take time to become visible.
5. In Sitemaps submit **https://fikra-agency.com/sitemap.xml**.
6. Inspect and request indexing for `/ar/`, `/en/`, `/shopify-agency-qatar/`, `/ar/shopify-agency-qatar/`, and the three existing service pairs. Confirm Google's selected canonical after indexing.
7. Review Pages, Sitemaps and Performance. A submitted sitemap or indexing request does not guarantee indexing or rank.

Google Search Console is not verified yet. No Search Console property, DNS verification record, Google Business Profile or directory account was created by this code change.

## Next authority work

- Publish two or three permission-backed client case studies. Describe the actual store, problem, work performed and screenshots; include measured results only when supported by real data.
- Keep the FIKRA name, public website and approved business details consistent on real profiles. Review relevant local/industry listings before adding one. Do not invent an office or build doorway pages for cities where the business has no distinct content.
- Determine Google Business Profile eligibility from the real operating model before creating a profile. A purely online business should not claim a physical storefront.
- Confirm real Googlebot and AI-search crawler access using Cloudflare security and request logs; do not assume a spoofed user agent proves crawler reachability. Change a firewall rule only when its effect is known.
- Keep key service explanations in visible HTML with descriptive internal links and real sources in educational content. No special AI file or schema guarantees inclusion in an AI answer.

## Measurement

Start with Search Console country **Qatar** and record query, landing page, impressions, clicks, CTR and average position over matching periods. The new property has no verified baseline yet.

Track English queries such as “Shopify agency Qatar”, “Shopify website design Qatar”, “Shopify store redesign Qatar”; Arabic queries such as “تصميم متجر شوبيفاي قطر”, “شركة شوبيفاي قطر”, “تطوير متجر إلكتروني قطر”. These are target themes, not measured search-volume claims.

For AI visibility, keep a dated record of the question, product/model, whether web search was used, cited FIKRA URL and cited competing sources. One answer is not a stable universal rank. Referral counts can miss visits without a referrer.

## Build and delivery

Edit `index.html`, `assets/funnel-copy.js`, `seo-content.json`, `seo-config.json` and generator sources. Rebuild with `python3 prepare_cloudflare.py`; generated English/Arabic/service/article files are overwritten. Deploy with the authenticated Worker configuration, preserving D1, secrets, routes, schedules and the email binding.

`scripts/check_seo.py` has been updated for stable language URLs; automated test suites were not run as part of this change. Production publication and read-only audit results are reported in the task conversation.

## Official guidance used

- Canonicals: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Separate language URLs and avoiding automatic language redirects: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- AI search eligibility and content: https://developers.google.com/search/docs/appearance/ai-features
- OpenAI search crawler control: https://developers.openai.com/api/docs/bots
