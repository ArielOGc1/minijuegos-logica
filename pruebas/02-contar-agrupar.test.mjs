import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { abrirNavegador, captura, nuevaPagina, sinDesbordeHorizontal, urlDe } from './comun.mjs';
import { ejecutar, escribir, predecir, puntos, siguiente } from './retos.mjs';

const RUTA = 'juegos/02-contar-agrupar.html';

const SOLUCIONES = {
  contar: `def contar_estados(estados):
    conteo = {}
    for e in estados:
        conteo[e] = conteo.get(e, 0) + 1
    return conteo
`,
  ventas: `SELECT categoria, COUNT(*) AS pedidos, SUM(importe) AS total
FROM pedidos
WHERE estado = 'pagado'
GROUP BY categoria
ORDER BY total DESC, categoria ASC;`,
  frecuente: `def mas_frecuente(ventas):
    if not ventas:
        return None
    conteo = {}
    for v in ventas:
        conteo[v] = conteo.get(v, 0) + 1
    return sorted(conteo.items(), key=lambda par: (-par[1], par[0]))[0][0]
`,
  valiosos: `SELECT cliente, COUNT(*) AS pedidos, SUM(importe) AS total
FROM pedidos
WHERE estado = 'pagado'
GROUP BY cliente
HAVING COUNT(*) >= 2 AND SUM(importe) >= 100
ORDER BY total DESC;`,
  unico: `def primer_unico(ids):
    conteo = {}
    for i in ids:
        conteo[i] = conteo.get(i, 0) + 1
    for i in ids:
        if conteo[i] == 1:
            return i
    return None
`
};

let navegador;
before(async () => { navegador = await abrirNavegador(); });
after(async () => { await navegador.close(); });

