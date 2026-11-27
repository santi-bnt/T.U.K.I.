# TUKI Camera Tracking: cierre incompleto

## Evidencia disponible

El propietario reportó un puño mantenido con valores visibles en el controlador de aproximadamente pulgar `0.16`, índice `0.69`, medio `0.71`, anular `0.71` y meñique `0.68`. MediaPipe dibujó los 21 puntos. Esto confirma que el detector entregó una mano, pero no confirma que los puntos del pulgar oculto sean fiables ni identifica en qué etapa se redujo cada valor.

## Hallazgos del código

- `interpretHandLandmarks` produce la pose **detectada** desde ángulos y distancias normalizadas. El worker sólo entrega coordenadas normalizadas; no entrega `visibility`, confianza por landmark ni `worldLandmarks`. La visualización de 21 puntos tampoco representa una medida de confianza.
- `HandPoseProcessor` aplica las referencias abiertas/cerradas y después One Euro, deadband y limitador de velocidad. Antes de esta revisión el panel no mostraba el valor calibrado, por lo que sus valores de controlador no permitían separar detector, calibración y filtro.
- El límite predeterminado de `2.5` unidades normalizadas por segundo requiere al menos `0.4 s` para recorrer de 0 a 1. Una lectura tomada mientras la mano todavía se cierra puede permanecer cerca de `0.7` aunque la detección ya haya llegado al extremo.
- `HandMotionController.submit` valida y copia el `HandPose` recibido a su snapshot; no escala ni limita sus valores. Por tanto, no hay evidencia de que el controlador central reduzca la flexión.
- El rig adapta el valor de pulgar a `FINGER_PULGAR_01/02` e interpola hasta el último quaternion del clip `CLOSE_PULGAR`. La prueba GLB compara `HandPose.PULGAR = 1` con esos endpoints. Esta prueba descarta una reducción numérica en el adaptador, pero no sustituye una inspección visual del GLB ni una prueba de cámara.

## Diagnóstico actual

La lectura reportada no basta para atribuir el problema sólo al detector o al filtro: no incluía detección, calibración ni duración desde que se cerró la mano. El valor bajo del pulgar es compatible con landmarks inferidos bajo oclusión; los valores cercanos a `0.7` de los demás dedos también son compatibles con una captura antes de completar la rampa del limitador. No se cambiarán umbrales ni pesos hasta revisar muestras reales exportadas desde el navegador.

## Muestras que debe capturar el navegador

En Studio > Camera Tracking, sostener por separado mano abierta, cierre parcial y puño cerrado; pulsar el botón correspondiente para etiquetar los fotogramas recientes y descargar el JSON. El archivo contiene únicamente landmarks `x/y/z`, relación de aspecto y valores detectados/calibrados/filtrados/aceptados, con ángulos, oposición y longitudes normalizadas del pulgar. No guarda imágenes ni vídeo y no se envía a un servidor. Revisar sus datos antes de ajustar cualquier constante.

Las capturas reales, estabilidad ante oclusión, perspectiva, iluminación y rendimiento deben probarse en la webcam o celular del propietario. Sin esos datos no se afirma que el puño físico se interprete como cinco cierres completos.
