// ==============================
// storage.js
// إدارة تخزين المعاملات (مصاريف + دخل) في localStorage
// ==============================
const APP_VERSION = "2.5.1";
const STORAGE_KEY = "transactions";
const CURRENCY_KEY = "currency";
const RECURRING_KEY = "savioRecurring";
// بتبقى true لو معاملات المستخدم تالفة، عشان نمنع الكتابة فوقها
let transactionsCorrupted = false;
// عدّاد فشل الكتابة في التخزين (بنستخدمه عشان نعرف لو عملية كتابة فشلت)
let storageWriteFailures = 0;

// كتابة آمنة في localStorage: لو المساحة خلصت نعرض رسالة ونرجع false
function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        storageWriteFailures++;
        const isQuota = error && (
            error.name === "QuotaExceededError" ||
            error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
            error.code === 22 ||
            error.code === 1014
        );
        console.error("Failed to save '" + key + "':", error);
        if (typeof showToast === "function") {
            showToast(isQuota ? t("storage_full") : t("save_failed"));
        }
        return false;
    }
}
// ==============================
// safeParse - قراءة آمنة من localStorage
// ==============================
function safeParse(key, fallback) {
    const raw = localStorage.getItem(key);

    if (raw === null) return fallback;

    try {
        const data = JSON.parse(raw);

        // لو النوع مختلف عن الـ fallback (array مقابل object) يبقى الداتا تالفة
        if (data === null || Array.isArray(data) !== Array.isArray(fallback)) {
            throw new Error("Unexpected data type for key: " + key);
        }

        return data;
    } catch (error) {
        console.error("Corrupted data in '" + key + "':", error);

              // نسخة احتياطية مرة واحدة لكل مفتاح، وباسم فيه الوقت عشان متتكتبش فوق نفسها
        safeParse._backedUp = safeParse._backedUp || {};
        if (!safeParse._backedUp[key]) {
            safeParse._backedUp[key] = true;
            try {
                localStorage.setItem(key + "_corrupted_backup_" + Date.now(), raw);
            } catch (e) {}
        }
        return fallback;
    }
}
