import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { abrirNavegador, captura, nuevaPagina, sinDesbordeHorizontal, urlDe } from './comun.mjs';

const RUTA = 'juegos/01-variables.html';
let navegador;

before(async () => { navegador = await abrirNavegador(); });
after(async () => { await navegador.close(); });

const puntos = async (p) => Number(await p.textContent('#puntos'));
const feedback = async (p) => (await p.textContent('#feedback')).trim();

async function comprobar(p, tipo) {
  const previo = await feedback(p);
  await p.click('#comprobar');
  await p.waitForFunction(
    ([t, antes]) => {
      const f = document.getElementById('feedback');
      return f.dataset.tipo === t && f.textContent.trim() !== antes;
    },
    [tipo, previo]
  );
  return feedback(p);
}

async function responder(p, valores, tipo) {
  for (const [nombre, valor] of Object.entries(valores)) {
    await p.fill(`[data-respuesta="${nombre}"]`, valor);
  }
  return comprobar(p, tipo);
}

async function armar(p, bloques) {
  for (const b of bloques) await p.click(`[data-bloque="${b}"]`);
}

async function limpiarPrograma(p) {
  while (await p.locator('#codigo [aria-label^="Quitar"]').count()) {
    await p.locator('#codigo [aria-label^="Quitar"]').first().click();
  }
}

const siguiente = (p) => p.click('#siguiente');

test('con fallos: pistas progresivas sin revelar la respuesta y puntuación descontada', async () => {
  const { pagina: p, errores, cerrar } = await nuevaPagina(navegador);
  await p.goto(urlDe(RUTA));
  assert.equal(await p.textContent('#texto-progreso'), 'Reto 1 de 6');
  assert.equal(await puntos(p), 0);

  // Una respuesta vacía avisa y no penaliza.
  await comprobar(p, 'aviso');
  assert.match(await p.textContent('#valor'), /100 puntos/);

  // Reto 1: tres fallos dan tres pistas distintas, sin el 8.
  const vistas = [];
  for (const intento of ['5', '13', '3']) {
    const texto = await responder(p, { salida: intento }, 'pista');
    assert.doesNotMatch(texto, /\b8\b/, 'La pista revela la respuesta');
    vistas.push(texto);
  }
  assert.equal(new Set(vistas).size, 3, 'Las pistas no avanzan');
  assert.match(vistas[0], /Pista 1 de 3/);
  assert.match(vistas[2], /Pista 3 de 3/);
  // Seguir fallando no agota las pistas ni muestra la respuesta.
  assert.doesNotMatch(await responder(p, { salida: '4' }, 'pista'), /\b8\b/);
  await captura(p, 'reto1-pista');
  assert.match(await responder(p, { salida: '8' }, 'exito'), /Has ganado 40 puntos/);
  assert.equal(await puntos(p), 40);
  await siguiente(p);

  // Reto 2: un fallo, la pista no contiene 30.
  assert.equal(await p.textContent('#texto-progreso'), 'Reto 2 de 6');
  assert.doesNotMatch(await responder(p, { salida: '20' }, 'pista'), /\b30\b/);
  await responder(p, { salida: '30' }, 'exito');
  assert.equal(await puntos(p), 120);
  await siguiente(p);

  // Reto 3: el error típico marca solo el casillero equivocado.
  await responder(p, { a: '7', b: '7' }, 'pista');
  assert.equal(await p.locator('.casillero[data-variable="a"].bien').count(), 1);
  assert.equal(await p.locator('.casillero[data-variable="b"].mal').count(), 1);
  await responder(p, { a: '7', b: '3' }, 'exito');
  assert.equal(await p.locator('.casillero[data-variable="b"] .nota[data-valor="3"]').count(), 1);
  assert.equal(await puntos(p), 200);
  await siguiente(p);

  // Reto 4: el programa se ejecuta de verdad. Un orden incorrecto falla por su causa real.
  await armar(p, ['total = precio * 2', 'precio = 10']);
  assert.match(await comprobar(p, 'pista'), /línea 1 usa precio/);
  await limpiarPrograma(p);
  await armar(p, ['precio = 10', 'precio = precio + 2', 'total = precio * 2']);
  await comprobar(p, 'exito');
  assert.equal(await p.locator('.casillero[data-variable="total"] .nota[data-valor="24"]').count(), 1);
  assert.equal(await puntos(p), 280);
  await siguiente(p);

  // Reto 5: los botones de mover cambian el resultado.
  await armar(p, ['izquierda = derecha', 'aux = izquierda', 'derecha = aux']);
  await captura(p, 'reto5-programa');
  await p.click('[aria-label="Subir aux = izquierda"]');
  await comprobar(p, 'exito');
  assert.equal(await puntos(p), 380);
  await siguiente(p);

  // Reto 6: un número fijo acierta el primer caso pero no todos; la pista no da la expresión.
  const fijo = await responder(p, { expresion: '14' }, 'pista');
  assert.match(fijo, /monedas = 12/);
  assert.doesNotMatch(fijo, /monedas\s*[*+]/);
  // Un nombre desconocido o una línea ilegible orientan sin descontar.
  assert.match(await responder(p, { expresion: 'moneda * 2' }, 'aviso'), /moneda/);
  await responder(p, { expresion: 'monedas *' }, 'aviso');
  await responder(p, { expresion: 'monedas * 2' }, 'exito');
  assert.equal(await puntos(p), 460);
  await p.click('#siguiente');

  assert.equal(await p.textContent('#total'), '460');
  assert.ok(await p.isVisible('#final'));
  await captura(p, 'final');
  assert.deepEqual(errores, []);
  await cerrar();
});

