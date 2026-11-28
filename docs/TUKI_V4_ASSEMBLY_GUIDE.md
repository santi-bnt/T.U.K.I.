# TUKI V4 — Guía de montaje y validación

> Para el ZIP R1, sigue primero [la revisión de bisagras, tuerca 05 y
> mantenimiento de T1](TUKI_V4_REPARACION_R1.md). La sección siguiente
> documenta la integración previa a esa reparación.

> **Lista de impresión vigente:** abre [`imprimir/LEEME.md`](../imprimir/LEEME.md).
> Las secciones históricas de esta guía no sustituyen ese inventario R1 ni sus
> resultados corregidos. El paquete fuente se conserva localmente en
> `.local-private/root-archives/source-zips/TUKI_V4_FINAL_A1_MINI.zip`.

## Paquete local para A1 mini

El paquete consolidado R1 contiene los accesos Ø8, muñeca 03 con cinco guías,
placa M3, diez abrazaderas, pasadores y la polea Ø28/Ø5 con paso nominal Ø2.
Las correcciones de barrenos y alivio de tuerca se describen en el informe R1.
Imprime primero los tres cupones y usa exclusivamente los STL listados en
`imprimir/LEEME.md`. Las orejas del SG90 reciben presión de las abrazaderas y
los tornillos centrales originales retienen las poleas.

Conserva la mano, los dedos y las poleas físicas existentes. Para aceptar
una polea de reemplazo, prueba primero una unidad del modelo nuevo. Comprueba
el acople Ø5 y el paso Ø2 con el hilo real. Imprime el cupón de pasador
antes de la cama de dos pasadores y ocho tapas. La cama es un solo trabajo
y contiene ambos pasadores. Instala cuatro tapas según el ajuste.
Haz el barrido manual con cada pasador instalado y con el arnés presentado.

Para revisar la muñeca, coloca su eje CAD Y aproximadamente vertical en
Bambu Studio. Selecciona A1 mini, boquilla de 0,4 mm y capa de 0,16 mm.
Revisa los cinco orificios en la vista de capas desde su primera abertura
hasta la salida. Rechaza puentes, costuras o soportes que tapen los canales,
e imprime una muestra antes de imprimir el conjunto. Pasa PE trenzado Ø0,36
por los cinco recorridos, tira en ambos sentidos y repite con las puertas
abiertas y cerradas. Rechaza atascos, deshilachado y pinzamientos.

Orden para esta revisión:

1. Imprime los tres cupones de `PRUEBAS/`. Prueba un SG90 con dos
   abrazaderas, el encaje corto del pasador y el paso del hilo.
2. Comprueba una polea con su tornillo central original. Gírala a mano en el
   recorrido previsto con el hilo presentado.
3. Presenta las diez abrazaderas sobre la placa según su número y lado.
   Usa como punto de partida diez M3×12 y diez tuercas M3. Mide cabeza,
   longitud emergente y acceso antes de apretar los cinco servos.
4. Fija la placa con los seis puntos estructurales. Comprueba el acceso
   con un útil Ø7 mm por los dos pasos Ø8 antes de tender los hilos.
5. Presenta la muñeca, los pasadores y el arnés. Haz el barrido de ambas
   puertas primero sin carga y luego con el cableado presentado.
6. Comprueba la palma impresa, la entrada de los cinco hilos y su retorno.
   Conserva la mano y los dedos. Prueba la ESP32 y la futura FRDM-KL25Z
   con dimensiones y conectores reales antes de modificar soportes.

Las secciones siguientes conservan contexto de la revisión base. Para
cantidades y selección de archivos usa el inventario del ZIP consolidado.

## Revisión de la muñeca y pruebas de banco

Usa la guía de cinco canales integrada en la muñeca 03 del prototipo revisado
para las pruebas de paso. Las guías auxiliares 07 y 14 corresponden al
generador anterior. Consulta el [informe STEP](TUKI_V4_MECHANICAL_REVIEW.md)
para distinguir la geometría auditada del registro original que sigue abajo.

1. Identifica los cinco SG90 y etiqueta sus cables. Registra para cada uno
   ancho, largo y altura del cuerpo, ancho y espesor de orejas, distancia entre
   tornillos, posición del eje respecto a las orejas, salida y radio de cable.
   Con la polea puesta, mide altura de garganta y bridas desde la cara superior
   de la placa. Prueba el asiento de cada SG90 sin forzar y verifica el giro
   con los cinco servos montados y sin tensar los tendones.
