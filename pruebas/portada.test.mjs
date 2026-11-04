import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { abrirNavegador, captura, nuevaPagina, raiz, sinDesbordeHorizontal, urlDe } from './comun.mjs';

const { conceptos } = JSON.parse(readFileSync(join(raiz, 'registro.json'), 'utf8'));
const publicados = conceptos.filter((c) => c.estado === 'publicado');
let navegador;

before(async () => { navegador = await abrirNavegador(); });
after(async () => { await navegador.close(); });

test('la portada enlaza todas las entregas y cada una abre sin errores', async () => {
  const { pagina: p, errores, cerrar } = await nuevaPagina(navegador);
  await p.goto(urlDe('index.html'));
  assert.equal(await p.locator('a.hueco').count(), publicados.length);
  assert.equal(await p.locator('.cerrado').count(), conceptos.length - publicados.length);
  await captura(p, 'portada');

  for (const c of publicados) {
    await p.goto(urlDe('index.html'));
    await p.click(`a.hueco[href="${c.archivo}"]`);
    await p.waitForLoadState('load');
    assert.ok(p.url().endsWith(c.archivo), `No se abrió ${c.archivo}`);
    assert.ok(await p.isVisible('.marcador'), `${c.archivo} no muestra el progreso`);
    await p.click('a[href="../index.html"]');
    await p.waitForSelector('.muro');
  }
  assert.deepEqual(errores, []);
  await cerrar();
});

test('la portada se ve bien en móvil', async () => {
  const { pagina: p, errores, cerrar } = await nuevaPagina(navegador, { width: 375, height: 812 });
  await p.goto(urlDe('index.html'));
  await sinDesbordeHorizontal(p, 'portada');
  await captura(p, 'portada-movil');
  assert.deepEqual(errores, []);
  await cerrar();
});
