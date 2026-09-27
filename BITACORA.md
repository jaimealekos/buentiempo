# BITACORA — buentiempo

Actualizado: 2026-09-28. Entrada única para ponerse al día. Caveman. Máximo 40 líneas y 7.500 caracteres.

## Qué es
Web component `<buen-tiempo>`: previsión Open-Meteo embebible en cualquier web. JS ES módulos, sin dependencias ni build, Shadow DOM.
Material de origen privado en `.origen/` (ignorado por git, no publicar).

## Estado
- Funciona y probado: 8 módulos + integración, 139 pruebas verdes; demo en demo/index.html; capturas GIF en docs/capturas.
- A medias: —
- Sin empezar: —

## Módulos
- config, i18n, api, geometria, iconos, estilos, plantilla, elemento — ver docs/ARQUITECTURA.md
- elemento sin pruebas Node (necesita DOM): se prueba a mano en la demo.

## Decisiones vigentes
- Navegador habla directo con Open-Meteo (CORS, sin clave).
- Sin dependencias ni build; pruebas `node --test "test/*.test.js"` sin red.
- Widget ocupa 100% del contenedor; <30rem fila de días con scroll horizontal (banda y horas con grid-column 1/-1).
- Fuentes por defecto del sistema; fonts/buentiempo-fonts.css activa Fraunces/Geist.
- Motores de esta operación: DeepSeek Flash 4.1 api2 en todo.

## Límites y problemas conocidos
- `.origen/` contiene código privado: nunca a git.
- `registrarIdioma` no se reexporta desde buentiempo.js: se importa de src/i18n.js.

## Retomar
- Publicado v1.0.0 en github.com/jaimealekos/buentiempo (jsDelivr por tag).
- Capturas: script puppeteer fuera del repo (scratchpad de la sesión 2026-09-28); regenerar si cambia el aspecto.
- Cola: TODO.md. Historia: DIARIO.md. Diseño: docs/ARQUITECTURA.md.
- workflow: no
