# Revisión mecánica TUKI V4

## Auditoría STEP y revisión de muñeca

CadQuery 2.8.0 ejecutó la auditoría de sólidos del ZIP original en coordenadas
de ensamblaje. Los siete STEP cerrados no presentaron intersección volumétrica
por encima de 0,0001 mm³. El barrido usó los dos ejes originales con giro hacia
fuera de 0° a 110° cada 5°. No detectó penetración de las puertas contra los
sólidos fijos o envolventes nominales. Los intervalos Y de ambas puertas
están separados por 6 mm y se conservan al girar. El resultado cubre las
posiciones muestreadas. No mide contacto superficial ni holgura mínima entre
muestras; tampoco incorpora pasadores, cierres o cables reales.

Las envolventes provisionales de cinco cuerpos, orejas, cabezas de tornillo,
cables y discos Ø28 no mostraron penetraciones involuntarias entre conjuntos
distintos ni contra los sólidos cerrados. Se excluyeron intersecciones dentro
del mismo conjunto, como el asiento del tornillo; no se comprobaron rosca,
longitud de tornillo ni acople bajo carga. A Y = −118 mm un destornillador
recto modelado de Ø7 mm invade el antebrazo en ambas fijaciones, con 73,711 y
1,425 mm³ de solapamiento para X = −43 y +43 mm. La comprobación se hizo
contra la carcasa fija. Probar la herramienta real en esos dos puntos antes
de aligerar soportes. Las puertas cerradas bloquean el acceso directo a las
seis fijaciones tal como se espera.

La primera propuesta con tangentes paralelas invadió la pared izquierda con
T1 (13,832 mm³, centro aproximado X/Y/Z = −44,62/−89,43/5,85 mm). La revisión
usa una tangente recta desde el lado −X hasta una entrada desplazada 3 mm
hacia dentro para T1. Las cinco rutas son sólidos barridos de radio 0,8 mm,
a Z nominal 5,85 mm. El abanico entre Y = −24 y −5 mm mantiene los tramos
tangentes, atraviesa cinco canales cerrados de Ø2,7 mm integrados en la
muñeca y llega a las salidas nominales V4. El menor radio calculado para
T2–T5 es 5,73 mm. Falta medir el radio admisible del cordón y probar fatiga,
fricción y entrada al canal. La auditoría excluye el contacto esperado de
cada cordón con su propia polea en la zona de tangencia y lo comprueba de
nuevo a partir de 6 mm del eje hacia la muñeca.

La revisión pasó la intersección de los cinco tendones entre sí, contra los
demás discos, carcasa, placa, muñeca revisada y piezas fijas, así como
contra las puertas en las posiciones muestreadas. El material agregado a la
muñeca también quedó fuera del recorrido muestreado. La muñeca exportada es
un sólido válido. Los modelos nominales no establecen que la garganta real
quede a Z = 5,85 mm ni que las salidas coincidan con la palma V2N.

El STL revisado tiene 36.128 triángulos. Cada arista, con vértices redondeados
a 0,0001 mm, aparece dos veces. Sus dimensiones son 108 × 65 × 62 mm y
caben con Y vertical. Falta confirmar la orientación en el laminador.

Se exportaron `03_MUNECA_V4_GUIAS_PROTOTIPO.stl`,
`03_MUNECA_V4_GUIAS_PROTOTIPO.step` y el STEP de ensamblaje
`TUKI_V4_GUIAS_PROTOTIPO.step` en `.local-private/v4-routing-final/`.
La muñeca 03 es la única candidata a sustituir para esta modificación.
Las piezas originales 01, 02, 04, 05, 06 y 10 se mantienen como referencia
V4 sin cambios. Los informes reproducibles son
`.local-private/v4-baseline/baseline.json` y
`.local-private/v4-routing-final/routing.json`.

### Inventario de exportación

El ZIP distribuye 01–06 y 10. Son las siete piezas del ensamblaje estructural
V4, todas en estado de prototipo. El generador exporta además dos guías
auxiliares antiguas (07, 14) y cinco cupones (08 pasacable, 09 patrón de palma
nominal, 11 y 12 mitades de bisagra, 13 encaje SG90). Ninguno de esos siete
extras forma parte del STEP de ensamblaje. La nueva muñeca integra sus propios
canales, así que no se instala junto con 07 ni 14.

## Registro anterior a la auditoría STEP

**Estado: PROTOTIPO — no liberar para impresión funcional ni declarar ensamblable.**
Fecha: 2026-11-25. Revisión del paquete local
`.local-private/root-archives/source-zips/TUKI_V4_ANTEBRAZO_ANCHO_5_SG90_DIAGONAL_PROTOTIPO.zip`.

## Alcance y archivos

