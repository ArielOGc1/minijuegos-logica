import copy
import sqlite3
import sys


def _iguales(a, b):
    if isinstance(a, float) or isinstance(b, float):
        try:
            return abs(a - b) < 1e-6
        except TypeError:
            return False
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(_iguales(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_iguales(a[k], b[k]) for k in a)
    return a == b


def _revisar_python(ejercicio):
    nombre = ejercicio["funcion"].__name__
    for args, esperado in ejercicio["casos"]:
        llamada = f"{nombre}({', '.join(repr(a) for a in args)})"
        try:
            obtenido = ejercicio["funcion"](*copy.deepcopy(args))
        except NotImplementedError:
            return "SIN EMPEZAR", []
        except Exception as error:
            return "FALLA", [f"Caso: {llamada}", f"Error: {type(error).__name__}: {error}"]
        if not _iguales(obtenido, esperado):
            return "FALLA", [f"Caso: {llamada}", f"Esperado: {esperado!r}", f"Obtenido: {obtenido!r}"]
    return "PASA", []


def _revisar_sql(ejercicio):
    lineas = ejercicio["consulta"].splitlines()
    if not any(l.strip() and not l.strip().startswith("--") for l in lineas):
        return "SIN EMPEZAR", []
    for preparacion, esperado in ejercicio["datos"]:
        conexion = sqlite3.connect(":memory:")
        conexion.executescript(preparacion)
        try:
            obtenido = conexion.execute(ejercicio["consulta"]).fetchall()
        except sqlite3.Error as error:
            return "FALLA", [f"Error en la consulta: {error}"]
        finally:
            conexion.commit()
        conexion.close()
        comparar = (obtenido, esperado)
        if not ejercicio["con_orden"]:
            comparar = (sorted(obtenido, key=repr), sorted((tuple(f) for f in esperado), key=repr))
        if not _iguales(*comparar):
            return "FALLA", [
                f"Esperado: {[tuple(f) for f in esperado]}",
                f"Obtenido: {obtenido}"
            ]
    return "PASA", []


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    print(TITULO)
    print()
    correctos = 0
    for ejercicio in EJERCICIOS:
        revisar = _revisar_python if ejercicio["tipo"] == "python" else _revisar_sql
        estado, detalles = revisar(ejercicio)
        print(f"{ejercicio['numero']}. {ejercicio['titulo']}: {estado}")
        for detalle in detalles:
            print(f"   {detalle}")
        if estado == "PASA":
            correctos += 1
    print()
    print(f"Resultado: {correctos} de {len(EJERCICIOS)} ejercicios correctos.")
    return 0 if correctos == len(EJERCICIOS) else 1


if __name__ == "__main__":
    sys.exit(main())