2. Presenta las seis fijaciones. Comprueba especialmente X = ±43, Y = −118 mm
   con ambas puertas abiertas y con el destornillador real. Mide largo de
   tornillo, diámetro de cabeza, profundidad de agarre y espacio para sacar la
   herramienta. Rechaza un montaje que dependa de doblar la placa.
3. Comprueba coaxialidad de cada bisagra y retención del pasador. Haz el
   barrido manual con una puerta y luego con ambas. Repite con el arnés
   instalado, cuidando que cierres y cables queden fuera de la trayectoria.
4. Prueba los cinco canales con el hilo real. Mide diámetro, radio de curva
   tolerado y fuerza de arrastre, y revisa que no aparezcan rebabas, desgaste,
   saltos de garganta o pérdida de retorno. Empieza por T5, que tiene la curva
   de menor radio. Registra los resultados con las puertas cerradas y abiertas.
5. Con la palma V2N sobre su plano de asiento, mide los centros X/Y de cada
   perforación desde la línea central y el borde de asiento, sus diámetros y
   profundidades, el contorno y espesor de la zona de apoyo, y las posiciones
   X/Y/Z y direcciones de entrada de los cinco tendones. Compara esos datos
   trasladados al datum de la muñeca con el STEP antes de atornillar.
6. Presenta la ESP32 Dev y reserva espacio para la futura FRDM-KL25Z con
   plantillas medidas. Registra dimensiones máximas, altura de conectores,
   patrón de agujeros, salida del plug y carrera de extracción. Separa el
   arnés de las poleas y bisagras, prueba acceso lateral y cierre sin pinzar
   cables. Define los soportes cuando estén confirmadas ambas envolventes.

Para la A1 mini inspecciona las siete piezas por separado. Empieza con la
placa sobre su cara plana y las puertas sobre su cara exterior si el laminador
confirma que los barriles quedan accesibles. Para la muñeca prueba eje Y
vertical, revisa cada canal capa por capa y evita soportes internos que no se
puedan retirar. Para carcasa y base compara apoyo estable y altura de
soportes antes de elegir orientación. Presenta un cupón primero.

> **Estado de la guía: prototipo de montaje.** El paquete V4 todavía no está
> aprobado como conjunto mecánico. Esta guía organiza pruebas; no certifica
> compatibilidad, seguridad, impresión ni rendimiento.

## 1. Resumen

Esta revisión histórica corresponde al paquete
`.local-private/root-archives/source-zips/TUKI_V4_ANTEBRAZO_ANCHO_5_SG90_DIAGONAL_PROTOTIPO.zip`:
carcasa ensanchada, base inferior, dos puertas abatibles, muñeca cubierta y
placa diagonal para cinco SG90. La mano/palma y los dedos ya impresos se
conservan; también se conserva sin cambios la polea TUKI Ø28 mm con agujero
circular Ø5 mm, cuyo acople fue confirmado físicamente por el usuario.

La salida de tendón hacia +X del generador original presenta interferencia
nominal con la polea siguiente. La revisión usa salidas tangentes por −X y
un abanico integrado en la muñeca. Su STEP/STL está disponible como prototipo.
La compatibilidad con la palma V2N sigue pendiente de medición.

### Estados

- **Conservado:** mano y dedos ya impresos; poleas TUKI Ø28/Ø5.
- **Comprobación de archivo solamente:** siete mallas cerradas por conteo de
  aristas y dentro de la caja nominal A1 Mini.
- **Prototipo:** placa, carcasa, base, puertas, muñeca y transición V4.
- **No aprobado:** ruta final de tendones, encaje V2N, giro de puertas, SG90 con
  cables/horns, electrónica, USB-C, tolerancias y resistencia.

## 2. Lista de piezas impresas

