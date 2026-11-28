#ifndef TUKI_KL25Z_UART_LINK_H
#define TUKI_KL25Z_UART_LINK_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

typedef void (*uart_line_callback_t)(const char *line, size_t length, uint32_t now_ms);

bool uart_link_init(void);
void uart_link_poll(uint32_t now_ms, uart_line_callback_t on_line);
void uart_link_write_line(const char *line);

#endif
