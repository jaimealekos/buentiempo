# Diseño gráfico de `<buen-tiempo>`

Widget de previsión meteorológica embebible: **web component con Shadow DOM, sin
dependencias**. Este documento fija valores
exactos para que quien implemente no tenga que decidir nada.

> Todo el CSS vive **dentro del Shadow DOM**. Los selectores son relativos a
> `:host`. Los valores que el usuario puede reescribir desde su web son
> variables CSS públicas `--bt-*` (sección 3). Los colores del tema oscuro son
> los de la estética original; el tema claro es nuevo, con los mismos matices.

---

## 1. Tema oscuro (estética original, sin cambios)

Es la referencia: cualquier desviación visual respecto
a esto es un fallo, no una mejora.

| Papel | Valor original | Hex de referencia (sRGB) |
|---|---|---|
| Fondo del widget / suelo de la línea por horas | `oklch(.135 .006 75)` | `#0A0806` |
| Superficie (tarjeta) | `oklch(.175 .007 75)` | `#12100D` |
| Superficie elevada (sugerencias, hover de día) | `oklch(.215 .008 75)` | `#1C1915` |
| Superficie máxima (fila marcada, globo) | `oklch(.260 .009 75)` | `#27231F` |
| Borde | `oklch(.280 .010 75)` | `#2C2823` |
| Borde fuerte | `oklch(.380 .012 75)` | `#46423B` |
| Texto | `oklch(.930 .012 85)` | `#EBE7DF` |
| Texto secundario | `oklch(.720 .014 85)` | `#A9A49B` |
| Texto terciario / tenue | `oklch(.620 .014 85)` | `#8A867D` |
| Acento oro | `oklch(.800 .115 82)` | `#E3B662` |
| Oro claro (relleno hover, brillo) | `oklch(.900 .080 88)` | `#F4DCA1` |
| Oro oscuro (líneas, semana, foco suave) | `oklch(.640 .110 76)` | `#B28235` |
| Éxito | `oklch(.800 .150 160)` | `#52DB9C` |
| Aviso | `oklch(.800 .160 55)` | `#FF9F4C` |
| Error / fallo | `oklch(.720 .180 22)` | `#FF6E70` |

Los nueve colores de pintura de los iconos (solo dentro de los SVG; nunca
superficies ni interfaz), con los nombres de variable reservados por
`docs/modulos/iconos.md`.

| Variable | Oscuro | Hex | Claro | Hex |
|---|---|---|---|---|
| `--bt-blanco-sol` | `oklch(.985 .025 95)` | `#FFFAE8` | `oklch(.985 .025 95)` | `#FFFAE8` |
| `--bt-crema-luz` | `oklch(.935 .085 90)` | `#FFE8A8` | `oklch(.860 .090 90)` | `#E8CF8C` |
| `--bt-naranja-cadmio` | `oklch(.790 .175 62)` | `#FF9D1E` | `oklch(.620 .170 62)` | `#CB6800` |
| `--bt-celeste` | `oklch(.850 .075 232)` | `#9CD7F7` | `oklch(.520 .100 232)` | `#147298` |
| `--bt-turquesa` | `oklch(.790 .130 200)` | `#20D3DB` | `oklch(.520 .120 200)` | `#007C84` |
| `--bt-cobalto` | `oklch(.560 .190 262)` | `#306CE2` | `oklch(.440 .170 262)` | `#1649AE` |
| `--bt-ultramar` | `oklch(.420 .170 278)` | `#3D39A6` | `oklch(.360 .150 278)` | `#302B89` |
| `--bt-violeta-sombra` | `oklch(.620 .145 302)` | `#976ECE` | `oklch(.470 .150 302)` | `#6B409F` |
| `--bt-malva` | `oklch(.740 .100 322)` | `#C996D0` | `oklch(.560 .110 322)` | `#925D9B` |

Colores de las paradas de las fundiciones (`bt-s-*`, ver `docs/modulos/iconos.md`),
que fija `estilos` dentro del Shadow DOM: `#bt-s-masa` → `--bt-violeta-sombra`,
`--bt-cobalto`; `#bt-s-masa-lejos` → `--bt-malva`, `--bt-violeta-sombra`;
`#bt-s-masa-tormenta` → `--bt-violeta-sombra`, `--bt-ultramar`; `#bt-s-halo` →
`--bt-naranja-cadmio`; `#bt-s-nucleo` → `--bt-blanco-sol`, `--bt-crema-luz`,
`--bt-naranja-cadmio`.

Elementos que **hay que reproducir tal cual** en oscuro:

