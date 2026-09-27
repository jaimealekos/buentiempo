# Módulo `estilos`

Nivel: trivial.
Responsabilidad: devolver, como texto, el CSS que se inyecta en el Shadow DOM del widget.

## Ficheros
- Código: `src/estilos.js`.
- Pruebas: `test/estilos.test.js`.
- Vecinos de referencia para el estilo: `src/config.js` (función pura que devuelve un valor).

## Interfaz pública
```js
/**
 * CSS completo del Shadow DOM.
 * @returns {string}
 */
export function css() {}
```
`css()` no recibe argumentos, no lee el DOM y no hace red: devuelve siempre la misma cadena.

Reglas:
- El CSS vive entero dentro del Shadow DOM; empieza por `:host {...}` con los valores por defecto de todas las variables `--bt-*` (`var(--bt-x, <defecto>)`), de forma que la web anfitriona pueda sobreescribirlas.
- Los valores concretos (paleta, tipografía, espaciado, radios, duraciones y punto de ruptura) están en `docs/DISENO.md`; este módulo los transcribe tal cual, sin inventar.
- Tematización: `:host([data-tema="light"])` y `:host([data-tema="dark"])`; `data-tema="auto"` usa `color-scheme` y `@media (prefers-color-scheme: light/dark)`.
- Responsive por container queries: `@container (max-width: 30rem)` pone la fila de días en desplazamiento horizontal con ancho mínimo por día; por encima, los días se reparten a partes iguales.
- Movimiento: `:host([data-animado="false"])` y `@media (prefers-reduced-motion: reduce)` dejan las animaciones en su estado final.
- Anima los elementos de los iconos con las clases que emite `iconos` (`.nube`, `.luz`, `.gota`, `.copo`, `.dab`, `.bruma`, `.rayo`, `.halo`, `.rayos`, `.nucleo`, `.resplandor`) y con las fases por día de `.bt-dia[data-idx="n"]`.
- Estiliza los `part`: `part="widget"`, `part="lugar"`, `part="campo"`, `part="dias"`, `part="dia"` mediante `::part(...)`.
- No usa `@import` ni `url(...)` hacia la red. Las fuentes opcionales se activan desde fuera (`fonts/buentiempo-fonts.css`), no aquí.

## Errores
- No aplica: `css()` no puede fallar ni recibe datos; siempre devuelve la cadena.

## Dependencias
- Internas: ninguna.
- Externas: ninguna.

## Criterio de aceptación
1. `typeof css() === 'string'` y `css().length > 0`.
2. `css()` contiene `:host {` y declara al menos `--bt-blanco-sol`, `--bt-crema-luz`, `--bt-naranja-cadmio`, `--bt-celeste`, `--bt-turquesa`, `--bt-cobalto`, `--bt-ultramar`, `--bt-violeta-sombra`, `--bt-malva`.
3. Todas las apariciones de `var(--bt-` que no estén en el bloque `:host` llevan valor por defecto (`var(--bt-x, ...)`).
4. Contiene `@container` y `@media (prefers-reduced-motion: reduce)`.
5. Contiene `:host([data-tema="light"])`, `:host([data-tema="dark"])` y `:host([data-animado="false"])`.
6. Contiene `::part(widget)`, `::part(dia)` y `::part(campo)`.
7. Contiene las clases de animación de los iconos: `.bt-icono .nube`, `.bt-icono .gota`, `.bt-icono .bruma`.
8. El número de `{` es igual al de `}`.
9. No contiene `@import` ni `http://` ni `https://`.
10. Dos llamadas consecutivas devuelven exactamente la misma cadena.

## Comando de pruebas
`node --test test/estilos.test.js`
