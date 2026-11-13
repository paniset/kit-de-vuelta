// Ejemplos de las guías por sector. Material ficticio: no son préstamos reales ni contienen personas.
// Cada entrega guarda el total acumulado devuelto hasta ese momento; la herramienta abre la última.
// logic.mjs los valida con las mismas reglas que una ficha importada (exampleDocument).
const kit = (name, rows) => ({ name, components: rows.map(([id, component, quantity, condition = 'bien', note = '']) => ({ id, name: component, quantity, condition, note })) });
const returns = (base, counts) => base.components.map(({ id }) => {
  const [good = 0, issue = 0, note = ''] = counts[id] ?? [];
  return { id, good, issue, note };
});

const robotica = kit('Maleta de robótica del AMPA', [
  ['robots', 'Robot programable', 6],
  ['cables', 'Cable USB de carga', 6],
  ['tapetes', 'Tapete de cuadrícula', 2, 'con desgaste', 'una esquina despegada'],
  ['tarjetas', 'Juego de tarjetas de órdenes', 6],
  ['maleta', 'Maleta de transporte', 1]
]);

const acampada = kit('Material de acampada de la tropa', [
  ['tiendas', 'Tienda de 4 plazas', 4],
  ['piquetas', 'Piquetas', 48, 'bien', '12 por tienda'],
  ['vientos', 'Vientos', 24, 'bien', 'cuerdas tensoras, 6 por tienda'],
  ['mazos', 'Mazo de goma', 2],
  ['hornillos', 'Hornillo de gas', 3],
  ['ollas', 'Olla grande con tapa', 2, 'con desgaste', 'tapa abollada'],
  ['frontales', 'Linterna frontal', 8],
  ['botiquin', 'Botiquín', 1]
]);

const taladro = kit('Taladro percutor con maletín', [
  ['taladro', 'Taladro percutor', 1],
  ['baterias', 'Batería', 2],
  ['cargador', 'Cargador', 1],
  ['brocas-pared', 'Brocas de pared', 4, 'bien', '5, 6, 8 y 10 mm'],
  ['brocas-madera', 'Brocas de madera', 5],
  ['puntas', 'Puntas de atornillar', 10],
  ['portapuntas', 'Portapuntas magnético', 1],
  ['empunadura', 'Empuñadura lateral', 1],
  ['tope', 'Tope de profundidad', 1],
  ['maletin', 'Maletín', 1, 'con desgaste', 'cierre duro']
]);

// Puesto de trabajo: sin nombres; el número de serie o la etiqueta de inventario va en la nota de salida.
const puesto = kit('Equipo del puesto de administración', [
  ['portatil', 'Portátil', 1, 'bien', 'etiqueta de inventario PT-031'],
  ['cargador-portatil', 'Cargador del portátil', 1],
  ['funda', 'Funda del portátil', 1, 'con desgaste', 'cremallera dura'],
  ['movil', 'Móvil de empresa', 1, 'bien', 'etiqueta MV-112, con protector de pantalla'],
  ['cargador-movil', 'Cargador del móvil', 1],
  ['sim', 'Tarjeta SIM de empresa', 1],
  ['llaves', 'Llave', 2, 'bien', '1 de la oficina y 1 del archivo'],
  ['tarjeta', 'Tarjeta de acceso', 1],
  ['polos', 'Polo de uniforme', 3],
  ['pantalones', 'Pantalón de uniforme', 2],
  ['chaqueta', 'Chaqueta de uniforme', 1]
]);

const grabacion = kit('Equipo de grabación de la asociación', [
  ['camara', 'Cuerpo de cámara', 1, 'bien', 'etiqueta CAM-02'],
  ['objetivo', 'Objetivo zoom', 1, 'bien', 'con tapa delantera y trasera'],
  ['baterias', 'Batería de cámara', 2, 'con desgaste', 'una aguanta menos carga'],
  ['cargador', 'Cargador de baterías', 1],
  ['tarjetas', 'Tarjeta de memoria', 2],
  ['tripode', 'Trípode de cámara', 1],
  ['zapata', 'Zapata rápida del trípode', 1],
  ['grabadora', 'Grabadora de audio', 1],
  ['corbata', 'Micrófono de corbata', 2],
  ['xlr', 'Cable XLR', 2],
  ['auriculares', 'Auriculares', 1],
  ['antiviento', 'Antiviento de pelo', 1],
  ['focos', 'Foco LED', 2],
  ['pies', 'Pie de foco', 2],
  ['alimentadores', 'Alimentador de foco', 2]
]);

export const EXAMPLES = {
  colegio: {
    title: 'Maleta de robótica de un AMPA',
    kit: robotica,
    entregas: [
      { title: 'Vuelta al final del trimestre', returns: returns(robotica, {
        robots: [5, 1, 'rueda trasera suelta'], cables: [4], tapetes: [2], tarjetas: [5], maleta: [1]
      }) }
    ]
  },
  scouts: {
    title: 'Material de acampada de un grupo scout',
    kit: acampada,
    entregas: [
      { title: 'Primera entrega: domingo, al volver de la acampada', returns: returns(acampada, {
        tiendas: [3], piquetas: [34], vientos: [17, 1, 'uno cortado'], mazos: [2], hornillos: [2, 1, 'válvula dura'], ollas: [2], frontales: [6], botiquin: [1]
      }) },
      { title: 'Segunda entrega: vuelve la tienda que se secaba (totales acumulados)', returns: returns(acampada, {
        tiendas: [4], piquetas: [45], vientos: [23, 1, 'uno cortado'], mazos: [2], hornillos: [2, 1, 'válvula dura'], ollas: [2], frontales: [7], botiquin: [1]
      }) }
    ]
  },
  herramientas: {
    title: 'Taladro de una biblioteca de las cosas',
    kit: taladro,
    entregas: [
      { title: 'Vuelta del préstamo', returns: returns(taladro, {
        taladro: [1], baterias: [1, 1, 'no carga'], cargador: [1], 'brocas-pared': [3, 1, 'la de 6 mm, doblada'], 'brocas-madera': [4], puntas: [8], portapuntas: [1], empunadura: [1], maletin: [1]
      }) }
    ]
  },
  empleado: {
    title: 'Devolución del equipo de un puesto de trabajo',
    kit: puesto,
    entregas: [
      { title: 'Primera entrega: último día en el puesto', returns: returns(puesto, {
        portatil: [1], funda: [1], movil: [0, 1, 'pantalla rajada'], 'cargador-movil': [1], sim: [1], llaves: [2], tarjeta: [1], polos: [2], pantalones: [2]
      }) },
      { title: 'Segunda entrega: llegan el cargador y la chaqueta (totales acumulados)', returns: returns(puesto, {
        portatil: [1], 'cargador-portatil': [1], funda: [1], movil: [0, 1, 'pantalla rajada'], 'cargador-movil': [1], sim: [1], llaves: [2], tarjeta: [1], polos: [2], pantalones: [2], chaqueta: [1]
      }) }
    ]
  },
  audiovisual: {
    title: 'Préstamo de equipo audiovisual de una asociación',
    kit: grabacion,
    entregas: [
      { title: 'Vuelta después del rodaje', returns: returns(grabacion, {
        camara: [1], objetivo: [1], baterias: [2], cargador: [1], tarjetas: [1], tripode: [1], grabadora: [1], corbata: [1, 1, 'cable pelado junto a la pinza'], xlr: [2], auriculares: [1], focos: [2], pies: [1, 1, 'rosca de la cabeza pasada'], alimentadores: [2]
      }) }
    ]
  }
};
