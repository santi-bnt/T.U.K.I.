# Manifiesto de procedencia por archivo — TUKI V2N

Auditoría complementaria del 2026-11-22. La búsqueda cubrió los archivos del repositorio, ramas y objetos Git disponibles, ZIP TUKI en Downloads, y archivos con nombres V2N/V2K en OneDrive. No se reconstruyeron ni modificaron STL.

**Nota de vigencia:** la tabla de abajo describe los archivos que ocupaban las rutas web durante la auditoría inicial y conserva sus hashes y conclusiones históricas. La actualización del 2026-11-23 documenta los tres recursos actuales y sustituye su estado de publicación; los bloqueos antiguos no describen el GLB ni los renders actuales.

## Recursos usados por la web

| Archivo | Evidencia concreta | Conclusión de origen | Publicación |
|---|---|---|---|
| `web/public/models/tuki-v2n.glb` (SHA-256 `e872af8596331594b18f9a8a2e3a5ab43ea4232cbfcffa39f79c4bf225edf874`) | Mismo hash, 5,198,064 bytes, en los dos ZIP de migración V2N. GLB v2 válido; buffer binario embebido; cero URI externos; 45 nodos, 39 mallas, 5 animaciones. Las mallas nombradas corresponden a 277,484 triángulos que coinciden con las STL V2N comparadas, usando triángulos GLB transformados a milímetros, vértices ordenados y redondeo a 0.01 mm. | Export inmediato desde las STL V2N entregadas, con identidad de malla en la comparación. No demuestra el diseño que produjo esas STL: no se encontró `build_v2n`, exportador STL→GLB ni STEP de ensamblaje. | No staging/publicación hasta que el responsable confirme derechos para redistribuir y acepte/resuelva incertidumbres materiales de derivación. La falta de fuente afecta trazabilidad técnica; por sí sola no determina infracción. |
| `web/public/images/tuki-v2n-exterior.png` (SHA-256 `7c3d4af2f5e6c089851f1e9f7afe44e503069658f046af1f8c8a261aa2ef427c`) | Hash y tamaño (114,820 bytes) coinciden con `MANIFEST_SHA256.json` y el archivo del ZIP de migración. PNG sin chunks de autoría, EXIF, texto o parámetros de cámara. El paquete las llama vistas del CAD actual. No se encontró el script de render. | Recurso aportado con la migración y visualmente coherente con el GLB. No hay evidencia suficiente para afirmar que se renderizó directamente desde este GLB en particular. | Confirmar que el responsable posee derechos para publicar el render; dejar explícito que el proceso de render no fue recuperado. |
| `web/public/images/tuki-v2n-interior.png` (SHA-256 `b42d4ee628428fb07573bafd02a9f92eadc5442c36060416b21db0eeb4f12f32`) | Hash y tamaño (146,534 bytes) coinciden con el manifiesto y ZIP de migración. Sin metadatos de autoría/render. El contenido visual es coherente con el conjunto, pero no identifica archivo fuente ni cámara. | Mismo límite que la imagen exterior; renderización directa desde GLB no demostrada. | Confirmar derechos de publicación; no atribuir renderización directa al GLB sin el proceso fuente. |

El GLB contiene geometría con estos nombres de origen: `01_PALMA_V2N_PASO_PULGAR.stl`, `02_RACK_DIAGONAL_5_SG90_V2M.stl`, `03_ACOPLE_MUNECA.stl`, `04_RIOSTRA_DERECHA.stl`, `04_RIOSTRA_IZQUIERDA.stl`, `05_GUIA_CINCO_TENDONES.stl`, `06_CARCASA_ANTEBRAZO_V2K.stl`, `07_TAPA_ANTEBRAZO.stl`, `08_MARCO_CAJON.stl`, `09_CAJON_USB_C.stl`, `10_POLEA_SG90_HORN_PROTOTIPO_X5.stl`, los 14 STL de dedos listados abajo, más proxies SG90 con `extras.shape: box` y dimensiones en el propio GLB.

## STL de la cadena usada por el GLB

