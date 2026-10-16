"""Generate crawlable language/service pages and SEO assets from reviewed content."""
from pathlib import Path
from urllib.parse import urlsplit
import html
import json
import subprocess
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from articles import build_articles, article_path

ROOT = Path(__file__).resolve().parent.parent
CONFIG = json.loads((ROOT / 'seo-config.json').read_text())
ORIGIN = CONFIG['site_url'].rstrip('/')
parsed = urlsplit(ORIGIN)
if parsed.scheme != 'https' or not parsed.netloc or parsed.path or parsed.query or parsed.fragment or parsed.username:
    raise ValueError('site_url must be an HTTPS origin without a path, credentials, query or fragment')
PAGES = json.loads((ROOT / 'seo-content.json').read_text())
AR = json.loads(subprocess.check_output(['node', str(ROOT / 'scripts/export-translations.cjs')], text=True))
HOME = {
    'en': ('Shopify Website Design & Development | FIKRA', 'FIKRA designs and develops Shopify stores around your brand, with mobile layouts, clear navigation and Arabic and English storefront options. Book a free consultation.'),
    'ar': ('فكرة | تصميم وتطوير متاجر شوبيفاي', 'نصمّم ونطوّر في فكرة متاجر شوبيفاي تناسب علامتك، مع تجربة جوال واضحة وخيارات للعربية والإنجليزية. احجز استشارة مجانية لمناقشة مشروعك.')
}
LABELS = {
    'en': {'services': 'Explore our Shopify services', 'home': 'Home', 'book': 'Book your free consultation', 'related': 'Related services', 'faq': 'Questions about this service', 'instagram': 'Contact FIKRA on Instagram', 'back': 'See our work', 'scope': 'Discuss your products, content and priorities. We agree the scope before work begins.'},
    'ar': {'services': 'اكتشف خدماتنا لمتاجر شوبيفاي', 'home': 'الرئيسية', 'book': 'احجز استشارتك المجانية', 'related': 'خدمات ذات صلة', 'faq': 'أسئلة حول هذه الخدمة', 'instagram': 'تواصل مع فكرة على إنستغرام', 'back': 'شاهد أعمالنا', 'scope': 'نناقش منتجاتك ومحتواك وأولوياتك، ونتّفق على نطاق المشروع قبل بدء العمل.'}
}

def page_path(slug='', lang='en'):
    return ('/ar' if lang == 'ar' else '') + ('/' + slug if slug else '') + '/'

def metadata(soup, path, en_path, ar_path, lang, title, description, service=None):
    for icon in list(soup.head.find_all('link')):
        if any(rel in icon.get('rel', []) for rel in ['icon', 'shortcut', 'apple-touch-icon']):
            icon.decompose()
    for attrs in [
        {'rel': 'icon', 'type': 'image/x-icon', 'href': '/assets/fikra-favicon.ico?v=1'},
        {'rel': 'icon', 'type': 'image/png', 'sizes': '512x512', 'href': '/assets/fikra-favicon.png?v=1'},
        {'rel': 'apple-touch-icon', 'sizes': '180x180', 'href': '/assets/fikra-apple-touch-icon.png?v=1'},
    ]:
        soup.head.append(soup.new_tag('link', attrs=attrs))
    if not soup.find('link', href='/assets/brand.css?v=headline3'):
        soup.head.append(soup.new_tag('link', rel='stylesheet', href='/assets/brand.css?v=headline3'))
    soup.html['lang'] = lang
    soup.html['dir'] = 'rtl' if lang == 'ar' else 'ltr'
    soup.html['data-static-locale'] = lang
    for tag in list(soup.head.find_all(['title', 'meta', 'link', 'script'])):
        if tag.name == 'title' or (tag.name == 'meta' and (tag.get('name', '').lower() in ['description', 'robots'] or tag.get('property', '').startswith('og:') or tag.get('name', '').startswith('twitter:'))) or (tag.name == 'link' and any(x in tag.get('rel', []) for x in ['canonical', 'alternate'])) or (tag.name == 'script' and tag.get('type') == 'application/ld+json'):
            tag.decompose()
    title_tag = soup.new_tag('title'); title_tag.string = title; soup.head.append(title_tag)
    def meta(**attrs): soup.head.append(soup.new_tag('meta', attrs=attrs))
    meta(name='description', content=description)
    meta(name='robots', content='index,follow,max-image-preview:large,max-video-preview:-1')
    canonical = ORIGIN + path
    soup.head.append(soup.new_tag('link', rel='canonical', href=canonical))
    for language, target in [('en', en_path), ('ar', ar_path), ('x-default', en_path)]:
        soup.head.append(soup.new_tag('link', rel='alternate', hreflang=language, href=ORIGIN + target))
    for prop, val in {'type': 'website', 'site_name': CONFIG['business_name'], 'title': title, 'description': description, 'url': canonical, 'image': ORIGIN + '/assets/fikra-logo.png', 'image:alt': 'FIKRA', 'locale': 'ar_QA' if lang == 'ar' else 'en_US', 'locale:alternate': 'en_US' if lang == 'ar' else 'ar_QA'}.items():
        meta(property='og:' + prop, content=val)
    meta(name='twitter:card', content='summary')
    meta(name='twitter:title', content=title); meta(name='twitter:description', content=description)
    meta(name='twitter:image', content=ORIGIN + '/assets/fikra-logo.png')
    org_id = ORIGIN + '/#organization'
    website_id = ORIGIN + '/#website'
    graph = [
        {'@type': 'Organization', '@id': org_id, 'name': CONFIG['business_name'], 'alternateName': CONFIG['alternate_name'], 'url': ORIGIN + '/', 'logo': ORIGIN + '/assets/fikra-logo.png', 'sameAs': [CONFIG['instagram_url']]},
        {'@type': 'WebSite', '@id': website_id, 'name': 'FIKRA', 'url': ORIGIN + '/', 'publisher': {'@id': org_id}, 'inLanguage': ['en', 'ar']},
        {'@type': 'WebPage', '@id': canonical + '#webpage', 'url': canonical, 'name': title, 'description': description, 'inLanguage': lang, 'isPartOf': {'@id': website_id}, 'about': {'@id': org_id}}
    ]
    if service:
        graph.append({'@type': 'Service', '@id': canonical + '#service', 'name': service, 'description': description, 'url': canonical, 'provider': {'@id': org_id}})
        graph[-2]['mainEntity'] = {'@id': canonical + '#service'}
    schema = soup.new_tag('script', type='application/ld+json')
    schema.string = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('</', '<\\/')
    soup.head.append(schema)

