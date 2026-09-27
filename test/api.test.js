import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  URL_PREVISION,
  URL_GEOCODIFICACION,
  geocodificar,
  pedirPrevision,
  normalizarPrevision
} from '../src/api.js';

// --- Ayudas: `fetch` simulado, sin red -------------------------------------

function respuestaFalsa(cuerpo, { estado = 200, ok = estado >= 200 && estado < 300 } = {}) {
  return {
    ok,
    status: estado,
    async json() {
      return cuerpo;
    }
  };
}

function fetchDeCuerpo(cuerpo, estado) {
  const llamadas = [];
  const impl = async (url, init) => {
    llamadas.push({ url, init });
    return respuestaFalsa(cuerpo, { estado });
  };
  impl.llamadas = llamadas;
  return impl;
}

function fetchQueFalla(causa) {
  const llamadas = [];
  const impl = async (url, init) => {
    llamadas.push({ url, init });
    throw causa;
  };
  impl.llamadas = llamadas;
  return impl;
}

const CRUDO_MINIMO = { daily: { time: ['2026-09-28'] } };

// --- Constantes -------------------------------------------------------------

test('exporta las URLs de Open-Meteo', () => {
  assert.equal(URL_PREVISION, 'https://api.open-meteo.com/v1/forecast');
  assert.equal(URL_GEOCODIFICACION, 'https://geocoding-api.open-meteo.com/v1/search');
});

// --- geocodificar -----------------------------------------------------------

test('geocodificar convierte un resultado en un Lugar', async () => {
  const fetchImpl = fetchDeCuerpo({
    results: [{
      name: 'Valencia',
      admin1: 'Comunitat Valenciana',
      country: 'España',
      latitude: 39.47,
      longitude: -0.37,
      timezone: 'Europe/Madrid'
    }]
  });

  const lugares = await geocodificar('Valencia', { fetchImpl });

  assert.deepEqual(lugares, [{
    nombre: 'Valencia',
    region: 'Comunitat Valenciana',
    pais: 'España',
    lat: 39.47,
    lon: -0.37,
    zona: 'Europe/Madrid'
  }]);
});

test('geocodificar construye la URL con los parámetros por defecto', async () => {
  const fetchImpl = fetchDeCuerpo({ results: [] });

  await geocodificar('Valencia', { fetchImpl });

  const url = new URL(fetchImpl.llamadas[0].url);
  assert.equal(url.origin + url.pathname, URL_GEOCODIFICACION);
  assert.equal(url.searchParams.get('name'), 'Valencia');
  assert.equal(url.searchParams.get('count'), '6');
  assert.equal(url.searchParams.get('language'), 'es');
  assert.equal(url.searchParams.get('format'), 'json');
  assert.deepEqual(fetchImpl.llamadas[0].init, { mode: 'cors' });
});

test('geocodificar usa `limite` y `lang` cuando se pasan', async () => {
  const fetchImpl = fetchDeCuerpo({ results: [] });

  await geocodificar('Valencia', { fetchImpl, limite: 3, lang: 'en' });

  const url = new URL(fetchImpl.llamadas[0].url);
  assert.equal(url.searchParams.get('count'), '3');
  assert.equal(url.searchParams.get('language'), 'en');
});

test('geocodificar con limite/lang null cae a los defectos', async () => {
  const fetchImpl = fetchDeCuerpo({ results: [] });

  await geocodificar('Valencia', { fetchImpl, limite: null, lang: null });

  const url = new URL(fetchImpl.llamadas[0].url);
  assert.equal(url.searchParams.get('count'), '6');
  assert.equal(url.searchParams.get('language'), 'es');
});

test('geocodificar sin resultados devuelve []', async () => {
  const fetchImpl = fetchDeCuerpo({});
  assert.deepEqual(await geocodificar('zzz', { fetchImpl }), []);
});

test('geocodificar descarta resultados sin name o con coordenadas no finitas', async () => {
  const fetchImpl = fetchDeCuerpo({
    results: [
      { name: 'Buena', country: 'X', latitude: 10, longitude: 20, timezone: 'Z' },
      { name: 'Sin latitud', country: 'X', longitude: 20 },
      { name: 'Latitud texto', country: 'X', latitude: '39', longitude: 20 },
      { country: 'X', latitude: 1, longitude: 2 },
      { name: 'Sin longitud', country: 'X', latitude: 1 }
    ]
  });

  const lugares = await geocodificar('x', { fetchImpl });

  assert.deepEqual(lugares, [{
    nombre: 'Buena', region: '', pais: 'X', lat: 10, lon: 20, zona: 'Z'
  }]);
});