| Archivos | Comparación / fuente disponible | Estado de reproducibilidad y derechos |
|---|---|---|
| `INDICE_1.stl`, `INDICE_2.stl`, `INDICE_3.stl` | SHA-256 idéntico a cada salida del paquete V2J. `build_tuki_v2j.py` está incluido en el ZIP V2J y su copia `origen_v2j_mano.py` dentro del ZIP V2K es byte por byte idéntica (SHA-256 `a730a3e0d3c08f19ae02c54d65cfe8937130927394b9b21f79a11abab158c53f`). | Reutilización interna TUKI V2J confirmada. Código de generación disponible; no reconstruido en este entorno porque falta CadQuery. El paquete no asigna una licencia pública específica a la geometría. |
| `MEDIO_1.stl`, `MEDIO_2.stl`, `MEDIO_3.stl` | Igual: hash por archivo idéntico a V2J. | Igual. |
| `ANULAR_1.stl`, `ANULAR_2.stl`, `ANULAR_3.stl` | Igual: hash por archivo idéntico a V2J. | Igual. |
| `MENIQUE_1.stl`, `MENIQUE_2.stl`, `MENIQUE_3.stl` | Igual: hash por archivo idéntico a V2J. | Igual. |
| `PULGAR_1.stl`, `PULGAR_2.stl` | Igual: hash por archivo idéntico a V2J. | Igual. |
| `01_PALMA_V2N_PASO_PULGAR.stl` | Está en el ZIP de STL V2N y coincide con su malla dentro del GLB; no coincide por hash con la palma V2K incluida. El paquete no contiene su generador. | Geometría V2N entregada, fuente CAD no recuperada. Su independencia no demostrable solo a partir de mallas. |
| `02_RACK_DIAGONAL_5_SG90_V2M.stl` | Está en STL V2N y GLB. No está en el ZIP de fuentes V2N ni apareció un generador V2M/rack en los archivos disponibles. El script Bambu solo organiza STL existentes. | Fuente de geometría faltante. |
| `03_ACOPLE_MUNECA.stl` | Hash idéntico a `03_WRIST_COUPLER.stl` del ZIP V2K. | Reutilización interna V2K confirmada por hash; el build V2K y su fuente base completa no son reproducibles exactamente desde el paquete disponible. |
| `04_RIOSTRA_DERECHA.stl`, `04_RIOSTRA_IZQUIERDA.stl` | Hash idéntico a `04_WRIST_STRUT_RIGHT/LEFT.stl` V2K. | Reutilización interna V2K confirmada. |
| `05_GUIA_CINCO_TENDONES.stl` | Hash idéntico a `05_GUIA_TENDONES_TUKI_V2K.stl` V2K. El build V2K crea la guía paramétricamente, pero su entrada de base V2 no está en la ruta/paquete indicada por el script. | Reutilización interna V2K confirmada; reconstrucción histórica exacta pendiente. |
| `06_CARCASA_ANTEBRAZO_V2K.stl` | Hash idéntico a `06_FOREARM_OPEN_SHELL_V2K_CORREGIDA.stl` V2K. | Reutilización interna V2K confirmada. El script V2K obtiene geometría base V2 y la recorta; falta el archivo exacto `build_tuki_v2_engineering.py` que el script lee. El ZIP sí aporta `origen_v2_antebrazo.py`, una fuente paramétrica V2 alternativa, pero no prueba que sea idéntica a la entrada faltante. |
| `07_TAPA_ANTEBRAZO.stl` | Hash idéntico a `07_FOREARM_REMOVABLE_LID.stl` V2K. | Reutilización interna V2K confirmada. El script copia una pieza V2 base; la entrada exacta falta. |
| `08_MARCO_CAJON.stl`, `09_CAJON_USB_C.stl` | Hash idéntico a `08_DRAWER_FIXED_FRAME.stl` y `09_DRAWER_SLIDING_TRAY_USB_C.stl` V2K. | Reutilización interna V2K confirmada. La fuente base alternativa `origen_v2_antebrazo.py` contiene parámetros CAD de estas piezas, pero no se regeneró ni se comprobó su igualdad geométrica. |
| `10_POLEA_SG90_HORN_PROTOTIPO_X5.stl` | En el GLB y el ZIP V2N; no se encontró fuente generadora correspondiente ni un hash idéntico en el V2K entregado. | Fuente específica faltante. |
| `10_POLEAS_PARA_5_SG90_EN_CAMA.stl` y camas/ensayos | No son entradas adicionales de la escena web salvo las poleas nombradas; el script de camas lee STL como entrada, rota/traslada y concatena piezas. | No confundir disposición de impresión con ensamblaje o generador CAD. Mantener estos STL fuera de `web/public/`. |

