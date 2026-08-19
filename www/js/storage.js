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
function loadTransactions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
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