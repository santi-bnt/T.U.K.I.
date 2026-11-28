# TUKI V4 R1 — Archivos para imprimir

Esta carpeta contiene únicamente los STL seleccionados del inventario consolidado
V4 R1. Imprime primero los tres cupones, en el orden indicado. El estado
«candidato R1» significa que la geometría pasó las comprobaciones CAD descritas
en `docs/TUKI_V4_REPARACION_R1.md`; no significa que se haya laminado o probado
físicamente.

Para las piezas definitivas, conserva inicialmente la orientación incluida en
cada STL. Las orientaciones y los soportes deben confirmarse en Bambu Studio con
la A1 mini antes de imprimir. No se incluyen la mano ni los dedos porque ya se
imprimieron y no cambiaron en R1.

## 00_PRUEBAS — imprimir primero

| STL exacto | Cantidad | Orden | Tipo | Soportes | Orientación A1 mini | Validación |
|---|---:|---:|---|---|---|---|
| `CUPON_PRUEBA_SG90_DOS_ABRAZADERAS_M3.stl` | 1 | 1 | Prueba de encaje SG90/abrazaderas M3 | Revisar en laminador | Mantener la cara plana sobre la cama según el STL | Malla cerrada y dentro del volumen por dimensiones; falta laminar y probar con el servo real. |
| `TUKI_V4_TEST_AJUSTE_PASADOR_D3p0_L18.stl` | 1 | 2 | Prueba de ajuste del pasador Ø3 | No determinado; revisar en laminador | Eje largo paralelo a la cama, según el STL | Malla cerrada y dentro del volumen; tolerancia y retención físicas pendientes. |
| `CUPON_PASO_HILO_1p6_1p8_2p0.stl` | 1 | 3 | Prueba del paso del hilo | Revisar puentes/canales en laminador | Mantener la base plana según el STL | Malla cerrada y dentro del volumen; comprobar el hilo real Ø0,36 mm después de imprimir. |

## 01_ANTEBRAZO — una unidad por pieza

| STL exacto | Cantidad | Orden | Tipo | Soportes | Orientación A1 mini | Validación |
|---|---:|---:|---|---|---|---|
| `01_ANTEBRAZO_ESTILIZADO_HUECO_ACCESOS_D8_R1.stl` | 1 | 4 | Estructural R1 | Revisar cavidades y acceso en laminador | Mantener orientación del STL | Malla cerrada y caja dentro de 180 mm; montaje físico pendiente. |
| `02_PUERTA_ANTEBRAZO_ABATIBLE_ACCESOS_D8_R1.stl` | 1 | 5 | Estructural R1 | Revisar barriles de bisagra | Mantener orientación del STL | Malla cerrada y caja dentro de 180 mm; giro físico pendiente. |
| `03_MUNECA_V4_GUIAS_PROTOTIPO.stl` | 1 | 6 | Prototipo estructural R1 con cinco guías | Revisar canales; evitar soportes internos inaccesibles | Mantener orientación del STL y revisar eje de guías | Malla cerrada y caja dentro de 180 mm; paso de hilo y compatibilidad de palma pendientes. |
| `04_BASE_CERRADA_CON_BISAGRAS_R1.stl` | 1 | 7 | Estructural R1 | Revisar cavidades y barriles | Mantener orientación del STL | Malla cerrada y caja dentro de 180 mm; montaje físico pendiente. |
| `05_PUERTA_GABINETE_ABATIBLE_R1.stl` | 1 | 8 | Estructural R1 | Revisar barriles y cierres | Mantener orientación del STL | Malla cerrada y caja dentro de 180 mm; giro y cierre físicos pendientes. |
| `06_PLACA_V4_DIAGONAL_5_SG90_M3.stl` | 1 | 9 | Placa diagonal M3 | Revisar voladizos de abrazaderas | Cara plana sobre la cama, si el laminador conserva los detalles | Malla cerrada y caja dentro de 180 mm; rigidez, acceso y montaje pendientes. |
| `10_CUBIERTA_FIJA_TRANSICION.stl` | 1 | 10 | Cubierta estructural R1 | Revisar en laminador | Mantener orientación del STL | Malla cerrada y caja dentro de 180 mm; ajuste físico pendiente. |

## 02_SERVOS_Y_POLEAS

Imprime una unidad de cada abrazadera para el SG90 indicado. El conjunto usa
cinco servos; las abrazaderas superiores/inferiores se imprimen en pares.