## Archivos/fuentes localizados y faltantes

- **Encontrados:** `TUKI_V2I_Encastres_y_Dedos_Funcionales.zip` (fuentes/STEP V2I); ZIP V2J con `build_tuki_v2j.py`, empaquetador y dos STEP; ZIP V2K con `build_v2k.py`, copia exacta del generador V2J, STEP V2K y `origen_v2_antebrazo.py`; `hardware/cad/editable/build_drawer_v6.py` y STEP del cajón V6; histórico `hardware/archive/cad-iterations/old-cad-scripts/build_v2.py`; exportadores de modelos V2/V6 históricos.
- **V2K entrada exacta:** `build_v2k.py` lee rutas absolutas `/mnt/data/TUKI_V2J_Mecanica_Corregida/build_tuki_v2j.py` y `/mnt/data/TUKI_V2_Engineering_Prototype/build_tuki_v2_engineering.py`, y copia STLs desde las carpetas de salida de esos proyectos. El primer contenido está reproducido como `origen_v2j_mano.py`; el segundo archivo y parte de sus outputs de entrada no están en el ZIP. Hay código alternativo `origen_v2_antebrazo.py`, pero no se renombró ni declaró como fuente histórica exacta.
- **No encontrados:** `build_tuki_v2_engineering.py`, generador CAD V2N/V2M, STEP ensamblado V2N y exportador STL→GLB V2N. No aparecen en archivos locales, ramas Git, blobs alcanzables/inaccesibles, ni ZIP disponibles inspeccionados. El historial Git tiene un único commit inicial; los blobs inaccesibles examinados no contienen esas fuentes.
- **Entorno:** CadQuery no está instalado. No se ejecutó ningún generador ni se modificaron STL. Las igualdades de hash son comparaciones de los archivos entregados, no una reconstrucción independiente.

## Shapekit: cuatro cuestiones distintas

1. **Importación de archivos:** no se encontró evidencia de que el GLB V2N cargue URI externos o importe directamente el GLB Shapekit. La fuente generadora V2N no está disponible para confirmar exhaustivamente sus entradas.
2. **Mallas copiadas:** no se detectó coincidencia sustancial de malla exacta entre los componentes V2N inspeccionados y STL Shapekit cacheadas. Esto no prueba independencia de diseño.
3. **Reutilización/integración física:** los paquetes A1 Mini dicen que la carcasa y tapa Shapekit originales ya impresas se usarían con acople/riostras V2N, con compatibilidad pendiente. El ZIP V2P declara explícitamente que su script `build_v2p.py` carga como referencia `REFERENCIA/03_CAMA_ANTEBRAZO_CARCASA.stl` y `04_CAMA_ANTEBRAZO_TAPA.stl` del antebrazo Shapekit V3. V2P no es la fuente de la escena web V2N.
4. **Derechos:** no se encontró permiso escrito ni licencia pública específica para redistribuir los activos CAD/GLB/imágenes V2N. La licencia CC BY-NC 4.0 histórica de Shapekit plantea una cuestión separada para sus derivados y para su uso en el portfolio.

## ¿Puede publicarse la web sin distribuir Shapekit?

Sí, técnicamente se puede publicar una web sin archivos Shapekit si todos los recursos servidos son propios o tienen permisos claros. El `web/public/` local actualmente contiene solo el GLB V2N y dos imágenes V2N (además de `.gitkeep`); no contiene el antebrazo Shapekit original ni archivos V2P. Sin embargo, el GLB y esas imágenes son necesarios para la experiencia 3D actual y sus derechos/procedencia no están completamente resueltos. Desplegar la app actual sin ellos rompería el twin y partes de la interfaz. Una variante temporal podría quitar/ocultar el twin y conservar el simulador de controles, pero sería un cambio de producto/visual que debe aprobarse e implementarse por separado.

