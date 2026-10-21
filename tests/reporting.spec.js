// Reporting rules for V5.7. No DOM, network, or Android SDK needed.
'use strict';
const assert=require('node:assert/strict');
const c=require('../app/src/main/assets/ledger-core');
let count=0;function t(label,fn){fn();count++;}
const basic={date:'2026-10-01',product:'Remera',channel:'Venta directa',units:1,price:10000,cost:4000,packaging:100,shipping:0,commission:0,discount:0,fixed:0};
const cases=[{...basic,id:'v_202610a1'},{...basic,id:'v_202609a1',date:'2026-09-30',channel:'Marketplace',cost:12000},{...basic,id:'v_202610b1',date:'2026-10-20',channel:'Instagram/WhatsApp',units:2,price:20000,cost:10000,discount:5}];
const before=JSON.stringify(cases);
t('available sorted months',()=>assert.deepEqual(c.availableMonths(cases),['2026-10','2026-09']));
t('empty months',()=>assert.deepEqual(c.availableMonths([]),[]));
t('all filters preserve length',()=>assert.equal(c.filterEntries(cases).length,3));
t('October filter',()=>assert.equal(c.filterEntries(cases,{period:'2026-10'}).length,2));
t('September filter',()=>assert.equal(c.filterEntries(cases,{period:'2026-09'}).length,1));
t('channel filter',()=>assert.equal(c.filterEntries(cases,{channel:'Marketplace'}).length,1));
t('combined filter',()=>assert.equal(c.filterEntries(cases,{period:'2026-10',channel:'Marketplace'}).length,0));
t('all month channel',()=>assert.equal(c.filterEntries(cases,{period:'all',channel:'Venta directa'}).length,1));
t('reject malicious period',()=>assert.throws(()=>c.filterEntries(cases,{period:'2026-10<script>'}),/Mes/));
t('reject invalid month',()=>assert.throws(()=>c.filterEntries(cases,{period:'2026-13'}),/Mes/));
t('reject invalid channel',()=>assert.throws(()=>c.filterEntries(cases,{channel:'intruso'}),/Canal/));
t('reject non array',()=>assert.throws(()=>c.filterEntries('bad'),/Historial/));
t('monthly two periods',()=>assert.deepEqual(c.monthlyReport(cases).map(x=>x.period),['2026-10','2026-09']));
t('monthly count',()=>assert.deepEqual(c.monthlyReport(cases).map(x=>x.count),[2,1]));
t('monthly negative loss',()=>assert.equal(c.monthlyReport(cases).find(x=>x.period==='2026-09').losses,1));
t('summarize October',()=>assert.equal(c.summarize(c.filterEntries(cases,{period:'2026-10'})).count,2));
t('CSV filtered rows',()=>assert.equal(c.toCSV(c.filterEntries(cases,{period:'2026-10'})).split('\r\n').length,3));
t('backup full rows',()=>assert.equal(c.parseBackup(c.toBackup(cases)).length,3));
t('filter does not mutate',()=>assert.equal(JSON.stringify(cases),before));
t('empty month report',()=>assert.deepEqual(c.monthlyReport([]),[]));
console.log('REPORTING_OK',count);
