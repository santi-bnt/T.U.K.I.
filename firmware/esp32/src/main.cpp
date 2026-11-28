#include <Arduino.h>
#include <string.h>
#include <stdio.h>
#include "board_pins.h"
#include "tuki_protocol.h"

#if __has_include("wifi_config.h")
#include "wifi_config.h"
#define TUKI_WIFI_CONFIGURED 1
#include <WebServer.h>
#include <WiFi.h>
#else
#define TUKI_WIFI_CONFIGURED 0
#endif

namespace {
constexpr size_t kLineBufferSize = TUKI_LINE_MAX + 1u;
HardwareSerial RobotSerial(2);
char usbLine[kLineBufferSize];
size_t usbLength = 0u;
bool discardUsbLine = false;
char klLine[kLineBufferSize];
size_t klLength = 0u;
bool discardKlLine = false;
bool uartReplyPending = false;
bool klArmed = false;
uint32_t heartbeatDueAt = 0u;
uint32_t commandSentAt = 0u;
char latestKlReply[kLineBufferSize] = "not-connected";
bool sendValidatedCommand(const char *line, size_t length);

#if TUKI_WIFI_CONFIGURED
WebServer apiServer(80);
bool apiServerStarted = false;
bool wifiAttemptStarted = false;
uint32_t wifiAttemptAt = 0u;

bool wifiConfigIsValid()
{
    return strlen(TUKI_API_TOKEN) >= 24u && strncmp(TUKI_API_TOKEN, "CHANGE_ME", 9u) != 0;
}

bool apiAuthorized()
{
    if (apiServer.header("Authorization") != String("Bearer ") + TUKI_API_TOKEN) {
        apiServer.send(401, "application/json", "{\"error\":\"unauthorized\"}");
        return false;
    }
    return true;
}

void handleApiCommand()
{
    if (!apiAuthorized()) return;
    if (uartReplyPending) {
        apiServer.send(409, "application/json", "{\"error\":\"command_pending\"}");
        return;
    }
    String commandText = apiServer.arg("command");
    if (commandText.length() == 0) commandText = apiServer.arg("plain");
    if (commandText.length() == 0 || commandText.length() > TUKI_LINE_MAX) {
        apiServer.send(400, "application/json", "{\"error\":\"invalid_command_length\"}");
        return;
    }
    if (!sendValidatedCommand(commandText.c_str(), commandText.length())) {
        apiServer.send(422, "application/json", "{\"error\":\"command_rejected\"}");
        return;
    }
    uartReplyPending = true;
    apiServer.send(202, "application/json", "{\"accepted\":true,\"poll\":\"/api/status\"}");
}

void handleApiStatus()
{
    if (!apiAuthorized()) return;
    String reply = latestKlReply;
    reply.replace("\\", "\\\\");
    reply.replace("\"", "\\\"");
    char body[256];
    snprintf(body, sizeof(body), "{\"pending\":%s,\"reply\":\"%s\"}",
             uartReplyPending ? "true" : "false", reply.c_str());
    apiServer.send(200, "application/json", body);
}

void startApiIfReady()
{
    if (!wifiAttemptStarted) {
        WiFi.mode(WIFI_STA);
        WiFi.begin(TUKI_WIFI_SSID, TUKI_WIFI_PASSWORD);
        wifiAttemptStarted = true;
        wifiAttemptAt = millis();
        Serial.println("Wi-Fi connection started; credentials are local-only.");
    }
    if (!apiServerStarted && WiFi.status() == WL_CONNECTED) {
        static const char *headers[] = {"Authorization"};
        apiServer.collectHeaders(headers, 1u);
        apiServer.on("/api/command", HTTP_POST, handleApiCommand);
        apiServer.on("/api/status", HTTP_GET, handleApiStatus);
        apiServer.begin();
        apiServerStarted = true;
        Serial.print("Local API: http://");
        Serial.println(WiFi.localIP());
        Serial.println("Use Authorization: Bearer <local token>; never expose this endpoint to the public Internet.");
    }
    if (apiServerStarted) apiServer.handleClient();
    if (wifiAttemptStarted && !apiServerStarted && millis() - wifiAttemptAt > 20000u) {
        Serial.println("Wi-Fi not connected yet; retrying without blocking the UART bridge.");
        WiFi.disconnect();
        WiFi.begin(TUKI_WIFI_SSID, TUKI_WIFI_PASSWORD);
        wifiAttemptAt = millis();
    }
}
#endif

void writeError(const char *reason)
{
    Serial.print("ERR,");
    Serial.println(reason);
}

bool sendValidatedCommand(const char *line, size_t length)
{
    if (uartReplyPending) {
        writeError("BUSY");
        return false;
    }
    tuki_command_t command;
    const tuki_parse_result_t result = tuki_parse_line(line, length, &command);
    if (result != TUKI_PARSE_OK) {
        writeError(tuki_parse_result_name(result));
        return false;
    }

    /* The parser accepts one complete command only; forward its original ASCII spelling. */
    RobotSerial.write(reinterpret_cast<const uint8_t *>(line), length);
    RobotSerial.write('\n');
    Serial.print("TX> ");
    Serial.write(reinterpret_cast<const uint8_t *>(line), length);
    Serial.println();
    uartReplyPending = true;
    commandSentAt = millis();
    return true;
}

void readUsbConsole()
{
    while (Serial.available() > 0) {
        const char ch = static_cast<char>(Serial.read());
        if (ch == '\r') {
            continue;
        }
        if (ch == '\n') {
            if (discardUsbLine) {
                writeError("TOO_LONG");
            } else if (usbLength > 0u) {
                sendValidatedCommand(usbLine, usbLength);
            }
            usbLength = 0u;
            discardUsbLine = false;
            continue;
        }
        if (discardUsbLine) {
            continue;
        }
        if (usbLength >= TUKI_LINE_MAX) {
            discardUsbLine = true;
            continue;
        }
        usbLine[usbLength++] = ch;
    }
}

void readKl25Replies()
{
    while (RobotSerial.available() > 0) {
        const char ch = static_cast<char>(RobotSerial.read());
        if (ch == '\r') {
            continue;
        }
        if (ch == '\n') {
            if (discardKlLine) {
                writeError("KL_REPLY_TOO_LONG");
            } else if (klLength > 0u) {
                const size_t copyLength = klLength < sizeof(latestKlReply) - 1u
                                              ? klLength : sizeof(latestKlReply) - 1u;
                memcpy(latestKlReply, klLine, copyLength);
                latestKlReply[copyLength] = '\0';
                uartReplyPending = false;
                if (strcmp(latestKlReply, "OK,ARMED") == 0) {
                    klArmed = true;
                    heartbeatDueAt = millis() + 500u;
                } else if (strncmp(latestKlReply, "READY,", 6u) == 0) {
                    klArmed = false;
                } else if (strncmp(latestKlReply, "OK,DISARMED", 11u) == 0 ||
                           strncmp(latestKlReply, "ERR,LINK_TIMEOUT", 16u) == 0) {
                    klArmed = false;
                } else if (strncmp(latestKlReply, "STATUS,", 7u) == 0) {
                    if (strstr(latestKlReply, ",arm=1,") != nullptr) klArmed = true;
                    if (strstr(latestKlReply, ",arm=0,") != nullptr) klArmed = false;
                }
                Serial.print("KL25Z< ");
                Serial.write(reinterpret_cast<const uint8_t *>(klLine), klLength);
                Serial.println();
            }
            klLength = 0u;
            discardKlLine = false;
            continue;
        }
        if (discardKlLine) {
            continue;
        }
        if (klLength >= TUKI_LINE_MAX) {
            discardKlLine = true;
            continue;
        }
        klLine[klLength++] = ch;
    }
}
} // namespace

