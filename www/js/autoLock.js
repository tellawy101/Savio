// ==============================
// autoLock.js
// القفل التلقائي لما التطبيق يرجع من الخلفية
// ==============================

function getAutoLockLabelKey(seconds) {
    if (seconds === 0) return "autolock_immediately";
    if (seconds === 60) return "autolock_1min";
    if (seconds === 300) return "autolock_5min";
    return "autolock_never";
}

let autoLockHiddenAt = null;

document.addEventListener("visibilitychange", function () {

    if (document.hidden) {
        autoLockHiddenAt = Date.now();
        return;
    }

    if (autoLockHiddenAt === null) return;

    const awayMs = Date.now() - autoLockHiddenAt;
    autoLockHiddenAt = null;

    const limitSeconds = getAutoLockSeconds();

    if (limitSeconds < 0) return;
    if (!hasPin()) return;
    if (document.getElementById("lockScreen")) return;

    if (awayMs >= limitSeconds * 1000) {
        showLockScreen({ mode: "verify" });
    }
});