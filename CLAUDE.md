# buentiempo

Web component `<buen-tiempo>`, sin build ni dependencias.

- Pruebas: `npm test` (= `node --test "test/*.test.js"`, sin red). `elemento` se prueba a mano: `python -m http.server 8765` y abrir http://localhost:8765/demo/.
- Compilar: nada.
- Desplegar: `git push origin main` y, en versión nueva, tag `vX.Y.Z` + `git push origin vX.Y.Z` + `gh release create`. jsDelivr sirve por tag.
- `.origen/` (si existe) es privado e ignorado: nunca a git.
- Capturas de docs/capturas: se regeneran con puppeteer si cambia el aspecto.