void setup()
{
    Serial.begin(115200);
    RobotSerial.begin(TUKI_UART_BAUD, SERIAL_8N1, TUKI_UART2_RX_GPIO, TUKI_UART2_TX_GPIO);
    Serial.println("TUKI ESP32 bridge ready; enter HELP for protocol commands.");
    Serial.println("UART2: 115200 8N1, RX=GPIO16, TX=GPIO17. No servo power is supplied by this board.");
#if TUKI_WIFI_CONFIGURED
    if (!wifiConfigIsValid()) {
        Serial.println("Wi-Fi API disabled: set a unique API token (24+ characters) in local wifi_config.h.");
    }
#else
    Serial.println("Optional Wi-Fi API disabled: copy include/wifi_config.example.h to wifi_config.h and edit it locally.");
#endif
}

void loop()
{
    readUsbConsole();
    readKl25Replies();
    if (uartReplyPending && millis() - commandSentAt > 2000u) {
        uartReplyPending = false;
        strcpy(latestKlReply, "timeout-no-uart-reply");
        Serial.println("ERR,UART_REPLY_TIMEOUT; check wiring and KL25Z power");
    }
    if (klArmed && !uartReplyPending && static_cast<int32_t>(millis() - heartbeatDueAt) >= 0) {
        heartbeatDueAt = millis() + 500u;
        (void)sendValidatedCommand("PING", 4u);
    }
#if TUKI_WIFI_CONFIGURED
    if (wifiConfigIsValid()) {
        startApiIfReady();
    }
#endif
}
