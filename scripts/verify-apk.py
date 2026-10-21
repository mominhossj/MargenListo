#!/usr/bin/env python3
"""Check package structure; not an antivirus or APK signature validator."""
import sys, zipfile
from pathlib import PurePosixPath

EXPECTED = (
    'AndroidManifest.xml', 'classes.dex',
    'assets/index.html', 'assets/app.js', 'assets/calc.js',
    'assets/ledger-core.js', 'assets/ledger.js',
    'assets/registro-ventas/index.html',
    'assets/calculadora-precio-de-venta/index.html',
    'assets/margen-vs-recargo/index.html',
    'assets/calculadora-descuentos-rentables/index.html',
    'assets/precio-venta-instagram/index.html',
)

def verify(path):
    with zipfile.ZipFile(path) as z:
        bad=z.testzip()
        if bad: raise AssertionError('APK contiene una entrada dañada: '+bad)
        files=set(z.namelist())
        assert len(files)==len(z.namelist()), 'APK contiene nombres repetidos'
        for name in files:
            p=PurePosixPath(name)
            assert not p.is_absolute() and '..' not in p.parts, 'Ruta insegura: '+name
        for name in EXPECTED:
            assert name in files, 'Falta archivo APK: '+name
            assert z.getinfo(name).file_size>0, 'Archivo vacío APK: '+name
        assert not any(n.startswith('assets/_headers') for n in files), 'Cabeceras web innecesarias'
        print('APK_ZIP_OK:', len(files), 'entradas; todos los recursos esperados presentes.')

if __name__=='__main__':
    if len(sys.argv)!=2:
        print('Uso: python scripts/verify-apk.py ruta/al/app-debug.apk',file=sys.stderr);sys.exit(2)
    verify(sys.argv[1])