test('geocodificar con pais mueve al principio los coincidentes', async () => {
  const fetchImpl = fetchDeCuerpo({
    results: [
      { name: 'Córdoba', country: 'Argentina', latitude: -31.4, longitude: -64.18 },
      { name: 'Córdoba', country: 'España', latitude: 37.88, longitude: -4.78 },
      { name: 'Córdoba', country: 'México', latitude: 18.9, longitude: -96.9 }
    ]
  });

  const lugares = await geocodificar('Cordoba', { pais: 'España', fetchImpl });

  assert.deepEqual(lugares.map((l) => l.pais), ['España', 'Argentina', 'México']);
});

test('geocodificar compara el pais sin acentos ni mayúsculas', async () => {
  const fetchImpl = fetchDeCuerpo({
    results: [
      { name: 'A', country: 'ARGENTINA', latitude: 1, longitude: 1 },
      { name: 'B', country: 'España', latitude: 2, longitude: 2 }
    ]
  });

  const lugares = await geocodificar('x', { pais: 'espana', fetchImpl });

  assert.deepEqual(lugares.map((l) => l.nombre), ['B', 'A']);
});

test('geocodificar propaga el fallo de red con cause', async () => {
  const causa = new Error('sin red');
  const fetchImpl = fetchQueFalla(causa);

  await assert.rejects(
    () => geocodificar('x', { fetchImpl }),
    (error) => {
      assert.equal(error.message, 'geocodificación: no se pudo consultar Open-Meteo');
      assert.equal(error.cause, causa);
      return true;
    }
  );
});

test('geocodificar falla si la respuesta HTTP no es ok', async () => {
  const fetchImpl = fetchDeCuerpo({}, 503);

  await assert.rejects(
    () => geocodificar('x', { fetchImpl }),
    (error) => {
      assert.equal(error.message, 'geocodificación: Open-Meteo respondió 503');
      return true;
    }
  );
});

// --- pedirPrevision ---------------------------------------------------------

test('pedirPrevision construye la URL con los parámetros por defecto', async () => {
  const fetchImpl = fetchDeCuerpo(CRUDO_MINIMO);

  await pedirPrevision({ lat: 39.47, lon: -0.37, fetchImpl });

  const url = new URL(fetchImpl.llamadas[0].url);
  assert.equal(url.origin + url.pathname, URL_PREVISION);
  assert.equal(url.searchParams.get('latitude'), '39.47');
  assert.equal(url.searchParams.get('longitude'), '-0.37');
  assert.equal(url.searchParams.get('timezone'), 'auto');
  assert.equal(url.searchParams.get('forecast_days'), '7');
  assert.equal(url.searchParams.get('timeformat'), 'iso8601');
  for (const campo of ['current', 'daily', 'hourly']) {
    assert.ok(url.searchParams.get(campo), `falta el campo ${campo}`);
  }
  assert.deepEqual(fetchImpl.llamadas[0].init, { mode: 'cors' });
});

test('pedirPrevision usa zona y dias cuando se pasan', async () => {
  const fetchImpl = fetchDeCuerpo(CRUDO_MINIMO);

  await pedirPrevision({ lat: 1, lon: 2, zona: 'Europe/Madrid', dias: 3, fetchImpl });

  const url = new URL(fetchImpl.llamadas[0].url);
  assert.equal(url.searchParams.get('timezone'), 'Europe/Madrid');
  assert.equal(url.searchParams.get('forecast_days'), '3');
});

test('pedirPrevision con dias null cae al defecto de 7', async () => {
  const fetchImpl = fetchDeCuerpo(CRUDO_MINIMO);

  await pedirPrevision({ lat: 1, lon: 2, dias: null, fetchImpl });

  const url = new URL(fetchImpl.llamadas[0].url);
  assert.equal(url.searchParams.get('forecast_days'), '7');
});

test('pedirPrevision con unidades imperial añade los parámetros', async () => {
  const fetchImpl = fetchDeCuerpo(CRUDO_MINIMO);

  await pedirPrevision({ lat: 1, lon: 2, unidades: 'imperial', fetchImpl });

  const url = new URL(fetchImpl.llamadas[0].url);
  assert.equal(url.searchParams.get('temperature_unit'), 'fahrenheit');
  assert.equal(url.searchParams.get('wind_speed_unit'), 'mph');
  assert.equal(url.searchParams.get('precipitation_unit'), 'inch');
});

