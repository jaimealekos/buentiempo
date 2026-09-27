# Arquitectura — buentiempo

## Objetivo y alcance
Hace: un web component nativo `<buen-tiempo>` (versión 1.0.0) que muestra la previsión meteorológica de Open-Meteo y se puede embeber en cualquier página con una etiqueta `<script type="module">`. Pinta las condiciones actuales, una banda con las máximas y mínimas de cada día, y —al pasar el ratón o el foco sobre un día— la línea de temperatura hora a hora de ese día. Se configura por atributos HTML (con propiedades JS equivalentes), es tematizable con variables CSS `--bt-*`, admite castellano e inglés, unidades métricas o imperiales, y emite eventos para que la web anfitriona reaccione.

No hace: no tiene servidor ni backend, no guarda histórico, no consulta más fuentes que Open-Meteo, no usa claves de API, no dibuja mapas ni alertas, no incluye analítica, no necesita paso de compilación ni dependencias externas, no controla el diseño visual (vive en `docs/DISENO.md`), y no escribe en el DOM de la web anfitriona más allá de su Shadow DOM.

## Módulos
| Módulo | Responsabilidad (una frase) | Nivel | Depende de | Contrato |
|---|---|---|---|---|
| `config` | Convierte los atributos del elemento en un objeto de configuración validado y con valores por defecto. | trivial | — | docs/modulos/config.md |
| `i18n` | Da los textos, los nombres de día y la descripción de los códigos WMO en cada idioma. | trivial | — | docs/modulos/i18n.md |
| `api` | Pide previsión y geocodificación a Open-Meteo (con `fetch` inyectable) y normaliza la previsión a la forma del widget. | normal | — | docs/modulos/api.md |
| `geometria` | Calcula, con funciones puras, las escalas y los trazados SVG de la banda max/min y de la línea por horas. | normal | — | docs/modulos/geometria.md |
| `iconos` | Devuelve el SVG en línea del icono que corresponde a un código WMO, con sus degradados compartidos. | normal | — | docs/modulos/iconos.md |
| `estilos` | Devuelve, como texto, el CSS que se inyecta en el Shadow DOM. | trivial | — | docs/modulos/estilos.md |
| `plantilla` | Compone, con funciones puras, el HTML interno del widget a partir de los datos, la configuración y el idioma. | normal | i18n, iconos, geometria | docs/modulos/plantilla.md |
| `elemento` | Es el custom element: ciclo de vida, atributos y propiedades, carga de datos, refresco, buscador de ciudad, eventos y `localStorage`. | normal | config, i18n, api, plantilla, estilos | docs/modulos/elemento.md |

Niveles: trivial = pegamento, configuración, funciones puras pequeñas con pruebas claras; normal = lógica, entrada/salida o interfaz de usuario; complejo = algoritmia o dominio difícil (ningún módulo llega a este nivel).

## Orden de implementación
1. Sin dependencias internas, en cualquier orden entre ellos: `config`, `i18n`, `api`, `geometria`, `iconos`, `estilos`.
2. `plantilla` (necesita `i18n`, `iconos` y `geometria`).
3. `elemento` (necesita `config`, `i18n`, `api`, `plantilla` y `estilos`).
4. Punto de entrada `buentiempo.js` y piezas de integración (`demo/index.html`, `README.md`).
Sin dependencias circulares: el grafo es un árbol con raíz en `elemento`.

## Integración
Punto de entrada: `buentiempo.js`, en la raíz. Importa `./src/elemento.js` y registra `<buen-tiempo>`. Se usa así:
```html
<script type="module" src="https://cdn.jsdelivr.net/gh/<usuario>/buentiempo@v1.0.0/buentiempo.js"></script>
<buen-tiempo place="Valencia" lang="es" days="7"></buen-tiempo>
```
Configuración: solo atributos HTML (y sus propiedades JS equivalentes), todos opcionales, con los valores por defecto de `docs/modulos/config.md`. No hay fichero de configuración ni variables de entorno.

Pruebas de integración previstas (sin red, con `fetch` simulado):
- `place` sin coordenadas → geocodificación → previsión → HTML con tantos días como `days`.
- `latitude` + `longitude` → no se llama al geocodificador.
- Respuesta sin `daily.time` → se emite `bt-error` y se pinta el mensaje.
- `lang="en"` + `units="imperial"` → textos en inglés y petición con unidades imperiales.
- `show-hourly="false"` → no se genera ninguna línea horaria.
- `days` fuera de rango → se ajusta a 1..16.

