/**
 * Módulo `estilos`: devuelve, como texto, el CSS que se inyecta en el
 * Shadow DOM del widget. No recibe argumentos, no lee el DOM y no hace red:
 * siempre devuelve la misma cadena.
 *
 * Los valores públicos (`--bt-*`), los colores, la tipografía, el espaciado,
 * las medidas y las duraciones están transcritos de `docs/DISENO.md`. Fuera
 * del bloque `:host` toda variable `--bt-*` se lee con valor por defecto para
 * que la web anfitriona pueda sobrescribirla.
 */

/**
 * Variables del tema claro de `docs/DISENO.md` (sección 3). Se interpolan en
 * el tema `light` forzado y en el `auto` claro por preferencia del sistema,
 * para no duplicar la paleta.
 */
const PALETA_CLARA = `  color-scheme: light;
  --bt-bg-0: oklch(.975 .006 75);
  --bt-bg-1: oklch(.945 .007 75);
  --bt-bg-2: oklch(.905 .008 75);
  --bt-bg-3: oklch(.855 .009 75);
  --bt-border: oklch(.855 .010 75);
  --bt-border-strong: oklch(.720 .012 75);
  --bt-text: oklch(.250 .012 75);
  --bt-text-2: oklch(.420 .014 75);
  --bt-text-3: oklch(.480 .014 75);
  --bt-accent: oklch(.520 .115 82);
  --bt-accent-fill-hover: oklch(.440 .115 82);
  --bt-accent-line: oklch(.400 .100 72);
  --bt-ok: oklch(.500 .130 160);
  --bt-warn: oklch(.520 .130 55);
  --bt-danger: oklch(.540 .170 22);
  --bt-hover-bg: color-mix(in oklch, var(--bt-bg-2, oklch(.905 .008 75)) 70%, var(--bt-bg-1, oklch(.945 .007 75)));
  --bt-focus-ring: var(--bt-accent-line, oklch(.400 .100 72));
  --bt-shadow-pop: 0 12px 28px -12px oklch(0 0 0 / .18);
  --bt-shadow-glow: 0 8px 24px oklch(0 0 0 / .15);
  --bt-fs-now: 1.75rem;
  --bt-crema-luz: oklch(.860 .090 90);
  --bt-naranja-cadmio: oklch(.620 .170 62);
  --bt-celeste: oklch(.520 .100 232);
  --bt-turquesa: oklch(.520 .120 200);
  --bt-cobalto: oklch(.440 .170 262);
  --bt-ultramar: oklch(.360 .150 278);
  --bt-violeta-sombra: oklch(.470 .150 302);
  --bt-malva: oklch(.560 .110 302);`;

