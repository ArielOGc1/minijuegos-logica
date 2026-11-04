// Prueba todas las entregas de fuentes/: no hace falta una prueba nueva por entrega.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { generarPractica, nombrePractica } from '../herramientas/entrega.mjs';
import { abrirNavegador, captura, nuevaPagina, raiz, sinDesbordeHorizontal, urlDe } from './comun.mjs';

const archivos = readdirSync(join(raiz, 'fuentes')).filter((a) => a.endsWith('.mjs')).sort();
let navegador;

before(async () => { navegador = await abrirNavegador(); });
after(async () => { await navegador.close(); });

for (const archivo of archivos) {
  const { default: entrega } = await import(pathToFileURL(join(raiz, 'fuentes', archivo)).href);
  const ruta = `juegos/${archivo.replace(/\.mjs$/, '.html')}`;
  const total = entrega.ejercicios.length;

  test(`${entrega.titulo}: pistas, solución y contador funcionan`, async () => {
    const { pagina: p, errores, cerrar } = await nuevaPagina(navegador);
    await p.goto(urlDe(ruta));
    assert.equal(await p.locator('.ejercicio').count(), total);
    assert.equal(await p.textContent('#hechos'), '0');
    await captura(p, `${entrega.id}-inicio`);

    const texto = await p.locator('body').innerText();
    assert.doesNotMatch(texto, /lorem ipsum|placeholder|\bTODO\b/i);
    assert.equal(await p.locator('input[type="radio"]').count(), 0);

    for (const [i, ejercicio] of entrega.ejercicios.entries()) {
      const bloque = p.locator(`[data-ejercicio="${i + 1}"]`);
      // Las pistas salen de una en una.
      for (let n = 0; n < ejercicio.pistas.length; n++) {
        assert.equal(await bloque.locator('.pistas li:visible').count(), n);
        await bloque.locator('.ver-pista').click();
      }
      assert.equal(await bloque.locator('.pistas li:visible').count(), ejercicio.pistas.length);
      assert.ok(await bloque.locator('.ver-pista').isDisabled());

      // La solución no se ve hasta hacer clic.
      const codigo = bloque.locator('.solucion pre');
      assert.equal(await codigo.isVisible(), false, 'La solución se ve sin hacer clic');
      await bloque.locator('.solucion summary').click();
      assert.ok(await codigo.isVisible());
      assert.equal((await codigo.innerText()).trim(), ejercicio.solucion.trim());

      await bloque.locator('.marcar').check();
      assert.equal(await p.textContent('#hechos'), String(i + 1));
    }
    assert.equal(await p.locator('#progreso li.hecho').count(), total);
    await captura(p, `${entrega.id}-completa`);

    // El contador se conserva al recargar y se puede corregir.
    await p.reload();
    assert.equal(await p.textContent('#hechos'), String(total));
    await p.locator('[data-ejercicio="1"] .marcar').uncheck();
    assert.equal(await p.textContent('#hechos'), String(total - 1));
    assert.deepEqual(errores, []);
    await cerrar();
  });

  test(`${entrega.titulo}: el archivo descargado funciona con Python real`, async () => {
    const { pagina: p, errores, cerrar } = await nuevaPagina(navegador);
    await p.goto(urlDe(ruta));
    // Se lee el enlace en vez de pulsarlo: al descargar un data: Playwright 1.49 deja una promesa rechazada.
    const enlace = p.locator('#descargar');
    assert.equal(await enlace.getAttribute('download'), nombrePractica(entrega));
    const href = await enlace.getAttribute('href');
    assert.match(href, /^data:text\/x-python;base64,/);
    const carpeta = mkdtempSync(join(tmpdir(), 'descarga-'));
    try {
      const destino = join(carpeta, nombrePractica(entrega));
      const contenido = Buffer.from(href.split(',')[1], 'base64').toString('utf8');
      writeFileSync(destino, contenido);
      assert.equal(contenido, generarPractica(entrega));
      entrega.ejercicios.forEach((e) => assert.ok(!contenido.includes(e.solucion), `El archivo incluye la solución de ${e.titulo}`));

      const r = spawnSync('python', ['-I', destino], { encoding: 'utf8', cwd: carpeta, timeout: 30000 });
      assert.equal(r.status, 1, r.stderr);
      assert.match(r.stdout, new RegExp(`Resultado: 0 de ${total} ejercicios correctos`));
      assert.equal((r.stdout.match(/SIN EMPEZAR/g) || []).length, total);
    } finally {
      rmSync(carpeta, { recursive: true, force: true });
    }
    assert.deepEqual(errores, []);
    await cerrar();
  });

  test(`${entrega.titulo}: se ve bien en móvil`, async () => {
    const { pagina: p, errores, cerrar } = await nuevaPagina(navegador, { width: 375, height: 812 });
    await p.goto(urlDe(ruta));
    await sinDesbordeHorizontal(p, 'inicio');
    for (const summary of await p.locator('.solucion summary').all()) await summary.click();
    for (const pista of await p.locator('.ver-pista').all()) await pista.click();
    await sinDesbordeHorizontal(p, 'soluciones y pistas abiertas');
    await captura(p, `${entrega.id}-movil`);
    assert.deepEqual(errores, []);
    await cerrar();
  });
}
