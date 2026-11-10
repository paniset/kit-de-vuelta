import { MAX_BYTES, ValidationError, confirmDeparture, newDeparture, summary, parseDocument, serializeDocument, validateDocument } from './logic.mjs';
const $ = id => document.getElementById(id);
const component = () => ({ id: crypto.randomUUID(), name: '', quantity: 1, condition: 'bien', note: '' });
let doc = { version: 1, demo: false, phase: 'draft', kit: { name: '', components: [component()] }, base: null, returns: [] };
let dirty = false, importing = false;
const el = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
function clearErrors() {
  $('global-error').textContent = '';
  document.querySelectorAll('.field-error').forEach(node => node.remove());
  document.querySelectorAll('[aria-invalid]').forEach(node => { node.removeAttribute('aria-invalid'); node.removeAttribute('aria-describedby'); });
}
function showError(error) {
  clearErrors();
  const field = [...document.querySelectorAll('[data-path]')].find(node => node.dataset.path === error.path);
  const match = error.path?.match(/^(components|returns)\.(\d+)/);
  const prefix = match ? `Componente ${Number(match[2]) + 1}: ` : '';
  $('global-error').textContent = prefix + error.message;
  if (field && !field.disabled) {
    const warning = el('span', prefix + error.message, 'field-error'); warning.id = `${field.id}-error`;
    field.after(warning); field.setAttribute('aria-invalid', 'true'); field.setAttribute('aria-describedby', warning.id); field.focus();
  } else { $('global-error').tabIndex = -1; $('global-error').focus(); }
}
function field(container, title, path, value, type = 'text', max = 80, wide = false) {
  const wrapper = el('div', undefined, wide ? 'wide' : '');
  const label = el('label', title); const input = document.createElement(type === 'select' ? 'select' : type === 'textarea' ? 'textarea' : 'input');
  input.id = `field-${path.replaceAll('.', '-')}`; input.dataset.path = path; label.htmlFor = input.id;
  if (type === 'select') ['bien', 'con desgaste'].forEach(value => { const option = el('option', value); option.value = value; input.append(option); });
  else if (type === 'textarea') { input.maxLength = max; input.rows = 2; }
  else { input.type = type; if (type === 'number') { input.min = path.startsWith('returns') ? 0 : 1; input.max = max; input.step = 1; } else input.maxLength = max; }
  input.value = value; wrapper.append(label, input); container.append(wrapper); return input;
}
function value(path) { return [...document.querySelectorAll('[data-path]')].find(node => node.dataset.path === path)?.value; }
function numberValue(path) { const raw = value(path); return raw?.trim() ? Number(raw) : NaN; }
function readKit() {
  return { name: $('kit-name').value, components: [...$('components').children].map((row, i) => ({ id: row.dataset.id, name: value(`components.${i}.name`), quantity: numberValue(`components.${i}.quantity`), condition: value(`components.${i}.condition`), note: value(`components.${i}.note`) })) };
}
function collect() {
  const candidate = structuredClone(doc);
  if (doc.phase === 'draft') candidate.kit = readKit();
  else candidate.returns = doc.base.components.map((c, i) => ({ id: c.id, good: numberValue(`returns.${i}.good`), issue: numberValue(`returns.${i}.issue`), note: value(`returns.${i}.note`) }));
  return validateDocument(candidate);
}
function drawComponents(kit) {
  $('components').replaceChildren();
  kit.components.forEach((c, i) => {
    const row = el('div', undefined, 'component'); row.dataset.id = c.id;
    row.append(el('h3', `Componente ${i + 1}`, 'wide'));
    field(row, 'Nombre del componente', `components.${i}.name`, c.name, 'text', 80, true);
    field(row, 'Cantidad de salida', `components.${i}.quantity`, c.quantity, 'number', 999);
    field(row, 'Estado al salir', `components.${i}.condition`, c.condition, 'select');
    field(row, 'Nota de salida (opcional)', `components.${i}.note`, c.note, 'textarea', 160, true);
    const remove = el('button', 'Quitar componente', 'wide'); remove.type = 'button';
    remove.onclick = () => { const kit = readKit(); kit.components.splice(i, 1); doc.kit = kit; dirty = true; clearErrors(); drawComponents(kit); $('add').focus(); };
    row.append(remove); $('components').append(row);
  });
  $('add').disabled = kit.components.length >= 50;
}
function render() {
  clearErrors(); $('kit-name').value = doc.kit.name; drawComponents(doc.kit);
  const out = doc.phase === 'out'; $('base-fields').disabled = out; $('depart').hidden = out; $('locked').hidden = !out; $('return-form').hidden = !out; $('empty').hidden = out; $('demo-badge').hidden = !doc.demo;
  $('returns').replaceChildren();
  if (out) doc.base.components.forEach((c, i) => {
    const r = doc.returns.find(r => r.id === c.id); const row = el('div', undefined, 'return-row');
    row.append(el('h3', c.name, 'wide'), el('p', `Salieron ${c.quantity} · Estado inicial: ${c.condition}`, 'wide'));
    field(row, 'Devueltos bien (total)', `returns.${i}.good`, r.good, 'number', c.quantity);
    field(row, 'Con incidencia (total)', `returns.${i}.issue`, r.issue, 'number', c.quantity);
    field(row, 'Nota de incidencia (opcional)', `returns.${i}.note`, r.note, 'textarea', 160, true);
    const balance = el('p', '', 'wide row-balance'); balance.id = `balance-${i}`; row.append(balance);
    $('returns').append(row);
  });
  updateResult();
}
function updateResult() {
  $('result').hidden = doc.phase !== 'out';
  if (doc.phase !== 'out') return;
  const result = summary(doc.base, doc.returns);
  result.rows.forEach((row, i) => { $(`balance-${i}`).textContent = `Salida: ${row.quantity} · Bien: ${row.good} · Incidencia: ${row.issue} · Pendiente: ${row.pending}`; });
  $('pending').textContent = result.pending ? `Faltan piezas: ${result.pending} pendientes.` : 'No faltan piezas: 0 pendientes.';
  $('issues').textContent = result.issues ? `Hay incidencias: ${result.issues} piezas.` : 'Sin incidencias declaradas.';
  $('complete').textContent = result.complete ? 'Completo sin incidencias.' : 'La comprobación sigue abierta.';
}
function printSheet() {
  const kit = doc.base ?? doc.kit;
  $('print-name').textContent = kit.name; $('print-mode').textContent = `${doc.demo ? 'DEMO · ' : ''}${doc.phase === 'out' ? 'Salida fijada y devolución acumulada' : 'Preparación: salida todavía no confirmada'}`;
  const result = doc.phase === 'out' ? summary(doc.base, doc.returns) : null;
  $('print-summary').textContent = result ? `Pendientes: ${result.pending}. Con incidencia: ${result.issues}. ${result.complete ? 'Completo sin incidencias.' : 'Comprobación abierta.'}` : 'Completa las casillas a mano. Las columnas de vuelta están vacías.';
  $('print-rows').replaceChildren();
  kit.components.forEach(c => {
    const r = result?.rows.find(r => r.id === c.id); const row = el('tr'); const info = el('td');
    info.append(el('strong', c.name), el('p', c.condition));
    if (c.note) info.append(el('p', `Salida: ${c.note}`)); if (r?.note) info.append(el('p', `Incidencia: ${r.note}`));
    row.append(info, ...[c.quantity, r?.good ?? '', r?.issue ?? '', r?.pending ?? '', '□'].map(v => el('td', String(v)))); $('print-rows').append(row);
  });
}
document.addEventListener('input', event => {
  if (!event.target.matches('[data-path]')) return;
  dirty = true; clearErrors(); $('message').textContent = 'Cambios pendientes de comprobar y exportar.'; $('result').hidden = true;
  document.querySelectorAll('.row-balance').forEach(node => { node.textContent = 'Balance pendiente de actualizar.'; });
});
$('add').onclick = () => {
  const kit = readKit(); if (kit.components.length >= 50) return;
  kit.components.push(component()); doc.kit = kit; dirty = true; clearErrors(); drawComponents(kit);
  $('components').lastElementChild.querySelector('input').focus();
};
$('prepare').onsubmit = event => {
  event.preventDefault(); try { doc = confirmDeparture(readKit(), doc.demo); dirty = true; render(); $('message').textContent = 'Salida fijada. Empieza la comprobación de vuelta.'; $('returns').querySelector('input').focus(); } catch (error) { showError(error); }
};
$('return-form').onsubmit = event => {
  event.preventDefault(); try { doc = collect(); clearErrors(); dirty = true; updateResult(); $('message').textContent = 'Comprobación actualizada. Exporta para conservarla.'; } catch (error) { showError(error); }
};
$('new').onclick = () => {
  if (!window.confirm('Crear otra salida reemplaza la ficha activa. ¿Has exportado lo que quieres conservar o confirmas descartarlo?')) return;
  doc = newDeparture(doc); dirty = true; render(); $('message').textContent = 'Nueva plantilla. La salida anterior no se conserva en esta pestaña.'; $('kit-name').focus();
};
$('export').onclick = () => {
  try {
    const candidate = collect(), raw = serializeDocument(candidate);
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const link = el('a'); link.href = url; link.download = 'kit-de-vuelta.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    doc = candidate; dirty = false; clearErrors(); updateResult(); $('message').textContent = 'Descarga solicitada. Conserva el JSON para recuperar esta ficha.';
  } catch (error) { showError(error); }
};
$('import').onchange = async event => {
  const file = event.target.files[0]; if (!file || importing) return;
  importing = true;
  try {
    if (file.size > MAX_BYTES) throw new ValidationError('El archivo supera 256 KiB.', 'document');
    const candidate = parseDocument(await file.text());
    if (!window.confirm('Importar reemplazará la ficha actual, incluidos los cambios sin exportar. ¿Confirmas el reemplazo?')) return;
    doc = candidate; dirty = false; render(); $('message').textContent = 'Archivo importado y validado. Ficha recuperada.';
  } catch (error) { showError(error); }
  finally { importing = false; event.target.value = ''; }
};
$('demo').onclick = () => {
  if ((dirty || doc.phase === 'out' || $('kit-name').value.trim()) && !window.confirm('La demo reemplazará esta ficha. ¿Confirmas descartar la actual?')) return;
  const kit = { name: 'Caja de montaje · DEMO', components: [{ ...component(), name: 'Cables', quantity: 3 }, { ...component(), name: 'Cargador', quantity: 1 }] };
  doc = confirmDeparture(kit, true); dirty = true; render(); $('message').textContent = 'Demo voluntaria: prueba una devolución parcial y una incidencia.';
};
$('print').onclick = () => { try { doc = collect(); clearErrors(); printSheet(); window.print(); } catch (error) { showError(error); } };
window.addEventListener('beforeprint', () => {
  try { doc = collect(); printSheet(); }
  catch (error) {
    showError(error); $('print-name').textContent = 'Ficha pendiente de corregir';
    $('print-mode').textContent = 'No se imprime un resultado anterior con datos inválidos.';
    $('print-summary').textContent = error.message; $('print-rows').replaceChildren();
  }
});
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
render();
