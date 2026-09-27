/**
 * Módulo `elemento`: el custom element `<buen-tiempo>`.
 *
 * Ciclo de vida, atributos y propiedades, carga de datos, refresco, buscador
 * de ciudad, eventos y `localStorage`. Es el único módulo que toca el DOM y el
 * que decide el estado; `plantilla` compone el HTML y `estilos` el CSS.
 */

import { leerConfig, CLAVES } from './config.js';
import { geocodificar, pedirPrevision } from './api.js';
import { pintar, pintarMensaje } from './plantilla.js';
import { css } from './estilos.js';
import { t } from './i18n.js';

/** Nombre de la etiqueta del custom element. */
export const ETIQUETA = 'buen-tiempo';

/** Clave de `localStorage` donde se recuerda el lugar elegido. */
const CLAVE_LUGAR = 'buentiempo.lugar';

/** Milisegundos de calma antes de consultar el autocompletado. */
const DEBOUNCE_MS = 250;

/** Caracteres mínimos para lanzar una consulta de autocompletado. */
const MIN_CARACTERES = 2;

/** Atributos que cambian los datos y obligan a recargar. */
const ATRIBUTOS_DATOS = new Set([
  'place', 'country', 'latitude', 'longitude', 'days', 'lang', 'units', 'timezone',
]);

/** Propiedad JS -> [atributo HTML, tipo]. */
const PROPIEDADES = {
  lat: ['latitude', 'numero'],
  lon: ['longitude', 'numero'],
  place: ['place', 'texto'],
  country: ['country', 'texto'],
  days: ['days', 'numero'],
  lang: ['lang', 'texto'],
  units: ['units', 'texto'],
  timezone: ['timezone', 'texto'],
  theme: ['theme', 'texto'],
  hourlyStep: ['hourly-step', 'numero'],
  showCurrent: ['show-current', 'booleano'],
  showHourly: ['show-hourly', 'booleano'],
  editable: ['editable', 'booleano'],
  remember: ['remember', 'booleano'],
  refresh: ['refresh', 'numero'],
  weekStart: ['week-start', 'texto'],
  animate: ['animate', 'booleano'],
};

/** El widget de previsión meteorológica. */
export class BuenTiempo extends HTMLElement {
  /** Atributos observados: todos los que entiende `config`. */
  static get observedAttributes() {
    return Object.keys(CLAVES);
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = leerConfig(this);
    this._datos = null;
    this._estado = 'cargando';
    this._mensaje = null;
    this._abort = null;
    this._temporizador = null;
    this._buscador = null;
    this._escuchaDocumento = null;
  }

  connectedCallback() {
    this._config = leerConfig(this);
    this._programarRefresco();
    this._cargar();
  }

  disconnectedCallback() {
    clearInterval(this._temporizador);
    this._temporizador = null;
    this._abort?.abort();
    this._cancelarBuscador();
  }

  attributeChangedCallback(nombre, anterior, nuevo) {
    if (!this.isConnected || anterior === nuevo) {
      return;
    }
    this._config = leerConfig(this);
    if (ATRIBUTOS_DATOS.has(nombre)) {
      this._cargar();
    } else if (nombre === 'refresh') {
      this._programarRefresco();
    } else {
      this._pintar();
    }
  }

  /** Programa el refresco periódico según `config.refresh` (0 = nunca). */
  _programarRefresco() {
    clearInterval(this._temporizador);
    this._temporizador = null;
    if (this._config.refresh > 0) {
      this._temporizador = setInterval(
        () => this._cargar({ silencioso: true }),
        this._config.refresh * 60000,
      );
    }
  }

  /**
   * Resuelve el lugar y carga la previsión.
   * @param {{ silencioso?: boolean }} [opciones] - `silencioso` no pinta el
   *   estado `cargando` (refresco en segundo plano).
   */
  async _cargar({ silencioso = false } = {}) {
    this._abort?.abort();
    this._abort = new AbortController();
    const { signal } = this._abort;

    if (!silencioso) {
      this._estado = 'cargando';
      this._pintar();
    }

    let resuelto;
    try {
      resuelto = await this._resolverLugar(signal);
    } catch (error) {
      if (signal.aborted || this._esAborto(error)) {
        return;
      }
      this._fallar(error, silencioso);
      return;
    }

    if (signal.aborted || resuelto.cancelado) {
      return;
    }

    if (resuelto.tipo) {
      this._estado = resuelto.tipo;
      this._mensaje = resuelto.mensaje;
      this._pintar();
      this._emitir('bt-error', { message: resuelto.mensaje });
      return;
    }

    await this._pedir(resuelto.lugar, { silencioso });
  }

