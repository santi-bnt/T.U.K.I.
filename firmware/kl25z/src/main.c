#include "uart_link.h"
#include "command_router.h"
#include "servo_control.h"
#include "servo_pwm.h"
#include "safety.h"

#include "fsl_common.h"
#include "fsl_device_registers.h"
#include "fsl_debug_console.h"
#include "fsl_wdog.h"
#include "board.h"
#include "clock_config.h"

static volatile uint32_t system_millis;

void SysTick_Handler(void)
{
    system_millis++;
}

int main(void)
{
    wdog_config_t watchdog_config;

    BOARD_BootClockRUN();
    BOARD_InitDebugConsole(); /* Keeps the OpenSDA VCOM on the board's UART0. */
    (void)SysTick_Config(SystemCoreClock / 1000u);
    WDOG_GetDefaultConfig(&watchdog_config);
    watchdog_config.enableWdog = true;
    watchdog_config.enableWindowMode = false;
    watchdog_config.timeoutValue = 0xFFFFu;
    WDOG_Init(WDOG, &watchdog_config);

    if (!uart_link_init() || !servo_pwm_init()) {
        /* A startup fault leaves PWM low; watchdog reset is the final fallback. */
        PRINTF("TUKI startup failure; robot UART or TPM0 init failed.\r\n");
        for (;;) { __WFI(); }
    }
    servo_control_init();
    safety_init();

    uart_link_write_line("READY,KL25Z_UART1_115200_8N1,DISARMED");
    PRINTF("TUKI KL25Z ready: UART1 robot link, TPM0 signals low, DISARMED.\r\n");
    for (;;) {
        uart_link_poll(system_millis, command_router_handle);
        servo_control_tick(system_millis);
        safety_tick(system_millis);
        WDOG_Refresh(WDOG);
    }
}
