#include "servo_config.h"

/*
 * Safe one-servo commissioning default: every output is disabled. To begin
 * Phase B, enable only index 0 after physically checking the first SG90 setup.
 * The 1490..1510 us window is a small commissioning window around the nominal
 * 1500 us reference, not a measured finger range or a calibrated gesture.
 */
const servo_config_t g_servo_config[TUKI_SERVO_COUNT] = {
    {"pulgar", 1490u, 1510u, 1500u, false, false, false, false, 1500u, 1500u},
    {"indice", 1490u, 1510u, 1500u, false, false, false, false, 1500u, 1500u},
    {"medio", 1490u, 1510u, 1500u, false, false, false, false, 1500u, 1500u},
    {"anular", 1490u, 1510u, 1500u, false, false, false, false, 1500u, 1500u},
    {"menique", 1490u, 1510u, 1500u, false, false, false, false, 1500u, 1500u}
};
