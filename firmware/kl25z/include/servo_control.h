#ifndef TUKI_SERVO_CONTROL_H
#define TUKI_SERVO_CONTROL_H

#include <stdbool.h>
#include <stdint.h>

#include "tuki_protocol.h"

typedef struct {
    bool armed;
    uint16_t current_us[TUKI_SERVO_COUNT];
    uint16_t target_us[TUKI_SERVO_COUNT];
} servo_status_t;

void servo_control_init(void);
bool servo_control_arm(void);
void servo_control_disarm(void);
void servo_control_stop(void);
bool servo_control_set(uint8_t index, uint16_t pulse_us);
bool servo_control_pose(const uint16_t pulse_us[TUKI_SERVO_COUNT]);
bool servo_control_gesture(bool close_gesture);
void servo_control_tick(uint32_t now_ms);
void servo_control_get_status(servo_status_t *status);
uint8_t servo_control_enabled_mask(void);

#endif