- **Banda máx/mín** (`.banda`): SVG `viewBox="0 0 N*100 126"`,
  `preserveAspectRatio="none"`. Área entre máximas y mínimas con degradado
  vertical oro `stop-opacity .26 → .04`; línea de máximas `--bt-accent`,
  `stroke-width 1.25`, `stroke-linejoin/linecap: round`,
  `vector-effect: non-scaling-stroke`; mínimas `--bt-text-3`, `stroke-width 1`.
  Vértices con trazos verticales de 5 unidades (`M cx y-2.5 V y+2.5`),
  `stroke-width 1.5`: nunca círculos (se ovalarían al estirar el SVG). Reparto
  interno fijo: curva de y=27 a y=91; lluvia de y=96 a y=118.
- **Marca de hoy**: `background: color-mix(in oklch, var(--bt-accent) 6%, transparent)`
  y nombre del día en `--bt-accent`. Al pasar el ratón por cualquier día, hoy
  deja de destacar (tinte y nombre se apagan).
- **Marca de nueva semana** (lunes, celdas índice > 0): dos pseudotramos de
  `inline-size: 1.5px` con `color-mix(in oklch, var(--bt-accent-line) 28%, transparent)`,
  filas 1-4 y 5-6, con márgenes negativos de `.5rem`. El tramo inferior se apaga
  (opacidad a 0, `transition 80ms`) mientras se ve una línea por horas.
- **Línea por horas** (`.horas`): sustituye a la banda al pasar el ratón por un
  día, por CSS puro. Suelo propio
  `--bt-hourly-floor: color-mix(in oklab, var(--bt-cobalto) 8%, var(--bt-bg-0))`
  (en `oklab`, no `oklch`: en `oklch` el tono salía más cálido). Curva 24 h en
  `viewBox 240x126`, una lectura cada `hourly-step` horas (2 por defecto): hora
  arriba (`--bt-fs-data` mono,
  `--bt-text-3`), icono 26 px debajo, temperatura rotulando su punto de la curva
  (`0.8125rem/12px` mono, `--bt-text`, fondo del suelo para cortar la línea) y
  lluvia al pie. Área con el mismo degradado oro, `opacity .55`. En el día de
  hoy, raya vertical punteada (`2 3`) en `--bt-accent`, `opacity .75`.
- **Gotas de lluvia**: icono `#i-gota` (sprite de interfaz) a 10 px,
  `stroke: currentColor`, `stroke-width 1.25`, + porcentaje en mono
  `--bt-text-3`, con `min-block-size: 1.375rem`.
- **Brillo superior** (`::before` del widget): línea de 1 px en el borde
  superior con degradado que barre de 50 % a 85 % al pasar el ratón, 900 ms
  `--bt-ease-out`.

Todo el detalle de iconos "Sorolla", sus cuerpos SVG y el mapa WMO→icono están
en `src/iconos.js`; el widget los inlinea (no `<use>`, porque las
animaciones CSS no cruzan el árbol en sombra) y colorea los degradados desde el
CSS. Rejilla 32x32 dibujada a 44 px, luz siempre desde arriba-izquierda.

---

## 2. Tema claro (nuevo, mismos matices)

Mismos matices cálidos (H 75-88 en neutros, 82 en el oro) y los mismos nueve
colores de pintura, oscurecidos donde hace falta para que el dibujo y el texto
se lean sobre fondo claro. Los contrastes están calculados en la sección 7.

| Papel | Claro | Hex |
|---|---|---|
| Fondo | `oklch(.975 .006 75)` | `#F9F6F2` |
| Superficie | `oklch(.945 .007 75)` | `#F0ECE8` |
| Superficie elevada | `oklch(.905 .008 75)` | `#E3DFDA` |
| Superficie máxima | `oklch(.855 .009 75)` | `#D3CFC9` |
| Borde | `oklch(.855 .010 75)` | `#D3CFC8` |
| Borde fuerte | `oklch(.720 .012 75)` | `#A9A49C` |
| Texto | `oklch(.250 .012 75)` | `#25211B` |
| Texto secundario | `oklch(.420 .014 75)` | `#524C45` |
| Texto terciario | `oklch(.480 .014 75)` | `#625D55` |
| Acento oro | `oklch(.520 .115 82)` | `#896100` |
| Relleno hover de botón | `oklch(.440 .115 82)` | `#744E00` |
| Acento oscuro (líneas, foco) | `oklch(.400 .100 72)` | `#683C00` |
| Éxito | `oklch(.500 .130 160)` | `#007948` |
| Aviso | `oklch(.520 .130 55)` | `#A05000` |
| Error | `oklch(.540 .170 22)` | `#BD373F` |

