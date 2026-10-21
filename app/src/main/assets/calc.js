/* MargenListo V3 — cálculos autónomos para navegador y pruebas con Node. */
(function (root) {
  'use strict';
  const MAX_AMOUNT = 1_000_000_000_000;
  const MAX_UNITS = 100_000_000;
  const isMoney = v => Number.isFinite(v) && v >= 0 && v <= MAX_AMOUNT;
  const isPct = v => Number.isFinite(v) && v >= 0 && v < 100;
  const twoDecimals = v => Math.abs(v * 100 - Math.round(v * 100)) < 0.000001;
  const error = message => ({error: message});

  function listPrice(cost, discountFraction, feeFraction, marginFraction) {
    const denominator = (1 - discountFraction) * (1 - feeFraction - marginFraction);
    if (!(denominator > 0)) return NaN;
    const raw = cost / denominator;
    if (!Number.isFinite(raw) || raw > MAX_AMOUNT) return NaN;
    // Precios de lista en pesos ENTEROS; tolerancia < 1 centavo al redondear
    // para absorber pequeñas diferencias de representación binaria.
    let n = Math.max(1, Math.ceil(raw - 1e-9));
    const achieved = n * denominator;
    if (achieved + 0.0000001 < cost) n += 1;
    return n <= MAX_AMOUNT ? n : NaN;
  }
  function simulate(x) {
    const amounts = ['cost','packaging','shipping','fixedFee','monthlyCosts'];
    if (amounts.some(k => !isMoney(x[k]) || !twoDecimals(x[k]))) {
      return error('Usá importes de 0 a $1 billón, con hasta dos decimales.');
    }
    if (!Number.isInteger(x.units) || x.units < 1 || x.units > MAX_UNITS) {
      return error('Las unidades mensuales deben ser un número entero entre 1 y 100 millones.');
    }
    if (!['fee','otherFee','margin','discount'].every(k => isPct(x[k]))) {
      return error('Los porcentajes deben estar entre 0% y menos de 100%.');
    }
    const f = (x.fee + x.otherFee) / 100;
    const m = x.margin / 100;
    const d = x.discount / 100;
    if (f + m >= 1) return error('La suma de margen deseado y comisiones debe ser menor a 100%.');
    const overhead = x.monthlyCosts / x.units;
    const cost = x.cost + x.packaging + x.shipping + x.fixedFee + overhead;
    if (!(cost > 0) || !Number.isFinite(cost) || cost > MAX_AMOUNT) {
      return error('El costo total por unidad debe ser mayor a cero y no superar $1 billón.');
    }
    const price = listPrice(cost, d, f, m);
    const breakeven = listPrice(cost, d, f, 0);
    if (!Number.isFinite(price) || !Number.isFinite(breakeven)) {
      return error('El precio calculado excede el límite admitido. Revisá los porcentajes o costos.');
    }
    const received = price * (1 - d);
    const fees = received * f;
    const profit = received - cost - fees;
    return { price, received, fees, profit, breakeven, cost, overhead, margin: profit/received };
  }
  function channel(x) {
    const amounts = ['price','baseCost','mainShipping','mainFixed','shipping','fixed'];
    if (amounts.some(k => !isMoney(x[k])) || !['fee','otherFee','discount'].every(k => isPct(x[k]))) {
      return error('Verificá los importes y porcentajes de este canal.');
    }
    if (x.fee + x.otherFee >= 100) return error('Las comisiones del canal deben sumar menos de 100%.');
    const received = x.price * (1 - x.discount/100);
    const cost = x.baseCost + x.mainShipping + x.mainFixed + x.shipping + x.fixed;
    const fees = received * (x.fee + x.otherFee)/100;
    const profit = received - cost - fees;
    if (![received,cost,fees,profit].every(Number.isFinite) || cost > MAX_AMOUNT) {
      return error('El resultado supera el límite admitido.');
    }
    return { received, profit, fees, cost, margin: received > 0 ? profit/received : 0 };
  }
  root.MargenMath = {simulate, channel};
  if (typeof module !== 'undefined' && module.exports) module.exports = root.MargenMath;
})(typeof window !== 'undefined' ? window : globalThis);
