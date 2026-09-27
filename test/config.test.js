import test from 'node:test';
import assert from 'node:assert/strict';

import { CLAVES, DEFECTOS, leerConfig } from '../src/config.js';

/** Fuente mínima: devuelve el valor del atributo o `null` si no está. */
function fuente(atributos = {}) {
  return { getAttribute: (nombre) => (nombre in atributos ? atributos[nombre] : null) };
}

test('atributos ausentes devuelven exactamente DEFECTOS', () => {
  const config = leerConfig(fuente());
  assert.deepEqual(config, DEFECTOS);
});

test('devuelve cada clave de DEFECTOS sin claves extra', () => {
  const config = leerConfig(fuente({ place: 'Valencia', days: '10' }));
  assert.deepEqual(Object.keys(config).sort(), Object.keys(DEFECTOS).sort());
});

test('lee place y days de sus atributos', () => {
  const config = leerConfig(fuente({ place: 'Valencia', days: '10' }));
  assert.equal(config.place, 'Valencia');
  assert.equal(config.days, 10);
});

test('days se redondea y se ajusta al rango 1..16', () => {
  assert.equal(leerConfig(fuente({ days: '0' })).days, 1);
  assert.equal(leerConfig(fuente({ days: '99' })).days, 16);
  assert.equal(leerConfig(fuente({ days: '3.7' })).days, 4);
});

test('days no numérico cae al defecto', () => {
  assert.equal(leerConfig(fuente({ days: 'ocho' })).days, DEFECTOS.days);
});

test('refresh se redondea a la baja y nunca es negativo', () => {
  assert.equal(leerConfig(fuente({ refresh: '-5' })).refresh, 0);
  assert.equal(leerConfig(fuente({ refresh: '30.9' })).refresh, 30);
  assert.equal(leerConfig(fuente({ refresh: '0' })).refresh, 0);
});

test('hourly-step se redondea a la baja, como mínimo 1', () => {
  assert.equal(leerConfig(fuente({ 'hourly-step': '0' })).hourlyStep, 1);
  assert.equal(leerConfig(fuente({ 'hourly-step': '3' })).hourlyStep, 3);
});

test('lat sin lon deja las dos coordenadas en null', () => {
  const config = leerConfig(fuente({ latitude: '39.47' }));
  assert.equal(config.lat, null);
  assert.equal(config.lon, null);
});

test('lat y lon presentes y finitos se conservan', () => {
  const config = leerConfig(fuente({ latitude: '39.47', longitude: '-0.37' }));
  assert.equal(config.lat, 39.47);
  assert.equal(config.lon, -0.37);
});

test('coordenadas no finitas dejan las dos en null', () => {
  const config = leerConfig(fuente({ latitude: 'norte', longitude: 'x' }));
  assert.equal(config.lat, null);
  assert.equal(config.lon, null);
});

test('booleanos: vacío es true, false/0 es false y ausente usa el defecto', () => {
  assert.equal(leerConfig(fuente({ 'show-current': '' })).showCurrent, true);
  assert.equal(leerConfig(fuente({ 'show-current': 'false' })).showCurrent, false);
  assert.equal(leerConfig(fuente()).showCurrent, true);
  assert.equal(leerConfig(fuente({ 'show-current': '0' })).showCurrent, false);
  assert.equal(leerConfig(fuente({ 'show-current': '1' })).showCurrent, true);
});

test('booleanos: valor desconocido cae al defecto', () => {
  assert.equal(leerConfig(fuente({ animate: '0' })).animate, false);
  assert.equal(leerConfig(fuente({ animate: 'sí' })).animate, true);
  assert.equal(leerConfig(fuente({ 'show-hourly': 'quizá' })).showHourly, true);
});

test('theme es un enum exacto y en minúsculas', () => {
  assert.equal(leerConfig(fuente({ theme: 'azul' })).theme, 'auto');
  assert.equal(leerConfig(fuente({ theme: 'LIGHT' })).theme, 'auto');
  assert.equal(leerConfig(fuente({ theme: 'dark' })).theme, 'dark');
});

test('units y week-start solo aceptan sus valores exactos', () => {
  assert.equal(leerConfig(fuente({ units: 'imperial' })).units, 'imperial');
  assert.equal(leerConfig(fuente({ 'week-start': 'sunday' })).weekStart, 'sunday');
  assert.equal(leerConfig(fuente({ units: 'litros' })).units, 'metric');
  assert.equal(leerConfig(fuente({ 'week-start': 'lunes' })).weekStart, 'monday');
});

test('lang acepta xx o xx-yy y lo pasa a minúsculas', () => {
  assert.equal(leerConfig(fuente({ lang: 'EN' })).lang, 'en');
  assert.equal(leerConfig(fuente({ lang: 'francés' })).lang, 'es');
  assert.equal(leerConfig(fuente({ lang: 'pt-br' })).lang, 'pt-br');
  assert.equal(leerConfig(fuente({ lang: 'espanol' })).lang, 'es');
});

test('strings: vacío usa el defecto y no se recorta', () => {
  assert.equal(leerConfig(fuente({ remember: '' })).remember, true);
  assert.equal(leerConfig(fuente({ place: '' })).place, '');
  assert.equal(leerConfig(fuente({ place: '  X  ' })).place, '  X  ');
  assert.equal(leerConfig(fuente({ timezone: '' })).timezone, 'auto');
});

test('CLAVES mapea kebab-case a la clave de configuración', () => {
  assert.equal(CLAVES['hourly-step'], 'hourlyStep');
  assert.equal(CLAVES['show-current'], 'showCurrent');
  assert.equal(CLAVES['week-start'], 'weekStart');
  assert.equal(CLAVES.latitude, 'lat');
});
