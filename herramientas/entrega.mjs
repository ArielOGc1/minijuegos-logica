// Genera, desde una fuente, la página de una entrega y su archivo de práctica en Python.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const carpeta = join(dirname(fileURLToPath(import.meta.url)), 'pagina');
const recurso = (archivo) => readFileSync(join(carpeta, archivo), 'utf8');

const dosDigitos = (n) => String(n).padStart(2, '0');
export const nombrePractica = (entrega) => `entrega_${dosDigitos(entrega.numero)}.py`;

const escapar = (texto) => String(texto)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

// Convierte `así` en <code> dentro de un texto ya escapado.
const conCodigo = (texto) => escapar(texto).replace(/`([^`]+)`/g, '<code>$1</code>');

function reprPython(v) {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(reprPython).join(', ')}]`;
  if (typeof v === 'object') {
    return `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${reprPython(x)}`).join(', ')}}`;
  }
  return String(v);
}

function literalSql(v) {
  if (v === null) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replaceAll("'", "''")}'`;
}

function prepararSql(tablas) {
  return tablas.map((t) => {
    const filas = t.filas.map((f) => `(${f.map(literalSql).join(', ')})`).join(', ');
    return `CREATE TABLE ${t.nombre} (${t.columnas.join(', ')});${filas ? ` INSERT INTO ${t.nombre} VALUES ${filas};` : ''}`;
  }).join(' ');
}

function comentario(texto) {
  const limpio = texto.replaceAll('`', '');
  const lineas = [];
  let actual = '';
  limpio.split(/\s+/).forEach((palabra) => {
    if (actual && actual.length + palabra.length + 1 > 74) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = actual ? `${actual} ${palabra}` : palabra;
    }
  });
  if (actual) lineas.push(actual);
  return lineas.map((l) => `# ${l}`).join('\n');
}

function bloqueEjercicio(ejercicio, n, respuesta) {
  const encabezado = [
    '# ' + '-'.repeat(70),
    `# Ejercicio ${n}: ${ejercicio.titulo} (${ejercicio.tipo === 'python' ? 'Python' : 'SQL'})`,
    comentario(ejercicio.enunciado)
  ];
  if (ejercicio.tipo === 'sql') {
    ejercicio.tablas.forEach((t) => encabezado.push(`# Tabla ${t.nombre}: ${t.columnas.join(', ')}`));
    encabezado.push(`# Columnas del resultado: ${ejercicio.esperado.columnas.join(', ')}`);
  }
  encabezado.push('# ' + '-'.repeat(70));
  const cuerpo = ejercicio.tipo === 'python'
    ? respuesta ?? `def ${ejercicio.funcion}(${ejercicio.parametros}):\n    # Escribe tu solución aquí y borra la línea de abajo\n    raise NotImplementedError`
    : `CONSULTA_${n} = """\n${respuesta ?? '-- Escribe tu consulta aquí'}\n"""`;
  return `${encabezado.join('\n')}\n${cuerpo}\n`;
}

function registroEjercicio(ejercicio, n) {
  if (ejercicio.tipo === 'python') {
    const casos = ejercicio.casos.map((c) => `        (${reprPython(c.args)}, ${reprPython(c.esperado)})`).join(',\n');
    return `    {"numero": ${n}, "titulo": ${JSON.stringify(ejercicio.titulo)}, "tipo": "python", "funcion": ${ejercicio.funcion}, "casos": [\n${casos}\n    ]}`;
  }
  const conjuntos = [[ejercicio.tablas, ejercicio.esperado.filas], [ejercicio.tablasExtra, ejercicio.esperadoExtra]];
  const datos = conjuntos.map(([tablas, filas]) => `        (${JSON.stringify(prepararSql(tablas))}, ${reprPython(filas)})`).join(',\n');
  return `    {"numero": ${n}, "titulo": ${JSON.stringify(ejercicio.titulo)}, "tipo": "sql", "consulta": CONSULTA_${n}, "con_orden": ${ejercicio.conOrden ? 'True' : 'False'}, "datos": [\n${datos}\n    ]}`;
}

// respuestas: lista opcional con el código que sustituye a cada ejercicio sin resolver.
export function generarPractica(entrega, respuestas = []) {
  const bloques = entrega.ejercicios.map((e, i) => bloqueEjercicio(e, i + 1, respuestas[i])).join('\n');
  const registros = entrega.ejercicios.map((e, i) => registroEjercicio(e, i + 1)).join(',\n');
  return [
    `# Entrega ${entrega.numero}: ${entrega.concepto}`,
    '# Completa las funciones y las consultas, y ejecuta este archivo:',
    `#     python ${nombrePractica(entrega)}`,
    '# Solo necesitas Python: SQLite viene incluido.',
    '',
    bloques,
    '# ' + '-'.repeat(70),
    '# No hace falta cambiar nada debajo de esta línea',
    '# ' + '-'.repeat(70),
    `TITULO = ${JSON.stringify(`Entrega ${entrega.numero}: ${entrega.concepto}`)}`,
    'EJERCICIOS = [',
    registros,
    ']',
    '',
    recurso('corredor.py')
  ].join('\n');
}

