const ejercicios = [...document.querySelectorAll('.ejercicio')];

function leerHechos() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_ENTREGA)) || [];
  } catch (e) {
    return [];
  }
}

function guardarHechos(hechos) {
  try {
    localStorage.setItem(CLAVE_ENTREGA, JSON.stringify(hechos));
  } catch (e) { /* sin almacenamiento: el contador dura hasta recargar */ }
}

function pintarAvance() {
  const marcados = ejercicios.filter((e) => e.querySelector('.marcar').checked);
  document.getElementById('hechos').textContent = String(marcados.length);
  [...document.getElementById('progreso').children].forEach((caja, i) => {
    caja.classList.toggle('hecho', i < marcados.length);
  });
  guardarHechos(marcados.map((e) => e.dataset.ejercicio));
}

const iniciales = leerHechos();
ejercicios.forEach((ejercicio) => {
  const marcar = ejercicio.querySelector('.marcar');
  marcar.checked = iniciales.includes(ejercicio.dataset.ejercicio);
  marcar.addEventListener('change', pintarAvance);

  const boton = ejercicio.querySelector('.ver-pista');
  const pistas = [...ejercicio.querySelectorAll('.pistas li')];
  boton.addEventListener('click', () => {
    const siguiente = pistas.findIndex((p) => p.hidden);
    pistas[siguiente].hidden = false;
    if (siguiente + 1 < pistas.length) {
      boton.textContent = `Ver pista ${siguiente + 2} de ${pistas.length}`;
    } else {
      boton.textContent = 'No hay más pistas';
      boton.disabled = true;
    }
  });
});
pintarAvance();
