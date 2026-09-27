import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerConfig } from '../src/config.js';
import {
  URL_PREVISION,
  URL_GEOCODIFICACION,
  geocodificar,
  pedirPrevision
} from '../src/api.js';
import { pintar, pintarMensaje } from '../src/plantilla.js';
import { t } from '../src/i18n.js';

/*
 * Pruebas de integración sin red: recorren el mismo camino que `elemento`
 * (config -> geocodificación -> previsión -> plantilla) con un `fetch`
 * simulado. `elemento` no se prueba aquí porque necesita DOM.
 */

// --- Ayudas: `fetch` simulado, sin red -------------------------------------

function respuestaFalsa(cuerpo, { estado = 200 } = {}) {
  return {
    ok: estado >= 200 && estado < 300,
    status: estado,
    async json() {
      return cuerpo;
    }
  };
}

const RESULTADO_VALENCIA = {
  results: [{
    name: 'Valencia',
    admin1: 'Comunitat Valenciana',
    country: 'España',
    latitude: 39.47,
    longitude: -0.37,
    timezone: 'Europe/Madrid'
  }]
};

/** Crudo de previsión con `dias` fechas y cuatro lecturas por día. */
function crudoPrevision(dias) {
  const fechas = [];
  const horas = [];
  const base = Date.UTC(2026, 8, 28);
  for (let i = 0; i < dias; i++) {
    const fecha = new Date(base + i * 86400000).toISOString().slice(0, 10);
    fechas.push(fecha);
    for (let h = 0; h < 24; h += 6) {
      horas.push(`${fecha}T${String(h).padStart(2, '0')}:00`);
    }
  }
  return {
    timezone: 'Europe/Madrid',
    current: {
      temperature_2m: 21.4,
      apparent_temperature: 20.1,
      relative_humidity_2m: 55,
      weather_code: 0,
      wind_speed_10m: 12.3,
      is_day: 1
    },
    daily: {
      time: fechas,
      weather_code: fechas.map(() => 0),
      temperature_2m_max: fechas.map((_, i) => 24 + i),
      temperature_2m_min: fechas.map((_, i) => 14 + i),
      precipitation_probability_max: fechas.map(() => 10),
      precipitation_sum: fechas.map(() => 0.2),
      wind_speed_10m_max: fechas.map(() => 18),
      uv_index_max: fechas.map(() => 5),
      sunrise: fechas.map((f) => `${f}T07:30`),
      sunset: fechas.map((f) => `${f}T19:30`)
    },
    hourly: {
      time: horas,
      temperature_2m: horas.map((_, i) => 12 + (i % 12)),
      weather_code: horas.map(() => 1),
      precipitation_probability: horas.map(() => 5)
    }
  };
}

/**
 * `fetch` simulado que responde geocodificación y previsión según la URL.
 * `prevision` fuerza el cuerpo de la previsión (por ejemplo `{}`); sin él se
 * genera un crudo con los días que pida la propia URL.
 */
function servidor({ prevision = null } = {}) {
  const llamadas = [];
  const impl = async (url) => {
    llamadas.push(String(url));
    if (url.startsWith(URL_GEOCODIFICACION)) {
      return respuestaFalsa(RESULTADO_VALENCIA);
    }
    if (url.startsWith(URL_PREVISION)) {
      const dias = Number(new URL(url).searchParams.get('forecast_days'));
      return respuestaFalsa(prevision ?? crudoPrevision(dias));
    }
    throw new Error(`URL inesperada en la prueba: ${url}`);
  };
  impl.llamadas = llamadas;
  impl.geocodifico = () => llamadas.some((u) => u.startsWith(URL_GEOCODIFICACION));
  impl.ultimaPrevision = () => [...llamadas].reverse().find((u) => u.startsWith(URL_PREVISION));
  return impl;
}

/** Configuración a partir de un mapa de atributos, como haría `elemento`. */
function configDe(attrs = {}) {
  return leerConfig({ getAttribute: (nombre) => (nombre in attrs ? attrs[nombre] : null) });
}

function contar(html, aguja) {
  return html.split(aguja).length - 1;
}

/**
 * Encadena config -> resolución de lugar -> previsión -> plantilla, igual que
 * `elemento`, pero sin DOM.
 */
async function montar(attrs, fetchImpl) {
  const config = configDe(attrs);
  let lugar;
  if (Number.isFinite(config.lat) && Number.isFinite(config.lon)) {
    lugar = {
      nombre: config.place !== '' ? config.place : `${config.lat.toFixed(2)}, ${config.lon.toFixed(2)}`,
      pais: config.country,
      lat: config.lat,
      lon: config.lon,
      zona: config.timezone
    };
  } else if (config.place !== '') {
    const sitios = await geocodificar(config.place, {
      lang: config.lang,
      pais: config.country,
      fetchImpl
    });
    if (sitios.length === 0) {
      return {
        config,
        error: t(config.lang, 'noEncontrado', { lugar: config.place })
      };
    }
    [lugar] = sitios;
  } else {
    return { config, error: t(config.lang, 'faltaLugar') };
  }

  const zona = config.timezone !== 'auto' ? config.timezone : (lugar.zona || 'auto');
  const datos = await pedirPrevision({
    lat: lugar.lat,
    lon: lugar.lon,
    zona,
    dias: config.days,
    unidades: config.units,
    lugar: lugar.nombre,
    pais: lugar.pais,
    fetchImpl
  });
  return { config, datos, html: pintar({ datos, config }) };
}

