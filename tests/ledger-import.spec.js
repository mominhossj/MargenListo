'use strict';
// Browser-independent DOM harness for the Android native backup callback.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const core = require('../app/src/main/assets/ledger-core.js');
const listeners = {};
const byId = new Map();
class E {
  constructor(tag='div'){this.tagName=tag;this.textContent='';this.value='';this.hidden=false;this.disabled=false;this.children=[];this.style={};this.className='';this.classList={toggle(){}};}
  addEventListener(event,handler){listeners[(this.id||this.tagName)+':'+event]=handler;}
  append(...v){this.children.push(...v)}
  replaceChildren(...v){this.children=[...v]}
  setAttribute(k,v){this[k]=v}
  focus(){}
}
function el(id){if(!byId.has(id)){const x=new E();x.id=id;byId.set(id,x)}return byId.get(id)}
const stored=new Map();
const window={MargenLedger:core,confirm:()=>true};
const sandbox={window,document:{getElementById:el,createElement:t=>new E(t)},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},Intl, Date, Set, Math, String, JSON, Number, Error, setTimeout:()=>1,clearTimeout:()=>{}};
const js=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/ledger.js'),'utf8');
vm.runInNewContext(js,sandbox,{filename:'ledger.js'});
assert.equal(typeof window.MargenListoNativeImportBackup,'function');
assert.equal(byId.get('count').textContent,'0');
const row={id:'v_aabbccddeeff',date:'2026-10-20',product:'Remera',channel:'Venta directa',units:2,price:20000,cost:11000,packaging:200,shipping:0,commission:10,discount:5,fixed:0};
const backup=core.toBackup([row]);
const done=window.MargenListoNativeImportBackup(backup);
assert.equal(typeof done,'object'); // synchronous async function returns promise
Promise.resolve(done).then(async()=>{
  const saved=JSON.parse(stored.get('margenlisto_ventas_v1'));
  assert.equal(saved.length,1);
  assert.equal(saved[0].product,'Remera');
  assert.equal(byId.get('count').textContent,'1');
  assert.equal(byId.get('revenue').textContent.includes('38.000'),true);
  await window.MargenListoNativeImportBackup('{invalid');
  assert.deepEqual(JSON.parse(stored.get('margenlisto_ventas_v1')),saved);
  await window.MargenListoNativeImportBackup(JSON.stringify({kind:'MargenListoLedger',version:1,entries:[{...row,product:'=HYPERLINK("x")',cost:-1}]}));
  assert.deepEqual(JSON.parse(stored.get('margenlisto_ventas_v1')),saved);
  console.log('LEDGER_IMPORT_OK: 6 native/WebView import checks');
}).catch(e=>{console.error(e);process.exitCode=1});
