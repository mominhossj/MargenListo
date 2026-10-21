'use strict';
const assert=require('node:assert/strict');const core=require('../app/src/main/assets/ledger-core.js');
let n=0;function test(fn){fn();n++;}
const sample={date:'2026-10-21',product:'Remera',channel:'Instagram/WhatsApp',units:2,price:20000,cost:10000,packaging:500,shipping:1000,commission:10,discount:10,fixed:200};
test(()=>{const r=core.calc(sample);assert.equal(r.revenue,36000);assert.equal(r.expenses,25800);assert.equal(r.profit,10200);assert.equal(r.margin,10200/36000);assert.equal(r.status,'RENTABLE');});
test(()=>{const r=core.calc({...sample,price:10000,cost:15000});assert.equal(r.status,'PÉRDIDA');assert.ok(r.margin<0);});
test(()=>{const r=core.calc({...sample,discount:99.99,commission:100});assert.ok(r.profit<0);assert.ok(Number.isFinite(r.margin));});
test(()=>{const r=core.calc({...sample,price:9000,cost:8000,commission:0,discount:0,shipping:0,packaging:0,fixed:0});assert.ok(r.profit>0);});
test(()=>{const v=core.summarize([sample,{...sample,price:10000,cost:15000}]);assert.equal(v.count,2);assert.equal(v.units,4);assert.equal(v.losses,1);});
for(const key of ['price','cost','packaging','shipping','fixed','commission','discount']){
  test(()=>assert.throws(()=>core.validate({...sample,[key]:-1}),/invalid|inválido|fuera/i));
  test(()=>assert.throws(()=>core.validate({...sample,[key]:Infinity}),/invalid|inválido|fuera/i));
  test(()=>assert.throws(()=>core.validate({...sample,[key]:'NaN'}),/invalid|inválido|fuera/i));
}
for(const d of ['2026-02-30','2026-13-01','2026-2-01','blah','2000-01-01']) test(()=>assert.throws(()=>core.validate({...sample,date:d}),/Fecha/));
for(const u of [0,-1,1.5,1001])test(()=>assert.throws(()=>core.validate({...sample,units:u}),/Unidades|inválido/));
for(const dc of [100,101,1000])test(()=>assert.throws(()=>core.validate({...sample,discount:dc})));
for(const cp of [101,150])test(()=>assert.throws(()=>core.validate({...sample,commission:cp})));
test(()=>assert.throws(()=>core.validate({...sample,product:''}),/Producto/));
test(()=>assert.throws(()=>core.validate({...sample,product:'x'.repeat(81)}),/Producto/));
test(()=>assert.throws(()=>core.validate({...sample,channel:'hack'}),/Canal/));
test(()=>assert.equal(core.safeCell('=HYPERLINK("x")'),"\"'=HYPERLINK(\"\"x\"\")\""));
test(()=>assert.ok(core.toCSV([{...sample,product:'=1+1'}]).includes("'=1+1")));
test(()=>{let doc=core.toBackup([{...sample,id:'v_12345678'}]);let rows=core.parseBackup(doc);assert.equal(rows.length,1);assert.equal(rows[0].price,sample.price);});
test(()=>assert.throws(()=>core.parseBackup('{oops'),/JSON/));
test(()=>assert.throws(()=>core.parseBackup(JSON.stringify({kind:'Other',version:1,entries:[]})),/Formato/));
test(()=>assert.throws(()=>core.parseBackup(JSON.stringify({kind:'MargenListoLedger',version:1,entries:[{...sample,id:'--'}]})),/ID/));
console.log('CORE OK:',n,'tests');
