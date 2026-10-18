"""Install the owner's Meta Pixel snippet consistently on generated pages."""
from pathlib import Path
from bs4 import BeautifulSoup

SNIPPET = Path(__file__).resolve().parent.parent / 'content/integrations/meta-pixel.html'


def install_meta_pixel(soup):
    # Idempotent across repeated builds and translated copies of the homepage.
    for node in soup.select('#fikra-meta-pixel, #fikra-meta-pixel-noscript'):
        node.decompose()
    snippet = BeautifulSoup(SNIPPET.read_text(), 'html.parser')
    script = snippet.script.extract()
    script['id'] = 'fikra-meta-pixel'
    fallback = snippet.noscript.extract()
    fallback['id'] = 'fikra-meta-pixel-noscript'
    soup.head.append(script)
    soup.body.insert(0, fallback)
    return soup
