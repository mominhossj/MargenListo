(() => {
  'use strict';
  const root=document.querySelector('[data-calculator]');
  if (!root) return;
  const kind=root.dataset.calculator;
  const $=(id)=>root.querySelector('#'+id);
  const number=(id)=>Number($(id).value);
  const money=(n)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',minimumFractionDigits:0,maximumFractionDigits:2}).format(n);
  const percent=(n)=>new Intl.NumberFormat('es-AR',{maximumFractionDigits:2}).format(n)+' %';
  const err=$('tool-error');
  function fail(msg) {err.textContent=msg;err.hidden=false;root.querySelectorAll('[data-result]').forEach(e=>e.textContent='—');}
  function valid(ids) {for (const id of ids) {const node=$(id); if(!node || node.value.trim()==='' || !Number.isFinite(number(id))) return false;const value=number(id); if(value<0 || (node.hasAttribute('max') && value>Number(node.max))) return false;}return true;}
  function compute() {
    const ids=kind==='descuentos'?['list-price','unit-cost','sale-fee','sale-fixed','discount','target']:['buy-cost','package-cost','ship-cost','fixed-cost','fee','discount','target'];
    if(!valid(ids)){fail('Completá todos los importes con números válidos y porcentajes dentro de su rango.');return;}
    err.hidden=true;
    if(kind==='descuentos'){
      const P=number('list-price'),C=number('unit-cost'),fee=number('sale-fee')/100,K=number('sale-fixed'),d=number('discount')/100,m=number('target')/100;
      if(P<=0){fail('El precio de lista debe ser mayor que cero.');return;}
      if(fee+m>=1){fail('La comisión y el margen objetivo no pueden sumar 100 % o más.');return;}
      const charged=P*(1-d),profit=charged*(1-fee)-C-K,margin=charged>0?profit/charged*100:NaN;
      const freeMax=100*(1-(C+K)/(P*(1-fee)));
      const goalMax=100*(1-(C+K)/(P*(1-fee-m)));
      $('res-charged').textContent=money(charged);
      $('res-profit').textContent=money(profit);
      $('res-margin').textContent=Number.isFinite(margin)?percent(margin):'No calculable';
      $('res-zero').textContent=freeMax<0?'Ya hay pérdida sin descuento':percent(Math.max(0,freeMax));
      $('res-target').textContent=goalMax<0?'No alcanza al precio actual':percent(Math.max(0,goalMax));
      $('res-profit').closest('.tool-value').classList.toggle('is-loss',profit<0);
      $('res-advice').textContent=profit<0?'Con estos valores, la promoción produce una pérdida antes de gastos mensuales e impuestos.':goalMax<0?'Aunque no haya pérdida, el precio actual no alcanza el margen objetivo.':d*100>goalMax+1e-8?'La promoción deja ganancia, pero no mantiene el margen objetivo.':'Según los valores cargados, este descuento cumple el margen objetivo.';
    } else {
      const C=number('buy-cost')+number('package-cost')+number('ship-cost')+number('fixed-cost'),f=number('fee')/100,d=number('discount')/100,m=number('target')/100;
      const factor=(1-d)*(1-f-m);
      if(factor<=0){fail('Esta combinación de descuento, comisión y margen no permite calcular un precio válido.');return;}
      const p=Math.ceil((C/factor)*100)/100,charged=p*(1-d),profit=charged*(1-f)-C;
      $('res-price').textContent=money(p);
      $('res-charged').textContent=money(charged);
      $('res-profit').textContent=money(profit);
      $('res-cost').textContent=money(C);
      $('res-advice').textContent='El resultado se calcula con los porcentajes que cargaste. Instagram no tiene una comisión universal: usá la tarifa real de tu procesador de pago o canal de venta.';
    }
  }
  root.addEventListener('input',compute);
  compute();
})();
