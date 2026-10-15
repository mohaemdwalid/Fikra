"""Build a public-files-only upload ZIP for Cloudflare Pages."""
from pathlib import Path
import shutil
import zipfile
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / 'cloudflare-upload'
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