/** CSS completo del Shadow DOM, calculado una sola vez. */
const CSS = `:host {
  /* Color: fondos, de más profundo a más elevado */
  --bt-bg-0: oklch(.135 .006 75);
  --bt-bg-1: oklch(.175 .007 75);
  --bt-bg-2: oklch(.215 .008 75);
  --bt-bg-3: oklch(.260 .009 75);

  /* Bordes */
  --bt-border: oklch(.280 .010 75);
  --bt-border-strong: oklch(.380 .012 75);

  /* Texto */
  --bt-text: oklch(.930 .012 85);
  --bt-text-2: oklch(.720 .014 85);
  --bt-text-3: oklch(.620 .014 85);

  /* Acento oro y semánticos */
  --bt-accent: oklch(.800 .115 82);
  --bt-accent-fill-hover: oklch(.900 .080 88);
  --bt-accent-line: oklch(.640 .110 76);
  --bt-ok: oklch(.800 .150 160);
  --bt-warn: oklch(.800 .160 55);
  --bt-danger: oklch(.720 .180 22);

  /* Superficies y sombras derivadas */
  --bt-today-bg: color-mix(in oklch, var(--bt-accent) 6%, transparent);
  --bt-hover-bg: color-mix(in oklch, var(--bt-bg-2) 55%, var(--bt-bg-1));
  --bt-hourly-floor: color-mix(in oklab, var(--bt-cobalto) 8%, var(--bt-bg-0));
  --bt-shine: color-mix(in oklch, var(--bt-accent-fill-hover) 70%, transparent);
  --bt-focus-ring: color-mix(in oklch, var(--bt-accent) 28%, transparent);
  --bt-shadow-pop: 0 12px 28px -12px oklch(0 0 0 / .55);
  --bt-shadow-glow: 0 8px 24px oklch(0 0 0 / .45);

  /* Los nueve colores de pintura de los iconos (solo SVG) */
  --bt-blanco-sol: oklch(.985 .025 95);
  --bt-crema-luz: oklch(.935 .085 90);
  --bt-naranja-cadmio: oklch(.790 .175 62);
  --bt-celeste: oklch(.850 .075 232);
  --bt-turquesa: oklch(.790 .130 200);
  --bt-cobalto: oklch(.560 .190 262);
  --bt-ultramar: oklch(.420 .170 278);
  --bt-violeta-sombra: oklch(.620 .145 302);
  --bt-malva: oklch(.740 .100 322);

  /* Tipografía */
  --bt-font-display: ui-serif, Georgia, "Times New Roman", serif;
  --bt-font-text: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --bt-font-mono: ui-monospace, "Cascadia Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  --bt-fs-title: 1.375rem;
  --bt-fs-now: 2rem;
  --bt-fs-day: 1.375rem;
  --bt-fs-body: .8125rem;
  --bt-fs-data: .75rem;
  --bt-fs-label: .6875rem;
  --bt-lh-title: 1.2;
  --bt-lh-body: 1.5;
  --bt-ls-label: .10em;

  /* Espaciado, rejilla y medidas */
  --bt-space-1: .25rem;
  --bt-space-2: .5rem;
  --bt-space-3: .75rem;
  --bt-space-4: 1rem;
  --bt-space-5: 1.5rem;
  --bt-space-6: 2rem;
  --bt-radius-s: 4px;
  --bt-radius-m: 8px;
  --bt-radius-pill: 999px;
  --bt-day-w: 5.5rem;
  --bt-day-min: 4.25rem;
  --bt-icon: 44px;
  --bt-icon-hour: 26px;
  --bt-chart-h: 126px;
  --bt-drop: 10px;
  --bt-pad: var(--bt-space-4) var(--bt-space-5);
  --bt-max-w: none;

  /* Movimiento */
  --bt-ease-soft: cubic-bezier(.2, .7, .2, 1);
  --bt-ease-out: cubic-bezier(.16, 1, .3, 1);
  --bt-ease-sine: cubic-bezier(.45, 0, .55, 1);
  --bt-dur-1: 80ms;
  --bt-dur-2: 120ms;
  --bt-dur-3: 160ms;
  --bt-dur-4: 240ms;
  --bt-dur-skeleton: 1.6s;
  --bt-dur-halo: 9s;
  --bt-dur-rays: 11s;
  --bt-dur-veil: 14s;
  --bt-dur-cloud: 19s;
  --bt-dur-cloud-far: 27s;
  --bt-dur-light: 13s;
  --bt-dur-rain: 2.8s;
  --bt-dur-snow: 7s;
  --bt-dur-drizzle: 5s;
  --bt-dur-lightning: 9s;
  --bt-dur-fog: 18s;
  --bt-dur-fog-2: 23s;
  --bt-dur-fog-3: 27s;
  --bt-dur-fog-4: 21s;

  /* El propio host */
  display: block;
  inline-size: 100%;
  max-inline-size: var(--bt-max-w);
  container-type: inline-size;
  color-scheme: dark;
  color: var(--bt-text);
  font-family: var(--bt-font-text);
  font-size: 16px;
  line-height: var(--bt-lh-body);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  scrollbar-color: var(--bt-border-strong) transparent;
  scrollbar-width: thin;
}

/* Tema claro: sobrescribe los papeles y la pintura que cambian. */
:host([data-tema="light"]) {
${PALETA_CLARA}
}

:host([data-tema="dark"]) { color-scheme: dark; }
:host([data-tema="auto"]) { color-scheme: light dark; }

/* Auto sigue la preferencia del sistema. */
@media (prefers-color-scheme: light) {
  :host([data-tema="auto"]) {
${PALETA_CLARA}
  }
}

*, *::before, *::after { box-sizing: border-box; }

/* El sprite solo aporta los degradados compartidos. */
.bt-sprite { position: absolute; inline-size: 0; block-size: 0; overflow: hidden; }

/* --- Tarjeta ------------------------------------------------------------ */
.bt {
  position: relative;
  inline-size: 100%;
  padding: var(--bt-pad, var(--bt-space-4, 1rem) var(--bt-space-5, 1.5rem));
  background: var(--bt-bg-1, oklch(.175 .007 75));
  border: 1px solid var(--bt-border, oklch(.280 .010 75));
  border-radius: var(--bt-radius-m, 8px);
  color: var(--bt-text, oklch(.930 .012 85));
}

/* Brillo del borde superior: barre del 50 % al 85 % al pasar el ratón. */
.bt::before {
  content: "";
  position: absolute;
  inset: -1px -1px auto;
  block-size: 1px;
  border-radius: inherit;
  background: linear-gradient(90deg, transparent 0%,
    var(--bt-shine, color-mix(in oklch, oklch(.900 .080 88) 70%, transparent)) var(--brillo, 50%), transparent 100%);
  transition: --brillo 900ms var(--bt-ease-out, cubic-bezier(.16, 1, .3, 1));
}
.bt:hover::before { --brillo: 85%; }

/* --- Cabecera ----------------------------------------------------------- */
.bt-cabecera {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--bt-space-4, 1rem);
  padding-block-end: var(--bt-space-3, .75rem);
  margin-block-end: var(--bt-space-4, 1rem);
  border-block-end: 1px solid var(--bt-border, oklch(.280 .010 75));
}

.bt-titulo {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--bt-space-2, .5rem);
  margin: 0;
  font-family: var(--bt-font-display, ui-serif, Georgia, "Times New Roman", serif);
  font-size: var(--bt-fs-title, 1.375rem);
  line-height: var(--bt-lh-title, 1.2);
  font-weight: 500;
  letter-spacing: -.005em;
}

.bt-lugar { position: relative; margin: 0; }
/* Título sin buscador: misma tipografía que el botón, sin aspecto de botón. */
.bt-lugar-texto {
  font: inherit;
  color: inherit;
  letter-spacing: inherit;
}
.bt-lugar-boton {
  font: inherit;
  color: inherit;
  letter-spacing: inherit;
  background: none;
  border: 0;
  padding: 0;
  margin: 0;
  cursor: text;
  text-align: start;
  border-block-end: 1px dashed transparent;
  transition: border-color var(--bt-dur-2, 120ms) var(--bt-ease-soft, cubic-bezier(.2, .7, .2, 1));
}
.bt-lugar-boton:hover { border-block-end-color: color-mix(in oklch, var(--bt-accent, oklch(.800 .115 82)) 45%, transparent); }
.bt-lugar-boton:focus-visible {
  outline: 2px solid var(--bt-accent, oklch(.800 .115 82));
  outline-offset: 3px;
  border-radius: 2px;
}

.bt-lugar-campo {
  font: inherit;
  letter-spacing: inherit;
  color: var(--bt-text, oklch(.930 .012 85));
  background: none;
  border: 0;
  border-block-end: 1px solid var(--bt-accent-line, oklch(.640 .110 76));
  padding: 0;
  outline: none;
  field-sizing: content;
  min-inline-size: 5rem;
  max-inline-size: 16rem;
}
.bt-lugar-campo[hidden] { display: none; }
.bt-lugar-campo::placeholder { color: var(--bt-text-3, oklch(.620 .014 85)); }
.bt-lugar-campo[data-error] { border-block-end-color: var(--bt-danger, oklch(.720 .180 22)); }

/* Lista de sugerencias: capa flotante sobre la banda. */
.bt-lugar-sugerencias {
  position: absolute;
  inset-block-start: calc(100% + var(--bt-space-2, .5rem));
  inset-inline-start: 0;
  z-index: 20;
  margin: 0;
  padding: var(--bt-space-1, .25rem);
  list-style: none;
  inline-size: max-content;
  min-inline-size: 14rem;
  max-inline-size: 26rem;
  max-block-size: 15rem;
  overflow-y: auto;
  background: var(--bt-bg-2, oklch(.215 .008 75));
  border: 1px solid var(--bt-border-strong, oklch(.380 .012 75));
  border-radius: var(--bt-radius-m, 8px);
  box-shadow: var(--bt-shadow-pop, 0 12px 28px -12px oklch(0 0 0 / .55));
}
.bt-lugar-sugerencias[hidden] { display: none; }
.bt-lugar-sugerencias li {
  display: flex;
  flex-direction: column;
  gap: .0625rem;
  padding: var(--bt-space-2, .5rem) var(--bt-space-3, .75rem);
  border-radius: var(--bt-radius-s, 4px);
  min-block-size: 44px;
  cursor: pointer;
}
.bt-lugar-sugerencias li[aria-selected="true"],
.bt-lugar-sugerencias li:hover { background: var(--bt-bg-3, oklch(.260 .009 75)); }
.bt-lugar-sugerencias li:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bt-focus-ring, color-mix(in oklch, oklch(.800 .115 82) 28%, transparent));
}
.bt-lugar-sugerencias .bt-sug-nombre { font-size: var(--bt-fs-body, .8125rem); color: var(--bt-text, oklch(.930 .012 85)); }
.bt-lugar-sugerencias .bt-sug-donde {
  font-family: var(--bt-font-mono, ui-monospace, "Cascadia Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace);
  font-size: var(--bt-fs-data, .75rem);
  color: var(--bt-text-3, oklch(.620 .014 85));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bt-lugar-pais {
  font-family: var(--bt-font-mono, ui-monospace, "Cascadia Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace);
  font-size: var(--bt-fs-data, .75rem);
  color: var(--bt-text-3, oklch(.620 .014 85));
  white-space: nowrap;
}

.bt-meta {
  font-family: var(--bt-font-mono, ui-monospace, "Cascadia Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace);
  font-size: var(--bt-fs-data, .75rem);
  color: var(--bt-text-3, oklch(.620 .014 85));
  white-space: nowrap;
}
.bt-meta[data-caduco] { color: var(--bt-warn, oklch(.800 .160 55)); }

/* --- Condiciones actuales ----------------------------------------------- */
.bt-ahora {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--bt-space-2, .5rem);
  margin: 0 0 var(--bt-space-4, 1rem);
  font-family: var(--bt-font-mono, ui-monospace, "Cascadia Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace);
  font-size: var(--bt-fs-body, .8125rem);
  color: var(--bt-text-2, oklch(.720 .014 85));
  font-variant-numeric: tabular-nums;
}
.bt-ahora > * { white-space: nowrap; }
.bt-temp-ahora {
  font-family: var(--bt-font-display, ui-serif, Georgia, "Times New Roman", serif);
  font-size: var(--bt-fs-now, 2rem);
  line-height: 1;
  color: var(--bt-text, oklch(.930 .012 85));
  letter-spacing: -.015em;
}
.bt-ahora .bt-tenue { color: var(--bt-text-3, oklch(.620 .014 85)); }

/* --- Banda de días ------------------------------------------------------ */
.bt-tiempo {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--bt-dias, 7), minmax(0, 1fr));
  grid-template-rows: auto auto auto auto 5.5rem auto;
  row-gap: var(--bt-space-2, .5rem);
  inline-size: 100%;
}

.bt-dia {
  display: grid;
  grid-row: 1 / -1;
  grid-template-rows: subgrid;
  justify-items: center;
  align-items: end;
  padding-block: var(--bt-space-2, .5rem);
  border-inline-start: 1px solid color-mix(in oklch, var(--bt-border, oklch(.280 .010 75)) 60%, transparent);
  transition: background-color var(--bt-dur-2, 120ms) var(--bt-ease-soft, cubic-bezier(.2, .7, .2, 1));
}
.bt-dia[data-idx="0"] { border-inline-start: 0; }
.bt-dia[data-hoy] { background: var(--bt-today-bg, color-mix(in oklch, oklch(.800 .115 82) 6%, transparent)); }
.bt-dia[data-hoy] .bt-nombre { color: var(--bt-accent, oklch(.800 .115 82)); }
/* Mientras se mira otro día, hoy deja de destacar. */
.bt-tiempo:has(.bt-dia:hover) .bt-dia[data-hoy] { background: transparent; }
.bt-tiempo:has(.bt-dia:focus-visible) .bt-dia[data-hoy] { background: transparent; }
.bt-tiempo:has(.bt-dia:hover) .bt-dia[data-hoy] .bt-nombre,
.bt-tiempo:has(.bt-dia:focus-visible) .bt-dia[data-hoy] .bt-nombre { color: var(--bt-text-3, oklch(.620 .014 85)); }
.bt-dia:hover { background: var(--bt-hover-bg, color-mix(in oklch, oklch(.215 .008 75) 55%, oklch(.175 .007 75))); }
.bt-dia:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 3px var(--bt-focus-ring, color-mix(in oklch, oklch(.800 .115 82) 28%, transparent));
}
.bt-dia > * { grid-column: 1; }
.bt-dia > .bt-nombre { grid-row: 1; }
.bt-dia > .bt-dia-icono { grid-row: 2; display: grid; place-items: center; }
.bt-dia > .bt-max { grid-row: 3; }
.bt-dia > .bt-min { grid-row: 4; }
.bt-dia > .bt-lluvia {
  grid-row: 6;
  transition: opacity var(--bt-dur-2, 120ms) var(--bt-ease-soft, cubic-bezier(.2, .7, .2, 1));
}
.bt-tiempo:has(.bt-horas[data-activo]) .bt-dia > .bt-lluvia { opacity: 0; }

/* Nueva semana: dos tramos de 1.5px que parten la fila en semanas. */
.bt-dia[data-semana-nueva] { border-inline-start: 0; }
.bt-dia[data-semana-nueva]::before,
.bt-dia[data-semana-nueva]::after {
  content: "";
  grid-column: 1;
  justify-self: start;
  align-self: stretch;
  inline-size: 1.5px;
  pointer-events: none;
  background: color-mix(in oklch, var(--bt-accent-line, oklch(.640 .110 76)) 28%, transparent);
}
.bt-dia[data-semana-nueva]::before {
  grid-row: 1 / 5;
  margin-block-start: calc(-1 * var(--bt-space-2, .5rem));
}
.bt-dia[data-semana-nueva]::after {
  grid-row: 5 / -1;
  margin-block: calc(-1 * var(--bt-space-2, .5rem));
  transition: opacity var(--bt-dur-1, 80ms) var(--bt-ease-soft, cubic-bezier(.2, .7, .2, 1));
}
.bt-tiempo:has(.bt-dia:hover) .bt-dia[data-semana-nueva]::after,
.bt-tiempo:has(.bt-dia:focus-visible) .bt-dia[data-semana-nueva]::after { opacity: 0; }

.bt-nombre {
  font-family: var(--bt-font-text, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif);
  font-size: var(--bt-fs-label, .6875rem);
  line-height: 1.3;
  letter-spacing: var(--bt-ls-label, .10em);
  text-transform: uppercase;
  color: var(--bt-text-3, oklch(.620 .014 85));
}
.bt-max {
  font-family: var(--bt-font-display, ui-serif, Georgia, "Times New Roman", serif);
  font-size: var(--bt-fs-day, 1.375rem);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  color: var(--bt-text, oklch(.930 .012 85));
}
.bt-min {
  font-family: var(--bt-font-text, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif);
  font-size: var(--bt-fs-body, .8125rem);
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
  color: var(--bt-text-2, oklch(.720 .014 85));
}

.bt-lluvia {
  font-family: var(--bt-font-mono, ui-monospace, "Cascadia Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace);
  font-size: var(--bt-fs-data, .75rem);
  line-height: 1.4;
  color: var(--bt-text-3, oklch(.620 .014 85));
  display: inline-flex;
  gap: var(--bt-space-1, .25rem);
  align-items: center;
  min-block-size: 1.375rem;
}
.bt-gota {
  inline-size: var(--bt-drop, 10px);
  block-size: var(--bt-drop, 10px);
  stroke: currentColor;
  stroke-width: 1.25;
  fill: none;
}

/* --- Banda max/min ------------------------------------------------------ */
.bt-banda {
  position: absolute;
  inset-inline: 0;
  inset-block: 0;
  grid-row: 5 / -1;
  grid-column: 1 / -1;
  inline-size: 100%;
  block-size: 100%;
  pointer-events: none;
  overflow: visible;
  opacity: 1;
  transition: opacity var(--bt-dur-2, 120ms) var(--bt-ease-soft, cubic-bezier(.2, .7, .2, 1));
}
.bt-banda .bt-linea-max,
.bt-horas-linea .bt-linea-max {
  stroke: var(--bt-accent, oklch(.800 .115 82));
  stroke-width: 1.25;
  fill: none;
  stroke-linejoin: round;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
.bt-banda .bt-linea-min {
  stroke: var(--bt-text-3, oklch(.620 .014 85));
  stroke-width: 1;
  fill: none;
  stroke-linejoin: round;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
.bt-banda .bt-punto { stroke-width: 1.5; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.bt-banda .bt-punto-max { stroke: var(--bt-accent, oklch(.800 .115 82)); }
.bt-banda .bt-punto-min { stroke: var(--bt-text-3, oklch(.620 .014 85)); }
.bt-banda .bt-area { fill: url(#bt-degradado-oro); }
#bt-degradado-oro stop { stop-color: var(--bt-accent, oklch(.800 .115 82)); }
#bt-degradado-oro stop:nth-child(1) { stop-opacity: .26; }
#bt-degradado-oro stop:nth-child(2) { stop-opacity: .04; }

/* --- Línea por horas ---------------------------------------------------- */
.bt-horas {
  position: absolute;
  inset-inline: 0;
  inset-block: 0;
  grid-row: 5 / -1;
  grid-column: 1 / -1;
  inline-size: 100%;
  pointer-events: none;
  overflow: visible;
  opacity: 0;
  transition: opacity var(--bt-dur-2, 120ms) var(--bt-ease-soft, cubic-bezier(.2, .7, .2, 1));
  background: var(--bt-hourly-floor, color-mix(in oklab, oklch(.560 .190 262) 8%, oklch(.135 .006 75)));
  border-radius: var(--bt-radius-s, 4px);
  --reproduccion: paused;
}
.bt-horas .bt-icono * { animation-play-state: var(--reproduccion, paused); }
.bt-tiempo:has(.bt-horas[data-activo]) .bt-banda { opacity: 0; }
/* elemento marca la capa con data-activo en hover, foco y toque táctil. */
.bt-horas[data-activo] { opacity: 1; --reproduccion: running; }

.bt-horas-linea { position: absolute; inset: 0; inline-size: 100%; block-size: 100%; }
.bt-horas-linea .bt-area { fill: url(#bt-degradado-oro); opacity: .55; }
.bt-ahora-linea {
  stroke: var(--bt-accent, oklch(.800 .115 82));
  stroke-width: 1;
  stroke-dasharray: 2 3;
  opacity: .75;
  fill: none;
  vector-effect: non-scaling-stroke;
}

.bt-horas-marcas { position: relative; inline-size: 100%; block-size: 100%; }
.bt-hora-marca {
  position: absolute;
  inset-block-start: .875rem;
  inset-inline-start: var(--bt-x, 0%);
  translate: -50% 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .125rem;
}
.bt-hora-hh {
  font-family: var(--bt-font-mono, ui-monospace, "Cascadia Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace);
  font-size: var(--bt-fs-data, .75rem);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: .04em;
  color: var(--bt-text-3, oklch(.620 .014 85));
}
.bt-horas .bt-icono {
  inline-size: var(--bt-icon-hour, 26px);
  block-size: var(--bt-icon-hour, 26px);
}
.bt-hora-temp {
  position: absolute;
  inset-block-start: var(--bt-y, 0px);
  inset-inline-start: var(--bt-x, 0%);
  translate: -50% 0;
  font-family: var(--bt-font-mono, ui-monospace, "Cascadia Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace);
  font-size: var(--bt-fs-body, .8125rem);
  line-height: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--bt-text, oklch(.930 .012 85));
  white-space: nowrap;
  padding-inline: var(--bt-space-1, .25rem);
  background: var(--bt-hourly-floor, color-mix(in oklab, oklch(.560 .190 262) 8%, oklch(.135 .006 75)));
  border-radius: var(--bt-radius-s, 4px);
}
.bt-hora-lluvia {
  position: absolute;
  inset-block-end: var(--bt-space-2, .5rem);
  inset-inline-start: var(--bt-x, 0%);
  translate: -50% 0;
}

/* --- Pie ---------------------------------------------------------------- */
.bt-pie {
  margin-block-start: var(--bt-space-4, 1rem);
  padding-block-start: var(--bt-space-3, .75rem);
  border-block-start: 1px solid color-mix(in oklch, var(--bt-border, oklch(.280 .010 75)) 70%, transparent);
}
.bt-fuente {
  font-family: var(--bt-font-mono, ui-monospace, "Cascadia Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace);
  font-size: var(--bt-fs-data, .75rem);
  color: var(--bt-text-3, oklch(.620 .014 85));
}

/* --- Estados: esqueleto y vacío ---------------------------------------- */
.bt-esqueleto { display: grid; row-gap: var(--bt-space-3, .75rem); }
.bt-esq-titulo, .bt-esq-ahora, .bt-esq-dia {
  display: block;
  background: var(--bt-bg-2, oklch(.215 .008 75));
  border-radius: var(--bt-radius-s, 4px);
  animation: bt-pulse var(--bt-dur-skeleton, 1.6s) ease-in-out infinite alternate;
}
.bt-esq-titulo { inline-size: 8rem; block-size: 1.375rem; }
.bt-esq-ahora { inline-size: 4rem; block-size: 2rem; }
.bt-esq-dias {
  display: grid;
  grid-template-columns: repeat(var(--bt-dias, 7), minmax(0, 1fr));
  gap: var(--bt-space-2, .5rem);
}
.bt-esq-dia { block-size: 5.5rem; }

.bt-vacio {
  display: grid;
  place-items: center;
  row-gap: var(--bt-space-2, .5rem);
  min-block-size: 6rem;
  padding: var(--bt-space-5, 1.5rem);
  color: var(--bt-text-3, oklch(.620 .014 85));
  text-align: center;
}
.bt-vacio-texto {
  margin: 0;
  font-family: var(--bt-font-text, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif);
  font-size: var(--bt-fs-label, .6875rem);
  letter-spacing: var(--bt-ls-label, .10em);
  text-transform: uppercase;
}

/* --- Iconos del tiempo -------------------------------------------------- */
.bt-icono {
  display: block;
  inline-size: var(--bt-icon, 44px);
  block-size: var(--bt-icon, 44px);
  fill: none;
  stroke: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  overflow: visible;
}
.bt-icono .halo {
  animation: bt-late var(--bt-dur-halo, 9s) var(--bt-ease-sine, cubic-bezier(.45, 0, .55, 1)) infinite alternate var(--fase, 0s);
}
.bt-icono .rayos {
  transform-box: fill-box;
  transform-origin: center;
  animation: bt-vibra var(--bt-dur-rays, 11s) var(--bt-ease-sine, cubic-bezier(.45, 0, .55, 1)) infinite alternate var(--fase, 0s);
}
.bt-icono .nucleo--velado {
  animation: bt-late var(--bt-dur-veil, 14s) var(--bt-ease-sine, cubic-bezier(.45, 0, .55, 1)) infinite alternate var(--fase, 0s);
}
.bt-icono .nube {
  animation: bt-deriva var(--bt-dur-cloud, 19s) var(--bt-ease-sine, cubic-bezier(.45, 0, .55, 1)) infinite alternate var(--fase, 0s);
}
.bt-icono .nube--lejos {
  animation-duration: var(--bt-dur-cloud-far, 27s);
  animation-direction: alternate-reverse;
}
.bt-icono .luz {
  animation: bt-enciende var(--bt-dur-light, 13s) var(--bt-ease-sine, cubic-bezier(.45, 0, .55, 1)) infinite alternate var(--fase, 0s);
}
.bt-icono .gota {
  animation: bt-cae var(--bt-dur-rain, 2.8s) cubic-bezier(.3, 0, .7, 1) infinite var(--fase, 0s);
}
.bt-icono .caida > .gota:nth-child(2) { animation-delay: calc(var(--fase, 0s) - .95s); }
.bt-icono .caida > .gota:nth-child(3) { animation-delay: calc(var(--fase, 0s) - 1.9s); }
.bt-icono .copo {
  animation: bt-nieva var(--bt-dur-snow, 7s) var(--bt-ease-sine, cubic-bezier(.45, 0, .55, 1)) infinite var(--fase, 0s);
}
.bt-icono .caida > .copo:nth-child(2) { animation-delay: calc(var(--fase, 0s) - 2.4s); }
.bt-icono .caida > .copo:nth-child(3) { animation-delay: calc(var(--fase, 0s) - 4.7s); }
.bt-icono .dab {
  animation: bt-titila var(--bt-dur-drizzle, 5s) var(--bt-ease-sine, cubic-bezier(.45, 0, .55, 1)) infinite alternate var(--fase, 0s);
}
.bt-icono .caida > .dab:nth-child(2) { animation-delay: calc(var(--fase, 0s) - 1.1s); }
.bt-icono .caida > .dab:nth-child(3) { animation-delay: calc(var(--fase, 0s) - 2.3s); }
.bt-icono .caida > .dab:nth-child(4) { animation-delay: calc(var(--fase, 0s) - 3.4s); }
.bt-icono .caida > .dab:nth-child(5) { animation-delay: calc(var(--fase, 0s) - 4.2s); }
.bt-icono .rayo,
.bt-icono .resplandor {
  animation: bt-relampago var(--bt-dur-lightning, 9s) steps(1, end) infinite var(--fase, 0s);
}
.bt-icono .bruma {
  animation: bt-bruma var(--bt-dur-fog, 18s) var(--bt-ease-sine, cubic-bezier(.45, 0, .55, 1)) infinite alternate var(--fase, 0s);
}
.bt-icono .bruma:nth-of-type(2) { animation-duration: var(--bt-dur-fog-2, 23s); animation-direction: alternate-reverse; }
.bt-icono .bruma:nth-of-type(3) { animation-duration: var(--bt-dur-fog-3, 27s); }
.bt-icono .bruma:nth-of-type(4) { animation-duration: var(--bt-dur-fog-4, 21s); animation-direction: alternate-reverse; }

/* Cada día entra con su fase: la fila no respira al unísono. */
.bt-dia[data-idx="0"], .bt-horas[data-idx="0"] { --fase: 0s; }
.bt-dia[data-idx="1"], .bt-horas[data-idx="1"] { --fase: -3.7s; }
.bt-dia[data-idx="2"], .bt-horas[data-idx="2"] { --fase: -7.9s; }
.bt-dia[data-idx="3"], .bt-horas[data-idx="3"] { --fase: -1.6s; }
.bt-dia[data-idx="4"], .bt-horas[data-idx="4"] { --fase: -9.3s; }
.bt-dia[data-idx="5"], .bt-horas[data-idx="5"] { --fase: -5.1s; }
.bt-dia[data-idx="6"], .bt-horas[data-idx="6"] { --fase: -11.4s; }
.bt-dia[data-idx="7"], .bt-horas[data-idx="7"] { --fase: -2.8s; }
.bt-dia[data-idx="8"], .bt-horas[data-idx="8"] { --fase: -6.5s; }
.bt-dia[data-idx="9"], .bt-horas[data-idx="9"] { --fase: -10.2s; }

/* Colores de las fundiciones compartidas (los <stop> no traen color). */
.bt-sprite #bt-s-masa stop:nth-child(1) { stop-color: var(--bt-violeta-sombra, oklch(.620 .145 302)); }
.bt-sprite #bt-s-masa stop:nth-child(2) { stop-color: var(--bt-cobalto, oklch(.560 .190 262)); }
.bt-sprite #bt-s-masa-lejos stop:nth-child(1) { stop-color: var(--bt-malva, oklch(.740 .100 322)); }
.bt-sprite #bt-s-masa-lejos stop:nth-child(2) { stop-color: var(--bt-violeta-sombra, oklch(.620 .145 302)); }
.bt-sprite #bt-s-masa-tormenta stop:nth-child(1) { stop-color: var(--bt-violeta-sombra, oklch(.620 .145 302)); }
.bt-sprite #bt-s-masa-tormenta stop:nth-child(2) { stop-color: var(--bt-ultramar, oklch(.420 .170 278)); }
.bt-sprite #bt-s-halo stop { stop-color: var(--bt-naranja-cadmio, oklch(.790 .175 62)); }
.bt-sprite #bt-s-nucleo stop:nth-child(1) { stop-color: var(--bt-blanco-sol, oklch(.985 .025 95)); }
.bt-sprite #bt-s-nucleo stop:nth-child(2) { stop-color: var(--bt-crema-luz, oklch(.935 .085 90)); }
.bt-sprite #bt-s-nucleo stop:nth-child(3) { stop-color: var(--bt-naranja-cadmio, oklch(.790 .175 62)); }

/* --- Responsive por container queries ----------------------------------- */
@container (inline-size >= 45rem) {
  .bt-tiempo { --bt-day-w: 5.5rem; }
  .bt { --bt-icon: 44px; }
}
@container (30rem <= inline-size < 45rem) {
  .bt-tiempo { --bt-day-w: 4.5rem; }
  .bt { --bt-icon: 40px; }
}
/* Por debajo de 30rem (480px): desplazamiento horizontal en la fila de días. */
@container (max-width: 30rem) {
  .bt { --bt-pad: var(--bt-space-3, .75rem); --bt-fs-title: 1.25rem; --bt-fs-now: 1.75rem; --bt-icon: 36px; }
  .bt-tiempo {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--bt-space-3, .75rem);
    grid-template-columns: repeat(var(--bt-dias, 7), minmax(var(--bt-day-min, 4.25rem), 1fr));
    inline-size: 100%;
  }
  .bt-dia { scroll-snap-align: center; }
  .bt-dia > .bt-lluvia { display: none; }
}

/* --- Movimiento apagado por atributo ------------------------------------ */
:host([data-animado="false"]) .bt-icono * { animation: none !important; }
:host([data-animado="false"]) * { transition-duration: .01ms !important; }

/* --- Movimiento apagado por el sistema ---------------------------------- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
  .bt-icono .halo, .bt-icono .rayos, .bt-icono .nucleo--velado, .bt-icono .nube,
  .bt-icono .luz, .bt-icono .gota, .bt-icono .copo, .bt-icono .dab,
  .bt-icono .rayo, .bt-icono .resplandor, .bt-icono .bruma { animation: none !important; }
  .bt-icono .rayo { opacity: .85; }
  .bt::before { --brillo: 50%; }
}

@keyframes bt-late { from { opacity: .7; } to { opacity: 1; } }
@keyframes bt-vibra { from { rotate: -3deg; } to { rotate: 3deg; } }
@keyframes bt-deriva { from { translate: -.5px .2px; } to { translate: .5px -.2px; } }
@keyframes bt-enciende { from { opacity: .72; } to { opacity: 1; } }
@keyframes bt-cae {
  0% { translate: 0 -2.5px; opacity: 0; }
  25% { opacity: 1; }
  80% { opacity: 1; }
  100% { translate: 0 3px; opacity: 0; }
}
@keyframes bt-nieva {
  0% { translate: 0 -2.5px; opacity: 0; }
  20% { opacity: 1; }
  50% { translate: .8px .5px; }
  85% { opacity: 1; }
  100% { translate: -.4px 3px; opacity: 0; }
}
@keyframes bt-titila { from { opacity: .45; } to { opacity: 1; } }
@keyframes bt-relampago {
  0%, 100% { opacity: .62; }
  41% { opacity: 1; }
  43% { opacity: .7; }
  45% { opacity: 1; }
  49% { opacity: .62; }
}
@keyframes bt-bruma { from { translate: -.8px 0; } to { translate: .8px 0; } }
@keyframes bt-pulse { from { opacity: .45; } to { opacity: .9; } }

@property --brillo { syntax: "<percentage>"; inherits: false; initial-value: 50%; }
`;

/**
 * CSS completo del Shadow DOM.
 * @returns {string}
 */
export function css() {
  return CSS;
}