| STL del paquete V4 | Cantidad | Versión/uso | Observaciones |
|---|---:|---|---|
| `01_ANTEBRAZO_ESTILIZADO_HUECO.stl` | 1 | V4, carcasa | 122.70 × 117.00 × 73.20 mm; validar rigidez, placa y tendones |
| `02_PUERTA_ANTEBRAZO_ABATIBLE.stl` | 1 | V4, puerta superior | 121.45 × 117.00 × 12.20 mm; movimiento pendiente |
| `03_MUNECA_CUBIERTA_SOPORTE_PALMA.stl` | 1 | V4, muñeca | 108 × 65 × 62 mm; patrón V2K declarado, V2N no comprobado |
| `04_BASE_CERRADA_CON_BISAGRAS.stl` | 1 | V4, gabinete inferior | 125.20 × 142.50 × 94.20 mm; barrer puerta antes de aceptar |
| `05_PUERTA_GABINETE_ABATIBLE.stl` | 1 | V4, puerta inferior | 122.95 × 113 × 15.87 mm; cierres y acceso pendientes |
| `06_PLACA_DIAGONAL_5_SG90_28MM.stl` | 1 | V4, placa/rack | 100 × 161 × 3.2 mm; cinco cavidades nominales; fijaciones y cables pendientes |
| `10_CUBIERTA_FIJA_TRANSICION.stl` | 1 | V4, transición | 111.5 × 5.4 × 4 mm; uniones por confirmar |

**No imprimir todavía el conjunto completo.** Las guías de tendones no están
incluidas entre esos siete STL. El generador contiene propuestas adicionales
que no corresponden al inventario de la carpeta STL del ZIP.

### Piezas de la mano que se conservan

No modificar ni reimprimir como parte de V4:

- `hardware/printables/hand/01_CAMA_MANO_Y_ESTRUCTURA_SG90_12p6x24p1.stl`
- `hardware/printables/hand/02_CAMA_DEDOS_Y_5_POLEAS.stl`

Separar la cama conforme a su inventario existente. No usar coordenadas de la
cama como transformaciones de ensamblaje.

## 3. Componentes comerciales

| Componente | Cantidad | Estado/requisito |
|---|---:|---|
| SG90 de la misma variante | 5 | Medir cuerpos, orejas, eje, altura de horn y salida de cable; no se suministran en STL |
| Poleas TUKI Ø28 mm / agujero Ø5 mm | 5 | Conservar las ya validadas; inspeccionar ajuste y giro libre en cada servo |
| ESP32 Dev | 1 | Placa exacta aún no medida; no perforar soporte definitivo hasta medirla |
| NXP FRDM-KL25Z | 1 | Medir revisión física, conectores, componentes y USB; no usar envolvente inventado |
| Tornillos de fijación de placa | 6 | Fuente: agujeros de placa Ø3.3 mm; verificar cabeza, largo, soporte y acceso reales |
| Tornillos para SG90 | Según servo | Usar los que correspondan a las orejas del servo real; la placa declara agujeros piloto Ø2 mm |
| Tornillos de cierres/puertas | Según diseño | La fuente usa pasos nominales M3; comprobar agujero, rosca, largo y acceso |
| Pasadores lisos de bisagra | Según número de barriles | Alojamiento nominal Ø3.3 mm; diámetro/largo definitivos tras medir y probar cupones |
| Tendón/hilo | 5 tramos + reserva | Material, diámetro, longitud y resistencia siguen por elegir/medir; no asumir 1.6 mm, es solo la pantalla nominal |
| Mangas/guías de baja fricción | Según diseño | No incluidas; especificar tras definir tendón, radio y recorrido |
| Cableado de servos y placas | 5 servo leads + buses | Dejar holgura para apertura de puertas y evitar pellizcos |
| Fuente regulada externa de 5 V para servos | 1 | Dimensionar por corriente de arranque/atasco de los SG90 reales; no alimentar cinco servos desde placas |
| Cable de programación/datos USB | Según placa | Confirmar conectores físicos y acceso; el paso V4 no está alineado a una placa verificada |

Las tuercas, insertos y longitudes de tornillo dependen de los espesores reales y
no se fijan hasta probar cupones. Añadir arandelas donde eviten marcar piezas,
sin interferir con puertas o poleas.

## 4. Herramientas

- Calibrador digital y regla metálica.
- Desarmadores/llaves para los tornillos medidos; pinzas de punta.
- Escariador manual para limpiar agujeros impresos sin agrandarlos a ciegas.
- Cortador de hilo y marcador para identificar cada ruta.
- Balanza o dinamómetro pequeño para comparar fricción entre rutas, si está disponible.
- Multímetro; fuente de laboratorio con límite de corriente para pruebas eléctricas.
- Bambu Studio para verificar orientación, soportes, brim y dimensiones.
- Cautín solo si se fabrican arneses; aislar y revisar continuidad antes de instalar.

## 5. Ensamblaje por etapas

### Paso 1 — Inspección de las impresiones

No retires material de bisagras o encajes salvo rebaba suelta. Identifica cada
pieza, verifica grietas, capas levantadas y agujeros incompletos. Compara cada
pieza con su STL correcto.

