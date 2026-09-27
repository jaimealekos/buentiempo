/**
 * Iconos. Devolver el SVG en línea del icono que corresponde a un código WMO,
 * con sus degradados compartidos.
 *
 * Los iconos van en línea, uno por día; no se usa `<use>` porque las
 * animaciones CSS no cruzan al árbol en sombra que crea. Los degradados
 * (`fundiciones`) se declaran una vez por Shadow DOM.
 */

/** Nombres de icono admitidos. */
export const NOMBRES = ['sol', 'sol-nubes', 'nublado', 'niebla', 'llovizna', 'lluvia',
  'nieve', 'chubascos', 'chubascos-nieve', 'tormenta'];

/**
 * Nombre de icono que corresponde a un código WMO.
 * @param {number} codigo
 * @returns {string} Uno de NOMBRES; 'nublado' para códigos desconocidos.
 */
export function cuerpoIcono(codigo) {
  if (codigo >= 0 && codigo <= 1) return 'sol';
  if (codigo === 2) return 'sol-nubes';
  if (codigo === 3) return 'nublado';
  if (codigo === 13 || codigo === 17 || codigo === 27 || codigo === 29 || (codigo >= 91 && codigo <= 99)) return 'tormenta';
  if ((codigo >= 10 && codigo <= 12) || codigo === 28 || (codigo >= 40 && codigo <= 49)) return 'niebla';
  if (codigo === 20 || (codigo >= 50 && codigo <= 59)) return 'llovizna';
  if (codigo === 21 || codigo === 24 || codigo === 25 || (codigo >= 60 && codigo <= 69)) return 'lluvia';
  if (codigo === 22 || codigo === 23 || codigo === 26 || (codigo >= 70 && codigo <= 79)) return 'nieve';
  if (codigo >= 80 && codigo <= 84) return 'chubascos';
  if (codigo >= 85 && codigo <= 90) return 'chubascos-nieve';
  return 'nublado';
}

/**
 * SVG completo y en línea del tiempo de un código WMO.
 * @param {number} codigo
 * @param {{ etiqueta?: string, clase?: string }} [opciones]
 *   `etiqueta`: descripción accesible. Si está vacía, el SVG es decorativo.
 *   `clase`: clase del `<svg>`. Defecto: `'bt-icono'`.
 * @returns {string}
 */
export function svgIcono(codigo, opciones = {}) {
  const nombre = cuerpoIcono(codigo);
  const cuerpo = cuerpos[nombre];
  const clase = opciones.clase ?? 'bt-icono';
  const etiqueta = opciones.etiqueta;

  if (etiqueta) {
    return `<svg class="${clase}" viewBox="0 0 32 32" role="img" aria-label="${escapar(etiqueta)}" data-icono="${nombre}"><title>${escapar(etiqueta)}</title>${cuerpo}</svg>`;
  }
  return `<svg class="${clase}" viewBox="0 0 32 32" aria-hidden="true" focusable="false" data-icono="${nombre}">${cuerpo}</svg>`;
}

/** `<defs>` con los cinco degradados compartidos. Se inyecta una vez por widget. */
export function fundiciones() {
  return '<linearGradient id="bt-s-masa" x1="0" y1="0" x2="1" y2="1"><stop offset="0"/><stop offset="1"/></linearGradient>'
    + '<linearGradient id="bt-s-masa-lejos" x1="0" y1="0" x2="1" y2="1"><stop offset="0"/><stop offset="1"/></linearGradient>'
    + '<linearGradient id="bt-s-masa-tormenta" x1="0" y1="0" x2="1" y2="1"><stop offset="0"/><stop offset="1"/></linearGradient>'
    + '<radialGradient id="bt-s-halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-opacity=".55"/><stop offset=".45" stop-opacity=".22"/><stop offset="1" stop-opacity="0"/></radialGradient>'
    + '<radialGradient id="bt-s-nucleo" cx=".5" cy=".5" r=".5" fx=".38" fy=".36"><stop offset="0"/><stop offset=".55"/><stop offset="1"/></radialGradient>';
}

