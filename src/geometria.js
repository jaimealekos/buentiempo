/**
 * Geometría del gráfico del widget: escala común de los días, banda entre
 * máximas y mínimas, y línea de temperatura hora a hora.
 *
 * Funciones puras, sin dependencias externas: reciben datos y devuelven
 * escalas y trazados SVG (cadenas), listos para que `plantilla` los use.
 */

/** Alto del hueco del gráfico, en unidades de viewBox. */
export const GRAFICO_ALTO = 126;

/** Franja vertical que ocupa la curva horaria. */
export const HORAS_CURVA_ARRIBA = 64;
export const HORAS_CURVA_ABAJO = 86;

/** Alto de la cifra de temperatura, para centrarla en su punto. */
export const HORAS_TEMP_ALTO = 12;

/** Paso por defecto de la línea horaria, en horas. */
export const HORAS_CADA = 2;

/** Porcentaje a partir del cual se pinta la lluvia. */
export const LLUVIA_MINIMA = 1;

// Geometría interna de la banda.
const BANDA_ALTO = 64;
const BANDA_ORIGEN = 27;
const ANCHO_DIA = 100;
const CENTRO_DIA = 50;

// Geometría interna de la línea horaria.
const ANCHO_HORAS = 240;
const MARGEN_HORAS = 5;
const ANCHO_HORAS_UTIL = 230;

// Un grado de aire arriba y abajo; el recorrido nunca baja de este valor.
const AIRE = 1;
const RECORRIDO_MINIMO = 0.1;

/**
 * Número finito, o 0 si falta o no es numérico (temperaturas y lluvia).
 * @param {unknown} valor
 * @returns {number}
 */
function aNumero(valor) {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : 0;
}

/**
 * Temperatura de una marca: conserva `null` (o `undefined`) sin sustituir.
 * @param {number|null|undefined} valor
 * @returns {number|null}
 */
function aMarca(valor) {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : null;
}

/**
 * Redondea a `decimales` y quita ceros sobrantes al volver a número.
 * @param {number} valor
 * @param {number} decimales
 * @returns {number}
 */
function redondear(valor, decimales) {
  return Number(valor.toFixed(decimales));
}

/**
 * Comprueba que `dias` sea un array no vacío.
 * @param {unknown} dias
 * @throws {RangeError}
 */
function comprobarDias(dias) {
  if (!Array.isArray(dias)) {
    throw new RangeError('dias debe ser un array');
  }
  if (dias.length === 0) {
    throw new RangeError('no hay días para calcular la banda');
  }
}

/**
 * Extremos de la escala común a todos los días, con un grado de aire arriba y abajo.
 * @param {Array<{tmax: number|null, tmin: number|null}>} dias - No vacío.
 * @returns {{ techo: number, suelo: number, recorrido: number }}
 */
export function escala(dias) {
  comprobarDias(dias);
  const maximas = dias.map((d) => aNumero(d.tmax));
  const minimas = dias.map((d) => aNumero(d.tmin));
  const techo = Math.max(...maximas) + AIRE;
  const suelo = Math.min(...minimas) - AIRE;
  const recorrido = Math.max(RECORRIDO_MINIMO, techo - suelo);
  return { techo, suelo, recorrido };
}

/**
 * Trazado de la banda de los días.
 * @param {Array<{tmax: number|null, tmin: number|null}>} dias - No vacío.
 * @returns {{
 *   viewBox: string,
 *   dArea: string, dMax: string, dMin: string,
 *   puntos: Array<{ cx: number, yMax: number, yMin: number }>
 * }}
 */
