import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  GRAFICO_ALTO,
  HORAS_CURVA_ARRIBA,
  HORAS_CURVA_ABAJO,
  HORAS_TEMP_ALTO,
  HORAS_CADA,
  LLUVIA_MINIMA,
  escala,
  trazadoBanda,
  trazadoHoras,
} from '../src/geometria.js';

/** Tres lecturas consecutivas, temperaturas 10, 12 y 11. */
const HORAS = [
  { t: '2026-09-28T09:00', temp: 10, codigo: 0, lluvia_pct: 0 },
  { t: '2026-09-28T10:00', temp: 12, codigo: 0, lluvia_pct: 0 },
  { t: '2026-09-28T11:00', temp: 11, codigo: 0, lluvia_pct: 0 },
];

test('las constantes públicas valen lo que fija el contrato', () => {
  assert.equal(GRAFICO_ALTO, 126);
  assert.equal(HORAS_CURVA_ARRIBA, 64);
  assert.equal(HORAS_CURVA_ABAJO, 86);
  assert.equal(HORAS_TEMP_ALTO, 12);
  assert.equal(HORAS_CADA, 2);
  assert.equal(LLUVIA_MINIMA, 1);
});

test('escala devuelve techo, suelo y recorrido con un grado de aire', () => {
  const resultado = escala([{ tmax: 10, tmin: 0 }, { tmax: 20, tmin: 10 }]);
  assert.deepEqual(resultado, { techo: 21, suelo: -1, recorrido: 22 });
});

test('escala trata una temperatura null como 0', () => {
  const resultado = escala([{ tmax: null, tmin: null }]);
  assert.deepEqual(resultado, { techo: 1, suelo: -1, recorrido: 2 });
});

test('escala no divide por cero con un solo día de extremos iguales', () => {
  const resultado = escala([{ tmax: 20, tmin: 20 }]);
  assert.equal(resultado.techo, 21);
  assert.equal(resultado.suelo, 19);
  assert.equal(resultado.recorrido, 2);
});

test('escala lanza RangeError si dias no es un array', () => {
  assert.throws(() => escala(null), {
    name: 'RangeError',
    message: 'dias debe ser un array',
  });
});

test('escala lanza RangeError si dias está vacío', () => {
  assert.throws(() => escala([]), {
    name: 'RangeError',
    message: 'no hay días para calcular la banda',
  });
});

test('trazadoBanda compone viewBox, líneas y área', () => {
  const resultado = trazadoBanda([{ tmax: 10, tmin: 0 }, { tmax: 20, tmin: 10 }]);
  assert.equal(resultado.viewBox, '0 0 200 126');
  assert.equal(resultado.dMax, 'M50 59 L150 29.91');
  assert.equal(resultado.dMin, 'M50 88.09 L150 59');
  assert.equal(resultado.dArea, 'M50 59 L150 29.91 L150 59 L50 88.09 Z');
});

test('trazadoBanda devuelve los puntos de cada día redondeados', () => {
  const { puntos } = trazadoBanda([{ tmax: 10, tmin: 0 }, { tmax: 20, tmin: 10 }]);
  assert.deepEqual(puntos, [
    { cx: 50, yMax: 59, yMin: 88.09 },
    { cx: 150, yMax: 29.91, yMin: 59 },
  ]);
});

test('trazadoBanda lanza RangeError si dias no es un array', () => {
  assert.throws(() => trazadoBanda(null), {
    name: 'RangeError',
    message: 'dias debe ser un array',
  });
});

test('trazadoBanda lanza RangeError si dias está vacío', () => {
  assert.throws(() => trazadoBanda([]), {
    name: 'RangeError',
    message: 'no hay días para calcular la banda',
  });
});

test('trazadoHoras compone viewBox, línea y área', () => {
  const resultado = trazadoHoras(HORAS, { paso: 2 });
  assert.equal(resultado.viewBox, '0 0 240 126');
  assert.equal(resultado.dLinea, 'M5 80.5 L120 69.5 L235 75');
  assert.equal(resultado.dArea, 'M5 80.5 L120 69.5 L235 75 L235 86 L5 86 Z');
});

test('trazadoHoras devuelve una marca cada `paso` horas, redondeada', () => {
  const { marcas } = trazadoHoras(HORAS, { paso: 2 });
  assert.deepEqual(marcas, [
    { pct: 2.08, hora: '09', temp: 10, yTemp: 74.5, lluviaPct: 0 },
    { pct: 97.92, hora: '11', temp: 11, yTemp: 69, lluviaPct: 0 },
  ]);
});

test('trazadoHoras conserva null en temp y yTemp de la marca', () => {
  const horas = [
    { t: '2026-09-28T09:00', temp: null, codigo: 0, lluvia_pct: 0 },
    { t: '2026-09-28T10:00', temp: 5, codigo: 0, lluvia_pct: 0 },
    { t: '2026-09-28T11:00', temp: 6, codigo: 0, lluvia_pct: 0 },
  ];
  const { marcas, dLinea } = trazadoHoras(horas, { paso: 2 });
  assert.equal(marcas[0].temp, null);
  assert.equal(marcas[0].yTemp, null);
  assert.equal(marcas[1].temp, 6);
  // En el trazado, la temperatura ausente se sitúa como 0.
  assert.ok(dLinea.startsWith('M5 83.25'), dLinea);
});

test('trazadoHoras dibuja la raya de ahora solo si está entre 0 y 24', () => {
  const dibujada = trazadoHoras(HORAS, { ahora: 12.5 }).dAhora;
  assert.match(dibujada, /^M[\d.]+ 60 V86$/);

  assert.equal(trazadoHoras(HORAS, { ahora: null }).dAhora, '');
  assert.equal(trazadoHoras(HORAS, { ahora: 30 }).dAhora, '');
  assert.equal(trazadoHoras(HORAS, { ahora: -1 }).dAhora, '');

  assert.match(trazadoHoras(HORAS, { ahora: 0 }).dAhora, /^M[\d.]+ 60 V86$/);
  assert.match(trazadoHoras(HORAS, { ahora: 24 }).dAhora, /^M[\d.]+ 60 V86$/);
});

test('trazadoHoras devuelve null sin material suficiente', () => {
  assert.equal(trazadoHoras([], {}), null);
  assert.equal(trazadoHoras([HORAS[0]], {}), null);
  assert.equal(trazadoHoras(null, {}), null);
});

test('trazadoHoras normaliza el paso', () => {
  // paso 0 → 1: una marca por hora.
  assert.equal(trazadoHoras(HORAS, { paso: 0 }).marcas.length, 3);

  // paso no finito → paso por defecto (2): índices 0 y 2.
  assert.deepEqual(
    trazadoHoras(HORAS, { paso: Infinity }).marcas.map((m) => m.hora),
    ['09', '11'],
  );

  // paso 3 sobre siete lecturas → índices 0, 3 y 6.
  const siete = Array.from({ length: 7 }, (_, i) => ({
    t: `2026-09-28T${String(i).padStart(2, '0')}:00`,
    temp: 10 + i,
    codigo: 0,
    lluvia_pct: 0,
  }));
  assert.deepEqual(
    trazadoHoras(siete, { paso: 3 }).marcas.map((m) => m.hora),
    ['00', '03', '06'],
  );
});
