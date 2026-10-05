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
    const d = new Date();
    return d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");
}

function getCurrentTimeString() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDisplayDate(dateStr) {
    if (!dateStr) return "";
    const parts = String(dateStr).split("-");
    if (parts.length !== 3) return dateStr;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const locale = getLanguage() === "ar" ? "ar-EG-u-nu-latn" : "en-US";
    return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}
function generateTransactionId(prefix) {
    return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
}