  /**
   * Decide de dónde salen las coordenadas, por orden de prioridad.
   * @param {AbortSignal} signal
   * @returns {Promise<{ lugar: object } | { tipo: string, mensaje: string } | { cancelado: true }>}
   */
  async _resolverLugar(signal) {
    const config = this._config;

    if (config.remember) {
      const guardado = this._leerLugarGuardado();
      if (guardado) {
        return { lugar: guardado };
      }
    }

    if (Number.isFinite(config.lat) && Number.isFinite(config.lon)) {
      const nombre = config.place !== ''
        ? config.place
        : `${config.lat.toFixed(2)}, ${config.lon.toFixed(2)}`;
      return {
        lugar: {
          nombre,
          pais: config.country,
          lat: config.lat,
          lon: config.lon,
          zona: config.timezone,
        },
      };
    }

    if (config.place !== '') {
      const resultados = await geocodificar(config.place, {
        lang: config.lang,
        pais: config.country,
        signal,
      });
      if (signal.aborted) {
        return { cancelado: true };
      }
      if (resultados.length === 0) {
        return {
          tipo: 'error',
          mensaje: t(config.lang, 'noEncontrado', { lugar: config.place }),
        };
      }
      return { lugar: resultados[0] };
    }

    return { tipo: 'vacio', mensaje: t(config.lang, 'faltaLugar') };
  }

  /**
   * Pide la previsión de un lugar y la pinta.
   * @param {object} lugar
   * @param {{ silencioso?: boolean }} [opciones]
   */
  async _pedir(lugar, { silencioso = false } = {}) {
    this._abort?.abort();
    this._abort = new AbortController();
    const { signal } = this._abort;

    if (!silencioso) {
      this._estado = 'cargando';
      this._pintar();
    }

    try {
      const zona = this._config.timezone !== 'auto'
        ? this._config.timezone
        : (lugar.zona || 'auto');
      const datos = await pedirPrevision({
        lat: lugar.lat,
        lon: lugar.lon,
        zona,
        dias: this._config.days,
        unidades: this._config.units,
        lugar: lugar.nombre,
        pais: lugar.pais,
        signal,
      });
      if (signal.aborted) {
        return;
      }
      this._datos = datos;
      this._estado = 'cargado';
      this._pintar();
      this._emitir('bt-load', datos);
    } catch (error) {
      if (signal.aborted || this._esAborto(error)) {
        return;
      }
      this._fallar(error, silencioso);
    }
  }

  /** true si el error es un aborto de `fetch`, directo o envuelto por `api`. */
  _esAborto(error) {
    return error?.name === 'AbortError' || error?.cause?.name === 'AbortError';
  }

  /** Gestiona un fallo técnico: consola, evento y, si procede, mensaje. */
  _fallar(error, silencioso) {
    console.error(error);
    this._emitir('bt-error', { message: error.message });
    if (silencioso) {
      return;
    }
    this._estado = 'error';
    this._mensaje = t(this._config.lang, 'errorGenerico');
    this._pintar();
  }

  /** Pinta el estado actual en el Shadow DOM y reconecta las escuchas. */
  _pintar() {
    this.setAttribute('data-tema', this._config.theme);
    this.setAttribute('data-animado', String(this._config.animate));

    let html;
    if (this._estado === 'cargado' && this._datos) {
      html = pintar({ datos: this._datos, config: this._config });
    } else if (this._estado === 'cargando') {
      html = pintarMensaje({ config: this._config, tipo: 'cargando' });
    } else if (this._estado === 'error') {
      html = pintarMensaje({ config: this._config, tipo: 'error', mensaje: this._mensaje });
    } else {
      html = pintarMensaje({ config: this._config, tipo: 'vacio', mensaje: this._mensaje });
    }

    this.shadowRoot.innerHTML = `<style>${css()}</style>${html}`;
    this._conectarBuscador();
    this._conectarDias();
  }

