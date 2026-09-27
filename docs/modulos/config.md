# Módulo `config`

Nivel: trivial.
Responsabilidad: convertir los atributos del custom element en un objeto de configuración validado, con valores por defecto documentados.

## Ficheros
- Código: `src/config.js`.
- Pruebas: `test/config.test.js`.
- Vecinos de referencia para el estilo: `src/i18n.js`, `src/geometria.js` (mismo estilo: funciones puras, export nombrado, sin efectos).

## Interfaz pública
```js
/** Nombres de atributo (kebab-case) y su clave en el objeto de configuración. */
export const CLAVES = {
  latitude: 'lat', longitude: 'lon', place: 'place', country: 'country',
  days: 'days', lang: 'lang', units: 'units', timezone: 'timezone',
  theme: 'theme', 'hourly-step': 'hourlyStep', 'show-current': 'showCurrent',
  'show-hourly': 'showHourly', editable: 'editable', remember: 'remember',
  refresh: 'refresh', 'week-start': 'weekStart', animate: 'animate',
};

export const DEFECTOS = {
  lat: null, lon: null, place: '', country: '', days: 7, lang: 'es',
  units: 'metric', timezone: 'auto', theme: 'auto', hourlyStep: 2,
  showCurrent: true, showHourly: true, editable: true, remember: false,
  refresh: 15, weekStart: 'monday', animate: true,
};

/**
 * @param {{ getAttribute(nombre: string): string | null }} fuente - Normalmente el propio elemento.
 * @returns {{
 *   lat: number|null, lon: number|null, place: string, country: string,
 *   days: number, lang: string, units: 'metric'|'imperial', timezone: string,
 *   theme: 'dark'|'light'|'auto', hourlyStep: number,
 *   showCurrent: boolean, showHourly: boolean, editable: boolean,
 *   remember: boolean, refresh: number, weekStart: 'monday'|'sunday',
 *   animate: boolean
 * }}
 */
export function leerConfig(fuente) {}
```
`leerConfig` lee cada atributo de `fuente.getAttribute(...)`, lo interpreta y devuelve el objeto completo. Un atributo ausente toma su valor por defecto. Nunca lanza.

Reglas de interpretación:
- **Booleano**: el atributo presente vale `true` si su valor es `''`, `'true'` o `'1'`, y `false` si es `'false'` o `'0'`; cualquier otro valor usa el defecto. Un atributo ausente usa el defecto.
- **Número**: `Number(valor)`; si no es finito, se usa el defecto.
  - `days`: si no es entero, se redondea; después se ajusta al rango `[1, 16]`.
  - `refresh`: si no es entero, se redondea a la baja; nunca negativo (`Math.max(0, ...)`). `0` significa «no refrescar nunca».
  - `hourlyStep`: si no es entero, se redondea a la baja; después `Math.max(1, ...)`.
- **Enum**: valor exacto en la lista; si no, defecto. `theme`: `dark`, `light`, `auto`. `units`: `metric`, `imperial`. `weekStart`: `monday`, `sunday`.
- **lat / lon**: deben ser finitos y estar ambos presentes. Si falta uno o alguno no es finito, los dos quedan en `null` (el elemento geocodificará a partir de `place`).
- **lang**: solo se acepta `[a-z]{2}` o `[a-z]{2}-[a-z]{2}` (comparado en minúsculas); si no, `'es'`.
- **strings** (`place`, `country`, `timezone`): el valor tal cual, sin recortar; vacío usa el defecto.

## Errores
- No lanza excepciones: la validación es total. Un valor inválido cae a su valor por defecto de `DEFECTOS`; no hay fallo posible en tiempo de ejecución.
- Mensajes: no aplica (no hay error). El contrato de `elemento` es quien decide si avisa de un valor fuera de rango.

## Dependencias
- Internas: ninguna.
- Externas: ninguna.

## Criterio de aceptación
1. `leerConfig(ausente)` → objeto igual a `DEFECTOS` (con `lat` y `lon` a `null`).
2. `{ place: 'Valencia', days: '10' }` → `place === 'Valencia'` y `days === 10`.
3. `days: '0'`, `days: '99'`, `days: '3.7'` → `1`, `16`, `4` respectivamente.
4. `days: 'ocho'` → `7` (defecto).
5. `refresh: '-5'` → `0`; `refresh: '30.9'` → `30`; `refresh: '0'` → `0`.
6. `hourly-step: '0'` → `1`; `hourly-step: '3'` → `3`.
7. `latitude: '39.47'` sin `longitude` → `lat === null` y `lon === null`.
8. `latitude: '39.47', longitude: '-0.37'` → `lat === 39.47`, `lon === -0.37`.
9. `latitude: 'norte', longitude: 'x'` → ambos `null`.
10. `show-current=''` → `showCurrent === true`; `show-current='false'` → `false`; sin atributo → `true`.
11. `animate='0'` → `false`; `animate='sí'` → `true` (defecto).
12. `theme='azul'` → `'auto'`; `theme='LIGHT'` → `'auto'` (el enum es exacto, en minúsculas).
13. `units='imperial'` → `'imperial'`; `week-start='sunday'` → `'sunday'`.
14. `lang='EN'` → `'en'`; `lang='francés'` → `'es'`; `lang='pt-br'` → `'pt-br'`.
15. `remember=''` → `true`; `place=''` → `''` (no se cae a ningún nombre fijo).
16. Cada clave de `DEFECTOS` aparece exactamente una vez en el objeto devuelto (sin claves extra).

## Comando de pruebas
`node --test test/config.test.js`