/** Las pinceladas del sol, a cualquier centro y radio. */
// rayos: [token, grosor, d, opacidad|null]
function solPinceladas(cx, cy, radio, nucleo, rayos) {
  let svg = `<g class="sol"><circle class="halo" cx="${cx}" cy="${cy}" r="${radio}" fill="url(#bt-s-halo)" stroke="none"/><g class="rayos">`;
  for (const [color, grosor, d, opacidad] of rayos) {
    svg += `<path class="pincelada" stroke="var(--bt-${color})" stroke-width="${grosor}" d="${d}"${opacidad !== null ? ` opacity="${opacidad}"` : ''}/>`;
  }
  return `${svg}</g><circle class="nucleo" cx="${cx}" cy="${cy}" r="${nucleo}" fill="url(#bt-s-nucleo)" stroke="none"/></g>`;
}

/** La misma nube fría, subida para dejar sitio a lo que cae. */
function nubeCaida(y) {
  return '<g class="nube nube--fria">'
    + `<path class="masa" fill="url(#bt-s-masa)" stroke="none" d="M6.3 ${y}L4.8 ${y - 2.6}`
    + `C5.1 ${y - 6.1} 8.1 ${y - 7.2} 10.8 ${y - 6.1}`
    + `C11.4 ${y - 9.9} 15.4 ${y - 12.1} 18.8 ${y - 10.7}`
    + `C21 ${y - 10.3} 22.4 ${y - 8.6} 21.9 ${y - 7}`
    + `C25.4 ${y - 7.9} 28.1 ${y - 4.4} 26.1 ${y}`
    + `C21.5 ${y + 0.7} 12.3 ${y + 0.7} 6.3 ${y}Z"/>`
    + `<path class="pliegue" stroke="var(--bt-ultramar)" stroke-width="2.2" d="M13.7 ${y - 2.9}`
    + `C16.5 ${y - 4} 19.2 ${y - 3.7} 21.3 ${y - 2.4}" opacity="0.6"/>`
    + `<path class="sombra" stroke="var(--bt-cobalto)" stroke-width="3.1" d="M17.8 ${y + 0.4}`
    + `C22 ${y + 0.6} 25 ${y - 0.7} 26.3 ${y - 4}" stroke-linecap="butt"/>`
    + `<path class="luz" stroke="var(--bt-celeste)" stroke-width="3.3" d="M7 ${y - 3.9}`
    + `C9.1 ${y - 7} 12.3 ${y - 7.9} 14.5 ${y - 7.4}"/>`
    + `<path class="luz" stroke="var(--bt-celeste)" stroke-width="2.9" d="M14.7 ${y - 10.3}`
    + `C17.1 ${y - 11.6} 20 ${y - 10.5} 21.3 ${y - 8.5}"/>`
    + `<path class="brillo" stroke="var(--bt-blanco-sol)" stroke-width="2.2" d="M9.7 ${y - 6.3}`
    + `L11.8 ${y - 7.5}"/>`
    + `<path class="reflejo" stroke="var(--bt-turquesa)" stroke-width="1.8" d="M9.6 ${y + 0.5}`
    + `L14.2 ${y + 0.6}" opacity="0.85"/></g>`;
}

/** Una gota: cobalto con la cara izquierda en turquesa. */
function gota(d, dLuz, g) {
  return `<g class="gota"><path class="agua" stroke="var(--bt-cobalto)" stroke-width="${g}" d="${d}"/>`
    + `<path class="agua-luz" stroke="var(--bt-turquesa)" stroke-width="${g / 2}" d="${dLuz}" opacity="0.9"/></g>`;
}

