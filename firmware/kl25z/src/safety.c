#include "safety.h"

#include "servo_control.h"
#include "uart_link.h"

enum { LINK_TIMEOUT_MS = 1500u };
static uint32_t last_valid_command_ms;
static bool have_valid_command;
static bool link_timeout_fault;

void safety_init(void)
{
    last_valid_command_ms = 0u;
    have_valid_command = false;
    link_timeout_fault = false;
}

void safety_note_valid_command(uint32_t now_ms)
{
    last_valid_command_ms = now_ms;
    have_valid_command = true;
}

void safety_clear_fault(void)
{
    link_timeout_fault = false;
}

void safety_tick(uint32_t now_ms)
{
    servo_status_t status;
    servo_control_get_status(&status);
    if (status.armed && have_valid_command &&
        (uint32_t)(now_ms - last_valid_command_ms) >= LINK_TIMEOUT_MS) {
        servo_control_disarm();
        link_timeout_fault = true;
        uart_link_write_line("ERR,LINK_TIMEOUT,PWM_LOW");
    }
}

bool safety_has_link_timeout_fault(void)
{
    return link_timeout_fault;
}
