#include "tuki_protocol.h"
#include <assert.h>
#include <string.h>

static void expect_ok(const char *line, tuki_command_type_t type)
{
    tuki_command_t command;
    assert(tuki_parse_line(line, strlen(line), &command) == TUKI_PARSE_OK);
    assert(command.type == type);
}

int main(void)
{
    tuki_command_t command;
    char too_long[TUKI_LINE_MAX + 1u];

    expect_ok("PING", TUKI_CMD_PING);
    expect_ok("STATUS", TUKI_CMD_STATUS);
    expect_ok("ARM", TUKI_CMD_ARM);
    expect_ok("DISARM", TUKI_CMD_DISARM);
    expect_ok("STOP", TUKI_CMD_STOP);
    expect_ok("HELP", TUKI_CMD_HELP);
    expect_ok("OPEN", TUKI_CMD_OPEN);
    expect_ok("CLOSE", TUKI_CMD_CLOSE);

    assert(tuki_parse_line("SET 0 1500", 10u, &command) == TUKI_PARSE_OK);
    assert(command.type == TUKI_CMD_SET && command.servo_index == 0u && command.pulse_us[0] == 1500u);
    assert(tuki_parse_line("POSE 1500 1510 1520 1490 1500", 29u, &command) == TUKI_PARSE_OK);
    assert(command.pulse_us[0] == 1500u && command.pulse_us[4] == 1500u);

    assert(tuki_parse_line("SET 5 1500", 10u, &command) == TUKI_PARSE_RANGE);
    assert(tuki_parse_line("SET 0 499", 9u, &command) == TUKI_PARSE_RANGE);
    assert(tuki_parse_line("SET 0 2501", 10u, &command) == TUKI_PARSE_RANGE);
    assert(tuki_parse_line("SET 0 -1", 8u, &command) == TUKI_PARSE_SYNTAX);
    assert(tuki_parse_line("SET 0 999999999999999999999", 27u, &command) == TUKI_PARSE_SYNTAX);
    assert(tuki_parse_line("SET 0 1500 extra", 16u, &command) == TUKI_PARSE_SYNTAX);
    assert(tuki_parse_line("PING now", 8u, &command) == TUKI_PARSE_SYNTAX);
    assert(tuki_parse_line("PING\nARM", 8u, &command) == TUKI_PARSE_SYNTAX);
    assert(tuki_parse_line("BOGUS", 5u, &command) == TUKI_PARSE_UNKNOWN_COMMAND);
    assert(tuki_parse_line("   ", 3u, &command) == TUKI_PARSE_EMPTY);

    memset(too_long, 'X', sizeof(too_long));
    assert(tuki_parse_line(too_long, sizeof(too_long), &command) == TUKI_PARSE_TOO_LONG);
    assert(tuki_parse_line(NULL, 0u, &command) == TUKI_PARSE_SYNTAX);
    assert(tuki_parse_line("PING", 4u, NULL) == TUKI_PARSE_SYNTAX);
    return 0;
}
