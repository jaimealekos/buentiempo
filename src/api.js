/**
 * Módulo `api`: consulta Open-Meteo (previsión y geocodificación) con un `fetch`
 * inyectable y normaliza la previsión a la forma de datos del widget.
 * No hace red por sí mismo si se le pasa `fetchImpl`; sin él usa `globalThis.fetch`.
 */

export const URL_PREVISION = 'https://api.open-meteo.com/v1/forecast';
export const URL_GEOCODIFICACION = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * @typedef {object} Lugar
 * @property {string} nombre
 * @property {string} region
 * @property {string} pais
 * @property {number} lat
 * @property {number} lon
 * @property {string} zona       // IANA; '' si Open-Meteo no la da
 */

/**
 * @typedef {object} Datos
 * @property {number} ts
 * @property {string} zona
 * @property {string} lugar
 * @property {string} pais
 * @property {{ temp: number|null, sensacion: number|null, humedad: number|null,
 *             codigo: number, viento: number|null, de_dia: boolean }} actual
 * @property {Array<object>} dias
 * @property {Array<object>} horas
 */

// Campos que fija la forma `Datos`; el orden es el de la consulta a Open-Meteo.
const CAMPOS_ACTUAL = 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day';
const CAMPOS_DIARIO = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,uv_index_max,sunrise,sunset';
const CAMPOS_HORARIO = 'temperature_2m,weather_code,precipitation_probability';

/**
 * Quita acentos y pasa a minúsculas para comparar nombres de país.
 * @param {string} texto
 * @returns {string}
 */
