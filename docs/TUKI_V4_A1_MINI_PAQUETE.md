# TUKI V4 para A1 mini

> Inventario histórico del ZIP parcial. El paquete vigente y sus
> interferencias se describen en [la integración de parches](TUKI_V4_INTEGRACION_PARCHES.md).

**Base CAD parcial para revisión. La conversión M3, el acceso de herramienta,
los pasadores y la polea con paso Ø2 quedan pendientes.** El nombre del ZIP
identifica el entregable solicitado.

## Qué incluye

| STL en `STL_BASE_PARA_REVISION/` | Cantidad prevista | Alcance |
|---|---:|---|
| `01_ANTEBRAZO_ESTILIZADO_HUECO.stl` | 1 | V4 original. Revisar acceso a tornillos |
| `02_PUERTA_ANTEBRAZO_ABATIBLE.stl` | 1 | V4 original. Falta probar con pasador |
| `03_MUNECA_V4_GUIAS_PROTOTIPO.stl` | 1 | Muñeca revisada, con cinco guías. Candidata para laminado de prueba |
| `04_BASE_CERRADA_CON_BISAGRAS.stl` | 1 | V4 original |
| `05_PUERTA_GABINETE_ABATIBLE.stl` | 1 | V4 original. Falta probar con pasador |
| `06_PLACA_DIAGONAL_5_SG90_28MM.stl` | 1 | V4 original con agujeros nominales Ø2 para SG90. Referencia para la conversión |
| `10_CUBIERTA_FIJA_TRANSICION.stl` | 1 | V4 original |

Conserva la mano y los dedos ya impresos, los cinco SG90 y sus tornillos
centrales originales. Conserva las poleas físicas Ø28/Ø5 y comprueba su
paso de hilo antes de asignarlas al conjunto. Para la próxima impresión
de prueba, comienza por la muñeca 03 después de revisar su laminado.

El STEP de ensamblaje y los siete STEP individuales corresponden a la
misma configuración. El CAD editable incluye el generador histórico como
entrada de referencia y el script de revisión construido sobre los STEP del
ZIP original. El generador histórico por sí solo produce también piezas
anteriores. El inventario de impresión aquí excluye la muñeca antigua,
las guías 07 y 14 y todos los cupones del generador original.

## Archivos que faltan

- CAD y STL de las abrazaderas de los cinco SG90 para M3, junto con la
  placa V4 modificada que recibe esas abrazaderas.
- CAD y STL de las piezas V4 con acceso de herramienta corregido en
  X = ±43, Y = −118 mm.
- CAD y STL de los pasadores impresos para las bisagras 02 y 05, con su
  retención y sentido de inserción.
- Malla o STEP de la polea Ø28/Ø5 con paso continuo de Ø2. El archivo
  `Downloads/TUKI_POLEA_28MM_AGUJERO_CENTRAL_5MM.stl` mide 28 mm por fuera
  y Ø5 nominal en el centro. Un corte de malla en Y = 8,51 mm y Z = 2,2 mm
  da aproximadamente **1,20 mm** de ancho libre en el paso de hilo. Los
  otros STL de polea encontrados están identificados como V2Z. Ninguno se
  incluyó como polea solicitada.

## Colisiones, tolerancias e impresión

- El informe CAD anterior comprobó la estructura y las rutas nominales
  con la muñeca revisada. El barrido de puertas de 0° a 110°, cada 5°,
  no encontró penetración en las muestras. Quedan fuera de esa prueba
  los pasadores, las abrazaderas M3 y el arnés reales.
- Un útil recto de Ø7 mm intersecta la carcasa en ambas posiciones
  X = ±43, Y = −118 mm. Hace falta una corrección verificada o comprobar
  que la herramienta disponible permite el montaje.
- Los cinco canales se generan con diámetro nominal 2,70 mm. El barrido
  previo de Ø1,60 mm quedó libre de penetración en la muñeca. Un hilo
  ideal Ø0,36 por la misma trayectoria deja 1,17 mm de margen radial
  nominal respecto al canal. Esto no mide la garganta de la polea física
  ni la holgura de un canal impreso.
- La comprobación STL mide los siete volúmenes con orientaciones por
  ejes. La muñeca admite Y vertical por dimensiones. El perfil A1 mini
  de 0,4 mm y 0,16 mm está disponible localmente. El intento de CLI no
  produjo datos de laminado. Las capas, puentes y soportes deben
  inspeccionarse en Bambu Studio y comprobarse con hilo real.

Las pruebas físicas pendientes incluyen patrón de palma V2N, paso del
hilo, altura de garganta, montaje con tornillería M3, apertura y retención
de ambas bisagras y ajuste de las placas electrónicas.