**Selección de tema.** El atributo público del elemento es `theme` (`dark`,
`light`, `auto`; ver `docs/modulos/config.md`) y su equivalente para movimiento
es `animate`. El elemento los refleja en el host como `data-tema` y
`data-animado`, que es lo que selecciona el CSS (así lo fija
`docs/modulos/estilos.md`). Reglas: `:host([data-tema="dark"])` y
`:host([data-tema="light"])` fuerzan; `data-tema="auto"` usa
`color-scheme` y `@media (prefers-color-scheme: light)`. Oscuro es el punto de
partida: sin atributo ni preferencia del sistema, se pinta oscuro.

---

## 3. Variables públicas `--bt-*`

Toda variable se declara en `:host` (oscuro) y se redefine en claro. El usuario
la sobrescribe desde su web con
`buen-tiempo { --bt-accent: ...; }`. Ningún color, radio, fuente, espacio o
duración puede quedar escrito a mano fuera de esta lista.

### 3.1 Color

| Variable | Oscuro | Claro | Qué pinta |
|---|---|---|---|
| `--bt-bg-0` | `oklch(.135 .006 75)` | `oklch(.975 .006 75)` | fondo del widget y suelo de la línea por horas |
| `--bt-bg-1` | `oklch(.175 .007 75)` | `oklch(.945 .007 75)` | superficie de la tarjeta |
| `--bt-bg-2` | `oklch(.215 .008 75)` | `oklch(.905 .008 75)` | sugerencias, tinte de hover de día |
| `--bt-bg-3` | `oklch(.260 .009 75)` | `oklch(.855 .009 75)` | fila marcada del buscador, globo |
| `--bt-border` | `oklch(.280 .010 75)` | `oklch(.855 .010 75)` | bordes finos y separadores |
| `--bt-border-strong` | `oklch(.380 .012 75)` | `oklch(.720 .012 75)` | bordes de campo, borde del desplegable |
| `--bt-text` | `oklch(.930 .012 85)` | `oklch(.250 .012 75)` | texto principal y máximas |
| `--bt-text-2` | `oklch(.720 .014 85)` | `oklch(.420 .014 75)` | texto secundario, mínimas |
| `--bt-text-3` | `oklch(.620 .014 85)` | `oklch(.480 .014 75)` | etiquetas, meta, lluvia, línea de mínimas |
| `--bt-accent` | `oklch(.800 .115 82)` | `oklch(.520 .115 82)` | oro: hoy, máximas, foco, botón primario |
| `--bt-accent-fill-hover` | `oklch(.900 .080 88)` | `oklch(.440 .115 82)` | hover de botón primario y de botón fantasma |
| `--bt-accent-line` | `oklch(.640 .110 76)` | `oklch(.400 .100 72)` | línea de nueva semana, subrayados, raya de "ahora", anillo de foco en claro |
| `--bt-ok` | `oklch(.800 .150 160)` | `oklch(.500 .130 160)` | marcas de éxito |
| `--bt-warn` | `oklch(.800 .160 55)` | `oklch(.520 .130 55)` | aviso de caducidad, ciudad no encontrada |
| `--bt-danger` | `oklch(.720 .180 22)` | `oklch(.540 .170 22)` | error de campo, error de conexión |
| `--bt-today-bg` | `color-mix(in oklch, var(--bt-accent) 6%, transparent)` | igual | tinte de la celda de hoy |
| `--bt-hover-bg` | `color-mix(in oklch, var(--bt-bg-2) 55%, var(--bt-bg-1))` | `color-mix(in oklch, var(--bt-bg-2) 70%, var(--bt-bg-1))` | fondo de la celda bajo el puntero |
| `--bt-hourly-floor` | `color-mix(in oklab, var(--bt-cobalto) 8%, var(--bt-bg-0))` | igual | suelo de la línea por horas |
| `--bt-shine` | `color-mix(in oklch, var(--bt-accent-fill-hover) 70%, transparent)` | igual | brillo del borde superior |
| `--bt-focus-ring` | `color-mix(in oklch, var(--bt-accent) 28%, transparent)` | `var(--bt-accent-line)` | color del halo/anillo de foco |
| `--bt-shadow-pop` | `0 12px 28px -12px oklch(0 0 0 / .55)` | `0 12px 28px -12px oklch(0 0 0 / .18)` | sombra del desplegable y del globo |
| `--bt-shadow-glow` | `0 8px 24px oklch(0 0 0 / .45)` | `0 8px 24px oklch(0 0 0 / .15)` | sombra de capas flotantes |

### 3.2 Pintura de iconos (solo SVG)

