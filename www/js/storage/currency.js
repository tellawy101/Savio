// ==============================
// storage/currency.js
// العملة وتنسيق المبالغ
// ==============================

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
