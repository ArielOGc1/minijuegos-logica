export default {
  numero: 3,
  id: 'busqueda-diccionarios',
  titulo: 'Los repetidos',
  concepto: 'Búsqueda con diccionarios y duplicados',
  descripcion: 'Ejercicios de Python y SQL para buscar con diccionarios y detectar datos duplicados, con pistas y solución.',
  explicacion: 'Buscar en una lista obliga a recorrerla entera, pero un diccionario o un conjunto encuentra un valor casi al instante. Esa diferencia convierte muchos problemas de dos bucles en uno solo, y es la misma idea que hay detrás de detectar duplicados en una tabla con `GROUP BY` y `HAVING`.',
  ejercicios: [
    {
      tipo: 'python',
      titulo: 'Identificadores repetidos',
      enunciado: 'Escribe `tiene_duplicados` para que devuelva `True` si algún id aparece más de una vez y `False` si no. Los repetidos no tienen por qué estar seguidos.',
      funcion: 'tiene_duplicados',
      parametros: 'ids',
      casos: [
        { args: [[1, 2, 3, 1]], esperado: true },
        { args: [[1, 2, 3]], esperado: false },
        { args: [[]], esperado: false, extra: true },
        { args: [[7, 7]], esperado: true, extra: true },
        { args: [[1, 2, 1]], esperado: true, extra: true }
      ],
      pistas: [
        'Recorre los ids una vez y recuerda los que ya has visto.',
        'Un conjunto es la estructura adecuada para preguntar si ya viste un valor.',
        'Antes de añadir cada id, comprueba si ya está en el conjunto. Si está, ya tienes la respuesta.'
      ],
      solucion: 'def tiene_duplicados(ids):\n    vistos = set()\n    for i in ids:\n        if i in vistos:\n            return True\n        vistos.add(i)\n    return False',
      incorrecta: 'def tiene_duplicados(ids):\n    for i in range(len(ids) - 1):\n        if ids[i] == ids[i + 1]:\n            return True\n    return False',
      explicacion: 'Cada consulta al conjunto es casi inmediata, así que el tiempo crece en proporción a la lista. También valdría `len(set(ids)) != len(ids)`, aunque esa versión no se detiene al encontrar el primer repetido.'
    },
    {
      tipo: 'sql',
      titulo: 'Correos repetidos',
      enunciado: 'Obtén los correos que aparecen más de una vez y cuántas veces lo hacen. Las filas sin correo no cuentan. Ordena por veces de mayor a menor y, si hay empate, por correo.',
      tablas: [{
        nombre: 'usuarios',
        columnas: ['id', 'email'],
        filas: [
          [1, 'ana@correo.ec'], [2, 'luis@correo.ec'], [3, 'ana@correo.ec'], [4, 'sol@correo.ec'],
          [5, 'luis@correo.ec'], [6, 'ana@correo.ec'], [7, null], [8, null]
        ]
      }],
      esperado: { columnas: ['email', 'veces'], filas: [['ana@correo.ec', 3], ['luis@correo.ec', 2]] },
      tablasExtra: [{
        nombre: 'usuarios',
        columnas: ['id', 'email'],
        filas: [[1, 'b@correo.ec'], [2, 'a@correo.ec'], [3, 'b@correo.ec'], [4, 'a@correo.ec'], [5, 'c@correo.ec'], [6, null], [7, null]]
      }],
      esperadoExtra: [['a@correo.ec', 2], ['b@correo.ec', 2]],
      conOrden: true,
      pistas: [
        'Agrupa por correo y cuenta las filas de cada grupo.',
        'Una condición sobre el conteo de un grupo no puede ir en `WHERE`.',
        '`GROUP BY` reúne todos los NULL en un mismo grupo: tienes que descartarlos antes de agrupar.'
      ],
      solucion: "SELECT email, COUNT(*) AS veces\nFROM usuarios\nWHERE email IS NOT NULL\nGROUP BY email\nHAVING COUNT(*) > 1\nORDER BY veces DESC, email;",
      incorrecta: 'SELECT email, COUNT(*) AS veces\nFROM usuarios\nGROUP BY email\nHAVING COUNT(*) > 1\nORDER BY veces DESC, email;',
      explicacion: 'La trampa está en los NULL: sin el `WHERE`, aparecen como un grupo más con dos filas. `WHERE` actúa sobre filas antes de agrupar y `HAVING` sobre los grupos ya formados.'
    },
    {
      tipo: 'python',
      titulo: 'Dos importes que suman el total',
      enunciado: 'Recibes una lista de importes y un objetivo. Escribe `indices_suma` para que devuelva `[i, j]`, con `i < j`, los índices de los dos importes que suman el objetivo. Hay como mucho una pareja válida. Si no existe, devuelve `[]`. Un importe no se puede usar dos veces.',
      funcion: 'indices_suma',
      parametros: 'importes, objetivo',
      casos: [
        { args: [[2, 7, 11, 15], 9], esperado: [0, 1] },
        { args: [[3, 2, 4], 6], esperado: [1, 2] },
        { args: [[1, 2], 10], esperado: [] },
        { args: [[3, 3], 6], esperado: [0, 1], extra: true },
        { args: [[-1, 5, 3], 2], esperado: [0, 2], extra: true },
        { args: [[0, 4, 3, 0], 0], esperado: [0, 3], extra: true },
        { args: [[], 5], esperado: [], extra: true }
      ],
      pistas: [
        'Con dos bucles funciona, pero intenta resolverlo recorriendo la lista una sola vez.',
        'Para cada importe, ya sabes exactamente qué otro valor necesitas para llegar al objetivo.',
        'Guarda en un diccionario los importes ya vistos junto con su índice, y consúltalo antes de guardar el importe actual.'
      ],
      solucion: 'def indices_suma(importes, objetivo):\n    vistos = {}\n    for j, importe in enumerate(importes):\n        falta = objetivo - importe\n        if falta in vistos:\n            return [vistos[falta], j]\n        vistos[importe] = j\n    return []',
      incorrecta: 'def indices_suma(importes, objetivo):\n    posiciones = {}\n    for i, importe in enumerate(importes):\n        posiciones[importe] = i\n    for i, importe in enumerate(importes):\n        falta = objetivo - importe\n        if falta in posiciones:\n            return [i, posiciones[falta]]\n    return []',
      explicacion: 'Consultar antes de guardar evita usar el mismo importe dos veces y resuelve los valores repetidos, como en `[3, 3]`. Así se pasa de comparar todas las parejas a un único recorrido.'
    },
    {
      tipo: 'sql',
      titulo: 'Pedidos registrados dos veces',
      enunciado: 'Un pedido está duplicado si coinciden el cliente, el producto y la fecha. Obtén esas combinaciones y cuántas copias tiene cada una. Ordena por cliente, producto y fecha.',
      tablas: [{
        nombre: 'pedidos',
        columnas: ['id', 'cliente', 'producto', 'fecha'],
        filas: [
          [1, 'Ana', 'teclado', '2026-10-01'], [2, 'Ana', 'teclado', '2026-10-01'], [3, 'Ana', 'teclado', '2026-10-02'],
          [4, 'Luis', 'ratón', '2026-10-01'], [5, 'Luis', 'ratón', '2026-10-01'], [6, 'Luis', 'ratón', '2026-10-01'],
          [7, 'Marta', 'monitor', '2026-10-03']
        ]
      }],
      esperado: {
        columnas: ['cliente', 'producto', 'fecha', 'copias'],
        filas: [['Ana', 'teclado', '2026-10-01', 2], ['Luis', 'ratón', '2026-10-01', 3]]
      },
      tablasExtra: [{
        nombre: 'pedidos',
        columnas: ['id', 'cliente', 'producto', 'fecha'],
        filas: [
          [1, 'Eva', 'cable', '2026-09-01'], [2, 'Eva', 'funda', '2026-09-01'], [3, 'Iván', 'cable', '2026-09-01'],
          [4, 'Iván', 'cable', '2026-09-02'], [5, 'Noa', 'cable', '2026-09-05'], [6, 'Noa', 'cable', '2026-09-05']
        ]
      }],
      esperadoExtra: [['Noa', 'cable', '2026-09-05', 2]],
      conOrden: true,
      pistas: [
        'Lo que define un duplicado es la combinación completa, no una sola columna.',
        '`GROUP BY` admite varias columnas separadas por comas.',
        'Ana compró el mismo teclado dos días distintos: esas compras no deben sumarse en el mismo grupo.'
      ],
      solucion: 'SELECT cliente, producto, fecha, COUNT(*) AS copias\nFROM pedidos\nGROUP BY cliente, producto, fecha\nHAVING COUNT(*) > 1\nORDER BY cliente, producto, fecha;',
      incorrecta: 'SELECT cliente, producto, fecha, COUNT(*) AS copias\nFROM pedidos\nGROUP BY cliente, producto\nHAVING COUNT(*) > 1\nORDER BY cliente, producto, fecha;',
      explicacion: 'Esta es la forma habitual de auditar duplicados en una tabla. Ten cuidado: SQLite permite seleccionar columnas que no están en el `GROUP BY` y elige un valor cualquiera, mientras que otros motores lo rechazan.'
    },
    {
      tipo: 'python',
      titulo: 'El primero en repetirse',
      enunciado: 'Escribe `primer_repetido` para que devuelva el id cuya segunda aparición llega antes. Si ninguno se repite, devuelve `None`.',
      funcion: 'primer_repetido',
      parametros: 'ids',
      casos: [
        { args: [[1, 2, 3, 2, 1]], esperado: 2 },
        { args: [[5, 1, 5, 1]], esperado: 5 },
        { args: [[1, 2, 3]], esperado: null },
        { args: [[]], esperado: null, extra: true },
        { args: [[2, 2]], esperado: 2, extra: true },
        { args: [['a', 'b', 'c', 'b', 'a']], esperado: 'b', extra: true }
      ],
      pistas: [
        'Fíjate en el primer ejemplo: el 1 aparece antes, pero el 2 es el primero en volver a aparecer.',
        'Solo puedes detectar una repetición en el momento en que la encuentras al recorrer la lista.',
        'Es muy parecido al primer ejercicio: cambia únicamente lo que devuelves.'
      ],
      solucion: 'def primer_repetido(ids):\n    vistos = set()\n    for i in ids:\n        if i in vistos:\n            return i\n        vistos.add(i)\n    return None',
      incorrecta: 'def primer_repetido(ids):\n    for i in ids:\n        if ids.count(i) > 1:\n            return i\n    return None',
      explicacion: 'Contar con `ids.count` responde otra pregunta: cuál es el primer valor que tiene repetición. El conjunto detecta la repetición justo cuando ocurre, en orden de llegada.'
    },
    {
      tipo: 'sql',
      titulo: 'Usuarios con el mismo teléfono',
      enunciado: 'Encuentra las parejas de usuarios que comparten teléfono. Cada pareja debe salir una sola vez, con el usuario de id menor primero. Ordena por teléfono, id del primero e id del segundo.',
      tablas: [{
        nombre: 'usuarios',
        columnas: ['id', 'nombre', 'telefono'],
        filas: [
          [1, 'Ana', '099-01'], [2, 'Luis', '098-02'], [3, 'Marta', '099-01'], [4, 'Sol', null],
          [5, 'Iván', '098-02'], [6, 'Noa', '099-01'], [7, 'Leo', null], [8, 'Eva', '097-03']
        ]
      }],
      esperado: {
        columnas: ['nombre_1', 'nombre_2', 'telefono'],
        filas: [
          ['Luis', 'Iván', '098-02'], ['Ana', 'Marta', '099-01'], ['Ana', 'Noa', '099-01'], ['Marta', 'Noa', '099-01']
        ]
      },
      tablasExtra: [{
        nombre: 'usuarios',
        columnas: ['id', 'nombre', 'telefono'],
        filas: [[1, 'Rita', '111'], [2, 'Tito', '222'], [3, 'Uma', '111'], [4, 'Vera', null], [5, 'Xavi', null]]
      }],
      esperadoExtra: [['Rita', 'Uma', '111']],
      conOrden: true,
      pistas: [
        'Necesitas comparar cada fila con otras de la misma tabla: une la tabla consigo misma usando dos alias.',
        'Unir por teléfono igual también empareja a cada usuario consigo mismo y genera cada pareja dos veces.',
        'Una sola condición sobre los ids de los dos alias resuelve los dos problemas a la vez.'
      ],
      solucion: 'SELECT a.nombre AS nombre_1, b.nombre AS nombre_2, a.telefono\nFROM usuarios a\nJOIN usuarios b\n  ON a.telefono = b.telefono\n AND a.id < b.id\nORDER BY a.telefono, a.id, b.id;',
      incorrecta: 'SELECT a.nombre AS nombre_1, b.nombre AS nombre_2, a.telefono\nFROM usuarios a\nJOIN usuarios b\n  ON a.telefono = b.telefono\n AND a.id <> b.id\nORDER BY a.telefono, a.id, b.id;',
      explicacion: 'Con `a.id < b.id` nadie se empareja consigo mismo y cada pareja aparece una vez. Los NULL quedan fuera sin hacer nada, porque `NULL = NULL` no se considera verdadero en SQL.'
    }
  ]
};
