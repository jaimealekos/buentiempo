# Módulo `geometria`

Nivel: normal.
Responsabilidad: calcular, con funciones puras, las escalas y los trazados SVG de la banda de máximas/mínimas y de la línea de temperatura por horas.

## Ficheros
- Código: `src/geometria.js`.
- Pruebas: `test/geometria.test.js`.
- Vecinos de referencia para el estilo: `src/api.js`, `src/config.js`.

## Interfaz pública
```js
export const GRAFICO_ALTO = 126;       // alto del hueco del gráfico, en unidades de viewBox
export const HORAS_CURVA_ARRIBA = 64;  // franja vertical de la curva horaria
export const HORAS_CURVA_ABAJO = 86;
export const HORAS_TEMP_ALTO = 12;     // alto de la cifra de temperatura, para centrarla
export const HORAS_CADA = 2;           // paso por defecto de la línea horaria
export const LLUVIA_MINIMA = 1;        // % a partir del cual se pinta la lluvia

/**
 * Extremos de la escala común a todos los días, con un grado de aire arriba y abajo.
 * @param {Array<{tmax: number|null, tmin: number|null}>} dias - No vacío.
 * @returns {{ techo: number, suelo: number, recorrido: number }}
 */
export function escala(dias) {}

/**
 * Trazado de la banda de los días.
 * @param {Array<{tmax: number|null, tmin: number|null}>} dias - No vacío.
 * @returns {{
 *   viewBox: string,
 *   dArea: string, dMax: string, dMin: string,
 *   puntos: Array<{ cx: number, yMax: number, yMin: number }>
 * }}
 */
export function trazadoBanda(dias) {}

/**
 * Trazado de la línea horaria de un día.
 * @param {Array<{t: string, temp: number|null, codigo: number, lluvia_pct: number}>} horas
 * @param {{ paso?: number, ahora?: number|null }} [opciones]
 *   `paso`: horas entre marcas (entero >= 1; defecto 2).
 *   `ahora`: hora actual en punto flotante 0..24 en la zona del lugar; `null` = no dibujar.
 * @returns {{
 *   viewBox: string, dArea: string, dLinea: string, dAhora: string,
 *   marcas: Array<{ pct: number, hora: string, temp: number|null,
 *                   yTemp: number|null, lluviaPct: number }>
 * } | null}  null si `horas` tiene menos de 2 lecturas.
 */
export function trazadoHoras(horas, opciones) {}
```

### Sistema de coordenadas
- **Banda**: viewBox `0 0 <n*100> 126`, donde `n = dias.length`. Cada día ocupa 100 unidades; su centro es `x(i) = 50 + 100*i`. La escala es `techo = max(tmax) + 1`, `suelo = min(tmin) - 1`, `recorrido = max(0.1, techo - suelo)`, y la altura del día es `y(t) = 27 + (techo - t) / recorrido * 64`.
- `dArea`: `dMax` y, de vuelta, las mínimas desde el último día hasta el primero, cerrando con `Z`.
- `puntos`: `cx = x(i)`, `yMax = y(tmax)`, `yMin = y(tmin)`, redondeados.
- **Horas**: viewBox `0 0 240 126`. `x(i) = 5 + i * (230 / max(1, n-1))`. Escala `techo = max(temp) + 1`, `suelo = min(temp) - 1`, `recorrido = max(0.1, techo - suelo)`, y `y(t) = HORAS_CURVA_ARRIBA + (techo - t) / recorrido * (HORAS_CURVA_ABAJO - HORAS_CURVA_ARRIBA)`.
- `dAhora`: `M <x(ahora)> <HORAS_CURVA_ARRIBA - 4> V <HORAS_CURVA_ABAJO>`; `''` si `ahora` es `null`.
- `marcas`: una por cada índice `i` con `i % paso === 0`, en orden. `pct = x(i) / 240 * 100`, `hora` son las dos cifras de hora de `t` (`'2026-09-28T09:00' → '09'`), `temp` la lectura, `yTemp = y(temp) - HORAS_TEMP_ALTO / 2` (o `null` si `temp` es `null`), `lluviaPct = lluvia_pct ?? 0`.
- Los números de los trazados se redondean con `Number(v.toFixed(1))` para `x`, `toFixed(1)` para `y` de las marcas y `toFixed(2)` para `y` de los trazados, y se serializan sin ceros sobrantes (`50`, `29.91`), igual que en el sistema de referencia.

