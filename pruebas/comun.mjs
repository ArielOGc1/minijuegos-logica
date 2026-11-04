// Utilidades para jugar los minijuegos en un navegador real.
// Sin BASE_URL prueba los archivos locales; con BASE_URL, el sitio publicado.
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

export const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const carpetaCapturas = join(raiz, 'capturas');

export function urlDe(ruta) {
  const base = process.env.BASE_URL;
  return base ? new URL(ruta, base).href : pathToFileURL(join(raiz, ruta)).href;
}

export async function abrirNavegador() {
  try {
    return await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    return chromium.launch({ channel: 'chrome', headless: true });
  }
}

// Registra errores de JS, de consola y cualquier petición a otro origen:
// un minijuego autocontenido no debe cargar nada de fuera.
export async function nuevaPagina(navegador, viewport = { width: 1280, height: 800 }) {
  const contexto = await navegador.newContext({ viewport, locale: 'es-ES' });
  const pagina = await contexto.newPage();
  const errores = [];
  pagina.on('pageerror', (e) => errores.push(`JS: ${e.message}`));
  pagina.on('console', (m) => { if (m.type() === 'error') errores.push(`Consola: ${m.text()}`); });
  pagina.on('requestfailed', (r) => errores.push(`Petición fallida: ${r.url()}`));
  pagina.on('request', (r) => {
    const url = new URL(r.url());
    if (url.protocol === 'data:' || url.protocol === 'file:') return;
    if (process.env.BASE_URL && url.origin === new URL(process.env.BASE_URL).origin) return;
    errores.push(`Recurso externo: ${r.url()}`);
  });
  return { pagina, errores, cerrar: () => contexto.close() };
}

export async function sinDesbordeHorizontal(pagina, contexto) {
  const { ancho, visible } = await pagina.evaluate(() => ({
    ancho: document.documentElement.scrollWidth,
    visible: window.innerWidth
  }));
  assert.ok(ancho <= visible, `Desborde horizontal en ${contexto}: ${ancho}px en ${visible}px`);
}

export async function captura(pagina, nombre) {
  mkdirSync(carpetaCapturas, { recursive: true });
  await pagina.screenshot({ path: join(carpetaCapturas, `${nombre}.png`), fullPage: true });
}
