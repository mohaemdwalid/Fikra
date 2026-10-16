"""Audit article content, generated markup and library completeness."""
from pathlib import Path
from collections import Counter
from datetime import date
import json
from hashlib import sha256
from PIL import Image
from bs4 import BeautifulSoup
from articles import load_articles, CATEGORIES, article_path

ROOT=Path(__file__).resolve().parent.parent
articles=load_articles(ROOT)
assert len(articles)==100
image_paths=[ROOT/a['image']['src'].lstrip('/') for a in articles]
assert len({sha256(p.read_bytes()).hexdigest() for p in image_paths})==len(articles), 'Every topic needs a distinct image'
for path in image_paths:
    with Image.open(path) as im:
        assert im.size==(1200,675), path
        assert im.format=='WEBP', path
    assert path.stat().st_size<100000, 'Article artwork should stay lightweight'
for lang in ['en','ar']:
    titles=[a[lang]['title'] for a in articles]
    answers=[a[lang]['answer'] for a in articles]
    paragraphs=[p for a in articles for h,p in a[lang]['sections']+a[lang].get('extended_sections',[])]
    assert len(titles)==len(set(titles)), 'Duplicate article title'
    assert len(answers)==len(set(answers)), 'Repeated short answer'
    assert len(paragraphs)==len(set(paragraphs)), 'Repeated article body paragraph'
    library=BeautifulSoup((ROOT/article_path(lang=lang).strip('/')/'index.html').read_text(),'html.parser')
    assert len(library.select('.article-card'))==len(articles)
    assert len(library.select('.article-card-image[loading=lazy]'))==len(articles)
    assert len(library.select('.article-topic'))==len(CATEGORIES)
    for a in articles:
        c=a[lang]
        soup=BeautifulSoup((ROOT/article_path(a['slug'],lang).strip('/')/'index.html').read_text(),'html.parser')
        hero=soup.select_one('.article-hero img')
        assert hero and hero['src']==a['image']['src']
        assert hero['alt']==a['image']['alt'][lang]
        assert hero.get('loading')!='lazy', 'Hero artwork should not be deferred'
        assert soup.find('meta',property='og:image')['content'].endswith(a['image']['src'])
        assert soup.h1.get_text()==c['title']
        assert soup.select_one('.article-answer p').get_text()==c['answer']
        revised=bool(c.get('editorial_revision'))
        assert len(soup.select('.article-checklist li'))==(0 if revised else len(c['checklist']))
        assert not revised or soup.find(id='short-answer') is None
        assert len(soup.select('.article-related ul a'))==3
        assert len(soup.select('.article-toc a'))==len(c['sections'])+len(c.get('extended_sections',[]))+(1 if c.get('detail_table') else 0)+(0 if revised else 1)
        if c.get('detail_table'):
            assert len(soup.select('#detail-table tbody tr'))==len(c['detail_table']['rows'])
        assert soup.select_one('.article-references a')['href']==a['sources'][0]['url']
        graph=json.loads(soup.find('script',type='application/ld+json').string)['@graph']
        posting=next(n for n in graph if n['@type']=='BlogPosting')
        assert posting['image']['url'].endswith(a['image']['src'])
        assert posting['headline']==c['title']
        assert posting['datePublished']==a['published']
        assert date.fromisoformat(posting['dateModified'])<=date.today()
        assert posting['inLanguage']==lang
        assert posting['author']['@id'].endswith('/#organization')
        assert soup.find('meta',property='og:type')['content']=='article'
        assert any(n['@type']=='BreadcrumbList' for n in graph)
        assert len(soup.select('a[data-fikra-booking]'))==2
print('Article audit passed: 100 distinct topics, 200 language pages, two complete libraries, references, related links, article schema and navigation')
print('Topic counts:',dict(Counter(a['category'] for a in articles)))
