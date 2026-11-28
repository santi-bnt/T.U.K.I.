#ifndef TUKI_SERVO_PWM_H
#define TUKI_SERVO_PWM_H

#include <stdbool.h>
#include <stdint.h>

#include "tuki_protocol.h"

bool servo_pwm_init(void);
void servo_pwm_set_pulse(uint8_t index, uint16_t pulse_us);
void servo_pwm_all_low(void);

#endif