## Interfaz de usuario
Una sola pieza con Shadow DOM (`mode: "open"`), dentro del custom element. Estructura:
- **Cabecera**: título/lugar (buscador si `editable="true"`), país, estado de frescura («actualizado HH:MM»), condiciones actuales (temperatura, descripción, sensación, humedad, viento).
- **Banda max/min**: SVG decorativo (`aria-hidden="true"`) con el área entre máximas y mínimas, sus dos líneas y un punto por día.
- **Días**: una celda por día con nombre (el primero es «hoy»), icono, máxima, mínima y probabilidad de lluvia; lleva texto accesible propio.
- **Línea por horas**: una capa oculta por día; aparece al pasar el ratón o al enfocar el día y muestra hora, icono, temperatura y lluvia cada `hourly-step` horas.
- **Pie**: fuente de datos (`Open-Meteo`).

Estados: **cargando** (esqueleto con la silueta y `aria-busy="true"`), **error** (mensaje con `role="alert"`), **vacío** (sin datos) y **cargado**. El paso entre estados lo decide `elemento` y lo pinta `plantilla`.

Responsive: la geometría usa unidades de viewBox con `preserveAspectRatio="none"`, así que se estira. Con container queries sobre el ancho del propio widget, por debajo de `30rem` la fila de días pasa a **desplazamiento horizontal** (`overflow-x: auto`, cada día con un ancho mínimo) manteniendo todos los días visibles; no se recorta el número de días, para no perder información. Por encima de `30rem`, los días se reparten el ancho a partes iguales. Los valores exactos de tamaño, color y espaciado los fija `docs/DISENO.md`.

Accesibilidad: el gráfico (banda y línea horaria) es decorativo (`aria-hidden="true"`); cada celda de día expone un `aria-label` con nombre, descripción WMO, máxima, mínima y lluvia. El título es un combobox ARIA (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`) con teclado completo (flechas para moverse, Intro para elegir, Escape para cerrar/cancelar). Enfocar un día (teclado) muestra su línea horaria, igual que el ratón. `prefers-reduced-motion` desactiva las animaciones aunque `animate="true"`.

Tematización externa: variables CSS `--bt-*` documentadas por `docs/DISENO.md` y `part` donde tenga sentido (`widget`, `lugar`, `pais`, `meta`, `ahora`, `campo`, `sugerencias`, `sugerencia`, `dias`, `dia`, `dia-nombre`, `dia-icono`, `dia-max`, `dia-min`, `dia-lluvia`, `banda`, `horas`, `hora`, `hora-temp`, `hora-lluvia`, `vacio`, `esqueleto`, `pie`). El estilo visual (paleta, tipografía y espaciado) no se decide aquí: lo escribe el rol gráfico en `docs/DISENO.md` y `estilos` lo implementa tal cual.

## Piezas no-módulo
- `demo/index.html`: varias configuraciones a la vez (oscuro, claro, inglés/imperial, compacto).
- `README.md`: lo escribe el integrador; uso, atributos, eventos y variables CSS.
- `LICENSE`: MIT.
- `CHANGELOG.md`: formato Keep a Changelog; la 1.0.0 es la primera entrada.
- `fonts/`: Fraunces y Geist (OFL), con su licencia. Por defecto el widget usa la pila del sistema; se activan cargando `fonts/buentiempo-fonts.css` o definiendo la variable CSS que indica `docs/DISENO.md`.
- `package.json`: `"type": "module"`, `"version": "1.0.0"`, `"scripts": { "test": "node --test \"test/*.test.js\"" }`. Sin dependencias.
- `.gitignore`: ignora `node_modules/`, `*.log` y cualquier material de origen privado.

## Decisiones de diseño
- Sin dependencias ni compilación: el componente son ficheros `.js` que el navegador importa; el runner de pruebas es el de Node. Menos superficie y se publica tal cual.
- Estilos en Shadow DOM: no chocan con la web anfitriona; el aspecto se ajusta desde fuera solo por variables `--bt-*` y `part`, que es una interfaz estable.
- Datos del navegador a Open-Meteo: sin backend, sin clave; el widget funciona con solo un `<script>`.
- `api` con `fetch` inyectable: permite probar la normalización y los errores sin red.
- `plantilla` devuelve texto y no manipula DOM: es pura y se prueba en Node; las escuchas y el estado los pone `elemento`.
- `ts` de la previsión normalizada en milisegundos (`Date.now()`), inyectable en las pruebas; el resto de campos conservan los nombres de la forma de datos acordada (`actual`, `dias`, `horas`, `lugar`, `pais`).
- `days` se ajusta a 1..16 en vez de fallar: un atributo mal puesto no debe dejar la página sin previsión.
- Bloqueo de dependencias en forma de tabla de módulos: cada módulo tiene una única responsabilidad y una interfaz estrecha.
