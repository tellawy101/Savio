// ==============================
// storage.js
// إدارة تخزين المعاملات (مصاريف + دخل) في localStorage
// ==============================
const APP_VERSION = "2.4.2";
const STORAGE_KEY = "transactions";
const CURRENCY_KEY = "currency";
// بتبقى true لو معاملات المستخدم تالفة، عشان نمنع الكتابة فوقها
let transactionsCorrupted = false;
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

// ==============================
// Transactions
// ==============================

// بترجع كل المعاملات المخزّنة
// بترجع كل المعاملات المخزّنة
function loadTransactions() {

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    try {

        const data = JSON.parse(raw);

        // لازم يكون array، أي شكل تاني يعتبر تلف في البيانات
        // لازم يكون array، أي شكل تاني يعتبر تلف في البيانات
        if (!Array.isArray(data)) {
            throw new Error("Corrupted transactions data (not an array)");
        }

        // إضافة id ثابت لأي معاملة قديمة متعرفلهاش id قبل كده
        let needsSave = false;

        data.forEach(transaction => {
            if (!transaction.id) {
                transaction.id = "tx_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
                needsSave = true;
            }
        });

        if (needsSave) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }

        return data;

    } catch (error) {

                console.error("Failed to load transactions, data may be corrupted:", error);
        
        // backup مرة واحدة بس وباسم فيه الوقت، عشان أي تلف جديد ميمسحش القديم
        if (!transactionsCorrupted) {
            localStorage.setItem(STORAGE_KEY + "_corrupted_backup_" + Date.now(), raw);
            transactionsCorrupted = true;
        }
        
        return [];

    }

}

// بتحفظ كل المعاملات
function triggerCloudSync() {
    // cloud sync removed
}

function saveTransactions(transactions) {
    
    // لو البيانات الأصلية تالفة، مفيش كتابة فوقها عشان منخسرهاش
    if (transactionsCorrupted) {
        console.error("Save blocked: stored transactions are corrupted");
        
        if (typeof showToast === "function") {
            showToast("بيانات المعاملات تالفة، الحفظ متوقف لحماية بياناتك", "error");
        }
        
        return false;
    }
    
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(transactions)
    );
    triggerCloudSync();
    return true;
}


// ==============================
// Currency
// ==============================

// العملة الافتراضية
const DEFAULT_CURRENCY = "EGP";


// بترجع العملة الحالية
function getCurrency() {
    
    return localStorage.getItem(CURRENCY_KEY) ||
        DEFAULT_CURRENCY;
}


// بتغير العملة
function setCurrency(currency) {
    
    localStorage.setItem(
        CURRENCY_KEY,
        currency
    );
}


// بتنسق المبلغ مع العملة
function formatCurrency(amount) {
    const currency = getCurrency();

    return `${currency} ${Math.round(Number(amount) || 0).toLocaleString("en-US")}`;
}
function formatCurrencyHTML(amount) {
    const currency = getCurrency();
    const value = Math.round(Number(amount) || 0).toLocaleString("en-US");
    
    return `<span class="stat-currency">${currency}</span> <span class="stat-value">${value}</span>`;
}

function formatCurrencyHTMLStats(amount) {
    const currency = getCurrency();
    const value = Math.round(Number(amount) || 0).toLocaleString("en-US");
    
    return `<span class="stats-stat-currency">${currency}</span> <span class="stats-stat-value">${value}</span>`;
}
// ==============================
// Accounts
// ==============================

const ACCOUNTS_KEY = "accounts";

// بترجع كل الحسابات المخزّنة
function getAccounts() {
    return safeParse(ACCOUNTS_KEY, []);
}
function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    triggerCloudSync();
}
const THEME_KEY = "theme";

function getTheme() {
    return localStorage.getItem(THEME_KEY) || "light";
}

function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}
// ==============================
// Categories
// ==============================

const CATEGORIES_KEY = "categories";
const CUSTOM_CATEGORY_ICONS_KEY = "customCategoryIcons";

function getCategories() {
    return safeParse(CATEGORIES_KEY, []);
}

function saveCategories(categories) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function getCustomCategoryIcons() {
    return safeParse(CUSTOM_CATEGORY_ICONS_KEY, []);
}

function saveCustomCategoryIcons(icons) {
    localStorage.setItem(CUSTOM_CATEGORY_ICONS_KEY, JSON.stringify(icons));
}
// ==============================
// Balance Visibility
// ==============================

const BALANCE_HIDDEN_KEY = "balanceHidden";

function getBalanceHidden() {
    return localStorage.getItem(BALANCE_HIDDEN_KEY) === "true";
}

function saveBalanceHidden(hidden) {
    localStorage.setItem(BALANCE_HIDDEN_KEY, hidden);
}
// ==============================
// Budget
// ==============================

const BUDGET_KEY = "savioBudget";

function getBudget() {
    return Number(localStorage.getItem(BUDGET_KEY)) || 0;
}

function saveBudget(amount) {
    localStorage.setItem(BUDGET_KEY, amount);
    triggerCloudSync();
}
// ==============================
// Debts
// ==============================

const DEBTS_KEY = "debts";

function getDebts() {
    return safeParse(DEBTS_KEY, []);
}