def service_links(lang):
    return f'<a href="{article_path(lang=lang)}">{"أدلة المواقع وشوبيفاي" if lang == "ar" else "Website & Shopify guides"}</a>' + ''.join(f'<a href="{page_path(p["slug"], lang)}">{html.escape(p[lang]["title"].split(" | ")[0])}</a>' for p in PAGES)

def insert_service_nav(soup, lang):
    old = soup.find(id='seo-service-links')
    if old: old.decompose()
    labels = LABELS[lang]
    fragment = BeautifulSoup(f'<nav class="seo-service-links" id="seo-service-links" aria-label="{labels["services"]}"><div><strong>{labels["services"]}</strong>{service_links(lang)}</div></nav>', 'html.parser')
    footer = soup.find('footer')
    if footer: footer.insert_before(fragment)
    if not soup.find('link', href='/assets/seo.css?v=20261016-blue2'):
        soup.head.append(soup.new_tag('link', rel='stylesheet', href='/assets/seo.css?v=20261016-blue2'))

def root_assets(soup):
    for tag in soup.find_all(True):
        for attr in ['src', 'href', 'poster', 'data-src']:
            value = tag.get(attr)
            if isinstance(value, str) and value.startswith('assets/'):
                tag[attr] = '/' + value
            elif attr == 'href' and value in ['./index.html', 'index.html']:
                tag[attr] = '/'

def translate(soup):
    for node in list(soup.find_all(string=True)):
        if node.find_parent(['script', 'style', 'svg']) or node.find_parent(attrs={'data-no-translate': True}): continue
        key = ' '.join(str(node).split())
        if key in AR: node.replace_with(AR[key])
    for tag in soup.find_all(True):
        for attr in ['alt', 'aria-label', 'title', 'placeholder']:
            if tag.get(attr) in AR: tag[attr] = AR[tag[attr]]
        if tag.has_attr('data-showcase-ar'): tag.string = tag['data-showcase-ar']

home = BeautifulSoup((ROOT / 'index.html').read_text(), 'html.parser')
root_assets(home)
# The root is the English canonical; Arabic has an independently crawlable URL.
old_service_nav = home.find(id='seo-service-links')
if old_service_nav: old_service_nav.decompose()
menu = home.select_one('.nav-menu-two')
if menu:
    existing = menu.find('a', href='/articles/')
    if existing:
        existing.string = 'Website & Shopify guides'
        existing['data-i18n'] = 'Website & Shopify guides'
if menu and not menu.find('a', href='/articles/'):
    item=home.new_tag('li', attrs={'class':'nav-link-item-wrapper cw-nav-link'})
    link=home.new_tag('a', href='/articles/', attrs={'class':'nav-link','data-i18n':'Website & Shopify guides'})
    link.string='Website & Shopify guides'; item.append(link); menu.append(item)
