# Módulo `elemento`

Nivel: normal.
Responsabilidad: es el custom element `<buen-tiempo>`: ciclo de vida, atributos y propiedades, carga de datos, refresco, buscador de ciudad, eventos y `localStorage`.

## Ficheros
- Código: `src/elemento.js`.
- Punto de entrada: `buentiempo.js` (raíz) — `import { registrar } from './src/elemento.js'; registrar();`.
- Pruebas: no tiene pruebas de Node (necesita DOM). Se comprueba a mano en `demo/index.html`; el resto de módulos sí se prueba sin red.
- Vecinos de referencia para el estilo: `src/config.js`, `src/api.js`, `src/plantilla.js`, `src/estilos.js`.

## Interfaz pública
```js
export const ETIQUETA = 'buen-tiempo';

export class BuenTiempo extends HTMLElement {
  static get observedAttributes() {}          // todas las claves de config.CLAVES
  constructor() {}
  connectedCallback() {}
  disconnectedCallback() {}
  attributeChangedCallback(nombre, anterior, nuevo) {}
}

/** Define el custom element si no lo está ya. */
export function registrar() {}
```
`registrar()` llama a `customElements.get(ETIQUETA)`; si es `undefined`, hace `customElements.define(ETIQUETA, BuenTiempo)`. Si ya está definido, no hace nada.

### Propiedades JS equivalentes a los atributos
Todas se reflejan en el atributo correspondiente (y lo eliminan si se asigna `null`):

| Propiedad | Atributo | Tipo |
|---|---|---|
| `lat` | `latitude` | `number\|null` |
| `lon` | `longitude` | `number\|null` |
| `place` | `place` | `string` |
| `country` | `country` | `string` |
| `days` | `days` | `number` |
| `lang` | `lang` | `string` |
| `units` | `units` | `'metric'\|'imperial'` |
| `timezone` | `timezone` | `string` |
| `theme` | `theme` | `'dark'\|'light'\|'auto'` |
| `hourlyStep` | `hourly-step` | `number` |
| `showCurrent` | `show-current` | `boolean` |
| `showHourly` | `show-hourly` | `boolean` |
| `editable` | `editable` | `boolean` |
| `remember` | `remember` | `boolean` |
| `refresh` | `refresh` | `number` |
| `weekStart` | `week-start` | `'monday'\|'sunday'` |
| `animate` | `animate` | `boolean` |

Los booleanos se reflejan con presencia/ausencia del atributo (`true` → atributo con `''`, `false` → sin atributo). Los números se reflejan con `String(valor)`.

## Ciclo de vida
- **`constructor`**: `attachShadow({ mode: 'open' })`; guarda `this._config = leerConfig(this)`, `this._datos = null`, `this._estado = 'cargando'`, `this._abort = null`, `this._temporizador = null`.
- **`connectedCallback`**: pinta el estado `cargando`, resuelve el lugar y carga. Al re-conectar se vuelve a cargar.
- **`disconnectedCallback`**: `clearInterval(this._temporizador)`, `this._abort?.abort()`, quita los escuchas de documento.
- **`attributeChangedCallback`**: si el elemento no está conectado, no hace nada. Si el atributo cambia algo de datos (`place`, `country`, `latitude`, `longitude`, `days`, `lang`, `units`, `timezone`), recarga; si solo cambia la presentación (`theme`, `animate`, `week-start`, `show-*`, `editable`), vuelve a pintar el estado actual sin pedir datos.

## Render
Refleja el tema y el movimiento en el propio host (`this.setAttribute('data-tema', config.theme)` y `this.setAttribute('data-animado', String(config.animate))`): es lo que selecciona el CSS de `estilos`, según `docs/DISENO.md`. Después monta en el Shadow DOM: `shadow.innerHTML = '<style>' + css() + '</style>' + plantilla`. El HTML lo produce `pintar({ datos, config })`; los estados, `pintarMensaje({ config, tipo, mensaje })`. Tras pintar, reconecta los escuchas del buscador y de los días.
`data-tema` y `data-animado` no son atributos de configuración observados: los escribe el propio elemento y no disparan recarga.

## Resolución del lugar y carga
Orden (el primero que dé coordenadas gana):
1. Si `config.remember` es `true` y `localStorage['buentiempo.lugar']` (JSON `{place, country, lat, lon, timezone}`) es válido (lat y lon finitos), se usa: la ciudad que eligió el visitante pesa más que la de los atributos. Todo acceso a `localStorage` va en try/catch; si falla, se ignora y se sigue.
2. Si `config.lat` y `config.lon` son números, se usan tal cual (no se geocodifica). Nombre mostrado: `config.place`, o si está vacío las coordenadas con dos decimales (`39.47, -0.37`); país: `config.country`.
3. Si hay `config.place`, se llama a `geocodificar(config.place, { lang: config.lang, pais: config.country })` y se toma el primer resultado (nombre, país y zona salen de él). Sin resultados: error `t(lang,'noEncontrado',{lugar: place})`.
4. Si nada de lo anterior da coordenadas, se emite `bt-error` con `{ message: t(lang,'faltaLugar') }` y se pinta el mensaje `vacio` con ese texto.