Nombres reservados por `docs/modulos/iconos.md`: `--bt-blanco-sol`,
`--bt-crema-luz`, `--bt-naranja-cadmio`, `--bt-celeste`, `--bt-turquesa`,
`--bt-cobalto`, `--bt-ultramar`, `--bt-violeta-sombra`, `--bt-malva`. Valores en
la tabla de la sección 1.

### 3.3 Tipografía

| Variable | Valor por defecto | Claro |
|---|---|---|
| `--bt-font-display` | `ui-serif, Georgia, "Times New Roman", serif` | igual |
| `--bt-font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | igual |
| `--bt-font-mono` | `ui-monospace, "Cascadia Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace` | igual |
| `--bt-fs-title` | `1.375rem` | igual |
| `--bt-fs-now` | `2rem` | `1.75rem` |
| `--bt-fs-day` | `1.375rem` | igual |
| `--bt-fs-body` | `.8125rem` | igual |
| `--bt-fs-data` | `.75rem` | igual |
| `--bt-fs-label` | `.6875rem` | igual |
| `--bt-lh-title` | `1.2` | igual |
| `--bt-lh-body` | `1.5` | igual |
| `--bt-ls-label` | `.10em` | igual |

**Activar Fraunces/Geist/Geist Mono.** El widget por defecto usa la pila del
sistema (nunca pide fuentes a la red). Se activan de dos formas equivalentes:
cargando `fonts/buentiempo-fonts.css` (declara los `@font-face` con
`font-display: swap`, servidos en local)
o declarando los `@font-face` en la web anfitriona. En ambos casos hay que
sobrescribir las tres variables:

```css
buen-tiempo {
  --bt-font-display: fraunces, "Iowan Old Style", Georgia, serif;
  --bt-font-text: geist, Inter, system-ui, sans-serif;
  --bt-font-mono: geistmono, "JetBrains Mono", ui-monospace, monospace;
}
```

### 3.4 Espaciado, rejilla y medidas

| Variable | Valor | Qué pinta |
|---|---|---|
| `--bt-space-1` | `.25rem` | separación mínima |
| `--bt-space-2` | `.5rem` | huecos de rejilla, padding de pastilla |
| `--bt-space-3` | `.75rem` | padding de sugerencia, huecos medianos |
| `--bt-space-4` | `1rem` | padding lateral de la tarjeta |
| `--bt-space-5` | `1.5rem` | padding principal |
| `--bt-space-6` | `2rem` | separaciones de bloque |
| `--bt-radius-s` | `4px` | campos, sugerencias, pastillas |
| `--bt-radius-m` | `8px` | tarjeta y desplegable |
| `--bt-radius-pill` | `999px` | boca de la gota, marcas redondas |
| `--bt-day-w` | `5.5rem` | ancho máximo de una celda de día |
| `--bt-day-min` | `4.25rem` | ancho mínimo de una celda; al no caber, la fila desborda |
| `--bt-days` | (sin valor fijo) | número de columnas; lo inyecta el componente desde `days` |
| `--bt-icon` | `44px` | icono del tiempo de un día |
| `--bt-icon-hour` | `26px` | icono de la línea por horas |
| `--bt-chart-h` | `126px` | alto del hueco de la banda / línea (viewBox) |
| `--bt-drop` | `10px` | icono de gota de lluvia |
| `--bt-pad` | `var(--bt-space-4) var(--bt-space-5)` | relleno de la tarjeta |
| `--bt-max-w` | `40rem` | ancho máximo sugerido del widget |

### 3.5 Movimiento

| Variable | Valor | Qué pinta |
|---|---|---|
| `--bt-ease-soft` | `cubic-bezier(.2, .7, .2, 1)` | transiciones de interfaz |
| `--bt-ease-out` | `cubic-bezier(.16, 1, .3, 1)` | entradas y barrido de brillo |
| `--bt-ease-sine` | `cubic-bezier(.45, 0, .55, 1)` | respiración de iconos |
| `--bt-dur-1` | `80ms` | cambios mínimos |
| `--bt-dur-2` | `120ms` | hover de día, cruces de opacidad |
| `--bt-dur-3` | `160ms` | aparición de capas |
| `--bt-dur-4` | `240ms` | cambios de anchura |
| `--bt-dur-skeleton` | `1.6s` | pulso del esqueleto de carga |
| `--bt-dur-halo` | `9s` | halo del sol |
| `--bt-dur-rays` | `11s` | vibración de las pinceladas del sol |
| `--bt-dur-veil` | `14s` | núcleo velado (niebla) |
| `--bt-dur-cloud` | `19s` | deriva de la nube |
| `--bt-dur-cloud-far` | `27s` | deriva de la nube lejana |
| `--bt-dur-light` | `13s` | encendido de la cara de luz |
| `--bt-dur-rain` | `2.8s` | caída de una gota |
| `--bt-dur-snow` | `7s` | caída de un copo |
| `--bt-dur-drizzle` | `5s` | titileo de la llovizna |
| `--bt-dur-lightning` | `9s` | ciclo del relámpago |
| `--bt-dur-fog` | `18s` | banda de bruma 1 |
| `--bt-dur-fog-2` | `23s` | banda de bruma 2 |
| `--bt-dur-fog-3` | `27s` | banda de bruma 3 |
| `--bt-dur-fog-4` | `21s` | banda de bruma 4 |

