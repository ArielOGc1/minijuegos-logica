export default {
  numero: 6,
  id: 'dos-punteros',
  titulo: 'Los dos extremos',
  concepto: 'Dos punteros y orden',
  descripcion: 'Ejercicios de Python y SQL sobre la técnica de dos punteros y el orden: palíndromos, combinar listas ordenadas, quitar repetidos, ORDER BY con LIMIT y OFFSET y el segundo valor más alto, con pistas y solución.',
  explicacion: 'Con dos punteros recorres una secuencia desde dos sitios a la vez, por ejemplo uno desde cada extremo o uno en cada lista, y en cada paso avanzas el que toca según lo que ves. Funciona especialmente bien cuando los datos están ordenados, porque el orden te dice qué puntero mover sin tener que volver atrás. En SQL el orden lo pones tú con `ORDER BY`, y `LIMIT` con `OFFSET` te dejan quedarte con una porción concreta: los primeros, la segunda página o el segundo más alto.',
  ejercicios: [
    {
      tipo: 'python',
      titulo: 'Se lee igual al revés',
      enunciado: 'Escribe `es_palindromo` para que devuelva `True` si `texto` se lee igual de izquierda a derecha que de derecha a izquierda, teniendo en cuenta solo letras y dígitos y sin distinguir mayúsculas de minúsculas. Espacios, comas, signos de exclamación y demás se ignoran. Los textos de prueba no llevan tildes.',
      funcion: 'es_palindromo',
      parametros: 'texto',
      casos: [
        { args: ['Anita lava la tina'], esperado: true },
        { args: ['Hola'], esperado: false },
        { args: ['Sal, sol'], esperado: false },
        { args: [''], esperado: true, extra: true },
        { args: ['¡Yo hago yoga hoy!'], esperado: true, extra: true },
        { args: ['ab'], esperado: false, extra: true },
        { args: ['.,;'], esperado: true, extra: true },
        { args: ['A1b, B1a'], esperado: true, extra: true }
      ],
      pistas: [
        'Pon un índice al principio y otro al final del texto, y acércalos hacia el centro.',
        'Si el carácter de un lado no es letra ni dígito, avanza solo ese índice y vuelve a mirar. Los textos traen una forma directa de hacer justo esa pregunta.',
        'Compara los dos caracteres ya pasados a minúscula: a la primera diferencia ya sabes la respuesta, y si los índices se cruzan sin encontrar ninguna, es palíndromo.'
      ],
      solucion: "def es_palindromo(texto):\n    i, j = 0, len(texto) - 1\n    while i < j:\n        if not texto[i].isalnum():\n            i += 1\n        elif not texto[j].isalnum():\n            j -= 1\n        elif texto[i].lower() != texto[j].lower():\n            return False\n        else:\n            i += 1\n            j -= 1\n    return True",
      incorrecta: "def es_palindromo(texto):\n    limpio = texto.lower().replace(' ', '').replace(',', '')\n    return limpio == limpio[::-1]",
      explicacion: 'Los dos índices avanzan hacia el centro y cada carácter se mira una sola vez, sin crear copias del texto. Quitar a mano espacios y comas parece suficiente con los ejemplos, pero en cuanto aparece un signo que no tenías previsto, como `¡` o `!`, el texto ya no es simétrico; `isalnum` decide carácter por carácter sin tener que listar todos los signos. También vale limpiar primero y comparar con `[::-1]`, siempre que filtres con `isalnum`.'
    },
    {
      tipo: 'sql',
      titulo: 'El podio de ventas',
      enunciado: 'Muestra el nombre y las unidades de los 3 productos más vendidos, de más a menos unidades. Si dos productos empatan en unidades, va primero el de nombre alfabéticamente menor.',
      tablas: [
        {
          nombre: 'productos',
          columnas: ['nombre', 'unidades'],
          filas: [['Café', 40], ['Té', 25], ['Pan', 60], ['Agua', 25], ['Leche', 10]]
        }
      ],
      esperado: { columnas: ['nombre', 'unidades'], filas: [['Pan', 60], ['Café', 40], ['Agua', 25]] },
      tablasExtra: [
        {
          nombre: 'productos',
          columnas: ['nombre', 'unidades'],
          filas: [['Sal', 2], ['Miel', 5], ['Ajo', 1], ['Arroz', 5]]
        }
      ],
      esperadoExtra: [['Arroz', 5], ['Miel', 5], ['Sal', 2]],
      conOrden: true,
      pistas: [
        'Primero ordena toda la tabla y después quédate con las primeras filas: en SQL esas dos cosas van en cláusulas distintas.',
        'Por defecto el orden es de menor a mayor; para los más vendidos necesitas el contrario.',
        '`ORDER BY` admite varias columnas separadas por comas, y la primera manda: la segunda solo decide entre filas empatadas en la primera.'
      ],
      solucion: 'SELECT nombre, unidades\nFROM productos\nORDER BY unidades DESC, nombre\nLIMIT 3;',
      incorrecta: 'SELECT nombre, unidades\nFROM productos\nORDER BY nombre, unidades DESC\nLIMIT 3;',
      explicacion: 'El `LIMIT` se aplica después de ordenar, así que primero se decide el orden completo y luego se cortan 3 filas. El orden de las columnas en `ORDER BY` importa: poner `nombre` delante ordena alfabéticamente y las unidades ya casi no cuentan. Sin el desempate por nombre, qué producto entra en un empate dependería del motor. `LIMIT` vale en SQLite, PostgreSQL y MySQL; SQL Server usa `TOP` u `OFFSET ... FETCH`.'
    },
    {
      tipo: 'python',
      titulo: 'Registros sin repetir',
      enunciado: 'Un sistema guarda los ids de los registros procesados en una lista ordenada de menor a mayor, pero algunos se procesaron varias veces. Escribe `ids_unicos` para que devuelva una lista nueva con cada id una sola vez, en el mismo orden.',
      funcion: 'ids_unicos',
      parametros: 'ids',
      casos: [
        { args: [[101, 101, 102, 105, 105, 105]], esperado: [101, 102, 105] },
        { args: [[3, 4, 5]], esperado: [3, 4, 5] },
        { args: [[]], esperado: [], extra: true },
        { args: [[7]], esperado: [7], extra: true },
        { args: [[2, 2, 2]], esperado: [2], extra: true },
        { args: [[1, 2, 2, 3, 3, 4]], esperado: [1, 2, 3, 4], extra: true }
      ],
      pistas: [
        'Como la lista está ordenada, los repetidos siempre quedan juntos, uno detrás de otro.',
        'Basta con comparar cada id con el último que ya guardaste en el resultado, no con todos.',
        'Ojo con el primer id (aún no hay ningún “último guardado”) y con el último de la lista: los dos tienen que entrar.'
      ],
      solucion: "def ids_unicos(ids):\n    unicos = []\n    for x in ids:\n        if not unicos or unicos[-1] != x:\n            unicos.append(x)\n    return unicos",
      incorrecta: "def ids_unicos(ids):\n    unicos = []\n    for i in range(len(ids) - 1):\n        if ids[i] != ids[i + 1]:\n            unicos.append(ids[i])\n    return unicos",
      explicacion: 'Un puntero recorre la lista y el otro es el final del resultado: como lo repetido está junto, basta comparar con lo último guardado. Comparar cada elemento con el siguiente también es una idea correcta, pero el bucle hasta `len(ids) - 1` se olvida del último id y falla con listas de un solo elemento. `sorted(set(ids))` daría lo mismo aquí, pero solo porque la lista ya venía ordenada.'
    },
    {
      tipo: 'sql',
      titulo: 'La segunda página',
      enunciado: 'La app muestra los usuarios del registro más reciente al más antiguo, 3 por página. Si dos usuarios se registraron el mismo día, va primero el de `id` menor. Muestra el `id` y el `nombre` de los usuarios de la página 2.',
      tablas: [
        {
          nombre: 'usuarios',
          columnas: ['id', 'nombre', 'registro'],
          filas: [
            [1, 'Ana', '2026-01-05'],
            [2, 'Luis', '2026-03-10'],
            [3, 'Sol', '2026-02-20'],
            [4, 'Rita', '2026-05-01'],
            [5, 'Tito', '2026-04-15'],
            [6, 'Eva', '2026-06-30'],
            [7, 'Iván', '2026-01-25'],
            [8, 'Uma', '2026-03-30']
          ]
        }
      ],
      esperado: { columnas: ['id', 'nombre'], filas: [[8, 'Uma'], [2, 'Luis'], [3, 'Sol']] },
      tablasExtra: [
        {
          nombre: 'usuarios',
          columnas: ['id', 'nombre', 'registro'],
          filas: [
            [1, 'Nora', '2026-02-01'],
            [2, 'Raúl', '2026-02-01'],
            [3, 'Pía', '2026-03-01'],
            [4, 'Leo', '2026-02-01'],
            [5, 'Mar', '2026-01-01'],
            [6, 'Gil', '2026-03-01'],
            [7, 'Zoe', '2026-01-15']
          ]
        }
      ],
      esperadoExtra: [[2, 'Raúl'], [4, 'Leo'], [7, 'Zoe']],
      conOrden: true,
      pistas: [
        'Las fechas están guardadas como texto con el formato año-mes-día, así que ordenarlas como texto las deja en orden cronológico.',
        'Necesitas dos criterios de orden: la fecha, de la más nueva a la más vieja, y el `id` para los empates.',
        'Para llegar a la página 2 tienes que saltarte la página 1 entera. ¿Cuántas filas son? Generalizando, la página n se salta (n - 1) por el tamaño de página.'
      ],
      solucion: 'SELECT id, nombre\nFROM usuarios\nORDER BY registro DESC, id\nLIMIT 3 OFFSET 3;',
      incorrecta: 'SELECT id, nombre\nFROM usuarios\nORDER BY registro DESC, id\nLIMIT 3 OFFSET 6;',
      explicacion: '`OFFSET` dice cuántas filas saltar, no qué página mostrar: la página 2 empieza después de las 3 primeras, por eso es `OFFSET 3`, y multiplicar la página por el tamaño se salta una de más. El desempate por `id` es lo que hace que la paginación sea estable: sin él, un usuario podría salir en dos páginas o en ninguna cuando hay fechas repetidas. Ordenar fechas como texto solo funciona con el formato `AAAA-MM-DD`; en otros motores lo normal es usar un tipo de fecha.'
    },
    {
      tipo: 'python',
      titulo: 'Dos registros en uno',
      enunciado: 'Tienes dos listas de horas de eventos (`"HH:MM"`, siempre con dos dígitos), cada una ya ordenada de la más temprana a la más tardía. Escribe `combinar_eventos` para que devuelva una sola lista ordenada con todas las horas de las dos, incluidas las repetidas. Hazlo recorriendo las dos listas a la vez, sin volver a ordenar.',
      funcion: 'combinar_eventos',
      parametros: 'a, b',
      casos: [
        {
          args: [['08:00', '09:30', '12:15'], ['08:45', '09:30']],
          esperado: ['08:00', '08:45', '09:30', '09:30', '12:15']
        },
        {
          args: [['10:00'], ['07:00', '11:00', '13:00']],
          esperado: ['07:00', '10:00', '11:00', '13:00']
        },
        { args: [[], ['01:00']], esperado: ['01:00'], extra: true },
        { args: [['05:00'], []], esperado: ['05:00'], extra: true },
        { args: [['06:00', '06:00'], ['06:00']], esperado: ['06:00', '06:00', '06:00'], extra: true },
        { args: [[], []], esperado: [], extra: true }
      ],
      pistas: [
        'Lleva un índice en cada lista. En cada paso, el siguiente elemento del resultado es el menor de los dos que señalan.',
        'Con dos dígitos fijos, las horas en texto se comparan bien con `<`, igual que si fueran números.',
        'El bucle termina cuando una de las listas se acaba, pero a la otra todavía le pueden quedar elementos. ¿Qué haces con ellos?'
      ],
      solucion: "def combinar_eventos(a, b):\n    i, j = 0, 0\n    resultado = []\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            resultado.append(a[i])\n            i += 1\n        else:\n            resultado.append(b[j])\n            j += 1\n    resultado.extend(a[i:])\n    resultado.extend(b[j:])\n    return resultado",
      incorrecta: "def combinar_eventos(a, b):\n    i, j = 0, 0\n    resultado = []\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            resultado.append(a[i])\n            i += 1\n        else:\n            resultado.append(b[j])\n            j += 1\n    return resultado + a[i:]",
      explicacion: 'Cada paso mete un elemento y avanza un solo índice, así que se hacen tantas vueltas como elementos haya en total, sin reordenar nada. El fallo típico es acordarse de lo que sobra en una lista y no en la otra: con el primer ejemplo pasa desapercibido porque la lista que queda con elementos es `a`. Añadir los dos restos no cuesta nada, porque uno de ellos siempre está vacío. `sorted(a + b)` también acierta, pero no aprovecha que las listas ya venían ordenadas.'
    },
    {
      tipo: 'sql',
      titulo: 'El segundo sueldo',
      enunciado: 'Muestra en una columna llamada `segundo` el segundo sueldo más alto de la tabla, contando los sueldos distintos: si el más alto se repite, el segundo es el siguiente valor por debajo. Si no hay un segundo sueldo distinto, la consulta debe devolver una fila con NULL, no una tabla vacía.',
      tablas: [
        {
          nombre: 'empleados',
          columnas: ['id', 'nombre', 'sueldo'],
          filas: [[1, 'Ana', 3000], [2, 'Luis', 4500], [3, 'Sol', 4500], [4, 'Rita', 2000]]
        }
      ],
      esperado: { columnas: ['segundo'], filas: [[3000]] },
      tablasExtra: [
        {
          nombre: 'empleados',
          columnas: ['id', 'nombre', 'sueldo'],
          filas: [[1, 'Tito', 2500], [2, 'Eva', 2500]]
        }
      ],
      esperadoExtra: [[null]],
      conOrden: true,
      pistas: [
        'Si ordenas los sueldos de mayor a menor, el segundo está en la segunda fila; pero antes asegúrate de que cada valor aparezca una sola vez.',
        'Para quedarte con la segunda fila tienes que saltarte una y tomar una.',
        'Cuando no hay segunda fila, una consulta normal devuelve cero filas. Pero si esa consulta va como subconsulta dentro de un `SELECT` exterior, su valor pasa a ser NULL.'
      ],
      solucion: 'SELECT (\n    SELECT DISTINCT sueldo\n    FROM empleados\n    ORDER BY sueldo DESC\n    LIMIT 1 OFFSET 1\n) AS segundo;',
      incorrecta: 'SELECT DISTINCT sueldo AS segundo\nFROM empleados\nORDER BY sueldo DESC\nLIMIT 1 OFFSET 1;',
      explicacion: '`DISTINCT` deja un solo 4500, así que el segundo es 3000 y no el 4500 repetido. La consulta interior, cuando no encuentra fila, devuelve nada; envuelta en un `SELECT` exterior como subconsulta escalar, ese vacío se convierte en NULL, que es lo que pide el enunciado. La versión sin envolver acierta el primer caso y deja una tabla vacía en el segundo. Una alternativa que vale en cualquier motor es `SELECT MAX(sueldo) ... WHERE sueldo < (SELECT MAX(sueldo) FROM empleados)`.'
    }
  ]
};
