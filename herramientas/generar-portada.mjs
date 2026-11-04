// Genera index.html a partir de registro.json. No edites index.html a mano.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const { conceptos } = JSON.parse(readFileSync(join(raiz, 'registro.json'), 'utf8'));

const escapar = (texto) => String(texto)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const fila = (c) => {
  if (c.estado !== 'publicado') {
    return `<li class="casillero cerrado">
        <span class="etiqueta">${c.orden}. ${escapar(c.nombre)}</span>
        <div class="hueco"><span class="vacio">Aún cerrado</span></div>
      </li>`;
  }
  return `<li class="casillero">
        <span class="etiqueta">${c.orden}. ${escapar(c.nombre)}</span>
        <a class="hueco" href="${escapar(c.archivo)}"><span class="nota">${escapar(c.titulo)}</span></a>
      </li>`;
};

const publicados = conceptos.filter((c) => c.estado === 'publicado').length;

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Minijuegos de lógica</title>
<meta name="description" content="Minijuegos en español con retos de algoritmos y datos en Python y SQL, sin instalar nada.">
<link rel="icon" href="data:,">
<style>
:root {
  color-scheme: light;
  --papel: #E8EEF6;
  --tinta: #14264F;
  --casillero: #1F46A8;
  --hueco: #0F2A6B;
  --nota: #FFD23F;
  --blanco: #FFFFFF;
  --pista: #A01D45;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--papel); color: var(--tinta); font: 1.0625rem/1.55 "Segoe UI", system-ui, -apple-system, Roboto, sans-serif; }
:focus-visible { outline: 3px solid var(--pista); outline-offset: 2px; }
.ancho { width: min(100% - 32px, 960px); margin-inline: auto; }
header { background: var(--casillero); color: var(--blanco); padding: 2.25rem 0 2rem; }
h1 { margin: 0; font: 700 clamp(2.6rem, 10vw, 5rem)/1 Rockwell, "Roboto Slab", "Sitka Text", Georgia, serif; color: var(--nota); }
header p { max-width: 60ch; margin: .75rem 0 0; font-size: 1.15rem; }
.estado { margin: 1.5rem 0 1rem; }
.muro { display: grid; gap: .6rem; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); margin: 0 0 3rem; padding: 0; list-style: none; }
.casillero { display: flex; flex-direction: column; background: var(--casillero); padding: .55rem; border-radius: 4px; }
.cerrado { background: #5D6F99; }
.etiqueta { display: block; margin-bottom: .5rem; padding: .15rem .4rem; background: var(--blanco); border-radius: 2px; font-weight: 600; }
.hueco { flex: 1; display: grid; place-items: center; min-height: 120px; padding: .75rem; background: var(--hueco); border-radius: 2px; box-shadow: inset 0 10px 12px -6px #000A; text-decoration: none; }
.vacio { color: #C7D3EE; }
.nota { padding: .55rem .9rem; background: var(--nota); color: var(--tinta); font: 700 1.3rem/1.2 Rockwell, "Roboto Slab", "Sitka Text", Georgia, serif; transform: rotate(-2deg); box-shadow: 0 3px 0 #0006; text-align: center; }
a.hueco:hover .nota { transform: rotate(0); background: #FFE27A; }
@media (prefers-reduced-motion: no-preference) { .nota { transition: transform .15s; } }
</style>
</head>
<body>
<header>
  <div class="ancho">
    <h1>Minijuegos de lógica</h1>
    <p>Retos de algoritmos y datos con Python y SQL, un concepto cada vez. Tu código se ejecuta en el navegador: no hay nada que instalar.</p>
  </div>
</header>
<main class="ancho">
  <p class="estado">${publicados} de ${conceptos.length} minijuegos disponibles. Empieza por el primero: cada uno se apoya en el anterior.</p>
  <ol class="muro">
      ${conceptos.map(fila).join('\n      ')}
  </ol>
</main>
</body>
</html>
`;

writeFileSync(join(raiz, 'index.html'), html);
console.log(`Portada generada: ${publicados}/${conceptos.length} publicados.`);
