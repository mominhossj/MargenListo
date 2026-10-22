"""V6 Android project identity smoke: no SDK required. Does not replace real compilation."""
from pathlib import Path
from xml.etree import ElementTree as ET
r=Path(__file__).resolve().parents[1]
s=(r/'app/build.gradle').read_text()
y=(r/'.github/workflows/android-debug.yml').read_text()
manifest=ET.parse(r/'app/src/main/AndroidManifest.xml').getroot()
app=manifest.find('application')
assert "applicationId 'app.margenlisto.mobile'" in s
assert "applicationIdSuffix '.preview'" in s
assert "versionCode 8" in s
assert "versionName '0.6.0-beta'" in s
assert "'MargenListo Beta'" in s and "'MargenListo'" in s
assert app.get('{http://schemas.android.com/apk/res/android}label')=='@string/application_label'
assert "package: name='app.margenlisto.mobile.preview'" in y
assert 'scripts/verify-permissions.py' in y
assert 'sdkVersion:\'26\'' in y and 'targetSdkVersion:\'36\'' in y
assert 'name: MargenListo V6.0' in y
assert 'MargenListo-V6.0-APK-DEBUG-Preview' in y
assert 'google-services.json' not in '\n'.join(p.name for p in r.rglob('*') if p.is_file())
print('V6_ANDROID_CONFIG_OK 12 invariants: preview identity, separate install, CI, labels')
