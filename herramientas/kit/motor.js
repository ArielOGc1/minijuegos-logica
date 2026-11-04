// Ejecuta Python (MicroPython) y SQL (SQLite) en un worker con límite de tiempo.
// Cada ejecución arranca un worker nuevo: un bucle infinito no bloquea la página.
const Motor = (() => {
  const TIEMPO_MAXIMO = 5000;
  const MARCA = '\u001e';

  function decodificar(id) {
    const binario = atob(document.getElementById(id).textContent.trim());
    const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function trabajadorPython() {
    self.onmessage = async (e) => {
      const lineas = [];
      try {
        const mp = await loadMicroPython({
          url: 'data:application/wasm;base64,' + e.data.wasm,
          stdout: (l) => lineas.push(l),
          stderr: (l) => lineas.push(l),
          linebuffer: true,
          heapsize: 16 * 1024 * 1024,
          pystack: 64 * 1024
        });
        mp.runPython(e.data.codigo);
        self.postMessage({ ok: true, lineas });
      } catch (err) {
        self.postMessage({ ok: false, error: String(err.message || err), lineas });
      }
    };
  }

  function trabajadorSql() {
    self.onmessage = async (e) => {
      try {
        const SQL = await initSqlJs();
        const resultados = e.data.datos.map((preparacion) => {
          const bd = new SQL.Database();
          bd.run(preparacion);
          const salida = bd.exec(e.data.consulta);
          bd.close();
          const ultimo = salida[salida.length - 1];
          return ultimo ? { columnas: ultimo.columns, filas: ultimo.values } : { columnas: [], filas: [] };
        });
        self.postMessage({ ok: true, resultados });
      } catch (err) {
        self.postMessage({ ok: false, error: String(err.message || err) });
      }
    };
  }

  function lanzar(fuente, mensaje) {
    return new Promise((resolver) => {
      const url = URL.createObjectURL(new Blob([fuente], { type: 'text/javascript' }));
      const trabajador = new Worker(url);
      const terminar = (valor) => {
        clearTimeout(reloj);
        trabajador.terminate();
        URL.revokeObjectURL(url);
        resolver(valor);
      };
      const reloj = setTimeout(() => terminar({ agotado: true }), TIEMPO_MAXIMO);
      trabajador.onmessage = (e) => terminar(e.data);
      trabajador.onerror = (e) => terminar({ ok: false, error: e.message || 'No se pudo iniciar el motor' });
      trabajador.postMessage(mensaje);
    });
  }

  function armarPython(codigo, funcion, casos) {
    return codigo + '\n\n' + [
      'import json as __j',
      `__casos = __j.loads(${JSON.stringify(JSON.stringify(casos.map((c) => c.args)))})`,
      'for __i in range(len(__casos)):',
      '    try:',
      `        __r = ${funcion}(*__casos[__i])`,
      '        print("\\x1e" + __j.dumps({"i": __i, "r": __r}))',
      '    except Exception as __e:',
      '        print("\\x1e" + __j.dumps({"i": __i, "e": type(__e).__name__ + ": " + str(__e)}))'
    ].join('\n');
  }

  function explicarErrorPython(texto, totalLineas) {
    const lineas = texto.trim().split('\n');
    const ultima = lineas[lineas.length - 1];
    const ubicaciones = [...texto.matchAll(/line (\d+)/g)].map((m) => Number(m[1]));
    const enCodigo = ubicaciones.filter((n) => n <= totalLineas).pop();
    const donde = enCodigo ? `Línea ${enCodigo}: ` : '';
    if (/IndentationError|unexpected indent|expected an indented/.test(ultima)) return `${donde}la indentación no es correcta. Revisa los espacios al inicio de la línea.`;
    if (/SyntaxError/.test(ultima)) return `${donde}hay un error de sintaxis. Revisa los dos puntos, los paréntesis y las comillas.`;
    if (/ImportError|no module named|can't import name/.test(ultima)) return `${donde}esa librería no está disponible en este Python ligero. Resuélvelo con listas y diccionarios. (${ultima})`;
    if (/NameError/.test(ultima)) return `${donde}usas un nombre que no existe todavía. (${ultima})`;
    return `${donde}${ultima}`;
  }

  async function python({ codigo, funcion, casos }) {
    const fuente = decodificar('motor-python-js') + `\n(${trabajadorPython})();`;
    const wasm = document.getElementById('motor-python-wasm').textContent.trim();
    const respuesta = await lanzar(fuente, { codigo: armarPython(codigo, funcion, casos), wasm });
    if (respuesta.agotado) return { estado: 'tiempo' };
    if (!respuesta.ok) {
      return { estado: 'error', mensaje: explicarErrorPython(respuesta.error, codigo.split('\n').length) };
    }
    const impresos = respuesta.lineas.filter((l) => !l.includes(MARCA));
    const resultados = casos.map((caso) => ({ ...caso, ok: false, sinResultado: true }));
    respuesta.lineas.filter((l) => l.includes(MARCA)).forEach((linea) => {
      const dato = JSON.parse(linea.slice(linea.indexOf(MARCA) + 1));
      const caso = resultados[dato.i];
      caso.sinResultado = false;
      if (dato.e) {
        caso.error = dato.e;
      } else {
        caso.obtenido = dato.r;
        caso.ok = iguales(dato.r, caso.esperado);
      }
    });
    return { estado: 'ok', resultados, impresos };
  }

  function explicarErrorSql(texto) {
    const columna = texto.match(/no such column: (.+)/);
    if (columna) return `La columna ${columna[1]} no existe en esta tabla.`;
    const tabla = texto.match(/no such table: (.+)/);
    if (tabla) return `La tabla ${tabla[1]} no existe.`;
    const cerca = texto.match(/near "(.*)": syntax error/);
    if (cerca) return `Hay un error de sintaxis cerca de «${cerca[1]}».`;
    if (/incomplete input/.test(texto)) return 'La consulta está incompleta.';
    if (/misuse of aggregate/.test(texto)) return 'Usas una función como COUNT o SUM donde no se permite. Las condiciones sobre grupos van en HAVING.';
    return texto;
  }

  async function sql({ datos, consulta }) {
    const fuente = decodificar('motor-sql-js') + `\n(${trabajadorSql})();`;
    const respuesta = await lanzar(fuente, { datos, consulta });
    if (respuesta.agotado) return { estado: 'tiempo' };
    if (!respuesta.ok) return { estado: 'error', mensaje: explicarErrorSql(respuesta.error) };
    return { estado: 'ok', resultados: respuesta.resultados };
  }

  function iguales(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-6;
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return a === b;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) return a.length === b.length && a.every((v, i) => iguales(v, b[i]));
    const claves = Object.keys(a);
    return claves.length === Object.keys(b).length
      && claves.every((k) => Object.prototype.hasOwnProperty.call(b, k) && iguales(a[k], b[k]));
  }

  return { python, sql, iguales };
})();
