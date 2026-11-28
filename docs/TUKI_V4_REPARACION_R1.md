# TUKI V4 R1 para A1 mini

La selección activa de impresión está organizada en [`imprimir/LEEME.md`](../imprimir/LEEME.md). Este informe conserva los resultados de la auditoría CAD y no sustituye la validación física ni el laminado.

## Cambios CAD

- **01 y 02.** Taladro coaxial Ø3,50 mm sobre el eje superior original
  X = −61,5 mm, Z = 21 mm. Conservan los accesos Ø8.
- **04 y 05.** Taladro coaxial Ø3,50 mm sobre el eje inferior original
  X = −62 mm, Z = 27 mm.
- **01.** Alivio local Ø7,30 mm a X = 36 mm, Y = −72 mm, entre
  Z = −16,20 y −12,90 mm para la tuerca de la abrazadera 05 inferior
  angulada. Se conservan el centro de fijación, la placa y la abrazadera.

La fuente original cortaba Ø3,30 mm en cada barril antes de unirlo a
su soporte. Las cajas de soporte invadían el agujero al hacer la unión.
La corrección abre de nuevo la línea coaxial después de la unión.
Para los pasadores impresos Ø3,00, la holgura radial nominal es 0,25 mm.
En la sección cilíndrica ideal Ø8,40 quedan 2,45 mm de pared radial.
Estas medidas son de CAD.

La lectura de las caras cilíndricas confirmó Ø3,30 y Ø8,40 mm en
las cuatro piezas originales. La sonda Ø3 por franjas axiales de 1 mm
encontró obstrucciones en 54 muestras de 01, 54 de 02, 51 de 04 y 39 de 05.
El alivio de tuerca retiró 9,13 mm³ adicionales en 01. El solapamiento
original de la tuerca de 2,49 mm³ desapareció, conservando la posición de
la abrazadera y el apoyo de la placa.

## Validación CAD de R1

- Cero intersecciones volumétricas estáticas sobre 0,0001 mm³ en la
  configuración nominal auditada. Cero errores de operaciones booleanas.
- Las puertas pasaron 23 posiciones de 0° a 110° cada 5°, con pasadores,
  tapas, abrazaderas, poleas, tornillería nominal y tramos de hilo. La
  separación longitudinal entre puertas es 5,50 mm. El muestreo no mide
  todas las holguras entre ángulos.
- Los pasadores pasaron la inserción muestreada cada 5 mm con cada módulo
  separado. Las tapas Ø2,95 se evaluaron con la boca hacia el barril y
  2,4 mm de entrada nominal. La interferencia Ø0,05 mm con el eje es
  intencional para retención. Queda pendiente comprobar sujeción y
  fatiga de las tapas impresas.
- Los cinco tramos de hilo hacia la muñeca y los cinco tramos dentro de
  las guías pasaron la comprobación nominal. El útil Ø7 izquierdo conserva
  el solapamiento de 0,638 mm³ con T1 tendido. En la configuración de
  servicio con T1 retirado, ambos accesos Ø8 quedaron libres.
- La herramienta nominal de las abrazaderas quedó libre con las puertas
  retiradas. La separación nominal en Z de cabezas M3 a poleas es al
  menos 2,63 mm, según la altura de polea asumida.
- Los 22 STL, incluidos los tres cupones, caben por dimensiones en la
  A1 mini y pasaron el conteo de aristas. El ZIP incluye los pares y
  muestras en `VALIDACION/integracion.json` y las dimensiones en
  `VALIDACION/stl_inventario.json`.

## Montaje y mantenimiento

Presenta cada puerta y su cuerpo por separado antes de unir los dos
módulos. Inserta su pasador desde −Y, verifica giro libre y presenta
las tapas de presión. Comprueba su retención con una muestra. Monta
la tuerca 05 en la placa antes de instalarla en la carcasa.

Completa los ajustes con herramienta antes de presentar T1. Para mantenimiento,
descarga la tensión, marca los cinco hilos y desconéctalos de la mano o de su
anclaje accesible. Retira T1 completamente de la línea del acceso Ø8 izquierdo
antes de introducir el útil, y libera los otros hilos y el arnés antes de
extraer la placa. Comprueba en banco que se puede realizar esta secuencia.
Se conservan la muñeca de cinco guías, el hilo Ø0,36, los pasos de hilo
y las poleas Ø28/Ø5.

Imprime primero los tres cupones. Para el conjunto, imprime una unidad
de cada STL estructural 01–06 y 10, una de cada una de las diez abrazaderas
y una cama de pasadores y tapas. Prueba una polea y, si pasa, prepara cinco
en total. Conserva servos, sus tornillos centrales originales, palma y dedos.
Los STEP individuales de los pasadores acompañan la cama imprimible.
El ensamblaje STEP conserva 24 sólidos. La tapa de presión se incluye
como STEP independiente. Las únicas piezas reexportadas son 01, 02,
04 y 05 con el sufijo `_R1`, además del ensamblaje actualizado.

## Verificación pendiente en banco

Revisa el laminado a 0,16 mm con boquilla de 0,4 mm, especialmente los
taladros, puentes y las cinco guías. Prueba retención y desgaste de tapas
y pasadores, rigidez del soporte al apretar, acceso con la herramienta
real, giro de poleas, el paso del hilo bajo carga y una extracción
completa de placa sin cortar el tendón. Las comprobaciones CAD usan
envolventes nominales de los SG90, tornillería y cableado.