test('pedirPrevision con unidades metric no añade esos parámetros', async () => {
  const fetchImpl = fetchDeCuerpo(CRUDO_MINIMO);

  await pedirPrevision({ lat: 1, lon: 2, unidades: 'metric', fetchImpl });

  const url = new URL(fetchImpl.llamadas[0].url);
  assert.equal(url.searchParams.get('temperature_unit'), null);
  assert.equal(url.searchParams.get('wind_speed_unit'), null);
  assert.equal(url.searchParams.get('precipitation_unit'), null);
});

test('pedirPrevision pasa lugar y pais a la previsión normalizada', async () => {
  const fetchImpl = fetchDeCuerpo(CRUDO_MINIMO);

  const datos = await pedirPrevision({
    lat: 1, lon: 2, lugar: 'Valencia', pais: 'España', fetchImpl
  });

  assert.equal(datos.lugar, 'Valencia');
  assert.equal(datos.pais, 'España');
  assert.equal(datos.zona, '');
});

test('pedirPrevision con lugar y pais null los normaliza a cadena vacía', async () => {
  const fetchImpl = fetchDeCuerpo(CRUDO_MINIMO);

  const datos = await pedirPrevision({ lat: 1, lon: 2, lugar: null, pais: null, fetchImpl });

  assert.equal(datos.lugar, '');
  assert.equal(datos.pais, '');
});

test('pedirPrevision falla si la respuesta no trae días', async () => {
  const fetchImpl = fetchDeCuerpo({});

  await assert.rejects(
    () => pedirPrevision({ lat: 1, lon: 2, fetchImpl }),
    (error) => {
      assert.equal(error.message, 'previsión: Open-Meteo no devolvió días');
      return true;
    }
  );
});

test('pedirPrevision falla si el JSON no es un objeto', async () => {
  const fetchImpl = fetchDeCuerpo(null);

  await assert.rejects(
    () => pedirPrevision({ lat: 1, lon: 2, fetchImpl }),
    { message: 'previsión: Open-Meteo no devolvió días' }
  );
});

test('pedirPrevision falla si daily.time está vacío', async () => {
  const fetchImpl = fetchDeCuerpo({ daily: { time: [] } });

  await assert.rejects(
    () => pedirPrevision({ lat: 1, lon: 2, fetchImpl }),
    { message: 'previsión: Open-Meteo no devolvió días' }
  );
});

test('pedirPrevision falla si la respuesta HTTP no es ok', async () => {
  const fetchImpl = fetchDeCuerpo({}, 500);

  await assert.rejects(
    () => pedirPrevision({ lat: 1, lon: 2, fetchImpl }),
    (error) => {
      assert.equal(error.message, 'previsión: Open-Meteo respondió 500');
      return true;
    }
  );
});

test('pedirPrevision propaga el fallo de red con cause', async () => {
  const causa = new Error('CORS');
  const fetchImpl = fetchQueFalla(causa);

  await assert.rejects(
    () => pedirPrevision({ lat: 1, lon: 2, fetchImpl }),
    (error) => {
      assert.equal(error.message, 'previsión: no se pudo consultar Open-Meteo');
      assert.equal(error.cause, causa);
      return true;
    }
  );
});

// --- normalizarPrevision ----------------------------------------------------

