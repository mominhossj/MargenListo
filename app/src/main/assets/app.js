/*
 * MargenListo · Interfaz de la calculadora.
 * Código fuente nuevo, sin dependencias de terceros.
 * Los cálculos se delegan a calc.js (MargenMath).
 * Los escenarios se guardan solo en localStorage de este navegador.
 */
(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const channelInput = (index, field) => document.querySelector(
    `[data-channel="${index}"][data-key="${field}"]`
  );

  const INPUT_FIELDS = [
    'cost', 'packaging', 'shipping', 'fee', 'otherFee',
    'margin', 'discount', 'fixedFee', 'monthlyCosts', 'units'
  ];
  const CHANNEL_FIELDS = ['fee', 'discount', 'shipping', 'fixed'];
  const CHANNEL_NAMES = ['Venta directa', 'Link de pago', 'Marketplace'];
  const DEFAULT_INPUTS = Object.freeze({
    cost: 5800, packaging: 380, shipping: 650, fee: 12,
    otherFee: 2, margin: 28, discount: 0, fixedFee: 0,
    monthlyCosts: 0, units: 120
  });
  const DEFAULT_CHANNELS = [
    {fee: 0, discount: 0, shipping: 0, fixed: 0},
    {fee: 6, discount: 0, shipping: 0, fixed: 0},
    {fee: 14, discount: 0, shipping: 500, fixed: 0}
  ];
  // Conserva la clave usada desde la V3, para no perder escenarios existentes.
  const SAVED_KEY = 'margenlisto_v3_escenarios';
  const MAX_SAVED = 30;
  const pesoFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0
  });
  const percentageFormatter = new Intl.NumberFormat('es-AR', {
    style: 'percent', maximumFractionDigits: 1, minimumFractionDigits: 1
  });

  let latestSimulation = null;
  let toastTimer = null;

  function money(value) { return pesoFormatter.format(value); }
  function percentage(value) { return percentageFormatter.format(value); }
  function readNumber(input) {
    if (!input || input.value.trim() === '') return NaN;
    return Number(input.value);
  }
  function readInputs() {
    const result = {};
    for (const key of INPUT_FIELDS) result[key] = readNumber(byId(key));
    return result;
  }
  function writeInputs(source = DEFAULT_INPUTS) {
    for (const key of INPUT_FIELDS) {
      const value = source[key];
      byId(key).value = Number.isFinite(value) ? String(value) : String(DEFAULT_INPUTS[key]);
    }
    updateMarginLabel();
  }
  function updateMarginLabel() {
    byId('margin-display').textContent = `${byId('margin').value}%`;
  }
  function readChannel(index) {
    const result = {};
    for (const key of CHANNEL_FIELDS) result[key] = readNumber(channelInput(index, key));
    return result;
  }
  function writeChannels(source = DEFAULT_CHANNELS) {
    for (let index = 0; index < CHANNEL_NAMES.length; index += 1) {
      const channel = source[index] || DEFAULT_CHANNELS[index];
      for (const key of CHANNEL_FIELDS) {
        const field = channelInput(index, key);
        const value = channel[key];
        if (field) field.value = Number.isFinite(value) ? String(value) : String(DEFAULT_CHANNELS[index][key]);
      }
    }
  }
  function toast(message) {
    const element = byId('toast');
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
    if (toastTimer !== null) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { element.hidden = true; }, 3600);
  }

  function calculateChannel(index) {
    if (!latestSimulation) return {error: 'Sin simulación válida'};
    const inputs = latestSimulation.inputs;
    return window.MargenMath.channel({
      price: latestSimulation.price,
      baseCost: inputs.cost + inputs.packaging + latestSimulation.overhead,
      mainShipping: inputs.shipping,
      mainFixed: inputs.fixedFee,
      otherFee: inputs.otherFee,
      ...readChannel(index)
    });
  }
  function refreshChannelCards() {
    const comparable = [];
    for (let index = 0; index < CHANNEL_NAMES.length; index += 1) {
      const profitElement = byId(`chan-money-${index}`);
      const marginElement = byId(`chan-margin-${index}`);
      const bar = byId(`meter-${index}`);
      profitElement.classList.remove('loss');
      bar.style.width = '0%';
      bar.style.background = '#1ed760';
      if (!latestSimulation) {
        profitElement.textContent = '—';
        marginElement.textContent = '—';
        continue;
      }
      const result = calculateChannel(index);
      if (result.error) {
        profitElement.textContent = 'Revisar';
        marginElement.textContent = 'Dato inválido';
        continue;
      }
      profitElement.textContent = money(result.profit);
      marginElement.textContent = `Margen ${percentage(result.margin)}`;
      const isLoss = result.profit < 0;
      profitElement.classList.toggle('loss', isLoss);
      bar.style.width = `${Math.max(0, Math.min(100, result.margin * 100))}%`;
      bar.style.background = isLoss ? '#ff8787' : '#1ed760';
      comparable.push({index, profit: result.profit});
    }
    const winner = byId('winner');
    if (comparable.length !== CHANNEL_NAMES.length) {
      winner.textContent = 'Completá los tres canales con datos válidos para compararlos.';
      return;
    }
    const top = comparable.reduce((best, item) => item.profit > best.profit ? item : best);
    winner.textContent = `↗ Con estos supuestos, ${CHANNEL_NAMES[top.index]} deja la mayor ganancia estimada: ${money(top.profit)} por unidad. No contempla diferencias de volumen, marketing ni adquisición de clientes.`;
  }

  function renderSimulation() {
    updateMarginLabel();
    const inputs = readInputs();
    const result = window.MargenMath.simulate(inputs);
    latestSimulation = result.error ? null : {...result, inputs};

    byId('error').hidden = !result.error;
    byId('error').textContent = result.error || '';
    byId('save').disabled = Boolean(result.error);
    byId('download').disabled = Boolean(result.error);

    const valueIds = [
      'price', 'profit', 'margin-result', 'breakeven', 'total-cost',
      'charged', 'split-profit', 'split-fees', 'split-costs', 'chart-margin'
    ];
    if (result.error) {
      for (const id of valueIds) byId(id).textContent = '—';
      byId('profit-pill').textContent = 'Revisá los valores';
      byId('profit-pill').classList.add('loss');
      byId('donut').style.background = '#303830';
      refreshChannelCards();
      return;
    }

    const currencyFields = {
      price: result.price,
      profit: result.profit,
      breakeven: result.breakeven,
      'total-cost': result.cost,
      'split-profit': result.profit,
      'split-fees': result.fees,
      'split-costs': result.cost
    };
    for (const [id, value] of Object.entries(currencyFields)) {
      byId(id).textContent = money(value);
    }
    byId('margin-result').textContent = percentage(result.margin);
    byId('chart-margin').textContent = percentage(result.margin);
    byId('charged').textContent = `Cobrás ${money(result.received)}`;
    const loss = result.profit < 0;
    byId('profit-pill').textContent = loss ? '↘ Pérdida estimada' : '↗ Ganancia positiva (estimada)';
    byId('profit-pill').classList.toggle('loss', loss);
    const profitShare = Math.max(0, Math.min(100, result.profit / result.received * 100));
    const feeShare = Math.min(100, profitShare + result.fees / result.received * 100);
    byId('donut').style.background = `conic-gradient(#1ed760 0% ${profitShare}%,#547b5d ${profitShare}% ${feeShare}%,#444d44 ${feeShare}% 100%)`;
    byId('donut').setAttribute('aria-label', `Distribución estimada: ganancia ${percentage(result.margin)}, comisiones ${money(result.fees)}, costos ${money(result.cost)}`);
    refreshChannelCards();
  }

  function getSavedScenarios() {
    try {
      const stored = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
      if (!Array.isArray(stored)) return [];
      return stored.filter((record) =>
        record && typeof record === 'object' &&
        typeof record.name === 'string' &&
        record.inputs && typeof record.inputs === 'object'
      ).slice(0, MAX_SAVED);
    } catch (_) {
      return [];
    }
  }
  function setSavedScenarios(records) {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(records));
      return true;
    } catch (_) {
      return false;
    }
  }
  function renderSavedScenarios() {
    const records = getSavedScenarios();
    const list = byId('saved-items');
    list.replaceChildren();
    byId('saved-empty').hidden = records.length > 0;
    list.hidden = records.length === 0;
    byId('clear-saved').hidden = records.length === 0;
    records.forEach((record, index) => {
      const row = document.createElement('div');
      row.className = 'saved-item';
      const description = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = record.name;
      const details = document.createElement('small');
      const date = new Date(record.date);
      const price = Number.isFinite(record.price) ? money(record.price) : 'Precio por recalcular';
      const when = Number.isFinite(date.getTime()) ? date.toLocaleDateString('es-AR') : 'Fecha desconocida';
      details.textContent = `${price} · ${when}`;
      description.append(title, details);

      const buttons = document.createElement('div');
      buttons.className = 'saved-item-actions';
      const openButton = document.createElement('button');
      openButton.type = 'button';
      openButton.textContent = 'Abrir';
      openButton.setAttribute('aria-label', `Abrir ${record.name}`);
      openButton.addEventListener('click', () => {
        writeInputs(record.inputs);
        writeChannels(record.channels);
        byId('scenario-name').value = record.name;
        renderSimulation();
        byId('simulador').scrollIntoView({behavior: 'smooth'});
        toast('Escenario recuperado');
      });
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'delete';
      deleteButton.textContent = 'Borrar';
      deleteButton.setAttribute('aria-label', `Borrar ${record.name}`);
      deleteButton.addEventListener('click', () => {
        const next = getSavedScenarios();
        next.splice(index, 1);
        if (setSavedScenarios(next)) {
          renderSavedScenarios();
          toast('Escenario eliminado');
        } else {
          toast('No se pudo borrar: el almacenamiento está bloqueado');
        }
      });
      buttons.append(openButton, deleteButton);
      row.append(description, buttons);
      list.append(row);
    });
  }

  // Evita que las planillas interpreten textos del usuario como fórmulas al abrir el CSV.
  function quoteCsv(value) {
    let text = String(value ?? '');
    if (typeof value === 'string' && /^\s*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  }
  function exportCsv() {
    if (!latestSimulation) return;
    const simulation = latestSimulation;
    const rows = [
      ['Campo', 'Valor'],
      ['Nombre del escenario', byId('scenario-name').value.trim() || 'Mi producto'],
      ...INPUT_FIELDS.map((key) => [key, simulation.inputs[key]]),
      ['Costo total por unidad', simulation.cost],
      ['Precio sugerido (ARS)', simulation.price],
      ['Importe cobrado tras descuento (ARS)', simulation.received],
      ['Comisiones variables (ARS)', simulation.fees],
      ['Ganancia estimada por unidad (ARS)', simulation.profit],
      ['Margen obtenido', percentage(simulation.margin)],
      ['Precio mínimo sin pérdida (ARS)', simulation.breakeven],
      [],
      ['Comparación por canal', 'Comisión %', 'Descuento %', 'Envío (ARS)', 'Cargo fijo (ARS)', 'Ganancia (ARS)', 'Margen']
    ];
    for (let index = 0; index < CHANNEL_NAMES.length; index += 1) {
      const channel = readChannel(index);
      const result = calculateChannel(index);
      rows.push([
        CHANNEL_NAMES[index], channel.fee, channel.discount, channel.shipping, channel.fixed,
        result.error ? 'Datos inválidos' : result.profit,
        result.error ? '' : percentage(result.margin)
      ]);
    }
    rows.push([], [
      'Nota', 'Los descuentos de los canales son independientes del descuento principal. Valores orientativos, sin impuestos automáticos.'
    ]);
    const contents = '\uFEFF' + rows.map((row) => row.map(quoteCsv).join(';')).join('\r\n');
    if (window.MargenListoBridge?.exportCsv) { window.MargenListoBridge.exportCsv(contents); return; }
    const file = new Blob([contents], {type: 'text/csv;charset=utf-8'});
    const objectUrl = URL.createObjectURL(file);
    const downloadLink = document.createElement('a');
    downloadLink.href = objectUrl;
    downloadLink.download = 'margenlisto-escenario.csv';
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    toast('CSV exportado con los tres canales');
  }
  function saveScenario() {
    if (!latestSimulation) return;
    const records = getSavedScenarios();
    if (records.length >= MAX_SAVED) {
      toast('Máximo 30 escenarios. Borrá uno antes de guardar.');
      return;
    }
    const name = byId('scenario-name').value.trim().slice(0, 60) || `Escenario ${records.length + 1}`;
    const newRecord = {
      name,
      price: latestSimulation.price,
      date: new Date().toISOString(),
      inputs: {...latestSimulation.inputs},
      channels: CHANNEL_NAMES.map((_, index) => readChannel(index))
    };
    records.unshift(newRecord);
    if (setSavedScenarios(records)) {
      renderSavedScenarios();
      toast('Escenario y canales guardados en este navegador');
    } else {
      toast('No se pudo guardar. Habilitá el almacenamiento del navegador');
    }
  }
  function refreshActiveNavigation() {
    const hash = window.location.hash.slice(1) || 'inicio';
    for (const link of document.querySelectorAll('.nav-item')) {
      link.classList.toggle('active', link.getAttribute('data-target') === hash);
    }
  }
  function initialize() {
    if (!window.MargenMath || typeof window.MargenMath.simulate !== 'function') {
      console.error('MargenListo no pudo iniciar el motor matemático.');
      return;
    }
    for (const id of INPUT_FIELDS) byId(id).addEventListener('input', renderSimulation);
    for (const field of document.querySelectorAll('[data-channel][data-key]')) {
      field.addEventListener('input', refreshChannelCards);
    }
    byId('reset').addEventListener('click', () => {
      writeInputs(DEFAULT_INPUTS);
      writeChannels(DEFAULT_CHANNELS);
      byId('scenario-name').value = 'Mi producto';
      renderSimulation();
      toast('Datos de ejemplo restaurados');
    });
    byId('download').addEventListener('click', exportCsv);
    byId('save').addEventListener('click', saveScenario);
    byId('clear-saved').addEventListener('click', () => {
      if (!window.confirm('¿Eliminar todos los escenarios guardados en este navegador?')) return;
      if (setSavedScenarios([])) {
        renderSavedScenarios();
        toast('Escenarios eliminados');
      } else {
        toast('No se pudieron eliminar los escenarios');
      }
    });
    window.addEventListener('hashchange', refreshActiveNavigation);
    byId('year').textContent = String(new Date().getFullYear());
    renderSavedScenarios();
    refreshActiveNavigation();
    renderSimulation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, {once: true});
  } else {
    initialize();
  }
})();
