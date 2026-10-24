// ==============================
// storage.js
// إدارة تخزين المعاملات (مصاريف + دخل) في localStorage
// ==============================
const APP_VERSION = "2.5.0";
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

// ==============================
// Transactions
// ==============================

// بترجع كل المعاملات المخزّنة
function loadTransactions() {

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    try {

        const data = JSON.parse(raw);
        
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
safeSetItem(STORAGE_KEY, JSON.stringify(data));
        }

        return data;

    } catch (error) {

                console.error("Failed to load transactions, data may be corrupted:", error);
        
        // backup مرة واحدة بس وباسم فيه الوقت، عشان أي تلف جديد ميمسحش القديم
        if (!transactionsCorrupted) {
            try {
                localStorage.setItem(STORAGE_KEY + "_corrupted_backup_" + Date.now(), raw);
            } catch (backupErr) {
                console.error("Could not save corrupted-data backup:", backupErr);
            }
            transactionsCorrupted = true;
        }
        
        return [];

    }

}

// بتحفظ كل المعاملات
function saveTransactions(transactions) {
    
    // لو البيانات الأصلية تالفة، مفيش كتابة فوقها عشان منخسرهاش
    if (transactionsCorrupted) {
        console.error("Save blocked: stored transactions are corrupted");
        
        if (typeof showToast === "function") {
showToast(t("data_corrupted_save_stopped"), "error");
        }
        
        return false;
    }
    
        if (!safeSetItem(STORAGE_KEY, JSON.stringify(transactions))) {
        return false;
    }

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
    
    safeSetItem(CURRENCY_KEY, currency);
}

// بتنسق الرقم بحد أقصى رقمين عشريين
function formatAmountNumber(amount) {
    const n = Number(amount) || 0;
    const rounded = (Math.round(n * 100) / 100) || 0;
    return rounded.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}
// بتختصر الأرقام الكبيرة (للأماكن الضيقة زي زرار الميزانية): 1,250,000 → 1.25M
function formatCompactAmount(amount) {
    const n = Number(amount) || 0;
    const abs = Math.abs(n);
    if (abs < 1000000) return formatAmountNumber(n);

    const units = [
        { value: 1e12, suffix: "T" },
        { value: 1e9, suffix: "B" },
        { value: 1e6, suffix: "M" }
    ];
    for (const unit of units) {
        if (abs >= unit.value) {
            const short = Math.round((n / unit.value) * 100) / 100;
            return short.toLocaleString("en-US", { maximumFractionDigits: 2 }) + unit.suffix;
        }
    }
    return formatAmountNumber(n);
}
// بتنسق المبلغ مع العملة
function formatCurrency(amount) {
    const currency = getCurrency();

return `${currency} ${formatAmountNumber(amount)}`;
}

function formatCurrencyHTMLStats(amount) {
    const currency = getCurrency();
const value = formatAmountNumber(amount);
    
    return `<span class="stats-stat-currency">${escapeHTML(currency)}</span> <span class="stats-stat-value">${value}</span>`;
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
safeSetItem(ACCOUNTS_KEY, JSON.stringify(accounts));

}
const THEME_KEY = "theme";

function getTheme() {
    return localStorage.getItem(THEME_KEY) || "light";
}

function saveTheme(theme) {
safeSetItem(THEME_KEY, theme);
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
safeSetItem(CATEGORIES_KEY, JSON.stringify(categories));
}
function generateId(prefix) {
    return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}
// جداول بحث (بالـ id وبالاسم) للحسابات والفئات
// بتتبني مرة واحدة وبتتجدد بس لما البيانات المخزّنة تتغير (بدل JSON.parse مع كل معاملة)
const lookupCache = {};

function getLookup(storageKey, readList) {
    const raw = localStorage.getItem(storageKey);
    let entry = lookupCache[storageKey];

    if (!entry || entry.raw !== raw) {
        const byId = new Map();
        const byName = new Map();

        readList().forEach(function (item) {
            if (!item) return;
            if (item.id && !byId.has(item.id)) byId.set(item.id, item);
            if (!byName.has(item.name)) byName.set(item.name, item);
        });

        entry = { raw: raw, byId: byId, byName: byName };
        lookupCache[storageKey] = entry;
    }

    return entry;
}

function getAccountIdByName(name) {
    const acc = getLookup(ACCOUNTS_KEY, getAccounts).byName.get(name);
    return acc ? acc.id : null;
}

