from importlib.machinery import SourceFileLoader
from pathlib import Path
mod=SourceFileLoader('permissions_check',str(Path(__file__).resolve().parents[1]/'scripts/verify-permissions.py')).load_module()
P='app.margenlisto.mobile.preview.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'
def reject(text):
    try:mod.check(text);return False
    except ValueError:return True
for text in ['',f"permission: {P}",f"uses-permission: name='{P}'",f"permission: name='{P}'\nuses-permission: name='{P}'"]:
    assert (not text.startswith('permission: '+P)) == (not reject(text)),text
for text in ["uses-permission: name='android.permission.INTERNET'",
             "uses-permission: name='android.permission.CAMERA'",
             "uses-permission: name='android.permission.READ_CONTACTS'",
             "uses-permission: malformed",
             f"uses-permission: name='{P}'\nuses-permission: name='{P}'",
             f"uses-permission: name='{P}'\npermission: name='fake.bad.permission'",
             "uses-permission-sdk-23: name='android.permission.ACCESS_FINE_LOCATION'",
             "uses-permission-sdk-m: name='android.permission.ACCESS_FINE_LOCATION'"]:
    assert reject(text),text
print('V6_PERMISSION_GATE_OK 12 cases')
