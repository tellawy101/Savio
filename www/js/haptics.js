// ==============================
// haptics.js
// اهتزاز خفيف (Capacitor Haptics) مع بديل للمتصفح
// ==============================
function getHapticsPlugin() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
        return window.Capacitor.Plugins.Haptics;
    }
    return null;
}

function hapticTap() {
    try {
        const h = getHapticsPlugin();
        if (h) h.impact({ style: "LIGHT" });
        else if (navigator.vibrate) navigator.vibrate(10);
    } catch (e) {}
}

function hapticSuccess() {
    try {
        const h = getHapticsPlugin();
        if (h) h.notification({ type: "SUCCESS" });
        else if (navigator.vibrate) navigator.vibrate([15, 40, 15]);
    } catch (e) {}
}

function hapticWarning() {
    try {
        const h = getHapticsPlugin();
        if (h) h.notification({ type: "WARNING" });
        else if (navigator.vibrate) navigator.vibrate(30);
    } catch (e) {}
}