El paquete aporta `TUKI_V4_CAD_PARAMETRICO.py`, un STEP de ensamblaje, siete
STEP por pieza y siete STL. Se conservaron sin modificación. La mano/palma y
dedos impresos V2N tampoco se modificaron.

Se comprobó cada STL binario por dimensiones y conteo de aristas de triángulos:
las aristas aparecen compartidas por dos triángulos y ninguna malla excede el
volumen nominal A1 Mini por caja envolvente. Eso es una comprobación de malla,
no una revisión B-rep, una simulación de puertas o un fit test.

| Pieza del paquete | Extensión STL (mm) | Resultado limitado |
|---|---:|---|
| `01_ANTEBRAZO_ESTILIZADO_HUECO` | 122.70 × 117.00 × 73.20 | Malla cerrada; montaje/rigidez sin validar |
| `02_PUERTA_ANTEBRAZO_ABATIBLE` | 121.45 × 117.00 × 12.20 | Malla cerrada; giro no simulado |
| `03_MUNECA_CUBIERTA_SOPORTE_PALMA` | 108.00 × 65.00 × 62.00 | Malla cerrada; interfaz a V2N no verificada |
| `04_BASE_CERRADA_CON_BISAGRAS` | 125.20 × 142.50 × 94.20 | Malla cerrada; apertura de puerta no simulada |
| `05_PUERTA_GABINETE_ABATIBLE` | 122.95 × 113.00 × 15.87 | Malla cerrada; giro no simulado |
| `06_PLACA_DIAGONAL_5_SG90_28MM` | 100.00 × 161.00 × 3.20 | Malla cerrada; servo/tornillería real no modelados |
| `10_CUBIERTA_FIJA_TRANSICION` | 111.50 × 5.40 × 4.00 | Malla cerrada; interfaces sin prueba física |

Todas caben nominalmente en 180 × 180 × 180 mm por dimensiones. No se abrió un
laminador, por lo que orientación, soportes, adherencia y resistencia de capa
no están aprobados.

## Ruta de tendones: corrección respaldada por el layout

La fuente ubica los centros de salida en `(-30,-168), (-15,-137), (0,-106),
(15,-75), (30,-44) mm`, usa radio de polea 14 mm y configura los cinco lados
de tangencia como `+X`. El siguiente centro está 15 mm a la derecha y 31 mm más
cerca de la muñeca. La línea que parte de la tangencia +X queda a 1 mm del
siguiente eje: **interferencia nominal de 13 mm con el disco Ø28**, antes de
sumar el radio del tendón. Debe abandonarse esa salida.

La pantalla analítica `hardware/cad/editable/tuki_v4_review/check_v4_tendon_layout.py`
calcula que los rayos iniciales -X, conservados paralelos hacia la muñeca,
mantienen al menos **14.2 mm de holgura proyectada** a otros discos, suponiendo
un tendón Ø1.6 mm. Los centros vecinos están separados 34.438 mm, con un hueco
nominal de 6.438 mm entre discos. Son valores XY; no incluyen bridas, ranura,
altura real del tambor, tornillos, cables, flexión del tendón ni tolerancias.

La ruta candidata es: salida tangencial -X → cinco canales longitudinales
paralelos hasta superar el borde +Y de la última polea → abanico monotónico,
sin cruces, mediante guía separada con radios → paso por la muñeca. La posición
del plano de abanico `Y=-20 mm` solo se propone como referencia inicial: deja
10 mm desde el borde nominal de la última polea (`Y=-30 mm`) en la proyección
XY. No se ha diseñado ni generado una guía final. El bloque de guía anterior en
`Y=-32 mm`, canal `X=27 mm`, se aproxima a 12.369 mm del eje de la polea superior;
la envolvente de polea y tendón excede esa separación en 2.431 mm en XY. Falta
resolver su posición Z con CAD completo, no ocultar el solapamiento.

El análisis XY precedió a la ejecución de CadQuery fuera del sandbox. La
auditoría STEP y el nuevo STL se describen al inicio.

## Estado de componentes

