from pathlib import Path
from playwright.sync_api import sync_playwright
import re
root=Path(__file__).resolve().parents[1]/'app/src/main/assets'
html=(root/'registro-ventas/index.html').read_text()
html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>', '',html)
html=re.sub(r'<script src="/ledger(?:-core)?\.js" defer></script>', '',html)
html=re.sub(r'<link rel="stylesheet" href="/ledger.css">', '',html)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':390,'height':900},device_scale_factor=2)
 page.goto('about:blank')
 page.evaluate("""() => {const m=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)}});window.confirm=()=>true;}""")
 page.set_content(html);page.add_style_tag(content=(root/'ledger.css').read_text())
 page.add_script_tag(content=(root/'ledger-core.js').read_text())
 page.add_script_tag(content=(root/'ledger.js').read_text())
 for name,channel,price,cost,units in [('Remera básica','Instagram/WhatsApp','18000','8000','2'),('Mate premium','Venta directa','26000','12000','1'),('Funda celular','Marketplace','9800','5400','3')]:
  page.locator('#date').fill('2026-10-22');page.locator('#product').fill(name);page.locator('#channel').select_option(label=channel)
  page.locator('#price').fill(price);page.locator('#cost').fill(cost);page.locator('#units').fill(units)
  page.locator('#save').click()
 page.locator('#channel-filter').select_option('all')
 page.screenshot(path='/mnt/data/MargenListo_V6_Interfaz_Android_Preview.png',full_page=True)
 print('V6 screenshot generated, records=',page.locator('#count').inner_text())
 browser.close()
