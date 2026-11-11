export default {
  numero: 5,
  id: 'cruzar-tablas',
  titulo: 'Las parejas',
  concepto: 'Cruzar tablas',
  descripcion: 'Ejercicios de Python y SQL para combinar registros de dos tablas, con INNER JOIN, LEFT JOIN y diccionarios como índice, con pistas y solución.',
  explicacion: 'Casi nunca tienes los datos en una sola tabla: los pedidos guardan el id del cliente y el nombre vive en otra parte, así que hay que cruzarlas por esa columna común. En Python, la forma rápida es construir primero un diccionario que vaya del id al registro y consultarlo en cada vuelta; en SQL lo hace `JOIN`. La pregunta clave siempre es qué hacer con las filas que no encuentran pareja: `INNER JOIN` las descarta y `LEFT JOIN` las conserva con NULL.',
  ejercicios: [
    {
      tipo: 'python',
      titulo: '¿De quién es el pedido?',
      enunciado: 'Escribe `nombres_de_pedidos` para que devuelva, en el orden de `pedidos`, el nombre del cliente de cada pedido. Cada pedido es un diccionario con `id` y `cliente_id`, y cada cliente uno con `id` y `nombre`. Si el cliente no existe, pon `"Desconocido"`.',
      funcion: 'nombres_de_pedidos',
      parametros: 'pedidos, clientes',
      casos: [
        {
          args: [
            [{ id: 10, cliente_id: 2 }, { id: 11, cliente_id: 1 }, { id: 12, cliente_id: 2 }],
            [{ id: 1, nombre: 'Ana' }, { id: 2, nombre: 'Luis' }, { id: 3, nombre: 'Sol' }]
          ],
          esperado: ['Luis', 'Ana', 'Luis']
        },
        {
          args: [[{ id: 20, cliente_id: 3 }, { id: 21, cliente_id: 9 }], [{ id: 3, nombre: 'Sol' }]],
          esperado: ['Sol', 'Desconocido']
        },
        { args: [[], [{ id: 1, nombre: 'Ana' }]], esperado: [], extra: true },
        { args: [[{ id: 1, cliente_id: 1 }], []], esperado: ['Desconocido'], extra: true },
        {
          args: [[{ id: 5, cliente_id: 7 }, { id: 6, cliente_id: 8 }], [{ id: 1, nombre: 'Uma' }]],
          esperado: ['Desconocido', 'Desconocido'],
          extra: true
        }
      ],
      pistas: [
        'Buscar el cliente recorriendo toda la lista en cada pedido funciona, pero repite el mismo trabajo una y otra vez.',
        'Prepara antes del bucle un diccionario cuya clave sea el id del cliente.',
        'Al consultar un diccionario puedes indicar un valor por defecto para cuando la clave no está; así no se cae ni se pierde el pedido.'
      ],
      solucion: "def nombres_de_pedidos(pedidos, clientes):\n    nombre_por_id = {c['id']: c['nombre'] for c in clientes}\n    return [nombre_por_id.get(p['cliente_id'], 'Desconocido') for p in pedidos]",
      incorrecta: "def nombres_de_pedidos(pedidos, clientes):\n    nombre_por_id = {c['id']: c['nombre'] for c in clientes}\n    return [nombre_por_id[p['cliente_id']] for p in pedidos if p['cliente_id'] in nombre_por_id]",
      explicacion: 'El diccionario se construye una vez y cada búsqueda es inmediata, en lugar de recorrer la lista de clientes por cada pedido. Filtrar los pedidos sin cliente parece limpio, pero cambia la longitud del resultado y ya no se sabe qué nombre corresponde a qué pedido; `get` con un valor por defecto conserva uno por pedido.'
    },
    {
      tipo: 'sql',
      titulo: 'Ventas con precio',
      enunciado: 'Para cada venta cuyo producto existe en el catálogo, muestra el id de la venta, el nombre del producto y el importe (`cantidad` por `precio`). Las ventas de productos que no están en el catálogo no salen. Ordena por id de venta.',
      tablas: [
        {
          nombre: 'productos',
          columnas: ['id', 'nombre', 'precio'],
          filas: [[1, 'Café', 3], [2, 'Té', 2], [3, 'Pan', 1]]
        },
        {
          nombre: 'ventas',
          columnas: ['id', 'producto_id', 'cantidad'],
          filas: [[1, 3, 4], [2, 1, 2], [3, 9, 5], [4, 2, 3]]
        }
      ],
      esperado: { columnas: ['venta', 'producto', 'importe'], filas: [[1, 'Pan', 4], [2, 'Café', 6], [4, 'Té', 6]] },
      tablasExtra: [
        {
          nombre: 'productos',
          columnas: ['id', 'nombre', 'precio'],
          filas: [[10, 'Leche', 2], [20, 'Queso', 5]]
        },
        {
          nombre: 'ventas',
          columnas: ['id', 'producto_id', 'cantidad'],
          filas: [[1, 20, 1], [2, 10, 3], [3, 30, 2]]
        }
      ],
      esperadoExtra: [[1, 'Queso', 5], [2, 'Leche', 6]],
      conOrden: true,
      pistas: [
        'Las dos tablas tienen una columna `id`, pero no significan lo mismo: ¿qué columna de `ventas` apunta a un producto?',
        'Como las ventas sin producto no deben salir, te sirve el cruce que solo conserva las filas con pareja en ambos lados.',
        'Pon un alias corto a cada tabla para dejar claro de cuál sale cada columna, en especial en el `ON` y en el `ORDER BY`.'
      ],
      solucion: 'SELECT v.id AS venta, p.nombre AS producto, v.cantidad * p.precio AS importe\nFROM ventas AS v\nJOIN productos AS p ON p.id = v.producto_id\nORDER BY v.id;',
      incorrecta: 'SELECT v.id AS venta, p.nombre AS producto, v.cantidad * p.precio AS importe\nFROM ventas AS v\nJOIN productos AS p ON p.id = v.id\nORDER BY v.id;',
      explicacion: '`JOIN` a secas es un `INNER JOIN`: la venta 3 apunta al producto 9, que no existe, y desaparece sola. La trampa es unir por `id` con `id`: la consulta no da error y devuelve filas con buena pinta, pero empareja cada venta con el producto que tiene su mismo número, no con el que vendió.'
    },
    {
      tipo: 'python',
      titulo: 'Clientes sin pedidos',
      enunciado: 'Escribe `sin_pedidos` para que devuelva los nombres de los clientes que no tienen ningún pedido, en el orden de `clientes`. Cada cliente tiene `id` y `nombre`, y cada pedido tiene `id` y `cliente_id`.',
      funcion: 'sin_pedidos',
      parametros: 'clientes, pedidos',
      casos: [
        {
          args: [
            [{ id: 1, nombre: 'Ana' }, { id: 2, nombre: 'Luis' }, { id: 3, nombre: 'Sol' }],
            [{ id: 1, cliente_id: 2 }, { id: 2, cliente_id: 2 }]
          ],
          esperado: ['Ana', 'Sol']
        },
        {
          args: [[{ id: 5, nombre: 'Rita' }, { id: 6, nombre: 'Tito' }], [{ id: 6, cliente_id: 5 }]],
          esperado: ['Tito']
        },
        { args: [[{ id: 1, nombre: 'Ana' }, { id: 2, nombre: 'Luis' }], []], esperado: ['Ana', 'Luis'], extra: true },
        { args: [[], [{ id: 1, cliente_id: 1 }]], esperado: [], extra: true },
        { args: [[{ id: 1, nombre: 'Uma' }], [{ id: 1, cliente_id: 99 }]], esperado: ['Uma'], extra: true }
      ],
      pistas: [
        'Primero reúne los ids de los clientes que sí compraron; no te importa cuántas veces compró cada uno.',
        'Fíjate bien en qué campo del pedido identifica al cliente: el pedido también tiene su propio `id`.',
        'Después recorre los clientes en orden y quédate con los que no están en ese conjunto.'
      ],
      solucion: "def sin_pedidos(clientes, pedidos):\n    con_pedido = {p['cliente_id'] for p in pedidos}\n    return [c['nombre'] for c in clientes if c['id'] not in con_pedido]",
      incorrecta: "def sin_pedidos(clientes, pedidos):\n    con_pedido = {p['id'] for p in pedidos}\n    return [c['nombre'] for c in clientes if c['id'] not in con_pedido]",
      explicacion: 'Un conjunto responde al instante si un id ya apareció, así que basta con dos pasadas. Es el equivalente en Python a buscar filas sin pareja. Confundir `id` con `cliente_id` es el error más común al cruzar datos, y suele pasar desapercibido cuando los números se parecen.'
    },
    {
      tipo: 'sql',
      titulo: 'Productos que nadie compró',
      enunciado: 'Muestra el nombre de los productos que no aparecen en ninguna venta, ordenados alfabéticamente. Ojo: alguna venta puede tener el `producto_id` vacío (NULL) por un error de carga.',
      tablas: [
        {
          nombre: 'productos',
          columnas: ['id', 'nombre'],
          filas: [[1, 'Café'], [2, 'Té'], [3, 'Pan'], [4, 'Agua']]
        },
        {
          nombre: 'ventas',
          columnas: ['id', 'producto_id', 'cantidad'],
          filas: [[1, 1, 2], [2, 3, 1], [3, 1, 5]]
        }
      ],
      esperado: { columnas: ['nombre'], filas: [['Agua'], ['Té']] },
      tablasExtra: [
        {
          nombre: 'productos',
          columnas: ['id', 'nombre'],
          filas: [[1, 'Leche'], [2, 'Miel'], [3, 'Arroz']]
        },
        {
          nombre: 'ventas',
          columnas: ['id', 'producto_id', 'cantidad'],
          filas: [[1, 2, 1], [2, null, 4]]
        }
      ],
      esperadoExtra: [['Arroz'], ['Leche']],
      conOrden: true,
      pistas: [
        'Necesitas un cruce que conserve todos los productos, aunque no tengan ninguna venta.',
        'Cuando un producto no encuentra pareja, las columnas de `ventas` llegan vacías en su fila.',
        'Nada es igual a NULL, ni siquiera otro NULL: para preguntar si un valor falta hay un operador propio.'
      ],
      solucion: 'SELECT p.nombre\nFROM productos AS p\nLEFT JOIN ventas AS v ON v.producto_id = p.id\nWHERE v.id IS NULL\nORDER BY p.nombre;',
      incorrecta: 'SELECT p.nombre\nFROM productos AS p\nLEFT JOIN ventas AS v ON v.producto_id = p.id\nWHERE v.id = NULL\nORDER BY p.nombre;',
      explicacion: '`LEFT JOIN` deja todos los productos y rellena con NULL las columnas de `ventas` cuando no hay pareja; el `WHERE` se queda justo con esas filas. `v.id = NULL` nunca es verdadero y devuelve una tabla vacía sin dar error. Otra trampa: `WHERE id NOT IN (SELECT producto_id FROM ventas)` tampoco devuelve nada en cuanto hay un `producto_id` NULL, y esto pasa en cualquier motor, no solo en SQLite.'
    },
    {
      tipo: 'python',
      titulo: 'Total por cliente',
      enunciado: 'Escribe `total_por_cliente` para que devuelva un diccionario que vaya del nombre de cada cliente a la suma de los importes de sus pedidos. Los clientes sin pedidos aparecen con `0`, y los pedidos de clientes que no existen se ignoran. Cada cliente tiene `id` y `nombre`, y cada pedido `cliente_id` e `importe`. No hay dos clientes con el mismo nombre.',
      funcion: 'total_por_cliente',
      parametros: 'clientes, pedidos',
      casos: [
        {
          args: [
            [{ id: 1, nombre: 'Ana' }, { id: 2, nombre: 'Luis' }, { id: 3, nombre: 'Sol' }],
            [{ cliente_id: 1, importe: 10 }, { cliente_id: 3, importe: 5 }, { cliente_id: 1, importe: 7 }]
          ],
          esperado: { Ana: 17, Luis: 0, Sol: 5 }
        },
        {
          args: [[{ id: 4, nombre: 'Rita' }], [{ cliente_id: 4, importe: 3 }, { cliente_id: 8, importe: 50 }]],
          esperado: { Rita: 3 }
        },
        { args: [[{ id: 1, nombre: 'Uma' }], []], esperado: { Uma: 0 }, extra: true },
        { args: [[], [{ cliente_id: 1, importe: 9 }]], esperado: {}, extra: true },
        {
          args: [
            [{ id: 7, nombre: 'Iván' }, { id: 2, nombre: 'Eva' }],
            [{ cliente_id: 2, importe: 4 }, { cliente_id: 2, importe: 6 }, { cliente_id: 5, importe: 1 }]
          ],
          esperado: { 'Iván': 0, Eva: 10 },
          extra: true
        }
      ],
      pistas: [
        'Si solo recorres los pedidos, los clientes que no compraron nunca llegan a aparecer en el resultado.',
        'Empieza con un acumulador que ya tenga a todos los clientes con total 0, usando su id como clave.',
        'Al sumar, comprueba que el cliente del pedido esté en el acumulador; al final, traduce cada id a su nombre.'
      ],
      solucion: "def total_por_cliente(clientes, pedidos):\n    totales = {c['id']: 0 for c in clientes}\n    for p in pedidos:\n        if p['cliente_id'] in totales:\n            totales[p['cliente_id']] += p['importe']\n    return {c['nombre']: totales[c['id']] for c in clientes}",
      incorrecta: "def total_por_cliente(clientes, pedidos):\n    nombres = {c['id']: c['nombre'] for c in clientes}\n    totales = {}\n    for p in pedidos:\n        if p['cliente_id'] in nombres:\n            n = nombres[p['cliente_id']]\n            totales[n] = totales.get(n, 0) + p['importe']\n    return totales",
      explicacion: 'Es un `LEFT JOIN` con suma hecho a mano: el lado que no se puede perder son los clientes, así que el acumulador parte de ellos. Construir el resultado solo desde los pedidos funciona hasta que aparece un cliente sin compras y desaparece del informe. Acumular por id y no por nombre evita mezclar datos si algún día dos clientes se llaman igual.'
    },
    {
      tipo: 'sql',
      titulo: 'Resumen de todos los clientes',
      enunciado: 'Para cada cliente, incluidos los que no han hecho pedidos, muestra su nombre, cuántos pedidos tiene y la suma de sus importes (0 si no tiene). Los pedidos de clientes que no existen no cuentan. Ordena por nombre.',
      tablas: [
        {
          nombre: 'clientes',
          columnas: ['id', 'nombre'],
          filas: [[1, 'Ana'], [2, 'Luis'], [3, 'Sol']]
        },
        {
          nombre: 'pedidos',
          columnas: ['id', 'cliente_id', 'importe'],
          filas: [[1, 1, 10], [2, 3, 5], [3, 1, 7]]
        }
      ],
      esperado: { columnas: ['nombre', 'pedidos', 'total'], filas: [['Ana', 2, 17], ['Luis', 0, 0], ['Sol', 1, 5]] },
      tablasExtra: [
        {
          nombre: 'clientes',
          columnas: ['id', 'nombre'],
          filas: [[1, 'Rita'], [2, 'Tito']]
        },
        {
          nombre: 'pedidos',
          columnas: ['id', 'cliente_id', 'importe'],
          filas: [[1, 2, 4], [2, 9, 30]]
        }
      ],
      esperadoExtra: [['Rita', 0, 0], ['Tito', 1, 4]],
      conOrden: true,
      pistas: [
        'Parte de `clientes` y cruza con `pedidos` de forma que ningún cliente se quede fuera.',
        'Un cliente sin pedidos sigue ocupando una fila tras el cruce, con las columnas de `pedidos` en NULL. Piensa qué cuenta cada forma de `COUNT` en esa fila.',
        'La suma de un grupo sin valores no es 0 sino NULL: hay una función que cambia un NULL por el valor que le digas.'
      ],
      solucion: 'SELECT c.nombre, COUNT(p.id) AS pedidos, COALESCE(SUM(p.importe), 0) AS total\nFROM clientes AS c\nLEFT JOIN pedidos AS p ON p.cliente_id = c.id\nGROUP BY c.id, c.nombre\nORDER BY c.nombre;',
      incorrecta: 'SELECT c.nombre, COUNT(*) AS pedidos, COALESCE(SUM(p.importe), 0) AS total\nFROM clientes AS c\nLEFT JOIN pedidos AS p ON p.cliente_id = c.id\nGROUP BY c.id, c.nombre\nORDER BY c.nombre;',
      explicacion: 'Tras el `LEFT JOIN`, Luis tiene una fila con `p.id` en NULL: `COUNT(*)` la cuenta como un pedido y `COUNT(p.id)` no. Agrupar por `c.id` además del nombre evita juntar a dos clientes que se llamen igual. `COALESCE` hace falta porque `SUM` de un grupo sin valores devuelve NULL, y eso pasa igual en todos los motores.'
    }
  ]
};
