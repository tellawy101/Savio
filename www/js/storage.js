// ==============================
// storage.js
// إدارة تخزين المعاملات (مصاريف + دخل) في localStorage
// ==============================

const STORAGE_KEY = "transactions";
const CURRENCY_KEY = "currency";


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

        // بنعمل نسخة احتياطية من البيانات التالفة بدل ما نمسحها نهائي
        localStorage.setItem(STORAGE_KEY + "_corrupted_backup", raw);

        return [];

    }

}

// بتحفظ كل المعاملات
function saveTransactions(transactions) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(transactions)
    );
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
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
}

// بتحفظ كل الحسابات
function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
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
    return JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
}

function saveCategories(categories) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function getCustomCategoryIcons() {
    return JSON.parse(localStorage.getItem(CUSTOM_CATEGORY_ICONS_KEY)) || [];
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
}
// ==============================
// Debts
// ==============================

const DEBTS_KEY = "debts";

function getDebts() {
    return JSON.parse(localStorage.getItem(DEBTS_KEY)) || [];
}

function saveDebts(debts) {
    localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
}
// ==============================
// Backup (Export / Import)
// ==============================

const BACKUP_KEYS = [
    STORAGE_KEY, ACCOUNTS_KEY, CATEGORIES_KEY, CUSTOM_CATEGORY_ICONS_KEY,
    DEBTS_KEY, BUDGET_KEY, THEME_KEY, LANGUAGE_KEY, CURRENCY_KEY, BALANCE_HIDDEN_KEY
];