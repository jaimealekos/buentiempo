import test from 'node:test';
import assert from 'node:assert/strict';

import { pintar, pintarMensaje } from '../src/plantilla.js';

/** Configuración completa, como la devuelve `config`. */
function config(extra) {
  return {
    lang: 'es',
    units: 'metric',
    editable: false,
    showCurrent: true,
    showHourly: true,
    hourlyStep: 2,
    weekStart: 'monday',
    days: 7,
    ...extra,
  };
}

/** Dos días (lunes y martes) con tres lecturas horarias cada uno. */
function datos() {
  return {
    ts: Date.UTC(2026, 8, 28, 9, 0),
    zona: 'Europe/Madrid',
    lugar: 'Valencia',
    pais: 'España',
    actual: { temp: 20.4, sensacion: 19.1, humedad: 55, codigo: 0, viento: 12.3, de_dia: true },
    dias: [
      { fecha: '2026-09-28', codigo: 0, tmax: 24, tmin: 12, lluvia_pct: 30 },
      { fecha: '2026-09-29', codigo: 3, tmax: 22, tmin: 11, lluvia_pct: 0 },
    ],
    horas: [
      { t: '2026-09-28T09:00', temp: 10, codigo: 0, lluvia_pct: 0 },
      { t: '2026-09-28T10:00', temp: 12, codigo: 0, lluvia_pct: 0 },
      { t: '2026-09-28T11:00', temp: 11, codigo: 0, lluvia_pct: 0 },
      { t: '2026-09-29T09:00', temp: 9, codigo: 3, lluvia_pct: 0 },
      { t: '2026-09-29T10:00', temp: 10, codigo: 3, lluvia_pct: 0 },
      { t: '2026-09-29T11:00', temp: 11, codigo: 3, lluvia_pct: 0 },
    ],
  };
}

/** Un solo día con tres lecturas, para contar marcas y lluvia sin ruido. */
function datosUnDia(extra) {
  return {
    ts: Date.UTC(2026, 8, 28, 9, 0),
    zona: 'Europe/Madrid',
    lugar: 'Valencia',
    pais: '',
    actual: { temp: 20, sensacion: 19, humedad: 55, codigo: 0, viento: 12, de_dia: true },
    dias: [{ fecha: '2026-09-28', codigo: 0, tmax: 24, tmin: 12, lluvia_pct: 0, ...extra }],
    horas: [
      { t: '2026-09-28T09:00', temp: 10, codigo: 0, lluvia_pct: 0 },
      { t: '2026-09-28T10:00', temp: 12, codigo: 0, lluvia_pct: 0 },
      { t: '2026-09-28T11:00', temp: 11, codigo: 0, lluvia_pct: 0 },
    ],
  };
}

const cuenta = (html, patron) => (html.match(patron) ?? []).length;
const bloquesDia = (html) => html.match(/<div class="bt-dia"[^>]*>[\s\S]*?<\/div>/g) ?? [];

test('criterio 1: empieza por el sprite y contiene widget, pie y meta', () => {
  const html = pintar({ datos: datos(), config: config() });
  assert.ok(html.startsWith('<svg class="bt-sprite"'));
  assert.ok(html.includes('part="widget"'));
  assert.ok(html.includes('part="pie"'));
  assert.ok(html.includes('part="meta"'));
  assert.ok(html.includes('class="bt-area"'));
});

test('sin ts, el meta muestra una raya en vez de inventar la hora', () => {
  const html = pintar({ datos: { ...datos(), ts: undefined }, config: config() });
  assert.ok(html.includes('actualizado —'));
});

test('criterio 2: dos celdas de día y dos líneas horarias por defecto', () => {
  const html = pintar({ datos: datos(), config: config() });
  assert.equal(cuenta(html, /class="bt-dia"/g), 2);
  assert.equal(cuenta(html, /class="bt-horas"/g), 2);
});