---

## 4. Jerarquía visual y orden de lectura

**Vista principal.** Orden en el DOM = orden de lectura (el CSS no reordena):

1. **Cabecera** — título de ciudad + país (botón que abre el buscador) y, a la
   derecha, la frescura ("actualizado 14:02", mono tenue; en aviso si caduca).
2. **Ahora** — temperatura actual en serif 2rem (`--bt-fs-now`) + descripción +
   sensación, humedad y viento en mono tenue.
3. **Fila de días** — la banda y, al pasar el ratón o enfocar un día, su línea
   por horas. Es lo que manda: la forma de la banda se lee de un vistazo.
4. **Pie** — fuente de datos ("Open-Meteo", mono tenue).

Qué manda: la temperatura actual y la silueta de la banda. Secundario: nombre de
los días y mínimas. Terciario: lluvia, país y frescura.

**Sin desplazarse.** Con ancho ≥720 px se ve todo: cabecera, ahora y todos los
días. Por debajo de 480 px se ve la cabecera y unas 3-4 celdas; el resto, con
desplazamiento horizontal.

**Otras vistas.** Buscador abierto: manda el campo y su lista (capa flotante
sobre la banda, fondo `--bt-bg-2`, sombra `--bt-shadow-pop`). Cargando: manda el
esqueleto con la silueta de la vista final. Error/sin conexión: manda el bloque
vacío centrado.

---

## 5. Estados de los controles

Los estados se aplican con `:hover`, `:focus-visible`, `:active`, `[aria-busy]`,
`[disabled]`/`[aria-disabled="true"]` y `[data-error]`. Mensajes de error: en
`--bt-danger` para fallos de campo y en `--bt-warn` para avisos de datos.

### Botón (título de ciudad, "fantasma", primario)
| Estado | Aspecto |
|---|---|
| Reposo | fondo transparente, borde transparente, color `--bt-text`; el primario: fondo `--bt-accent`, color `--bt-bg-0` |
| Hover | fantasma: borde `color-mix(in oklch, var(--bt-accent-line) 70%, var(--bt-border-strong))`, color `--bt-accent-fill-hover`, subrayado punteado transparente→`color-mix(accent 45%)`; primario: fondo `--bt-accent-fill-hover` |
| Foco | `outline: 2px solid var(--bt-accent); outline-offset: 2px` + halo `box-shadow: 0 0 0 3px var(--bt-focus-ring)` |
| Pulsado | primario: fondo `color-mix(in oklch, var(--bt-accent) 88%, black)`; fantasma: fondo `--bt-bg-2` |
| Cargando | `aria-busy="true"`, texto sustituido por barra de esqueleto, `pointer-events` activos |
| Desactivado | color `color-mix(in oklch, var(--bt-text-3) 55%, var(--bt-bg-1))`, borde `color-mix(in oklch, var(--bt-border) 70%, var(--bt-bg-1))`, `cursor: not-allowed` |
| Error | borde `--bt-danger`, ayuda `--bt-danger` |

### Campo de búsqueda
Reposo: fondo `--bt-bg-0`, borde 1px `--bt-border-strong`, radio `--bt-radius-s`,
alto 2.25rem, padding-inline `--bt-space-3`, texto `--bt-text`, placeholder
`--bt-text-3`. Hover: borde `color-mix(in oklch, var(--bt-accent-line) 50%, var(--bt-border-strong))`.
Foco: borde `--bt-accent-line` + halo `var(--bt-focus-ring)`. Error:
borde `--bt-danger` y ayuda `--bt-danger`: «Ese nombre es demasiado largo.»
(o «El nombre no puede estar vacío.»). Cargando: `aria-busy="true"`, texto del
campo atenuado a `--bt-text-3`. Longitud máxima 80.

### Enlace
Reposo: color heredado, subrayado transparente. Hover: subrayado
`--bt-accent-line`. Foco: anillo `var(--bt-focus-ring)`. Pulsado: color
`--bt-accent`. Desactivado: `--bt-text-3`.

