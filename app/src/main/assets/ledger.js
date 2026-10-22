/* MargenListo Ledger UI. Zero network calls. Avoid innerHTML for user content. */
(() => {
 'use strict';
 const core=window.MargenLedger, KEY='margenlisto_ventas_v1';
 const $ = id => document.getElementById(id);
 const ars = n => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2}).format(n);
 let entries=[];
 let filtered=[];
 let readOnly=false;
 function updatePeriodOptions(){
   const select=$('period-filter'), selected=select.value;
   select.replaceChildren();
   const all=document.createElement('option');all.value='all';all.textContent='Todos los meses';select.append(all);
   const periods=core.availableMonths(entries);
   for(const period of periods){
     const option=document.createElement('option');option.value=period;
     option.textContent=new Intl.DateTimeFormat('es-AR',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(period+'-01T12:00:00Z'));
     select.append(option);
   }
   select.value=(selected==='all'||periods.includes(selected))?selected:'all';
 }
 function monthlyTable(){
   const body=$('monthly-rows');body.replaceChildren();
   const monthly=core.monthlyReport(entries);
   $('monthly-empty').hidden=monthly.length>0;$('monthly-wrap').hidden=monthly.length===0;
   for(const month of monthly){
     const tr=document.createElement('tr');
     const date=new Intl.DateTimeFormat('es-AR',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(month.period+'-01T12:00:00Z'));
     cell(tr,date);cell(tr,month.count);cell(tr,ars(month.revenue));
     cell(tr,ars(month.profit),month.profit<0?'neg':'pos');
     cell(tr,(month.margin*100).toFixed(1)+'%');cell(tr,month.losses);body.append(tr);
   }
 }
 function showInsights(){
   const products=core.performanceByProduct(filtered,5);
   const channels=core.performanceByChannel(filtered);
   const prows=$('product-insight-rows'),crows=$('channel-insight-rows');
   prows.replaceChildren();crows.replaceChildren();
   $('product-insight-empty').hidden=products.length>0;
   $('product-insight-wrap').hidden=products.length===0;
   $('channel-insight-empty').hidden=channels.length>0;
   $('channel-insight-wrap').hidden=channels.length===0;
   for(const p of products){
     const tr=document.createElement('tr');
     cell(tr,p.name);cell(tr,String(p.count));cell(tr,ars(p.profit),p.profit<0?'neg':'pos');
     prows.append(tr);
   }
   for(const c of channels){
     const tr=document.createElement('tr');
     cell(tr,c.name);cell(tr,String(c.count));cell(tr,ars(c.profit),c.profit<0?'neg':'pos');
     crows.append(tr);
   }
 }
 function repeatSale(row){
   // Pre-fill only. Never insert a new sale until user reviews and submits.
   for(const key of ['product','channel','units','price','cost','packaging','shipping','commission','discount','fixed'])
     $(key).value=String(row[key]);
   // New operation defaults to today's local date, not the old sale date.
   const today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
   $('date').value=today.toISOString().slice(0,10);
   document.getElementById('sale-form').scrollIntoView?.({behavior:'smooth',block:'start'});
   $('product').focus();
   notice('Formulario completado con los valores de esta venta. Revisalos y presioná Guardar si corresponde.');
 }
 let toastTimer;
 function notice(s, bad=false){const el=$('notice');el.textContent=s;el.classList.toggle('bad',bad);el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,5500);}
 function load(){
   try {
     const raw=JSON.parse(localStorage.getItem(KEY)||'[]');
     if(!Array.isArray(raw)||raw.length>core.MAX_ROWS)throw Error();
     const ids=new Set();
     entries=raw.map(v=>{
       const validated=core.validate(v);
       if(typeof v.id!=='string'||!/^[a-zA-Z0-9_-]{8,80}$/.test(v.id)||ids.has(v.id))throw Error();
       ids.add(v.id);
       return {...validated,id:v.id};
     });
   } catch(_){
     readOnly=true;entries=[];
     notice('No se pudo leer el historial. No se sobrescribirá: restaurá un respaldo JSON válido.',true);
     $('save').disabled=true;
   }
 }
 function persist(){if(readOnly){notice('Historial protegido: restaurá primero un respaldo válido.',true);return false;}try{localStorage.setItem(KEY,JSON.stringify(entries));$('save').disabled=false;return true;}catch(_){notice('No se pudieron guardar los datos. Exportá una copia antes de salir.',true);return false;}}
 function cell(tr,text,cls){const td=document.createElement('td');td.textContent=String(text);if(cls)td.className=cls;tr.append(td);return td;}
 function rerender(){
   updatePeriodOptions();
   filtered=core.filterEntries(entries,{period:$('period-filter').value,channel:$('channel-filter').value||'all'});
   const summary=core.summarize(filtered);
   $('filter-info').textContent='Mostrando '+filtered.length+' de '+entries.length+' operaciones. Las exportaciones JSON y CSV completo incluyen siempre todas las ventas.';
   $('revenue').textContent=ars(summary.revenue);$('profit').textContent=ars(summary.profit);$('margin').textContent=(summary.margin*100).toFixed(1)+'%';
   $('losses').textContent=String(summary.losses);$('count').textContent=String(summary.count);$('units-total').textContent=String(summary.units);
   const tbody=$('records');tbody.replaceChildren();
   const suggestions=$('recent-products');suggestions.replaceChildren();
   const seen=new Set();for(const record of [...entries].reverse()){const name=record.product.trim();if(!seen.has(name.toLowerCase())){seen.add(name.toLowerCase());const option=document.createElement('option');option.value=name;suggestions.append(option);}}
   const sorted=[...filtered].sort((a,b)=>b.date.localeCompare(a.date));
   for(const record of sorted){ const x=core.calc(record);const tr=document.createElement('tr');
     cell(tr,x.date);cell(tr,x.product);cell(tr,x.channel);cell(tr,x.units);cell(tr,ars(x.revenue));
     cell(tr,ars(x.profit),x.profit<0?'neg':'pos');cell(tr,x.status,x.profit<0?'neg':'status');
     const controls=document.createElement('td');const btn=document.createElement('button');btn.className='tiny-button';btn.textContent='Eliminar';btn.type='button';btn.setAttribute('aria-label','Eliminar venta de '+x.product);
     btn.addEventListener('click',()=>{if(!window.confirm('¿Eliminar este registro? Esta acción no se puede deshacer.'))return;
       const previous=[...entries];entries=entries.filter(e=>e.id!==record.id);if(!persist()){entries=previous;return;}rerender();notice('Registro eliminado');});
     const repeat=document.createElement('button');repeat.type='button';repeat.className='tiny-button repeat';repeat.textContent='Repetir';
     repeat.setAttribute('aria-label','Preparar otra venta de '+x.product);
     repeat.addEventListener('click',()=>repeatSale(record));
     controls.append(repeat,btn);tr.append(controls);tbody.append(tr);
   }
   showInsights();
   $('empty').hidden=filtered.length>0;$('table-wrap').hidden=filtered.length===0;
   $('export-csv').disabled=entries.length===0;$('export-json').disabled=entries.length===0;$('export-filtered').disabled=filtered.length===0;
   monthlyTable();
 }
 function formData(){const keys=['date','product','channel','units','price','cost','packaging','shipping','commission','discount','fixed'];const out={};for(const k of keys)out[k]=$(k).value;return out;}
 function exportFile(name,mime,contents){
   if(window.MargenListoBridge && typeof window.MargenListoBridge.exportBackup==='function' && mime==='application/json') {window.MargenListoBridge.exportBackup(contents);return;}
   if(window.MargenListoBridge && mime==='text/csv' && name==='margenlisto-vista-filtrada.csv' && typeof window.MargenListoBridge.exportFilteredCsv==='function'){window.MargenListoBridge.exportFilteredCsv(contents);return;}
   if(window.MargenListoBridge && typeof window.MargenListoBridge.exportCsv==='function' && mime==='text/csv'){window.MargenListoBridge.exportCsv(contents);return;}
   const blob=new Blob([contents],{type:mime+';charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
 }
 $('product').addEventListener('change',()=>{
   const name=$('product').value.trim().toLowerCase();
   const found=[...entries].reverse().find(e=>e.product.toLowerCase()===name);
   if(!found)return;
   for(const key of ['channel','price','cost','packaging','shipping','commission','discount','fixed'])$(key).value=String(found[key]);
   $('units').value='1';notice('Se completaron los valores de la última venta de este producto. Revisá que sigan vigentes.');
 });
 $('sale-form').addEventListener('submit',evt=>{
   evt.preventDefault();if(readOnly){notice('Historial protegido: restaurá un respaldo válido antes de agregar ventas.',true);return;}if(entries.length>=core.MAX_ROWS){notice('Límite de 1000 ventas. Exportá una copia antes de borrar registros.',true);return;}
   let v;try{v=core.validate(formData());}catch(e){notice(e.message,true);return;}
   const id='v_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);
   const previous=[...entries];entries.push({...v,id});if(!persist()){entries=previous;return;}rerender();$('product').focus();notice('Venta guardada solo en este dispositivo');
 });
 $('period-filter').addEventListener('change',rerender);
 $('channel-filter').addEventListener('change',rerender);
 $('export-csv').addEventListener('click',()=>exportFile('margenlisto-ventas.csv','text/csv',core.toCSV(entries)));
 $('export-filtered').addEventListener('click',()=>exportFile('margenlisto-vista-filtrada.csv','text/csv',core.toCSV(filtered)));
 $('export-json').addEventListener('click',()=>exportFile('margenlisto-respaldo.json','application/json',core.toBackup(entries)));
 async function importBackupText(text) {
   let parsed;
   try { parsed=core.parseBackup(text); }
   catch(e) { notice('No se importó: '+e.message,true);return; }
   if(!window.confirm(`¿Reemplazar las ${entries.length} ventas actuales por ${parsed.length} registros del respaldo? Exportá primero si necesitás conservar los actuales.`))return;
   const previous=[...entries], wasReadOnly=readOnly;entries=parsed;readOnly=false;
   if(!persist()){entries=previous;readOnly=wasReadOnly;return;}
   rerender();notice('Respaldo importado correctamente');
 }
 // On Android the native picker reads just the explicitly selected JSON; no
 // generic WebView content:// or filesystem access is enabled.
 window.MargenListoNativeImportBackup = text => importBackupText(text);
 $('backup-file').addEventListener('change',async evt=>{
   const f=evt.target.files?.[0];evt.target.value='';if(!f)return;
   if(f.size>750000){notice('El respaldo supera el límite de tamaño',true);return;}
   try { await importBackupText(await f.text()); }
   catch(_) { notice('No se pudo leer el archivo de respaldo',true); }
 });
 const today = new Date(); today.setMinutes(today.getMinutes()-today.getTimezoneOffset()); $('date').value=today.toISOString().slice(0,10);
 load();rerender();
})();
