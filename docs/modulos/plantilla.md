# Módulo `plantilla`

Nivel: normal.
Responsabilidad: componer, con funciones puras, el HTML interno del widget a partir de los datos normalizados, la configuración y el idioma.

## Ficheros
- Código: `src/plantilla.js`.
- Pruebas: `test/plantilla.test.js`.
- Vecinos de referencia para el estilo: `src/geometria.js`, `src/iconos.js`, `src/i18n.js`.

## Interfaz pública
```js
/**
 * HTML interno del widget ya cargado.
 * @param {{ datos: Datos, config: Config }} entrada
 * @returns {string}
 */
export function pintar(entrada) {}

/**
 * HTML de un estado sin datos.
 * @param {{ config: Config, tipo: 'cargando'|'error'|'vacio', mensaje?: string }} entrada
 * @returns {string}
 */
export function pintarMensaje(entrada) {}
```
`pintar` y `pintarMensaje` no tocan el DOM: devuelven cadenas. El módulo no añade `<style>` (lo pone `elemento`). Los textos salen de `i18n` con `config.lang`.

## Estructura del HTML
Todas las clases llevan prefijo `bt-`. El primer elemento es el sprite de degradados:
```html
<svg class="bt-sprite" aria-hidden="true" focusable="false"><defs>…fundiciones()…</defs></svg>
```
Después, un `<section class="bt" part="widget" data-lang="…">` con:

- **Cabecera** `<header class="bt-cabecera">`:
  - Si `config.editable` es `true`, un formulario `<form class="bt-lugar" part="lugar" autocomplete="off">` con el `<h2 class="bt-titulo">` de abajo.
  - Si es `false`, `<h2 class="bt-titulo"><span class="bt-lugar-texto" part="lugar">Lugar</span></h2>` sin formulario.
  - Tras el título (o el texto), `<span class="bt-meta" part="meta">actualizado HH:MM</span>`; la hora es `datos.ts` formateada con `Intl.DateTimeFormat('en-GB', { timeZone: datos.zona, hour: '2-digit', minute: '2-digit', hour12: false })`, y en hora local si `datos.zona` está vacía.
  - Si `config.showCurrent` es `true`, `<p class="bt-ahora" part="ahora">` con `<span class="bt-temp-ahora">`, `<span>` con la descripción WMO, y tres `<span class="bt-tenue">` con sensación, humedad y viento.
- **Días** `<div class="bt-tiempo" part="dias" style="--bt-dias:N">`:
  - `<svg class="bt-banda" part="banda" viewBox="…" preserveAspectRatio="none" aria-hidden="true">` con un `<linearGradient id="bt-degradado-oro">`, el área (`<path d="…" fill="url(#bt-degradado-oro)"/>`), `.bt-linea-min`, `.bt-linea-max` y un `.bt-punto.bt-punto-min`/`.bt-punto.bt-punto-max` por día (`d="M<cx> <y-2.5> V<y+2.5>"`).
  - Por cada día con `config.showHourly` y al menos 2 lecturas horarias, `<div class="bt-horas" part="horas" data-idx="i" aria-hidden="true">` con `<svg class="bt-horas-linea" viewBox="0 0 240 126" preserveAspectRatio="none" aria-hidden="true">` y `<div class="bt-horas-marcas">`. El `<svg>` contiene el área, la línea (`.bt-linea-max`) y, si `dAhora` no está vacío, `<path class="bt-ahora-linea" d="…"/>`.
  - Una celda por día: `<div class="bt-dia" part="dia" data-idx="i" [data-hoy] [data-semana-nueva] [tabindex="0"] aria-label="…">` con `<span class="bt-nombre" part="dia-nombre">`, el icono (`part="dia-icono"`), `<span class="bt-max" part="dia-max">`, `<span class="bt-min" part="dia-min">` y `<span class="bt-lluvia" part="dia-lluvia">`.
- **Pie** `<footer class="bt-pie" part="pie">` con `<span class="bt-fuente">Open-Meteo</span>`.

