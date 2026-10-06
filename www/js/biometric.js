// ==============================
// biometric.js
// القفل بالبصمة (فوق الرقم السري)
// ==============================

function getBiometricPlugin() {
    return window.Capacitor &&
        window.Capacitor.Plugins &&
        window.Capacitor.Plugins.BiometricAuthNative;
}

async function isBiometricAvailable() {
    const plugin = getBiometricPlugin();

    if (!plugin) return false;

    try {
        const info = await plugin.checkBiometry();
        return !!info.isAvailable;
    } catch (err) {
        console.warn("Biometric check error:", err);
        return false;
    }
}

async function authenticateBiometric() {
    const plugin = getBiometricPlugin();

    if (!plugin) return false;

    try {
        await plugin.authenticate({
            reason: t("biometric_prompt_reason"),
            cancelTitle: t("pin_cancel"),
            allowDeviceCredential: false,
            androidTitle: t("biometric_prompt_title"),
            androidSubtitle: t("biometric_prompt_reason")
        });

        return true;
    } catch (err) {
        console.warn("Biometric auth failed:", err);
        return false;
    }
}