"""Render the reviewed article files as static, bilingual knowledge pages."""
from pathlib import Path
from datetime import date
import html
import json
import math
from urllib.parse import urlsplit
from bs4 import BeautifulSoup

CATEGORIES = {
    'websites': {'en': 'Business websites', 'ar': 'مواقع الأعمال'},
    'platforms': {'en': 'Choosing a platform', 'ar': 'اختيار المنصة'},
    'qatar': {'en': 'Doing business in Qatar', 'ar': 'الأعمال في قطر'},
    'scaling': {'en': 'Operations and next steps', 'ar': 'التشغيل والخطوات التالية'},
    'planning': {'en': 'Planning your store', 'ar': 'التخطيط للمتجر'},
    'catalogue': {'en': 'Products and collections', 'ar': 'المنتجات والتصنيفات'},
    'international': {'en': 'Arabic and international selling', 'ar': 'العربية والبيع الدولي'},
    'operations': {'en': 'Payments, delivery and launch', 'ar': 'الدفع والتوصيل والإطلاق'},
    'search': {'en': 'Search visibility and performance', 'ar': 'الظهور في البحث والأداء'},
    'growth': {'en': 'Shopping experience and growth', 'ar': 'تجربة التسوّق والنمو'}
}
TEXT = {
    'en': {'home':'Home','guides':'Website & Shopify guides','heading':'Answers for your website and online business.','intro':'{count} practical guides covering websites, Shopify, platform comparisons and questions relevant to businesses in Qatar.','book':'Request a free call','topics':'Browse by topic','toc':'In this guide','answer':'The short answer','check':'Practical checklist','questions':'A common follow-up question','references':'Official references','related':'Read next','service':'Explore the related FIKRA service','by':'By FIKRA','updated':'Updated','minutes':'min read','scope':'Considering Shopify for your business? Request a free call to discuss your products and priorities. We agree the scope before work starts.','all':'All website and Shopify guides','note':'Information, platform features and local requirements can change. Check the linked official guidance for your circumstances.','skip':'Skip to content','footer':'Shopify design and development.'},
    'ar': {'home':'الرئيسية','guides':'أدلة المواقع وشوبيفاي','heading':'إجابات لموقعك ونشاطك الإلكتروني.','intro':'{count} دليل عملي عن المواقع وشوبيفاي ومقارنة المنصات وأسئلة تهمّ الأعمال في قطر.','book':'اطلب مكالمة مجانية','topics':'تصفّح حسب الموضوع','toc':'في هذا الدليل','answer':'الإجابة المختصرة','check':'قائمة مراجعة عملية','questions':'سؤال مرتبط','references':'مراجع رسمية','related':'اقرأ أيضًا','service':'اكتشف خدمة فكرة المرتبطة بالموضوع','by':'إعداد فكرة','updated':'آخر تحديث','minutes':'دقائق للقراءة','scope':'تفكّر في شوبيفاي لنشاطك؟ ناقش منتجاتك وأولوياتك في استشارة مجانية، ونتّفق على نطاق العمل قبل البدء.','all':'جميع أدلة المواقع وشوبيفاي','note':'قد تتغيّر المعلومات وخصائص المنصات والمتطلّبات المحلية. راجع المراجع الرسمية وفق ظروف نشاطك.','skip':'انتقل إلى المحتوى','footer':'تصميم وتطوير متاجر شوبيفاي.'}
}

def article_path(slug='', lang='en'):
    return ('/ar' if lang == 'ar' else '') + '/articles/' + (slug + '/' if slug else '')

def load_articles(root):
    articles = [json.loads(p.read_text()) for p in sorted((root / 'content/articles').glob('*.json'))]
    slugs = {a['slug'] for a in articles}
    if len(slugs) != len(articles): raise ValueError('Duplicate article slug')
    for a in articles:
        if a['category'] not in CATEGORIES: raise ValueError('Unknown article category')
        if not set(a['related']) <= slugs: raise ValueError('Missing related article')
        for key in ['published', 'modified']: date.fromisoformat(a[key])
        for source in a['sources']:
            url = urlsplit(source['url'])
            if url.scheme != 'https' or url.hostname not in {'help.shopify.com','www.shopify.com','shopify.dev','developers.google.com','developers.openai.com','wordpress.org','developer.wordpress.org','woocommerce.com','support.wix.com','support.squarespace.com','www.moci.gov.qa','ecommerce.gov.qa','www.cra.gov.qa','www.w3.org'}:
                raise ValueError('Article references must use approved primary sources')
        for lang in ['en','ar']:
            c=a[lang]
            if not c['answer'] or len(c['sections']) < 3 or len(c['checklist']) < 3:
                raise ValueError('Incomplete article content: '+a['slug'])
    return articles