### Casilla
Caja de `.875rem`, `accent-color: var(--bt-accent)`; la etiqueta tiene
`min-block-size: 44px` y centra el contenido para que el área de acierto llegue
a 44x44 px. Foco: halo `var(--bt-focus-ring)`. Desactivada:
`color: color-mix(var(--bt-text-3) 55%, var(--bt-bg-1))`.

### Lista de sugerencias
Contenedor: fondo `--bt-bg-2`, borde `--bt-border-strong`, radio `--bt-radius-m`,
sombra `--bt-shadow-pop`, máx. `15rem` de alto, scroll fino. Fila:
`padding: var(--bt-space-2) var(--bt-space-3)`, radio `--bt-radius-s`,
`min-block-size: 44px`, nombre en `--bt-text`, región/país en mono `--bt-text-3`
con puntos suspensivos. Hover y `aria-selected="true"`: fondo `--bt-bg-3`.
Foco: halo `var(--bt-focus-ring)`. Vacía: se cierra (no se muestra mensaje).
Buscador sin red: aviso «No se pudo consultar el buscador. Escribe la ciudad y
pulsa Intro.»

### Día
Reposo: fondo transparente, borde izquierdo `color-mix(in oklch, var(--bt-border) 60%, transparent)`.
Hover: fondo `--bt-hover-bg`. Foco (día con `tabindex="0"`): halo
`var(--bt-focus-ring)` interior y, si es puntero fino, muestra su línea por
horas igual que el hover. Hoy: fondo `--bt-today-bg` y nombre en
`--bt-accent`; mientras se mira otro día, hoy pierde tinte y el nombre pasa a
`--bt-text-3`. Nueva semana: separador doble descrito en la sección 1.
Cargando: celdas y esqueleto descritos abajo.

### Estados globales
- **Cargando**: esqueleto con la misma silueta (barra de título de 8rem, barra
  de "ahora" de 4rem, tantos bloques de día como `days`), fondo `--bt-bg-2`,
  radio `--bt-radius-s`, animación `bt-pulse var(--bt-dur-skeleton) ease-in-out
  infinite alternate` (opacidad `.45 → .9`). Sin spinner. (El encargo pide este
  esqueleto sutil; `docs/ARQUITECTURA.md` dice «cargando (mensaje)». Manda el
  encargo; ver dudas.)
- **Sin conexión / error**: bloque `.vacio` de `min-block-size: 6rem`, centrado,
  texto en `--bt-text-3` a `.6875rem` mayúsculas con `.10em`; título
  «Sin conexión» y detalle «Open-Meteo no ha respondido todavía» en mono.
- **Ciudad no encontrada**: junto al título, meta en `--bt-warn`:
  «No se encontró «{ciudad}». Prueba con otro nombre.» El widget conserva la
  previsión anterior.
- **Frescura caducada**: meta en `--bt-warn` con el texto «· caducado».

---

## 6. Responsive por container queries y movimiento

`:host { container-type: inline-size; }`. Los tres tramos:

| Tramo | Rejilla | Qué cambia |
|---|---|---|
| `@container (inline-size >= 720px)` | `repeat(var(--bt-days), minmax(0, var(--bt-day-w)))`, sin scroll | todos los días repartidos, `--bt-icon` 44px, fila de lluvia visible, línea por horas con hover/foco |
| `@container (480px <= inline-size < 720px)` | igual, `--bt-day-w` 4.5rem, `--bt-icon` 40px | días comprimidos, sin scroll; fila de lluvia visible; mismo hover/foco |
| `@container (inline-size < 480px)` (30rem) | desplazamiento horizontal: `overflow-x: auto`, `scroll-snap-type: x mandatory`, columna `minmax(var(--bt-day-min), var(--bt-day-w))`, cada día `scroll-snap-align: center` | `--bt-icon` 36px; se oculta la fila de lluvia de cada día; `--bt-fs-title` `1.25rem`, `--bt-fs-now` `1.75rem`, `--bt-pad` `var(--bt-space-3)` |

`--bt-day-min: 4.25rem` (68 px) es el suelo de una celda. Cuando el total de la
fila no cabe, desborda en horizontal **aunque el contenedor pase de 480 px**
(p. ej. `days="16"` en 600 px); el suelo es lo que dispara el desplazamiento, y
el tramo de 30rem es solo el punto a partir del cual se fuerza además el diseño
compacto. `scroll-padding-inline: var(--bt-space-3)`.

**Por qué scroll-snap y no menos días.** La banda es un único dibujo continuo
sobre toda la serie y la marca de nueva semana la parte en semanas: recortar
días rompería la lectura y el alcance pedido (`days` de 1 a 16). El
desplazamiento con `scroll-snap-align: center` mantiene un día centrado, deja la
línea por horas alineada y respeta el objetivo táctil de 44 px (68 px de ancho
por celda).

