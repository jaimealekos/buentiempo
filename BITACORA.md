# BITACORA — buentiempo

Actualizado: 2026-09-28. Entrada única para ponerse al día. Caveman. Máximo 40 líneas y 7.500 caracteres.

## Qué es
Web component `<buen-tiempo>`: previsión Open-Meteo embebible en cualquier web. JS ES módulos, sin dependencias ni build, Shadow DOM.
Extraído del panel privado de inicio (primavera, /jaime/inicio). Original de referencia en `.origen/` (ignorado por git, no publicar).

## Estado
- Funciona y probado: —
- A medias: diseño (ARQUITECTURA, contratos, DISENO)
- Sin empezar: módulos, demo, capturas, repo GitHub

## Módulos
- ver docs/ARQUITECTURA.md

## Decisiones vigentes
- Navegador habla directo con Open-Meteo (CORS, sin clave) — el original usaba recolector de servidor; genérico no puede.
- Sin dependencias ni build; pruebas `node --test` sin red — embebible con un `<script type="module">`.
- Motores de esta operación: DeepSeek Flash 4.1 api2 en todo.

## Límites y problemas conocidos
- `.origen/` contiene código privado: nunca a git.

## Retomar
- Siguiente paso: revisar diseño y commit `docs: arquitectura y contratos`.
- Cola: TODO.md. Historia: DIARIO.md. Diseño: docs/ARQUITECTURA.md.
- workflow: no