test('sin fallos en móvil: 600 puntos, sin desborde, y se puede volver a jugar', async () => {
  const { pagina: p, errores, cerrar } = await nuevaPagina(navegador, { width: 375, height: 812 });
  await p.goto(urlDe(RUTA));
  await sinDesbordeHorizontal(p, 'reto 1');
  await captura(p, 'movil-reto1');

  // Al sobrescribir monedas, la nota anterior sale del casillero.
  const notaQueSale = p.waitForSelector('.nota.sale', { state: 'attached' });
  await responder(p, { salida: '8' }, 'exito');
  await notaQueSale;
  assert.equal(await p.locator('.nota[data-valor="8"]').count(), 1);
  await siguiente(p);
  await responder(p, { salida: '30' }, 'exito');
  await siguiente(p);
  await sinDesbordeHorizontal(p, 'reto 3');
  await responder(p, { a: '7', b: '3' }, 'exito');
  await siguiente(p);
  await armar(p, ['precio = 10', 'precio = precio + 2', 'total = precio * 2']);
  await sinDesbordeHorizontal(p, 'reto 4');
  await captura(p, 'movil-reto4');
  await comprobar(p, 'exito');
  await siguiente(p);
  await armar(p, ['aux = izquierda', 'izquierda = derecha', 'derecha = aux']);
  await sinDesbordeHorizontal(p, 'reto 5');
  await comprobar(p, 'exito');
  await siguiente(p);
  await sinDesbordeHorizontal(p, 'reto 6');
  // Otra forma válida de escribirlo y enviar con Enter.
  await p.fill('#expresion', 'monedas + monedas');
  await p.press('#expresion', 'Enter');
  await p.waitForFunction(() => document.getElementById('feedback').dataset.tipo === 'exito');
  await siguiente(p);

  assert.equal(await p.textContent('#total'), '600');
  await sinDesbordeHorizontal(p, 'final');
  await p.click('#reiniciar');
  assert.equal(await puntos(p), 0);
  assert.equal(await p.textContent('#texto-progreso'), 'Reto 1 de 6');
  assert.deepEqual(errores, []);
  await cerrar();
});

test('no hay texto de relleno ni opciones múltiples', async () => {
  const { pagina: p, errores, cerrar } = await nuevaPagina(navegador);
  await p.goto(urlDe(RUTA));
  const html = await p.content();
  assert.doesNotMatch(html, /lorem ipsum|placeholder/i);
  assert.doesNotMatch(html, /\bTODO\b|\bFIXME\b|\[[A-Z]+\]/);
  assert.equal(await p.locator('input[type="radio"]').count(), 0);
  assert.deepEqual(errores, []);
  await cerrar();
});
