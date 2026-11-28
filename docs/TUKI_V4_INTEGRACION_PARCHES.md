# TUKI V4 para A1 mini

**Candidato consolidado con interferencias abiertas.** El ZIP contiene un
ensamblaje STEP con 24 sólidos impresos, los STEP individuales, las fuentes
recibidas, los STL seleccionados y el informe. Los servos, tornillos, tuercas,
herramienta y trayectorias son modelos nominales de auditoría. El STEP no
representa las tapas de presión, la mano V2N ni el cableado real.

## Inventario

| Archivo o grupo en `STL/` | Cantidad prevista |
|---|---:|
| `01_ANTEBRAZO_ESTILIZADO_HUECO_ACCESOS_D8.stl` | 1 |
| `02_PUERTA_ANTEBRAZO_ABATIBLE_ACCESOS_D8.stl` | 1 |
| `03_MUNECA_V4_GUIAS_PROTOTIPO.stl` | 1 |
| `04_BASE_CERRADA_CON_BISAGRAS.stl` | 1 |
| `05_PUERTA_GABINETE_ABATIBLE.stl` | 1 |
| `06_PLACA_V4_DIAGONAL_5_SG90_M3.stl` | 1 |
| `10_CUBIERTA_FIJA_TRANSICION.stl` | 1 |
| Diez STL `ABRAZADERA_M3_*` | 1 de cada posición |
| `TUKI_V4_PLACA_2_PASADORES_8_TAPAS_A1_MINI.stl` | 1 cama con ambos pasadores y ocho tapas |
| `TUKI_POLEA_28MM_EJE_5MM_PASO_HILO_2MM_ANTICIERRE.stl` | 1 de prueba, 5 para el conjunto tras validarla |

Conserva los cinco SG90 y sus tornillos centrales originales, la palma y
los dedos impresos. Para las abrazaderas, la entrega propone diez M3×12 y
diez tuercas M3 como punto de partida. Los tres cupones de `PRUEBAS/` se
imprimen por separado. El inventario detallado está en
`VALIDACION/stl_inventario.json`.

## Resultados CAD

| Comprobación | Resultado |
|---|---|
| Pasador superior Ø3 | Intersecta cuerpo 01 en 109,315 mm³ y puerta 02 en 162,798 mm³. |
| Pasador inferior Ø3 | Intersecta base 04 en 321,005 mm³ y puerta 05 en 173,071 mm³. |
| Barrido de 0° a 110° cada 5° | El pasador correspondiente interfiere con cada puerta en las 23 posiciones. Las demás combinaciones de puertas del barrido no dieron penetración. |
| Tuerca M3 de 05 inferior angulada | La envolvente nominal invade el soporte de 01 en 2,488 mm³. |
| Herramienta Ø7 por los accesos Ø8 | 01 y 02 quedan libres. El acceso izquierdo cruza T1 en 0,638 mm³. Monta y ajusta la placa antes de tender T1. |
| Abrazaderas, cabezas M3, poleas e hilo | Sin penetración detectada entre estos elementos en sus posiciones nominales. La comprobación de la polea usa una posición angular y altura de montaje supuesta. El hilo Ø0,36 se comprobó desde la tangencia nominal de la garganta hasta la entrada de la guía. Falta comprobar su salida durante el giro bajo carga y su paso por la polea impresa. |

La revisión registró cero errores de operaciones booleanas. El informe
`VALIDACION/integracion.json` contiene pares, volúmenes y centros. El
montaje del pasador se probó por traslaciones cada 5 mm desde −Y. Aún hay
que definir el sentido de inserción viable y corregir las interferencias
antes de usar los pasadores largos. Las tuercas y cabezas se modelaron con
medidas nominales. Usa la tornillería real para confirmar el espacio que
requiere la fijación 05.

Todos los STL seleccionados caben por dimensiones en 180 × 180 × 180 mm y
pasaron el conteo de aristas. Queda pendiente el laminado con boquilla de
0,4 mm, capa de 0,16 mm, los orificios sin obstrucciones, el patrón de la
palma impresa, el arnés y el ajuste de las tapas de presión.

## Reproducción

El script `CAD/integrate_patches.py` usa CadQuery 2.8, el paquete original
`TUKI_V4_FALTANTES_PARA_CODEX.zip` y el ZIP parcial previo a esta integración.
Desde la raíz del repositorio se puede repetir así:

```powershell
python hardware/cad/editable/tuki_v4_review/integrate_patches.py "$env:USERPROFILE/Downloads/TUKI_V4_FALTANTES_PARA_CODEX.zip" .local-private/v4-before-patches.zip .local-private/v4-combined-repeat
```