/** Un copo: un toque blanco con su sombra celeste abajo a la derecha. */
function copo(x, y, r) {
  return `<g class="copo"><circle cx="${x + .8}" cy="${y + .9}" r="${r}" fill="var(--bt-celeste)" stroke="none"/>`
    + `<circle cx="${x}" cy="${y}" r="${r}" fill="var(--bt-blanco-sol)" stroke="none"/></g>`;
}

const solGrande = solPinceladas(16, 16, 14, 5.6, [
  ['naranja-cadmio', 2.8, 'M9.7 12.4L5.3 9.8', null], ['crema-luz', 1.7, 'M13.3 9.3L10.8 3', null],
  ['naranja-cadmio', 3.1, 'M17.5 8.9L18.6 3.7', null], ['crema-luz', 2.4, 'M21.6 11.3L23.9 9.3', null],
  ['naranja-cadmio', 2.8, 'M23.3 16.6L28.8 17.1', null], ['crema-luz', 1.7, 'M21.4 20.9L26.6 25.6', null],
  ['naranja-cadmio', 2.9, 'M17.8 23.1L18.7 26.9', null], ['naranja-cadmio', 2.7, 'M12.6 22.4L10.2 26.9', null],
  ['crema-luz', 2.2, 'M9.3 19L6.3 20.3', null], ['violeta-sombra', 1.7, 'M23.7 13.5L26.4 12.6', '0.8'],
  ['violeta-sombra', 1.7, 'M15 24.1L14.7 26.8', '0.8'], ['violeta-sombra', 1.7, 'M10 21.4L8.2 23', '0.8'],
]);

const solMedio = solPinceladas(11, 10, 10, 4, [
  ['naranja-cadmio', 2, 'M6.5 7.4L3.4 5.6', null], ['crema-luz', 1.2, 'M9.1 5.2L7.3 0.7', null],
  ['naranja-cadmio', 2.2, 'M12.1 4.9L12.9 1.2', null], ['crema-luz', 1.7, 'M15 6.7L16.7 5.2', null],
  ['naranja-cadmio', 2, 'M16.2 10.5L20.2 10.8', null], ['crema-luz', 1.2, 'M14.9 13.5L18.6 16.8', null],
  ['naranja-cadmio', 2.1, 'M12.3 15L12.9 17.8', null], ['naranja-cadmio', 1.9, 'M8.6 14.6L6.9 17.8', null],
  ['crema-luz', 1.6, 'M6.2 12.1L4.1 13.1', null], ['violeta-sombra', 1.2, 'M16.5 8.2L18.4 7.6', '0.8'],
  ['violeta-sombra', 1.2, 'M10.3 15.8L10 17.7', '0.8'], ['violeta-sombra', 1.2, 'M6.7 13.9L5.4 15', '0.8'],
]);

const solPequeno = solPinceladas(9, 8.5, 8.5, 3.4, [
  ['naranja-cadmio', 1.7, 'M5.2 6.3L2.5 4.8', null], ['crema-luz', 1, 'M7.3 4.4L5.8 0.6', null],
  ['naranja-cadmio', 1.9, 'M9.9 4.2L10.6 1', null], ['crema-luz', 1.4, 'M12.4 5.7L13.8 4.5', null],
  ['naranja-cadmio', 1.7, 'M13.4 8.9L16.8 9.2', null], ['crema-luz', 1, 'M12.3 11.5L15.4 14.3', null],
  ['naranja-cadmio', 1.8, 'M10.1 12.8L10.6 15.1', null], ['naranja-cadmio', 1.6, 'M6.9 12.4L5.5 15.1', null],
  ['crema-luz', 1.4, 'M5 10.3L3.1 11.1', null], ['violeta-sombra', 1, 'M13.7 7L15.3 6.5', '0.8'],
  ['violeta-sombra', 1, 'M8.4 13.4L8.2 15.1', '0.8'], ['violeta-sombra', 1, 'M5.3 11.8L4.3 12.8', '0.8'],
]);

