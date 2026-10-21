"""Auditoria estructural conservadora. NO es un escaner antivirus."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET
root = Path(__file__).resolve().parents[1]
assets = root / 'app/src/main/assets'
main = root / 'app/src/main/java/app/margenlisto/mobile/MainActivity.java'
manifest = root / 'app/src/main/AndroidManifest.xml'
assert assets.is_dir() and main.exists() and manifest.exists()
for filename in ['app.js','calc.js','index.html','ledger-core.js','ledger.js','ledger.css',
                 'registro-ventas/index.html','herramientas.js','styles.css']:
    assert (assets/filename).is_file(), filename
for file in assets.rglob('*.js'):
    data=file.read_text(encoding='utf-8')
    assert not re.search(r'\beval\s*\(|new\s+Function\s*\(',data),file
ET.parse(manifest)
root_manifest=ET.parse(manifest).getroot()
assert not root_manifest.findall('uses-permission'), 'Android tiene permisos agregados: revisar'
app=root_manifest.find('application')
assert app is not None
assert app.get('{http://schemas.android.com/apk/res/android}allowBackup')=='false'
text=main.read_text()
assert 'setJavaScriptEnabled(true)' in text
assert 'setAllowFileAccess(false)' in text
assert 'setAllowUniversalAccessFromFileURLs(false)' in text
assert 'WebViewAssetLoader' in text
assert 'setWebContentsDebuggingEnabled(false)' in text
for file in assets.rglob('*.html'):
    html=file.read_text(encoding='utf-8')
    assert '<html' in html.lower() and '</html>' in html.lower(),file
print('Estructura Android: 9 recursos, permisos, WebView y sintaxis XML verificados (auditoria no exhaustiva).')
