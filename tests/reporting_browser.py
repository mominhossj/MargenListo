"""Headless Chromium DOM smoke on exact bundled HTML/JS/CSS; NOT Android WebView certification.
    Works without localhost by loading the app into an isolated about:blank document.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re
ROOT=Path(__file__).resolve().parents[1]/'app/src/main/assets'
html=(ROOT/'registro-ventas/index.html').read_text()
# Inline browser harness: remove production CSP and external tags ONLY in test document.
html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>', '',html)
html=re.sub(r'<script src="/ledger(?:-core)?\.js" defer></script>', '',html)
html=re.sub(r'<link rel="stylesheet" href="/ledger.css">', '',html)
core=(ROOT/'ledger-core.js').read_text()
ui=(ROOT/'ledger.js').read_text()
css=(ROOT/'ledger.css').read_text()
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in (390,1280):
  page=b.new_page(viewport={'width':width,'height':920},accept_downloads=True)
  page.goto('about:blank')
  page.evaluate("""() => {const values=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)}});window.confirm=()=>true;}""")
  page.set_content(html,wait_until='load')
  page.add_style_tag(content=css)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.add_script_tag(content=core)
  page.add_script_tag(content=ui)
  assert page.locator('#count').inner_text()=='0'
  assert page.locator('#period-filter option').count()==1
  page.locator('#date').fill('2026-09-20')
  page.locator('#product').fill('Remera de ejemplo')
  page.locator('#save').click()
  assert page.locator('#count').inner_text()=='1',page.locator('#notice').inner_text()
  page.locator('#date').fill('2026-10-21')
  page.locator('#product').fill('Gorra')
  page.locator('#channel').select_option(label='Marketplace')
  page.locator('#save').click()
  assert page.locator('#count').inner_text()=='2',page.locator('#notice').inner_text()
  assert page.locator('#monthly-rows tr').count()==2
  assert page.locator('#period-filter option').count()==3
  page.locator('#period-filter').select_option('2026-10')
  assert page.locator('#count').inner_text()=='1'
  assert page.locator('#records tr').count()==1
  assert 'Gorra' in page.locator('#records').inner_text()
  page.locator('#channel-filter').select_option('Venta directa')
  assert page.locator('#count').inner_text()=='0'
  assert page.locator('#export-filtered').is_disabled()
  assert page.locator('#export-json').is_enabled()
  page.locator('#channel-filter').select_option('Marketplace')
  assert page.locator('#count').inner_text()=='1'
  with page.expect_download(timeout=15000) as evt:
   page.locator('#export-filtered').click()
  d=evt.value
  assert d.suggested_filename=='margenlisto-vista-filtrada.csv'
  path=d.path()
  csv=Path(path).read_text(encoding='utf-8-sig')
  assert 'Gorra' in csv and 'Remera de ejemplo' not in csv
  with page.expect_download(timeout=15000) as evt:
   page.locator('#export-json').click()
  assert evt.value.suggested_filename=='margenlisto-respaldo.json'
  assert page.locator('#monthly-rows tr').count()==2
  overflow=page.evaluate('document.body.scrollWidth - window.innerWidth')
  assert overflow<12, ('horizontal overflow',width,overflow)
  assert not errors,errors
  out=Path('/mnt/data/MargenListo_Android_V5_7_CANDIDATA')/f'QA_Registro_V5_7_{width}.png'
  page.screenshot(path=str(out),full_page=True)
  print('BROWSER_OK:',width,'px; save/filter/month-table/CSV-backup/viewport; errors=0')
  page.close()
 b.close()
