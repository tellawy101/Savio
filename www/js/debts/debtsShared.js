// ======================================
// debts/debtsShared.js
// دوال مشتركة بين أجزاء صفحة الديون
// ======================================

// بتقرا المبلغ وتحوّل الأرقام العربية والفواصل لرقم عادي
function readAmount(input) {
    return Number(normalizeDigits(input.value).replace(/,/g, ""));
}