function ejecutarPractica(codigo) {
  const carpetaTemporal = mkdtempSync(join(tmpdir(), 'entrega-'));
  try {
    const archivo = join(carpetaTemporal, 'practica.py');
    writeFileSync(archivo, codigo);
    const r = spawnSync('python', ['-I', archivo], { encoding: 'utf8', timeout: 30000, cwd: carpetaTemporal });
    if (r.error) throw r.error;
    const estados = new Map();
    for (const linea of r.stdout.split(/\r?\n/)) {
      const m = linea.match(/^\s*(\d+)\. .*: (PASA|FALLA|SIN EMPEZAR)$/);
      if (m) estados.set(Number(m[1]), m[2]);
    }
    return { salida: r.stdout + r.stderr, estados };
  } finally {
    rmSync(carpetaTemporal, { recursive: true, force: true });
  }
}

export function validar(entrega, archivo) {
  const fallo = (texto) => { throw new Error(`${archivo}: ${texto}`); };
  ['numero', 'id', 'titulo', 'concepto', 'explicacion', 'descripcion'].forEach((campo) => {
    if (!entrega[campo]) fallo(`falta "${campo}"`);
  });
  const frases = (entrega.explicacion.match(/[.!?](\s|$)/g) || []).length;
  if (frases < 2 || frases > 3) fallo(`la explicación debe tener 2 o 3 frases y tiene ${frases}`);
  const { ejercicios } = entrega;
  if (!Array.isArray(ejercicios) || ejercicios.length < 5 || ejercicios.length > 7) fallo('necesita entre 5 y 7 ejercicios');
  for (const tipo of ['python', 'sql']) {
    if (ejercicios.filter((e) => e.tipo === tipo).length < 2) fallo(`necesita al menos 2 ejercicios de ${tipo}`);
  }
  ejercicios.forEach((e, i) => {
    const donde = `ejercicio ${i + 1}`;
    ['titulo', 'enunciado', 'solucion', 'incorrecta', 'explicacion'].forEach((campo) => {
      if (!e[campo]) fallo(`${donde}: falta "${campo}"`);
    });
    if (!Array.isArray(e.pistas) || e.pistas.length < 3) fallo(`${donde}: necesita al menos 3 pistas`);
    const lineas = e.solucion.split('\n').map((l) => l.trim()).filter((l) => l.length >= 12);
    e.pistas.forEach((pista) => {
      const delatora = lineas.find((l) => pista.includes(l));
      if (delatora) fallo(`${donde}: una pista contiene la solución ("${delatora}")`);
    });
    if (e.tipo === 'python') {
      if (!e.funcion || e.parametros === undefined || !e.casos?.length) fallo(`${donde}: faltan funcion, parametros o casos`);
      if (!e.casos.some((c) => !c.extra) || !e.casos.some((c) => c.extra)) fallo(`${donde}: necesita casos de ejemplo y casos extra`);
    } else if (e.tipo === 'sql') {
      if (!e.tablas || !e.tablasExtra || !e.esperado || !e.esperadoExtra) fallo(`${donde}: faltan tablas, tablasExtra, esperado o esperadoExtra`);
    } else {
      fallo(`${donde}: tipo desconocido "${e.tipo}"`);
    }
  });
}

// Comprueba con Python real: sin tocar no cuenta, la solución pasa y la respuesta incorrecta falla.
export function verificar(entrega, archivo) {
  const { ejercicios } = entrega;
  const fallo = (texto, salida) => { throw new Error(`${archivo}: ${texto}\n${salida}`); };

  const vacia = ejecutarPractica(generarPractica(entrega));
  ejercicios.forEach((_, i) => {
    if (vacia.estados.get(i + 1) !== 'SIN EMPEZAR') fallo(`el ejercicio ${i + 1} sin tocar no aparece SIN EMPEZAR`, vacia.salida);
  });

  const resuelta = ejecutarPractica(generarPractica(entrega, ejercicios.map((e) => e.solucion)));
  ejercicios.forEach((_, i) => {
    if (resuelta.estados.get(i + 1) !== 'PASA') fallo(`la solución del ejercicio ${i + 1} no pasa`, resuelta.salida);
  });

  ejercicios.forEach((e, i) => {
    const respuestas = [];
    respuestas[i] = e.incorrecta;
    const r = ejecutarPractica(generarPractica(entrega, respuestas));
    if (r.estados.get(i + 1) !== 'FALLA') fallo(`la respuesta incorrecta del ejercicio ${i + 1} no falla`, r.salida);
  });
}

