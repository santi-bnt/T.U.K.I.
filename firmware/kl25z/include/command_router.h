#ifndef TUKI_COMMAND_ROUTER_H
#define TUKI_COMMAND_ROUTER_H

#include <stddef.h>
#include <stdint.h>

void command_router_handle(const char *line, size_t length, uint32_t now_ms);

#endif
