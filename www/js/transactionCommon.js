// ==============================
// transactionCommon.js
// أدوات مشتركة بين صفحات الدخل/الصرف/التحويل (DRY)
// ==============================

function initBackButton(btn) {
    if (!btn) return;
    btn.onclick = function () {
        navigateTo("home");
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

// الوقت بصيغة HH:mm بنظام 24 ساعة (مستقل عن لغة الجهاز)
function getCurrentTimeString() {
    const d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}
// تنسيق موحد للتواريخ في البرنامج: 3 نوفمبر 2026 / 3 Nov 2026 (عرض فقط)
function formatDateFromObj(d) {
    const arMonths = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
                      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const months = getLanguage() === "ar" ? arMonths : enMonths;
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
}
function formatDisplayDate(dateStr) {
    if (!dateStr) return "";
    const parts = String(dateStr).split("-");
    if (parts.length !== 3) return dateStr;
    return formatDateFromObj(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
}
function syncDateText(dateEl, textEl) {
    if (!dateEl || !textEl) return;
    const parts = String(dateEl.value || "").split("-");
    textEl.value = parts.length === 3 ? formatDisplayDate(dateEl.value) : "";
}
function generateTransactionId(prefix) {
    return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
}