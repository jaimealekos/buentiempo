import { test } from 'node:test';
import assert from 'node:assert/strict';
import { css } from '../src/estilos.js';

/** Contenido del primer bloque `:host { ... }` del CSS. */
function bloqueHost(texto) {
  const inicio = texto.indexOf(':host {');
  assert.notEqual(inicio, -1, 'no se encontró el bloque :host');
  const abre = texto.indexOf('{', inicio);
  let profundidad = 0;
  for (let i = abre; i < texto.length; i++) {
    if (texto[i] === '{') profundidad++;
    else if (texto[i] === '}') {
      profundidad--;
      if (profundidad === 0) return texto.slice(abre + 1, i);
    }
  }
  throw new Error('el bloque :host no cierra');
}

test('css() devuelve una cadena no vacía', () => {
  const salida = css();
  assert.equal(typeof salida, 'string');
  assert.ok(salida.length > 0);
});

test('empieza por :host y declara los nueve colores de pintura', () => {
  const salida = css();
  assert.ok(salida.trimStart().startsWith(':host {'));
  const tokens = [
    '--bt-blanco-sol', '--bt-crema-luz', '--bt-naranja-cadmio', '--bt-celeste',
    '--bt-turquesa', '--bt-cobalto', '--bt-ultramar', '--bt-violeta-sombra', '--bt-malva',
  ];
  for (const token of tokens) assert.ok(salida.includes(token), `falta ${token}`);
});

test('las variables --bt-* fuera de :host llevan valor por defecto', () => {
  const salida = css();
  const fuera = salida.replace(bloqueHost(salida), '');
  const sinDefecto = fuera.match(/var\(\s*--bt-[a-z0-9-]+\s*\)/gi) || [];
  assert.deepEqual(sinDefecto, []);
});

test('incluye container queries y movimiento reducido', () => {
  const salida = css();
  assert.ok(salida.includes('@container'));
  assert.ok(salida.includes('@media (prefers-reduced-motion: reduce)'));
});

test('incluye los selectores de tema y de animación apagada', () => {
  const salida = css();
  for (const selector of [
    ':host([data-tema="light"])',
    ':host([data-tema="dark"])',
    ':host([data-animado="false"])',
  ]) {
    assert.ok(salida.includes(selector), `falta ${selector}`);
  }
});

test('no contiene ::part(', () => {
  assert.ok(!css().includes('::part('));
});

test('anima los iconos de nube, gota y bruma', () => {
  const salida = css();
  for (const selector of ['.bt-icono .nube', '.bt-icono .gota', '.bt-icono .bruma']) {
    assert.ok(salida.includes(selector), `falta ${selector}`);
  }
});

test('las llaves están equilibradas', () => {
  const salida = css();
  assert.equal((salida.match(/{/g) || []).length, (salida.match(/}/g) || []).length);
});

test('no usa @import ni referencias de red', () => {
  const salida = css();
  assert.ok(!salida.includes('@import'));
  assert.ok(!salida.includes('http://'));
  assert.ok(!salida.includes('https://'));
});

test('dos llamadas devuelven exactamente la misma cadena', () => {
  assert.equal(css(), css());
});