function normalizarTexto(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Devuelve `lista[i]` si `lista` es un array, `i` está en rango y el valor no es
 * `null`/`undefined`; en cualquier otro caso, `defecto`.
 * @param {unknown} lista
 * @param {number} i
 * @param {unknown} defecto
 */
function en(lista, i, defecto) {
  if (!Array.isArray(lista) || i < 0 || i >= lista.length) return defecto;
  const valor = lista[i];
  return valor === null || valor === undefined ? defecto : valor;
}

/**
 * Convierte un resultado crudo de geocodificación en un `Lugar`.
 * @param {object} resultado
 */
function aLugar(resultado) {
  return {
    nombre: resultado.name,
    region: resultado.admin1 ?? '',
    pais: resultado.country ?? '',
    lat: resultado.latitude,
    lon: resultado.longitude,
    zona: resultado.timezone ?? ''
  };
}

/**
 * Busca ciudades por nombre.
 * Si el aborto se detecta por la causa del error devuelto, el llamador puede
 * comprobarlo con `e.name === 'AbortError' || e.cause?.name === 'AbortError'`.
 * @param {string} nombre
 * @param {{ lang?: string, pais?: string, limite?: number,
 *           signal?: AbortSignal, fetchImpl?: typeof fetch }} [opciones]
 * @returns {Promise<Lugar[]>} [] si no hay resultados.
 */
export async function geocodificar(nombre, opciones = {}) {
  const lang = opciones.lang ?? 'es';
  const pais = opciones.pais ?? '';
  const limite = opciones.limite ?? 6;
  const signal = opciones.signal;
  const fetchImpl = opciones.fetchImpl ?? globalThis.fetch;

  const url = `${URL_GEOCODIFICACION}?name=${encodeURIComponent(nombre)}&count=${limite}&language=${lang}&format=json`;

  const init = { mode: 'cors' };
  if (signal !== undefined) init.signal = signal;

  let respuesta;
  try {
    respuesta = await fetchImpl(url, init);
  } catch (cause) {
    throw new Error('geocodificación: no se pudo consultar Open-Meteo', { cause });
  }
  if (!respuesta.ok) {
    throw new Error(`geocodificación: Open-Meteo respondió ${respuesta.status}`);
  }

  const cuerpo = await respuesta.json();
  const resultados = Array.isArray(cuerpo?.results) ? cuerpo.results : [];
  const lugares = resultados
    .filter((r) => r && r.name !== null && r.name !== undefined && r.name !== ''
      && Number.isFinite(r.latitude) && Number.isFinite(r.longitude))
    .map(aLugar);

  if (!pais) return lugares;

  const objetivo = normalizarTexto(pais);
  const coinciden = [];
  const resto = [];
  for (const lugar of lugares) {
    (normalizarTexto(lugar.pais).includes(objetivo) ? coinciden : resto).push(lugar);
  }
  return [...coinciden, ...resto];
}

/**
 * Pide la previsión y la normaliza.
 * Si el aborto se detecta por la causa del error devuelto, el llamador puede
 * comprobarlo con `e.name === 'AbortError' || e.cause?.name === 'AbortError'`.
 * @param {{ lat: number, lon: number, zona?: string, dias?: number,
 *           unidades?: 'metric'|'imperial', lugar?: string, pais?: string,
 *           signal?: AbortSignal, fetchImpl?: typeof fetch }} opciones
 * @returns {Promise<Datos>} forma `Datos`.
 */
export async function pedirPrevision(opciones) {
  const lat = opciones.lat;
  const lon = opciones.lon;
  const zona = opciones.zona;
  const dias = opciones.dias ?? 7;
  const unidades = opciones.unidades;
  const lugar = opciones.lugar ?? '';
  const pais = opciones.pais ?? '';
  const signal = opciones.signal;
  const fetchImpl = opciones.fetchImpl ?? globalThis.fetch;

  const params = new URLSearchParams();
  params.set('latitude', String(lat));
  params.set('longitude', String(lon));
  params.set('timezone', zona && zona !== 'auto' ? zona : 'auto');
  params.set('forecast_days', String(dias));
  params.set('timeformat', 'iso8601');
  params.set('current', CAMPOS_ACTUAL);
  params.set('daily', CAMPOS_DIARIO);
  params.set('hourly', CAMPOS_HORARIO);
  if (unidades === 'imperial') {
    params.set('temperature_unit', 'fahrenheit');
    params.set('wind_speed_unit', 'mph');
    params.set('precipitation_unit', 'inch');
  }
  const url = `${URL_PREVISION}?${params.toString()}`;

  const init = { mode: 'cors' };
  if (signal !== undefined) init.signal = signal;

  let respuesta;
  try {
    respuesta = await fetchImpl(url, init);
  } catch (cause) {
    throw new Error('previsión: no se pudo consultar Open-Meteo', { cause });
  }
  if (!respuesta.ok) {
    throw new Error(`previsión: Open-Meteo respondió ${respuesta.status}`);
  }

  const crudo = await respuesta.json();
  if (crudo === null || typeof crudo !== 'object'
    || !Array.isArray(crudo.daily?.time) || crudo.daily.time.length === 0) {
    throw new Error('previsión: Open-Meteo no devolvió días');
  }

  return normalizarPrevision(crudo, { zona, lugar, pais });
}

/**
 * Normaliza una respuesta cruda de Open-Meteo. Pura: no hace red ni lee relojes
 * si se le pasa `ts`.
 * @param {object} crudo - JSON de /v1/forecast.
 * @param {{ lugar?: string, pais?: string, zona?: string, ts?: number }} [meta]
 * @returns {Datos} forma `Datos`.
 */
export function normalizarPrevision(crudo, meta) {
  const datos = crudo ?? {};
  const info = meta ?? {};

  const diario = datos.daily ?? {};
  const fechas = Array.isArray(diario.time) ? diario.time : [];
  const dias = fechas.map((fecha, i) => ({
    fecha,
    codigo: en(diario.weather_code, i, 0),
    tmax: en(diario.temperature_2m_max, i, null),
    tmin: en(diario.temperature_2m_min, i, null),
    lluvia_pct: en(diario.precipitation_probability_max, i, 0),
    lluvia_mm: en(diario.precipitation_sum, i, 0),
    viento: en(diario.wind_speed_10m_max, i, 0),
    uv: en(diario.uv_index_max, i, 0),
    amanece: en(diario.sunrise, i, ''),
    anochece: en(diario.sunset, i, '')
  }));

  const horario = datos.hourly ?? {};
  const horasFuente = Array.isArray(horario.time) ? horario.time : [];
  const horas = horasFuente.map((t, i) => ({
    t,
    temp: en(horario.temperature_2m, i, null),
    codigo: en(horario.weather_code, i, 0),
    lluvia_pct: en(horario.precipitation_probability, i, 0)
  }));

  return {
    ts: info.ts ?? Date.now(),
    zona: datos.timezone ?? info.zona ?? '',
    lugar: info.lugar ?? '',
    pais: info.pais ?? '',
    actual: {
      temp: datos.current?.temperature_2m ?? null,
      sensacion: datos.current?.apparent_temperature ?? null,
      humedad: datos.current?.relative_humidity_2m ?? null,
      codigo: datos.current?.weather_code ?? 0,
      viento: datos.current?.wind_speed_10m ?? null,
      de_dia: Boolean(datos.current?.is_day ?? 1)
    },
    dias,
    horas
  };
}