test('criterio 3: el primer día lleva hoy, data-hoy y su aria-label', () => {
  const html = pintar({ datos: datos(), config: config() });
  const primero = bloquesDia(html)[0];
  assert.ok(primero.includes('data-hoy'));
  assert.ok(primero.includes('<span class="bt-nombre" part="dia-nombre">hoy</span>'));
  assert.ok(primero.includes('máxima'));
  assert.ok(primero.includes('mínima'));
  assert.ok(primero.includes('lluvia 30%'));
});

test('criterio 4: el icono del primer día es sol con etiqueta despejado', () => {
  const html = pintar({ datos: datos(), config: config() });
  const primero = bloquesDia(html)[0];
  assert.ok(primero.includes('data-icono="sol"'));
  assert.ok(primero.includes('aria-label="despejado"'));
  assert.ok(primero.includes('<span class="bt-dia-icono" part="dia-icono">'));
});

test('criterio 5: showCurrent y showHourly apagan sus bloques', () => {
  const sinAhora = pintar({ datos: datos(), config: config({ showCurrent: false }) });
  assert.ok(!sinAhora.includes('class="bt-ahora"'));

  const sinHoras = pintar({ datos: datos(), config: config({ showHourly: false }) });
  assert.ok(!sinHoras.includes('class="bt-horas"'));
  assert.ok(!sinHoras.includes('bt-horas-marcas'));
});

test('criterio 6: editable false usa el texto, sin formulario ni combobox', () => {
  const html = pintar({ datos: datos(), config: config({ editable: false }) });
  assert.ok(!html.includes('<form'));
  assert.ok(!html.includes('role="combobox"'));
  assert.ok(!html.includes('bt-lugar-sugerencias'));
  assert.ok(html.includes('bt-lugar-texto'));
});

test('criterio 7: editable true monta el combobox y su listbox', () => {
  const html = pintar({ datos: datos(), config: config({ editable: true }) });
  assert.ok(html.includes('role="combobox"'));
  assert.ok(html.includes('aria-expanded="false"'));
  assert.ok(html.includes('aria-controls="bt-sugerencias"'));
  assert.ok(html.includes('role="listbox"'));
});

test('criterio 8: el país solo aparece si no está vacío, escapado', () => {
  const sinPais = pintar({ datos: datosUnDia(), config: config({ editable: true }) });
  assert.ok(!sinPais.includes('bt-lugar-pais'));

  const conPais = pintar({ datos: { ...datosUnDia(), pais: 'A<B&C' }, config: config({ editable: true }) });
  assert.ok(conPais.includes('bt-lugar-pais'));
  assert.ok(conPais.includes('A&lt;B&amp;C'));
  assert.ok(!conPais.includes('A<B&C'));
});

test('criterio 8b: sin buscador, el país va junto al texto del lugar', () => {
  const sinPais = pintar({ datos: datosUnDia(), config: config({ editable: false }) });
  assert.ok(!sinPais.includes('bt-lugar-pais'));

  const conPais = pintar({
    datos: { ...datosUnDia(), pais: 'España' },
    config: config({ editable: false }),
  });
  assert.ok(conPais.includes('bt-lugar-texto'));
  assert.ok(conPais.includes('<span class="bt-lugar-pais" part="pais">España</span>'));
});

test('criterio 9: hourlyStep decide cuántas marcas horarias hay', () => {
  const dos = pintar({ datos: datosUnDia(), config: config({ hourlyStep: 2 }) });
  assert.equal(cuenta(dos, /class="bt-hora-marca"/g), 2);

  const una = pintar({ datos: datosUnDia(), config: config({ hourlyStep: 1 }) });
  assert.equal(cuenta(una, /class="bt-hora-marca"/g), 3);
});

test('criterio 10: la gota sale solo a partir del mínimo de lluvia', () => {
  const seco = pintar({ datos: datosUnDia({ lluvia_pct: 0 }), config: config() });
  assert.ok(!seco.includes('bt-gota'));

  const mojado = pintar({ datos: datosUnDia({ lluvia_pct: 30 }), config: config() });
  assert.ok(mojado.includes('bt-gota'));
  assert.ok(mojado.includes('30%'));
});

