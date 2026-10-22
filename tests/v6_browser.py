"""V6 UI tests on bundled HTML/JS in Chromium with isolated storage. Not real WebView."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re
ROOT=Path(__file__).resolve().parents[1]/'app/src/main/assets'
html=(ROOT/'registro-ventas/index.html').read_text()
html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>', '',html)
html=re.sub(r'<script src="/ledger(?:-core)?\.js" defer></script>', '',html)
html=re.sub(r'<link rel="stylesheet" href="/ledger.css">', '',html)
core=(ROOT/'ledger-core.js').read_text();ui=(ROOT/'ledger.js').read_text();css=(ROOT/'ledger.css').read_text()
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in (360,390,768,1280):
  page=browser.new_page(viewport={'width':width,'height':900},accept_downloads=True)
  page.goto('about:blank')
  page.evaluate("""() => { const storage=new Map(); Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}}); window.confirm=()=>true; }""")
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load');page.add_style_tag(content=css)
  page.add_script_tag(content=core);page.add_script_tag(content=ui)
  assert page.locator('#count').inner_text()=='0'
  assert page.locator('#product-insight-empty').is_visible()
  page.locator('#date').fill('2026-10-22')
  page.locator('#product').fill('Remera')
  page.locator('#save').click()
  assert page.locator('#count').inner_text()=='1'
  assert page.locator('#product-insight-rows tr').count()==1
  assert page.locator('#channel-insight-rows tr').count()==1
  orig=page.evaluate("localStorage.getItem('margenlisto_ventas_v1')")
  page.locator('#records .repeat').first.click()
  assert page.locator('#product').input_value()=='Remera'
  assert page.locator('#price').input_value()=='15000'
  assert page.locator('#count').inner_text()=='1', 'Repeat should not auto-save'
  assert page.evaluate("localStorage.getItem('margenlisto_ventas_v1')")==orig
  page.locator('#product').fill('Gorra')
  page.locator('#channel').select_option(label='Marketplace')
  page.locator('#cost').fill('20000')
  page.locator('#save').click()
  assert page.locator('#count').inner_text()=='2'
  assert page.locator('#product-insight-rows tr').count()==2
  assert page.locator('#channel-insight-rows tr').count()==2
  assert 'Gorra' in page.locator('#product-insight-rows').inner_text()
  page.locator('#channel-filter').select_option('Marketplace')
  assert page.locator('#product-insight-rows tr').count()==1
  assert 'Remera' not in page.locator('#product-insight-rows').inner_text()
  page.locator('#channel-filter').select_option('all')
  # Prevent a product name from injecting HTML when rendered.
  page.locator('#product').fill('<img src=x onerror=alert(1)>')
  page.locator('#channel').select_option(label='Venta directa')
  page.locator('#cost').fill('10000')
  page.locator('#save').click()
  assert '<img' in page.locator('#product-insight-rows').inner_text()
  assert page.locator('#product-insight-rows img').count()==0
  with page.expect_download() as evt:page.locator('#export-json').click()
  assert evt.value.suggested_filename=='margenlisto-respaldo.json'
  assert not errors,errors
  overflow=page.evaluate('document.body.scrollWidth-window.innerWidth')
  assert overflow<=12, (width,overflow)
  if width==390:
   output=Path('/mnt/data/MargenListo_V6_Registro_390.png')
   page.screenshot(path=str(output),full_page=True)
  print('V6_BROWSER_OK',width,'px repeat/insights/filter/export/XSS; errors=0')
  page.close()
 browser.close()