**Conclusión de la auditoría del 2026-11-22:** no se comprobó incorporación directa de malla Shapekit dentro de V2N; la integración física prevista y la línea V2P son hechos distintos de copia geométrica. En esa fecha las imágenes no tenían una cadena de render recuperada y la confirmación del propietario aún no constaba. La actualización del 2026-11-23, con declaración del propietario y archivos actuales, aparece abajo y sustituye ese estado provisional.

## Actualización de modelo y release — 2026-11-23

El GLB anterior y sus renders se conservaron como respaldo local de auditoría. No forman parte del sitio, el staging de Git ni los recursos públicos.

### Nodos retirados y sustituidos

| GLB anterior | Malla anterior | Fuente/hallazgo previo | Resultado en el GLB activo |
|---|---|---|---|
| `FOREARM/ACOPLE_MUNECA` | `ACOPLE_MUNECA` | Igual por SHA-256 al acople entregado como V2K. La compatibilidad con la carcasa Shapekit no prueba copia de geometría; faltaba la entrada CAD V2K exacta. | Retirado. Reemplazado visualmente por collar nuevo sin patrón de palma definido. |
| `FOREARM/RIOSTRA_IZQUIERDA`, `FOREARM/RIOSTRA_DERECHA` | `RIOSTRA_IZQUIERDA`, `RIOSTRA_DERECHA` | Iguales por SHA-256 a las salidas V2K; fuente histórica completa no recuperada. | Retiradas. La nueva carcasa tiene nervaduras paramétricas propias. |
| `FOREARM/CARCASA_ANTEBRAZO` | `CARCASA_ANTEBRAZO` (origen listado: `06_CARCASA_ANTEBRAZO_V2K.stl`) | Igual por SHA-256 a la carcasa V2K; el generador utilizaba una entrada V2 ausente. | Retirada. Reemplazada por `ForearmLeft` y `ForearmRight`. |
| `FOREARM/TAPA_ANTEBRAZO` | `TAPA_ANTEBRAZO` (origen listado: `07_TAPA_ANTEBRAZO.stl`) | Igual por SHA-256 a la tapa V2K; su entrada exacta no estaba disponible. | Retirada. Reemplazada por `ServiceCover_USB_Pending`; no incluye corte USB-C validado. |
| `FOREARM/MARCO_CAJON`, `FOREARM/CAJON_USB_C` | `MARCO_CAJON`, `CAJON_USB_C` | Iguales por SHA-256 al marco y bandeja V2K; faltaba la fuente V2K exacta. | Retirados. Reemplazados por `ElectronicsBase` y `ElectronicsCarrier`. |
| `ACTUACION/GUIA_CINCO_TENDONES` | `GUIA_CINCO_TENDONES` | Igual por SHA-256 a la guía V2K; fuente histórica incompleta. | Retirada. La nueva carcasa aporta un conducto interior, sin afirmar tensión o guía mecánica validada de tendones. |

`RACK_DIAGONAL_5_SG90`, `PALMA`, los 14 meshes `FINGER_*`, cinco pares `SG90_*_PROXY`/`SG90_*_FLANGE`, y cinco `POLEA_*` permanecen. Los 14 meshes de falanges tienen reutilización interna V2J confirmada. El generador paramétrico V2N de la palma y el origen paramétrico del rack/poleas no se recuperaron; los proxies SG90 son formas de referencia declaradas en el GLB. El antiguo GLB no mostró facetas triangulares idénticas a las referencias Shapekit locales en las parejas comparadas, pero esa prueba no establece autoría independiente ni descarta derivación.

### Cadena reproducible de la sustitución

Los scripts de CAD y ensamblaje enumerados abajo se conservaron en el workspace local para trazabilidad, pero no forman parte del staging de esta publicación web. El staging incluye solo el GLB y sus dos previews, junto con aplicación y documentación; no contiene STL/STEP de fabricación ni el rediseño editable del antebrazo.