metadata(home, '/', '/', '/ar/', 'en', *HOME['en'])
(ROOT / 'index.html').write_text(str(home))
for lang in ['ar']:
    soup = BeautifulSoup(str(home), 'html.parser')
    translate(soup)
    for link in soup.select('a[href="/"]'):
        link['href'] = '/ar/'
    for link in soup.select('a[href="/articles/"]'):
        link['href'] = '/ar/articles/'
    metadata(soup, '/ar/', '/', '/ar/', lang, *HOME[lang])
    (ROOT / 'ar').mkdir(exist_ok=True)
    (ROOT / 'ar/index.html').write_text(str(soup))

for page in PAGES:
    for lang in ['en', 'ar']:
        c = page[lang]; labels = LABELS[lang]
        esc = html.escape
        sections = ''.join(f'<section><h2>{esc(h)}</h2><p>{esc(p)}</p></section>' for h, p in c['sections'])
        faq = ''.join(f'<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q, a in c['faq'])
        raw = f'''<!DOCTYPE html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/assets/seo.css?v=20261016-blue2"><script defer src="/assets/funnel-copy.js"></script><script defer src="/assets/i18n.js?v=seo1"></script><script defer src="/assets/booking-navigation.js?v=seo1"></script></head><body class="seo-page"><header class="seo-header navbar-wrapper"><a href="{page_path(lang=lang)}" aria-label="{labels['home']}"><img src="/assets/fikra-logo.png" width="146" height="48" alt="FIKRA"></a><a href="/book/?lang={lang}" data-fikra-booking>{labels['book']}</a></header><main id="main"><nav aria-label="{'Breadcrumb' if lang == 'en' else 'مسار التصفّح'}"><a href="{page_path(lang=lang)}">{labels['home']}</a> / {esc(c['title'].split(' | ')[0])}</nav><article><h1>{esc(c['heading'])}</h1><p class="seo-intro">{esc(c['intro'])}</p>{sections}<section><h2>{labels['faq']}</h2>{faq}</section><section class="seo-consult"><h2>{labels['book']}</h2><p>{labels['scope']}</p><a class="seo-cta" href="/book/?lang={lang}" data-fikra-booking>{labels['book']}</a></section></article></main><footer><nav class="seo-related" aria-label="{labels['related']}"><strong>{labels['related']}</strong>{service_links(lang)}</nav><a href="{page_path(lang=lang)}#shopify-projects">{labels['back']}</a><a href="{CONFIG['instagram_url']}" rel="noopener noreferrer">{labels['instagram']}</a><p>© 2026 FIKRA</p></footer></body></html>'''
        soup = BeautifulSoup(raw, 'html.parser')
        path = page_path(page['slug'], lang)
        metadata(soup, path, page_path(page['slug']), page_path(page['slug'], 'ar'), lang, c['title'], c['description'], c['title'].split(' | ')[0])
        destination = ROOT / path.strip('/') / 'index.html'
        destination.parent.mkdir(parents=True, exist_ok=True); destination.write_text(str(soup))

# Only index public information pages. The form remains crawlable but noindex.
pairs = [('/', '/ar/')] + [(page_path(p['slug']), page_path(p['slug'], 'ar')) for p in PAGES]
pairs += build_articles(ROOT, ORIGIN, metadata, service_links, PAGES)
ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
ET.register_namespace('xhtml', 'http://www.w3.org/1999/xhtml')
ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
xhtml = '{http://www.w3.org/1999/xhtml}'
xml = ET.Element(ns + 'urlset')
for en, ar in pairs:
    for path in [en, ar]:
        item = ET.SubElement(xml, ns + 'url'); ET.SubElement(item, ns + 'loc').text = ORIGIN + path
        for language, target in [('en', en), ('ar', ar), ('x-default', en)]:
            ET.SubElement(item, xhtml + 'link', rel='alternate', hreflang=language, href=ORIGIN + target)
ET.indent(xml)
(ROOT / 'sitemap.xml').write_bytes(ET.tostring(xml, encoding='utf-8', xml_declaration=True))
(ROOT / 'robots.txt').write_text(f'''User-agent: *
Allow: /
Disallow: /api/

User-agent: OAI-SearchBot
Allow: /
Disallow: /api/

Sitemap: {ORIGIN}/sitemap.xml
''')
# GPTBot training settings are intentionally separate from search discovery.
(ROOT / '_headers').write_text('''/book/*
  X-Robots-Tag: noindex, follow
/api/*
  X-Robots-Tag: noindex, nofollow
/*
  X-Content-Type-Options: nosniff
''')
print(f'Built {len(pairs) * 2} indexable pages for {ORIGIN}')
