# FRDM-KL25Z — proyecto MCUXpresso SDK

El MCU objetivo es MKL25Z128VLK4. Las fuentes usan UART1 por PTE0/PTE1 y cinco salidas TPM0 por los pines del manifiesto en `../README.md`. La API usada corresponde a los drivers MCUXpresso `fsl_uart`, `fsl_tpm`, `fsl_port`, `fsl_clock` y `fsl_wdog`.

## Crear un proyecto importable en MCUXpresso IDE

El SDK 2.2.0 es una versión legacy: comprueba en NXP SDK Builder/MCUXpresso si el paquete `FRDM-KL25Z` está disponible para tu cuenta. Si no, genera/instala un SDK compatible con MKL25Z128 desde el SDK Builder. Esta carpeta aporta el código de aplicación y no duplica los archivos de arranque/licencia/linker del fabricante.

1. En MCUXpresso IDE, importa el SDK de `FRDM-KL25Z` mediante **Installed SDKs → Import SDK archive**.
2. Crea **New Project → frdmkl25z → SDK Debug Console (hello_world)** o un proyecto de placa equivalente con startup, `system_MKL25Z4.c`, `clock_config.c/.h`, `board.c/.h`, linker script y CMSIS del SDK. Conserva `BOARD_BootClockRUN()` y la configuración RUN de 48 MHz. `BOARD_InitDebugConsole()` mantiene el VCOM OpenSDA en UART0/PTA1-PTA2.
3. En propiedades del proyecto, selecciona como fuente C adicional `firmware/kl25z/src/` y como include paths `firmware/kl25z/include/` y `firmware/common/include/`. Añade también `firmware/common/src/tuki_protocol.c`.
4. Añade los drivers SDK `fsl_uart.c`, `fsl_tpm.c`, `fsl_port.c`, `fsl_clock.c`, `fsl_wdog.c` y `fsl_common.c` (según la organización del SDK pueden estar ya vinculados como componentes). No copies drivers ni uses APIs no incluidas por el paquete.
5. Sustituye el `main.c` del ejemplo por `firmware/kl25z/src/main.c`. Añade `uart_link.c`, `command_router.c`, `safety.c`, `servo_pwm.c`, `servo_control.c` y `servo_config.c` al grupo de fuentes.
6. Confirma que el proyecto incluye `clock_config.c` con `BOARD_BootClockRUN()` y el `SystemCoreClock` correspondiente a 48 MHz. UART1 toma `CLOCK_GetFreq(kCLOCK_BusClk)`; TPM0 selecciona MCGFLLCLK a 48 MHz, prescaler 16 y entrega 3 MHz al contador para configurar el período de 20 ms y tres ticks por microsegundo.
7. Compila primero sin servos. En Debug Configurations selecciona el probe CMSIS-DAP/OpenSDA de la FRDM-KL25Z y carga por el conector USB KL25Z/OpenSDA (micro-USB de programación/debug), no por los pines de alimentación de servo.

El puerto OpenSDA VCOM está asociado al UART0 de depuración en PTA1/PTA2; UART1 PTE0/PTE1 queda reservado al ESP32. El código inicializa ambos de forma independiente: `PRINTF` aparece en el VCOM y las respuestas de protocolo salen por UART1.

## Inicialización y funcionamiento

`main.c` conserva reloj/startup del ejemplo, inicia SysTick de 1 ms, watchdog, UART1 y TPM0. UART1 recibe líneas completas sin bloquear en espera; líneas mayores a 96 caracteres se descartan hasta `\n`, y una línea parcial vence en 1 s. TX utiliza escrituras cortas bloqueantes para una respuesta acotada, no dentro de interrupción. Solo comandos válidos renuevan el monitor de enlace; cuando está armado, 1.5 s sin comandos válidos produce timeout y latch de falla hasta `DISARM`.

TPM0 produce 50 Hz con período de 20 ms. La inicialización programa los cinco canales con comparación cero antes de arrancar el contador. `servo_config.c` inicia los cinco dedos deshabilitados; al habilitarse, cada canal usa límites individuales y dirección invertible. La interpolación avanza hasta 8 µs cada 20 ms (400 µs/s) desde el lazo principal.

`DISARM` fija CnV=0 y deja las salidas bajas; no corta 5 V ni garantiza que el servo no se mueva por carga externa. `STOP` cancela la trayectoria pendiente manteniendo el PWM de la posición actual. `ARM` emite 1500 µs para cada canal habilitado y puede causar movimiento: la primera prueba se hace con un solo servo desconectado de tendones tensos. Las posiciones son pulsos, no ángulos calibrados.

El watchdog es el periférico KL25Z con reloj LPO y timeout de 0xFFFF ticks; se refresca desde el lazo principal. La pérdida de comandos válidos UART durante 1.5 s mientras está armado desarma, deja PWM bajo y reporta `ERR,LINK_TIMEOUT,PWM_LOW`; `STATUS` refleja la falla hasta recibir `DISARM`. Esto no desconecta la fuente de servo. El ESP32 manda `PING` periódico mientras el último estado recibido indica ARM.

## Calibración

En `src/servo_config.c`, habilita inicialmente solo el índice 0. Conserva límites muy cercanos a 1500 µs hasta observar el servo sin carga/tendones. Amplía mínimo y máximo en pasos pequeños, comprobando que no fuerza topes. Repite de forma independiente. Configura `inverted` si la dirección del tendón lo requiere. Solo tras medir `open_us`/`close_us` en todos los dedos marca `limits_calibrated` y `gestures_calibrated`; nunca utilices 500–2500 µs como recorrido mecánico asumido.

## Protocolo y diagnóstico

Consulta `../common/include/tuki_protocol.h` para el parser compartido. Comandos: `PING`, `STATUS`, `ARM`, `DISARM`, `SET <0..4> <µs>`, `POSE <5 pulsos>`, `OPEN`, `CLOSE`, `STOP`, `HELP`. La respuesta `STATUS,link=OK,a<armado>,f<falla>,e<mask>,c<actuales>,t<objetivos>` reporta estado de enlace, posiciones actuales y solicitadas. Las demás respuestas incluyen `PONG`, `OK,...` o `ERR,...`. `OPEN/CLOSE` devuelven error hasta completar calibración. Prueba el parser host desde `firmware/common/tests/run-host-tests.ps1`.

Sin `PONG`: confirma PTE1 RX ← GPIO17 TX, PTE0 TX → GPIO16 RX, GND común, 115200 8N1 y que el proyecto usa UART1. Si la placa se reinicia, revisa alimentación y temporizador watchdog. Si un servo no se mueve, confirma `ARM`, bit `en` de `STATUS`, canal/pin mux, alimentación 5 V externa y masa común. No conectes servos durante el primer test de enlace.
