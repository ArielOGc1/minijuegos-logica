// Convierte cada fuentes/NN-id.js en juegos/NN-id.html: un único archivo con todo incrustado.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const kit = (archivo) => readFileSync(join(raiz, 'herramientas', 'kit', archivo), 'utf8');
const modulo = (ruta) => join(raiz, 'node_modules', ruta);
const base64 = (contenido) => Buffer.from(contenido).toString('base64');

const pythonJs = readFileSync(modulo('@micropython/micropython-webassembly-pyscript/micropython.mjs'), 'utf8')
  .replace('export default _createMicroPythonModule', '')
  .replace('export async function loadMicroPython', 'async function loadMicroPython')
  .replaceAll('import.meta.url', 'self.location.href');
const pythonWasm = readFileSync(modulo('@micropython/micropython-webassembly-pyscript/micropython.wasm'));
const sqlJs = readFileSync(modulo('sql.js/dist/sql-wasm-inline.js'), 'utf8');

const escapar = (texto) => String(texto)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function validar(juego, archivo) {
  const fallo = (texto) => { throw new Error(`${archivo}: ${texto}`); };
  ['id', 'titulo', 'entrega', 'concepto', 'explicacion', 'descripcion'].forEach((campo) => {
    if (!juego[campo]) fallo(`falta "${campo}"`);
  });
  const frases = juego.explicacion.split(/[.!?](\s|$)/).filter((f) => f && f.trim()).length;
  if (frases < 2 || frases > 3) fallo(`la explicación debe tener 2 o 3 frases y tiene ${frases}`);
  if (!Array.isArray(juego.retos) || juego.retos.length < 3) fallo('necesita al menos 3 retos');
  juego.retos.forEach((reto, n) => {
    const donde = `reto ${n + 1}`;
    if (!reto.titulo || !reto.enunciado || !reto.exito) fallo(`${donde}: falta título, enunciado o éxito`);
    if (!Array.isArray(reto.pistas) || reto.pistas.length < 3) fallo(`${donde}: necesita al menos 3 pistas`);
    if (reto.tipo === 'python') {
      if (!reto.funcion || !reto.inicial) fallo(`${donde}: falta funcion o inicial`);
      if (!reto.casos?.some((c) => c.oculto)) fallo(`${donde}: necesita casos ocultos`);
      if (!reto.casos?.some((c) => !c.oculto)) fallo(`${donde}: necesita casos visibles`);
    } else if (reto.tipo === 'sql') {
      if (!reto.tablas || !reto.tablasOcultas || !reto.esperado || !reto.esperadoOculto || !reto.inicial) {
        fallo(`${donde}: faltan tablas, tablasOcultas, esperado, esperadoOculto o inicial`);
      }
    } else if (reto.tipo === 'predecir-sql') {
      if (!reto.tablas || !reto.consulta || !reto.columnas) fallo(`${donde}: faltan tablas, consulta o columnas`);
    } else {
      fallo(`${donde}: tipo desconocido "${reto.tipo}"`);
    }
  });
}

function construir(archivo) {
  const fuente = readFileSync(join(raiz, 'fuentes', archivo), 'utf8');
  if (/<\/script/i.test(fuente)) throw new Error(`${archivo}: no puede contener una etiqueta de cierre de script`);
  const contexto = { window: {} };
  vm.runInNewContext(fuente, contexto);
  const juego = contexto.window.JUEGO;
  validar(juego, archivo);

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(juego.titulo)}: ${escapar(juego.concepto.toLowerCase())} | Minijuegos de lógica</title>
<meta name="description" content="${escapar(juego.descripcion)}">
<link rel="icon" href="data:,">
<style>
${kit('kit.css')}</style>
</head>
<body>
<header class="banner">
  <div class="ancho">
    <a href="../index.html">Todos los minijuegos</a>
    <h1>${escapar(juego.titulo)}</h1>
    <p>Entrega ${juego.entrega}: ${escapar(juego.concepto.toLowerCase())}</p>
  </div>
</header>
<div class="marcador">
  <div class="ancho">
    <div class="avance">
      <span id="texto-progreso"></span>
      <ol id="progreso" aria-hidden="true"></ol>
    </div>
    <div class="puntuacion"><span id="puntos">0</span> puntos</div>
  </div>
</div>
<main class="ancho">
  <p id="explicacion"></p>
  <section id="juego">
    <div class="encabezado-reto"><span id="lenguaje"></span><h2 id="titulo-reto"></h2></div>
    <p id="enunciado"></p>
    <p id="valor"></p>
    <form id="formulario" novalidate autocomplete="off">
      <div class="mesa">
        <div id="datos"></div>
        <div>
          <div id="zona-editor">
            <label class="rotulo" for="editor" id="etiqueta-editor"></label>
            <textarea id="editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off"></textarea>
            <p id="nota-python">Este Python corre en tu navegador (MicroPython), que es más limitado que el Python normal: no incluye <code>Counter</code>, <code>s[::-1]</code> en textos ni pandas, y sus diccionarios no conservan el orden de inserción. Pulsa Esc y luego Tab para salir del editor con el teclado.</p>
          </div>
          <div id="zona-prediccion" hidden>
            <span class="rotulo">La consulta</span>
            <pre id="consulta-fija"></pre>
            <span class="rotulo">¿Qué devuelve cada columna?</span>
            <div id="respuestas"></div>
          </div>
          <div class="mandos">
            <button class="boton" type="submit" id="ejecutar"></button>
            <button class="boton" type="button" id="siguiente" hidden></button>
          </div>
        </div>
      </div>
    </form>
    <div id="feedback" role="status" aria-live="polite"></div>
    <div id="resultados"></div>
  </section>
  <section id="final" hidden>
    <h2>Reto completado</h2>
    <p class="resultado"><span id="total">0</span> de <span id="maximo">0</span></p>
    <p id="mejor"></p>
    <div class="mandos">
      <button class="boton" type="button" id="reiniciar">Jugar de nuevo</button>
      <a class="boton sobrio" href="../index.html">Ver todos los minijuegos</a>
    </div>
  </section>
</main>
<script type="text/plain" id="motor-python-js">${base64(pythonJs)}</script>
<script type="text/plain" id="motor-python-wasm">${pythonWasm.toString('base64')}</script>
<script type="text/plain" id="motor-sql-js">${base64(sqlJs)}</script>
<script>
${fuente}
</script>
<script>
${kit('motor.js')}
${kit('kit.js')}</script>
</body>
</html>
`;
  mkdirSync(join(raiz, 'juegos'), { recursive: true });
  const salida = archivo.replace(/\.js$/, '.html');
  writeFileSync(join(raiz, 'juegos', salida), html);
  console.log(`${salida}: ${Math.round(Buffer.byteLength(html) / 1024)} KB`);
}

readdirSync(join(raiz, 'fuentes')).filter((a) => a.endsWith('.js')).sort().forEach(construir);