export function trazadoBanda(dias) {
  comprobarDias(dias);
  const { techo, recorrido } = escala(dias);
  const n = dias.length;

  const x = (i) => CENTRO_DIA + ANCHO_DIA * i;
  const y = (t) => BANDA_ORIGEN + (techo - aNumero(t)) / recorrido * BANDA_ALTO;

  let dMax = '';
  let dMin = '';
  const puntos = [];
  dias.forEach((d, i) => {
    const cx = redondear(x(i), 1);
    const yMax = redondear(y(d.tmax), 2);
    const yMin = redondear(y(d.tmin), 2);
    dMax += `${i ? ' L' : 'M'}${cx} ${yMax}`;
    dMin += `${i ? ' L' : 'M'}${cx} ${yMin}`;
    puntos.push({ cx, yMax, yMin });
  });

  // Área entre ambas: máximas de ida y mínimas de vuelta, cerrando con Z.
  let dArea = dMax;
  for (let i = n - 1; i >= 0; i--) {
    dArea += ` L${redondear(x(i), 1)} ${redondear(y(dias[i].tmin), 2)}`;
  }
  dArea += ' Z';

  return {
    viewBox: `0 0 ${n * ANCHO_DIA} ${GRAFICO_ALTO}`,
    dArea,
    dMax,
    dMin,
    puntos,
  };
}

/**
 * Trazado de la línea horaria de un día.
 * @param {Array<{t: string, temp: number|null, codigo: number, lluvia_pct: number}>} horas
 * @param {{ paso?: number, ahora?: number|null }} [opciones]
 *   `paso`: horas entre marcas (entero >= 1; defecto 2).
 *   `ahora`: hora actual en punto flotante 0..24 en la zona del lugar; `null` = no dibujar.
 * @returns {{
 *   viewBox: string, dArea: string, dLinea: string, dAhora: string,
 *   marcas: Array<{ pct: number, hora: string, temp: number|null,
 *                   yTemp: number|null, lluviaPct: number }>
 * } | null}  null si `horas` tiene menos de 2 lecturas.
 */
export function trazadoHoras(horas, opciones) {
  if (!Array.isArray(horas) || horas.length < 2) {
    return null;
  }

  const opts = opciones || {};
  const bruto = opts.paso ?? HORAS_CADA;
  const paso = Number.isFinite(bruto) ? Math.max(1, Math.floor(bruto)) : HORAS_CADA;

  const n = horas.length;
  const temps = horas.map((h) => aNumero(h.temp));
  const techo = Math.max(...temps) + AIRE;
  const suelo = Math.min(...temps) - AIRE;
  const recorrido = Math.max(RECORRIDO_MINIMO, techo - suelo);
  const altoCurva = HORAS_CURVA_ABAJO - HORAS_CURVA_ARRIBA;

  const x = (i) => MARGEN_HORAS + i * (ANCHO_HORAS_UTIL / Math.max(1, n - 1));
  const y = (t) => HORAS_CURVA_ARRIBA + (techo - aNumero(t)) / recorrido * altoCurva;

  let dLinea = '';
  horas.forEach((h, i) => {
    dLinea += `${i ? ' L' : 'M'}${redondear(x(i), 1)} ${redondear(y(h.temp), 2)}`;
  });
  const dArea = dLinea
    + ` L${redondear(x(n - 1), 1)} ${HORAS_CURVA_ABAJO}`
    + ` L${redondear(x(0), 1)} ${HORAS_CURVA_ABAJO} Z`;

  const marcas = [];
  horas.forEach((h, i) => {
    if (i % paso !== 0) {
      return;
    }
    const lectura = aMarca(h.temp);
    marcas.push({
      pct: redondear(x(i) / ANCHO_HORAS * 100, 2),
      // `t` es ISO 'YYYY-MM-DDTHH:MM'; las dos cifras de hora son las posiciones 11-12.
      hora: String(h.t).substring(11, 13),
      temp: lectura,
      yTemp: lectura === null ? null : redondear(y(lectura) - HORAS_TEMP_ALTO / 2, 1),
      lluviaPct: aNumero(h.lluvia_pct),
    });
  });

  const ahora = opts.ahora;
  const dibujarAhora = typeof ahora === 'number' && Number.isFinite(ahora)
    && ahora >= 0 && ahora <= 24;
  const dAhora = dibujarAhora
    ? `M${redondear(x(ahora), 1)} ${HORAS_CURVA_ARRIBA - 4} V${HORAS_CURVA_ABAJO}`
    : '';

  return {
    viewBox: `0 0 ${ANCHO_HORAS} ${GRAFICO_ALTO}`,
    dArea,
    dLinea,
    dAhora,
    marcas,
  };
}
