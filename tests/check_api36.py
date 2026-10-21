"""API 36 regression gates; static checks, not a device test."""
from pathlib import Path
import re, xml.etree.ElementTree as ET
root = Path(__file__).resolve().parents[1]
code = (root/'app/src/main/java/app/margenlisto/mobile/MainActivity.java').read_text()
gradle = (root/'app/build.gradle').read_text()
manifest = ET.parse(root/'app/src/main/AndroidManifest.xml').getroot()
android='{http://schemas.android.com/apk/res/android}'
assert 'targetSdk 36' in gradle and 'compileSdk 36' in gradle
assert 'getOnBackInvokedDispatcher()' in code and 'registerOnBackInvokedCallback' in code
assert 'WindowInsetsCompat.Type.systemBars()' in code
assert 'WindowInsetsCompat.Type.displayCutout()' in code
assert 'new WindowInsetsCompat.Builder(windowInsets)' in code and 'Insets.NONE' in code
assert 'setWebContentsDebuggingEnabled(false)' in code
assert manifest.findall('uses-permission') == [], 'No system permissions expected'
assert manifest.find('application').get(android+'usesCleartextTraffic')=='false'
assert not re.search(r'(?i)https?://(?:pistacho|paypal|mercadopago)', (root/'app/src/main/assets/index.html').read_text())
print('API 36 static checks: 9 grupos OK (NOT a compilation or on-device test)')
