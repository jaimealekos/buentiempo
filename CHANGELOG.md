# Changelog

Todos los cambios reseñables de este proyecto se documentan en este fichero.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto se adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [1.0.0] - 2026-09-28

### Añadido

- Web component nativo `<buen-tiempo>` para mostrar la previsión de Open-Meteo
  sin servidor ni claves: condiciones actuales, banda de máximas y mínimas por
  día y línea de temperatura hora a hora al pasar el ratón o enfocar un día.
- Configuración por atributos HTML (o propiedades JS equivalentes): lugar,
  coordenadas, país, días, idioma, unidades, zona horaria, tema, paso horario,
  buscador, memoria de la ciudad, refresco, inicio de semana y animación.
- Idiomas castellano e inglés, y registro de idiomas adicionales.
- Tematización mediante variables CSS `--bt-*` y `part`, con temas claro,
  oscuro y automático.
- Eventos `bt-load`, `bt-error` y `bt-place-change`.
- Fuentes autoalojadas opcionales (Fraunces, Geist y Geist Mono) con su
  licencia SIL Open Font License 1.1 en `fonts/`.