| Componente | Estado | Acción |
|---|---|---|
| Polea TUKI Ø28 / agujero Ø5 | Aprobada por confirmación del usuario para el acople físico; no redimensionar | Conservar las cinco poleas ya hechas; comprobar que cada una gire libre al instalar |
| Palma, dedos y rack ya impresos | Conservar; ninguna modificación solicitada | No reimprimir como parte de V4 |
| Placa diagonal | Prototipo | La fuente declara cinco recortes 13.2 × 24.4 mm, agujeros Ø2 y offset de eje 5.25 mm estimado. Probar cada SG90 real y su montaje antes de aceptar; tornillos/cabezas no se modelan como componentes |
| Antebrazo, puerta superior, base y puerta inferior | Prototipo; posición cerrada solamente | Requieren revisión de bisagras y barrido antes de reimprimir |
| Muñeca/cubierta | No compatible declarada con V2N | El generador usa el patrón nominal que etiqueta V2K (x=±17; y=8/19). Medir la palma V2N y corregir solo después |
| Cubierta de transición | Prototipo | Revisar unión, tornillos y espacio con puerta en todo el recorrido |
| Guías de tendón | No entregadas como piezas STL del paquete de siete; las guías del generador están marcadas como propuestas | Diseñar, montar y verificar antes de tender/accionar |
| ESP32 Dev y FRDM-KL25Z | Sin envelopes/soportes V4 medidos | Medir placas reales, componentes, conectores, USB y radios de cable; mantener soportes parametrizados y sin agujeros definitivos |

### Fijaciones y holguras no aprobadas

La placa declara seis centros: `(±43,-185)`, `(±43,-118)` y `(±43,-64) mm`;
cuatro soportes se asignan al antebrazo y dos a la base. Es una definición
nominal. No se comprobó la herramienta de acceso, el largo de tornillo, la
profundidad de rosca, la cabeza, la flexión de placa ni el solape real de sus
apoyos en una geometría B-rep cargada.

El archivo de validación anuncia una separación polea-polea de 6.438 mm y
4.401 mm a una cabeza de tornillo supuesta de 6 mm. No hay sólidos de SG90,
orejas, tornillos, cables ni poleas completas en los siete STEP de carcasa/placa;
por eso esos números no certifican el conjunto real.

### Bisagras y puertas

La fuente da ejes Y para la puerta superior en `X=-61.5, Z=21 mm` y para la
puerta de gabinete en `X=-62, Z=27 mm`; define alojamientos de 3.3 mm y barriles
intercalados. El paquete no incluye barrido 0°–apertura final. No se puede
informar un ángulo real de colisión ni aceptar pasadores/cierres. Probar ambos
con un eje liso de diámetro medido; no asumir que un tornillo roscado es un
pasador de bisagra adecuado.

### Electrónica y conectores

El gabinete ofrece volumen conceptual, pero no contiene modelos medidos de la
ESP32 Dev o FRDM-KL25Z ni sus conectores, cables o soportes. La abertura lateral
nominal 21 × 12 mm no se alinea con una placa concreta. No cortar ni imprimir
definitivamente el panel USB-C hasta medir el conector/plug y su posición.

## Piezas a corregir y reimprimir

No se aprobó ninguna pieza V4 para impresión funcional. Una vez corregido y
regenerado el CAD, el subconjunto potencialmente afectado es:

1. `06_PLACA_DIAGONAL_5_SG90_28MM` y su guía nueva: cambios de ruta/retención y
   comprobación con los cinco servos reales.
2. `01_ANTEBRAZO_ESTILIZADO_HUECO`, `02_PUERTA_ANTEBRAZO_ABATIBLE`,
   `04_BASE_CERRADA_CON_BISAGRAS` y `05_PUERTA_GABINETE_ABATIBLE`: solo si la
   simulación de bisagras, acceso o colisiones exige cambios.
3. `03_MUNECA_CUBIERTA_SOPORTE_PALMA`: corregir la interfaz tras medir V2N.
4. `10_CUBIERTA_FIJA_TRANSICION`: modificar únicamente si la guía, muñeca o
   puerta requiere espacio nuevo.

No reimprimir la palma, dedos ni las poleas Ø28/Ø5 validadas. No mezclar la base,
puertas o placa V4 con piezas V2Y/V3/V2W sin comprobar cada interfaz.

## Puerta de impresión A1 Mini

Los siete STL caben por caja envolvente; la placa ocupa 100 × 161 × 3.2 mm y es
la pieza más larga (161 mm). Esa comprobación no incluye brim ni soportes. Como
no hubo laminado, no hay orientación aprobada. Importar cada STL por separado
en Bambu Studio, orientar para evitar soportes en agujeros/bisagras, verificar
que brim y soportes respeten 180 mm, revisar paredes y puentes, y guardar el
proyecto de laminado antes de imprimir cupones y luego una sola pieza de prueba.

## Pruebas físicas necesarias antes de declarar V4 ensamblable

Ver `docs/TUKI_V4_ASSEMBLY_GUIDE.md` para el protocolo por fases. Los gates
principales son: palma V2N medida; los cinco servos sin forzar; giro de polea
libre; cinco rutas separadas sin cruce ni roce sostenido; placa rígida; dos
puertas barridas sin contacto; electrónica medida y accesible; prueba de
ensamble sin tensión; y finalmente prueba de movimiento con fuente de 5 V
externa limitada y tendones flojos.
