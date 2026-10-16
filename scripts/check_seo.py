"""Check generated pages, sitemap, internal links and publication boundaries."""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import xml.etree.ElementTree as ET
import urllib.request
import sys
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = json.loads((ROOT / 'seo-config.json').read_text())['site_url'].rstrip('/')
slugs = [p['slug'] for p in json.loads((ROOT / 'seo-content.json').read_text())]
paths = ['/', '/ar/'] + [f'{prefix}/{slug}/' for slug in slugs for prefix in ['', '/ar']]
article_slugs = [p.stem for p in sorted((ROOT / 'content/articles').glob('*.json'))]
paths += ['/articles/', '/ar/articles/'] + [f'{prefix}/articles/{slug}/' for slug in article_slugs for prefix in ['', '/ar']]
base = sys.argv[1].rstrip('/') if len(sys.argv) > 1 else None

def file_for(path):
    return ROOT / (unquote(path).lstrip('/') + ('index.html' if path.endswith('/') else ''))

for path in paths:
    soup = BeautifulSoup(file_for(path).read_text(), 'html.parser')
    lang = 'ar' if path.startswith('/ar/') else 'en'
    assert soup.html['lang'] == lang, path
    assert soup.html['dir'] == ('rtl' if lang == 'ar' else 'ltr'), path
    assert soup.html['data-static-locale'] == lang, path
    assert len(soup.find_all('h1')) == 1, path
    assert soup.title and soup.title.get_text().strip(), path
    assert soup.find('meta', attrs={'name': 'description'})['content'], path
    assert soup.find('link', rel='canonical')['href'] == ORIGIN + path, path
    alternatives = {t['hreflang']: t['href'] for t in soup.find_all('link', rel='alternate')}
    assert set(alternatives) == {'en', 'ar', 'x-default'}, path
    for language in ['en', 'ar']:
        target = BeautifulSoup(file_for(urlsplit(alternatives[language]).path).read_text(), 'html.parser')
        reverse = {t['hreflang']: t['href'] for t in target.find_all('link', rel='alternate')}
        assert reverse[lang] == ORIGIN + path, (path, 'hreflang reciprocity')
    schema = json.loads(soup.find('script', type='application/ld+json').string)
    assert schema['@context'] == 'https://schema.org'
    assert not any(n.get('@type') in ['Review', 'AggregateRating'] for n in schema['@graph'])
    if lang == 'ar':
        assert any('\u0600' <= c <= '\u06ff' for c in soup.h1.get_text()), path
    for tag in soup.select('a[href], img[src], script[src], link[rel=stylesheet], source[data-src]'):
        url = urlsplit(tag.get('href') or tag.get('src') or tag.get('data-src'))
        if url.scheme or url.netloc or not url.path: continue
        assert url.path.startswith('/'), (path, url.path, 'root relative links required')
        assert file_for(url.path).exists(), (path, url.path, 'missing local destination')
        if url.fragment:
            target = BeautifulSoup(file_for(url.path).read_text(), 'html.parser')
            assert target.find(id=url.fragment), (path, url.fragment)
    if base:
        with urllib.request.urlopen(base + path) as response:
            assert response.status == 200
            assert BeautifulSoup(response.read(), 'html.parser').find('link', rel='canonical')['href'] == ORIGIN + path

ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
locations = {n.text for n in ET.parse(ROOT / 'sitemap.xml').findall('s:url/s:loc', ns)}
assert locations == {ORIGIN + p for p in paths}
book = BeautifulSoup((ROOT / 'book/index.html').read_text(), 'html.parser')
assert 'noindex' in book.find('meta', attrs={'name': 'robots'})['content']
assert 'OAI-SearchBot' in (ROOT / 'robots.txt').read_text()
output = ROOT / 'cloudflare-upload'
for path in paths:
    assert (output / file_for(path).relative_to(ROOT)).exists(), path
for name in ['robots.txt', 'sitemap.xml', '_headers']:
    assert (output / name).read_bytes() == (ROOT / name).read_bytes()
for name in ['seo-config.json', 'seo-content.json', 'SEO-HANDOFF.md', 'ARTICLE-INVENTORY.md', 'ARTICLE-RESEARCH.md', 'content', '.data', 'scripts', 'tests', 'server.py']:
    assert not (output / name).exists(), ('private build input in public output', name)
if base:
    for path in ['/robots.txt', '/sitemap.xml']:
        with urllib.request.urlopen(base + path) as r: assert r.status == 200
    for path in ['/seo-config.json', '/.data/leads.sqlite3', '/scripts/build_seo.py']:
        try: urllib.request.urlopen(base + path)
        except urllib.error.HTTPError as e: assert e.code == 404
        else: raise AssertionError('Private path accessible: ' + path)
print(f'SEO checks passed: {len(paths)} pages, bilingual links, schema, sitemap, assets, noindex and private-file boundaries' + ('; local HTTP routes verified' if base else ''))