**Checkpoint:** cada carcasa y puerta está identificada y sin daño estructural.
Rechaza grietas, paredes abiertas o bisagras deformadas. La malla cerrada del
archivo no garantiza una impresión correcta.

### Paso 2 — Medir mano y muñeca

Mide el plano de unión de la palma V2N: centros de agujeros, diámetros, datum,
espesor y espacio libre para tornillos. Superpón esas medidas con el STEP de la
muñeca V4 antes de taladrar o montar. La fuente V4 registra un patrón V2K, no
una interfaz V2N comprobada.

**Checkpoint:** aprobar solo si todos los centros y caras coinciden con las
medidas reales y la palma se asienta sin flexión ni interferencia. Si no,
detenerse y corregir la muñeca; no forzar ni modificar la mano impresa.

### Paso 3 — Probar un SG90 y el acople

Antes de instalar cinco, mide un servo real y compáralo con la cavidad,
separación de orejas, eje, altura, tornillos y salida del cable. Instala una
polea validada Ø28/Ø5. Comprueba que el agujero circular asiente como en la
prueba previa y que no patine; gira a mano y escucha/observa roce.

**Checkpoint:** el servo entra sin comprimir su carcasa ni deformar orejas; la
polea gira libremente, no toca la placa ni otras piezas y el cable no queda
pinzado. Rechaza si requiere apalancar o si la polea roza.

### Paso 4 — Presentar los cinco SG90 en la placa

Instala primero los cinco servos sin energizarlos. Comprueba orientación, cabezas
de tornillos, cables y acceso a cada tornillo. No instales el tendón todavía.

**Checkpoint:** los cinco cuerpos y sus accesorios caben a la vez; las poleas
mantienen separación, los cables pueden salir sin cruzar ejes y la placa no se
arquea al apretar. La separación nominal entre discos es 6.438 mm, aún sin
validación de altura/bridas/cables.

### Paso 5 — Fijar placa al antebrazo

Presenta la placa en los seis centros declarados. Inserta todos los tornillos a
mano primero; confirma que no hay roscas cruzadas y que las cabezas son
accesibles con herramienta. Aprieta de manera alternada y gradual.

**Checkpoint:** seis fijaciones alinean sin palanca, apoyan planas y no invaden
el volumen de las poleas, puertas ni canal de cables. Rechaza si la placa queda
combada o una fijación no alcanza soporte sólido.

### Paso 6 — Montar carcasa, base y muñeca sin mano

Une únicamente las piezas V4 del mismo paquete. Verifica caras de contacto,
continuidad del conducto y acceso a tornillos. Mantén la palma desmontada hasta
aprobar su interfaz.

**Checkpoint:** ninguna junta requiere presión para alinearse; los cables de
servo conservan un radio de salida y no quedan bajo nervios o bordes.

### Paso 7 — Probar las dos bisagras y cierres

Instala la puerta superior y la del gabinete con ejes lisos de diámetro medido.
Mueve una puerta a la vez, lentamente, con placa y servos instalados pero sin
tendones. Registra el ángulo cada 10° o menos desde 0° hasta el límite seguro;
repite con la otra puerta y después con ambas. Observa barriles, bordes, placa,
cables y cierres.

**Checkpoint:** movimiento continuo, sin raspado, salto, flexión ni separación
de capas. Las puertas deben cerrar sin empujarlas y sus tornillos/cierres deben
alinear sin forzar. Si rozan, registrar pieza, ángulo y punto; no lijar a ciegas.
El ZIP no aporta un barrido CAD y esta prueba está pendiente.

### Paso 8 — Preparar y probar rutas de tendones

Usa cordón de muestra del material y diámetro elegidos. Marca los cinco
canales. Sigue las tangentes por −X y el orden lateral de los canales. El
abanico comienza a Y = −24 mm, después de pasar la última polea nominal.

Comprueba a mano el recorrido completo hasta la palma y vuelve a recorrerlo con
las puertas cerradas y abiertas. Compara la fuerza necesaria para tirar de cada
hilo con un medidor o la misma pesa. Revisa que el hilo no se salga de ranura ni
se enrolle sobre una brida.

**Checkpoint:** los cinco hilos son independientes, no se cruzan, no rozan una
arista, no se pellizcan al cerrar y no cambian de tensión al abrir puertas. Si
hay fricción irregular o radio de giro abrupto, rechaza y rediseña guías antes
de accionar servos.

