# Minijuegos de lógica

Minijuegos en español con retos de algoritmos y datos en Python y SQL. El código se ejecuta en el navegador, sin instalar nada.

Para jugar: https://arielogc1.github.io/minijuegos-logica/

- `fuentes/`: los retos de cada entrega, desde la 2 en adelante.
- `juegos/`: los juegos ya construidos, un archivo HTML autocontenido por concepto.
- `herramientas/kit/`: editor, ejecución de Python y SQL, puntuación y pistas, comunes a todos los juegos.
- `registro.json`: temario y estado de cada concepto.
- `AGENTE.md`: instrucciones del agente que crea cada entrega.
- `pruebas/`: juegan cada minijuego en un navegador real.

Para construir los juegos, generar la portada y ejecutar las pruebas:

```bash
npm install
npm run construir
npm run portada
npm test
```
