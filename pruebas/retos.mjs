// Acciones para jugar los retos construidos con el kit.
export const puntos = async (p) => Number(await p.textContent('#puntos'));
export const feedback = async (p) => (await p.textContent('#feedback')).trim();

// El contador de intentos o el mensaje cambian en cada respuesta: se espera a que cambie.
export async function ejecutar(p, tipo) {
  const previo = await feedback(p);
  await p.click('#ejecutar');
  await p.waitForFunction(
    ([t, antes]) => {
      const f = document.getElementById('feedback');
      return f.dataset.tipo === t && f.textContent.trim() !== antes;
    },
    [tipo, previo],
    { timeout: 15000 }
  );
  return feedback(p);
}

export async function escribir(p, codigo, tipo) {
  await p.fill('#editor', codigo);
  return ejecutar(p, tipo);
}

export async function predecir(p, valores, tipo) {
  for (const [n, valor] of valores.entries()) await p.fill(`[data-respuesta="${n}"]`, String(valor));
  return ejecutar(p, tipo);
}

export const siguiente = (p) => p.click('#siguiente');
