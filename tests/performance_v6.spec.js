'use strict';
const assert=require('node:assert/strict');
const c=require('../app/src/main/assets/ledger-core.js');
const base={date:'2026-10-21',product:'Camiseta',channel:'Venta directa',units:1,price:10000,cost:4000,packaging:0,shipping:0,commission:0,discount:0,fixed:0};
const samples=[
 {...base,id:'s_00000001'},
 {...base,id:'s_00000002',product:'CAMISETA',channel:'Marketplace',cost:15000},
 {...base,id:'s_00000003',product:'Gorra',channel:'Instagram/WhatsApp',cost:7000},
 {...base,id:'s_00000004',date:'2026-09-13',product:'Mate',channel:'Venta directa',cost:2000},
];
let count=0;function test(name,fn){fn();count++;}
const original=JSON.stringify(samples);
test('group repeated names case-insensitively',()=>assert.equal(c.performanceByProduct(samples).filter(x=>x.name==='Camiseta').length,1));
test('group profit is precise variable net of included expenses',()=>assert.equal(c.performanceByProduct(samples).find(x=>x.name==='Camiseta').profit,1000));
test('grouped sales count',()=>assert.equal(c.performanceByProduct(samples).find(x=>x.name==='Camiseta').count,2));
test('group ranking by profit',()=>assert.equal(c.performanceByProduct(samples)[0].name,'Mate'));
test('limit 1',()=>assert.equal(c.performanceByProduct(samples,1).length,1));
test('empty products',()=>assert.deepEqual(c.performanceByProduct([]),[]));
test('empty channels',()=>assert.deepEqual(c.performanceByChannel([]),[]));
test('channel order sorted by profit',()=>assert.deepEqual(c.performanceByChannel(samples).map(x=>x.name),['Venta directa','Instagram/WhatsApp','Marketplace']));
test('negative channel',()=>assert.equal(c.performanceByChannel(samples).at(-1).profit,-5000));
test('channels count',()=>assert.equal(c.performanceByChannel(samples).find(x=>x.name==='Venta directa').count,2));
test('month filters change product rankings',()=>assert.equal(c.performanceByProduct(c.filterEntries(samples,{period:'2026-10'}))[0].name,'Gorra'));
test('channel filter shows only selected channel',()=>assert.deepEqual(c.performanceByChannel(c.filterEntries(samples,{channel:'Marketplace'})).map(x=>x.name),['Marketplace']));
test('combined empty filter',()=>assert.deepEqual(c.performanceByProduct(c.filterEntries(samples,{period:'2026-09',channel:'Marketplace'})),[]));
test('reject string as records',()=>assert.throws(()=>c.performanceByProduct('bad'),/Historial/));
test('reject invalid record in products',()=>assert.throws(()=>c.performanceByProduct([{date:'??'}]),/Fecha/));
test('reject invalid record in channels',()=>assert.throws(()=>c.performanceByChannel([{date:'??'}]),/Fecha/));
for(const limit of [-1,0,101,1.5,'1',NaN])test('reject limit '+limit,()=>assert.throws(()=>c.performanceByProduct(samples,limit),/Límite/));
test('source unchanged after both reports',()=>{c.performanceByProduct(samples);c.performanceByChannel(samples);assert.equal(JSON.stringify(samples),original)});
test('export backup compat after insights',()=>assert.equal(c.parseBackup(c.toBackup(samples)).length,4));
test('CSV compatibility',()=>assert.equal(c.toCSV(samples).split('\r\n').length,5));
console.log('PERFORMANCE_V6_OK:',count,'tests');
