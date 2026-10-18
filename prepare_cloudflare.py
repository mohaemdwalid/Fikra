"""Build a public-files-only upload ZIP for Cloudflare Pages."""
from pathlib import Path
import shutil
import zipfile
import subprocess
import sys
import json
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / 'cloudflare-upload'
subprocess.run([sys.executable, str(ROOT / 'scripts/build_seo.py')], check=True)
# Remove stale assets from previous builds, including retired integrations.
if OUTPUT.exists():
    shutil.rmtree(OUTPUT)
OUTPUT.mkdir()
html = BeautifulSoup((ROOT / 'index.html').read_text(), 'html.parser')

(OUTPUT / 'index.html').write_text(str(html))

assets = ROOT / 'assets'
files = [OUTPUT / 'index.html']
(OUTPUT / 'book').mkdir()
booking_page = OUTPUT / 'book/index.html'
shutil.copy2(ROOT / 'book/index.html', booking_page)
files.append(booking_page)
# Ship every generated language/service page and crawler control file.
slugs = [page['slug'] for page in json.loads((ROOT / 'seo-content.json').read_text())]
for directory in ['en', 'ar', 'articles', *slugs]:
    for source in sorted((ROOT / directory).rglob('*.html')):
        destination = OUTPUT / source.relative_to(ROOT)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        files.append(destination)
for name in ['robots.txt', 'sitemap.xml', '_headers']:
    destination = OUTPUT / name
    shutil.copy2(ROOT / name, destination)
    files.append(destination)
for source in sorted(assets.rglob('*')):
    if not source.is_file() or source.name.startswith('.'):
        continue
    # Preserve the source recording locally; only ship its web-optimised copy.
    if source.name == 'client-store-recording.mp4':
        continue
    if source.stat().st_size >= 25 * 1024 * 1024:
        raise ValueError(f'File exceeds Cloudflare Pages limit: {source.name}')
    destination = OUTPUT / source.relative_to(ROOT)
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
    files.append(destination)
if len(files) > 1000:
    raise ValueError('More than 1000 files; use the CLI instead of dashboard upload.')
archive = ROOT / 'fikra-cloudflare-upload.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as zip_file:
    for file in files:
        zip_file.write(file, file.relative_to(OUTPUT))
print(f'Static-assets ZIP: {archive} (Workers deployment requires the API and D1 binding in wrangler.jsonc)')
print(f'{len(files)} public files; {archive.stat().st_size / 1048576:.1f} MiB ZIP')
