"""Chromium smoke test for offline packaged assets (not Android WebView certification)."""
from pathlib import Path
from urllib.parse import urlparse, unquote
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]/'app/src/main/assets'
paths={ '/' + p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*') if p.is_file() }
site='https://appassets.androidplatform.net'
for route in ['/','/registro-ventas/','/calculadora-descuentos-rentables/','/calculadora-precio-de-venta/','/precio-venta-instagram/','/margen-vs-recargo/']:
 assert route in ('/',) or route+'index.html' in paths

def normalize(path):
 if path == '/': path='/index.html'
 elif path.endswith('/'): path+='index.html'
 elif path+'/index.html' in paths: path+='/index.html'
 return path if path in paths else None

def handler(route):
 from mimetypes import guess_type
 u=urlparse(route.request.url)
 p=normalize(unquote(u.path)) if u.hostname=='appassets.androidplatform.net' and u.scheme=='https' else None
 if p is None: route.fulfill(status=404,body='Blocked by test network policy'); return
 content=(ROOT/p.lstrip('/')).read_bytes()
 mime=guess_type(p)[0] or 'application/octet-stream'
 if p.endswith('.js'): mime='text/javascript'
 route.fulfill(status=200,body=content,content_type=mime)

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width in [390,1280]:
  context=browser.new_context(viewport={'width':width,'height':844},accept_downloads=True)
  page=context.new_page()
  errors=[]
  page.on('pageerror',lambda e: errors.append(str(e)))
  page.route('**/*',handler)
  resp=page.goto(site+'/index.html',wait_until='load',timeout=20000)
  assert resp.status==200
  assert page.locator('#price').inner_text() not in ('—','')
  page.locator('a[href="/registro-ventas/"]').click()
  page.wait_for_url('**/registro-ventas/')
  assert page.locator('#sale-form').count()==1
  page.locator('#product').fill('Remera de prueba')
  page.locator('#units').fill('2')
  page.locator('#price').fill('20000')
  page.locator('#cost').fill('10000')
  page.locator('#commission').fill('10')
  page.locator('#discount').fill('5')
  page.locator('#packaging').fill('0')
  page.locator('#shipping').fill('0')
  page.locator('#fixed').fill('0')
  page.locator('#save').click()
  assert page.locator('#records tr').count()==1, page.locator('#notice').inner_text()
  assert 'Remera de prueba' in page.locator('#records').inner_text()
  assert page.locator('#count').inner_text()=='1'
  page.reload(wait_until='load')
  assert page.locator('#count').inner_text()=='1', 'LocalStorage did not persist'
  with page.expect_download(timeout=10000) as dl:
   page.locator('#export-csv').click()
  assert dl.value.suggested_filename=='margenlisto-ventas.csv'
  with page.expect_download(timeout=10000) as dl:
   page.locator('#export-json').click()
  assert dl.value.suggested_filename=='margenlisto-respaldo.json'
  page.locator('a[href="/"]').first.click()
  page.wait_for_url(site+'/')
  assert page.locator('#price').count()==1
  for p in ['/calculadora-descuentos-rentables/','/calculadora-precio-de-venta/','/precio-venta-instagram/','/margen-vs-recargo/']:
   response=page.goto(site+p,wait_until='load')
   assert response.status==200,(p,response.status)
   assert page.locator('body').inner_text().strip()
  assert not errors, errors
  print(f'PASS Chromium {width}px: rutas, calculadora, ledger, persistencia, CSV, JSON, 4 guías; JS errors=0')
  context.close()
 browser.close()
