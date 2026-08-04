// ==============================
// storage.js
// إدارة تخزين المعاملات (مصاريف + دخل) في localStorage
// ==============================

const STORAGE_KEY = "transactions";

// بترجع كل المعاملات المخزّنة
function loadTransactions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// بتحفظ كل المعاملات
function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}