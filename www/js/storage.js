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
    
    return `<span class="stats-stat-currency">${currency}</span> <span class="stats-stat-value">${value}</span>`;
}