Con coordenadas, llama a `pedirPrevision({ lat, lon, zona, dias: config.days, unidades: config.units, lugar, pais })`, guarda `this._datos` y pinta. `zona` es `config.timezone` si no es `'auto'`; si no, la `zona` del lugar geocodificado; si no, `'auto'`.

Al terminar bien emite `bt-load` con `detail` = `this._datos` (el objeto normalizado). Si `geocodificar` o `pedirPrevision` lanzan, captura el error, emite `bt-error` con `{ message: error.message }` y pinta `pintarMensaje({ config, tipo: 'error', mensaje: error.message })`.

## Refresco
Si `config.refresh > 0`, `setInterval` con `config.refresh * 60000` ms que vuelve a cargar sin pasar por el estado `cargando` (pinta encima solo si la recarga termina bien). `refresh === 0` no programa nada.

## Buscador de ciudad (solo si `editable`)
Copia el comportamiento del buscador de referencia:
- El botón `.bt-lugar-boton` oculta el botón, muestra el campo `.bt-lugar-campo` y le da foco y selección.
- `input`: debounce de 250 ms; con menos de 2 caracteres se cierra la lista y no se consulta. Cada consulta cancela la anterior con `AbortController`; si el valor del campo ha cambiado al llegar la respuesta, se descarta.
- Sugerencias: `geocodificar(texto, { lang, pais: country })`; cada fila `<li role="option">` con `id="bt-sug-op-<i>"` muestra `nombre` y `region · pais`; se selecciona con `pointerdown` (no `click`).
- Teclado: `ArrowDown`/`ArrowUp` recorren en bucle (con `aria-selected` y `aria-activedescendant`), `Enter` elige la marcada, el primer `Escape` cierra la lista, el segundo restaura el valor original y cierra.
- `blur`: cierra la lista; si el texto cambió, geocodifica el texto y toma el primer resultado; si no, restaura el original. Elegir o resolver un lugar llama a cargar con sus coordenadas, escribe `localStorage['buentiempo.lugar']` si `config.remember`, y emite `bt-place-change` con `{ place, country, latitude, longitude, timezone }`.
- Si la geocodificación de la búsqueda falla, cierra la lista y no emite evento (la web anfitriona no debe romperse por un autocompletado).

## Interacción con los días
`plantilla` deja cada `.bt-dia` con `tabindex="0"` cuando `showHourly`. Al `mouseenter` o `focusin` de un día, `elemento` añade `data-activo` al `.bt-horas[data-idx="i"]` correspondiente; al `mouseleave`/`focusout`, lo quita. En táctil, un `click` sobre el día conmuta `data-activo`. `estilos` decide con `data-activo` qué se ve.

## Eventos
Todos son `CustomEvent` con `bubbles: true` y `composed: true`:
- `bt-load` → `detail` = datos normalizados (forma `Datos` de `api`).
- `bt-error` → `detail` = `{ message: string }`.
- `bt-place-change` → `detail` = `{ place, country, latitude, longitude, timezone }`.

## Errores
- `registrar()` lanza `Error` si `globalThis.customElements` no existe. Mensaje: `buen-tiempo necesita un entorno con customElements (navegador)`.
- Fallo de red o de Open-Meteo durante la carga: se emite `bt-error`; no se propaga la excepción.
- Geocodificación inicial sin resultados: `bt-error` con `{ message: t(lang,'noEncontrado',{lugar}) }`.
- Sin coordenadas ni lugar utilizables: `bt-error` con `{ message: t(lang,'faltaLugar') }`.
- Los textos de error que ve el visitante salen de `i18n`; los de `api` (técnicos) van al `detail` de `bt-error` y a la consola, y en pantalla se pinta `t(lang,'errorGenerico')`.

## Dependencias
- Internas: `config` (`leerConfig`, `CLAVES`), `api` (`geocodificar`, `pedirPrevision`), `plantilla` (`pintar`, `pintarMensaje`), `estilos` (`css`).
- Externas: ninguna.

## Criterio de aceptación (manual, en `demo/index.html`)
1. `<buen-tiempo place="Valencia">` muestra 7 días en castellano y emite `bt-load` (comprobado con un escucha que hace `console.log`).
2. `<buen-tiempo latitude="39.47" longitude="-0.37">` no llama al geocodificador (se ve en la pestaña Red).
3. Editar el título, escribir «Barce», esperar el desplegable, elegir una fila: cambia la previsión y emite `bt-place-change` con `place`, `country`, `latitude`, `longitude` y `timezone`.
4. Teclado en el buscador: `ArrowDown`/`ArrowUp` mueven la marca con bucle, `Enter` elige, `Escape` cierra y el segundo `Escape` restaura.
5. Con `remember`, recargar la página mantiene la ciudad elegida; sin `remember`, no.
6. Pasar el ratón por un día (y enfocarlo con Tab) muestra su línea horaria; sin `show-hourly`, no hay línea.
7. `theme="light"` y `theme="dark"` cambian los colores; `auto` sigue al sistema.
8. Con `refresh="0"` no hay peticiones nuevas; con `refresh="1"` se repite cada minuto.
9. Un fallo de red pinta el mensaje de error y emite `bt-error`.

## Comando de pruebas
`npm test` (cubre el resto de módulos; `elemento` se revisa a mano con `demo/index.html`).
