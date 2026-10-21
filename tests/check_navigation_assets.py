"""Verify all offline HTML/CSS asset references are packaged and routable."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, urljoin
import re

assets=Path(__file__).resolve().parents[1]/'app/src/main/assets'
known={'/'+p.relative_to(assets).as_posix() for p in assets.rglob('*') if p.is_file()}
entries=0
errors=[]
class Parser(HTMLParser):
 def __init__(self): super().__init__();self.items=[]
 def handle_starttag(self,tag,attrs):
  att=dict(attrs)
  for key in (('href',) if tag in ('link','a') else ('src',) if tag in ('script','img') else ()):
   if key in att:self.items.append((tag,att.get('rel',''),att[key]))

def localize(url,base):
 if not url or url.startswith(('#','data:','mailto:','tel:')):return None
 u=urlsplit(urljoin(base,url))
 if u.scheme not in ('https','http') or u.netloc=='margenlisto.pages.dev': return None
 # The Android offline site resolves root paths under its reserved appassets host.
 if u.netloc=='appassets.androidplatform.net':return u.path
 return None

for f in assets.rglob('*.html'):
 base='https://appassets.androidplatform.net/'+f.relative_to(assets).as_posix()
 parser=Parser();parser.feed(f.read_text(encoding='utf-8'))
 for tag,rel,url in parser.items:
  # Marketing metadata can link to the web; it is not loaded in WebView as an asset.
  if tag=='link' and ('canonical' in rel or 'alternate' in rel): continue
  path=localize(url,base)
  if path is None:continue
  if path=='/':path='/index.html'
  elif path.endswith('/'):path+='index.html'
  if path not in known:errors.append(f'{f.relative_to(assets)}: missing {url} resolved to {path}')
  entries+=1
for css in assets.rglob('*.css'):
 for raw in re.findall(r'url\(\s*[\'\"]?([^\)\'\"]+)',css.read_text(encoding='utf-8')):
  path=localize(raw,'https://appassets.androidplatform.net/'+css.relative_to(assets).as_posix())
  if path and path not in known:errors.append(f'{css.name}: missing resource {raw}')
  entries+=1
if errors:raise SystemExit('\n'.join(errors))
print(f'OK: {entries} packaged HTML/CSS references and routes')
