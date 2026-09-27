import { test } from 'node:test';
import assert from 'node:assert/strict';

import { NOMBRES, cuerpoIcono, svgIcono, fundiciones } from '../src/iconos.js';

test('NOMBRES tiene los diez nombres del contrato', () => {
  assert.deepEqual(NOMBRES, ['sol', 'sol-nubes', 'nublado', 'niebla', 'llovizna', 'lluvia',
    'nieve', 'chubascos', 'chubascos-nieve', 'tormenta']);
});

test('cuerpoIcono: despejado, poco nuboso y nuboso', () => {
  assert.equal(cuerpoIcono(0), 'sol');
  assert.equal(cuerpoIcono(1), 'sol');
  assert.equal(cuerpoIcono(2), 'sol-nubes');
  assert.equal(cuerpoIcono(3), 'nublado');
});

test('cuerpoIcono: niebla y llovizna', () => {
  assert.equal(cuerpoIcono(45), 'niebla');
  assert.equal(cuerpoIcono(48), 'niebla');
  assert.equal(cuerpoIcono(51), 'llovizna');
  assert.equal(cuerpoIcono(55), 'llovizna');
  assert.equal(cuerpoIcono(57), 'llovizna');
});

test('cuerpoIcono: lluvia y nieve', () => {
  assert.equal(cuerpoIcono(61), 'lluvia');
  assert.equal(cuerpoIcono(63), 'lluvia');
  assert.equal(cuerpoIcono(67), 'lluvia');
  assert.equal(cuerpoIcono(71), 'nieve');
  assert.equal(cuerpoIcono(77), 'nieve');
});

test('cuerpoIcono: chubascos y chubascos de nieve', () => {
  assert.equal(cuerpoIcono(80), 'chubascos');
  assert.equal(cuerpoIcono(82), 'chubascos');
  assert.equal(cuerpoIcono(85), 'chubascos-nieve');
  assert.equal(cuerpoIcono(86), 'chubascos-nieve');
});

test('cuerpoIcono: tormenta', () => {
  assert.equal(cuerpoIcono(95), 'tormenta');
  assert.equal(cuerpoIcono(99), 'tormenta');
  assert.equal(cuerpoIcono(13), 'tormenta');
  assert.equal(cuerpoIcono(27), 'tormenta');
});

test('cuerpoIcono: códigos fuera del mapa caen en nublado', () => {
  assert.equal(cuerpoIcono(12345), 'nublado');
  assert.equal(cuerpoIcono(-1), 'nublado');
});

test('svgIcono con etiqueta es accesible', () => {
  const svg = svgIcono(0, { etiqueta: 'despejado' });
  assert.ok(svg.includes('role="img"'));
  assert.ok(svg.includes('aria-label="despejado"'));
  assert.ok(svg.includes('<title>despejado</title>'));
  assert.ok(svg.includes('data-icono="sol"'));
  assert.ok(svg.includes('viewBox="0 0 32 32"'));
});

test('svgIcono sin etiqueta es decorativo', () => {
  const svg = svgIcono(0);
  assert.ok(svg.includes('aria-hidden="true"'));
  assert.ok(!svg.includes('role="img"'));
  assert.ok(!svg.includes('<title>'));
});

test('svgIcono usa la clase por defecto y respeta la indicada', () => {
  assert.ok(svgIcono(0).includes('class="bt-icono"'));
  assert.ok(svgIcono(0, { clase: 'mi-icono' }).includes('class="mi-icono"'));
  assert.ok(svgIcono(0, { etiqueta: 'x', clase: 'mi-icono' }).includes('class="mi-icono"'));
});

test('svgIcono de nublado referencia la fundicion lejana', () => {
  assert.ok(svgIcono(3).includes('url(#bt-s-masa-lejos)'));
});

test('svgIcono escapa la etiqueta en aria-label y en title', () => {
  const svg = svgIcono(0, { etiqueta: 'a<b&c"d' });
  assert.ok(svg.includes('aria-label="a&lt;b&amp;c&quot;d"'));
  assert.ok(svg.includes('<title>a&lt;b&amp;c&quot;d</title>'));
});

test('fundiciones declara los cinco degradados', () => {
  const defs = fundiciones();
  for (const id of ['bt-s-masa', 'bt-s-masa-lejos', 'bt-s-masa-tormenta', 'bt-s-halo', 'bt-s-nucleo']) {
    assert.ok(defs.includes(`id="${id}"`), `falta ${id}`);
  }
});

test('fundiciones no fija color de parada', () => {
  assert.ok(!fundiciones().includes('stop-color'));
});

test('svgIcono no usa <use> ni referencias a símbolos', () => {
  const svg = svgIcono(0);
  assert.ok(!svg.includes('<use'));
  assert.ok(!svg.includes('href="#i-'));
});

test('los diez nombres devuelven un cuerpo no vacío', () => {
  const representativos = {
    'sol': 0,
    'sol-nubes': 2,
    'nublado': 3,
    'niebla': 45,
    'llovizna': 51,
    'lluvia': 61,
    'nieve': 71,
    'chubascos': 80,
    'chubascos-nieve': 85,
    'tormenta': 95,
  };
  for (const nombre of NOMBRES) {
    const svg = svgIcono(representativos[nombre]);
    assert.ok(svg.includes(`data-icono="${nombre}"`), `nombre incorrecto para ${nombre}`);
    assert.ok(/<(circle|path|g)[ >]/.test(svg), `cuerpo vacío para ${nombre}`);
  }
});