### Buscador (cuando `editable`)
```html
<form class="bt-lugar" part="lugar" autocomplete="off">
  <h2 class="bt-titulo">
    <button type="button" class="bt-lugar-boton" title="Cambiar de ciudad">Lugar</button>
    <input type="text" class="bt-lugar-campo" part="campo" value="Lugar" maxlength="80"
           autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false"
           aria-autocomplete="list" aria-controls="bt-sugerencias"
           aria-label="Ciudad de la previsión" hidden>
    <ul class="bt-lugar-sugerencias" part="sugerencias" id="bt-sugerencias" role="listbox"
        aria-label="Ciudades encontradas" hidden></ul>
    <span class="bt-lugar-pais" part="pais">País</span>
  </h2>
</form>
```
El `<span class="bt-lugar-pais">` solo aparece si `datos.pais` no está vacío. `id="bt-sugerencias"` es fijo.

### Línea por horas
Cada marca cada `config.hourlyStep` horas:
```html
<div class="bt-hora-marca" part="hora" style="--bt-x:2.08%" title="09:00 · parcialmente nuboso · 10°">
  <span class="bt-hora-hh">09h</span><!-- icono -->
</div>
<span class="bt-hora-temp" part="hora-temp" style="--bt-x:2.08%;--bt-y:74.5px">10°</span>
<span class="bt-lluvia bt-hora-lluvia" part="hora-lluvia" style="--bt-x:2.08%"><svg …gota…></svg>30%</span>
```
El `title` es `«<hora>h · <descripción WMO> · <temp>°»` más `· lluvia <n>%` si `lluviaPct >= 1`. La temperatura es `—` si `temp` es `null`.

### Gota de lluvia
Constante del módulo, usada en `.bt-lluvia` y `.bt-hora-lluvia`:
```html
<svg class="bt-gota" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5c0 0 -5 6.2 -5 9.3a5 5 0 0 0 10 0c0-3.1-5-9.3-5-9.3Z"/></svg>
```
La celda `.bt-lluvia` muestra `<svg class="bt-gota">` + `<n>%` solo si `lluvia_pct >= 1`; si no, queda vacía.

### Reglas de composición
- **Idioma**: `nombreDia(config.lang, diaSemana)` con `diaSemana` de `new Date(`${fecha}T12:00:00Z`).getUTCDay()` (0 = domingo). El primer día (`i === 0`) lleva `t(lang,'hoy')` en lugar del nombre de día.
- **Semana nueva**: el día 0 nunca la lleva. Para `i > 0`, lleva `data-semana-nueva` si el día de la semana es el primero de `config.weekStart` (`monday → 1`, `sunday → 0`).
- **Hoy**: `data-hoy` solo en el primer día.
- **Días enfocables**: cuando `showHourly` es `true`, cada `.bt-dia` lleva `tabindex="0"`; si no, no es enfocable.
- **Hora actual**: solo para el primer día y solo si `datos.zona` es una cadena IANA no vacía, `ahora` = hora + minutos/60 en esa zona; ese valor se pasa a `trazadoHoras(horas, { paso: config.hourlyStep, ahora })`. Si no hay zona válida, `ahora` es `null` y no se dibuja la raya.
- **Iconos**: `svgIcono(codigo, { etiqueta: textoWmo(config.lang, codigo), clase: 'bt-icono' })`. El icono de `.bt-dia` y el de cada marca de hora usan esa etiqueta.
- **Temperaturas**: se redondean a entero con `Math.round` y se les añade `°`; `null` → `—`.
- **Viento**: `config.units === 'imperial'` usa `t(lang,'vientoImperial',{n})`, si no `t(lang,'viento',{n})`.
- **Texto accesible del día**: `aria-label` = `«<hoy|nombre-día>, <descripción WMO>, <t máx>, <t mín>[, lluvia <n>%]»` con `t(lang,'maxima',{n})` y `t(lang,'minima',{n})`; la lluvia solo si `lluvia_pct >= 1`.
- **`showHourly=false`**: no se emite ningún `.bt-horas` ni `.bt-horas-marcas`; el resto del día no cambia.
- **`showCurrent=false`**: no se emite `.bt-ahora`.
- **Escapado**: todo texto que venga de datos (`lugar`, `pais`) y las etiquetas se escapan para `& < > "` antes de ir al HTML.