test('criterio 11: el viento depende de las unidades', () => {
  const imperial = pintar({ datos: datos(), config: config({ units: 'imperial' }) });
  assert.ok(imperial.includes('12 mph'));

  const metrico = pintar({ datos: datos(), config: config({ units: 'metric' }) });
  assert.ok(metrico.includes('12 km/h'));
});

test('criterio 12: en inglés el primer día es today y la etiqueta va en inglés', () => {
  const html = pintar({ datos: datos(), config: config({ lang: 'en' }) });
  const primero = bloquesDia(html)[0];
  assert.ok(primero.includes('>today</span>'));
  assert.ok(primero.includes('high'));
  assert.ok(primero.includes('low'));
});

test('criterio 13: una temperatura null se pinta como raya y no rompe la banda', () => {
  const html = pintar({ datos: datosUnDia({ tmax: null, tmin: null }), config: config() });
  assert.ok(html.includes('part="dia-max">—</span>'));
  assert.ok(html.includes('part="dia-min">—</span>'));
  assert.ok(html.includes('bt-banda'));
});

test('criterio 14: el mensaje de error lleva part vacio, alert y el texto', () => {
  const html = pintarMensaje({ config: config(), tipo: 'error', mensaje: 'fallo de red' });
  assert.ok(html.includes('part="vacio"'));
  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes('fallo de red'));
});

test('criterio 15: el estado vacío usa role status y el texto por idioma', () => {
  assert.ok(pintarMensaje({ config: config(), tipo: 'vacio' }).includes('role="status"'));
  assert.ok(pintarMensaje({ config: config(), tipo: 'vacio' }).includes('sin datos'));
  assert.ok(pintarMensaje({ config: config({ lang: 'en' }), tipo: 'vacio' }).includes('no data'));
});

test('criterio 16: el esqueleto lleva un bloque por día de config.days', () => {
  const html = pintarMensaje({ config: config({ days: 5 }), tipo: 'cargando' });
  assert.ok(html.includes('part="esqueleto"'));
  assert.ok(html.includes('aria-busy="true"'));
  assert.equal(cuenta(html, /class="bt-esq-dia"/g), 5);
});

test('criterio 17: un tipo desconocido lanza RangeError', () => {
  assert.throws(() => pintarMensaje({ config: config(), tipo: 'otro' }), {
    name: 'RangeError',
    message: 'tipo de mensaje desconocido: otro',
  });
});

test('criterio 18: sin días, pintar devuelve el mismo HTML que el vacío', () => {
  const sinDias = pintar({ datos: { ...datos(), dias: [] }, config: config() });
  const vacio = pintarMensaje({ config: config(), tipo: 'vacio' });
  assert.equal(sinDias, vacio);
});

test('criterio 19: lugar y país con marcado salen escapados', () => {
  const html = pintar({
    datos: { ...datosUnDia(), lugar: '<script>alert(1)</script>', pais: '<b>' },
    config: config(),
  });
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!html.includes('<b>'));
});

test('criterio 20: los días son enfocables solo con showHourly', () => {
  const conHoras = pintar({ datos: datos(), config: config({ showHourly: true }) });
  assert.equal(cuenta(conHoras, /tabindex="0"/g), 2);

  const sinHoras = pintar({ datos: datos(), config: config({ showHourly: false }) });
  assert.equal(cuenta(sinHoras, /tabindex="0"/g), 0);
});

test('criterio 21: la raya de ahora solo se dibuja con zona IANA', () => {
  const conZona = pintar({ datos: datos(), config: config() });
  assert.ok(conZona.includes('bt-ahora-linea'));

  const sinZona = pintar({ datos: { ...datos(), zona: '' }, config: config() });
  assert.ok(!sinZona.includes('bt-ahora-linea'));
});
