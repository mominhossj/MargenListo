#!/usr/bin/env python3
"""Strict allowlist for `aapt dump permissions` of the MargenListo V6 debug APK.

This checks the names declared/requested by the APK. It is not an antivirus scan.
The AndroidX dynamic-receiver permission is expected once in each section.
"""
import re
import sys
from pathlib import Path

PACKAGE = 'app.margenlisto.mobile.preview'
ALLOW = PACKAGE + '.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'
NAME = re.compile(r"[A-Za-z_][A-Za-z_0-9]*(?:\.[A-Za-z_][A-Za-z_0-9]*)+")
USES = re.compile(r"uses-permission(?:-sdk-(?:[0-9]+|m))?:\s*name='([^']+)'", re.I)
DECLARED_WITH_NAME = re.compile(r"permission:\s*name='([^']+)'", re.I)
DECLARED_BARE = re.compile(r"permission:\s*([A-Za-z_][A-Za-z_0-9]*(?:\.[A-Za-z_][A-Za-z_0-9]*)+)", re.I)

def check(report: str) -> None:
    requests = []
    declares = []
    for raw in report.splitlines():
        line = raw.strip()
        if line.startswith('uses-permission'):
            m = USES.fullmatch(line)
            if m is None or NAME.fullmatch(m.group(1)) is None:
                raise ValueError('Formato inesperado de permiso solicitado: ' + line[:300])
            requests.append(m.group(1))
        elif line.startswith('permission:'):
            # `aapt dump permissions` prints declaration as `permission: com.example.X`
            # but some versions print `permission: name='com.example.X'`.
            m = DECLARED_WITH_NAME.fullmatch(line) or DECLARED_BARE.fullmatch(line)
            if m is None or NAME.fullmatch(m.group(1)) is None:
                raise ValueError('Formato inesperado de permiso declarado: ' + line[:300])
            declares.append(m.group(1))

    # V6 debug must request and declare precisely the same known AndroidX
    # signature permission; no other requested or declared permissions allowed.
    if requests != [ALLOW] or declares != [ALLOW]:
        raise ValueError('Permisos no autorizados, faltantes o duplicados: '
                         + 'solicitados=' + repr(requests)
                         + '; declarados=' + repr(declares))
    print('PERMISOS_V6_OK: permiso interno AndroidX solicitado y declarado, sin otros permisos.')

if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('Uso: python3 scripts/verify-permissions.py ruta/permisos.txt')
    try:
        check(Path(sys.argv[1]).read_text(encoding='utf-8'))
    except (ValueError, OSError) as e:
        sys.exit('ERROR: ' + str(e))
