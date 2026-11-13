export default {
  numero: 7,
  id: 'ventana-deslizante',
  titulo: 'La ventana',
  concepto: 'Ventana deslizante',
  descripcion: 'Ejercicios de Python y SQL sobre la ventana deslizante: media móvil, mayor suma de k elementos seguidos, rachas dentro de un presupuesto y funciones de ventana con ROW_NUMBER, SUM OVER y LAG, con pistas y solución.',
  explicacion: 'Una ventana deslizante es un tramo de elementos seguidos que se mueve por la lista: al avanzar un paso entra un elemento por un lado y sale otro por el otro, así que puedes actualizar la suma sin volver a recorrer el tramo entero. Unas veces la ventana tiene un tamaño fijo y otras crece y encoge según una condición, como no pasarse de un presupuesto. En SQL la misma idea son las funciones de ventana, como `ROW_NUMBER`, `SUM(...) OVER` o `LAG`, que calculan algo para cada fila mirando las filas de su alrededor sin agruparlas en una sola (SQLite las admite desde la versión 3.25, que ya trae cualquier Python reciente).',
  ejercicios: [
    {
      tipo: 'python',
      titulo: 'La media de tres días',
      enunciado: 'Escribe `media_movil` para que devuelva una lista con la media de cada tramo de `k` valores seguidos de `valores`, redondeada a 1 decimal con `round`. El primer tramo va de la posición 0 a la `k - 1`, el segundo empieza en la 1, y así hasta el último tramo completo. Si no hay ningún tramo completo, devuelve una lista vacía. `k` siempre es mayor que 0.',
      funcion: 'media_movil',
      parametros: 'valores, k',
      casos: [
        { args: [[10, 12, 15, 13, 11], 3], esperado: [12.3, 13.3, 13] },
        { args: [[2, 4, 6, 8], 2], esperado: [3, 5, 7] },
        { args: [[5], 1], esperado: [5], extra: true },
        { args: [[1, 2], 3], esperado: [], extra: true },
        { args: [[1, 2, 3], 3], esperado: [2], extra: true },
        { args: [[0, 0, 1], 2], esperado: [0, 0.5], extra: true },
        { args: [[], 1], esperado: [], extra: true }
      ],
      pistas: [
        'Con 5 valores y tramos de 3 hay 3 tramos. Antes de escribir el bucle, piensa cuántos tramos salen con `n` valores y tramos de `k`.',
        'Calcula la suma del primer tramo una vez. Para pasar al siguiente no hace falta volver a sumarlo entero: un valor entra y otro sale.',
        'Prueba tu bucle mentalmente con la lista de un solo elemento y `k = 1`: si el último tramo se queda fuera, revisa el límite del `range`.'
      ],
      solucion: "def media_movil(valores, k):\n    if k > len(valores):\n        return []\n    suma = sum(valores[:k])\n    medias = [round(suma / k, 1)]\n    for i in range(k, len(valores)):\n        suma += valores[i] - valores[i - k]\n        medias.append(round(suma / k, 1))\n    return medias",
      incorrecta: "def media_movil(valores, k):\n    medias = []\n    for i in range(len(valores) - k):\n        medias.append(round(sum(valores[i:i + k]) / k, 1))\n    return medias",
      explicacion: 'Con `n` valores hay `n - k + 1` tramos: la versión que recorre `range(len(valores) - k)` pierde siempre el último, y con los ejemplos de arriba ya se nota. La solución suma el primer tramo y luego, en cada paso, suma el valor que entra y resta el que sale, así que cada valor se toca dos veces como mucho aunque `k` sea grande. Sumar cada tramo con `sum(valores[i:i + k])` también es correcto si el `range` llega a `len(valores) - k + 1`, solo que hace más trabajo.'
    },
    {
      tipo: 'sql',
      titulo: 'El acumulado de cada tienda',
      enunciado: 'Cada fila de `ventas` es lo que vendió una tienda en un día, y no hay dos filas de la misma tienda con la misma fecha. Muestra `tienda`, `fecha` y una columna `acumulado` con el total vendido por esa tienda desde su primer día hasta esa fecha, incluida. Ordena por tienda y, dentro de cada tienda, por fecha.',
      tablas: [
        {
          nombre: 'ventas',
          columnas: ['tienda', 'fecha', 'importe'],
          filas: [
            ['Centro', '2026-03-01', 100],
            ['Norte', '2026-03-01', 80],
            ['Centro', '2026-03-02', 50],
            ['Norte', '2026-03-02', 20],
            ['Centro', '2026-03-03', 70]
          ]
        }
      ],
      esperado: {
        columnas: ['tienda', 'fecha', 'acumulado'],
        filas: [
          ['Centro', '2026-03-01', 100],
          ['Centro', '2026-03-02', 150],
          ['Centro', '2026-03-03', 220],
          ['Norte', '2026-03-01', 80],
          ['Norte', '2026-03-02', 100]
        ]
      },
      tablasExtra: [
        {
          nombre: 'ventas',
          columnas: ['tienda', 'fecha', 'importe'],
          filas: [
            ['Sur', '2026-04-03', 5],
            ['Este', '2026-04-02', 40],
            ['Sur', '2026-04-01', 30],
            ['Sur', '2026-04-02', 0],
            ['Este', '2026-04-01', 10]
          ]
        }
      ],
      esperadoExtra: [
        ['Este', '2026-04-01', 10],
        ['Este', '2026-04-02', 50],
        ['Sur', '2026-04-01', 30],
        ['Sur', '2026-04-02', 30],
        ['Sur', '2026-04-03', 35]
      ],
      conOrden: true,
      pistas: [
        'Con `GROUP BY` perderías las filas de cada día: aquí quieres conservar todas y añadir a cada una un total que mira hacia atrás.',
        'Después de `SUM(importe)` puedes escribir `OVER (...)` y, dentro de los paréntesis, decir cómo se reparten y cómo se ordenan las filas que entran en la suma.',
        'Necesitas dos cosas dentro del `OVER`: que cada tienda lleve su propia cuenta, empezando de cero, y que la cuenta avance por fecha. Mira qué hacen `PARTITION BY` y `ORDER BY` ahí dentro.'
      ],
      solucion: 'SELECT tienda, fecha,\n       SUM(importe) OVER (PARTITION BY tienda ORDER BY fecha) AS acumulado\nFROM ventas\nORDER BY tienda, fecha;',
      incorrecta: 'SELECT tienda, fecha,\n       SUM(importe) OVER (ORDER BY fecha) AS acumulado\nFROM ventas\nORDER BY tienda, fecha;',
      explicacion: '`PARTITION BY tienda` hace que cada tienda empiece su suma desde cero, y el `ORDER BY` de dentro del `OVER` convierte la suma en acumulada: cada fila suma las de su tienda con fecha menor o igual. Sin la partición, el acumulado del Norte arrastra también las ventas del Centro. El `ORDER BY` final es otro distinto: solo decide cómo se muestran las filas, y por eso hace falta aunque ya haya uno dentro del `OVER`.'
    },
    {
      tipo: 'python',
      titulo: 'La mejor semana corta',
      enunciado: 'Tienes las ventas de cada día en una lista. Escribe `mayor_suma` para que devuelva la mayor suma de `k` días seguidos. Las ventas pueden ser negativas, porque cuentan las devoluciones. Si hay menos de `k` días, devuelve `None`. `k` siempre es mayor que 0.',
      funcion: 'mayor_suma',
      parametros: 'ventas, k',
      casos: [
        { args: [[3, 1, 4, 1, 5, 9, 2], 3], esperado: 16 },
        { args: [[10, -5, 20, 1], 2], esperado: 21 },
        { args: [[-2, -1, -3], 2], esperado: -3, extra: true },
        { args: [[5], 1], esperado: 5, extra: true },
        { args: [[1, 2], 3], esperado: null, extra: true },
        { args: [[4, 4, 4], 3], esperado: 12, extra: true },
        { args: [[-7, -1, -9], 1], esperado: -1, extra: true }
      ],
      pistas: [
        'Empieza con la suma de los primeros `k` días: ya es una candidata a mejor suma.',
        'Al mover la ventana un día a la derecha, entra el día nuevo y sale el que quedó atrás `k` posiciones; no hace falta volver a sumar los demás.',
        '¿Con qué valor inicial empiezas a buscar el máximo? Piensa en una semana en la que todos los días hubo más devoluciones que ventas.'
      ],
      solucion: "def mayor_suma(ventas, k):\n    if len(ventas) < k:\n        return None\n    actual = sum(ventas[:k])\n    mejor = actual\n    for i in range(k, len(ventas)):\n        actual += ventas[i] - ventas[i - k]\n        mejor = max(mejor, actual)\n    return mejor",
      incorrecta: "def mayor_suma(ventas, k):\n    if len(ventas) < k:\n        return None\n    mejor = 0\n    actual = 0\n    for i in range(len(ventas)):\n        actual += ventas[i]\n        if i >= k:\n            actual -= ventas[i - k]\n        if i >= k - 1:\n            mejor = max(mejor, actual)\n    return mejor",
      explicacion: 'La ventana se mueve sumando el día que entra y restando el que sale, así que cada día se mira una vez aunque `k` sea grande. La trampa está en el valor inicial del máximo: empezar en 0 parece inocente, pero si todas las ventanas suman en negativo la función devuelve 0, una suma que no existe. Empezar con la suma de la primera ventana real evita el problema sin tener que inventar un valor como `-infinito`.'
    },
    {
      tipo: 'sql',
      titulo: 'El primer pedido',
      enunciado: 'Muestra el primer pedido de cada cliente: `cliente`, `fecha` e `importe`, ordenado por cliente. Si un cliente hizo dos pedidos el mismo día, cuenta como primero el de `id` menor, y cada cliente debe salir una sola vez.',
      tablas: [
        {
          nombre: 'pedidos',
          columnas: ['id', 'cliente', 'fecha', 'importe'],
          filas: [
            [1, 'Ana', '2026-02-03', 30],
            [2, 'Beto', '2026-01-15', 12],
            [3, 'Ana', '2026-01-20', 45],
            [4, 'Ciro', '2026-02-01', 8],
            [5, 'Beto', '2026-01-30', 60],
            [6, 'Ana', '2026-03-01', 20]
          ]
        }
      ],
      esperado: {
        columnas: ['cliente', 'fecha', 'importe'],
        filas: [
          ['Ana', '2026-01-20', 45],
          ['Beto', '2026-01-15', 12],
          ['Ciro', '2026-02-01', 8]
        ]
      },
      tablasExtra: [
        {
          nombre: 'pedidos',
          columnas: ['id', 'cliente', 'fecha', 'importe'],
          filas: [
            [1, 'Dani', '2026-04-02', 15],
            [2, 'Eli', '2026-04-01', 40],
            [3, 'Dani', '2026-04-02', 25],
            [4, 'Eli', '2026-04-03', 5],
            [5, 'Dani', '2026-04-05', 9]
          ]
        }
      ],
      esperadoExtra: [
        ['Dani', '2026-04-02', 15],
        ['Eli', '2026-04-01', 40]
      ],
      conOrden: true,
      pistas: [
        'Numera los pedidos de cada cliente del más antiguo al más reciente: el primero de cada uno es el que lleva el número 1.',
        'Hay varias funciones de ventana que numeran filas. Fíjate en qué hace cada una cuando dos filas empatan en el orden: unas repiten número y otras no.',
        'Una función de ventana no se puede usar directamente en el `WHERE` de la misma consulta. Calcula el número en una subconsulta y filtra desde fuera.'
      ],
      solucion: 'SELECT cliente, fecha, importe\nFROM (\n    SELECT cliente, fecha, importe,\n           ROW_NUMBER() OVER (PARTITION BY cliente ORDER BY fecha, id) AS n\n    FROM pedidos\n)\nWHERE n = 1\nORDER BY cliente;',
      incorrecta: 'SELECT cliente, fecha, importe\nFROM (\n    SELECT cliente, fecha, importe,\n           RANK() OVER (PARTITION BY cliente ORDER BY fecha) AS n\n    FROM pedidos\n)\nWHERE n = 1\nORDER BY cliente;',
      explicacion: '`ROW_NUMBER` da 1, 2, 3... dentro de cada cliente sin repetir nunca un número, y el `id` en el orden decide los empates de fecha. `RANK` da el mismo número a las filas empatadas, así que dos pedidos del mismo primer día salen los dos con 1 y el cliente aparece dos veces; con la primera tabla no se nota porque no hay empates. Filtrar en una consulta exterior es obligatorio, porque el `WHERE` se evalúa antes que las funciones de ventana.'
    },
    {
      tipo: 'python',
      titulo: 'Los días dentro del presupuesto',
      enunciado: 'Tienes lo que gastaste cada día (números enteros, nunca negativos) y un presupuesto. Escribe `racha_en_presupuesto` para que devuelva cuántos días seguidos, como máximo, puedes juntar sin que su gasto total pase del presupuesto. Gastar exactamente el presupuesto está permitido. Si ningún día cabe por sí solo, devuelve 0.',
      funcion: 'racha_en_presupuesto',
      parametros: 'gastos, presupuesto',
      casos: [
        { args: [[4, 1, 1, 3], 5], esperado: 3 },
        { args: [[2, 3, 1, 1, 5, 1], 6], esperado: 3 },
        { args: [[], 10], esperado: 0, extra: true },
        { args: [[7], 5], esperado: 0, extra: true },
        { args: [[0, 0, 0], 0], esperado: 3, extra: true },
        { args: [[1, 1, 1], 10], esperado: 3, extra: true },
        { args: [[9, 1, 1, 9], 2], esperado: 2, extra: true },
        { args: [[3, 8, 1, 1, 1, 6], 4], esperado: 3, extra: true }
      ],
      pistas: [
        'Usa una ventana de tamaño variable: un índice marca dónde empieza y el bucle va añadiendo días por el final mientras lleva la suma.',
        'Cuando la suma se pasa del presupuesto, no tires toda la ventana: quita días por el principio, uno a uno, hasta que vuelva a caber.',
        'A veces hay que quitar más de un día para volver a caber, y a veces la ventana se queda vacía. Después de ajustarla, su longitud es una candidata a la mejor.'
      ],
      solucion: "def racha_en_presupuesto(gastos, presupuesto):\n    inicio = 0\n    suma = 0\n    mejor = 0\n    for fin, gasto in enumerate(gastos):\n        suma += gasto\n        while suma > presupuesto:\n            suma -= gastos[inicio]\n            inicio += 1\n        mejor = max(mejor, fin - inicio + 1)\n    return mejor",
      incorrecta: "def racha_en_presupuesto(gastos, presupuesto):\n    inicio = 0\n    suma = 0\n    mejor = 0\n    for fin, gasto in enumerate(gastos):\n        suma += gasto\n        if suma > presupuesto:\n            suma = gasto\n            inicio = fin\n        mejor = max(mejor, fin - inicio + 1)\n    return mejor",
      explicacion: 'La ventana crece por la derecha y encoge por la izquierda solo lo justo para volver a caber; como los gastos no son negativos, quitar días nunca hace que la suma suba. Empezar la ventana de cero en el día que se pasa parece razonable, pero tira días del principio que todavía cabían: con `[4, 1, 1, 3]` y presupuesto 5 se pierde la racha `1, 1, 3`, y además cuenta como racha un día que por sí solo ya se pasa. Aunque hay un `while` dentro del `for`, cada día entra y sale de la ventana una sola vez.'
    },
    {
      tipo: 'sql',
      titulo: 'Las subidas de precio',
      enunciado: 'La tabla `precios` guarda el precio de un producto en las fechas en que se revisó, que no siempre son días seguidos. Muestra la `fecha` y la `subida` (precio de esa fecha menos el de la revisión anterior) de las revisiones en que el precio subió respecto a la anterior, ordenadas por fecha. La primera revisión no tiene anterior, así que no puede salir.',
      tablas: [
        {
          nombre: 'precios',
          columnas: ['fecha', 'precio'],
          filas: [
            ['2026-05-01', 10],
            ['2026-05-02', 12],
            ['2026-05-03', 11],
            ['2026-05-04', 15],
            ['2026-05-05', 15]
          ]
        }
      ],
      esperado: { columnas: ['fecha', 'subida'], filas: [['2026-05-02', 2], ['2026-05-04', 4]] },
      tablasExtra: [
        {
          nombre: 'precios',
          columnas: ['fecha', 'precio'],
          filas: [
            ['2026-06-08', 25],
            ['2026-06-01', 20],
            ['2026-06-04', 21],
            ['2026-06-09', 24],
            ['2026-06-03', 18]
          ]
        }
      ],
      esperadoExtra: [['2026-06-04', 3], ['2026-06-08', 4]],
      conOrden: true,
      pistas: [
        'Para cada fila necesitas el precio de la fila anterior por fecha, que no es lo mismo que el precio del día anterior en el calendario.',
        'Hay una función de ventana que devuelve el valor de una columna en la fila previa según el orden que indiques. En la primera fila devuelve NULL.',
        'Calcula la diferencia en una subconsulta y filtra fuera las que sean positivas. Una comparación con NULL nunca es verdadera, así que la primera fila se descarta sola.'
      ],
      solucion: 'SELECT fecha, subida\nFROM (\n    SELECT fecha,\n           precio - LAG(precio) OVER (ORDER BY fecha) AS subida\n    FROM precios\n)\nWHERE subida > 0\nORDER BY fecha;',
      incorrecta: "SELECT hoy.fecha, hoy.precio - ayer.precio AS subida\nFROM precios AS hoy\nJOIN precios AS ayer ON ayer.fecha = date(hoy.fecha, '-1 day')\nWHERE hoy.precio > ayer.precio\nORDER BY hoy.fecha;",
      explicacion: '`LAG(precio) OVER (ORDER BY fecha)` trae el precio de la revisión anterior, haya pasado un día o una semana. Unir la tabla consigo misma buscando la fecha de ayer funciona mientras las revisiones son diarias, pero en cuanto falta un día esa fila se queda sin pareja y su subida desaparece del resultado. La resta con NULL da NULL y `NULL > 0` no es verdadero, por eso la primera revisión no sale. `date(..., \'-1 day\')` es propio de SQLite; `LAG` vale igual en PostgreSQL, MySQL 8 y SQL Server.'
    }
  ]
};