Comportamiento:
- `escala` y `trazadoBanda` lanzan `RangeError` si `dias` no es un array o está vacío.
- `trazadoHoras` devuelve `null` si `horas` no es un array o tiene menos de 2 lecturas.
- `paso` se normaliza con `Math.max(1, Math.floor(opciones.paso ?? HORAS_CADA))`; si no es finito, se usa `HORAS_CADA`.
- `ahora` solo se dibuja si es un número finito entre 0 y 24; si no, `dAhora = ''`.
- Una temperatura `null`/`undefined` en un día o en una hora se trata como `0` al escalar y situar (misma conversión que el sistema de referencia), salvo en `marcas`, donde `temp` y `yTemp` quedan en `null`.

## Errores
- `RangeError` en `trazadoBanda`/`escala` si `dias` está vacío. Mensaje: `no hay días para calcular la banda`.
- `RangeError` en `trazadoBanda`/`escala` si `dias` no es un array. Mensaje: `dias debe ser un array`.
- `trazadoHoras` no lanza: devuelve `null` cuando no hay material suficiente.

## Dependencias
- Internas: ninguna.
- Externas: ninguna.

## Criterio de aceptación
1. `escala([{tmax:10,tmin:0},{tmax:20,tmin:10}])` → `{ techo: 21, suelo: -1, recorrido: 22 }`.
2. `trazadoBanda([{tmax:10,tmin:0},{tmax:20,tmin:10}])` → `viewBox === '0 0 200 126'`, `dMax === 'M50 59 L150 29.91'`, `dMin === 'M50 88.09 L150 59'`, `dArea === 'M50 59 L150 29.91 L150 59 L50 88.09 Z'`.
3. El caso 2 devuelve `puntos` igual a `[{cx:50, yMax:59, yMin:88.09}, {cx:150, yMax:29.91, yMin:59}]`.
4. Un solo día `[{tmax:20,tmin:20}]` → `recorrido === 0.1`, `techo === 21`, `suelo === 19` (no se divide por cero).
5. `trazadoBanda([])` → `RangeError`; `trazadoBanda(null)` → `RangeError`.
6. `trazadoHoras(horasConTresLecturas)` con temperaturas `[10, 12, 11]` y `paso: 2` → `viewBox === '0 0 240 126'`, `dLinea === 'M5 80.5 L120 69.5 L235 75'`, `dArea === 'M5 80.5 L120 69.5 L235 75 L235 86 L5 86 Z'`.
7. El caso 6 devuelve dos marcas: `{pct:2.08, hora:'09', temp:10, yTemp:74.5, lluviaPct:0}` y `{pct:97.92, hora:'11', temp:11, yTemp:69, lluviaPct:0}` (según las horas `09:00`, `10:00`, `11:00`).
8. `trazadoHoras` con `temp: null` en una marca → `temp === null` y `yTemp === null`.
9. `trazadoHoras(horas, { ahora: 12.5 })` → `dAhora === 'M<...> 60 V86'`; con `ahora: null` o `ahora: 30` → `dAhora === ''`.
10. `trazadoHoras` con una sola lectura o con `[]` → `null`.
11. `trazadoHoras(horas, { paso: 0 })` usa paso 1 (una marca por hora); `{ paso: 3 }` marca los índices 0, 3, 6…

## Comando de pruebas
`node --test test/geometria.test.js`
