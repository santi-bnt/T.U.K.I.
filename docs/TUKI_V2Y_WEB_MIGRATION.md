# TUKI V2Y — nuevo gemelo digital principal

**Estado:** paquete de migración local preparado, aún sin commit/push/despliegue. No es validación mecánica.

## Objetivo

Hacer **V2Y el modelo principal** de TUKI en Home y Studio sin eliminar los cinco dedos animados, los juegos ni los controles. V2N permanece como respaldo histórico.

## Contenido verificado

- `web/public/models/tuki-v2y.glb`: mano articulada (palma V2N y 14 falanges existentes) + antebrazo V2Y, puertas de acceso, muñeca, gabinete inferior con USB-C lateral izquierdo, tabla de cinco SG90 en distribución 2+1+2 y guías de tendones. Contiene cinco clips `CLOSE_*` y nodos de articulación independientes.
- `web/public/images/tuki-v2y-exterior.png` y `tuki-v2y-interior.png`: imágenes nuevas renderizadas desde este GLB.
- `web/src/components/3d/tuki-v2y-hand.tsx`: componente Three.js principal actualizado con los modos Exterior/Interior/Exploded.
- `web/scripts/check-tuki-v2y-model.mjs`: comprobación sin dependencias externas del modelo 3D y sus clips.
- `tools/build_tuki_v2y_web.py`: generador reproducible con insumos ZIP provistos por el propietario; conserva únicamente la mano de V2N y elimina la geometría histórica de antebrazo V2N.
- `tools/apply_v2y_as_main.py`: aplica modificaciones localmente en el repositorio T.U.K.I. (dry-run por defecto).

## Procedencia y reservas

La **mano animada** se toma del GLB V2N incluido en el ZIP `TUKI_V2N_MIGRACION_WEB_PREPARADA(1).zip` que se suministró en la conversación. La **carcasa, bisagras, gabinete y tabla central** son exactamente las STL del ZIP `TUKI_V2Y_ENCAJES_V2W_DISTRIBUCION_ANTICOLISION.zip`. El GLB actual de GitHub es un V2N posterior y puede diferir en geometría de la carcasa; se conserva en Git hasta verificar la sustitución.

El STEP y los STL V2Y están en coordenadas de ensamblaje milimétricas. El modelo web utiliza un nodo raíz escalado por 0.001 para mostrar metros en Three.js. Los SG90 anaranjados y sus poleas son **volúmenes de referencia**: el ajuste, las poleas físicas, los recorridos de tendones, los conectores, los tornillos y la electrónica NXP siguen sin verificarse en una construcción física.

No confundir una visualización coherente y clips funcionando con validación de movimiento físico. Se preserva la documentación de procedencia y derechos del proyecto, sin nuevas certificaciones.

## Aplicación en el repositorio local

1. Descomprimir el ZIP de este paquete de actualización fuera del repositorio.
2. Desde su ubicación, ejecutar `python tools/apply_v2y_as_main.py /ruta/al/repositorio/T.U.K.I.` para previsualizar cambios.
3. Ejecutar de nuevo con `--overwrite` para copiar el nuevo GLB/renders/componente/checker y cambiar el import principal del gemelo y las referencias visibles a V2Y. El script no borra V2N.
4. En el repositorio, desde `web/`, ejecutar:
   - `npm ci`
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`
   - `node scripts/check-tuki-v2y-model.mjs`
5. **Verificar realmente el gemelo en el navegador**: Home, Studio, Technology; cinco sliders, cinco animaciones, gesto, Simon Says, RPS, captura, modos exterior/interior/exploded, desktop y móvil.
6. Inspeccionar `git diff` y confirmar que solo se incluyen los archivos de web y documentación. No subir ZIP/STL físicos ni secretos.
7. Solo después de aprobar esa revisión hacer commit/push para que Vercel despliegue la nueva versión.

## Limitaciones honestas

- Se validó la **estructura GLB** local y la presencia de los cinco clips con cambios de orientación en sus articulaciones.
- Se generaron renders locales del ensamblaje; aún no se ha ejecutado un build de Next.js ni una prueba de WebGL en navegador con el reemplazo integrado.
- No se ha actualizado `main` ni `tuki-arm.vercel.app` automáticamente.
- Actualizar documentación técnica de tecnología/arquitectura según el uso V2Y, manteniendo las reservas de procedencia y la distinción entre simulación y mano física.

El comando existente `node scripts/check-tuki-model.mjs` se actualiza para verificar el **modelo principal V2Y**. El validador V2N original se conserva aparte como `web/scripts/check-tuki-v2n-historical.mjs` si es la primera ejecución del aplicador.

## Integration status in this repository (2026-11-23)

The local migration has been applied. Home and Studio resolve to the supplied `tuki-v2y.glb` through the shared `TukiDigitalTwin` path; Technology uses the supplied interior render and retains historical Shapekit credits. The prior V2N GLB remains present as a backup. Asset hashes match the supplied package. TypeScript, ESLint, 11 unit tests, production build, the V2Y model checker, and its default `check-tuki-model.mjs` alias pass. Local browser QA opened Home, Studio, and Technology at desktop and 390 px mobile widths; it confirmed the canvas and images load, five controls remain, all three enclosure modes switch, the five nominal SG90 visuals appear in Interior, and the USB-C side opening is visible after orbiting. Browser console had no errors; microphone/voice permission and physical hardware were not tested. No push or Vercel deployment has been performed.
