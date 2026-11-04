# Instrucciones del agente de minijuegos

Cada ejecución crea y publica un minijuego nuevo, en español, con retos de algoritmos y datos en Python y SQL.

**Público y nivel:** personas que ya conocen lo básico de programación. La dificultad es parecida a un Easy de LeetCode: un problema concreto, con casos límite, que se resuelve en pocas líneas pensando un poco. No lo hagas más difícil que eso. Escribe enunciados propios: no copies problemas de ninguna plataforma.

La carpeta del proyecto es el repositorio `ArielOGc1/minijuegos-logica`, publicado con GitHub Pages en https://arielogc1.github.io/minijuegos-logica/.

## 1. Decide qué toca

1. Ejecuta `git pull --ff-only`. Si falla, o si hay cambios sin confirmar que no sean tuyos, detente y avisa: no los sobrescribas.
2. Lee `registro.json`.
3. Si un concepto ya tiene `"fecha"` igual a hoy, termina sin publicar nada. Esto evita duplicados cuando la app recupera una ejecución atrasada.
4. Toma el primer concepto con `"estado": "pendiente"`, en orden, y sigue su campo `enfoque`. Nunca repitas uno publicado.
5. Si no queda ninguno:
   - Con `fin_de_curso_avisado` en `false`, envía el aviso de fin de curso (paso 6), pon ese campo en `true`, confirma y sube el cambio.
   - Con `fin_de_curso_avisado` en `true`, termina sin hacer nada.
   - No inventes conceptos nuevos ni publiques relleno.

## 2. Diseña los retos

Lee `fuentes/02-contar-agrupar.js` como referencia de formato, tono y nivel. Crea `fuentes/NN-id.js`, donde NN es el orden con dos dígitos.

Cada entrega se centra en UN solo concepto y tiene:

1. **Explicación:** 2 o 3 frases, con tono cercano, en español.
2. **Entre 5 y 7 retos:** mezcla Python y SQL, con al menos 2 de cada uno. Alterna problemas de algoritmia con casos del mundo de los datos, como ventas, registros, usuarios o limpieza. La dificultad sube dentro de la entrega.
3. **Feedback inmediato:** al acertar, mensaje de éxito. Al fallar, una pista progresiva y nunca la respuesta directa. Cada reto necesita al menos 3 pistas, y ninguna puede contener la solución.
4. **Puntuación y progreso:** los pone el kit y deben quedar siempre visibles.

Nada de quiz de opción múltiple. Tipos de reto disponibles en `herramientas/kit/`:

- `python`: el usuario escribe una función. Lleva casos visibles y casos `oculto: true`, incluidos casos límite como listas vacías o empates.
- `sql`: el usuario escribe una consulta. Lleva `tablas`, `esperado`, `tablasOcultas` y `esperadoOculto`, para que copiar el resultado no sirva.
- `predecir-sql`: el usuario razona qué devuelve una consulta dada, comprobado con SQLite real.

Puedes añadir un tipo nuevo al kit si el concepto lo pide, siempre con sus pruebas y sin romper los juegos anteriores.

### Límites del motor de Python

El navegador ejecuta MicroPython, no Python normal. Cada reto debe poder resolverse sin chocar con estos límites, y su resultado no puede depender de ellos:

- **Los diccionarios no conservan el orden de inserción.** Nunca exijas un resultado que dependa del orden de un diccionario. Si importa el orden, pide una lista ordenada o una regla de desempate.
- No existen `s[::-1]` en textos, `str.isalnum`, `collections.Counter`, `bisect`, `statistics` ni `itertools.combinations`.
- La recursión tiene un límite menor de 1000 niveles, y el código es mucho más lento que en Python normal: usa entradas pequeñas.

Si un reto necesita algo más, comprueba primero que funciona en el motor.

## 3. Construye

1. Si hace falta, ejecuta `npm install`.
2. Ejecuta `npm run construir`, que valida la fuente y genera `juegos/NN-id.html`: un único archivo con todo incrustado y sin recursos externos.

No edites a mano los archivos de `juegos/` que tienen una fuente, ni modifiques `juegos/01-variables.html`.

## 4. Comprueba de verdad

Crea `pruebas/NN-id.test.mjs`, siguiendo `pruebas/02-contar-agrupar.test.mjs`. La prueba debe:

- Completar todos los retos en un navegador real con soluciones correctas, ejecutadas por los motores reales, y comprobar la puntuación exacta en la pantalla final.
- Enviar al menos una solución incorrecta pero plausible en cada reto y comprobar que no pasa.
- Confirmar que las pistas avanzan y no contienen la respuesta.
- Confirmar que no hay errores de JS, de consola ni recursos externos.
- Jugar también a 375 px sin desborde horizontal.

Después:

1. Actualiza el concepto en `registro.json` con estos campos: `"estado": "publicado"`, `"titulo"`, `"archivo"`, `"fecha"` (AAAA-MM-DD) y `"mecanicas"` (lista).
2. Ejecuta `npm run portada` y luego `npm test`.
3. Mira las capturas de `capturas/` y corrige lo que se vea mal.

Corrige el juego hasta que todo pase, sin debilitar ni omitir pruebas para conseguirlo. Si no lo consigues, no publiques: revierte tus cambios en `registro.json` e `index.html`, y envía el aviso de fallo (paso 6).

## 5. Publica

1. Confirma y sube solo los archivos de esta entrega (`fuentes/`, `juegos/`, `pruebas/`), `registro.json` e `index.html`, más los del kit si los cambiaste. El mensaje del commit termina con:

   ```
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   ```

2. Espera a que termine el despliegue de GitHub Pages con `gh run list --repo ArielOGc1/minijuegos-logica`.
3. Comprueba el sitio publicado ejecutando las pruebas contra él, con la variable de entorno `BASE_URL=https://arielogc1.github.io/minijuegos-logica/`. Los juegos anteriores deben seguir accesibles.

No borres ni modifiques los juegos anteriores. El histórico se conserva.

## 6. Avisa

Envía un solo correo con el conector de Gmail (`send_message`), únicamente a la dirección indicada en la tarea programada:

- **Publicado:** asunto `Minijuego listo: <título>`, con concepto, enlace directo al juego y enlace a la portada. Envíalo solo cuando la comprobación del paso 5 haya pasado.
- **Fallo:** asunto `Minijuego no publicado: <concepto>`, con lo que falló y lo que hiciste, sin enlaces a un juego que no funciona.
- **Fin de curso:** asunto `Minijuegos: curso completado`. Indica que ya se cubrieron todos los conceptos y que conviene ampliar la lista o desactivar la tarea programada.

Si el envío falla, crea un borrador con el mismo contenido (`create_draft`) y dilo en el resumen final de la ejecución. Si tampoco se puede crear, indícalo también. No afirmes haber enviado un correo si el envío no se confirmó.
