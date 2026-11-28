#include "servo_control.h"

#include "servo_config.h"
#include "servo_pwm.h"

#include <string.h>

enum { SERVO_STEP_US = 8u, SERVO_UPDATE_MS = 20u };
static servo_status_t state;
static uint32_t last_update_ms;

static bool is_enabled(uint8_t index)
{
    return index < TUKI_SERVO_COUNT && g_servo_config[index].enabled;
}

static bool pulse_in_config(uint8_t index, uint16_t pulse_us)
{
    int32_t physical_pulse;
    const servo_config_t *config;
    if (!is_enabled(index)) return false;
    config = &g_servo_config[index];
    physical_pulse = config->inverted ? (int32_t)(2u * config->neutral_us) - pulse_us : pulse_us;
    return pulse_us >= config->minimum_us && pulse_us <= config->maximum_us &&
           physical_pulse >= config->minimum_us && physical_pulse <= config->maximum_us;
}

static uint16_t apply_direction(uint8_t index, uint16_t pulse_us)
{
    const servo_config_t *config = &g_servo_config[index];
    if (!config->inverted) {
        return pulse_us;
    }
    return (uint16_t)((int32_t)(2u * config->neutral_us) - pulse_us);
}

void servo_control_init(void)
{
    uint8_t index;
    memset(&state, 0, sizeof(state));
    state.armed = false;
    for (index = 0u; index < TUKI_SERVO_COUNT; index++) {
        state.current_us[index] = g_servo_config[index].neutral_us;
        state.target_us[index] = g_servo_config[index].neutral_us;
    }
    servo_pwm_all_low();
}

bool servo_control_arm(void)
{
    uint8_t index;
    bool any_enabled = false;
    for (index = 0u; index < TUKI_SERVO_COUNT; index++) {
        if (g_servo_config[index].enabled) {
            any_enabled = true;
            if (!pulse_in_config(index, g_servo_config[index].neutral_us)) {
                return false;
            }
        }
    }
    if (!any_enabled) {
        return false;
    }
    state.armed = true;
    for (index = 0u; index < TUKI_SERVO_COUNT; index++) {
        if (is_enabled(index)) {
            state.current_us[index] = g_servo_config[index].neutral_us;
            state.target_us[index] = g_servo_config[index].neutral_us;
            servo_pwm_set_pulse(index, apply_direction(index, state.current_us[index]));
        }
    }
    return true;
}

void servo_control_disarm(void)
{
    state.armed = false;
    servo_pwm_all_low();
}

void servo_control_stop(void)
{
    uint8_t index;
    for (index = 0u; index < TUKI_SERVO_COUNT; index++) {
        state.target_us[index] = state.current_us[index];
    }
}

bool servo_control_set(uint8_t index, uint16_t pulse_us)
{
    if (!state.armed || !pulse_in_config(index, pulse_us)) {
        return false;
    }
    state.target_us[index] = pulse_us;
    return true;
}

bool servo_control_pose(const uint16_t pulse_us[TUKI_SERVO_COUNT])
{
    uint8_t index;
    if (!state.armed || pulse_us == NULL) {
        return false;
    }
    /* Validate every channel before changing any target (all-or-nothing POSE). */
    for (index = 0u; index < TUKI_SERVO_COUNT; index++) {
        if (!pulse_in_config(index, pulse_us[index])) {
            return false;
        }
    }
    for (index = 0u; index < TUKI_SERVO_COUNT; index++) {
        state.target_us[index] = pulse_us[index];
    }
    return true;
}

bool servo_control_gesture(bool close_gesture)
{
    uint16_t pose[TUKI_SERVO_COUNT];
    uint8_t index;
    for (index = 0u; index < TUKI_SERVO_COUNT; index++) {
        if (!is_enabled(index) || !g_servo_config[index].limits_calibrated ||
            !g_servo_config[index].gestures_calibrated) {
            return false;
        }
        pose[index] = close_gesture ? g_servo_config[index].close_us : g_servo_config[index].open_us;
    }
    return servo_control_pose(pose);
}

void servo_control_tick(uint32_t now_ms)
{
    uint8_t index;
    if (!state.armed || (uint32_t)(now_ms - last_update_ms) < SERVO_UPDATE_MS) {
        return;
    }
    last_update_ms = now_ms;
    for (index = 0u; index < TUKI_SERVO_COUNT; index++) {
        uint16_t current = state.current_us[index];
        const uint16_t target = state.target_us[index];
        if (!is_enabled(index) || current == target) {
            continue;
        }
        if (target > current) {
            uint16_t difference = (uint16_t)(target - current);
            current = (uint16_t)(current + (difference > SERVO_STEP_US ? SERVO_STEP_US : difference));
        } else {
            uint16_t difference = (uint16_t)(current - target);
            current = (uint16_t)(current - (difference > SERVO_STEP_US ? SERVO_STEP_US : difference));
        }
        state.current_us[index] = current;
        servo_pwm_set_pulse(index, apply_direction(index, current));
    }
}

void servo_control_get_status(servo_status_t *status)
{
    if (status != NULL) {
        *status = state;
    }
}

uint8_t servo_control_enabled_mask(void)
{
    uint8_t index;
    uint8_t mask = 0u;
    for (index = 0u; index < TUKI_SERVO_COUNT; index++) {
        if (g_servo_config[index].enabled) {
            mask |= (uint8_t)(1u << index);
        }
    }
    return mask;
}