  /** Emite un `CustomEvent` que cruza el Shadow DOM. */
  _emitir(nombre, detail) {
    this.dispatchEvent(new CustomEvent(nombre, {
      detail,
      bubbles: true,
      composed: true,
    }));
  }

  /** Lee el lugar recordado, o `null` si no hay o no es válido. */
  _leerLugarGuardado() {
    try {
      const bruto = globalThis.localStorage?.getItem(CLAVE_LUGAR);
      if (!bruto) {
        return null;
      }
      const guardado = JSON.parse(bruto);
      if (!guardado || !Number.isFinite(guardado.lat) || !Number.isFinite(guardado.lon)) {
        return null;
      }
      return {
        nombre: guardado.place ?? '',
        pais: guardado.country ?? '',
        lat: guardado.lat,
        lon: guardado.lon,
        zona: guardado.timezone ?? '',
      };
    } catch {
      // localStorage no disponible o JSON corrupto: se ignora.
      return null;
    }
  }

  /** Guarda el lugar elegido si `remember` está activo. */
  _guardarLugar(lugar) {
    if (!this._config.remember) {
      return;
    }
    try {
      globalThis.localStorage?.setItem(CLAVE_LUGAR, JSON.stringify({
        place: lugar.nombre,
        country: lugar.pais,
        lat: lugar.lat,
        lon: lugar.lon,
        timezone: lugar.zona,
      }));
    } catch {
      // localStorage no disponible: se ignora.
    }
  }

  /** Carga un lugar elegido o resuelto por el buscador. */
  _elegirLugar(lugar) {
    this._guardarLugar(lugar);
    this._emitir('bt-place-change', {
      place: lugar.nombre,
      country: lugar.pais,
      latitude: lugar.lat,
      longitude: lugar.lon,
      timezone: lugar.zona,
    });
    this._pedir(lugar);
  }

  /** Cancela la consulta y el temporizador del buscador en curso. */
  _cancelarBuscador() {
    if (this._buscador) {
      this._buscador.cancelar();
      this._buscador = null;
    }
    this._quitarEscuchaDocumento();
  }

  /** Quita la escucha de documento del buscador, si la hay. */
  _quitarEscuchaDocumento() {
    if (this._escuchaDocumento) {
      this.ownerDocument.removeEventListener('pointerdown', this._escuchaDocumento);
      this._escuchaDocumento = null;
    }
  }

  /** Conecta el buscador de ciudad si `editable` está activo. */
  _conectarBuscador() {
    this._cancelarBuscador();
    if (!this._config.editable) {
      return;
    }

    const form = this.shadowRoot.querySelector('.bt-lugar');
    const boton = this.shadowRoot.querySelector('.bt-lugar-boton');
    const campo = this.shadowRoot.querySelector('.bt-lugar-campo');
    const lista = this.shadowRoot.querySelector('.bt-lugar-sugerencias');
    if (!form || !boton || !campo || !lista) {
      return;
    }

    this._buscador = {
      form,
      boton,
      campo,
      lista,
      original: campo.value,
      sugerencias: [],
      marcada: -1,
      temporizador: 0,
      peticion: null,
      ultimaConsulta: '',
      enviando: false,
      cancelar() {
        clearTimeout(this.temporizador);
        this.peticion?.abort();
      },
    };

    boton.addEventListener('click', () => {
      boton.hidden = true;
      campo.hidden = false;
      campo.focus();
      campo.select();
    });

    campo.addEventListener('input', () => {
      const b = this._buscador;
      const texto = campo.value.trim();
      clearTimeout(b.temporizador);
      if (texto.length < MIN_CARACTERES) {
        this._cerrarLista();
        return;
      }
      if (texto === b.ultimaConsulta) {
        return;
      }
      b.temporizador = setTimeout(() => {
        b.ultimaConsulta = texto;
        this._buscar(texto);
      }, DEBOUNCE_MS);
    });

    campo.addEventListener('keydown', (ev) => {
      const b = this._buscador;
      if (ev.key === 'Escape') {
        if (!b.lista.hidden) {
          this._cerrarLista();
          return;
        }
        b.campo.value = b.original;
        this._cerrarBuscador();
        b.boton.focus();
        return;
      }
      if (b.lista.hidden) {
        return;
      }
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        this._marcarSugerencia(b.marcada + 1);
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        this._marcarSugerencia(b.marcada - 1);
      } else if (ev.key === 'Enter' && b.marcada >= 0) {
        ev.preventDefault();
        this._elegirSugerencia(b.sugerencias[b.marcada]);
      }
    });

