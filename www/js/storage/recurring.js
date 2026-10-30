// ==============================
// storage/recurring.js
// تخزين المعاملات المتكررة
// ==============================

// ==============================
// Recurring Transactions
// ==============================

function getRecurring() {
    return safeParse(RECURRING_KEY, []);
}

function saveRecurring(items) {
    safeSetItem(RECURRING_KEY, JSON.stringify(items));
}
