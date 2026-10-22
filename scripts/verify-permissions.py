#!/usr/bin/env python3
"""Fail-closed check of aapt dump permissions for Android beta builds.
This is an allowlist, not an antivirus assessment or runtime security certification.
"""
import re, sys
from pathlib import Path

PACKAGE = 'app.margenlisto.mobile.preview'
ALLOW = PACKAGE + '.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'
PERMISSION = re.compile(r"^(?:uses-permission(?::|-sdk-[0-9]+:)?|permission:).*name='([^']+)'",re.I)

def check(report:str):
    requests=[]; declares=[]
    for raw in report.splitlines():
        line=raw.strip()
        if line.startswith('uses-permission') or line.startswith('permission:'):
            m=PERMISSION.fullmatch(line)
            if not m: raise ValueError('Formato inesperado para permiso: '+line[:300])
            (declares if line.startswith('permission:') else requests).append(m.group(1))
    all_perms=requests+declares
    if any(p != ALLOW for p in all_perms):
        raise ValueError('Permisos no autorizados: '+repr(all_perms))
    if len(requests)>1 or len(declares)>1:
        raise ValueError('Permisos duplicados inesperados')
    print('PERMISOS_V6_OK:',len(requests),'solicitados;',len(declares),'declarados; solo permiso interno AndroidX o ninguno')

if __name__=='__main__':
    if len(sys.argv)!=2: sys.exit('Uso: python scripts/verify-permissions.py ruta/permisos.txt')
    try: check(Path(sys.argv[1]).read_text(encoding='utf-8'))
    except (ValueError, OSError) as e: sys.exit('ERROR: '+str(e))
