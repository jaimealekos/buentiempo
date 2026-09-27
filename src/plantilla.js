/**
 * Plantilla: compone, con funciones puras, el HTML interno del widget a partir
 * de los datos normalizados, la configuración y el idioma.
 *
 * No toca el DOM ni añade `<style>`: devuelve cadenas. Las escuchas, el estado
 * y la inyección del CSS los pone `elemento`.
 */

import { t, textoWmo, nombreDia } from './i18n.js';
import { svgIcono, fundiciones } from './iconos.js';
import { trazadoBanda, trazadoHoras, LLUVIA_MINIMA } from './geometria.js';

/** Gota de lluvia de interfaz; la comparten la celda del día y la línea horaria. */
const GOTA = '<svg class="bt-gota" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5c0 0 -5 6.2 -5 9.3a5 5 0 0 0 10 0c0-3.1-5-9.3-5-9.3Z"/></svg>';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/**
 * Escapa los caracteres que romperían el HTML.
 * @param {unknown} texto
 * @returns {string}
 */
const escapar = (texto) => String(texto ?? '').replace(/[&<>"]/g, (c) => ESCAPES[c]);

/**
 * Número redondeado a entero, o `—` si no es finito.
 * @param {number|null|undefined} valor
 * @returns {string}
 */
function numero(valor) {
  return Number.isFinite(valor) ? String(Math.round(valor)) : '—';
}

/**
 * Temperatura redondeada con su grado, o `—`.
 * @param {number|null|undefined} valor
 * @returns {string}
 */
function temperatura(valor) {
  const n = numero(valor);
  return n === '—' ? '—' : `${n}°`;
}

/**
 * Código WMO entero, con 0 si falta.
 * @param {unknown} valor
 * @returns {number}
 */
function codigoDe(valor) {
  return Number.isInteger(valor) ? valor : 0;
}

/**
 * Hora (dos dígitos) de un instante `YYYY-MM-DDTHH:MM`.
 * @param {unknown} t
 * @returns {string}
 */
function horaDe(valor) {
  return String(valor ?? '').substring(11, 13);
}

/**
 * Día de la semana (0 = domingo) de una fecha `YYYY-MM-DD`, o 0 si no es válida.
 * @param {unknown} fecha
 * @returns {number}
 */
function diaSemanaDe(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return 0;
  }
  return new Date(`${fecha}T12:00:00Z`).getUTCDay();
}

/**
 * Hora actual en punto flotante (0..24) en una zona IANA, o null.
 * @param {unknown} zona
 * @returns {number|null}
 */
function horaActual(zona) {
  if (typeof zona !== 'string' || zona === '') {
    return null;
  }
  try {
    const partes = new Intl.DateTimeFormat('en-GB', {
      timeZone: zona, hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(new Date());
    const hora = Number(partes.find((p) => p.type === 'hour').value);
    const minuto = Number(partes.find((p) => p.type === 'minute').value);
    if (!Number.isFinite(hora) || !Number.isFinite(minuto)) {
      return null;
    }
    return hora + minuto / 60;
  } catch {
    // Zona IANA desconocida: se trata como ausente, sin raya de "ahora".
    return null;
  }
}

/**
 * Hora de frescura `HH:MM` del instante y la zona dados.
 * @param {unknown} ts
 * @param {unknown} zona
 * @returns {string}
 */
function horaFrescura(ts, zona) {
  if (!Number.isFinite(ts)) {
    return '—';
  }
  const fecha = new Date(ts);
  const opciones = { hour: '2-digit', minute: '2-digit', hour12: false };
  if (typeof zona === 'string' && zona !== '') {
    opciones.timeZone = zona;
  }
  try {
    return new Intl.DateTimeFormat('en-GB', opciones).format(fecha);
  } catch {
    // Zona IANA desconocida: se pinta en la hora local.
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(fecha);
  }
}

/**
 * Viento traducido según las unidades.
 * @param {string} lang
 * @param {string} units
 * @param {number|null|undefined} valor
 * @returns {string}
 */
function viento(lang, units, valor) {
  const clave = units === 'imperial' ? 'vientoImperial' : 'viento';
  return t(lang, clave, { n: numero(valor) });
}

/**
 * Cabecera: buscador o título, frescura y condiciones actuales.
 * @param {object} datos
 * @param {object} config
 * @param {string} lang
 * @returns {string}
 */
function pintarCabecera(datos, config, lang) {
  const lugar = escapar(datos.lugar ?? '');
  const pais = datos.pais ?? '';
  let html = '<header class="bt-cabecera">';

  if (config.editable) {
    html += '<form class="bt-lugar" part="lugar" autocomplete="off"><h2 class="bt-titulo">'
      + `<button type="button" class="bt-lugar-boton" title="${escapar(t(lang, 'cambiarCiudad'))}">${lugar}</button>`
      + `<input type="text" class="bt-lugar-campo" part="campo" value="${lugar}" maxlength="80"`
      + ' autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false"'
      + ` aria-autocomplete="list" aria-controls="bt-sugerencias" aria-label="${escapar(t(lang, 'buscarCiudad'))}" hidden>`
      + `<ul class="bt-lugar-sugerencias" part="sugerencias" id="bt-sugerencias" role="listbox"`
      + ` aria-label="${escapar(t(lang, 'ciudades'))}" hidden></ul>`
      + (pais !== '' ? `<span class="bt-lugar-pais" part="pais">${escapar(pais)}</span>` : '')
      + '</h2></form>';
  } else {
    html += `<h2 class="bt-titulo"><span class="bt-lugar-texto" part="lugar">${lugar}</span>`
      + (pais !== '' ? `<span class="bt-lugar-pais" part="pais">${escapar(pais)}</span>` : '')
      + '</h2>';
  }

  html += `<span class="bt-meta" part="meta">${escapar(t(lang, 'actualizado'))} ${horaFrescura(datos.ts, datos.zona)}</span>`;

  if (config.showCurrent) {
    const actual = datos.actual ?? {};
    html += '<p class="bt-ahora" part="ahora">'
      + `<span class="bt-temp-ahora">${temperatura(actual.temp)}</span>`
      + `<span>${escapar(textoWmo(lang, codigoDe(actual.codigo)))}</span>`
      + `<span class="bt-tenue">${escapar(t(lang, 'sensacion', { n: numero(actual.sensacion) }))}</span>`
      + `<span class="bt-tenue">${escapar(t(lang, 'humedad', { n: numero(actual.humedad) }))}</span>`
      + `<span class="bt-tenue">${escapar(viento(lang, config.units, actual.viento))}</span>`
      + '</p>';
  }

  return `${html}</header>`;
}

/**
 * SVG de la banda de máximas y mínimas.
 * @param {ReturnType<typeof trazadoBanda>} banda
 * @returns {string}
 */
function pintarBanda(banda) {
  let puntos = '';
  for (const p of banda.puntos) {
    puntos += `<path class="bt-punto bt-punto-min" d="M${p.cx} ${p.yMin - 2.5} V${p.yMin + 2.5}"/>`
      + `<path class="bt-punto bt-punto-max" d="M${p.cx} ${p.yMax - 2.5} V${p.yMax + 2.5}"/>`;
  }
  return `<svg class="bt-banda" part="banda" viewBox="${banda.viewBox}" preserveAspectRatio="none" aria-hidden="true">`
    + '<defs><linearGradient id="bt-degradado-oro" x1="0" y1="0" x2="0" y2="1">'
    + '<stop offset="0" stop-color="var(--bt-accent)" stop-opacity=".26"/>'
    + '<stop offset="1" stop-color="var(--bt-accent)" stop-opacity=".04"/>'
    + '</linearGradient></defs>'
    + `<path class="bt-area" d="${banda.dArea}" fill="url(#bt-degradado-oro)"/>`
    + `<path class="bt-linea-min" d="${banda.dMin}"/>`
    + `<path class="bt-linea-max" d="${banda.dMax}"/>`
    + puntos
    + '</svg>';
}

/**
 * Línea por horas de un día, o '' si no hay material suficiente.
 * @param {Array<object>} horasDia
 * @param {number} indice
 * @param {{ paso: number, ahora: number|null, lang: string }} opciones
 * @returns {string}
 */
function pintarHoras(horasDia, indice, { paso, ahora, lang }) {
  const trazado = trazadoHoras(horasDia, { paso, ahora });
  if (!trazado) {
    return '';
  }
  const porHora = new Map(horasDia.map((h) => [horaDe(h.t), h]));

  let marcas = '';
  let temperaturas = '';
  let lluvias = '';
  for (const marca of trazado.marcas) {
    const codigo = codigoDe(porHora.get(marca.hora)?.codigo);
    const descripcion = textoWmo(lang, codigo);
    const temp = marca.temp === null ? '—' : `${Math.round(marca.temp)}°`;
    let titulo = `${marca.hora}:00 · ${descripcion} · ${temp}`;
    if (marca.lluviaPct >= LLUVIA_MINIMA) {
      titulo += ` · ${t(lang, 'lluvia', { n: marca.lluviaPct })}`;
    }

    marcas += `<div class="bt-hora-marca" part="hora" style="--bt-x:${marca.pct}%" title="${escapar(titulo)}">`
      + `<span class="bt-hora-hh">${marca.hora}h</span>`
      + svgIcono(codigo, { etiqueta: descripcion, clase: 'bt-icono' })
      + '</div>';
    temperaturas += `<span class="bt-hora-temp" part="hora-temp" style="--bt-x:${marca.pct}%;--bt-y:${marca.yTemp ?? 0}px">${temp}</span>`;
    if (marca.lluviaPct >= LLUVIA_MINIMA) {
      lluvias += `<span class="bt-lluvia bt-hora-lluvia" part="hora-lluvia" style="--bt-x:${marca.pct}%">${GOTA}${marca.lluviaPct}%</span>`;
    }
  }

  const svg = `<svg class="bt-horas-linea" viewBox="${trazado.viewBox}" preserveAspectRatio="none" aria-hidden="true">`
    + `<path class="bt-area" d="${trazado.dArea}"/>`
    + `<path class="bt-linea-max" d="${trazado.dLinea}"/>`
    + (trazado.dAhora ? `<path class="bt-ahora-linea" d="${trazado.dAhora}"/>` : '')
    + '</svg>';

  return `<div class="bt-horas" part="horas" data-idx="${indice}" aria-hidden="true">`
    + svg + `<div class="bt-horas-marcas">${marcas}${temperaturas}${lluvias}</div></div>`;
}

/**
 * Celda de un día.
 * @param {object} dia
 * @param {number} indice
 * @param {{ lang: string, weekStart: string, showHourly: boolean }} opciones
 * @returns {string}
 */
function pintarDia(dia, indice, { lang, weekStart, showHourly }) {
  const diaSemana = diaSemanaDe(dia.fecha);
  const nombre = indice === 0 ? t(lang, 'hoy') : nombreDia(lang, diaSemana);
  const codigo = codigoDe(dia.codigo);
  const descripcion = textoWmo(lang, codigo);
  const lluvia = dia.lluvia_pct ?? 0;

  let attrs = ` class="bt-dia" part="dia" data-idx="${indice}"`;
  if (indice === 0) {
    attrs += ' data-hoy';
  }
  if (indice > 0 && diaSemana === (weekStart === 'sunday' ? 0 : 1)) {
    attrs += ' data-semana-nueva';
  }
  if (showHourly) {
    attrs += ' tabindex="0"';
  }

  const etiqueta = [nombre, descripcion, t(lang, 'maxima', { n: numero(dia.tmax) }), t(lang, 'minima', { n: numero(dia.tmin) })];
  if (lluvia >= LLUVIA_MINIMA) {
    etiqueta.push(t(lang, 'lluvia', { n: lluvia }));
  }

  return `<div${attrs} aria-label="${escapar(etiqueta.join(', '))}">`
    + `<span class="bt-nombre" part="dia-nombre">${escapar(nombre)}</span>`
    + `<span class="bt-dia-icono" part="dia-icono">${svgIcono(codigo, { etiqueta: descripcion, clase: 'bt-icono' })}</span>`
    + `<span class="bt-max" part="dia-max">${temperatura(dia.tmax)}</span>`
    + `<span class="bt-min" part="dia-min">${temperatura(dia.tmin)}</span>`
    + `<span class="bt-lluvia" part="dia-lluvia">${lluvia >= LLUVIA_MINIMA ? `${GOTA}${lluvia}%` : ''}</span>`
    + '</div>';
}

/**
 * HTML interno del widget ya cargado.
 * @param {{ datos: object, config: object }} entrada
 * @returns {string}
 */
export function pintar({ datos, config }) {
  if (!datos || !Array.isArray(datos.dias) || datos.dias.length === 0) {
    return pintarMensaje({ config, tipo: 'vacio' });
  }

  const lang = config.lang;
  const dias = datos.dias;
  const horas = Array.isArray(datos.horas) ? datos.horas : [];
  const ahora = horaActual(datos.zona);

  const grupos = new Map();
  for (const h of horas) {
    const fecha = String(h.t ?? '').substring(0, 10);
    if (!grupos.has(fecha)) {
      grupos.set(fecha, []);
    }
    grupos.get(fecha).push(h);
  }

  const banda = trazadoBanda(dias);
  const comun = { lang, weekStart: config.weekStart, showHourly: config.showHourly };

  let html = `<svg class="bt-sprite" aria-hidden="true" focusable="false"><defs>${fundiciones()}</defs></svg>`;
  html += `<section class="bt" part="widget" data-lang="${escapar(lang)}">`;
  html += pintarCabecera(datos, config, lang);
  html += `<div class="bt-tiempo" part="dias" style="--bt-dias:${dias.length}">`;
  html += pintarBanda(banda);

  if (config.showHourly) {
    dias.forEach((dia, i) => {
      const horasDia = grupos.get(dia.fecha) ?? [];
      html += pintarHoras(horasDia, i, {
        paso: config.hourlyStep,
        ahora: i === 0 ? ahora : null,
        lang,
      });
    });
  }

  dias.forEach((dia, i) => {
    html += pintarDia(dia, i, comun);
  });

  html += '</div>';
  html += '<footer class="bt-pie" part="pie"><span class="bt-fuente">Open-Meteo</span></footer>';
  html += '</section>';
  return html;
}

/**
 * HTML de un estado sin datos.
 * @param {{ config: object, tipo: 'cargando'|'error'|'vacio', mensaje?: string }} entrada
 * @returns {string}
 */
export function pintarMensaje({ config, tipo, mensaje }) {
  const lang = config.lang;
  const texto = typeof mensaje === 'string' && mensaje !== '' ? mensaje : null;

  if (tipo === 'cargando') {
    const dias = Number.isInteger(config.days) && config.days > 0 ? config.days : 7;
    let bloques = '';
    for (let i = 0; i < dias; i++) {
      bloques += '<span class="bt-esq-dia"></span>';
    }
    return `<section class="bt bt-esqueleto" part="esqueleto" data-lang="${escapar(lang)}"`
      + ` role="status" aria-busy="true" aria-label="${escapar(t(lang, 'cargando'))}">`
      + '<span class="bt-esq-titulo"></span><span class="bt-esq-ahora"></span>'
      + `<div class="bt-esq-dias" style="--bt-dias:${dias}">${bloques}</div></section>`;
  }

  if (tipo === 'error') {
    return `<section class="bt bt-vacio" part="vacio" role="alert">`
      + `<p class="bt-vacio-texto">${escapar(texto ?? t(lang, 'errorGenerico'))}</p></section>`;
  }

  if (tipo === 'vacio') {
    return `<section class="bt bt-vacio" part="vacio" role="status">`
      + `<p class="bt-vacio-texto">${escapar(texto ?? t(lang, 'sinDatos'))}</p></section>`;
  }

  throw new RangeError(`tipo de mensaje desconocido: ${String(tipo)}`);
}
