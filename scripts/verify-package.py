#!/usr/bin/env python3
"""Conservative preflight. Does not certify malware absence or build success."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,unquote
import re, json, xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'app/src/main/assets'
files={'/'+p.relative_to(ASSETS).as_posix() for p in ASSETS.rglob('*') if p.is_file()}
class Links(HTMLParser):
    def __init__(self): super().__init__();self.urls=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if tag in ('script','link','img'):
            v=d.get('src') if tag in ('script','img') else d.get('href')
            if v:self.urls.append((tag,dict(attrs),v))

n=0
for f in ASSETS.rglob('*.html'):
    parser=Links(); parser.feed(f.read_text(encoding='utf-8'))
    for tag,attrs,value in parser.urls:
        # External canonical, OG and purely navigational links are not runtime resources.
        if tag=='link' and attrs.get('rel') in ('canonical',): continue
        if value.startswith(('data:','https:','http:')):
            raise AssertionError(f'Recurso remoto no cargable offline: {f}: {value}')
        if value.startswith('#'):continue
        path=('/'+(f.parent/ value).resolve().relative_to(ASSETS.resolve()).as_posix()) if not value.startswith('/') else value
        path=unquote(path.split('?')[0].split('#')[0])
        assert path in files,(f,path)
        n+=1

main=(ROOT/'app/src/main/java/app/margenlisto/mobile/MainActivity.java').read_text()
assert 'setJavaScriptEnabled(true)' in main
assert 'setAllowFileAccess(false)' in main
assert 'setAllowContentAccess(false)' in main
assert 'setWebContentsDebuggingEnabled(false)' in main
assert 'setAcceptThirdPartyCookies(webView, false)' in main
assert 'WebViewAssetLoader' in main
manifest=ET.parse(ROOT/'app/src/main/AndroidManifest.xml').getroot()
assert not manifest.findall('uses-permission')
assert manifest.find('application').get('{http://schemas.android.com/apk/res/android}allowBackup')=='false'
assert 'targetSdk 36' in (ROOT/'app/build.gradle').read_text()
print('PREBUILD_OK: referencias locales de recursos=',n, '; sin permisos Android; restricciones WebView presentes.')