const nubeSol = '<g class="nube nube--sol">'
  + '<path class="masa" fill="url(#bt-s-masa)" stroke="none" d="M8.5 24.8L6.9 22.1C7.3 18.5 10.3 17.3 13.2 18.5C13.8 14.5 17.9 12.2 21.4 13.7C23.6 14.1 25.1 15.8 24.6 17.5C28.2 16.6 31 20.2 28.9 24.8C24.2 25.5 14.7 25.5 8.5 24.8Z"/>'
  + '<path class="pliegue" stroke="var(--bt-ultramar)" stroke-width="2.3" d="M16.1 21.7C19 20.6 21.8 20.9 24 22.3" opacity="0.6"/>'
  + '<path class="sombra" stroke="var(--bt-cobalto)" stroke-width="3.2" d="M20.4 25.1C24.7 25.3 27.8 24 29.1 20.6" stroke-linecap="butt"/>'
  + '<path class="luz" stroke="var(--bt-crema-luz)" stroke-width="3.4" d="M9.2 20.8C11.4 17.5 14.7 16.6 17 17.1"/>'
  + '<path class="luz" stroke="var(--bt-crema-luz)" stroke-width="3" d="M17.2 14.1C19.6 12.8 22.7 13.9 24 16"/>'
  + '<path class="brillo" stroke="var(--bt-blanco-sol)" stroke-width="2.3" d="M12 18.3L14.1 17"/>'
  + '<path class="reflejo" stroke="var(--bt-turquesa)" stroke-width="1.9" d="M11.9 25.2L16.6 25.4" opacity="0.85"/></g>';

const nubeFria = '<g class="nube nube--fria">'
  + '<path class="masa" fill="url(#bt-s-masa)" stroke="none" d="M4 24.8L2.4 22.1C2.8 18.5 5.8 17.3 8.7 18.5C9.2 14.5 13.4 12.2 16.9 13.7C19.1 14.1 20.6 15.8 20.1 17.5C23.7 16.6 26.5 20.2 24.4 24.8C19.7 25.5 10.2 25.5 4 24.8Z"/>'
  + '<path class="pliegue" stroke="var(--bt-ultramar)" stroke-width="2.3" d="M11.6 21.7C14.5 20.6 17.3 20.9 19.5 22.3" opacity="0.6"/>'
  + '<path class="sombra" stroke="var(--bt-cobalto)" stroke-width="3.2" d="M15.9 25.1C20.2 25.3 23.3 24 24.6 20.6" stroke-linecap="butt"/>'
  + '<path class="luz" stroke="var(--bt-celeste)" stroke-width="3.4" d="M4.7 20.8C6.9 17.5 10.2 16.6 12.5 17.1"/>'
  + '<path class="luz" stroke="var(--bt-celeste)" stroke-width="3" d="M12.7 14.1C15.1 12.8 18.2 13.9 19.5 16"/>'
  + '<path class="brillo" stroke="var(--bt-blanco-sol)" stroke-width="2.3" d="M7.5 18.3L9.6 17"/>'
  + '<path class="reflejo" stroke="var(--bt-turquesa)" stroke-width="1.9" d="M7.4 25.2L12.1 25.4" opacity="0.85"/></g>';

const nubeChubascos = '<g class="nube nube--sol">'
  + '<path class="masa" fill="url(#bt-s-masa)" stroke="none" d="M9.6 19.8L8.1 17.4C8.5 14.1 11.2 13.1 13.7 14.1C14.2 10.6 18 8.5 21.1 9.9C23.1 10.2 24.4 11.8 23.9 13.3C27.2 12.4 29.7 15.7 27.9 19.8C23.6 20.4 15.1 20.4 9.6 19.8Z"/>'
  + '<path class="pliegue" stroke="var(--bt-ultramar)" stroke-width="2" d="M16.4 17C18.9 16 21.5 16.4 23.4 17.5" opacity="0.6"/>'
  + '<path class="sombra" stroke="var(--bt-cobalto)" stroke-width="2.9" d="M20.2 20.1C24 20.3 26.8 19.1 28 16" stroke-linecap="butt"/>'
  + '<path class="luz" stroke="var(--bt-crema-luz)" stroke-width="3.1" d="M10.2 16.2C12.1 13.3 15.1 12.4 17.1 12.9"/>'
  + '<path class="luz" stroke="var(--bt-crema-luz)" stroke-width="2.7" d="M17.3 10.2C19.5 9 22.2 10.1 23.4 11.9"/>'
  + '<path class="brillo" stroke="var(--bt-blanco-sol)" stroke-width="2" d="M12.7 14L14.6 12.8"/>'
  + '<path class="reflejo" stroke="var(--bt-turquesa)" stroke-width="1.7" d="M12.6 20.2L16.8 20.3" opacity="0.85"/></g>';

