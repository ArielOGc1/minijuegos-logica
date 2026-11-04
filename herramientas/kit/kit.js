// Motor del juego: pinta los retos de window.JUEGO, los ejecuta y da puntos y pistas.
(() => {
  const JUEGO = window.JUEGO;
  const RETOS = JUEGO.retos;
  const PUNTOS_RETO = 100;
  const PENALIZACION = 20;
  const PUNTOS_MINIMOS = 40;
  // Código válido en Python normal que MicroPython no implementa: no debe penalizar.
  const LIMITES_PYTHON = /NotImplementedError|ImportError|AttributeError: (module|'(str|list|dict|set|tuple|int|float)' object)/;
  const $ = (id) => document.getElementById(id);
  const estado = { indice: 0, puntos: 0, fallos: 0, ocupado: false, resuelto: false };

  function guardar(clave, valor) {
    try {
      if (valor === null) localStorage.removeItem(clave);
      else localStorage.setItem(clave, valor);
    } catch (e) { /* sin almacenamiento: el juego funciona igual */ }
  }

  function leer(clave) {
    try { return localStorage.getItem(clave); } catch (e) { return null; }
  }

  const claveCodigo = (n) => `minijuegos-logica:${JUEGO.id}:reto${n}`;
  const claveMejor = () => `minijuegos-logica:${JUEGO.id}:mejor`;

  function crear(etiqueta, propiedades, hijos) {
    const nodo = document.createElement(etiqueta);
    Object.assign(nodo, propiedades || {});
    (hijos || []).forEach((hijo) => nodo.append(hijo));
    return nodo;
  }

  // Convierte `así` en <code>: los enunciados no llevan HTML.
  function conCodigo(texto) {
    return texto.split(/`([^`]+)`/).map((parte, i) => (i % 2 ? crear('code', { textContent: parte }) : parte));
  }

  function reprPython(v) {
    if (v === null || v === undefined) return 'None';
    if (v === true) return 'True';
    if (v === false) return 'False';
    if (typeof v === 'string') return `'${v}'`;
    if (Array.isArray(v)) return `[${v.map(reprPython).join(', ')}]`;
    if (typeof v === 'object') {
      return `{${Object.keys(v).map((k) => `'${k}': ${reprPython(v[k])}`).join(', ')}}`;
    }
    return String(v);
  }

  function literalSql(v) {
    if (v === null) return 'NULL';
    if (typeof v === 'number') return String(v);
    return `'${String(v).replaceAll("'", "''")}'`;
  }

  function prepararDatos(tablas) {
    return tablas.map((t) => {
      const filas = t.filas.map((f) => `(${f.map(literalSql).join(', ')})`).join(', ');
      return `CREATE TABLE ${t.nombre} (${t.columnas.join(', ')});`
        + (filas ? ` INSERT INTO ${t.nombre} VALUES ${filas};` : '');
    }).join(' ');
  }

  function tablaHtml(columnas, filas, titulo) {
    const celda = (v) => crear('td', {
      textContent: v === null ? 'NULL' : String(v),
      className: v === null ? 'nulo' : ''
    });
    const tabla = crear('table', {}, [
      crear('thead', {}, [crear('tr', {}, columnas.map((c) => crear('th', { textContent: c })))]),
      crear('tbody', {}, filas.map((f) => crear('tr', {}, f.map(celda))))
    ]);
    return crear('figure', { className: 'datos' }, [
      crear('figcaption', { textContent: titulo }),
      crear('div', { className: 'desplazable', tabIndex: 0 }, [tabla])
    ]);
  }

  const valorActual = () => Math.max(PUNTOS_MINIMOS, PUNTOS_RETO - estado.fallos * PENALIZACION);

  function pintarMarcador() {
    $('puntos').textContent = String(estado.puntos);
    $('texto-progreso').textContent = `Reto ${Math.min(estado.indice + 1, RETOS.length)} de ${RETOS.length}`;
    $('progreso').replaceChildren(...RETOS.map((_, n) => crear('li', {
      className: n < estado.indice ? 'hecho' : n === estado.indice ? 'actual' : ''
    })));
    $('valor').textContent = `Este reto vale ahora ${valorActual()} puntos.`;
  }

  function mostrarFeedback(tipo, titulo, texto) {
    const caja = $('feedback');
    caja.dataset.tipo = tipo;
    caja.replaceChildren(crear('div', { className: 'aviso' }, [
      crear('strong', { textContent: titulo }),
      crear('p', {}, conCodigo(texto))
    ]));
  }

  function limpiarResultados() {
    $('resultados').replaceChildren();
    delete $('feedback').dataset.tipo;
    $('feedback').replaceChildren();
  }

  function pintarEditor(reto) {
    const editor = $('editor');
    editor.value = leer(claveCodigo(estado.indice)) ?? reto.inicial;
    editor.readOnly = false;
    $('zona-editor').hidden = false;
    $('zona-prediccion').hidden = true;
    $('nota-python').hidden = reto.tipo !== 'python';
    $('etiqueta-editor').textContent = reto.tipo === 'python' ? 'Tu código en Python' : 'Tu consulta SQL';
  }

  function pintarPrediccion(reto) {
    $('zona-editor').hidden = true;
    $('nota-python').hidden = true;
    $('zona-prediccion').hidden = false;
    $('consulta-fija').textContent = reto.consulta;
    $('respuestas').replaceChildren(...reto.columnas.map((columna, n) => {
      const id = `respuesta-${n}`;
      const entrada = crear('input', { type: 'text', inputMode: 'decimal', id, autocomplete: 'off' });
      entrada.dataset.respuesta = String(n);
      return crear('div', { className: 'respuesta' }, [
        crear('label', { htmlFor: id, textContent: columna }),
        entrada
      ]);
    }));
  }

  function pintarReto() {
    const reto = RETOS[estado.indice];
    estado.fallos = 0;
    estado.resuelto = false;
    limpiarResultados();
    $('lenguaje').textContent = reto.tipo === 'python' ? 'Python' : 'SQL';
    $('titulo-reto').textContent = reto.titulo;
    $('enunciado').replaceChildren(...conCodigo(reto.enunciado));
    $('siguiente').hidden = true;
    $('ejecutar').hidden = false;
    $('ejecutar').textContent = reto.tipo === 'predecir-sql' ? 'Comprobar' : 'Ejecutar pruebas';

    const datos = $('datos');
    datos.replaceChildren();
    if (reto.tablas) {
      reto.tablas.forEach((t) => datos.append(tablaHtml(t.columnas, t.filas, `Tabla ${t.nombre}`)));
    }
    if (reto.esperado) {
      datos.append(tablaHtml(reto.esperado.columnas, reto.esperado.filas, 'Resultado esperado con estos datos'));
    }
    if (reto.tipo === 'python') {
      datos.append(crear('ul', { className: 'ejemplos' }, reto.casos.filter((c) => !c.oculto).map((c) => crear('li', {}, [
        crear('code', { textContent: `${reto.funcion}(${c.args.map(reprPython).join(', ')})` }),
        ' devuelve ',
        crear('code', { textContent: reprPython(c.esperado) })
      ]))));
    }

    if (reto.tipo === 'predecir-sql') pintarPrediccion(reto);
    else pintarEditor(reto);
    pintarMarcador();
  }

  function registrarFallo(diagnostico) {
    const reto = RETOS[estado.indice];
    estado.fallos += 1;
    const n = Math.min(estado.fallos, reto.pistas.length);
    mostrarFeedback('pista', `Intento ${estado.fallos} sin acertar. Pista ${n} de ${reto.pistas.length}:`,
      (diagnostico ? `${diagnostico} ` : '') + reto.pistas[n - 1]);
    pintarMarcador();
  }

  function registrarAcierto() {
    const reto = RETOS[estado.indice];
    const ganados = valorActual();
    estado.puntos += ganados;
    estado.resuelto = true;
    $('puntos').textContent = String(estado.puntos);
    $('valor').textContent = '';
    mostrarFeedback('exito', `¡Correcto! Has ganado ${ganados} puntos.`, reto.exito);
    $('ejecutar').hidden = true;
    $('siguiente').hidden = false;
    $('siguiente').textContent = estado.indice === RETOS.length - 1 ? 'Ver resultado' : 'Siguiente reto';
    $('siguiente').focus();
  }

  const avisoTiempo = () => mostrarFeedback('aviso', 'Tardó demasiado',
    'Se detuvo tras 5 segundos. Revisa si tienes un bucle que nunca termina. Esto no te resta puntos.');

  async function comprobarPython(reto, codigo) {
    const r = await Motor.python({ codigo, funcion: reto.funcion, casos: reto.casos });
    if (r.estado === 'tiempo') return avisoTiempo();
    if (r.estado === 'error') {
      return mostrarFeedback('aviso', 'Tu código no se pudo ejecutar', `${r.mensaje} Esto no te resta puntos.`);
    }
    const limite = r.resultados.find((c) => c.error && LIMITES_PYTHON.test(c.error));
    if (limite) {
      return mostrarFeedback('aviso', 'Este Python ligero no lo admite',
        `Tu idea puede ser correcta, pero el motor del navegador no incluye esa operación (${limite.error}). Escríbela de otra forma. Esto no te resta puntos.`);
    }
    const lista = crear('ul', { className: 'casos' }, r.resultados.map((c) => {
      const llamada = `${reto.funcion}(${c.args.map(reprPython).join(', ')})`;
      const hijos = [crear('code', { textContent: llamada })];
      if (c.oculto) hijos.unshift(crear('span', { className: 'marca-oculto', textContent: 'Caso oculto: ' }));
      if (!c.ok) {
        const obtenido = c.error ? `error: ${c.error}` : c.sinResultado ? 'sin resultado' : reprPython(c.obtenido);
        hijos.push(crear('div', { className: 'detalle', textContent: `Esperado: ${reprPython(c.esperado)}. Obtenido: ${obtenido}.` }));
      }
      const li = crear('li', { className: c.ok ? 'caso ok' : 'caso mal' }, hijos);
      li.setAttribute('aria-label', c.ok ? 'Caso correcto' : 'Caso con fallo');
      return li;
    }));
    $('resultados').replaceChildren(lista);
    if (r.impresos.length) {
      $('resultados').append(tablaImpresos(r.impresos));
    }
    const aciertos = r.resultados.filter((c) => c.ok).length;
    if (aciertos === r.resultados.length) return registrarAcierto();
    return registrarFallo(`Pasaron ${aciertos} de ${r.resultados.length} casos.`);
  }

  function tablaImpresos(lineas) {
    return crear('figure', { className: 'datos' }, [
      crear('figcaption', { textContent: 'Lo que imprimió tu código' }),
      crear('pre', { className: 'impresos', textContent: lineas.join('\n') })
    ]);
  }

  function filasIguales(obtenidas, esperadas, conOrden) {
    const normalizar = (filas) => {
      const texto = filas.map((f) => JSON.stringify(f.map((v) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v))));
      return conOrden ? texto : texto.slice().sort();
    };
    return JSON.stringify(normalizar(obtenidas)) === JSON.stringify(normalizar(esperadas));
  }

  async function comprobarSql(reto, consulta) {
    const datos = [prepararDatos(reto.tablas), prepararDatos(reto.tablasOcultas)];
    const r = await Motor.sql({ datos, consulta });
    if (r.estado === 'tiempo') return avisoTiempo();
    if (r.estado === 'error') {
      return mostrarFeedback('aviso', 'La consulta no se pudo ejecutar', `${r.mensaje} Esto no te resta puntos.`);
    }
    const [visible, oculto] = r.resultados;
    $('resultados').replaceChildren(tablaHtml(visible.columnas, visible.filas, 'Tu resultado con estos datos'));
    const anchoEsperado = reto.esperado.columnas.length;
    if (visible.columnas.length !== anchoEsperado) {
      return registrarFallo(`Tu resultado tiene ${visible.columnas.length} columnas y se esperaban ${anchoEsperado}.`);
    }
    if (!filasIguales(visible.filas, reto.esperado.filas, reto.conOrden)) {
      return registrarFallo('Tu resultado no coincide con el esperado: revisa las filas, los valores y el orden.');
    }
    if (!filasIguales(oculto.filas, reto.esperadoOculto, reto.conOrden)) {
      return registrarFallo('Coincide con estos datos, pero falla con otra tabla de prueba. La consulta debe calcular el resultado, no depender de estas filas.');
    }
    return registrarAcierto();
  }

  async function comprobarPrediccion(reto) {
    const entradas = [...document.querySelectorAll('[data-respuesta]')];
    const vacia = entradas.find((e) => !e.value.trim());
    if (vacia) {
      vacia.focus();
      return mostrarFeedback('aviso', 'Falta una respuesta', 'Rellena cada casilla antes de comprobar. Esto no te resta puntos.');
    }
    const r = await Motor.sql({ datos: [prepararDatos(reto.tablas)], consulta: reto.consulta });
    if (r.estado !== 'ok') {
      return mostrarFeedback('aviso', 'No se pudo comprobar', 'El motor no respondió. Vuelve a intentarlo. Esto no te resta puntos.');
    }
    const fila = r.resultados[0].filas[0];
    let aciertos = 0;
    entradas.forEach((entrada, n) => {
      const bien = entrada.value.trim() === String(fila[n]);
      entrada.classList.toggle('bien', bien);
      entrada.classList.toggle('mal', !bien);
      if (bien) aciertos += 1;
    });
    if (aciertos === entradas.length) return registrarAcierto();
    return registrarFallo('Revisa las casillas en rojo.');
  }

  $('formulario').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (estado.ocupado || estado.resuelto) return;
    const reto = RETOS[estado.indice];
    const codigo = $('editor').value;
    if (reto.tipo !== 'predecir-sql') {
      if (!codigo.trim() || codigo.trim() === reto.inicial.trim()) {
        mostrarFeedback('aviso', 'Aún no has escrito tu solución', 'Escribe tu código en el editor antes de ejecutarlo. Esto no te resta puntos.');
        $('editor').focus();
        return;
      }
    }
    estado.ocupado = true;
    $('ejecutar').disabled = true;
    const textoBoton = $('ejecutar').textContent;
    $('ejecutar').textContent = 'Ejecutando…';
    try {
      if (reto.tipo === 'python') await comprobarPython(reto, codigo);
      else if (reto.tipo === 'sql') await comprobarSql(reto, codigo);
      else await comprobarPrediccion(reto);
    } finally {
      estado.ocupado = false;
      $('ejecutar').disabled = false;
      $('ejecutar').textContent = textoBoton;
    }
  });

  // Tab inserta espacios y Enter conserva la indentación. Escape libera el foco para seguir con el teclado.
  let tabLibre = false;
  $('editor').addEventListener('keydown', (e) => {
    const area = e.target;
    const insertar = (texto) => {
      area.setRangeText(texto, area.selectionStart, area.selectionEnd, 'end');
      area.dispatchEvent(new Event('input'));
    };
    if (e.key === 'Escape') { tabLibre = true; return; }
    if (e.key === 'Tab' && !e.shiftKey && !tabLibre) {
      e.preventDefault();
      insertar('    ');
    } else if (e.key === 'Enter' && RETOS[estado.indice].tipo === 'python') {
      const inicio = area.value.lastIndexOf('\n', area.selectionStart - 1) + 1;
      const linea = area.value.slice(inicio, area.selectionStart);
      const sangria = linea.match(/^\s*/)[0];
      e.preventDefault();
      insertar(`\n${sangria}${linea.trimEnd().endsWith(':') ? '    ' : ''}`);
    }
  });
  $('editor').addEventListener('blur', () => { tabLibre = false; });
  $('editor').addEventListener('input', () => guardar(claveCodigo(estado.indice), $('editor').value));

  function mostrarFinal() {
    const anterior = Number(leer(claveMejor())) || 0;
    const mejor = Math.max(anterior, estado.puntos);
    guardar(claveMejor(), String(mejor));
    $('juego').hidden = true;
    $('final').hidden = false;
    $('total').textContent = String(estado.puntos);
    $('maximo').textContent = String(RETOS.length * PUNTOS_RETO);
    $('mejor').textContent = estado.puntos > anterior && anterior > 0
      ? 'Es tu nuevo récord.'
      : anterior > 0 ? `Tu récord es de ${mejor} puntos.` : '';
    $('texto-progreso').textContent = 'Retos completados';
    [...$('progreso').children].forEach((li) => { li.className = 'hecho'; });
    $('reiniciar').focus();
  }

  $('siguiente').addEventListener('click', () => {
    estado.indice += 1;
    if (estado.indice >= RETOS.length) return mostrarFinal();
    pintarReto();
    window.scrollTo({ top: $('juego').offsetTop - 60 });
    const primero = document.querySelector('#zona-prediccion:not([hidden]) input, #zona-editor:not([hidden]) textarea');
    if (primero) primero.focus({ preventScroll: true });
    return undefined;
  });

  $('reiniciar').addEventListener('click', () => {
    RETOS.forEach((_, n) => guardar(claveCodigo(n), null));
    estado.indice = 0;
    estado.puntos = 0;
    $('final').hidden = true;
    $('juego').hidden = false;
    pintarReto();
  });

  $('explicacion').replaceChildren(...conCodigo(JUEGO.explicacion));
  pintarReto();
})();
