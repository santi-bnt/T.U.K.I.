# Firmware TUKI: ESP32 Dev + FRDM-KL25Z

Esta implementación crea dos proyectos: el ESP32 clásico sirve como puente de conectividad y consola; la FRDM-KL25Z interpreta el protocolo y controla cinco SG90 por PWM hardware TPM0. No desarrolla firmware para la pulsera EMG. Las credenciales Wi-Fi reales quedan en un archivo local ignorado por Git.

## Estado de validación

El código y las instrucciones están preparados, pero en este entorno no hay ESP32, FRDM-KL25Z, SDK MCUXpresso instalado, PlatformIO ni toolchain ARM disponibles. Por eso no se afirma que los proyectos se hayan compilado, cargado o probado físicamente. Las Fases A–D siguen pendientes. El test automatizado del parser está en `common/tests/test_tuki_protocol.c`; ejecútalo con `powershell -ExecutionPolicy Bypass -File common/tests/run-host-tests.ps1` cuando `gcc` o `clang` esté instalado.

## Seguridad y alimentación

- La KL25Z arranca desarmada y todos los canales PWM están a nivel bajo.
- La configuración entregada tiene los cinco servos deshabilitados. La ventana 1490–1510 µs es solo un límite inicial conservador para puesta en marcha, no una calibración mecánica.
- La primera prueba física debe hacerse con un SG90, sin tensión en los tendones, usando una fuente regulada externa de 5 V con corriente suficiente. Nunca alimentes los cinco servos desde la placa ESP32 o la KL25Z.
- Une las tierras de fuente 5 V, ESP32 y KL25Z. Señales UART/PWM son TTL de 3.3 V.
- `DISARM` pone las cinco salidas PWM en bajo; no corta la alimentación de los servos. Según el servo, dejará de sostener activamente la posición. `STOP` congela los objetivos en la posición actual y mantiene PWM si continúa armado; no desconecta energía.
- El watchdog del KL25Z reinicia ante bloqueo del lazo principal; el timeout UART de 1.5 s desarma si se pierde el enlace mientras estaba armado. Ninguno es un corte eléctrico.
- No usar `OPEN`/`CLOSE` hasta calibrar individualmente límites y posiciones de gesto en `kl25z/src/servo_config.c`.

## Cableado

| Señal | ESP32 Dev | FRDM-KL25Z | Servo externo |
|---|---|---|---|
| UART TX | GPIO17 / TX2 | PTE1 / UART1_RX / J2-20 | — |
| UART RX | GPIO16 / RX2 | PTE0 / UART1_TX / J2-18 | — |
| Tierra | GND | GND | GND común con fuente externa |
| Pulgar PWM | — | PTC1 / TPM0_CH0 / J10-12 | Señal servo 0 |
| Índice PWM | — | PTC2 / TPM0_CH1 / J10-10 | Señal servo 1 |
| Medio PWM | — | PTC3 / TPM0_CH2 / J1-5 | Señal servo 2 |
| Anular PWM | — | PTC4 / TPM0_CH3 / J1-7 | Señal servo 3 |
| Meñique PWM | — | PTC8 / TPM0_CH4 / J1-14 | Señal servo 4 |
| 5 V servo | — | No conectar a 5V USB de la placa | Fuente regulada externa 5 V |

UART está configurado a 115200 baudios, 8N1. Los pines PTE0/PTE1 usan ALT3 para UART1. Las cinco salidas TPM0 usan PTC1–PTC4 ALT4 y PTC8 ALT3; el pinout del Quick Reference Card confirma las posiciones de los conectores. No se usa PTC1/PTC2 para I2C1 en este firmware.

## Orden de puesta en marcha

1. Compila y carga ambos proyectos sin servos conectados.
2. Conecta UART cruzada y GND común. Abre el monitor USB del ESP32 a 115200, envía `PING` y confirma la secuencia `TX> PING` / `KL25Z< PONG`.
3. Prueba `STATUS`, líneas incompletas, índice inválido (`SET 5 1500`), pulso fuera del rango del protocolo (`SET 0 2501`) y desconexión. `ARM` debe responder error hasta habilitar explícitamente un canal.
4. Con alimentación externa, conecta un único SG90 al canal 0, sin tendones tensos. Habilita solo el dedo correspondiente en `servo_config.c`, flashea y repite con pulsos pequeños dentro de 1490–1510 µs. Ajusta límites mediante observación física y cambia `limits_calibrated` solo tras comprobar ambos extremos seguros.
5. Repite canal por canal. Solo después de medir los cinco rangos, configura `open_us`, `close_us`, `gestures_calibrated` y habilita los cinco. Valida fuente de 5 V, corriente, reinicios, temperatura y estabilidad antes de secuencias.
6. Configura Wi-Fi local en el ESP32 y confirma desde la LAN. La web HTTPS de Vercel no controla este HTTP local directamente.

No se deben marcar las fases como aprobadas hasta realizar la prueba correspondiente con placas, osciloscopio/analizador lógico y servos reales.

## Archivos

- `common/`: parser ASCII común, sin asignación dinámica, y test host.
- `esp32/`: proyecto PlatformIO con consola UART y API HTTP local opcional.
- `kl25z/`: fuentes C y guía de importación a un proyecto MCUXpresso SDK para FRDM-KL25Z.

Consulta `kl25z/README.md` y `esp32/README.md` para instalar, importar, compilar, cargar y diagnosticar cada placa.

Para ESP32 instala Visual Studio Code y la extensión PlatformIO IDE; el entorno `espressif32` y framework Arduino se descargan al primer build. Para KL25Z instala [MCUXpresso IDE](https://www.nxp.com/design/design-center/software/development-software/mcuxpresso-software-and-tools/mcuxpresso-ide:MCUXpresso-IDE) e importa el SDK FRDM-KL25Z desde [NXP MCUXpresso SDK Builder](https://mcuxpresso.nxp.com/en/select). La disponibilidad de la versión legacy 2.2.0 depende de la selección/cuenta NXP.