function getCategoryIdByName(name) {
    const cat = getLookup(CATEGORIES_KEY, getCategories).byName.get(name);
    return cat ? cat.id : null;
}
function getTxAccountId(tx) {
    const byId = getLookup(ACCOUNTS_KEY, getAccounts).byId;
    if (tx.accountId && byId.has(tx.accountId)) return tx.accountId;
    return getAccountIdByName(tx.account) || tx.accountId || null;
}

function getTxCategoryId(tx) {
    const byId = getLookup(CATEGORIES_KEY, getCategories).byId;
    if (tx.categoryId && byId.has(tx.categoryId)) return tx.categoryId;
    return getCategoryIdByName(tx.category) || tx.categoryId || null;
}
function getAccountNameById(id, fallback) {
    const acc = id ? getLookup(ACCOUNTS_KEY, getAccounts).byId.get(id) : null;
    return acc ? acc.name : (fallback || "");
}

function getCategoryNameById(id, fallback) {
    const cat = id ? getLookup(CATEGORIES_KEY, getCategories).byId.get(id) : null;
    return cat ? cat.name : (fallback || "");
}
function getTxAccountName(tx) {
    return getAccountNameById(tx.accountId, tx.account);
}
function getTxCategoryIcon(tx) {
    const id = getTxCategoryId(tx);
    const cat = id ? getLookup(CATEGORIES_KEY, getCategories).byId.get(id) : null;
    return (cat && cat.icon) || tx.categoryIcon || "tag";
}
function getTxCategoryName(tx) {
    if (!tx.categoryId && tx.category === "Debt Payment") {
        return t("debts_category_payment");
    }
    return getCategoryNameById(tx.categoryId, tx.category);
}
// رصيد حساب واحد = الرصيد الافتتاحي + كل الدخل - كل المصروف (التحويلات داخلة في الرصيد)
function calculateAccountBalance(account, transactions) {
    let balance = Number(account.balance) || 0;

    transactions.forEach(function (tr) {
        if (getTxAccountId(tr) !== account.id) return;

        const amount = Number(tr.amount) || 0;
        if (tr.type === "income") balance += amount;
        else if (tr.type === "expense") balance -= amount;
    });

    return balance;
}

function ensureAccountAndCategoryIds() {
    const accounts = getAccounts();
    let accountsChanged = false;
    accounts.forEach(function (account) {
        if (!account.id) {
            account.id = generateId("acc");
            accountsChanged = true;
        }
    });
    if (accountsChanged) saveAccounts(accounts);

    const categories = getCategories();
    let categoriesChanged = false;
    categories.forEach(function (category) {
        if (!category.id) {
            category.id = generateId("cat");
            categoriesChanged = true;
        }
    });
    if (categoriesChanged) saveCategories(categories);
}
function migrateDataToIds() {
    const failuresBefore = storageWriteFailures;
    ensureAccountAndCategoryIds();
    if (localStorage.getItem("savioIdMigrationDone") === "1") return;

    const accountIdByName = {};
    getAccounts().forEach(function (account) {
                if (!Object.prototype.hasOwnProperty.call(
                accountIdByName, account.name)) {
            accountIdByName[account.name] = account.id;
        }
    });

    const categoryIdByName = {};
    getCategories().forEach(function (category) {
                if (!Object.prototype.hasOwnProperty.call(
                categoryIdByName, category.name)) {
            categoryIdByName[category.name] = category.id;
        }
    });

    const transactions = loadTransactions();
    let transactionsChanged = false;
    transactions.forEach(function (tx) {
        if (!tx.accountId && tx.account && accountIdByName[tx.account]) {
            tx.accountId = accountIdByName[tx.account];
            transactionsChanged = true;
        }
        if (!tx.categoryId && tx.category && categoryIdByName[tx.category]) {
            tx.categoryId = categoryIdByName[tx.category];
            transactionsChanged = true;
        }
        if (!tx.transferToId && tx.transferTo && accountIdByName[tx.transferTo]) {
            tx.transferToId = accountIdByName[tx.transferTo];
            transactionsChanged = true;
        }
        if (!tx.transferFromId && tx.transferFrom && accountIdByName[tx.transferFrom]) {
            tx.transferFromId = accountIdByName[tx.transferFrom];
            transactionsChanged = true;
        }
    });
    if (transactionsChanged) saveTransactions(transactions);
    
        const debts = getDebts();
    let debtsChanged = false;
    debts.forEach(function (debt) {
        if (!Array.isArray(debt.payments)) return;
        debt.payments.forEach(function (payment) {
            if (!payment.accountId && payment.account && accountIdByName[payment.account]) {
                payment.accountId = accountIdByName[payment.account];
                debtsChanged = true;
            }
        });
    });
    if (debtsChanged) saveDebts(debts);   
        const budgets = getCategoryBudgets();
    const newBudgets = {};
    let budgetsChanged = false;
    Object.keys(budgets).forEach(function(key) {
        if (categoryIdByName[key]) {
            newBudgets[categoryIdByName[key]] = budgets[key];
            budgetsChanged = true;
        } else {
            newBudgets[key] = budgets[key];
        }
    });
    if (budgetsChanged) saveCategoryBudgets(newBudgets);
    // العلامة بتتحط بس لو كل الكتابات نجحت، عشان لو فشلت التحويل يتعاد بعدين
    if (storageWriteFailures === failuresBefore) {
        safeSetItem("savioIdMigrationDone", "1");
    }
    }
