export const MAX_BYTES = 256 * 1024;
export class ValidationError extends Error {
  constructor(message, path) { super(message); this.path = path; }
}
const fail = (message, path) => { throw new ValidationError(message, path); };
function keys(value, expected, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join('|') !== [...expected].sort().join('|')) fail('Estructura no reconocida.', path);
}
function text(value, max, required, path) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail(`Introduce ${required ? 'entre 1 y' : 'como máximo'} ${max} caracteres.`, path);
}
function integer(value, min, max, path) {
  if (!Number.isInteger(value) || value < min || value > max) fail(`Introduce un entero entre ${min} y ${max}.`, path);
}
export function validateKit(kit) {
  keys(kit, ['name', 'components'], 'name'); text(kit.name, 80, true, 'name');
  if (!Array.isArray(kit.components) || kit.components.length < 1 || kit.components.length > 50) fail('Añade entre 1 y 50 componentes.', 'components');
  const ids = new Set(), names = new Set();
  kit.components.forEach((item, i) => {
    const path = `components.${i}`;
    keys(item, ['id', 'name', 'quantity', 'condition', 'note'], path);
    if (typeof item.id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(item.id) || ids.has(item.id)) fail('Identificador inválido o repetido.', `${path}.id`);
    ids.add(item.id); text(item.name, 80, true, `${path}.name`);
    const normalized = item.name.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('es');
    if (names.has(normalized)) fail('Este nombre ya aparece en el kit.', `${path}.name`);
    names.add(normalized); integer(item.quantity, 1, 999, `${path}.quantity`);
    if (!['bien', 'con desgaste'].includes(item.condition)) fail('Elige bien o con desgaste.', `${path}.condition`);
    text(item.note, 160, false, `${path}.note`);
  });
  return kit;
}
export function validateReturns(base, returns) {
  if (!Array.isArray(returns) || returns.length !== base.components.length) fail('La devolución debe contener todos los componentes.', 'returns');
  const ids = new Set();
  returns.forEach((item, i) => {
    const path = `returns.${i}`;
    keys(item, ['id', 'good', 'issue', 'note'], path);
    const component = base.components.find(c => c.id === item.id);
    if (!component || ids.has(item.id)) fail('Referencia de devolución inexistente o repetida.', `${path}.id`);
    ids.add(item.id); integer(item.good, 0, component.quantity, `${path}.good`); integer(item.issue, 0, component.quantity, `${path}.issue`);
    if (item.good + item.issue > component.quantity) fail(`Bien e incidencia no pueden sumar más de ${component.quantity}.`, `${path}.issue`);
    text(item.note, 160, false, `${path}.note`);
  });
  return returns;
}
export function validateDocument(doc) {
  keys(doc, ['version', 'demo', 'phase', 'kit', 'base', 'returns'], 'document');
  if (doc.version !== 1 || typeof doc.demo !== 'boolean' || !['draft', 'out'].includes(doc.phase)) fail('Versión o fase no admitida.', 'document');
  validateKit(doc.kit);
  if (doc.phase === 'draft') {
    if (doc.base !== null || !Array.isArray(doc.returns) || doc.returns.length) fail('Un borrador no puede incluir salida o devolución.', 'document');
  } else {
    validateKit(doc.base);
    if (JSON.stringify(doc.kit) !== JSON.stringify(doc.base)) fail('La plantilla y la salida confirmada deben coincidir.', 'document');
    validateReturns(doc.base, doc.returns);
  }
  return doc;
}
export function confirmDeparture(kit, demo = false) {
  validateKit(kit);
  const base = structuredClone(kit);
  return { version: 1, demo, phase: 'out', kit: structuredClone(base), base,
    returns: base.components.map(c => ({ id: c.id, good: 0, issue: 0, note: '' })) };
}
export function newDeparture(doc) {
  validateDocument(doc);
  return { version: 1, demo: doc.demo, phase: 'draft', kit: structuredClone(doc.base ?? doc.kit), base: null, returns: [] };
}
export function summary(base, returns) {
  validateKit(base); validateReturns(base, returns);
  const rows = base.components.map(c => { const r = returns.find(r => r.id === c.id); return { ...c, ...r, pending: c.quantity - r.good - r.issue }; });
  const pending = rows.reduce((sum, r) => sum + r.pending, 0), issues = rows.reduce((sum, r) => sum + r.issue, 0);
  return { rows, pending, issues, complete: pending === 0 && issues === 0 };
}
export function parseDocument(raw) {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > MAX_BYTES) fail('El archivo supera 256 KiB.', 'document');
  let doc;
  try { doc = JSON.parse(raw); } catch { fail('El archivo no contiene JSON válido.', 'document'); }
  return structuredClone(validateDocument(doc));
}
export function serializeDocument(doc) {
  validateDocument(doc);
  const raw = JSON.stringify(doc, null, 2);
  if (new TextEncoder().encode(raw).length > MAX_BYTES) fail('El archivo supera 256 KiB.', 'document');
  return raw;
}
