#include "servo_pwm.h"

#include "fsl_clock.h"
#include "fsl_port.h"
#include "fsl_tpm.h"
#include "fsl_device_registers.h"

/* FRDM-KL25Z header and mux mapping: PTC1/2/3/4 ALT4, PTC8 ALT3. */
static const uint8_t kPortCChannels[TUKI_SERVO_COUNT] = {0u, 1u, 2u, 3u, 4u};
static const uint8_t kPortCMux[TUKI_SERVO_COUNT] = {
    kPORT_MuxAlt4, kPORT_MuxAlt4, kPORT_MuxAlt4, kPORT_MuxAlt4, kPORT_MuxAlt3
};
static const uint8_t kPortCPins[TUKI_SERVO_COUNT] = {1u, 2u, 3u, 4u, 8u};

bool servo_pwm_init(void)
{
    tpm_config_t config;
    tpm_chnl_pwm_signal_param_t channels[TUKI_SERVO_COUNT];
    uint8_t index;

    CLOCK_EnableClock(kCLOCK_PortC);
    for (index = 0u; index < TUKI_SERVO_COUNT; index++) {
        PORT_SetPinMux(PORTC, kPortCPins[index], (port_mux_t)kPortCMux[index]);
        channels[index].chnlNumber = (tpm_chnl_t)kPortCChannels[index];
        channels[index].level = kTPM_HighTrue;
        channels[index].dutyCyclePercent = 0u; /* Boot with every signal low. */
    }

    /* Select MCGFLLCLK (48 MHz) explicitly, then divide by 16 to obtain
     * the 3 MHz TPM counter clock (1 tick = 1/3 us). */
    SIM->SOPT2 = (SIM->SOPT2 & ~(SIM_SOPT2_TPMSRC_MASK | SIM_SOPT2_PLLFLLSEL_MASK)) |
                 SIM_SOPT2_TPMSRC(1u);
    CLOCK_EnableClock(kCLOCK_Tpm0);
    TPM_GetDefaultConfig(&config);
    config.prescale = kTPM_Prescale_Divide_16;
    TPM_Init(TPM0, &config);

    if (TPM_SetupPwm(TPM0, channels, TUKI_SERVO_COUNT, kTPM_EdgeAlignedPwm,
                     50u, 48000000u) != kStatus_Success) {
        TPM_Deinit(TPM0);
        return false;
    }
    /* Fail closed if the selected source or divisor does not produce 20 ms. */
    if (TPM0->MOD != 59999u) {
        servo_pwm_all_low();
        TPM_Deinit(TPM0);
        return false;
    }
    /* Avoid a one-frame pulse when starting the counter. */
    servo_pwm_all_low();
    TPM_StartTimer(TPM0, kTPM_SystemClock);
    return true;
}

void servo_pwm_set_pulse(uint8_t index, uint16_t pulse_us)
{
    if (index >= TUKI_SERVO_COUNT) {
        return;
    }
    /* The selected TPM tick is 1/3 us; compare value = pulse_us * 3. */
    TPM0->CONTROLS[index].CnV = (uint32_t)pulse_us * 3u;
}

void servo_pwm_all_low(void)
{
    uint8_t index;
    for (index = 0u; index < TUKI_SERVO_COUNT; index++) {
        TPM0->CONTROLS[index].CnV = 0u;
    }
}
