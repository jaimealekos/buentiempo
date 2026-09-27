# Módulo `api`

Nivel: normal.
Responsabilidad: pedir previsión y geocodificación a Open-Meteo con `fetch` inyectable y normalizar la previsión a la forma de datos del widget.

## Ficheros
- Código: `src/api.js`.
- Pruebas: `test/api.test.js` (con `fetchImpl` simulado; ninguna petición real).
- Vecinos de referencia para el estilo: `src/config.js`, `src/geometria.js`.

## Interfaz pública
```js
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
 * Busca ciudades por nombre.
 * @param {string} nombre
 * @param {{ lang?: string, pais?: string, limite?: number,
 *           signal?: AbortSignal, fetchImpl?: typeof fetch }} [opciones]
 * @returns {Promise<Lugar[]>} [] si no hay resultados.
 */
export async function geocodificar(nombre, opciones) {}

/**
 * Pide la previsión y la normaliza.
 * @param {{ lat: number, lon: number, zona?: string, dias?: number,
 *           unidades?: 'metric'|'imperial',
 *           signal?: AbortSignal, fetchImpl?: typeof fetch }} opciones
 * @returns {Promise<Datos>}
 */
export async function pedirPrevision(opciones) {}
// opciones admite además `lugar?: string` y `pais?: string`, que se pasan tal cual a normalizarPrevision.

/**
 * Normaliza una respuesta cruda de Open-Meteo. Pura: no hace red ni lee relojes
 * si se le pasa `ts`.
 * @param {object} crudo - JSON de /v1/forecast.
 * @param {{ lugar?: string, pais?: string, zona?: string, ts?: number }} [meta]
 * @returns {Datos}
 */
export function normalizarPrevision(crudo, meta) {}
```

### Forma `Datos`
```js
{
  ts: number,          // epoch en milisegundos de la consulta (meta.ts o Date.now())
  zona: string,        // timezone devuelta por Open-Meteo; meta.zona si el crudo no trae
  lugar: string,       // meta.lugar
  pais: string,        // meta.pais
  actual: {
    temp: number|null,       // current.temperature_2m
    sensacion: number|null,  // current.apparent_temperature
    humedad: number|null,    // current.relative_humidity_2m
    codigo: number,          // current.weather_code ?? 0
    viento: number|null,     // current.wind_speed_10m
    de_dia: boolean          // Boolean(current.is_day ?? 1)
  },
  dias: [{                 // uno por entrada de daily.time, en orden
    fecha: string,         // 'YYYY-MM-DD'
    codigo: number,        // daily.weather_code[i]             ?? 0
    tmax: number|null,     // daily.temperature_2m_max[i]
    tmin: number|null,     // daily.temperature_2m_min[i]
    lluvia_pct: number,    // daily.precipitation_probability_max[i] ?? 0
    lluvia_mm: number,     // daily.precipitation_sum[i]             ?? 0
    viento: number,        // daily.wind_speed_10m_max[i]            ?? 0
    uv: number,            // daily.uv_index_max[i]                  ?? 0
    amanece: string,       // daily.sunrise[i]  ?? ''
    anochece: string       // daily.sunset[i]   ?? ''
  }],
  horas: [{                // una por entrada de hourly.time, en orden
    t: string,             // 'YYYY-MM-DDTHH:MM'
    temp: number|null,     // hourly.temperature_2m[i]
    codigo: number,        // hourly.weather_code[i]                ?? 0
    lluvia_pct: number     // hourly.precipitation_probability[i]   ?? 0
  }]
}
```

Comportamiento:
- `signal` (opcional) se pasa tal cual a `fetch` en las dos funciones; una petición abortada rechaza con el error de «no se pudo consultar» y la causa `AbortError` en `cause`.
- `geocodificar`: construye `URL_GEOCODIFICACION?name=<encodeURIComponent(nombre)>&count=<limite ?? 6>&language=<lang ?? 'es'>&format=json`, y hace `fetchImpl(url, { mode: 'cors' })`. Espera `{ results?: [...] }`; convierte cada resultado en `Lugar` con `name`, `admin1`, `country`, `latitude`, `longitude`, `timezone`, y descarta resultados sin `name` o con `latitude`/`longitude` no finitos. Sin `results` devuelve `[]`. Si `pais` no está vacío, mueve al principio los lugares cuyo `pais` coincide (comparación sin acentos ni mayúsculas, por inclusión) manteniendo el orden relativo del resto.
- `pedirPrevision`: construye la URL con `latitude`, `longitude`, `timezone=<zona && zona !== 'auto' ? zona : 'auto'>`, `forecast_days=<dias ?? 7>`, `timeformat=iso8601`, y los campos `current`, `daily` y `hourly` listados arriba (los que fija la forma `Datos`). Si `unidades === 'imperial'` añade `temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`; con `'metric'` no añade nada. Tras validar, llama a `normalizarPrevision` con `{ zona, lugar, pais }` (los dos últimos, `''` si no vienen).
- `normalizarPrevision`: usa un ayudante `en(lista, i, defecto)` que devuelve `lista[i]` solo si `lista` es un array, `i` está en rango y el valor no es `null`/`undefined`; en cualquier otro caso, el defecto. Nunca lanza.