function getCustomCategoryIcons() {
    return safeParse(CUSTOM_CATEGORY_ICONS_KEY, []);
}

function saveCustomCategoryIcons(icons) {
safeSetItem(CUSTOM_CATEGORY_ICONS_KEY, JSON.stringify(icons));
}
// ==============================
// Balance Visibility
// ==============================

const BALANCE_HIDDEN_KEY = "balanceHidden";

function getBalanceHidden() {
    return localStorage.getItem(BALANCE_HIDDEN_KEY) === "true";
}

function saveBalanceHidden(hidden) {
safeSetItem(BALANCE_HIDDEN_KEY, hidden);
}
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
// Debts
// ==============================

const DEBTS_KEY = "debts";

function getDebts() {
    return safeParse(DEBTS_KEY, []);
}

function saveDebts(debts) {
safeSetItem(DEBTS_KEY, JSON.stringify(debts));
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
        // المعرّفات القديمة أرقام (Date.now) والجديدة نصوص "pay_<وقت>_<عشوائي>"
    // فبنستخرج الوقت من النوعين عشان الترتيب يفضل صح
    function idTime(id) {
        if (typeof id === "number") return id;
        const m = /_(\d{10,})_/.exec(String(id));
        return m ? Number(m[1]) : 0;
    }
    debt.payments.sort(function (a, b) {
        return idTime(a.id) - idTime(b.id);
    });

debt.paid = Math.round((debt.paid + removed.payment.amount) * 100) / 100;
    debt.remaining = Math.max(0, Math.round((debt.amount - debt.paid) * 100) / 100);
    debt.status = debt.remaining <= 0 ? "paid" : "open";

    saveDebts(debts);
}
function updateDebtPayment(paymentId, newAmount, account, accountId, date) {
        newAmount = Number(newAmount);
    if (!Number.isFinite(newAmount) || newAmount <= 0) return false;
    const debts = getDebts();
    let found = false;
    let exceeds = false;

    debts.forEach(function (debt) {
        if (found || !Array.isArray(debt.payments)) return;

        const payment = debt.payments.find(function (p) {
            return p.id === paymentId;
        });
        if (!payment) return;
        found = true;

        const newPaid = Math.round((debt.paid - payment.amount + newAmount) * 100) / 100;
        if (newPaid > debt.amount) {
            exceeds = true;
            return;
        }

        payment.amount = newAmount;
        payment.account = account;
        payment.accountId = accountId;
        payment.date = date;
        debt.paid = newPaid;
        debt.remaining = Math.round((debt.amount - debt.paid) * 100) / 100;
        debt.status = debt.remaining <= 0 ? "paid" : "open";
    });

                if (!found) return true;
        if (exceeds) return false;
    saveDebts(debts);
    return true;
}
// ==============================
// Savings Goals
// ==============================

const GOALS_KEY = "savioGoals";

function getGoals() {
    return safeParse(GOALS_KEY, []);
}

function saveGoals(goals) {
safeSetItem(GOALS_KEY, JSON.stringify(goals));

}
// ==============================
// Recurring Transactions
// ==============================

function getRecurring() {
    return safeParse(RECURRING_KEY, []);
}

function saveRecurring(items) {
    safeSetItem(RECURRING_KEY, JSON.stringify(items));
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
// حساب إجمالي معاملات حساب معيّن (منطق بيزنس منفصل عن العرض)
// ==============================
function calculateTransactionsTotal(transactions) {
    return transactions.reduce((sum, transaction) => {
        return sum + Number(transaction.amount || 0);
    }, 0);
}