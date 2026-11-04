window.JUEGO = {
  id: 'contar-agrupar',
  titulo: 'El recuento',
  entrega: 2,
  concepto: 'Contar y agrupar',
  descripcion: 'Retos de Python y SQL para contar frecuencias y agrupar datos, con código que se ejecuta en el navegador.',
  explicacion: 'Contar cuántas veces aparece cada cosa es la base de casi todo análisis de datos. En Python recorres los datos y guardas un contador por clave en un diccionario; en SQL, `GROUP BY` reúne las filas iguales y `COUNT` o `SUM` resumen cada grupo.',
  retos: [
    {
      tipo: 'python',
      titulo: 'Estados de pedidos',
      enunciado: 'Recibes una lista con el estado de cada pedido. Escribe `contar_estados` para que devuelva un diccionario con cuántas veces aparece cada estado.',
      funcion: 'contar_estados',
      inicial: 'def contar_estados(estados):\n    # Escribe tu solución aquí\n    pass\n',
      casos: [
        { args: [['pagado', 'enviado', 'pagado']], esperado: { pagado: 2, enviado: 1 } },
        { args: [[]], esperado: {} },
        { args: [['nuevo', 'nuevo', 'nuevo', 'nuevo']], esperado: { nuevo: 4 }, oculto: true },
        { args: [['a', 'b', 'c', 'a', 'b', 'a']], esperado: { a: 3, b: 2, c: 1 }, oculto: true }
      ],
      exito: 'Este patrón de diccionario contador es uno de los más usados en algoritmia y en análisis de datos.',
      pistas: [
        'Empieza con un diccionario vacío y recorre la lista una sola vez.',
        'Por cada estado hay dos situaciones: la clave todavía no existe o ya existe y hay que sumarle 1.',
        'El método `get` de un diccionario permite indicar qué valor usar cuando la clave no existe.'
      ]
    },
    {
      tipo: 'predecir-sql',
      titulo: 'El NULL que no cuenta',
      enunciado: 'Antes de ejecutar nada, razona: ¿qué número devuelve cada columna de esta consulta? Fíjate en las filas sin correo.',
      tablas: [{
        nombre: 'clientes',
        columnas: ['id', 'email'],
        filas: [
          [1, 'ana@correo.ec'],
          [2, 'luis@correo.ec'],
          [3, null],
          [4, 'ana@correo.ec'],
          [5, null],
          [6, 'marta@correo.ec']
        ]
      }],
      consulta: 'SELECT\n  COUNT(*),\n  COUNT(email),\n  COUNT(DISTINCT email)\nFROM clientes;',
      columnas: ['COUNT(*)', 'COUNT(email)', 'COUNT(DISTINCT email)'],
      exito: 'Por esto en un análisis real conviene decidir qué significa «contar»: filas, valores presentes o valores distintos.',
      pistas: [
        '`COUNT(*)` cuenta filas sin mirar lo que contienen.',
        '`COUNT(columna)` no tiene en cuenta las filas donde esa columna es NULL.',
        '`DISTINCT` deja una sola copia de cada valor repetido, y NULL sigue sin contarse.'
      ]
    },
    {
      tipo: 'sql',
      titulo: 'Ventas por categoría',
      enunciado: 'Para los pedidos con estado `pagado`, obtén por cada categoría el número de pedidos y la suma de sus importes. Ordena por total de mayor a menor y, si hay empate, por categoría alfabéticamente.',
      inicial: 'SELECT\n  \nFROM pedidos\n',
      tablas: [{
        nombre: 'pedidos',
        columnas: ['id', 'cliente', 'categoria', 'importe', 'estado'],
        filas: [
          [1, 'Ana', 'libros', 30, 'pagado'],
          [2, 'Luis', 'hogar', 80, 'pagado'],
          [3, 'Ana', 'hogar', 20, 'cancelado'],
          [4, 'Marta', 'libros', 45, 'pagado'],
          [5, 'Luis', 'libros', 25, 'pendiente'],
          [6, 'Marta', 'juegos', 125, 'pagado'],
          [7, 'Ana', 'hogar', 45, 'pagado']
        ]
      }],
      esperado: {
        columnas: ['categoria', 'pedidos', 'total'],
        filas: [['hogar', 2, 125], ['juegos', 1, 125], ['libros', 2, 75]]
      },
      tablasOcultas: [{
        nombre: 'pedidos',
        columnas: ['id', 'cliente', 'categoria', 'importe', 'estado'],
        filas: [
          [1, 'Eva', 'ropa', 10, 'pagado'],
          [2, 'Eva', 'ropa', 15, 'pagado'],
          [3, 'Iván', 'cine', 50, 'cancelado'],
          [4, 'Iván', 'arte', 25, 'pagado'],
          [5, 'Noa', 'cine', 5, 'pagado'],
          [6, 'Noa', 'arte', 0, 'pagado']
        ]
      }],
      esperadoOculto: [['arte', 2, 25], ['ropa', 2, 25], ['cine', 1, 5]],
      conOrden: true,
      exito: 'Filtrar, agrupar, resumir y ordenar: ese es el esqueleto de la mayoría de consultas de negocio.',
      pistas: [
        'Piensa en el orden del trabajo: primero descarta las filas que no cuentan y luego agrupa las que quedan.',
        '`WHERE` filtra filas antes de agrupar, y `GROUP BY` crea un grupo por cada valor de la columna que indiques.',
        '`ORDER BY` admite varias columnas separadas por comas, cada una con su propia dirección.'
      ]
    },
    {
      tipo: 'python',
      titulo: 'El producto más vendido',
      enunciado: 'Recibes los ids de los productos vendidos. Escribe `mas_frecuente` para que devuelva el id que más se repite. Si hay empate, devuelve el id menor. Si la lista está vacía, devuelve `None`.',
      funcion: 'mas_frecuente',
      inicial: 'def mas_frecuente(ventas):\n    # Escribe tu solución aquí\n    pass\n',
      casos: [
        { args: [[3, 1, 3, 2, 1]], esperado: 1 },
        { args: [[7]], esperado: 7 },
        { args: [[]], esperado: null },
        { args: [[5, 5, 2, 2, 9]], esperado: 2, oculto: true },
        { args: [[4, 4, 4, 1, 1, 9, 9, 9]], esperado: 4, oculto: true },
        { args: [[-1, -1, 2]], esperado: -1, oculto: true }
      ],
      exito: 'Separaste el problema en dos pasos: contar y elegir. Esa separación simplifica muchos algoritmos.',
      pistas: [
        'Resuélvelo en dos pasos: primero cuenta cada id y después decide cuál gana.',
        'Al recorrer el conteo, un id reemplaza al mejor actual si tiene más ventas o si empata y su id es menor.',
        'Comprueba primero el caso de la lista vacía, porque en él no hay ningún ganador posible.'
      ]
    },
    {
      tipo: 'sql',
      titulo: 'Clientes valiosos',
      enunciado: 'Obtén los clientes con al menos 2 pedidos `pagado` y un total pagado de 100 o más. Devuelve el cliente, su número de pedidos pagados y su total. Ordena por total de mayor a menor.',
      inicial: 'SELECT\n  \nFROM pedidos\n',
      tablas: [{
        nombre: 'pedidos',
        columnas: ['id', 'cliente', 'categoria', 'importe', 'estado'],
        filas: [
          [1, 'Ana', 'libros', 30, 'pagado'],
          [2, 'Luis', 'hogar', 80, 'pagado'],
          [3, 'Ana', 'hogar', 20, 'cancelado'],
          [4, 'Marta', 'libros', 45, 'pagado'],
          [5, 'Luis', 'hogar', 20, 'pagado'],
          [6, 'Marta', 'juegos', 125, 'pagado'],
          [7, 'Ana', 'hogar', 45, 'pagado'],
          [8, 'Sol', 'juegos', 300, 'pagado'],
          [9, 'Ana', 'libros', 90, 'cancelado']
        ]
      }],
      esperado: {
        columnas: ['cliente', 'pedidos', 'total'],
        filas: [['Marta', 2, 170], ['Luis', 2, 100]]
      },
      tablasOcultas: [{
        nombre: 'pedidos',
        columnas: ['id', 'cliente', 'categoria', 'importe', 'estado'],
        filas: [
          [1, 'Eva', 'ropa', 60, 'pagado'],
          [2, 'Eva', 'cine', 40, 'pagado'],
          [3, 'Iván', 'cine', 150, 'pagado'],
          [4, 'Iván', 'arte', 10, 'cancelado'],
          [5, 'Noa', 'arte', 70, 'pagado'],
          [6, 'Noa', 'arte', 20, 'pagado'],
          [7, 'Noa', 'ropa', 5, 'pagado'],
          [8, 'Leo', 'cine', 200, 'pagado'],
          [9, 'Leo', 'arte', 1, 'pagado']
        ]
      }],
      esperadoOculto: [['Leo', 2, 201], ['Eva', 2, 100]],
      conOrden: true,
      exito: 'Ya distingues las dos etapas de filtrado: WHERE trabaja sobre filas y HAVING sobre grupos.',
      pistas: [
        'Aquí hay condiciones de dos tipos: una se mira fila por fila y otras solo se conocen al terminar cada grupo.',
        '`WHERE` filtra filas antes de agrupar y `HAVING` filtra grupos después de agrupar.',
        'Dentro de `HAVING` puedes usar `COUNT` y `SUM`. Recuerda que «al menos» y «o más» incluyen el valor límite.'
      ]
    },
    {
      tipo: 'python',
      titulo: 'El primer registro único',
      enunciado: 'Recibes una lista de ids en orden de llegada. Escribe `primer_unico` para que devuelva el primer id que aparece exactamente una vez. Si no hay ninguno, devuelve `None`.',
      funcion: 'primer_unico',
      inicial: 'def primer_unico(ids):\n    # Escribe tu solución aquí\n    pass\n',
      casos: [
        { args: [['a', 'b', 'a', 'c', 'b']], esperado: 'c' },
        { args: [['x', 'x']], esperado: null },
        { args: [[]], esperado: null },
        { args: [['k']], esperado: 'k', oculto: true },
        { args: [['p', 'q', 'r', 'p', 'q']], esperado: 'r', oculto: true },
        { args: [['m', 'n', 'm', 'n', 'o', 'o', 'z', 'y']], esperado: 'z', oculto: true }
      ],
      exito: 'Dos recorridos sencillos, uno para contar y otro para buscar, resuelven en tiempo lineal lo que parecía requerir comparar todo con todo.',
      pistas: [
        'Con un solo recorrido no puedes saber si un id volverá a aparecer más adelante. Prueba con dos recorridos.',
        'En el primer recorrido cuenta cuántas veces aparece cada id.',
        'En el segundo recorrido sigue el orden de la lista original, no el del diccionario, y detente en cuanto encuentres lo que buscas.'
      ]
    }
  ]
};