## Errores
- `Error` en `geocodificar`: si `fetchImpl` rechaza (red, CORS, abortado). Mensaje: `geocodificación: no se pudo consultar Open-Meteo`; la causa original va en `cause`.
- `Error` en `geocodificar`: si la respuesta HTTP no es `ok`. Mensaje: `geocodificación: Open-Meteo respondió <estado>`.
- `Error` en `pedirPrevision`: si `fetchImpl` rechaza. Mensaje: `previsión: no se pudo consultar Open-Meteo` (causa en `cause`).
- `Error` en `pedirPrevision`: si la respuesta HTTP no es `ok`. Mensaje: `previsión: Open-Meteo respondió <estado>`.
- `Error` en `pedirPrevision`: si el JSON no es un objeto o `daily.time` falta o está vacío. Mensaje: `previsión: Open-Meteo no devolvió días`.
- `normalizarPrevision` no lanza: campos ausentes se rellenan con los defectos de la forma `Datos`.

## Dependencias
- Internas: ninguna.
- Externas: ninguna. Usa `globalThis.fetch` si no se inyecta.

## Criterio de aceptación
1. `geocodificar('Valencia')` con un `fetchImpl` que devuelve `{ results: [{ name: 'Valencia', admin1: 'Comunitat Valenciana', country: 'España', latitude: 39.47, longitude: -0.37, timezone: 'Europe/Madrid' }] }` → `[{ nombre: 'Valencia', region: 'Comunitat Valenciana', pais: 'España', lat: 39.47, lon: -0.37, zona: 'Europe/Madrid' }]`.
2. La URL pedida incluye `name=Valencia`, `count=6`, `language=es`, `format=json`.
3. `geocodificar('zzz')` con `{}` → `[]`.
4. Resultados con `latitude` no numérica se descartan.
5. `geocodificar('Cordoba', { pais: 'España' })` coloca primero el resultado con `country: 'España'` y después el de `country: 'Argentina'`.
6. `geocodificar('x')` con un `fetchImpl` que rechaza → `Error` con mensaje `geocodificación: no se pudo consultar Open-Meteo`.
7. `pedirPrevision({ lat: 39.47, lon: -0.37 })` pide `latitude=39.47`, `longitude=-0.37`, `timezone=auto`, `forecast_days=7`, y los campos `current`, `daily`, `hourly`.
8. `pedirPrevision({ lat: 1, lon: 2, unidades: 'imperial' })` pide `temperature_unit=fahrenheit`, `wind_speed_unit=mph`, `precipitation_unit=inch`; con `'metric'` no incluye esos parámetros.
9. `pedirPrevision` con respuesta `{}` → `Error` con mensaje `previsión: Open-Meteo no devolvió días`.
10. `pedirPrevision` con HTTP 500 → `Error` con mensaje `previsión: Open-Meteo respondió 500`.
11. `normalizarPrevision(crudoCompleto, { lugar: 'Valencia', pais: 'España', zona: 'Europe/Madrid', ts: 1000 })` → `lugar === 'Valencia'`, `pais === 'España'`, `zona === 'Europe/Madrid'`, `ts === 1000`, y `dias` con un elemento por fecha con sus nueve cifras.
12. `normalizarPrevision({ daily: { time: ['2026-09-28'] } })` → un día con `codigo: 0`, `tmax: null`, `tmin: null`, `lluvia_pct: 0`, `lluvia_mm: 0`, `viento: 0`, `uv: 0`, `amanece: ''`, `anochece: ''`; `actual = { temp: null, sensacion: null, humedad: null, codigo: 0, viento: null, de_dia: true }`; `horas` vacío.
13. `normalizarPrevision({ daily: { time: ['2026-09-28'], temperature_2m_max: [0] } })` → `tmax === 0` (el cero no se sustituye por el defecto).
14. `normalizarPrevision({ current: { is_day: 0 } })` → `de_dia === false`.
15. `normalizarPrevision({ hourly: { time: ['2026-09-28T00:00'], temperature_2m: [null], weather_code: [3], precipitation_probability: [null] } })` → una hora con `temp: null`, `codigo: 3`, `lluvia_pct: 0`.

## Comando de pruebas
`node --test test/api.test.js`