const cuerpos = {
  'sol': solGrande,
  'sol-nubes': solMedio + nubeSol,
  'nublado':
    '<g class="nube nube--lejos">'
    + '<path class="masa" fill="url(#bt-s-masa-lejos)" stroke="none" d="M12.9 15.6L11.7 13.6C12 10.8 14.3 10 16.5 10.8C16.9 7.8 20.1 6.1 22.7 7.2C24.4 7.5 25.5 8.8 25.1 10.1C27.8 9.4 30 12.1 28.4 15.6C24.8 16.2 17.6 16.2 12.9 15.6Z"/>'
    + '<path class="sombra" stroke="var(--bt-violeta-sombra)" stroke-width="2.4" d="M21.9 15.9C25.2 16 27.6 15 28.6 12.4" stroke-linecap="butt"/>'
    + '<path class="luz" stroke="var(--bt-celeste)" stroke-width="2.6" d="M13.4 12.6C15.1 10.1 17.6 9.4 19.3 9.8"/>'
    + '<path class="luz" stroke="var(--bt-celeste)" stroke-width="2.3" d="M19.5 7.5C21.4 6.5 23.7 7.4 24.7 9"/></g>'
    + nubeFria,
  'niebla':
    '<circle class="halo" cx="15" cy="12" r="11" fill="url(#bt-s-halo)" stroke="none"/>'
    + '<circle class="nucleo nucleo--velado" cx="15" cy="12" r="5.4" fill="url(#bt-s-nucleo)" stroke="none"/>'
    + '<path class="bruma" stroke="var(--bt-malva)" stroke-width="4.6" d="M4 9.6C10 8.4 17 10.8 25 9.4" opacity="0.72"/>'
    + '<path class="bruma" stroke="var(--bt-crema-luz)" stroke-width="5" d="M7 15.4C13 14.2 20 16.6 29 15" opacity="0.55"/>'
    + '<path class="bruma" stroke="var(--bt-celeste)" stroke-width="4.6" d="M3 21C9 20 16 22 24 20.6" opacity="0.72"/>'
    + '<path class="bruma" stroke="var(--bt-malva)" stroke-width="3.6" d="M9 26C14 25.2 18 26.8 23 26" opacity="0.62"/>',
  'llovizna': nubeCaida(16.6) + '<g class="caida">'
    + '<g class="dab"><circle cx="8.5" cy="23.5" r="1.6" fill="var(--bt-turquesa)" stroke="none"/><circle cx="8" cy="23" r="0.7" fill="var(--bt-blanco-sol)" stroke="none"/></g>'
    + '<g class="dab"><circle cx="13" cy="27" r="1.6" fill="var(--bt-turquesa)" stroke="none"/><circle cx="12.5" cy="26.5" r="0.7" fill="var(--bt-blanco-sol)" stroke="none"/></g>'
    + '<g class="dab"><circle cx="17.5" cy="23.8" r="1.6" fill="var(--bt-turquesa)" stroke="none"/><circle cx="17" cy="23.3" r="0.7" fill="var(--bt-blanco-sol)" stroke="none"/></g>'
    + '<g class="dab"><circle cx="22" cy="27.2" r="1.6" fill="var(--bt-turquesa)" stroke="none"/><circle cx="21.5" cy="26.7" r="0.7" fill="var(--bt-blanco-sol)" stroke="none"/></g>'
    + '<g class="dab"><circle cx="25.5" cy="23" r="1.6" fill="var(--bt-turquesa)" stroke="none"/><circle cx="25" cy="22.5" r="0.7" fill="var(--bt-blanco-sol)" stroke="none"/></g></g>',
  'lluvia': nubeCaida(15.6) + '<g class="caida">'
    + gota('M11.5 20L9.7 26.5', 'M10.2 20.6L8.4 26.1', 2.4)
    + gota('M17.5 21L15.7 27.5', 'M16.2 21.6L14.4 27.1', 2.4)
    + gota('M23.5 20L22 25.5', 'M22.2 20.6L20.7 25.1', 2.4) + '</g>',
  'nieve': nubeCaida(15.6) + '<g class="caida">'
    + copo(10.5, 23.5, 2) + copo(17, 27, 2) + copo(23, 23, 2) + '</g>',
  'chubascos': solPequeno + nubeChubascos + '<g class="caida">'
    + gota('M14.5 23L12.9 28.8', 'M13.2 23.6L11.6 28.4', 2.2)
    + gota('M20.5 24L18.9 29.8', 'M19.2 24.6L17.6 29.4', 2.2)
    + gota('M26 22.5L24.7 27.3', 'M24.7 23.1L23.4 26.9', 2) + '</g>',
  'chubascos-nieve': solPequeno + nubeChubascos + '<g class="caida">'
    + copo(13.5, 26, 1.8) + copo(20, 28, 1.8) + copo(25.5, 25, 1.8) + '</g>',
  'tormenta':
    '<g class="nube nube--tormenta">'
    + '<path class="masa" fill="url(#bt-s-masa-tormenta)" stroke="none" d="M6 15.8L4.4 13.1C4.8 9.5 7.8 8.3 10.7 9.5C11.2 5.5 15.4 3.2 18.9 4.7C21.1 5.1 22.6 6.8 22.1 8.5C25.7 7.6 28.5 11.2 26.4 15.8C21.7 16.5 12.2 16.5 6 15.8Z"/>'
    + '<path class="pliegue" stroke="var(--bt-ultramar)" stroke-width="2.3" d="M13.6 12.7C16.5 11.6 19.3 11.9 21.5 13.3" opacity="0.9"/>'
    + '<path class="sombra" stroke="var(--bt-ultramar)" stroke-width="3.2" d="M17.9 16.1C22.2 16.3 25.3 15 26.6 11.6" stroke-linecap="butt"/>'
    + '<path class="luz" stroke="var(--bt-violeta-sombra)" stroke-width="3.4" d="M6.7 11.8C8.9 8.5 12.2 7.6 14.5 8.2"/>'
    + '<path class="luz" stroke="var(--bt-violeta-sombra)" stroke-width="3" d="M14.7 5.1C17.1 3.8 20.2 4.9 21.5 7"/>'
    + '<path class="brillo" stroke="var(--bt-malva)" stroke-width="2.3" d="M9.5 9.3L11.6 8"/>'
    + '<path class="resplandor" stroke="var(--bt-naranja-cadmio)" stroke-width="2.7" d="M8.9 16.1L19.3 16.3" opacity="0.8"/></g>'
    + '<g class="rayo">'
    + '<path class="fuego" stroke="var(--bt-naranja-cadmio)" stroke-width="4.6" d="M18.5 15.5L14 22h4L14.5 29" opacity="0.8"/>'
    + '<path class="luz-rayo" stroke="var(--bt-blanco-sol)" stroke-width="2" d="M18.5 15.5L14 22h4L14.5 29"/></g>',
};

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escapar = (t) => String(t).replace(/[&<>"]/g, (c) => ESCAPES[c]);
