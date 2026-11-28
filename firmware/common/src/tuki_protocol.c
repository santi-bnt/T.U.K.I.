#include "tuki_protocol.h"

typedef struct {
    const char *text;
    size_t length;
    size_t cursor;
} token_reader_t;

static void skip_spaces(token_reader_t *reader)
{
    while (reader->cursor < reader->length &&
           (reader->text[reader->cursor] == ' ' || reader->text[reader->cursor] == '\t')) {
        reader->cursor++;
    }
}

static int next_token(token_reader_t *reader, size_t *start, size_t *length)
{
    skip_spaces(reader);
    if (reader->cursor >= reader->length) {
        return 0;
    }

    *start = reader->cursor;
    while (reader->cursor < reader->length &&
           reader->text[reader->cursor] != ' ' && reader->text[reader->cursor] != '\t') {
        const unsigned char ch = (unsigned char)reader->text[reader->cursor];
        if (ch < 0x21u || ch > 0x7Eu) {
            return -1;
        }
        reader->cursor++;
    }
    *length = reader->cursor - *start;
    return 1;
}

static int token_equals(const char *line, size_t start, size_t length, const char *expected)
{
    size_t index = 0u;
    while (expected[index] != '\0') {
        if (index >= length || line[start + index] != expected[index]) {
            return 0;
        }
        index++;
    }
    return index == length;
}

static int parse_unsigned(const char *line, size_t start, size_t length, uint32_t *value)
{
    uint32_t result = 0u;
    size_t index;
    if (length == 0u) {
        return 0;
    }
    for (index = 0u; index < length; index++) {
        const char ch = line[start + index];
        if (ch < '0' || ch > '9') {
            return 0;
        }
        const uint32_t digit = (uint32_t)(ch - '0');
        if (result > (65535u - digit) / 10u) {
            return 0;
        }
        result = result * 10u + digit;
    }
    *value = result;
    return 1;
}

static tuki_parse_result_t read_number(token_reader_t *reader, uint32_t *value)
{
    size_t start = 0u;
    size_t length = 0u;
    const int token = next_token(reader, &start, &length);
    if (token <= 0) {
        return TUKI_PARSE_SYNTAX;
    }
    return parse_unsigned(reader->text, start, length, value) ? TUKI_PARSE_OK : TUKI_PARSE_SYNTAX;
}

static int no_extra_tokens(token_reader_t *reader)
{
    size_t start = 0u;
    size_t length = 0u;
    return next_token(reader, &start, &length) == 0;
}

tuki_parse_result_t tuki_parse_line(const char *line, size_t length, tuki_command_t *out)
{
    token_reader_t reader;
    size_t command_start = 0u;
    size_t command_length = 0u;
    int token;
    uint32_t value;
    size_t index;

    if (line == NULL || out == NULL) {
        return TUKI_PARSE_SYNTAX;
    }
    if (length > TUKI_LINE_MAX) {
        return TUKI_PARSE_TOO_LONG;
    }
    if (length > 0u && line[length - 1u] == '\r') {
        length--;
    }
    if (length == 0u) {
        return TUKI_PARSE_EMPTY;
    }

    out->type = TUKI_CMD_NONE;
    out->servo_index = 0u;
    for (index = 0u; index < TUKI_SERVO_COUNT; index++) {
        out->pulse_us[index] = 0u;
    }

    reader.text = line;
    reader.length = length;
    reader.cursor = 0u;
    token = next_token(&reader, &command_start, &command_length);
    if (token == 0) {
        return TUKI_PARSE_EMPTY;
    }
    if (token < 0) {
        return TUKI_PARSE_SYNTAX;
    }

#define MATCH_COMMAND(name, command) \
    if (token_equals(line, command_start, command_length, name)) { out->type = command; }
    MATCH_COMMAND("PING", TUKI_CMD_PING)
    else MATCH_COMMAND("STATUS", TUKI_CMD_STATUS)
    else MATCH_COMMAND("ARM", TUKI_CMD_ARM)
    else MATCH_COMMAND("DISARM", TUKI_CMD_DISARM)
    else MATCH_COMMAND("SET", TUKI_CMD_SET)
    else MATCH_COMMAND("POSE", TUKI_CMD_POSE)
    else MATCH_COMMAND("OPEN", TUKI_CMD_OPEN)
    else MATCH_COMMAND("CLOSE", TUKI_CMD_CLOSE)
    else MATCH_COMMAND("STOP", TUKI_CMD_STOP)
    else MATCH_COMMAND("HELP", TUKI_CMD_HELP)
    else return TUKI_PARSE_UNKNOWN_COMMAND;
#undef MATCH_COMMAND

    if (out->type == TUKI_CMD_SET) {
        tuki_parse_result_t status = read_number(&reader, &value);
        if (status != TUKI_PARSE_OK) return status;
        if (value >= TUKI_SERVO_COUNT) return TUKI_PARSE_RANGE;
        out->servo_index = (uint8_t)value;

        status = read_number(&reader, &value);
        if (status != TUKI_PARSE_OK) return status;
        if (value < TUKI_PULSE_MIN_US || value > TUKI_PULSE_MAX_US) return TUKI_PARSE_RANGE;
        out->pulse_us[0] = (uint16_t)value;
    } else if (out->type == TUKI_CMD_POSE) {
        for (index = 0u; index < TUKI_SERVO_COUNT; index++) {
            tuki_parse_result_t status = read_number(&reader, &value);
            if (status != TUKI_PARSE_OK) return status;
            if (value < TUKI_PULSE_MIN_US || value > TUKI_PULSE_MAX_US) return TUKI_PARSE_RANGE;
            out->pulse_us[index] = (uint16_t)value;
        }
    }

    if (!no_extra_tokens(&reader)) {
        return TUKI_PARSE_SYNTAX;
    }
    return TUKI_PARSE_OK;
}

const char *tuki_parse_result_name(tuki_parse_result_t result)
{
    switch (result) {
        case TUKI_PARSE_OK: return "OK";
        case TUKI_PARSE_EMPTY: return "EMPTY";
        case TUKI_PARSE_TOO_LONG: return "TOO_LONG";
        case TUKI_PARSE_UNKNOWN_COMMAND: return "UNKNOWN_COMMAND";
        case TUKI_PARSE_SYNTAX: return "SYNTAX";
        case TUKI_PARSE_RANGE: return "RANGE";
        default: return "UNKNOWN_ERROR";
    }
}
