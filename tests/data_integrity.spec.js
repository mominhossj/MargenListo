'use strict';
// Data-loss regression: corrupt data must never be silently dropped/overwritten.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const core=require('../app/src/main/assets/ledger-core');
const listeners={},byId=new Map(),stored=new Map();
class E {
 constructor(t='div'){this.tagName=t;this.textContent='';this.value='';this.hidden=false;this.disabled=false;this.children=[];this.className='';this.classList={toggle(){}};}
 addEventListener(n,f){listeners[(this.id||this.tagName)+':'+n]=f;}
 append(...items){this.children.push(...items);}replaceChildren(...items){this.children=[...items];}
 setAttribute(k,v){this[k]=v;}focus(){}
}
function el(id){if(!byId.has(id)){const node=new E();node.id=id;byId.set(id,node);}return byId.get(id);}
const key='margenlisto_ventas_v1';
const good={id:'old_12345678',date:'2026-10-20',product:'Test',channel:'Venta directa',units:1,price:100,cost:20,packaging:0,shipping:0,commission:0,discount:0,fixed:0};
// A malformed row should lock recording, not delete records.
const raw='[{"id":"x", "date":"2026-10-20", "product":"no valid"}]';
stored.set(key,raw);
const window={MargenLedger:core,confirm:()=>true};
const sandbox={window,document:{getElementById:el,createElement:t=>new E(t)},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},Intl,Date,Set,Math,String,JSON,Number,Error,setTimeout:()=>1,clearTimeout:()=>{}};
const script=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/ledger.js'),'utf8');
vm.runInNewContext(script,sandbox,{filename:'ledger.js'});
assert.equal(el('save').disabled,true);
assert.equal(el('count').textContent,'0');
assert.equal(stored.get(key),raw);
const event={preventDefault(){}};
listeners['sale-form:submit'](event);
assert.equal(stored.get(key),raw);
assert.equal(el('save').disabled,true);
Promise.resolve(window.MargenListoNativeImportBackup(core.toBackup([good]))).then(()=>{
 const parsed=JSON.parse(stored.get(key));
 assert.equal(parsed.length,1);
 assert.equal(parsed[0].id,'old_12345678');
 assert.equal(el('save').disabled,false);
 assert.equal(el('count').textContent,'1');
 // Rendering multiple times must not corrupt saved data.
 listeners['period-filter:change']();
 assert.equal(stored.get(key),JSON.stringify(parsed));
 console.log('DATA_INTEGRITY_OK: 9 assertions');
}).catch(e=>{console.error(e);process.exitCode=1});
