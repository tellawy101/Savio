// ==============================================================
// bootstrap/appStart.js
// نقطة بداية التطبيق: بيتحمّل آخر سكريبت في الصفحة
// ==============================================================
document.addEventListener("DOMContentLoaded", function () {
    migrateDataToIds();

    let recurringAdded = 0;
    try {
        recurringAdded = processRecurringTransactions();
    } catch (error) {
        console.error("Recurring transactions failed:", error);
    }

    initIcons();
    navigateTo("home");
    showOnboardingIfNeeded();

    if (recurringAdded > 0) {
        showToast(t("recurring_auto_added_toast") + " " + recurringAdded, "success");
    }
    if (typeof runAutoBackupIfNeeded === "function") {
        runAutoBackupIfNeeded();
    }
});
