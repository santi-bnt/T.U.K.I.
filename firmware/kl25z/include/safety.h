#ifndef TUKI_SAFETY_H
#define TUKI_SAFETY_H

#include <stdbool.h>
#include <stdint.h>

void safety_init(void);
void safety_note_valid_command(uint32_t now_ms);
void safety_clear_fault(void);
void safety_tick(uint32_t now_ms);
bool safety_has_link_timeout_fault(void);

#endif