| STL exacto | Cantidad | Orden | Tipo | Soportes | Orientación A1 mini | Validación |
|---|---:|---:|---|---|---|---|
| `ABRAZADERA_M3_01_INFERIOR.stl` | 1 | 11 | Abrazadera inferior servo 01 | Revisar en laminador | Mantener orientación del STL | Malla cerrada; encaje real con servo pendiente. |
| `ABRAZADERA_M3_01_SUPERIOR_ANGULADA.stl` | 1 | 11 | Abrazadera superior servo 01 | Revisar en laminador | Mantener orientación del STL | Malla cerrada; encaje real con servo pendiente. |
| `ABRAZADERA_M3_02_INFERIOR.stl` | 1 | 12 | Abrazadera inferior servo 02 | Revisar en laminador | Mantener orientación del STL | Malla cerrada; encaje real con servo pendiente. |
| `ABRAZADERA_M3_02_SUPERIOR.stl` | 1 | 12 | Abrazadera superior servo 02 | Revisar en laminador | Mantener orientación del STL | Malla cerrada; encaje real con servo pendiente. |
| `ABRAZADERA_M3_03_INFERIOR.stl` | 1 | 13 | Abrazadera inferior servo 03 | Revisar en laminador | Mantener orientación del STL | Malla cerrada; encaje real con servo pendiente. |
| `ABRAZADERA_M3_03_SUPERIOR.stl` | 1 | 13 | Abrazadera superior servo 03 | Revisar en laminador | Mantener orientación del STL | Malla cerrada; encaje real con servo pendiente. |
| `ABRAZADERA_M3_04_INFERIOR.stl` | 1 | 14 | Abrazadera inferior servo 04 | Revisar en laminador | Mantener orientación del STL | Malla cerrada; encaje real con servo pendiente. |
| `ABRAZADERA_M3_04_SUPERIOR.stl` | 1 | 14 | Abrazadera superior servo 04 | Revisar en laminador | Mantener orientación del STL | Malla cerrada; encaje real con servo pendiente. |
| `ABRAZADERA_M3_05_INFERIOR_ANGULADA.stl` | 1 | 15 | Abrazadera inferior servo 05 | Revisar en laminador | Mantener orientación del STL | Malla cerrada; holgura CAD al soporte corregida; sujeción física pendiente. |
| `ABRAZADERA_M3_05_SUPERIOR.stl` | 1 | 15 | Abrazadera superior servo 05 | Revisar en laminador | Mantener orientación del STL | Malla cerrada; encaje real con servo pendiente. |
| `TUKI_POLEA_28MM_EJE_5MM_PASO_HILO_2MM_ANTICIERRE.stl` | 5 | 16* | Polea TUKI Ø28, eje circular Ø5, paso de hilo Ø2 | Revisar canal y agujero en laminador | Mantener orientación del STL; verificar agujero/eje antes de duplicar | Malla cerrada; imprimir primero una unidad, comprobar acople y paso del hilo, y solo entonces las cuatro restantes. |

## 03_BISAGRAS

| STL exacto | Cantidad | Orden | Tipo | Soportes | Orientación A1 mini | Validación |
|---|---:|---:|---|---|---|---|
| `TUKI_V4_PLACA_2_PASADORES_8_TAPAS_A1_MINI.stl` | 1 cama (2 pasadores + 8 tapas) | 17 | Pasadores y seguros imprimibles | Revisar piezas pequeñas en laminador | Mantener la disposición de cama del STL | Malla cerrada y caja dentro de 180 mm; ajuste, giro y retención de tapas pendientes. |

\* Para la primera prueba, configura solo 1 polea; imprime 5 en total únicamente
si el cupón/acople Ø5 y el paso del hilo se validan físicamente.

## Qué conservar y qué no imprimir

- Conserva sin cambios la palma, la mano y los dedos ya impresos. No forman
  parte de este trabajo ni se deben reimprimir por esta revisión.
- Conserva la polea existente Ø28/Ø5 que el propietario ya probó; el STL de
  polea es una alternativa para evaluar y no obliga a reemplazarla.
- No imprimas STL V2Y, V3, V4 anteriores ni CAD/STEP desde carpetas históricas.
  Esta carpeta es la selección R1; no combinar archivos por nombre parecido.
- Cifras de envolvente/topología provienen del inventario CAD del ZIP. No se ha
  realizado slicing en Bambu Studio ni una impresión física. Antes de imprimir
  piezas estructurales, inspecciona paredes, canales, tolerancias, soportes y
  accesos en el laminador.

Consulta [el informe R1](../docs/TUKI_V4_REPARACION_R1.md) para el alcance de la
auditoría CAD, las limitaciones y las pruebas físicas pendientes.
