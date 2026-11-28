#ifndef TUKI_PROTOCOL_H
#define TUKI_PROTOCOL_H

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

#define TUKI_SERVO_COUNT 5u
#define TUKI_LINE_MAX 96u
#define TUKI_PULSE_MIN_US 500u
#define TUKI_PULSE_MAX_US 2500u

typedef enum {
    TUKI_CMD_NONE = 0,
    TUKI_CMD_PING,
    TUKI_CMD_STATUS,
    TUKI_CMD_ARM,
    TUKI_CMD_DISARM,
    TUKI_CMD_SET,
    TUKI_CMD_POSE,
    TUKI_CMD_OPEN,
    TUKI_CMD_CLOSE,
    TUKI_CMD_STOP,
    TUKI_CMD_HELP
} tuki_command_type_t;

typedef struct {
    tuki_command_type_t type;
    uint8_t servo_index;
    uint16_t pulse_us[TUKI_SERVO_COUNT];
} tuki_command_t;

typedef enum {
    TUKI_PARSE_OK = 0,
    TUKI_PARSE_EMPTY,
    TUKI_PARSE_TOO_LONG,
    TUKI_PARSE_UNKNOWN_COMMAND,
    TUKI_PARSE_SYNTAX,
    TUKI_PARSE_RANGE
} tuki_parse_result_t;

/* Parse one command without modifying the input. `length` excludes LF. */
tuki_parse_result_t tuki_parse_line(const char *line, size_t length, tuki_command_t *out);
const char *tuki_parse_result_name(tuki_parse_result_t result);

#ifdef __cplusplus
}
#endif

#endif