    campo.addEventListener('blur', () => {
      const b = this._buscador;
      if (b.enviando) {
        return;
      }
      this._cerrarLista();
      const texto = b.campo.value.trim();
      if (texto && texto !== b.original) {
        b.enviando = true;
        this._resolverTexto(texto);
        return;
      }
      b.campo.value = b.original;
      this._cerrarBuscador();
    });

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const b = this._buscador;
      if (!b || b.enviando) {
        return;
      }
      const texto = b.campo.value.trim();
      if (texto && texto !== b.original) {
        b.enviando = true;
        this._resolverTexto(texto);
        return;
      }
      b.campo.value = b.original;
      this._cerrarBuscador();
    });

    const alPulsarFuera = (ev) => {
      if (!ev.composedPath().includes(form)) {
        this._cerrarLista();
      }
    };
    this.ownerDocument.addEventListener('pointerdown', alPulsarFuera);
    this._escuchaDocumento = alPulsarFuera;
  }

  /** Cierra la lista de sugerencias y limpia su estado. */
  _cerrarLista() {
    const b = this._buscador;
    if (!b) {
      return;
    }
    b.lista.hidden = true;
    b.lista.replaceChildren();
    b.campo.setAttribute('aria-expanded', 'false');
    b.campo.removeAttribute('aria-activedescendant');
    b.sugerencias = [];
    b.marcada = -1;
  }

  /** Cierra la lista y devuelve el título a su estado de reposo. */
  _cerrarBuscador() {
    this._cerrarLista();
    const b = this._buscador;
    if (!b) {
      return;
    }
    b.campo.hidden = true;
    b.boton.hidden = false;
  }

  /** Marca una sugerencia con bucle y actualiza el combobox ARIA. */
  _marcarSugerencia(indice) {
    const b = this._buscador;
    if (!b) {
      return;
    }
    const filas = b.lista.children;
    if (!filas.length) {
      return;
    }
    b.marcada = (indice + filas.length) % filas.length;
    for (let i = 0; i < filas.length; i++) {
      filas[i].setAttribute('aria-selected', i === b.marcada ? 'true' : 'false');
    }
    b.campo.setAttribute('aria-activedescendant', filas[b.marcada].id);
    filas[b.marcada].scrollIntoView({ block: 'nearest' });
  }

  /** Pinta las filas de sugerencias. */
  _pintarSugerencias(sitios) {
    const b = this._buscador;
    if (!b) {
      return;
    }
    b.sugerencias = sitios;
    b.marcada = -1;
    b.campo.removeAttribute('aria-activedescendant');
    if (!sitios.length) {
      this._cerrarLista();
      return;
    }
    b.lista.replaceChildren(...sitios.map((sitio, i) => {
      const fila = this.ownerDocument.createElement('li');
      fila.id = `bt-sug-op-${i}`;
      fila.setAttribute('role', 'option');
      fila.setAttribute('aria-selected', 'false');
      fila.setAttribute('part', 'sugerencia');
      const nombre = this.ownerDocument.createElement('span');
      nombre.className = 'bt-sug-nombre';
      nombre.textContent = sitio.nombre;
      const donde = this.ownerDocument.createElement('span');
      donde.className = 'bt-sug-donde';
      donde.textContent = [sitio.region, sitio.pais].filter(Boolean).join(' · ');
      fila.append(nombre, donde);
      // pointerdown, no click: el click llega después del blur del campo.
      fila.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        this._elegirSugerencia(sitio);
      });
      fila.addEventListener('pointerenter', () => this._marcarSugerencia(i));
      return fila;
    }));
    b.lista.hidden = false;
    b.campo.setAttribute('aria-expanded', 'true');
  }

  /** Elige una sugerencia: la fija en el campo y carga su lugar. */
  _elegirSugerencia(sitio) {
    const b = this._buscador;
    if (!b) {
      return;
    }
    b.enviando = true;
    b.campo.value = sitio.nombre;
    this._cerrarLista();
    this._elegirLugar(sitio);
  }

  /** Aborta la consulta anterior y devuelve `null` si esta fue abortada. */
  async _consultar(texto) {
    const b = this._buscador;
    if (!b) {
      return null;
    }
    b.peticion?.abort();
    b.peticion = new AbortController();
    const { signal } = b.peticion;
    try {
      const sitios = await geocodificar(texto, {
        lang: this._config.lang,
        pais: this._config.country,
        signal,
      });
      return signal.aborted ? null : sitios;
    } catch (error) {
      if (signal.aborted || this._esAborto(error)) {
        return null;
      }
      throw error;
    }
  }

  /** Consulta el autocompletado y pinta las sugerencias. */
  async _buscar(texto) {
    const b = this._buscador;
    if (!b) {
      return;
    }
    let sitios;
    try {
      sitios = await this._consultar(texto);
    } catch {
      this._cerrarLista();
      return;
    }
    if (sitios === null || b.campo.value.trim() !== texto) {
      return;
    }
    this._pintarSugerencias(sitios);
  }

  /** Resuelve el texto escrito tomando el primer resultado. */
  async _resolverTexto(texto) {
    const b = this._buscador;
    if (!b) {
      return;
    }
    let sitios;
    try {
      sitios = await this._consultar(texto);
    } catch {
      this._cerrarBuscador();
      return;
    }
    if (sitios === null) {
      return;
    }
    if (!sitios.length) {
      this._cerrarBuscador();
      return;
    }
    b.campo.value = sitios[0].nombre;
    this._elegirLugar(sitios[0]);
  }

  /** Conecta la interacción de los días con su línea horaria. */
  _conectarDias() {
    if (!this._config.showHourly) {
      return;
    }
    const contenedor = this.shadowRoot.querySelector('.bt-tiempo');
    if (!contenedor) {
      return;
    }

    const capas = contenedor.querySelectorAll('.bt-horas');
    const activar = (indice) => {
      for (const capa of capas) {
        if (capa.dataset.idx === indice) {
          capa.setAttribute('data-activo', '');
        } else {
          capa.removeAttribute('data-activo');
        }
      }
    };
    const desactivarTodo = () => {
      for (const capa of capas) {
        capa.removeAttribute('data-activo');
      }
    };

    for (const dia of contenedor.querySelectorAll('.bt-dia')) {
      const indice = dia.dataset.idx;
      dia.addEventListener('mouseenter', () => activar(indice));
      dia.addEventListener('focusin', () => activar(indice));
      dia.addEventListener('click', () => {
        // En táctil no hay hover: el toque conmuta la línea horaria.
        if (!globalThis.matchMedia?.('(hover: none)')?.matches) {
          return;
        }
        const capa = contenedor.querySelector(`.bt-horas[data-idx="${indice}"]`);
        if (!capa) {
          return;
        }
        if (capa.hasAttribute('data-activo')) {
          capa.removeAttribute('data-activo');
        } else {
          activar(indice);
        }
      });
    }

    contenedor.addEventListener('mouseleave', desactivarTodo);
    contenedor.addEventListener('focusout', (ev) => {
      if (!contenedor.contains(ev.relatedTarget)) {
        desactivarTodo();
      }
    });
  }
}

for (const [propiedad, [atributo, tipo]] of Object.entries(PROPIEDADES)) {
  Object.defineProperty(BuenTiempo.prototype, propiedad, {
    get() {
      if (tipo === 'booleano') {
        return this.hasAttribute(atributo);
      }
      const valor = this.getAttribute(atributo);
      if (valor === null) {
        return tipo === 'texto' ? '' : null;
      }
      return tipo === 'numero' ? Number(valor) : valor;
    },
    set(valor) {
      if (tipo === 'booleano') {
        if (valor) {
          this.setAttribute(atributo, '');
        } else {
          this.removeAttribute(atributo);
        }
        return;
      }
      if (valor === null || valor === undefined) {
        this.removeAttribute(atributo);
        return;
      }
      this.setAttribute(atributo, String(valor));
    },
  });
}

/** Define el custom element si no lo está ya. */
export function registrar() {
  if (!globalThis.customElements) {
    throw new Error('buen-tiempo necesita un entorno con customElements (navegador)');
  }
  if (globalThis.customElements.get(ETIQUETA) === undefined) {
    globalThis.customElements.define(ETIQUETA, BuenTiempo);
  }
}