def reading_minutes(content):
    pieces=[content['answer'],*[v for row in content['sections'] for v in row],*[v for row in content.get('extended_sections',[]) for v in row]]
    if not content.get('editorial_revision'):
        pieces += [*content['checklist'],*[v for row in content['faq'] for v in row]]
    if content.get('detail_table'):
        table=content['detail_table']; pieces += [table['heading'],*table['columns'],*[v for row in table['rows'] for v in row]]
    text=' '.join(pieces)
    return max(1, math.ceil(len(text.split()) / 200))

def formatted_date(value, lang):
    d=date.fromisoformat(value)
    if lang == 'ar':
        months=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
        return f'{d.day} {months[d.month-1]} {d.year}'
    return d.strftime('%d %B %Y').lstrip('0')

def build_articles(root, origin, metadata, service_links, service_pages):
    articles=load_articles(root)
    by_slug={a['slug']:a for a in articles}
    service_titles={p['slug']:{lang:p[lang]['title'].split(' | ')[0] for lang in ['en','ar']} for p in service_pages}
    e=html.escape
    def shell(lang, body):
        t=dict(TEXT[lang]); t['intro']=t['intro'].format(count=str(len(articles)).translate(str.maketrans('0123456789','٠١٢٣٤٥٦٧٨٩')) if lang=='ar' else len(articles)); home='/ar/' if lang=='ar' else '/'
        return BeautifulSoup(f'''<!DOCTYPE html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/assets/seo.css?v=20261016-blue2"><link rel="stylesheet" href="/assets/articles.css?v=20261016-pagination"><script defer src="/assets/funnel-copy.js"></script><script defer src="/assets/i18n.js?v=seo1"></script><script defer src="/assets/booking-navigation.js?v=seo1"></script><script defer src="/assets/article-search.js?v=2"></script></head><body class="seo-page articles-page"><a class="article-skip" href="#main">{t['skip']}</a><header class="seo-header navbar-wrapper"><a href="{home}" aria-label="{t['home']}"><img src="/assets/fikra-logo.png" width="146" height="48" alt="FIKRA"></a><a href="/book/?lang={lang}" data-fikra-booking>{t['book']}</a></header>{body}<footer><nav class="seo-related" aria-label="{t['service']}">{service_links(lang)}</nav><a href="{home}">{t['home']}</a><a href="{article_path(lang=lang)}">{t['all']}</a><p>© 2026 FIKRA · {t['footer']}</p></footer></body></html>''','html.parser')
    def write(soup,path):
        target=root/path.strip('/')/'index.html'
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_text(str(soup))
    def update_schema(soup, additions):
        tag=soup.find('script',type='application/ld+json')
        data=json.loads(tag.string)
        data['@graph'].extend(additions)
        tag.string=json.dumps(data,ensure_ascii=False).replace('</','<\\/')
    def card(a,lang):
        c=a[lang]
        image = a['image']
        search_terms=e(a['en']['title']+' '+a['ar']['title'],quote=True)
        return f'<article class="article-card" data-category="{a["category"]}" data-search-terms="{search_terms}"><img class="article-card-image" src="{image["src"]}" width="{image["width"]}" height="{image["height"]}" alt="" loading="lazy" decoding="async"/><span class="article-category">{CATEGORIES[a["category"]][lang]}</span><h3><a href="{article_path(a["slug"],lang)}">{e(c["title"])}</a></h3><p>{e(c["answer"])}</p><span class="article-read-time">{reading_minutes(c)} {TEXT[lang]["minutes"]}</span></article>'
    for lang in ['en','ar']:
        t=dict(TEXT[lang]); t['intro']=t['intro'].format(count=str(len(articles)).translate(str.maketrans('0123456789','٠١٢٣٤٥٦٧٨٩')) if lang=='ar' else len(articles)); home='/ar/' if lang=='ar' else '/'
        all_topics='All topics' if lang=='en' else 'كل المواضيع'
        topic_links=f'<a href="#article-results" data-category="">{all_topics}</a>'+''.join(f'<a href="#topic-{key}" data-category="{key}">{value[lang]}</a>' for key,value in CATEGORIES.items())
        groups=''
        for key,value in CATEGORIES.items():
            cards=''.join(card(a,lang) for a in articles if a['category']==key)
            groups+=f'<section class="article-topic" id="topic-{key}"><h2>{value[lang]}</h2><div class="article-card-grid">{cards}</div></section>'
        search_label='Search the guides' if lang=='en' else 'ابحث في الأدلة'
        search_hint='Try Arabic, payment, WordPress or Qatar.' if lang=='en' else 'جرّب العربية أو الدفع أو ووردبريس أو قطر.'
        search=f'<div class="article-search" hidden><label for="guide-search">{search_label}</label><input id="guide-search" type="search" autocomplete="off" aria-describedby="guide-search-help"/><p id="guide-search-help">{search_hint}</p><p class="article-search-status" role="status" aria-live="polite"></p></div>'
        pagination_label='Article pages' if lang=='en' else 'صفحات المقالات'
        pagination=f'<nav class="article-pagination" aria-label="{pagination_label}" hidden></nav>'
        pagination_bottom=f'<nav class="article-pagination" aria-label="{pagination_label} — {"bottom" if lang=="en" else "أسفل القائمة"}" hidden></nav>'
        body=f'<main id="main" class="article-library"><nav aria-label="{t["home"]}"><a href="{home}">{t["home"]}</a> / {t["guides"]}</nav><p class="article-eyebrow">FIKRA / SHOPIFY</p><h1>{t["heading"]}</h1><p class="seo-intro">{t["intro"]}</p>{search}<nav class="article-topics" aria-label="{t["topics"]}">{topic_links}</nav><div id="article-results" tabindex="-1">{pagination}{groups}{pagination_bottom}</div></main>'
        soup=shell(lang,body)
        path=article_path(lang=lang)
        metadata(soup,path,article_path(),article_path(lang='ar'),lang,t['guides']+' | FIKRA',t['intro'])
        schema=json.loads(soup.find('script',type='application/ld+json').string)
        schema['@graph'][2]['@type']='CollectionPage'
        soup.find('script',type='application/ld+json').string=json.dumps(schema,ensure_ascii=False)
        update_schema(soup,[{'@type':'ItemList','@id':origin+path+'#guides','name':t['guides'],'numberOfItems':len(articles),'itemListElement':[{'@type':'ListItem','position':i+1,'name':a[lang]['title'],'url':origin+article_path(a['slug'],lang)} for i,a in enumerate(articles)]}])
        write(soup,path)
        for a in articles:
            c=a[lang]; path=article_path(a['slug'],lang)
            revised = bool(c.get('editorial_revision'))
            display_sections=([c['sections'][-1],*c['sections'][:-1]] if revised else c['sections'])+c.get('extended_sections',[])
            table=c.get('detail_table')
            table_html=''
            table_link=''
            if table:
                heads=''.join(f'<th scope="col">{e(cell)}</th>' for cell in table['columns'])
                rows=''.join('<tr>'+''.join(f'<th scope="row">{e(cell)}</th>' if j==0 else f'<td>{e(cell)}</td>' for j,cell in enumerate(row))+'</tr>' for row in table['rows'])
                table_hint='Swipe across the table to see all columns.' if lang=='en' else 'مرّر الجدول أفقيًا لرؤية جميع الأعمدة.'
                table_html=f'<section id="detail-table"><h2>{e(table["heading"])}</h2><p class="article-table-hint">{table_hint}</p><div class="article-table-wrap" role="region" aria-label="{e(table["heading"],quote=True)}" tabindex="0"><table><thead><tr>{heads}</tr></thead><tbody>{rows}</tbody></table></div></section>'
                table_link=f'<li><a href="#detail-table">{e(table["heading"])}</a></li>'
            section_parts=[f'<section id="section-{i+1}"><h2>{e(h)}</h2><p>{e(p)}</p></section>' for i,(h,p) in enumerate(display_sections)]
            sections=section_parts[0]+table_html+''.join(section_parts[1:])
            toc_parts=[f'<li><a href="#section-{i+1}">{e(h)}</a></li>' for i,(h,p) in enumerate(display_sections)]
            toc=toc_parts[0]+table_link+''.join(toc_parts[1:])
            checklist=''.join(f'<li>{e(item)}</li>' for item in c['checklist'])
            checklist_block = '' if revised else f'<section id="practical-checklist"><h2>{t["check"]}</h2><ul class="article-checklist">{checklist}</ul></section>'
            checklist_link = '' if revised else f'<li><a href="#practical-checklist">{t["check"]}</a></li>'
            faq=''.join(f'<details><summary>{e(q)}</summary><p>{e(answer)}</p></details>' for q,answer in c['faq'])
            faq_block = '' if revised else f'<section><h2>{t["questions"]}</h2>{faq}</section>'
            references=''.join(f'<li><a href="{e(s["url"],quote=True)}">{e(s["title"])} ↗</a></li>' for s in a['sources'])
            related=''.join(f'<li><a href="{article_path(slug,lang)}">{e(by_slug[slug][lang]["title"])}</a></li>' for slug in a['related'])
            if a['service']:
                service_path=('/ar' if lang=='ar' else '')+'/'+a['service']+'/'
                service_name=service_titles[a['service']][lang]
            else:
                service_path=home+'#shopify-projects'
                service_name='See FIKRA’s Shopify work' if lang=='en' else 'شاهد أعمال فكرة على شوبيفاي'
            image = a['image']
            hero = f'<figure class="article-hero"><img src="{image["src"]}" width="{image["width"]}" height="{image["height"]}" alt="{e(image["alt"][lang], quote=True)}" fetchpriority="high" decoding="async"/></figure>'
            byline=f'{t["by"]} · {t["updated"]} <time datetime="{a["modified"]}">{formatted_date(a["modified"],lang)}</time> · {reading_minutes(c)} {t["minutes"]}'
            body=f'''<main id="main"><nav class="article-breadcrumb" aria-label="{'Breadcrumb' if lang=='en' else 'مسار التصفّح'}"><a href="{home}">{t['home']}</a> / <a href="{article_path(lang=lang)}">{t['guides']}</a> / <a href="{article_path(lang=lang)}#topic-{a['category']}">{CATEGORIES[a['category']][lang]}</a></nav><article class="article-content"><p class="article-eyebrow">{CATEGORIES[a['category']][lang]}</p><h1>{e(c['title'])}</h1><p class="article-byline">{byline}</p>{hero}<div class="article-answer article-opening"><p>{e(c['answer'])}</p></div><nav class="article-toc" aria-label="{t['toc']}"><strong>{t['toc']}</strong><ol>{toc}{checklist_link}</ol></nav>{sections}{checklist_block}{faq_block}<section class="article-references"><h2>{t['references']}</h2><ul>{references}</ul></section><aside class="article-related"><h2>{t['related']}</h2><ul>{related}</ul><p><a href="{service_path}">{service_name}</a></p></aside><section class="seo-consult"><h2>{t['book']}</h2><p>{t['scope']}</p><a class="seo-cta" href="/book/?lang={lang}" data-fikra-booking>{t['book']}</a></section></article></main>'''
            soup=shell(lang,body)
            description=c['answer'][:170].rsplit(' ',1)[0]+('…' if len(c['answer'])>170 else '')
            metadata(soup,path,article_path(a['slug']),article_path(a['slug'],'ar'),lang,c['title']+' | FIKRA',description)
            soup.find('meta',property='og:type')['content']='article'
            for prop in ['og:image', 'twitter:image']:
                tag = soup.find('meta',property=prop) or soup.find('meta',attrs={'name':prop})
                tag['content'] = origin + image['src']
            soup.find('meta', property='og:image:alt')['content'] = image['alt'][lang]
            soup.find('meta', attrs={'name':'twitter:card'})['content'] = 'summary_large_image'
            for prop, value in [('og:image:width', str(image['width'])), ('og:image:height', str(image['height'])), ('og:image:type', 'image/webp')]:
                soup.head.append(soup.new_tag('meta', attrs={'property':prop,'content':value}))
            for prop,value in [('article:published_time',a['published']),('article:modified_time',a['modified'])]:
                soup.head.append(soup.new_tag('meta',attrs={'property':prop,'content':value}))
            url=origin+path
            update_schema(soup,[{'@type':'BlogPosting','@id':url+'#article','headline':c['title'],'description':description,'inLanguage':lang,'datePublished':a['published'],'dateModified':a['modified'],'author':{'@id':origin+'/#organization'},'publisher':{'@id':origin+'/#organization'},'mainEntityOfPage':{'@id':url+'#webpage'},'url':url,'image':{'@type':'ImageObject','url':origin+image['src'],'width':image['width'],'height':image['height'],'caption':image['alt'][lang]},'articleSection':CATEGORIES[a['category']][lang],'citation':[s['url'] for s in a['sources']]}, {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':t['home'],'item':origin+home},{'@type':'ListItem','position':2,'name':t['guides'],'item':origin+article_path(lang=lang)},{'@type':'ListItem','position':3,'name':c['title'],'item':url}]}])
            write(soup,path)
    print(f'Built {len(articles)} articles in English and Arabic, plus two library pages')
    return [(article_path(),article_path(lang='ar'))]+[(article_path(a['slug']),article_path(a['slug'],'ar')) for a in articles]