function saveDebts(debts) {
    localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
    triggerCloudSync();
}
function removeDebtPayment(paymentId) {
    const debts = getDebts();
    let removed = null;

    debts.forEach(function (debt) {
        if (!Array.isArray(debt.payments)) return;

        const payment = debt.payments.find(function (p) {
            return p.id === paymentId;
        });
        if (!payment) return;

        removed = { debtId: debt.id, payment: payment };

        debt.payments = debt.payments.filter(function (p) {
            return p.id !== paymentId;
        });
                debt.paid = Math.max(0, Math.round((debt.paid - payment.amount) * 100) / 100);
        debt.remaining = Math.round((debt.amount - debt.paid) * 100) / 100;
        debt.status = debt.remaining <= 0 ? "paid" : "open";
    });

    if (removed) saveDebts(debts);
    return removed;
}
function restoreDebtPayment(removed) {
    if (!removed) return;

    const debts = getDebts();
    const debt = debts.find(function (d) {
        return d.id === removed.debtId;
    });
    if (!debt) return;

    if (!Array.isArray(debt.payments)) debt.payments = [];
    debt.payments.push(removed.payment);
    debt.payments.sort(function (a, b) {
        return a.id - b.id;
    });

debt.paid = Math.round((debt.paid + removed.payment.amount) * 100) / 100;
    debt.remaining = Math.max(0, Math.round((debt.amount - debt.paid) * 100) / 100);
    debt.status = debt.remaining <= 0 ? "paid" : "open";

    saveDebts(debts);
}

// ==============================
// Savings Goals
// ==============================

const GOALS_KEY = "savioGoals";

function getGoals() {
    return safeParse(GOALS_KEY, []);
}

function saveGoals(goals) {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    triggerCloudSync();
}
// ==============================
// Category Budgets
// ==============================

const CATEGORY_BUDGETS_KEY = "savioCategoryBudgets";

// شكل البيانات: { "اسم الفئة": مبلغ }
function getCategoryBudgets() {
    try {
        return JSON.parse(localStorage.getItem(CATEGORY_BUDGETS_KEY)) || {};
    } catch (e) {
        return {};
    }
}

function saveCategoryBudgets(budgets) {
    localStorage.setItem(CATEGORY_BUDGETS_KEY, JSON.stringify(budgets));
    triggerCloudSync();
}
// بترجع "near" لو الفئة وصلت 80% من حدها بعد المصروف ده،
// و "over" لو عدّت الحد، وإلا null
function getBudgetAlertType(category, amount, date) {
    const limit = Number(getCategoryBudgets()[category]) || 0;
    if (limit <= 0) return null;

    const now = new Date();
    const txDate = new Date(date);
    if (Number.isNaN(txDate.getTime())) return null;
    if (txDate.getFullYear() !== now.getFullYear() || txDate.getMonth() !== now.getMonth()) return null;

    let after = 0;
    loadTransactions().forEach(function (tx) {
        if (tx.type !== "expense" || tx.isTransfer === true) return;
        if (tx.category !== category || !tx.date) return;

        const d = new Date(tx.date);
        if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
            after += Number(tx.amount) || 0;
        }
    });

    if (after > limit) return "over";
    if (after >= limit) return "full";
    if (after >= limit * 0.8) return "near";
    return null;
}

// ==============================
// حساب إجمالي الديون (منطق بيزنس منفصل عن العرض)
// ==============================
function calculateDebtTotals(debts) {
    let receivable = 0;
    let payable = 0;

    debts.forEach(debt => {
        const remaining = Number(debt.remaining) || 0;
        if (debt.type === "receivable") {
            receivable += remaining;
        } else {
            payable += remaining;
        }
    });

    return { receivable, payable, net: receivable - payable };
}
// ==============================
// حساب إجمالي الدخل/المصروف لشهر معيّن (منطق بيزنس منفصل عن العرض)
// ==============================
function calculateMonthlyTotals(transactions, selectedMonth) {
    let income = 0;
    let total = 0;

    transactions.forEach(expense => {
        if (
            selectedMonth &&
            expense.date &&
            !expense.date.startsWith(selectedMonth)
        ) {
            return;
        }

        if (!expense.isTransfer) {
            if (expense.type === "expense") {
                total += expense.amount;
            } else if (expense.type === "income") {
                income += expense.amount;
            }
        }
    });

    return { income, total };
}
// ==============================
// Backup (Export / Import)
// ==============================

const BACKUP_KEYS = [
    STORAGE_KEY, ACCOUNTS_KEY, CATEGORIES_KEY, CUSTOM_CATEGORY_ICONS_KEY,
DEBTS_KEY, GOALS_KEY, BUDGET_KEY, CATEGORY_BUDGETS_KEY, THEME_KEY, LANGUAGE_KEY, CURRENCY_KEY, BALANCE_HIDDEN_KEY
];

// ==============================
// حساب إجمالي معاملات حساب معيّن (منطق بيزنس منفصل عن العرض)
// ==============================
function calculateTransactionsTotal(transactions) {
    return transactions.reduce((sum, transaction) => {
        return sum + Number(transaction.amount || 0);
    }, 0);
}