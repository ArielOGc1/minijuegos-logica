// Convierte cada fuentes/NN-id.mjs en juegos/NN-id.html, tras verificarla con Python real.
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { generarPagina, validar, verificar } from './entrega.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const archivos = readdirSync(join(raiz, 'fuentes')).filter((a) => a.endsWith('.mjs')).sort();

mkdirSync(join(raiz, 'juegos'), { recursive: true });
for (const archivo of archivos) {
  const { default: entrega } = await import(pathToFileURL(join(raiz, 'fuentes', archivo)).href);
  validar(entrega, archivo);
  verificar(entrega, archivo);
  const salida = archivo.replace(/\.mjs$/, '.html');
  writeFileSync(join(raiz, 'juegos', salida), generarPagina(entrega));
  console.log(`${salida}: verificado con Python y SQLite`);
}
