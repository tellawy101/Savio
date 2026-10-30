// ==============================
// storage/preferences.js
// الثيم وإخفاء الرصيد
// ==============================

const THEME_KEY = "theme";

function getTheme() {
    return localStorage.getItem(THEME_KEY) || "light";
}

function saveTheme(theme) {
safeSetItem(THEME_KEY, theme);
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
