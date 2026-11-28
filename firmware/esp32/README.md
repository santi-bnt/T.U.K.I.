# ESP32 Dev: puente UART y API local opcional

Proyecto PlatformIO Arduino para el ESP32 clásico (`board = esp32dev`). El USB serial ofrece primero una consola de comandos; la API HTTP local es opcional y solo se activa al crear un `include/wifi_config.h` local.

Conexiones UART: GPIO17/TX2 → PTE1/UART1_RX del KL25Z; GPIO16/RX2 ← PTE0/UART1_TX; GND común. UART2 funciona a 115200, 8N1, TTL 3.3 V. No conectes una salida de 5 V a estos pines.

Desde esta carpeta: `pio run`, `pio run -t upload` y `pio device monitor -b 115200`. Abre el monitor USB a 115200 y escribe un comando por línea. `PING`, `STATUS`, `HELP` y los comandos de control válidos por el parser se reenvían a UART2; las respuestas aparecen como `KL25Z< ...`.

Para Wi-Fi, copia `include/wifi_config.example.h` como `include/wifi_config.h`, cambia SSID, contraseña y token aleatorio de al menos 24 caracteres, y vuelve a cargar. El archivo real está excluido por `.gitignore`. El ESP32 expone `POST /api/command` con el campo form `command=PING` y `GET /api/status`, ambos con `Authorization: Bearer <token>`. POST devuelve 202 y el estado se consulta después; solo hay una solicitud pendiente a la vez. Un `409` significa que el PING de seguridad u otro comando está en vuelo; espera y reintenta. Ejemplo: `curl -H "Authorization: Bearer TU_TOKEN" --data-urlencode "command=PING" http://IP_DEL_ESP32/api/command`.

La API es HTTP sin TLS y está pensada para una LAN confiable. No abras el puerto al Internet. Una página pública HTTPS en Vercel no puede usarla directamente de forma fiable: el navegador bloquea solicitudes de contenido mixto y existen restricciones de origen y acceso a redes privadas. Una integración futura necesitaría un intermediario seguro autenticado o un servicio local con TLS y autorización adecuada.
