export default {
  numero: 4,
  id: 'limpieza-datos',
  titulo: 'La escoba',
  concepto: 'Limpieza de datos',
  descripcion: 'Ejercicios de Python y SQL para normalizar textos, tratar valores vacíos y quitar duplicados, con pistas y solución.',
  explicacion: 'Los datos reales llegan sucios: espacios de más, mayúsculas mezcladas, valores vacíos y repetidos que estropean cualquier conteo. Limpiar es elegir una forma única para cada valor y aplicarla siempre igual, ya sea con `strip` y `lower` en Python o con `TRIM`, `LOWER` y `COALESCE` en SQL. Casi siempre conviene limpiar antes de comparar, agrupar o quitar duplicados.',
  ejercicios: [
    {
      tipo: 'python',
      titulo: 'Correos limpios',
      enunciado: 'Escribe `limpiar_correos` para que devuelva los correos sin espacios en los extremos y en minúsculas, en el mismo orden. Descarta los `None` y los que quedan vacíos después de quitar los espacios.',
      funcion: 'limpiar_correos',
      parametros: 'correos',
      casos: [
        { args: [[' Ana@Correo.ec ', 'luis@correo.ec']], esperado: ['ana@correo.ec', 'luis@correo.ec'] },
        { args: [[' ', null, 'X@Y.EC']], esperado: ['x@y.ec'] },
        { args: [[]], esperado: [], extra: true },
        { args: [['\tSol@c.ec\n']], esperado: ['sol@c.ec'], extra: true },
        { args: [['', '   ', null]], esperado: [], extra: true }
      ],
      pistas: [
        'Trata primero el caso `None`: no tiene métodos de texto, así que hay que saltarlo antes de nada.',
        'Los métodos `strip` y `lower` devuelven un texto nuevo; no cambian el original.',
        'Decide si un correo está vacío después de quitarle los espacios, no antes.'
      ],
      solucion: 'def limpiar_correos(correos):\n    limpios = []\n    for c in correos:\n        if c is None:\n            continue\n        c = c.strip().lower()\n        if c:\n            limpios.append(c)\n    return limpios',
      incorrecta: 'def limpiar_correos(correos):\n    return [c.strip().lower() for c in correos if c]',
      explicacion: 'La trampa es el orden: `" "` no está vacío, así que pasa el filtro y se convierte en `""` al limpiarlo. Por eso primero se limpia y después se comprueba. `strip` sin argumentos quita también tabuladores y saltos de línea.'
    },
    {
      tipo: 'sql',
      titulo: 'Categorías escritas de mil formas',
      enunciado: 'Obtén la lista de categorías distintas, sin espacios en los extremos y en minúsculas. Los productos sin categoría no cuentan. Ordena alfabéticamente. Ojo: algunos valores tienen espacios al principio o al final que la tabla de abajo no deja ver.',
      tablas: [{
        nombre: 'productos',
        columnas: ['id', 'categoria'],
        filas: [
          [1, ' Bebidas'], [2, 'bebidas'], [3, 'BEBIDAS '], [4, 'Snacks'],
          [5, 'snacks'], [6, null], [7, 'Limpieza']
        ]
      }],
      esperado: { columnas: ['categoria'], filas: [['bebidas'], ['limpieza'], ['snacks']] },
      tablasExtra: [{
        nombre: 'productos',
        columnas: ['id', 'categoria'],
        filas: [[1, '  Frutas'], [2, 'FRUTAS'], [3, 'frutas  '], [4, null], [5, 'Pan'], [6, 'Agua']]
      }],
      esperadoExtra: [['agua'], ['frutas'], ['pan']],
      conOrden: true,
      pistas: [
        'Antes de comparar categorías, todas tienen que estar escritas igual: sin espacios en los extremos y en minúsculas.',
        'Puedes aplicar funciones dentro del `SELECT` y pedir valores distintos sobre el resultado ya transformado.',
        'Una fila sin categoría no es una categoría: descártala.'
      ],
      solucion: 'SELECT DISTINCT LOWER(TRIM(categoria)) AS categoria\nFROM productos\nWHERE categoria IS NOT NULL\nORDER BY categoria;',
      incorrecta: 'SELECT DISTINCT LOWER(categoria) AS categoria\nFROM productos\nWHERE categoria IS NOT NULL\nORDER BY categoria;',
      explicacion: '`DISTINCT` compara los valores tal como salen del `SELECT`, así que la limpieza tiene que ocurrir dentro de él. Sin `TRIM`, `" bebidas"` y `"bebidas"` cuentan como distintas. Ojo: en SQLite `LOWER` solo cambia letras sin tilde, así que `Á` se queda igual; otros motores sí las convierten.'
    },
    {
      tipo: 'python',
      titulo: 'Sin repetir, en orden',
      enunciado: 'Escribe `unicos_en_orden` para que devuelva los valores sin duplicados, conservando el orden de su primera aparición.',
      funcion: 'unicos_en_orden',
      parametros: 'valores',
      casos: [
        { args: [[3, 1, 3, 2, 1]], esperado: [3, 1, 2] },
        { args: [['ana', 'luis', 'ana', 'sol']], esperado: ['ana', 'luis', 'sol'] },
        { args: [[]], esperado: [], extra: true },
        { args: [[1, 1, 1]], esperado: [1], extra: true },
        { args: [['b', 'a', 'b', 'c']], esperado: ['b', 'a', 'c'], extra: true }
      ],
      pistas: [
        'Un conjunto recuerda lo que ya viste, pero no guarda el orden de llegada.',
        'Necesitas dos estructuras: una para preguntar rápido si ya apareció y otra para conservar el orden.',
        'Añade un valor al resultado solo la primera vez que lo encuentras.'
      ],
      solucion: 'def unicos_en_orden(valores):\n    vistos = set()\n    resultado = []\n    for v in valores:\n        if v not in vistos:\n            vistos.add(v)\n            resultado.append(v)\n    return resultado',
      incorrecta: 'def unicos_en_orden(valores):\n    return list(set(valores))',
      explicacion: '`list(set(valores))` quita los repetidos pero pierde el orden, que en una lista de registros suele importar. Desde Python 3.7 también vale `list(dict.fromkeys(valores))`, porque los diccionarios conservan el orden de inserción.'
    },
    {
      tipo: 'sql',
      titulo: 'Ciudades en blanco',
      enunciado: 'Muestra el nombre y la ciudad de todos los clientes, ordenados por id. La ciudad debe salir sin espacios en los extremos. Si falta (NULL, texto vacío o solo espacios), muestra `Sin ciudad`. Algunos valores tienen espacios que la tabla de abajo no deja ver.',
      tablas: [{
        nombre: 'clientes',
        columnas: ['id', 'nombre', 'ciudad'],
        filas: [
          [1, 'Ana', 'Quito'], [2, 'Luis', null], [3, 'Marta', '  Cuenca '],
          [4, 'Sol', ''], [5, 'Iván', 'Guayaquil']
        ]
      }],
      esperado: {
        columnas: ['nombre', 'ciudad'],
        filas: [['Ana', 'Quito'], ['Luis', 'Sin ciudad'], ['Marta', 'Cuenca'], ['Sol', 'Sin ciudad'], ['Iván', 'Guayaquil']]
      },
      tablasExtra: [{
        nombre: 'clientes',
        columnas: ['id', 'nombre', 'ciudad'],
        filas: [[1, 'Rita', '   '], [2, 'Tito', null], [3, 'Uma', 'Loja']]
      }],
      esperadoExtra: [['Rita', 'Sin ciudad'], ['Tito', 'Sin ciudad'], ['Uma', 'Loja']],
      conOrden: true,
      pistas: [
        '`COALESCE` sustituye un NULL, pero un texto vacío no es NULL.',
        'Existe una función que convierte un valor concreto en NULL: úsala para que los textos vacíos se traten igual que los NULL.',
        'Quita los espacios antes de comprobar si el texto está vacío: una ciudad con solo espacios también falta.'
      ],
      solucion: "SELECT nombre, COALESCE(NULLIF(TRIM(ciudad), ''), 'Sin ciudad') AS ciudad\nFROM clientes\nORDER BY id;",
      incorrecta: "SELECT nombre, COALESCE(TRIM(ciudad), 'Sin ciudad') AS ciudad\nFROM clientes\nORDER BY id;",
      explicacion: '`NULLIF(x, \'\')` devuelve NULL cuando `x` es un texto vacío, y entonces `COALESCE` pone el valor por defecto. Se lee de dentro hacia fuera: limpiar, convertir lo vacío en NULL y rellenar. También funciona con un `CASE`, pero es fácil olvidar el caso de los espacios.'
    },
    {
      tipo: 'python',
      titulo: 'Teléfonos con formato',
      enunciado: 'Escribe `normalizar_telefono` para que devuelva un móvil de Ecuador en formato `09XXXXXXXX`. Quita cualquier carácter que no sea un dígito. Si quedan 12 dígitos que empiezan por `593`, cambia ese prefijo por un `0`. El resultado solo es válido si tiene 10 dígitos y empieza por `09`; si no, devuelve `None`.',
      funcion: 'normalizar_telefono',
      parametros: 'texto',
      casos: [
        { args: ['099 123 4567'], esperado: '0991234567' },
        { args: ['+593 99-123-4567'], esperado: '0991234567' },
        { args: ['(02) 234-5678'], esperado: null },
        { args: [''], esperado: null, extra: true },
        { args: ['593991234567'], esperado: '0991234567', extra: true },
        { args: ['099 593 1234'], esperado: '0995931234', extra: true },
        { args: ['099-123-456'], esperado: null, extra: true },
        { args: ['tel: 0987654321'], esperado: '0987654321', extra: true }
      ],
      pistas: [
        'Empieza por quedarte solo con los dígitos, recorriendo el texto carácter a carácter.',
        'El prefijo 593 solo debe cambiarse cuando está al principio y el número tiene la longitud de un número internacional completo.',
        'Haz la validación final, de longitud y de inicio, después de convertir el prefijo internacional.'
      ],
      solucion: "def normalizar_telefono(texto):\n    digitos = ''.join(c for c in texto if c.isdigit())\n    if len(digitos) == 12 and digitos.startswith('593'):\n        digitos = '0' + digitos[3:]\n    if len(digitos) == 10 and digitos.startswith('09'):\n        return digitos\n    return None",
      incorrecta: "def normalizar_telefono(texto):\n    digitos = ''.join(c for c in texto if c.isdigit())\n    digitos = digitos.replace('593', '0', 1)\n    if len(digitos) == 10 and digitos.startswith('09'):\n        return digitos\n    return None",
      explicacion: 'Reemplazar `593` donde aparezca rompe números que lo llevan en medio, como `099 593 1234`. Comprobar la posición y la longitud antes de tocar nada evita esos falsos positivos, y validar al final asegura que cada número devuelto tiene el mismo formato.'
    },
    {
      tipo: 'sql',
      titulo: 'Estados de pago revueltos',
      enunciado: 'Cada pago tiene un estado escrito a mano. Clasifícalo así, después de quitar espacios y pasar a minúsculas: `pagado` si es `pagado` o `pagada`; `pendiente` si empieza por `pend`; `revisar` en cualquier otro caso, incluidos los NULL. Devuelve cada estado limpio con su número de pagos, ordenado por estado. Algunos estados tienen espacios que la tabla de abajo no deja ver.',
      tablas: [{
        nombre: 'pagos',
        columnas: ['id', 'estado'],
        filas: [
          [1, 'PAGADO'], [2, ' pagado'], [3, 'Pendiente'], [4, 'pend.'],
          [5, null], [6, 'cancelado'], [7, 'Pagada '], [8, 'pagado']
        ]
      }],
      esperado: { columnas: ['estado_limpio', 'total'], filas: [['pagado', 4], ['pendiente', 2], ['revisar', 2]] },
      tablasExtra: [{
        nombre: 'pagos',
        columnas: ['id', 'estado'],
        filas: [[1, '  PEND'], [2, null], [3, null], [4, ''], [5, 'pagado']]
      }],
      esperadoExtra: [['pagado', 1], ['pendiente', 1], ['revisar', 3]],
      conOrden: true,
      pistas: [
        'Primero limpia el texto, quitando espacios y mayúsculas, y después decide en qué grupo cae.',
        '`CASE` evalúa las condiciones en orden y se queda con la primera que se cumple; lo que no encaja en ninguna va a `ELSE`.',
        'Agrupa por el estado ya clasificado y fíjate en qué cuentas: aquí los NULL también son pagos.'
      ],
      solucion: "SELECT CASE\n         WHEN LOWER(TRIM(estado)) IN ('pagado', 'pagada') THEN 'pagado'\n         WHEN LOWER(TRIM(estado)) LIKE 'pend%' THEN 'pendiente'\n         ELSE 'revisar'\n       END AS estado_limpio,\n       COUNT(*) AS total\nFROM pagos\nGROUP BY estado_limpio\nORDER BY estado_limpio;",
      incorrecta: "SELECT CASE\n         WHEN LOWER(TRIM(estado)) IN ('pagado', 'pagada') THEN 'pagado'\n         WHEN LOWER(TRIM(estado)) LIKE 'pend%' THEN 'pendiente'\n         ELSE 'revisar'\n       END AS estado_limpio,\n       COUNT(estado) AS total\nFROM pagos\nGROUP BY estado_limpio\nORDER BY estado_limpio;",
      explicacion: '`COUNT(estado)` ignora los NULL y deja el grupo `revisar` corto; `COUNT(*)` cuenta filas. En SQLite, `LIKE` no distingue mayúsculas en letras sin tilde, mientras que en PostgreSQL sí, por eso conviene pasar a minúsculas igualmente. Agrupar por un alias del `SELECT` funciona en SQLite, MySQL y PostgreSQL, pero no en SQL Server.'
    }
  ]
};
