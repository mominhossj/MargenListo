"""Tests for APK archive validator; these are synthetic ZIPs, NOT APK builds."""
import tempfile, sys, zipfile
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from importlib.machinery import SourceFileLoader
verify_mod=SourceFileLoader('verify_apk',str(Path(__file__).resolve().parents[1]/'scripts/verify-apk.py')).load_module()
EXPECTED=verify_mod.EXPECTED

def make(path,names):
    with zipfile.ZipFile(path,'w') as z:
        for n in names: z.writestr(n,'TEST')

def rejected(path):
    try: verify_mod.verify(path)
    except AssertionError: return True
    return False

with tempfile.TemporaryDirectory() as t:
    f=Path(t)/'fake.zip'
    make(f,EXPECTED)
    verify_mod.verify(f)
    make(f,EXPECTED[:-1]);assert rejected(f),'Should reject missing assets'
    make(f,list(EXPECTED)+['../unsafe.txt']);assert rejected(f),'Should reject traversal'
    make(f,list(EXPECTED)+['assets/_headers']);assert rejected(f),'Should reject unneeded web headers'
    print('APK_VALIDATOR_SPEC_OK: 4 synthetic-archive tests; NOT an APK build or malware scan')