test('con fallos: errores claros, pistas sin solución y puntuación exacta', async () => {
  const { pagina: p, errores, cerrar } = await nuevaPagina(navegador);
  await p.goto(urlDe(RUTA));
  assert.equal(await p.textContent('#texto-progreso'), 'Reto 1 de 6');
  assert.equal(await puntos(p), 0);

  // Reto 1. Sin escribir nada, con errores o con un bucle infinito no se descuenta.
  assert.match(await ejecutar(p, 'aviso'), /Aún no has escrito/);
  assert.match(await escribir(p, 'def contar_estados(estados)\n    return {}\n', 'aviso'), /Línea 1.*sintaxis/);
  assert.match(await escribir(p, 'from collections import Counter\ndef contar_estados(e):\n    return Counter(e)\n', 'aviso'), /no está disponible/);
  assert.match(await escribir(p, 'def contar_estados(estados):\n    while True:\n        pass\n', 'aviso'), /Tardó demasiado/);
  // Código válido en Python normal que este motor no implementa tampoco penaliza.
  assert.match(await escribir(p, 'def contar_estados(estados):\n    return "abc"[::-1]\n', 'aviso'), /no lo admite/);
  assert.match(await escribir(p, 'def contar_estados(estados):\n    return "a1".isalnum()\n', 'aviso'), /no lo admite/);
  assert.match(await p.textContent('#valor'), /100 puntos/);

  // Tres fallos de lógica dan tres pistas distintas y ninguna contiene el código.
  const malo = 'def contar_estados(estados):\n    return {}\n';
  const pistas = [];
  for (let i = 0; i < 3; i++) {
    await p.fill('#editor', `${malo}# intento ${i}\n`);
    const texto = await ejecutar(p, 'pista');
    assert.match(texto, /Pasaron 1 de 4/);
    assert.doesNotMatch(texto, /conteo\[|\.get\(/, 'La pista revela la solución');
    pistas.push(texto.replace(/^Intento \d+ sin acertar\. /, ''));
  }
  assert.equal(new Set(pistas).size, 3, 'Las pistas no avanzan');
  // Los casos fallidos muestran esperado y obtenido, sin revelar el código.
  assert.ok(await p.locator('.caso.mal .detalle').count() >= 1);
  assert.match(await p.locator('.caso.mal .detalle').first().textContent(), /Esperado: .*Obtenido: /);
  await captura(p, 'recuento-reto1-fallo');
  assert.match(await escribir(p, SOLUCIONES.contar, 'exito'), /Has ganado 40 puntos/);
  assert.equal(await puntos(p), 40);
  await siguiente(p);

  // Reto 2. Se razona sin ejecutar: marca solo lo incorrecto y compara contra SQLite real.
  await predecir(p, [6, 6, 4], 'pista');
  assert.equal(await p.locator('[data-respuesta="0"].bien').count(), 1);
  assert.equal(await p.locator('[data-respuesta="1"].mal').count(), 1);
  assert.equal(await p.locator('[data-respuesta="2"].mal').count(), 1);
  await predecir(p, [6, 4, 3], 'exito');
  assert.equal(await puntos(p), 120);
  await siguiente(p);

  // Reto 3. Error de SQL sin penalizar; sin desempate falla; datos fijos fallan en la tabla oculta.
  assert.match(await escribir(p, 'SELEC categoria FROM pedidos', 'aviso'), /sintaxis/);
  assert.match(await escribir(p, 'SELECT nada FROM pedidos', 'aviso'), /La columna nada no existe/);
  assert.match(await p.textContent('#valor'), /100 puntos/);
  const copiado = "SELECT 'hogar', 2, 125 UNION ALL SELECT 'juegos', 1, 125 UNION ALL SELECT 'libros', 2, 75";
  assert.match(await escribir(p, copiado, 'pista'), /falla con otra tabla/);
  await captura(p, 'recuento-reto3-oculto');
  await escribir(p, SOLUCIONES.ventas, 'exito');
  assert.equal(await puntos(p), 200);
  await siguiente(p);

  // Reto 4. Una solución sin la regla de empate no pasa.
  const sinEmpate = `def mas_frecuente(ventas):
    if not ventas:
        return None
    return max(ventas, key=ventas.count)
`;
  const empate = await escribir(p, sinEmpate, 'pista');
  assert.match(empate, /Pasaron \d de 6/);
  assert.doesNotMatch(empate, /sorted|lambda/);
  await escribir(p, SOLUCIONES.frecuente, 'exito');
  assert.equal(await puntos(p), 280);
  await siguiente(p);

  // Reto 5. Sin filtrar por pagado da un resultado distinto.
  const sinFiltro = `SELECT cliente, COUNT(*), SUM(importe) FROM pedidos
GROUP BY cliente HAVING COUNT(*) >= 2 AND SUM(importe) >= 100 ORDER BY 3 DESC`;
  await escribir(p, sinFiltro, 'pista');
  await escribir(p, SOLUCIONES.valiosos, 'exito');
  assert.equal(await puntos(p), 360);
  await siguiente(p);

  // Reto 6. Los print del usuario se muestran y no rompen la comprobación.
  await escribir(p, `${SOLUCIONES.unico}\nprint("hola")\n`, 'exito');
  assert.match(await p.textContent('#resultados'), /hola/);
  assert.equal(await puntos(p), 460);
  await siguiente(p);

  assert.equal(await p.textContent('#total'), '460');
  assert.equal(await p.textContent('#maximo'), '600');
  assert.ok(await p.isVisible('#final'));
  assert.deepEqual(errores, []);
  await cerrar();
});

test('sin fallos en móvil: 600 puntos, sin desborde, el código se conserva al recargar', async () => {
  const { pagina: p, errores, cerrar } = await nuevaPagina(navegador, { width: 375, height: 812 });
  await p.goto(urlDe(RUTA));
  await sinDesbordeHorizontal(p, 'reto 1');
  await captura(p, 'recuento-movil-reto1');

  await p.fill('#editor', SOLUCIONES.contar);
  await p.reload();
  assert.equal(await p.inputValue('#editor'), SOLUCIONES.contar, 'Se perdió el código al recargar');

  await ejecutar(p, 'exito');
  await sinDesbordeHorizontal(p, 'resultados reto 1');
  await siguiente(p);
  await predecir(p, [6, 4, 3], 'exito');
  await sinDesbordeHorizontal(p, 'reto 2');
  await siguiente(p);
  await sinDesbordeHorizontal(p, 'reto 3');
  await captura(p, 'recuento-movil-reto3');
  await escribir(p, SOLUCIONES.ventas, 'exito');
  await sinDesbordeHorizontal(p, 'resultados reto 3');
  await siguiente(p);
  await escribir(p, SOLUCIONES.frecuente, 'exito');
  await siguiente(p);
  await escribir(p, SOLUCIONES.valiosos, 'exito');
  await siguiente(p);
  await escribir(p, SOLUCIONES.unico, 'exito');
  await siguiente(p);

  assert.equal(await p.textContent('#total'), '600');
  await sinDesbordeHorizontal(p, 'final');
  await p.click('#reiniciar');
  assert.equal(await puntos(p), 0);
  assert.match(await p.inputValue('#editor'), /Escribe tu solución/, 'Reiniciar no limpió el código');
  assert.deepEqual(errores, []);
  await cerrar();
});

test('el editor indenta con Tab y Enter, y no hay opción múltiple ni relleno', async () => {
  const { pagina: p, errores, cerrar } = await nuevaPagina(navegador);
  await p.goto(urlDe(RUTA));
  await p.fill('#editor', '');
  await p.focus('#editor');
  await p.keyboard.type('def f():');
  await p.keyboard.press('Enter');
  await p.keyboard.type('return 1');
  await p.keyboard.press('Enter');
  await p.keyboard.type('x');
  assert.equal(await p.inputValue('#editor'), 'def f():\n    return 1\n    x');
  await p.fill('#editor', '');
  await p.keyboard.press('Tab');
  assert.equal(await p.inputValue('#editor'), '    ');
  await p.keyboard.press('Escape');
  await p.keyboard.press('Tab');
  assert.notEqual(await p.evaluate(() => document.activeElement.id), 'editor', 'El editor atrapa el foco');

  const texto = await p.locator('body').innerText();
  assert.doesNotMatch(texto, /lorem ipsum|placeholder/i);
  assert.equal(await p.locator('input[type="radio"]').count(), 0);
  assert.deepEqual(errores, []);
  await cerrar();
});
