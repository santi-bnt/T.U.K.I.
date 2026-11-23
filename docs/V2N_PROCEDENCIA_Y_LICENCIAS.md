# TUKI V2N: auditoría técnica de procedencia y publicación

## Estado de la auditoría original (2026-11-22)

> El veredicto y las acciones de esta sección reflejan el estado previo a la declaración del propietario y a la revisión dirigida de los assets actuales. Fueron reemplazados por la actualización de 2026-11-23 al final de este informe; no representan el estado de release vigente.

**BLOQUEADO para publicación pública de GLB e imágenes.** La inspección confirma que el GLB usado por la web contiene las mallas de las STL V2N entregadas y conserva su rig, pero no permite reconstruir ni verificar de forma independiente toda la cadena CAD paramétrico → STL. Falta el generador V2N y su ensamblaje STEP. Tampoco se entregó una licencia o autorización explícita de redistribución para los binarios. No es una certificación de independencia mecánica ni una opinión jurídica.

## Cadena de procedencia comprobable

| Tramo | Evidencia | Resultado / límite |
|---|---|---|
| CAD V2J → STL de dedos | `TUKI_V2J_Mano_Corregida_STL_STEP_GLB_CAD.zip`, `build_tuki_v2j.py`; código CadQuery que construye formas y exporta STL. Los segmentos de dedos comparados con V2N tienen SHA-256 idéntico. | Reutilización interna TUKI confirmada para los segmentos comparados. El código no importa STL como fuente de esa geometría; esto no certifica independencia de conceptos o dimensiones. |
| CAD V2K → carcasa, tapa, acople | `TUKI_V2K_Integracion_Corregida_Pruebas.zip`, `build_v2k.py`; hashes de carcasa `06`, tapa `07` y acople `03` coinciden entre sus STL y las STL V2N. | Reutilización de resultados V2K confirmada. El build lee `build_tuki_v2_engineering.py`, ausente del ZIP, por lo que esa rama no es reproducible completa con la entrega. |
| Entradas de la build V2N | `TUKI_V2N_TODOS_STL_PARA_IMPRIMIR.zip`, `TUKI_V2N_MIGRACION_WEB_PREPARADA.zip`. | Incluyen STL y GLB respectivamente, pero no el generador paramétrico V2N ni el STEP de ensamblaje anunciados por el README del paquete STL. La fuente exacta del rack V2M y de otros componentes no queda demostrada por estas entregas. |
| STL → GLB | `web/public/models/tuki-v2n.glb`; parser GLB y comparación reproducible de triángulos por malla con las STL V2N. | Coincidencia de 277,484 de 277,484 triángulos en las entradas de malla identificadas. GLB de 5,198,064 bytes con buffer binario embebido y sin URI de recursos externos. Esto verifica el export inmediato, no el origen CAD. |
| Plan de impresión A1 Mini | `TUKI_A1_MINI_STL_REVISADOS_ORIENTACION_TORNILLOS.zip`, `LEEME_PRIMERO.md` y `RESUMEN_AUDITORIA.json`. | Reorienta y agrupa las piezas; no contiene el generador paramétrico. Declara antebrazo/tapa Shapekit originales ya impresos y marca acople/riostras V2N como pendientes de compatibilidad con esa carcasa. |

Los artefactos V2N están así relacionados: dedos seleccionados reutilizan salidas V2J; carcasa/tapa/acople seleccionados reutilizan salidas V2K; el GLB coincide con las STL V2N suministradas. La relación entre generador CAD V2N y el juego completo de STL no pudo reconstruirse.

## Búsqueda de entradas de terceros y límites

Se revisaron código/build scripts disponibles, paquetes ZIP, nombres y hashes, URI de GLB y huellas de triángulos frente a STL Shapekit de referencia cacheadas localmente. No se detectó una coincidencia sustancial de malla triangular para las piezas V2N inspeccionadas. Esto respalda que el GLB no es una copia directa del GLB histórico y que las mallas V2N inspeccionadas no son STL trianguladas idénticas a las referencias.