### Movimiento (todas las animaciones)

Clases reales que emite `docs/modulos/iconos.md`, todas bajo el `<svg
class="bt-icono">`. `.bt-dia` es la clase interna de la celda de un día.
Todas las animaciones llevan `var(--fase, 0s)` como retardo.

| Selector | Animación | Duración | Curva |
|---|---|---|---|
| `.bt-icono .halo` | `bt-late` (opacidad .7→1) | `--bt-dur-halo` 9s, alternate | `--bt-ease-sine` |
| `.bt-icono .rayos` | `bt-vibra` (rotate -3°→3°, `transform-box: fill-box`) | `--bt-dur-rays` 11s, alternate | `--bt-ease-sine` |
| `.bt-icono .nucleo--velado` | `bt-late` | `--bt-dur-veil` 14s, alternate | `--bt-ease-sine` |
| `.bt-icono .nube` | `bt-deriva` (translate ±.5px) | `--bt-dur-cloud` 19s, alternate | `--bt-ease-sine` |
| `.bt-icono .nube--lejos` | `bt-deriva` | `--bt-dur-cloud-far` 27s, alternate-reverse | `--bt-ease-sine` |
| `.bt-icono .luz` | `bt-enciende` (opacidad .72→1) | `--bt-dur-light` 13s, alternate | `--bt-ease-sine` |
| `.bt-icono .gota` | `bt-cae` (translate -2.5→3px, opacidad 0→1→0) | `--bt-dur-rain` 2.8s, infinite; retardos en `.caida > .gota:nth-child(2/3)`: -0.95s y -1.9s | `cubic-bezier(.3, 0, .7, 1)` |
| `.bt-icono .copo` | `bt-nieva` | `--bt-dur-snow` 7s; retardos -2.4s y -4.7s | `--bt-ease-sine` |
| `.bt-icono .dab` | `bt-titila` (opacidad .45→1) | `--bt-dur-drizzle` 5s, alternate; retardos -1.1/-2.3/-3.4/-4.2s | `--bt-ease-sine` |
| `.bt-icono .rayo`, `.bt-icono .resplandor` | `bt-relampago` | `--bt-dur-lightning` 9s `steps(1, end)` | constante por tramos |
| `.bt-icono .bruma` (4 bandas) | `bt-bruma` (translate ∓.8px) | `--bt-dur-fog`, `--bt-dur-fog-2/3/4`: 18/23/27/21s, alternos | `--bt-ease-sine` |
| esqueleto | `bt-pulse` | `--bt-dur-skeleton` 1.6s | `ease-in-out` |
| transiciones | fondos, opacidades, bordes | `--bt-dur-1/2/3/4` | `--bt-ease-soft` |

Cada celda `.bt-dia[data-idx="n"]` recibe una `--fase` distinta (índice 0-9:
`0s, -3.7s, -7.9s, -1.6s, -9.3s, -5.1s, -11.4s, -2.8s, -6.5s, -10.2s`) para que
la fila no respire al unísono. Solo corre la animación del día mirado: las líneas
por horas ocultas quedan con `animation-play-state: paused`.

**Apagado.** `@media (prefers-reduced-motion: reduce)` pone
`animation-duration: .01ms !important; animation-iteration-count: 1 !important;
transition-duration: .01ms !important` y, además, fija los iconos quietos sin
perder el dibujo (`animation: none`), dejando el rayo a `opacity: .85`. El
atributo `animate="false"` se refleja como `data-animado="false"` y hace lo
mismo de forma explícita, sin depender del sistema:

```css
:host([data-animado="false"]) .bt-icono * { animation: none !important; }
:host([data-animado="false"]) * { transition-duration: .01ms !important; }
```

---

## 7. Accesibilidad

Ratios calculados con la fórmula WCAG 2.1 sobre sRGB (mínimo 4,5:1 en texto
normal, 3:1 en texto grande y en elementos no textuales).

### Oscuro
| Pareja | Ratio |
|---|---|
| texto / fondo-0 | 16,29:1 |
| texto / superficie | 15,44:1 |
| texto secundario / superficie | 7,65:1 |
| texto terciario / superficie | 5,21:1 |
| texto terciario / superficie elevada (sugerencia) | 4,81:1 |
| acento / superficie | 10,07:1 |
| acento oscuro (línea) / superficie | 5,55:1 |
| éxito / superficie | 10,79:1 |
| aviso / superficie | 9,30:1 |
| error / superficie | 6,97:1 |
| texto de botón (fondo-0) / acento | 10,63:1 |
| halo de foco (acento 28 % sobre superficie) | 3,54:1 |

