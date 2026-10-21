/* MargenListo ledger core v1. Offline and dependency-free. Pure calculations. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MargenLedger = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const MAX_ROWS = 1000;
  const MAX_MONEY = 100000000;
  const LIMIT_KEYS = ['units', 'price', 'cost', 'packaging', 'shipping', 'commission', 'discount', 'fixed'];
  function isNumber(v) { return typeof v === 'number' && Number.isFinite(v); }
  function validDate(str) {
    if (typeof str !== 'string' || !/^\d{4}-\d\d-\d\d$/.test(str)) return false;
    const d = new Date(str+'T12:00:00Z');
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === str && str >= '2020-01-01' && str <= '2100-12-31';
  }
  function validate(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Registro inválido');
    const product = String(input.product ?? '').trim();
    const channel = String(input.channel ?? '').trim();
    if (!validDate(input.date)) throw Error('Fecha inválida');
    if (!product || product.length > 80) throw Error('Producto: 1 a 80 caracteres');
    if (!['Venta directa','Instagram/WhatsApp','Marketplace','Otro'].includes(channel)) throw Error('Canal no admitido');
    const out = {date:input.date, product, channel};
    for (const key of LIMIT_KEYS) {
      const n = Number(input[key]);
      if (input[key] === '' || input[key] === null || input[key] === undefined || !isNumber(n) || n < 0) throw Error('Número inválido: '+key);
      if ((key === 'discount' || key === 'commission') && n > 100) throw Error('Porcentaje fuera del rango');
      if (key === 'units' && (!Number.isInteger(n) || n < 1 || n > 1000)) throw Error('Unidades fuera del rango');
      if (!['units','discount','commission'].includes(key) && n > MAX_MONEY) throw Error('Importe demasiado grande');
      // El formulario usa centavos y porcentajes con hasta dos decimales.
      // No aceptamos fracciones invisibles que puedan alterar el resultado.
      if (Math.abs(n * 100 - Math.round(n * 100)) > 0.000001)
        throw Error('Usá como máximo dos decimales: '+key);
      out[key] = n;
    }
    if (out.discount >= 100) throw Error('El descuento debe ser menor al 100 %');
    if (out.price <= 0) throw Error('El precio debe ser mayor que cero');
    // Guardar los costos unitarios de esta venta para que no cambien retroactivamente.
    return out;
  }
  // Currency is ARS with 2 decimal places. All monetary arithmetic is
  // performed in integer cents, and percentages in hundredths of a percent.
  // BigInt is used for intermediate multiplications to avoid IEEE-754 errors.
  const CENTS_PER_PESO = 100n;
  const BASIS_POINTS_PER_100_PERCENT = 10000n;
  function cents(value) { return BigInt(Math.round(value * 100)); }
  function basisPoints(value) { return BigInt(Math.round(value * 100)); }
  function halfUpPositive(numerator, denominator) {
    return (2n * numerator + denominator) / (2n * denominator);
  }
  function pesos(valueInCents) { return Number(valueInCents) / 100; }
  function round2(x) { return Math.round((x + Number.EPSILON) * 100) / 100; }
  function moneyTotals(v) {
    const netBps = BASIS_POINTS_PER_100_PERCENT - basisPoints(v.discount);
    const incomeCents = halfUpPositive(BigInt(v.units) * cents(v.price) * netBps,
                                        BASIS_POINTS_PER_100_PERCENT);
    const baseCents = BigInt(v.units) * (cents(v.cost) + cents(v.packaging))
                      + cents(v.shipping) + cents(v.fixed);
    const feeCents = halfUpPositive(incomeCents * basisPoints(v.commission),
                                    BASIS_POINTS_PER_100_PERCENT);
    return {incomeCents, expenseCents:baseCents + feeCents};
  }
  function calc(input) {
    const v = validate(input);
    const {incomeCents, expenseCents} = moneyTotals(v);
    const income = pesos(incomeCents);
    const expense = pesos(expenseCents);
    const profit = pesos(incomeCents - expenseCents);
    return { ...v, revenue: income, expenses: expense, profit,
      margin: incomeCents > 0n ? Number(incomeCents - expenseCents) / Number(incomeCents) : 0,
      status: profit < 0 ? 'PÉRDIDA' : (profit === 0 ? 'EQUILIBRIO' : (profit/income < .10 ? 'MARGEN BAJO' : 'RENTABLE')) };
  }
  function summarize(entries) {
    let incomeCents=0n, expenseCents=0n, units=0, losses=0;
    for(const input of entries) {
      const v=validate(input), sums=moneyTotals(v);
      incomeCents+=sums.incomeCents;
      expenseCents+=sums.expenseCents;
      units+=v.units;
      if(sums.incomeCents < sums.expenseCents) losses++;
    }
    const profitCents=incomeCents-expenseCents;
    return {revenue:pesos(incomeCents),expenses:pesos(expenseCents),
      profit:pesos(profitCents),units,losses,count:entries.length,
      margin:incomeCents>0n ? Number(profitCents)/Number(incomeCents) : 0};
  }
  // Vista del tablero: no modifica el historial original ni los registros.
  function filterEntries(entries, options={}) {
    if (!Array.isArray(entries)) throw Error('Historial inválido');
    const period=options.period ?? 'all';
    const channel=options.channel ?? 'all';
    if (period !== 'all' && !/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) throw Error('Mes inválido');
    if (channel !== 'all' && !['Venta directa','Instagram/WhatsApp','Marketplace','Otro'].includes(channel)) throw Error('Canal inválido');
    return entries.filter(row => (period==='all'||row.date.slice(0,7)===period)
      && (channel==='all'||row.channel===channel));
  }
  function availableMonths(entries) {
    return [...new Set(entries.map(row=>validate(row).date.slice(0,7)))].sort().reverse();
  }
  function monthlyReport(entries) {
    const groups=new Map();
    for(const row of entries){
      const period=validate(row).date.slice(0,7);
      if(!groups.has(period)) groups.set(period,[]);
      groups.get(period).push(row);
    }
    return [...groups].sort((a,b)=>b[0].localeCompare(a[0]))
      .map(([period,records])=>({period,...summarize(records)}));
  }
  function safeCell(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    let v=String(value ?? '').replace(/[\r\n\t]+/g,' ');
    // Prevent spreadsheet formula injection (also after whitespace or control chars).
    if (/^[\s\u0000-\u001f]*[=+@-]/.test(v)) v="'"+v;
    return '"'+v.replace(/"/g,'""')+'"';
  }
  function toCSV(entries) {
    const cols=['Fecha','Producto','Canal','Unidades','Precio_u','Costo_u','Packaging_u','Envio_total','Comision_pct','Descuento_pct','Cargo_fijo','Facturado','Costos_y_cargos','Ganancia','Margen_pct','Estado'];
    const rows = [cols];
    for (const row of entries) { const x=calc(row); rows.push([x.date,x.product,x.channel,x.units,x.price,x.cost,x.packaging,x.shipping,x.commission,x.discount,x.fixed,x.revenue,x.expenses,x.profit,round2(x.margin*100),x.status]); }
    return '\uFEFF'+rows.map(r=>r.map(safeCell).join(';')).join('\r\n');
  }
  function parseBackup(text) {
    if (typeof text !== 'string' || text.length > 750000) throw Error('Archivo demasiado grande');
    let doc;
    try { doc = JSON.parse(text); } catch(_) { throw Error('JSON inválido'); }
    if (!doc || doc.kind !== 'MargenListoLedger' || doc.version !== 1 || !Array.isArray(doc.entries) || doc.entries.length > MAX_ROWS) throw Error('Formato o tamaño inválido');
    const seen = new Set();
    return doc.entries.map(v => {
      if (seen.has(v.id)) throw Error('ID duplicado');
      seen.add(v.id);
      const record = validate(v);
      if (typeof v.id !== 'string' || !/^[a-zA-Z0-9_-]{8,80}$/.test(v.id)) throw Error('ID inválido');
      return {...record,id:v.id};
    });
  }
  function toBackup(entries) {
    const normalized = entries.map(v => {
      if (typeof v.id !== 'string' || !/^[a-zA-Z0-9_-]{8,80}$/.test(v.id)) throw Error('ID inválido');
      return {...validate(v), id:v.id};
    });
    return JSON.stringify({kind:'MargenListoLedger',version:1,exportedAt:new Date().toISOString(),entries:normalized},null,2);
  }
  return {MAX_ROWS, validate,calc,summarize,filterEntries,availableMonths,monthlyReport,safeCell,toCSV,parseBackup,toBackup};
});
