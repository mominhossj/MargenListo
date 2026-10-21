'use strict';
// Independent oracle: all test inputs are generated as integer cents/bps,
// then compared against MargenListo. Nothing here invokes the app's helpers.
const assert=require('node:assert/strict');
const core=require('../app/src/main/assets/ledger-core.js');
let seed=4222026;
function r(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
function v(n){return r()%n;}
function ceilHalf(n,d){return (n*2n+d)/(2n*d);}
let tested=0;
for(let i=0;i<50000;i++){
 const q=1+v(900), pc=1+v(9000000000), cost=v(9000000000), pack=v(100000000), ship=v(100000000),fixed=v(100000000),comm=v(9000),disc=v(9900);
 const row={date:'2026-10-21',product:'Prueba '+i,channel:'Venta directa',units:q,price:pc/100,cost:cost/100,packaging:pack/100,shipping:ship/100,fixed:fixed/100,commission:comm/100,discount:disc/100};
 const expectedRevenue=ceilHalf(BigInt(q)*BigInt(pc)*BigInt(10000-disc),10000n);
 const expectedExpenses=BigInt(q)*(BigInt(cost)+BigInt(pack))+BigInt(ship)+BigInt(fixed)+ceilHalf(expectedRevenue*BigInt(comm),10000n);
 const result=core.calc(row);
 assert.equal(Math.round(result.revenue*100),Number(expectedRevenue),'revenue #'+i);
 assert.equal(Math.round(result.expenses*100),Number(expectedExpenses),'expenses #'+i);
 assert.equal(Math.round(result.profit*100),Number(expectedRevenue-expectedExpenses),'profit #'+i);
 tested++;
}
const oldBug={date:'2026-10-21',product:'Frontera',channel:'Venta directa',units:50,price:16617.26,cost:49434.43,packaging:2785.29,shipping:7285.96,fixed:7455.38,commission:10.88,discount:9.5};
assert.equal(core.calc(oldBug).revenue,751931.02);
assert.equal(core.calc(oldBug).profit,-1955606.41);
assert.throws(()=>core.calc({...oldBug,cost:10.123}),/dos decimales/);
let rows=[];
for(let i=0;i<1000;i++) rows.push({...oldBug,product:'Registro'+i});
const summary=core.summarize(rows),single=core.calc(oldBug);
assert.equal(Math.round(summary.revenue*100),Math.round(single.revenue*100)*1000);
assert.equal(Math.round(summary.profit*100),Math.round(single.profit*100)*1000);
assert.equal(summary.count,1000);
console.log(`PRECISION_OK: ${tested} casos aleatorios, 1 ejemplo regresion, 1 comprobacion decimales, 1000 ventas acumuladas`);
