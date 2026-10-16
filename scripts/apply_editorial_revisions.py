"""Apply the reviewed article openings, Arabic questions and practical explanations."""
from pathlib import Path
from datetime import date
import json
ROOT=Path(__file__).resolve().parent.parent
paths=sorted((ROOT/'content/editorial-revisions').glob('*.json'))
articles={p.stem for p in (ROOT/'content/articles').glob('*.json')}
followups=json.loads((ROOT/'content/editorial-followups.json').read_text())
assert {p.stem for p in paths} == articles, 'The editorial pass must cover the whole collection'
assert set(followups) == articles, 'Practical followups must cover the whole collection'
for revision_path in paths:
    revision=json.loads(revision_path.read_text())
    path=ROOT/'content/articles'/f'{revision["slug"]}.json'
    article=json.loads(path.read_text())
    for lang in ['en','ar']:
        content=article[lang]
        previous=content.get('editorial_detail_heading')
        if previous:
            content['sections']=[row for row in content['sections'] if row[0]!=previous]
        heading=revision['heading_'+lang]
        content['answer']=revision['lead_'+lang]
        content['sections'].append([heading,revision['detail_'+lang]])
        content['editorial_detail_heading']=heading
        content['editorial_revision']='2026-10-16'
        previous_followup=content.get('editorial_followup_heading')
        extended=[row for row in content.get('extended_sections',[]) if row[0]!=previous_followup]
        extended.append(followups[article['slug']][lang])
        content['extended_sections']=extended
        content['editorial_followup_heading']=followups[article['slug']][lang][0]
    article['ar']['title']=revision['title_ar']
    article['modified']=date.today().isoformat()
    path.write_text(json.dumps(article,ensure_ascii=False,indent=2)+'\n')
print(f'Applied {len(paths)} bilingual editorial revisions')