function tablaHtml(columnas, filas, titulo) {
  const celda = (v) => (v === null ? '<td class="nulo">NULL</td>' : `<td>${escapar(v)}</td>`);
  return `<figure class="datos">
        <figcaption>${escapar(titulo)}</figcaption>
        <div class="desplazable" tabindex="0"><table>
          <thead><tr>${columnas.map((c) => `<th>${escapar(c)}</th>`).join('')}</tr></thead>
          <tbody>${filas.map((f) => `<tr>${f.map(celda).join('')}</tr>`).join('')}</tbody>
        </table></div>
      </figure>`;
}

function ejercicioHtml(e, n) {
  const llamada = (c) => `${e.funcion}(${c.args.map(reprPython).join(', ')})`;
  const datos = e.tipo === 'python'
    ? `<ul class="ejemplos">${e.casos.filter((c) => !c.extra).map((c) => `<li><code>${escapar(llamada(c))}</code> devuelve <code>${escapar(reprPython(c.esperado))}</code></li>`).join('')}</ul>`
    : `${e.tablas.map((t) => tablaHtml(t.columnas, t.filas, `Tabla ${t.nombre}`)).join('\n      ')}
      ${tablaHtml(e.esperado.columnas, e.esperado.filas, 'Resultado esperado')}`;
  return `<article class="ejercicio" id="ejercicio-${n}" data-ejercicio="${n}">
      <div class="encabezado"><span class="lenguaje">${e.tipo === 'python' ? 'Python' : 'SQL'}</span><h2>${n}. ${escapar(e.titulo)}</h2></div>
      <p class="enunciado">${conCodigo(e.enunciado)}</p>
      ${datos}
      <ol class="pistas" aria-live="polite">${e.pistas.map((p) => `<li hidden>${conCodigo(p)}</li>`).join('')}</ol>
      <div class="mandos">
        <button class="boton sobrio ver-pista" type="button">Ver pista 1 de ${e.pistas.length}</button>
        <label class="hecho"><input type="checkbox" class="marcar"> Lo resolví</label>
      </div>
      <details class="solucion">
        <summary>Ver solución</summary>
        <pre><code>${escapar(e.solucion)}</code></pre>
        <p>${conCodigo(e.explicacion)}</p>
      </details>
    </article>`;
}

export function generarPagina(entrega) {
  const practica = Buffer.from(generarPractica(entrega)).toString('base64');
  const descarga = nombrePractica(entrega);
  const total = entrega.ejercicios.length;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(entrega.titulo)}: ${escapar(entrega.concepto.toLowerCase())} | Retos de Python y SQL</title>
<meta name="description" content="${escapar(entrega.descripcion)}">
<link rel="icon" href="data:,">
<style>
${recurso('pagina.css')}</style>
</head>
<body>
<header class="banner">
  <div class="ancho">
    <a href="../index.html">Todas las entregas</a>
    <h1>${escapar(entrega.titulo)}</h1>
    <p>Entrega ${entrega.numero}: ${escapar(entrega.concepto.toLowerCase())}</p>
  </div>
</header>
<div class="marcador">
  <div class="ancho">
    <ol id="progreso" aria-hidden="true">${entrega.ejercicios.map(() => '<li></li>').join('')}</ol>
    <div class="cuenta"><span id="hechos">0</span> de ${total} resueltos</div>
  </div>
</div>
<main class="ancho">
  <p class="explicacion">${conCodigo(entrega.explicacion)}</p>
  <section class="como">
    <h2>Cómo practicar</h2>
    <ol>
      <li>Descarga el archivo y ábrelo en tu editor.</li>
      <li>Completa las funciones y las consultas.</li>
      <li>Ejecuta <code>python ${escapar(descarga)}</code> para ver qué casos pasan. Solo necesitas Python: SQLite viene incluido.</li>
      <li>Si te atascas, pide una pista. Al terminar, compara con la solución.</li>
    </ol>
    <a class="boton" id="descargar" href="data:text/x-python;base64,${practica}" download="${escapar(descarga)}">Descargar ${escapar(descarga)}</a>
  </section>
  ${entrega.ejercicios.map((e, i) => ejercicioHtml(e, i + 1)).join('\n  ')}
</main>
<script>
const CLAVE_ENTREGA = ${JSON.stringify(`retos-python-sql:${entrega.id}:hechos`)};
${recurso('pagina.js')}</script>
</body>
</html>
`;
}
