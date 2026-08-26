// ==============================
// transactionCommon.js
// أدوات مشتركة بين صفحات الدخل/الصرف/التحويل (DRY)
// ==============================

function initBackButton(btn) {
    if (!btn) return;
    btn.onclick = function () {
        window.location.href = "../index.html";
    };
}

function setupCommonFormPage() {
    fixScrollOnFocusOut();
    applyStoredTheme();
}

function getTodayDateString() {
    return new Date().toISOString().split("T")[0];
}

function getCurrentTimeString() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function generateTransactionId(prefix) {
    return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
}