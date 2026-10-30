// ==============================================================
// statistics/statsSummary.js
// كروت الملخص: الرصيد، الدخل، المصروف، المتوسط اليومي، أعلى فئة وحساب
// ==============================================================

function setStatHTML(id, html) {
    const element = document.getElementById(id);

    if (element) {
        element.innerHTML = html;
    }
}

// اسم + نسبة (بتستخدم في أعلى فئة وأعلى حساب)
function statShareHTML(name, share) {
    return `<span class="stats-stat-value">${escapeHTML(name)}</span> <span class="stats-stat-currency">${share}%</span>`;
}

// مدخلات: المعاملات + الفترة + تقسيم الفئات (محسوب برة)
function renderStatsSummary(transactions, period, categoryBreakdown) {
    const { income, expense, balance } = calculateSummary(transactions);

    setStatHTML("totalIncome", formatCurrencyHTMLStats(income));
    setStatHTML("totalExpense", formatCurrencyHTMLStats(expense));
    setStatHTML("statsNetBalance", formatCurrencyHTMLStats(balance));
    setStatHTML("dailyAverage", formatCurrencyHTMLStats(calculateDailyAverage(transactions, period)));

    const topCategory = categoryBreakdown[0];
    setStatHTML(
        "topCategory",
        topCategory ? statShareHTML(topCategory.category, topCategory.share) : "-"
    );

    const topAccount = calculateTopAccount(transactions);
    setStatHTML(
        "topAccount",
        topAccount ? statShareHTML(topAccount.account, topAccount.share) : "-"
    );
}