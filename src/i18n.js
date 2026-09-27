/**
 * Módulo i18n: textos de interfaz, nombres de día y descripciones WMO.
 * Castellano como idioma de respaldo. Sin dependencias.
 */

/** @typedef {Record<string, string>} Diccionario */

/** Idiomas incluidos de serie. */
export const IDIOMAS = ['es', 'en'];

/** Formato admitido para un código de idioma: `xx` o `xx-yy`, en minúsculas. */
const FORMATO_IDIOMA = /^[a-z]{2}(-[a-z]{2})?$/;

/** Textos base en castellano. */
const DICCIONARIO_ES = {
  cargando: 'Cargando previsión…',
  sinConexion: 'Sin conexión con Open-Meteo',
  sinDatos: 'sin datos',
  errorGenerico: 'No se pudo cargar la previsión',
  cambiarCiudad: 'Cambiar de ciudad',
  buscarCiudad: 'Ciudad de la previsión',
  ciudades: 'Ciudades encontradas',
  hoy: 'hoy',
  sensacion: 'sensación {n}°',
  humedad: '{n}% humedad',
  viento: '{n} km/h',
  vientoImperial: '{n} mph',
  lluvia: 'lluvia {n}%',
  maxima: 'máxima {n}°',
  minima: 'mínima {n}°',
  actualizado: 'actualizado',
  noEncontrado: 'No se encontró {lugar}',
  faltaLugar: 'Indica un lugar o unas coordenadas',
};

/** Textos base en inglés. */
const DICCIONARIO_EN = {
  cargando: 'Loading forecast…',
  sinConexion: 'No connection to Open-Meteo',
  sinDatos: 'no data',
  errorGenerico: 'Could not load the forecast',
  cambiarCiudad: 'Change city',
  buscarCiudad: 'Forecast city',
  ciudades: 'Cities found',
  hoy: 'today',
  sensacion: 'feels like {n}°',
  humedad: '{n}% humidity',
  viento: '{n} km/h',
  vientoImperial: '{n} mph',
  lluvia: 'rain {n}%',
  maxima: 'high {n}°',
  minima: 'low {n}°',
  actualizado: 'updated',
  noEncontrado: '{lugar} not found',
  faltaLugar: 'Set a place or coordinates',
};

/** Diccionarios por idioma. Se muta al registrar idiomas nuevos. */
const DICCIONARIOS = {
  es: DICCIONARIO_ES,
  en: DICCIONARIO_EN,
};

/** Descripciones WMO por código, en castellano. */
const WMO_ES = {
  0: 'despejado',
  1: 'mayormente despejado',
  2: 'parcialmente nublado',
  3: 'nublado',
  45: 'niebla',
  48: 'niebla con escarcha',
  51: 'llovizna ligera',
  53: 'llovizna moderada',
  55: 'llovizna densa',
  56: 'llovizna helada ligera',
  57: 'llovizna helada densa',
  61: 'lluvia ligera',
  63: 'lluvia moderada',
  65: 'lluvia intensa',
  66: 'lluvia helada ligera',
  67: 'lluvia helada intensa',
  71: 'nieve ligera',
  73: 'nieve moderada',
  75: 'nieve intensa',
  77: 'granos de nieve',
  80: 'chubascos ligeros',
  81: 'chubascos moderados',
  82: 'chubascos violentos',
  85: 'chubascos de nieve ligeros',
  86: 'chubascos de nieve intensos',
  95: 'tormenta',
  96: 'tormenta con granizo ligero',
  99: 'tormenta con granizo intenso',
};

/** Descripciones WMO por código, en inglés. */
const WMO_EN = {
  0: 'clear sky',
  1: 'mainly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'depositing rime fog',
  51: 'light drizzle',
  53: 'moderate drizzle',
  55: 'dense drizzle',
  56: 'light freezing drizzle',
  57: 'dense freezing drizzle',
  61: 'slight rain',
  63: 'moderate rain',
  65: 'heavy rain',
  66: 'light freezing rain',
  67: 'heavy freezing rain',
  71: 'slight snowfall',
  73: 'moderate snowfall',
  75: 'heavy snowfall',
  77: 'snow grains',
  80: 'slight rain showers',
  81: 'moderate rain showers',
  82: 'violent rain showers',
  85: 'slight snow showers',
  86: 'heavy snow showers',
  95: 'thunderstorm',
  96: 'thunderstorm with slight hail',
  99: 'thunderstorm with heavy hail',
};