| Archivo | SHA-256 | Procedencia y verificación |
|---|---|---|
| `hardware/cad/editable/tuki_v2n_arm_v1/build_tuki_v2n_arm_v1.py` | Código fuente editable | Construye las seis piezas nuevas mediante operaciones CadQuery paramétricas; no importa mallas externas. |
| `hardware/cad/editable/tuki_v2n_arm_v1/export_arm_glb.py` | Código fuente editable | Exporta las piezas nuevas como `generated/tuki_v2n_arm_v1.glb`, 920,224 bytes. |
| Respaldo del GLB anterior (local, excluido) | — | Se usó como entrada de auditoría para comparar la mano y las animaciones; no se incluye en Git ni en `web/public/`. |
| Ensamblador local del GLB (excluido del release) | Herramienta de workspace | Se usó para eliminar el subsistema antiguo e incorporar la escena CAD nueva, conservando mano/rack/servos/poleas y clips. No se incluye porque depende de entradas CAD locales excluidas y no forma parte del build de Vercel. |
| `web/public/models/tuki-v2n.glb` | `44bd20aeadb76c1096f41b39d37784e503c6904d7d87eface226fe5e1f70064c` | 5,920,028 bytes. Reconstruido con los dos scripts anteriores. Coincide con la versión inicial del modelo nuevo en 309 instancias `THREE.Mesh` (297 definiciones glTF), límites de cada malla, matrices de objeto y cinco clips; diferencia binaria de empaquetado de 20 bytes. Contiene buffers embebidos, 0.001 root scale, nuevos grupos de antebrazo y ningún mesh con los nombres V2K retirados. |
| `web/public/images/tuki-v2n-exterior.png` | `3d49142b9d071bc1b87fe8b0ea0d1b9b1984d802ce84d75d6213fbd6491a8954` | Captura del modo Exterior del Studio ejecutado con el GLB actual. |
| `web/public/images/tuki-v2n-interior.png` | `0ece132cc000f20fa711727fc7c0e9de09d869be816c40e5a3e959514375ffaf6` | Captura del modo Interior del Studio ejecutado con el GLB actual. |

Las vistas son capturas del visor, no renders fotorrealistas ni evidencia de ensamblaje físico. Las piezas nuevas tienen parámetros y operaciones rastreables; no se declara que esa fuente pruebe por sí sola independencia jurídica de cada solución mecánica.

### Estado de publicación actualizado

El propietario declaró el 2026-11-23 que TUKI V2N fue desarrollado desde cero por el equipo mediante CAD paramétrico con asistencia de IA, y pidió preparar su publicación. Esta declaración documenta la posición del propietario; no se presenta como autorización de Shapekit ni como demostración independiente de cada decisión de diseño.

La revisión concreta de los tres archivos web actuales encontró:

- El GLB es autocontenido: no tiene URI externos ni recursos vinculados fuera del archivo. Conserva la mano/rack/poleas V2N declarados por el propietario y las seis piezas nuevas del antebrazo; las mallas V2K de carcasa/tapa/cajón ya no aparecen.
- Las comparaciones previas entre las mallas V2N inspeccionadas y las referencias Shapekit locales no detectaron facetas triangulares idénticas. La prueba y la falta de importación directa no demuestran independencia absoluta, pero tampoco aportan evidencia concreta de material Shapekit incorporado.
- Las dos imágenes actuales se capturaron desde el visor local con el GLB activo en modos Exterior e Interior; no se identificó en ellas una fuente visual de terceros.

Conclusión actual: no se identificó un bloqueo concreto de derechos de terceros en `web/public/models/tuki-v2n.glb`, `web/public/images/tuki-v2n-exterior.png` ni `web/public/images/tuki-v2n-interior.png`. Por instrucción del propietario, se preparan para staging. Esto no certifica independencia jurídica absoluta ni constituye autorización de terceros. Si apareciera evidencia de adaptación Shapekit, CC BY-NC 4.0 permite compartir/adaptar bajo atribución, enlace, indicación de cambios y uso no comercial; la aplicación de este último término a un portfolio enlazado a CV sería una cuestión condicionada a esa evidencia. No se modificaron STL de mano ni CAMA_00/CAMA_01. El collar y USB-C no se presentan como interfaces físicas validadas.
