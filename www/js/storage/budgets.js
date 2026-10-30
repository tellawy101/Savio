// ==============================
// storage/budgets.js
// الميزانية وميزانيات الفئات
// ==============================

// ==============================
// Budget
// ==============================

const BUDGET_KEY = "savioBudget";

function getBudget() {
    return Number(localStorage.getItem(BUDGET_KEY)) || 0;
}

function saveBudget(amount) {
safeSetItem(BUDGET_KEY, amount);

}

// ==============================
// Category Budgets
// ==============================

const CATEGORY_BUDGETS_KEY = "savioCategoryBudgets";

// شكل البيانات: { "اسم الفئة": مبلغ }
function getCategoryBudgets() {
    return safeParse(CATEGORY_BUDGETS_KEY, {});
}

function saveCategoryBudgets(budgets) {
safeSetItem(CATEGORY_BUDGETS_KEY, JSON.stringify(budgets));
}
// بيقارن شهر التاريخ (YYYY-MM-DD) بالشهر الحالي كنص، من غير تحويل لـ Date
function isDateInCurrentMonth(dateStr) {
    const now = new Date();
    const key = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
    return String(dateStr || "").slice(0, 7) === key;
}
// بترجع "near" لو الفئة وصلت 80% من حدها بعد المصروف ده،
// و "over" لو عدّت الحد، وإلا null
function getBudgetAlertType(categoryId, amount, date) {
    const limit = Number(getCategoryBudgets()[categoryId]) || 0;
    if (limit <= 0) return null;

    if (!isDateInCurrentMonth(date)) return null;
    
    let after = 0;
    loadTransactions().forEach(function(tx) {
        if (tx.type !== "expense" || tx.isTransfer === true) return;
        if (getTxCategoryId(tx) !== categoryId || !tx.date) return;
        
        if (isDateInCurrentMonth(tx.date)) {
            after += Number(tx.amount) || 0;
        }
    });
    if (after > limit) return "over";
    if (after >= limit) return "full";
    if (after >= limit * 0.8) return "near";
    return null;
}
