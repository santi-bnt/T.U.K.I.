#include "command_router.h"

#include "servo_control.h"
#include "safety.h"
#include "uart_link.h"
#include "tuki_protocol.h"

#include <stdio.h>

static void report_parse_error(tuki_parse_result_t result)
{
    char response[48];
    (void)snprintf(response, sizeof(response), "ERR,%s", tuki_parse_result_name(result));
    uart_link_write_line(response);
}

static void send_status(void)
{
    servo_status_t status;
    char response[96];
    uint8_t index;
    size_t used;
    int prefix_length;
    servo_control_get_status(&status);
    prefix_length = snprintf(response, sizeof(response), "STATUS,link=OK,a%u,f%u,e%02X,c",
                             status.armed ? 1u : 0u, safety_has_link_timeout_fault() ? 1u : 0u,
                             servo_control_enabled_mask());
    if (prefix_length < 0 || (size_t)prefix_length >= sizeof(response)) return;
    used = (size_t)prefix_length;
    for (index = 0u; index < TUKI_SERVO_COUNT && used < sizeof(response); index++) {
        const int written = snprintf(&response[used], sizeof(response) - used,
                                     "%s%u", index == 0u ? "" : "/", status.current_us[index]);
        if (written < 0 || (size_t)written >= sizeof(response) - used) {
            return;
        }
        used += (size_t)written;
    }
    if (used + 2u >= sizeof(response)) return;
    response[used++] = ',';
    response[used++] = 't';
    response[used] = '\0';
    for (index = 0u; index < TUKI_SERVO_COUNT && used < sizeof(response); index++) {
        const int written = snprintf(&response[used], sizeof(response) - used,
                                     "%s%u", index == 0u ? "" : "/", status.target_us[index]);
        if (written < 0 || (size_t)written >= sizeof(response) - used) return;
        used += (size_t)written;
    }
    uart_link_write_line(response);
}

void command_router_handle(const char *line, size_t length, uint32_t now_ms)
{
    tuki_command_t command;
    const tuki_parse_result_t result = tuki_parse_line(line, length, &command);
    if (result != TUKI_PARSE_OK) {
        report_parse_error(result);
        return;
    }
    safety_note_valid_command(now_ms);

    switch (command.type) {
        case TUKI_CMD_PING:
            uart_link_write_line("PONG");
            break;
        case TUKI_CMD_STATUS:
            send_status();
            break;
        case TUKI_CMD_HELP:
            uart_link_write_line("HELP PING STATUS ARM DISARM SET POSE OPEN CLOSE STOP HELP");
            break;
        case TUKI_CMD_ARM:
            if (safety_has_link_timeout_fault()) uart_link_write_line("ERR,FAULT_LATCHED_SEND_DISARM");
            else if (servo_control_arm()) uart_link_write_line("OK,ARMED");
            else uart_link_write_line("ERR,NO_ENABLED_OR_INVALID_SERVO_CONFIG");
            break;
        case TUKI_CMD_DISARM:
            servo_control_disarm();
            safety_clear_fault();
            uart_link_write_line("OK,DISARMED,PWM_LOW");
            break;
        case TUKI_CMD_STOP:
            servo_control_stop();
            uart_link_write_line("OK,STOPPED_AT_CURRENT,PWM_ACTIVE_IF_ARMED");
            break;
        case TUKI_CMD_SET:
            if (servo_control_set(command.servo_index, command.pulse_us[0]))
                uart_link_write_line("OK,TARGET_ACCEPTED");
            else uart_link_write_line("ERR,DISARMED_OR_SERVO_DISABLED_OR_LIMIT");
            break;
        case TUKI_CMD_POSE:
            if (servo_control_pose(command.pulse_us)) uart_link_write_line("OK,POSE_ACCEPTED");
            else uart_link_write_line("ERR,DISARMED_OR_SERVO_DISABLED_OR_LIMIT");
            break;
        case TUKI_CMD_OPEN:
        case TUKI_CMD_CLOSE:
            if (servo_control_gesture(command.type == TUKI_CMD_CLOSE))
                uart_link_write_line("OK,GESTURE_ACCEPTED");
            else uart_link_write_line("ERR,GESTURE_NOT_CALIBRATED_OR_DISARMED");
            break;
        default:
            uart_link_write_line("ERR,UNSUPPORTED");
            break;
    }
}