### Claro
| Pareja | Ratio |
|---|---|
| texto / superficie | 13,63:1 |
| texto secundario / superficie | 7,21:1 |
| texto terciario / superficie | 5,57:1 |
| texto terciario / superficie elevada | 4,93:1 |
| acento / superficie | 4,74:1 |
| acento oscuro (línea y foco) / superficie | 7,97:1 |
| éxito / superficie | 4,69:1 |
| aviso / superficie | 4,90:1 |
| error / superficie | 4,70:1 |
| texto de botón (fondo-0) / acento | 5,18:1 |

### Reglas y riesgos
- Foco visible **siempre**: `outline: 2px` de `--bt-accent` / `--bt-accent-line`
  más halo `var(--bt-focus-ring)`; nunca se anula el `outline` sin sustituto.
- Objetivo táctil mínimo **44x44 px**: celdas de día ≥68 px de ancho, filas de
  sugerencia 44 px, casilla con etiqueta de 44 px de alto, campo 36 px de alto
  (se admite por ir dentro de una cabecera de 44 px).
- Textos alternativos: cada icono del tiempo es un `<svg role="img">` con
  `<title>` y `aria-label` (la descripción en castellano del código WMO); los
  iconos de interfaz (gota, lupa) van `aria-hidden="true"`. La banda y la línea
  por horas son `aria-hidden="true"`: sus cifras ya están en el DOM del día y en
  los `title` de las marcas horarias.
- Orden de tabulación: título de ciudad → campo de búsqueda → (si está abierto)
  lista de sugerencias con `aria-activedescendant` → días (uno por celda, con
  `tabindex="0"`) → enlaces del pie. El buscador usa
  `role="combobox"` con `aria-expanded`, `aria-controls` y `aria-autocomplete="list"`.
- **Riesgo 1:** en oscuro, el halo de foco al 28 % se queda en **3,54:1** frente
  al mínimo 3:1 de elementos no textuales: aprueba pero sin margen. Si se
  oscurece el fondo o se aclara el acento, subir el porcentaje.
- **Riesgo 2:** en claro, el acento sobre superficie elevada cae a **4,20:1**.
  Prohibido usar `--bt-accent` como texto sobre `--bt-bg-2`/`--bt-bg-3`; el
  único oro-texto del tema claro va sobre `--bt-bg-1` (nombre de hoy). Igual con
  éxito/aviso/error sobre fondos elevados (4,15-4,34:1): solo sobre `--bt-bg-1`.
- **Riesgo 3:** en claro, `--bt-accent-fill-hover` (`oklch(.440 .115 82)`) sirve
  a la vez de relleno de botón y de color de hover del fantasma; no usarlo como
  relleno con texto `--bt-bg-0` (5,18:1 en el acento base, no comprobado en el
  hover: si se cambia, recalcular).

---

## 8. Superficie pública: partes expuestas

El host es `buen-tiempo`; toda la estructura interna vive en su Shadow DOM. Los
nombres de `part` son en castellano, como los fija `docs/ARQUITECTURA.md`. Lista
completa y equivalencia con los ejemplos del encargo:

| `::part()` | Qué es | Ejemplo del encargo |
|---|---|---|
| `widget` | la tarjeta entera | — |
| `lugar` | botón/título de la ciudad | `title` |
| `pais` | el país, junto al título | — |
| `meta` | frescura y avisos | — |
| `ahora` | condiciones actuales | — |
| `campo` | campo de búsqueda | `search-input` |
| `sugerencias` | desplegable del buscador | `search` |
| `sugerencia` | una fila del desplegable | — |
| `dias` | la fila de días | `days` |
| `dia` | una celda de día | `day` |
| `dia-nombre`, `dia-icono`, `dia-max`, `dia-min`, `dia-lluvia` | piezas de la celda | — |
| `banda` | SVG de máximas/mínimas | `band` |
| `horas` | capa de la línea por horas | `hourly` |
| `hora`, `hora-temp`, `hora-lluvia` | piezas de la línea por horas | `hour`, `hour-temp` |
| `vacio` | bloque sin conexión / error | `empty` |
| `esqueleto` | bloque de carga | `skeleton` |
| `pie` | fuente de datos | `foot` |

Ejemplo de uso por el consumidor:

```css
buen-tiempo::part(dia-max) { color: var(--bt-accent); }
buen-tiempo::part(sugerencia) { border-radius: 0; }
```

Las animaciones, colores y medidas del interior se ajustan con las variables
`--bt-*` de la sección 3; `::part()` es solo para retoques finos que no merezcan
una variable.