### Paso 9 — Instalar la mano V2N

Solo después de medir y aprobar el patrón de la palma. Presenta la mano sin
tendones tensos, verifica apoyo completo y atornilla de forma progresiva.

**Checkpoint:** la mano no queda inclinada, separada ni precargada; tendones
entran a cada dedo sin contacto con la cubierta. Si la interfaz no coincide,
detenerse: no abrir agujeros en la palma impresa.

### Paso 10 — Colocar ESP32 y KL25Z

Mide placas reales, componentes altos, conectores, cables y espacio de servicio.
Haz una plantilla de cartón o impresión de envelope basada en esas mediciones.
Define soportes desmontables sin invadir tendones, puertas ni acceso de USB.
Mide también el plug y su radio de cable antes de ubicar el paso lateral.

**Checkpoint:** cada placa puede instalarse y retirarse, conectores son
accesibles y cables no chocan con el recorrido móvil. No taladrar ni cortar el
panel del USB-C con medidas genéricas.

### Paso 11 — Revisar cableado y alimentación

Confirma continuidad, polaridad y tierra común entre controlador y fuente de
servos. La fuente de servos es externa; no alimentar los cinco SG90 desde la
ESP32 o la KL25Z. Asegura alivio de tensión y separa cables de tendones.

**Checkpoint:** puertas no pellizcan conductores, no hay cobre expuesto ni
cortos, conectores no tiran de las placas y la fuente está dimensionada para
la carga real. Mantener motores deshabilitados durante los ajustes mecánicos.

### Paso 12 — Cierre final y prueba progresiva

Primero cerrar ambas puertas con la electrónica apagada y revisar todos los
cierres. Luego probar un SG90, con tendones flojos, fuente limitada y recorrido
pequeño. Solo continuar con cada dedo y después con los cinco una vez comprobada
alimentación y ausencia de enganches.

**Checkpoint:** parada inmediata ante zumbido de servo bloqueado, calentamiento,
caída de tensión, tendón que se enrolla mal o puerta/cable en contacto. Una
prueba sin carga no valida capacidad de agarre ni límites mecánicos finales.

## 6. Problemas comunes

| Síntoma | Causas probables | Acción segura |
|---|---|---|
| SG90 no entra | Variante/dimensiones distintas, rebaba, orientación incorrecta | Medir servo y cavidad; probar cupón; no forzar ni agrandar sin revisar pared |
| Polea roza | Altura del eje, arandela/horn, separación vertical o tornillo | Retirar alimentación, revisar montaje; preservar Ø28/Ø5 y corregir soporte si hace falta |
| Tornillo no alcanza | Largo incorrecto, apoyo mal alineado o rosca piloto insuficiente | Medir stack y profundidad; no usar tornillo largo que invada otra pieza |
| Tendón se cruza | Fan-out antes de superar las poleas o canales mal asignados | Volver a cinco líneas paralelas y conservar orden en el abanico |
| Tendón se traba | Radio pequeño, fricción, borde rugoso o tubo deformado | Alisar solo tras localizar causa; medir fuerza de tracción y revisar ruta completa |
| Puerta no cierra | Eje no coaxial, barril deformado, colisión de cierre o cable pinzado | Retirar pasador, alinear y registrar el ángulo/punto; no limar antes de diagnosticar |
| Placa no alinea | Patrón o datum incorrecto, pieza de otra versión | Confirmar identidad V4; no combinar V2W/V2Y/V3 ni ampliar agujeros a ciegas |
| USB-C no accesible | Abertura conceptual sin relación con puerto medido | Medir placa y plug; rediseñar panel antes de impresión final |

## 7. Estado de ensamblaje y aprobación

Con la evidencia actual, TUKI V4 es **un conjunto CAD prototipo**, no un
ensamblaje mecánico aprobado. La polea Ø28/Ø5 y las piezas V2N impresas se
conservan. Los STL V4 caben por caja envolvente en A1 Mini, pero necesitan
revisión de orientación/slicer y pruebas de montaje. La salida +X debe
corregirse; -X es una solución de layout prometedora, todavía pendiente de guía
3D, holgura vertical, rozamiento y verificación física.

No declarar diseño final hasta completar los gates de este documento y el
informe `docs/TUKI_V4_MECHANICAL_REVIEW.md`, regenerar y revisar CAD/STL/STEP,
medir la interfaz V2N, comprobar el barrido de ambas puertas y probar cinco
servos/cables/tendones en la configuración real.
