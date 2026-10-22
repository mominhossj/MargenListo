"""Regression tests for actual `aapt dump permissions` format, V6 preview."""
from importlib.machinery import SourceFileLoader
from pathlib import Path
mod = SourceFileLoader('permissions_check', str(Path(__file__).resolve().parents[1] / 'scripts/verify-permissions.py')).load_module()
P = 'app.margenlisto.mobile.preview.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'

def rejected(report: str) -> bool:
    try:
        mod.check(report)
    except ValueError:
        return True
    return False

valid = [
    # Exact real-world lines surfaced in GitHub Actions log.
    f'package: app.margenlisto.mobile.preview\npermission: {P}\nuses-permission: name=\'{P}\'',
    f'permission: name=\'{P}\'\nuses-permission: name=\'{P}\'',
    f'  permission: {P}  \n  uses-permission: name=\'{P}\'  ',
]
for i, report in enumerate(valid, 1):
    assert not rejected(report), f'Valid report {i} rejected: {report}'

invalid = [
    '',
    f'permission: {P}',  # required uses-permission missing
    f'uses-permission: name=\'{P}\'',  # required declaration missing
    'uses-permission: name=\'android.permission.INTERNET\'',
    'uses-permission: name=\'android.permission.CAMERA\'',
    'uses-permission: name=\'android.permission.READ_CONTACTS\'',
    f'permission: {P}\nuses-permission: name=\'{P}\'\nuses-permission: name=\'android.permission.INTERNET\'',
    f'permission: {P}\npermission: {P}\nuses-permission: name=\'{P}\'',
    f'permission: {P}\nuses-permission: name=\'{P}\'\nuses-permission: name=\'{P}\'',
    f'permission: name=\'fake.bad.permission\'\nuses-permission: name=\'{P}\'',
    f'permission: {P}\nuses-permission: malformed',
    f'permission: {P}\nuses-permission-sdk-23: name=\'android.permission.ACCESS_FINE_LOCATION\'',
    f'permission: {P}\nuses-permission-sdk-m: name=\'android.permission.ACCESS_FINE_LOCATION\'',
    f'permission: name=\'{P}\' with-garbage\nuses-permission: name=\'{P}\'',
    f'permission: {P} with-garbage\nuses-permission: name=\'{P}\'',
    f'permission: {P}\nuses-permission: name=\'{P}\' with-garbage',
    f'permission: {P}.EVIL\nuses-permission: name=\'{P}\'',
    f'permission: {P}\nuses-permission: name=\'{P}.EVIL\'',
]
for i, report in enumerate(invalid, 1):
    assert rejected(report), f'Invalid report {i} accepted: {report}'
print(f'V6_PERMISSION_GATE_OK: {len(valid)} valid / {len(invalid)} invalid scenarios')
