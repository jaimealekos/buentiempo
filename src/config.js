/** Módulo `config`: atributos del custom element -> objeto de configuración validado. */

/** Nombres de atributo (kebab-case) y su clave en el objeto de configuración. */
export const CLAVES = {
  latitude: 'lat', longitude: 'lon', place: 'place', country: 'country',
  days: 'days', lang: 'lang', units: 'units', timezone: 'timezone',
  theme: 'theme', 'hourly-step': 'hourlyStep', 'show-current': 'showCurrent',
  'show-hourly': 'showHourly', editable: 'editable', remember: 'remember',
  refresh: 'refresh', 'week-start': 'weekStart', animate: 'animate',
};

/** Valores por defecto de cada clave de configuración. */
export const DEFECTOS = {
  lat: null, lon: null, place: '', country: '', days: 7, lang: 'es',
  units: 'metric', timezone: 'auto', theme: 'auto', hourlyStep: 2,
  showCurrent: true, showHourly: true, editable: true, remember: false,
  refresh: 15, weekStart: 'monday', animate: true,
};

/** Clave de configuración -> nombre de atributo HTML. */
const ATRIBUTOS = Object.fromEntries(
  Object.entries(CLAVES).map(([nombre, clave]) => [clave, nombre]),
);

/** Número mínimo y máximo de días de previsión. */
const DIAS_MIN = 1;
const DIAS_MAX = 16;

/** Refresco mínimo en minutos (0 = no refrescar nunca). */
const REFRESCO_MIN = 0;

/** Paso horario mínimo en horas. */
const PASO_HORARIO_MIN = 1;

const UNIDADES = ['metric', 'imperial'];
const TEMAS = ['dark', 'light', 'auto'];
const INICIO_SEMANA = ['monday', 'sunday'];
const IDIOMA = /^[a-z]{2}(-[a-z]{2})?$/;

/** Devuelve el número del valor o `null` si está ausente o no es finito. */
function numeroFinito(valor) {
  if (valor == null) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

/** Número con defecto si el valor está ausente o no es finito. */
function leerNumero(valor, defecto) {
  const numero = numeroFinito(valor);
  return numero === null ? defecto : numero;
}

/** Booleano: `''`/`'true'`/`'1'` -> true, `'false'`/`'0'` -> false, resto -> defecto. */
function leerBooleano(valor, defecto) {
  if (valor == null) return defecto;
  if (valor === '' || valor === 'true' || valor === '1') return true;
  if (valor === 'false' || valor === '0') return false;
  return defecto;
}

/** Enum exacto; cualquier otro valor (incluido `null`) usa el defecto. */
function leerEnum(valor, permitidos, defecto) {
  return permitidos.includes(valor) ? valor : defecto;
}

/** Texto tal cual, sin recortar; ausente o vacío usa el defecto. */
function leerTexto(valor, defecto) {
  return valor == null || valor === '' ? defecto : valor;
}

/** Días: entero redondeado y ajustado al rango 1..16. */
function leerDias(valor) {
  const numero = leerNumero(valor, DEFECTOS.days);
  return Math.min(DIAS_MAX, Math.max(DIAS_MIN, Math.round(numero)));
}

/** Refresco: entero redondeado a la baja, nunca negativo (0 = nunca). */
function leerRefresco(valor) {
  const numero = leerNumero(valor, DEFECTOS.refresh);
  return Math.max(REFRESCO_MIN, Math.floor(numero));
}

/** Paso horario: entero redondeado a la baja, como mínimo 1. */
function leerPasoHorario(valor) {
  const numero = leerNumero(valor, DEFECTOS.hourlyStep);
  return Math.max(PASO_HORARIO_MIN, Math.floor(numero));
}

/** Idioma: `xx` o `xx-yy` en minúsculas; si no encaja, el defecto. */
function leerIdioma(valor, defecto) {
  if (valor == null) return defecto;
  const idioma = valor.toLowerCase();
  return IDIOMA.test(idioma) ? idioma : defecto;
}

/**
 * Lee los atributos de `fuente` y devuelve la configuración validada.
 * Nunca lanza: un valor inválido cae a su defecto.
 * @param {{ getAttribute(nombre: string): string | null }} fuente - Normalmente el propio elemento.
 * @returns {{
 *   lat: number|null, lon: number|null, place: string, country: string,
 *   days: number, lang: string, units: 'metric'|'imperial', timezone: string,
 *   theme: 'dark'|'light'|'auto', hourlyStep: number,
 *   showCurrent: boolean, showHourly: boolean, editable: boolean,
 *   remember: boolean, refresh: number, weekStart: 'monday'|'sunday',
 *   animate: boolean
 * }}
 */
export function leerConfig(fuente) {
  const bruto = {};
  for (const clave of Object.keys(DEFECTOS)) {
    bruto[clave] = fuente.getAttribute(ATRIBUTOS[clave]);
  }

  const lat = numeroFinito(bruto.lat);
  const lon = numeroFinito(bruto.lon);
  const hayCoordenadas = lat !== null && lon !== null;

  return {
    lat: hayCoordenadas ? lat : null,
    lon: hayCoordenadas ? lon : null,
    place: leerTexto(bruto.place, DEFECTOS.place),
    country: leerTexto(bruto.country, DEFECTOS.country),
    days: leerDias(bruto.days),
    lang: leerIdioma(bruto.lang, DEFECTOS.lang),
    units: leerEnum(bruto.units, UNIDADES, DEFECTOS.units),
    timezone: leerTexto(bruto.timezone, DEFECTOS.timezone),
    theme: leerEnum(bruto.theme, TEMAS, DEFECTOS.theme),
    hourlyStep: leerPasoHorario(bruto.hourlyStep),
    showCurrent: leerBooleano(bruto.showCurrent, DEFECTOS.showCurrent),
    showHourly: leerBooleano(bruto.showHourly, DEFECTOS.showHourly),
    editable: leerBooleano(bruto.editable, DEFECTOS.editable),
    remember: leerBooleano(bruto.remember, DEFECTOS.remember),
    refresh: leerRefresco(bruto.refresh),
    weekStart: leerEnum(bruto.weekStart, INICIO_SEMANA, DEFECTOS.weekStart),
    animate: leerBooleano(bruto.animate, DEFECTOS.animate),
  };
}
