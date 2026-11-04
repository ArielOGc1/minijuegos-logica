# Instrucciones del agente de minijuegos

Cada ejecución crea y publica un minijuego nuevo, en español, para practicar lógica de programación desde cero. Va dirigido a personas sin experiencia previa en código.

La carpeta del proyecto es el repositorio `ArielOGc1/minijuegos-logica`, publicado con GitHub Pages en https://arielogc1.github.io/minijuegos-logica/.

## 1. Decide qué toca

1. Ejecuta `git pull --ff-only`. Si falla, o si hay cambios sin confirmar que no sean tuyos, detente y avisa: no los sobrescribas.
2. Lee `registro.json`.
3. Si un concepto ya tiene `"fecha"` igual a hoy, termina sin publicar nada. Esto evita duplicados cuando la app recupera una ejecución atrasada.
4. Toma el primer concepto con `"estado": "pendiente"`, en orden. Nunca repitas uno publicado.
5. Si no queda ninguno:
   - Con `fin_de_curso_avisado` en `false`, crea el aviso de fin de curso (paso 6), pon ese campo en `true`, confirma y sube el cambio.
   - Con `fin_de_curso_avisado` en `true`, termina sin hacer nada.
   - No inventes conceptos nuevos ni publiques relleno.

## 2. Diseña el juego

Lee `juegos/01-variables.html` como referencia de identidad visual, estructura y estándar de calidad. Lee en `registro.json` el campo `mecanicas` de las entregas anteriores y usa una combinación distinta, con una metáfora propia para el concepto. No recrees ningún juego existente.

El juego debe centrarse en UN solo concepto y suponer solo lo enseñado en entregas anteriores.

Cada entrega incluye:

1. **Explicación:** 2 o 3 frases, con tono cercano, en español.
2. **Minijuego interactivo:** el usuario razona o construye la lógica: ordenar bloques, completar una condición, predecir qué imprime un código, etc. Nada de quiz de opción múltiple.
3. **Feedback inmediato:** al acertar, mensaje de éxito. Al fallar, una pista progresiva y nunca la respuesta directa, por muchas veces que falle.
4. **Puntuación y progreso:** un contador siempre visible.

Siempre que se pueda, comprueba las soluciones ejecutando la lógica del usuario, no comparándola con una única respuesta fija.

## 3. Construye

Crea `juegos/NN-id.html`, donde NN es el orden con dos dígitos.

- Un único archivo con HTML, CSS y JS. Sin fuentes, scripts ni imágenes externas.
- Debe incluir `#puntos`, un enlace `../index.html` y `<link rel="icon" href="data:,">`.
- Diseño simple y responsive: sin desborde horizontal a 375 px, foco de teclado visible, botones de al menos 44 px y `prefers-reduced-motion` respetado.
- Controles que funcionen con toque y teclado. No dependas solo de arrastrar.
- Sin texto de relleno ni datos falsos.

## 4. Comprueba de verdad

Crea `pruebas/NN-id.test.mjs`, siguiendo `pruebas/01-variables.test.mjs`. La prueba debe:

- Completar todos los retos en un navegador real hasta la pantalla final, y comprobar la puntuación exacta.
- Fallar a propósito en varios retos, y confirmar que las pistas avanzan y no contienen la respuesta.
- Confirmar que no hay errores de JS, de consola ni recursos externos.
- Jugar también a 375 px sin desborde horizontal.

Después:

1. Si hace falta, ejecuta `npm install`.
2. Actualiza el concepto en `registro.json` con estos campos: `"estado": "publicado"`, `"titulo"`, `"archivo"`, `"fecha"` (AAAA-MM-DD) y `"mecanicas"` (lista).
3. Ejecuta `npm run portada` y luego `npm test`.
4. Mira las capturas de `capturas/` y corrige lo que se vea mal.

Corrige el juego hasta que todo pase, sin debilitar ni omitir pruebas para conseguirlo. Si no lo consigues, no publiques: revierte tus cambios en `registro.json` e `index.html`, y crea el aviso de fallo (paso 6).

## 5. Publica

1. Confirma y sube solo los archivos de esta entrega, `registro.json` e `index.html`. El mensaje del commit termina con:

   ```
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   ```

2. Espera a que termine el despliegue de GitHub Pages con `gh run list --repo ArielOGc1/minijuegos-logica`.
3. Comprueba el sitio publicado ejecutando las pruebas contra él, con la variable de entorno `BASE_URL=https://arielogc1.github.io/minijuegos-logica/`. Los juegos anteriores deben seguir accesibles.

No borres ni modifiques los juegos anteriores. El histórico se conserva.

## 6. Avisa

Crea un borrador en Gmail, sin enviar nada más, dirigido a la dirección indicada en la tarea programada:

- **Publicado:** asunto `Minijuego listo: <título>`, con concepto, enlace directo al juego y enlace a la portada. Créalo solo cuando la comprobación del paso 5 haya pasado.
- **Fallo:** asunto `Minijuego no publicado: <concepto>`, con lo que falló y lo que hiciste, sin enlaces a un juego que no funciona.
- **Fin de curso:** asunto `Minijuegos: curso completado`. Indica que ya se cubrieron los 7 conceptos y que conviene ampliar la lista o desactivar la tarea programada.

Si Gmail no está disponible, dilo en el resumen final de la ejecución. No afirmes haber avisado si no se creó el borrador.