### `pintarMensaje`
- `tipo: 'cargando'` → esqueleto, sin texto visible, con `role="status"` y `aria-busy="true"`:
```html
<section class="bt bt-esqueleto" part="esqueleto" data-lang="…"
         role="status" aria-busy="true" aria-label="Cargando previsión…">
  <span class="bt-esq-titulo"></span>
  <span class="bt-esq-ahora"></span>
  <div class="bt-esq-dias" style="--bt-dias:N">
    <span class="bt-esq-dia"></span>…   <!-- N = config.days -->
  </div>
</section>
```
- `tipo: 'error'` → `<section class="bt bt-vacio" part="vacio" role="alert">` con `<p class="bt-vacio-texto">` = `mensaje` si viene, si no `t(lang,'errorGenerico')`.
- `tipo: 'vacio'` → `<section class="bt bt-vacio" part="vacio" role="status">` con `<p class="bt-vacio-texto">` = `mensaje` si viene, si no `t(lang,'sinDatos')`.

## Errores
- `pintar` con `datos.dias` vacío o ausente delega en `pintarMensaje({ config, tipo: 'vacio' })`; no lanza.
- Un `tipo` distinto de los tres en `pintarMensaje` lanza `RangeError` con mensaje `tipo de mensaje desconocido: <valor>`.
- El resto de campos ausentes se tratan como `null`/vacío y se pintan como `—`.

## Dependencias
- Internas: `i18n` (`t`, `textoWmo`, `nombreDia`), `iconos` (`svgIcono`, `fundiciones`), `geometria` (`trazadoBanda`, `trazadoHoras`, `LLUVIA_MINIMA`).
- Externas: ninguna.

## Criterio de aceptación
1. `pintar({ datos, config })` empieza por `<svg class="bt-sprite"` y contiene `part="widget"`, `part="pie"` y `part="meta"`.
2. Contiene exactamente dos elementos `class="bt-dia"` y dos `class="bt-horas"` con `showHourly` por defecto y datos horarios suficientes.
3. El primer `.bt-dia` contiene `data-hoy`, `<span class="bt-nombre">hoy</span>` y un `aria-label` que incluye `máxima`, `mínima` y `lluvia`.
4. El icono del primer día contiene `data-icono="sol"` para un código 0 y `aria-label="despejado"`.
5. Con `showCurrent:false`, no aparece `bt-ahora`; con `showHourly:false`, no aparece `bt-horas` ni `bt-horas-marcas`.
6. Con `editable:false` no hay `<form`, ni `role="combobox"`, ni `bt-lugar-sugerencias`; sí hay `bt-lugar-texto`.
7. Con `editable:true`, el campo lleva `role="combobox"`, `aria-expanded="false"`, `aria-controls="bt-sugerencias"` y el `<ul>` tiene `role="listbox"`.
8. Con `datos.pais === ''`, no aparece `bt-lugar-pais`; con `'España'`, sí y con el texto escapado si tuviera caracteres.
9. Con `hourlyStep: 2` y tres lecturas horarias en un día, hay 2 `.bt-hora-marca`; con `hourlyStep: 1`, hay 3.
10. La lluvia de un día con `lluvia_pct: 0` no emite `bt-gota`; con `lluvia_pct: 30`, emite `bt-gota` y `30%`.
11. Con `units:'imperial'`, el viento aparece con `mph`; con `'metric'`, con `km/h`.
12. Con `lang:'en'`, el primer `.bt-nombre` es `today` y el `aria-label` usa textos en inglés.
13. Una temperatura `null` se pinta como `—` y no rompe la banda.
14. `pintarMensaje({config, tipo:'error', mensaje:'fallo de red'})` contiene `part="vacio"`, `role="alert"` y `fallo de red`.
15. `pintarMensaje({config, tipo:'vacio'})` contiene `role="status"` y el texto `sin datos` según `lang`.
16. `pintarMensaje({config, tipo:'cargando'})` contiene `part="esqueleto"`, `aria-busy="true"` y `config.days` elementos `bt-esq-dia`.
17. `pintarMensaje({config, tipo:'otro'})` → `RangeError`.
18. `pintar` con `datos.dias` vacío devuelve el mismo HTML que `pintarMensaje({config, tipo:'vacio'})`.
19. `pais` o lugar con `<script>` aparece escapado, no como etiqueta.
20. Con `showHourly:true`, cada `.bt-dia` lleva `tabindex="0"`; con `showHourly:false`, no.
21. Con `datos.zona: 'Europe/Madrid'`, el SVG del primer día contiene una raya `bt-ahora-linea`; con `zona: ''`, no.

## Comando de pruebas
`node --test test/plantilla.test.js`