// --- Recorridos de la sección Integración de ARQUITECTURA -------------------

test('place sin coordenadas: geocodifica, pide previsión y pinta los días pedidos', async () => {
  const fetchImpl = servidor();

  const { config, datos, html } = await montar({ place: 'Valencia', days: '5' }, fetchImpl);

  assert.equal(fetchImpl.geocodifico(), true);
  assert.equal(config.days, 5);
  assert.equal(datos.dias.length, 5);
  assert.equal(datos.horas.length, 20);
  assert.equal(contar(html, 'class="bt-dia"'), 5);
  assert.ok(html.includes('Valencia'));
  assert.equal(datos.zona, 'Europe/Madrid');
});

test('latitude y longitude: no se llama al geocodificador', async () => {
  const fetchImpl = servidor();

  const { html } = await montar({ latitude: '39.47', longitude: '-0.37', days: '3' }, fetchImpl);

  assert.equal(fetchImpl.geocodifico(), false);
  const prevision = new URL(fetchImpl.ultimaPrevision());
  assert.equal(prevision.searchParams.get('latitude'), '39.47');
  assert.equal(prevision.searchParams.get('longitude'), '-0.37');
  assert.equal(contar(html, 'class="bt-dia"'), 3);
});

test('respuesta sin daily.time: error técnico y mensaje de error en pantalla', async () => {
  const fetchImpl = servidor({ prevision: {} });
  const config = configDe({ place: 'Valencia' });

  await assert.rejects(
    () => pedirPrevision({
      lat: 39.47,
      lon: -0.37,
      dias: config.days,
      unidades: config.units,
      fetchImpl
    }),
    { message: 'previsión: Open-Meteo no devolvió días' }
  );

  const html = pintarMensaje({ config, tipo: 'error' });
  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes('No se pudo cargar la previsión'));
});

test('lang en y units imperial: textos en inglés y unidades en la petición', async () => {
  const fetchImpl = servidor();

  const { html } = await montar({ place: 'London', lang: 'en', units: 'imperial' }, fetchImpl);

  assert.ok(html.includes('today'));
  assert.ok(html.includes('updated'));
  const prevision = new URL(fetchImpl.ultimaPrevision());
  assert.equal(prevision.searchParams.get('temperature_unit'), 'fahrenheit');
  assert.equal(prevision.searchParams.get('wind_speed_unit'), 'mph');
  assert.equal(prevision.searchParams.get('precipitation_unit'), 'inch');
});

test('show-hourly false: no se genera ninguna línea horaria', async () => {
  const fetchImpl = servidor();

  const { html } = await montar({ place: 'Valencia', 'show-hourly': 'false' }, fetchImpl);

  assert.equal(contar(html, 'class="bt-horas"'), 0);
  assert.equal(contar(html, 'class="bt-horas-marcas"'), 0);
  assert.equal(contar(html, 'class="bt-dia"'), 7);
});

test('days fuera de rango: se ajusta a 1..16 y se piden esos días', async () => {
  const pocos = servidor();
  const { config: configCero } = await montar({ place: 'Valencia', days: '0' }, pocos);
  assert.equal(configCero.days, 1);

  const muchos = servidor();
  const { config: configCien, html } = await montar({ place: 'Valencia', days: '99' }, muchos);
  assert.equal(configCien.days, 16);
  assert.equal(new URL(muchos.ultimaPrevision()).searchParams.get('forecast_days'), '16');
  assert.equal(contar(html, 'class="bt-dia"'), 16);
});

// --- Casos límite entre módulos --------------------------------------------

test('geocodificación sin resultados: mensaje de lugar no encontrado', async () => {
  const vacio = async (url) => {
    if (url.startsWith(URL_GEOCODIFICACION)) {
      return respuestaFalsa({ results: [] });
    }
    throw new Error('no debería pedirse la previsión');
  };

  const { config, error } = await montar({ place: 'zzz' }, vacio);
  const html = pintarMensaje({ config, tipo: 'error', mensaje: error });

  assert.equal(error, 'No se encontró zzz');
  assert.ok(html.includes('No se encontró zzz'));
  assert.ok(html.includes('role="alert"'));
});

test('sin lugar ni coordenadas: mensaje de falta de lugar', async () => {
  const fetchImpl = servidor();

  const { config, error } = await montar({}, fetchImpl);
  const html = pintarMensaje({ config, tipo: 'vacio', mensaje: error });

  assert.equal(error, 'Indica un lugar o unas coordenadas');
  assert.equal(fetchImpl.llamadas.length, 0);
  assert.ok(html.includes('Indica un lugar o unas coordenadas'));
  assert.ok(html.includes('role="status"'));
});