/** Nombres cortos de día por idioma, de domingo (0) a sábado (6). */
const DIAS = {
  es: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

/**
 * Comprueba que el diccionario es un objeto plano.
 * @param {unknown} valor
 * @returns {boolean}
 */
function esObjeto(valor) {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/**
 * Añade o reemplaza un diccionario. Las claves que falten se toman de 'es'.
 * @param {string} codigo - Formato `xx` o `xx-yy`, en minúsculas.
 * @param {Record<string, string>} diccionario - Clave -> texto, con marcadores `{nombre}`.
 */
export function registrarIdioma(codigo, diccionario) {
  if (typeof codigo !== 'string' || !FORMATO_IDIOMA.test(codigo)) {
    throw new TypeError(
      `registrarIdioma: código de idioma inválido (${String(codigo)}). ` +
        'Se espera "xx" o "xx-yy", en minúsculas.',
    );
  }
  if (!esObjeto(diccionario)) {
    throw new TypeError(
      'registrarIdioma: el diccionario debe ser un objeto de clave -> texto.',
    );
  }
  DICCIONARIOS[codigo] = diccionario;
}

/** @returns {boolean} true si el idioma está registrado (incluidos 'es' y 'en'). */
export function tieneIdioma(codigo) {
  return Object.prototype.hasOwnProperty.call(DICCIONARIOS, codigo);
}

/**
 * Sustituye en `texto` cada aparición de `{clave}` por `params[clave]`.
 * Los marcadores sin parámetro se dejan tal cual.
 * @param {string} texto
 * @param {Record<string, string|number>} [params]
 * @returns {string}
 */
function sustituir(texto, params) {
  if (!params) {
    return texto;
  }
  let resultado = texto;
  for (const clave of Object.keys(params)) {
    resultado = resultado.split(`{${clave}}`).join(String(params[clave]));
  }
  return resultado;
}

/**
 * Texto de una clave, sustituyendo `{x}` por `params.x`.
 * @param {string} lang
 * @param {string} clave
 * @param {Record<string, string|number>} [params]
 * @returns {string}
 */
export function t(lang, clave, params) {
  const diccionario = DICCIONARIOS[lang];
  let plantilla;
  if (diccionario && Object.prototype.hasOwnProperty.call(diccionario, clave)) {
    plantilla = diccionario[clave];
  } else if (Object.prototype.hasOwnProperty.call(DICCIONARIOS.es, clave)) {
    plantilla = DICCIONARIOS.es[clave];
  } else {
    // Sin texto: se usa la propia clave como plantilla (marcador visible).
    plantilla = clave;
  }
  return sustituir(plantilla, params);
}

/**
 * Descripción de un código WMO.
 * @param {string} lang
 * @param {number} codigo
 * @returns {string} Descripción; si el código no está, `t(lang, 'sinDatos')`.
 */
export function textoWmo(lang, codigo) {
  if (!Object.prototype.hasOwnProperty.call(WMO_ES, codigo)) {
    return t(lang, 'sinDatos');
  }
  const tabla = { es: WMO_ES, en: WMO_EN }[lang];
  if (tabla) {
    return tabla[codigo];
  }
  return WMO_ES[codigo];
}

/**
 * Nombre corto del día de la semana.
 * @param {string} lang
 * @param {number} diaSemana - 0 = domingo ... 6 = sábado.
 * @returns {string}
 */
export function nombreDia(lang, diaSemana) {
  if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6) {
    throw new RangeError(
      `nombreDia: día ${String(diaSemana)} fuera de rango. Se admite un entero de 0 (domingo) a 6 (sábado).`,
    );
  }
  const tabla = DIAS[lang] ?? DIAS.es;
  return tabla[diaSemana];
}