El comparador de huellas es heurístico: una diferencia de teselación, reconstrucción paramétrica o cambios geométricos altera las mallas. No prueba independencia de diseño, ausencia de inspiración/derivación, ni titularidad. La fuente CAD V2N faltante impide buscar exhaustivamente importaciones de STL/STEP/OBJ/GLB en su generador. La rama V2K también carece de una entrada que su script consume.

El paquete A1 más reciente confirma una integración física proyectada con carcasa y tapa originales Shapekit, sin compatibilidad probada. Por tanto no se describe el conjunto mecánico o la integración física completa como independiente ni validada.

## Licencia y autorización

El trabajo histórico Shapekit es *Tendon-Driven Robot Hand*, atribuido a Shapekit y publicado bajo [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/); consultar también [página del modelo](https://shapekit.cc/robot-hand) y [condiciones de uso](https://shapekit.cc/work-with-us). El alcance NonCommercial en un portfolio enlazado desde CV y perfiles profesionales no queda resuelto con certeza. No se documenta autorización escrita ni afiliación/endorsement de Shapekit.

Para V2N faltan tanto fuente reproducible como una declaración de titularidad/licencia que autorice subir los GLB e imágenes a GitHub público y servirlos desde Vercel. No importar archivos de terceros, no copiar una malla, independencia mecánica y autorización de redistribución son afirmaciones diferentes. La ausencia de archivos Shapekit en los inputs inspeccionados no resuelve las otras tres.

## Decisión original de release (2026-11-22; supersedida)

- Mantener GLB e imágenes V2N fuera del staging hasta que la persona responsable confirme de forma informada que posee los derechos necesarios para distribuirlas o identifique permisos requeridos. La falta de fuente CAD es un límite técnico de trazabilidad, no una prohibición legal automática.
- No publicar STL/STEP/CAD en esta release web.
- Mantener los créditos históricos de Shapekit en documentación; no atribuirle la geometría V2N ni afirmar endorsement.
- Para aumentar la trazabilidad técnica: proporcionar `build_v2n` y todas sus entradas, STEP ensamblado, versiones/hashes; completar o identificar la entrada V2 que consume V2K; confirmar origen de los renders. Por separado, aclarar el plan físico con la carcasa Shapekit y resolver cualquier duda material de derechos.
- El informe técnico no es certificación jurídica. Si la independencia o el alcance de CC BY-NC siguen siendo materiales, solicitar revisión jurídica o autorización por escrito.

El inventario por archivo, hashes, entradas faltantes, verificaci?n de im?genes y alternativa web sin Shapekit est?n en `docs/V2N_MANIFIESTO_PROCEDENCIA.md`.

## Actualización de publicación (2026-11-23)

El propietario declaró que TUKI V2N se desarrolló desde cero por el equipo con CAD paramétrico asistido por IA y solicitó preparar la publicación. La revisión dirigida de los tres recursos web actuales —`web/public/models/tuki-v2n.glb`, `web/public/images/tuki-v2n-exterior.png` y `web/public/images/tuki-v2n-interior.png`— no encontró URI externos, mallas Shapekit ni evidencia concreta de otro material de terceros. El GLB conserva los cinco dedos y clips; las dos imágenes corresponden a las vistas Exterior e Interior del visor.

La declaración del propietario no se presenta como autorización de Shapekit ni como verificación independiente absoluta. La falta de generadores CAD históricos limita la trazabilidad, pero no establece por sí sola una infracción ni bloquea estos recursos. En esta revisión no queda identificado un permiso concreto de terceros que impida preparar el staging de esos tres archivos. Los prototipos históricos derivados de Shapekit siguen excluidos; su licencia CC BY-NC 4.0 y el alcance NonCommercial de un portfolio CV-enlazado solo serían pertinentes si apareciera evidencia de que un recurso actual adapta ese trabajo. No se incluyen CAD/STL/STEP del antebrazo en el release web. Véanse `docs/ASSET_LICENSES.md`, `docs/V2N_MANIFIESTO_PROCEDENCIA.md` y la página de términos de [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).
