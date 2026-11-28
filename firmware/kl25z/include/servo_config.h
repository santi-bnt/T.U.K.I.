#ifndef TUKI_SERVO_CONFIG_H
#define TUKI_SERVO_CONFIG_H

#include <stdbool.h>
#include <stdint.h>

#include "tuki_protocol.h"

typedef struct {
    const char *name;
    uint16_t minimum_us;
    uint16_t maximum_us;
    uint16_t neutral_us;
    bool inverted;
    bool enabled;
    bool limits_calibrated;
    bool gestures_calibrated;
    uint16_t open_us;
    uint16_t close_us;
} servo_config_t;

extern const servo_config_t g_servo_config[TUKI_SERVO_COUNT];

#endif
