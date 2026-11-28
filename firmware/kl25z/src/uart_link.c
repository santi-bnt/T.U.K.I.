#include "uart_link.h"
#include "tuki_protocol.h"

#include "fsl_clock.h"
#include "fsl_port.h"
#include "fsl_uart.h"
#include "fsl_device_registers.h"
#include <string.h>

enum { UART_LINE_SIZE = 97u, PARTIAL_LINE_TIMEOUT_MS = 1000u };

static char receive_line[UART_LINE_SIZE];
static size_t receive_length;
static uint32_t last_byte_ms;
static bool line_started;
static bool discard_until_lf;

bool uart_link_init(void)
{
    uart_config_t config;

    CLOCK_EnableClock(kCLOCK_PortE);
    /* PTE0 is UART1_TX (ALT3); PTE1 is UART1_RX (ALT3). */
    PORT_SetPinMux(PORTE, 0u, kPORT_MuxAlt3);
    PORT_SetPinMux(PORTE, 1u, kPORT_MuxAlt3);
    /* SIM_SOPT5 source 00 routes UART1 through the selected PTE pins. */
    SIM->SOPT5 &= ~(SIM_SOPT5_UART1TXSRC_MASK | SIM_SOPT5_UART1RXSRC_MASK);

    UART_GetDefaultConfig(&config);
    config.baudRate_Bps = 115200u;
    config.parityMode = kUART_ParityDisabled;
    config.stopBitCount = kUART_OneStopBit;
    config.enableTx = true;
    config.enableRx = true;

    return UART_Init(UART1, &config, CLOCK_GetFreq(kCLOCK_BusClk)) == kStatus_Success;
}

void uart_link_write_line(const char *line)
{
    if (line == NULL) {
        return;
    }
    UART_WriteBlocking(UART1, (const uint8_t *)line, strlen(line));
    UART_WriteBlocking(UART1, (const uint8_t *)"\r\n", 2u);
}

void uart_link_poll(uint32_t now_ms, uart_line_callback_t on_line)
{
    while ((UART_GetStatusFlags(UART1) & kUART_RxDataRegFullFlag) != 0u) {
        const char ch = (char)UART_ReadByte(UART1);
        last_byte_ms = now_ms;
        line_started = true;

        if (ch == '\r') {
            continue;
        }
        if (ch == '\n') {
            if (discard_until_lf) {
                uart_link_write_line("ERR,LINE_TOO_LONG");
            } else if (receive_length > 0u && on_line != NULL) {
                receive_line[receive_length] = '\0';
                on_line(receive_line, receive_length, now_ms);
            }
            receive_length = 0u;
            discard_until_lf = false;
            line_started = false;
            continue;
        }
        if (discard_until_lf) {
            continue;
        }
        if (receive_length >= TUKI_LINE_MAX) {
            discard_until_lf = true;
            continue;
        }
        receive_line[receive_length++] = ch;
    }

    if (line_started && (uint32_t)(now_ms - last_byte_ms) >= PARTIAL_LINE_TIMEOUT_MS) {
        receive_length = 0u;
        discard_until_lf = false;
        line_started = false;
        uart_link_write_line("ERR,INCOMPLETE_TIMEOUT");
    }
}
