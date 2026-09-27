import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  IDIOMAS,
  registrarIdioma,
  tieneIdioma,
  t,
  textoWmo,
  nombreDia,
} from '../src/i18n.js';

test('IDIOMAS incluye es y en', () => {
  assert.deepEqual(IDIOMAS, ['es', 'en']);
});

test('t cambia de idioma (criterio 1)', () => {
  assert.equal(t('es', 'hoy'), 'hoy');
  assert.equal(t('en', 'hoy'), 'today');
});

test('t sustituye un marcador numérico (criterio 2)', () => {
  assert.equal(t('es', 'sensacion', { n: 12 }), 'sensación 12°');
});

test('t no omite el cero y respeta unidades (criterio 3)', () => {
  assert.equal(t('es', 'viento', { n: 0 }), '0 km/h');
  assert.equal(t('en', 'vientoImperial', { n: 12 }), '12 mph');
});

test('t cae a es con un idioma desconocido (criterio 4)', () => {
  assert.equal(t('zz', 'hoy'), 'hoy');
});

test('t devuelve la clave si no existe (criterio 5)', () => {
  assert.equal(t('es', 'claveInventada'), 'claveInventada');
});

test('noEncontrado y faltaLugar existen en es y en con los textos del contrato', () => {
  assert.equal(t('es', 'noEncontrado', { lugar: 'Valencia' }), 'No se encontró Valencia');
  assert.equal(t('en', 'noEncontrado', { lugar: 'Valencia' }), 'Valencia not found');
  assert.equal(t('es', 'faltaLugar'), 'Indica un lugar o unas coordenadas');
  assert.equal(t('en', 'faltaLugar'), 'Set a place or coordinates');
});

test('t deja los marcadores sin parámetro (criterio 13)', () => {
  assert.equal(t('es', 'error {x} {y}', { x: 'a' }), 'error a {y}');
});

test('registrarIdioma añade un idioma con respaldo a es (criterio 6)', () => {
  registrarIdioma('fr', { hoy: "aujourd'hui" });
  assert.equal(t('fr', 'hoy'), "aujourd'hui");
  assert.equal(t('fr', 'sensacion', { n: 5 }), 'sensación 5°');
  assert.equal(tieneIdioma('fr'), true);
});

test('tieneIdioma reconoce es y en y no un idioma sin registrar', () => {
  assert.equal(tieneIdioma('es'), true);
  assert.equal(tieneIdioma('en'), true);
  assert.equal(tieneIdioma('xy'), false);
});

test('textoWmo devuelve la descripción por idioma (criterio 9)', () => {
  assert.equal(textoWmo('es', 0), 'despejado');
  assert.equal(textoWmo('es', 95), 'tormenta');
  assert.equal(textoWmo('en', 3), 'overcast');
});

test('textoWmo cae a sinDatos con un código desconocido (criterio 10)', () => {
  assert.equal(textoWmo('es', 12345), 'sin datos');
  assert.equal(textoWmo('en', 12345), 'no data');
});

test('textoWmo cubre todos los códigos de la tabla', () => {
  const codigos = [
    0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75,
    77, 80, 81, 82, 85, 86, 95, 96, 99,
  ];
  for (const codigo of codigos) {
    const es = textoWmo('es', codigo);
    const en = textoWmo('en', codigo);
    assert.equal(typeof es, 'string');
    assert.equal(typeof en, 'string');
    assert.notEqual(es, 'sin datos');
    assert.notEqual(en, 'no data');
  }
});

test('nombreDia devuelve el nombre corto (criterio 11)', () => {
  assert.equal(nombreDia('es', 1), 'lun');
  assert.equal(nombreDia('en', 0), 'Sun');
  assert.equal(nombreDia('es', 0), 'dom');
  assert.equal(nombreDia('es', 6), 'sáb');
});

test('nombreDia lanza RangeError fuera de rango (criterio 12)', () => {
  assert.throws(() => nombreDia('es', 7), RangeError);
  assert.throws(() => nombreDia('es', 1.5), RangeError);
  assert.throws(() => nombreDia('es', -1), RangeError);
});

test('t y textoWmo nunca lanzan con entradas raras', () => {
  assert.equal(t(undefined, 'hoy'), 'hoy');
  assert.equal(textoWmo('fr', 0), 'despejado');
});
