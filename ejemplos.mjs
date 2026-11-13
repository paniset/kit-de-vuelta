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
  }
};