test('normalizarPrevision normaliza un crudo completo', () => {
  const crudo = {
    current: {
      temperature_2m: 24.3,
      apparent_temperature: 25.1,
      relative_humidity_2m: 60,
      weather_code: 1,
      wind_speed_10m: 12.4,
      is_day: 1
    },
    daily: {
      time: ['2026-09-28', '2026-09-29'],
      weather_code: [1, 3],
      temperature_2m_max: [26, 25],
      temperature_2m_min: [18, 17],
      precipitation_probability_max: [10, 40],
      precipitation_sum: [0, 1.2],
      wind_speed_10m_max: [15, 20],
      uv_index_max: [5, 4],
      sunrise: ['2026-09-28T07:55', '2026-09-29T07:56'],
      sunset: ['2026-09-28T19:50', '2026-09-29T19:48']
    },
    hourly: {
      time: ['2026-09-28T00:00', '2026-09-28T01:00'],
      temperature_2m: [19, 18.5],
      weather_code: [0, 1],
      precipitation_probability: [0, 5]
    }
  };

  const datos = normalizarPrevision(crudo, {
    lugar: 'Valencia', pais: 'España', zona: 'Europe/Madrid', ts: 1000
  });

  assert.equal(datos.lugar, 'Valencia');
  assert.equal(datos.pais, 'España');
  assert.equal(datos.zona, 'Europe/Madrid');
  assert.equal(datos.ts, 1000);
  assert.deepEqual(datos.actual, {
    temp: 24.3, sensacion: 25.1, humedad: 60, codigo: 1, viento: 12.4, de_dia: true
  });
  assert.equal(datos.dias.length, 2);
  assert.deepEqual(datos.dias[0], {
    fecha: '2026-09-28',
    codigo: 1,
    tmax: 26,
    tmin: 18,
    lluvia_pct: 10,
    lluvia_mm: 0,
    viento: 15,
    uv: 5,
    amanece: '2026-09-28T07:55',
    anochece: '2026-09-28T19:50'
  });
  assert.deepEqual(datos.dias[1], {
    fecha: '2026-09-29',
    codigo: 3,
    tmax: 25,
    tmin: 17,
    lluvia_pct: 40,
    lluvia_mm: 1.2,
    viento: 20,
    uv: 4,
    amanece: '2026-09-29T07:56',
    anochece: '2026-09-29T19:48'
  });
  assert.equal(datos.horas.length, 2);
  assert.deepEqual(datos.horas[0], { t: '2026-09-28T00:00', temp: 19, codigo: 0, lluvia_pct: 0 });
  assert.deepEqual(datos.horas[1], { t: '2026-09-28T01:00', temp: 18.5, codigo: 1, lluvia_pct: 5 });
});

test('normalizarPrevision rellena los defectos cuando faltan campos', () => {
  const datos = normalizarPrevision({ daily: { time: ['2026-09-28'] } });

  assert.deepEqual(datos.actual, {
    temp: null, sensacion: null, humedad: null, codigo: 0, viento: null, de_dia: true
  });
  assert.deepEqual(datos.horas, []);
  assert.deepEqual(datos.dias, [{
    fecha: '2026-09-28',
    codigo: 0,
    tmax: null,
    tmin: null,
    lluvia_pct: 0,
    lluvia_mm: 0,
    viento: 0,
    uv: 0,
    amanece: '',
    anochece: ''
  }]);
});

test('normalizarPrevision conserva el cero en lugar del defecto', () => {
  const datos = normalizarPrevision({
    daily: { time: ['2026-09-28'], temperature_2m_max: [0] }
  });

  assert.equal(datos.dias[0].tmax, 0);
});

test('normalizarPrevision respeta is_day 0', () => {
  const datos = normalizarPrevision({ current: { is_day: 0 } });
  assert.equal(datos.actual.de_dia, false);
});

test('normalizarPrevision normaliza la línea horaria', () => {
  const datos = normalizarPrevision({
    hourly: {
      time: ['2026-09-28T00:00'],
      temperature_2m: [null],
      weather_code: [3],
      precipitation_probability: [null]
    }
  });

  assert.deepEqual(datos.horas, [{ t: '2026-09-28T00:00', temp: null, codigo: 3, lluvia_pct: 0 }]);
});

test('normalizarPrevision usa la zona del crudo si existe', () => {
  const datos = normalizarPrevision(
    { timezone: 'Atlantic/Canary', daily: { time: ['2026-09-28'] } },
    { zona: 'Europe/Madrid' }
  );

  assert.equal(datos.zona, 'Atlantic/Canary');
});

test('normalizarPrevision con crudo vacío no lanza y da los defectos', () => {
  const datos = normalizarPrevision({}, { ts: 0 });

  assert.equal(datos.ts, 0);
  assert.equal(datos.zona, '');
  assert.equal(datos.lugar, '');
  assert.equal(datos.pais, '');
  assert.deepEqual(datos.dias, []);
  assert.deepEqual(datos.horas, []);
});

test('normalizarPrevision con ts por defecto usa el reloj actual', () => {
  const antes = Date.now();
  const datos = normalizarPrevision({});
  const despues = Date.now();

  assert.ok(datos.ts >= antes && datos.ts <= despues);
});
