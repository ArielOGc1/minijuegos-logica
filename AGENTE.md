# Instrucciones del agente de ejercicios

Cada ejecución crea y publica una entrega nueva de ejercicios, en español, de algoritmos y datos con Python y SQL. La persona los resuelve en su computador, con su editor, y en la página encuentra las pistas y la solución.

**Público y nivel:** personas que ya conocen lo básico de programación. La dificultad es parecida a un Easy de LeetCode: un problema concreto, con casos límite, que se resuelve en pocas líneas pensando un poco. No lo hagas más difícil que eso. Escribe enunciados propios: no copies problemas de ninguna plataforma.

La carpeta del proyecto es el repositorio `ArielOGc1/minijuegos-logica`, publicado con GitHub Pages en https://arielogc1.github.io/minijuegos-logica/.

## 1. Decide qué toca

1. Ejecuta `git pull --ff-only`. Si falla, o si hay cambios sin confirmar que no sean tuyos, detente y avisa: no los sobrescribas.
2. Lee `registro.json`.
3. Si un concepto ya tiene `"fecha"` igual a hoy, termina sin publicar nada. Esto evita duplicados cuando la app recupera una ejecución atrasada.
4. Toma el primer concepto con `"estado": "pendiente"`, en orden, y sigue su campo `enfoque`. Nunca repitas uno publicado.
5. Si no queda ninguno:
   - Con `fin_de_curso_avisado` en `false`, envía el aviso de fin de curso (paso 5), pon ese campo en `true`, confirma y sube el cambio.
   - Con `fin_de_curso_avisado` en `true`, termina sin hacer nada.
   - No inventes conceptos nuevos ni publiques relleno.

## 2. Escribe la entrega

Lee `fuentes/03-busqueda-diccionarios.mjs` como referencia de formato, tono y nivel. Crea `fuentes/NN-id.mjs`, donde NN es el orden con dos dígitos.

Cada entrega se centra en UN solo concepto y tiene:

1. **Explicación:** 2 o 3 frases, con tono cercano, en español.
2. **Entre 5 y 7 ejercicios:** mezcla Python y SQL, con al menos 2 de cada uno. Alterna problemas de algoritmia con casos del mundo de los datos, como ventas, registros, usuarios o limpieza. La dificultad sube dentro de la entrega.
3. **Por cada ejercicio:** enunciado, resultados esperados, al menos 3 pistas progresivas que no contengan la solución, la solución y una explicación breve de por qué funciona y qué trampa evita.
4. **Una respuesta incorrecta pero plausible** (`incorrecta`). No se publica: sirve para comprobar que los casos detectan ese error.

Tipos de ejercicio:

- `python`: lleva `funcion`, `parametros` y `casos`. Los casos normales se muestran como ejemplo en la página, y los `extra: true` son casos límite que solo revisa el archivo de práctica.
- `sql`: lleva `tablas`, `esperado`, `tablasExtra` y `esperadoExtra`. La segunda tabla debe cubrir lo que la primera no detecta. El dialecto es el de SQLite: si una consulta no valdría igual en otros motores, dilo en la explicación.

Los ejercicios corren con Python normal y solo con su biblioteca estándar: no exijas instalar paquetes como pandas.

## 3. Construye y comprueba

1. Si hace falta, ejecuta `npm install`.
2. Actualiza el concepto en `registro.json` con estos campos: `"estado": "publicado"`, `"titulo"`, `"archivo"` y `"fecha"` (AAAA-MM-DD).
3. Ejecuta `npm run construir`. Valida la fuente y, con Python y SQLite reales, comprueba que el archivo sin tocar aparece SIN EMPEZAR, que cada solución PASA y que cada respuesta incorrecta FALLA. Genera `juegos/NN-id.html`: un único archivo, con el `.py` incrustado para descargarlo.
4. Ejecuta `npm run portada` y luego `npm test`. Las pruebas recorren todas las entregas en un navegador real: pistas, solución, contador, archivo descargable, móvil y ausencia de errores.
5. Mira las capturas de `capturas/` y corrige lo que se vea mal.

Corrige la entrega hasta que todo pase, sin debilitar ni omitir comprobaciones para conseguirlo. Si no lo consigues, no publiques: revierte tus cambios en `registro.json` e `index.html`, y envía el aviso de fallo (paso 5).

No edites a mano los archivos de `juegos/` ni modifiques las entregas anteriores.

## 4. Publica

1. Confirma y sube solo los archivos de esta entrega (`fuentes/`, `juegos/`), `registro.json` e `index.html`. El mensaje del commit termina con:

   ```
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   ```

2. Espera a que termine el despliegue de GitHub Pages con `gh run list --repo ArielOGc1/minijuegos-logica`.
3. Comprueba el sitio publicado ejecutando las pruebas contra él, con la variable de entorno `BASE_URL=https://arielogc1.github.io/minijuegos-logica/`. Las entregas anteriores deben seguir accesibles.

## 5. Avisa

Envía un solo correo con el conector de Gmail (`send_message`), únicamente a la dirección indicada en la tarea programada:

- **Publicado:** asunto `Ejercicios listos: <título>`, con concepto, enlace directo a la entrega y enlace a la portada. Envíalo solo cuando la comprobación del paso 4 haya pasado.
- **Fallo:** asunto `Ejercicios no publicados: <concepto>`, con lo que falló y lo que hiciste, sin enlaces a una entrega que no funciona.
- **Fin de curso:** asunto `Ejercicios: curso completado`. Indica que ya se cubrieron todos los conceptos y que conviene ampliar la lista o desactivar la tarea programada.

Si el envío falla, crea un borrador con el mismo contenido (`create_draft`) y dilo en el resumen final de la ejecución. Si tampoco se puede crear, indícalo también. No afirmes haber enviado un correo si el envío no se confirmó.
