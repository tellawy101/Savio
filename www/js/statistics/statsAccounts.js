// ==============================================================
// statistics/statsAccounts.js
// قائمة نشاط الحسابات (دخل / مصروف / صافي لكل حساب)
// ==============================================================

function renderAccountList(transactions) {
    const container = document.getElementById("accountStats");
    
    if (!container) {
        return;
    }
    
    const entries = calculateAccountBreakdown(transactions);
    
    if (!entries.length) {
        container.innerHTML = `
            <div class="empty-stat">
                <i data-lucide="wallet-cards"></i>
                <span>${t("stats_no_account_data")}</span>
            </div>
        `;
        return;
    }
    
    const iconByName = {};
    getAccounts().forEach(function(a) { iconByName[a.name] = a.icon; });
    
    container.innerHTML = entries.map(data => {
        const sign = data.net > 0 ? "+" : (data.net < 0 ? "-" : "");
        const valueClass = data.net >= 0 ? "positive" : "negative";
        const icon = iconByName[data.account] || "wallet";
        
        return `
        <div class="account-row">
            <div class="account-row-top">
                <div class="account-icon-box"><i data-lucide="${escapeHTML(icon)}"></i></div>
                <span class="account-name">${escapeHTML(data.account)}</span>
                <span class="account-value ${valueClass}" dir="ltr">${sign}${formatCurrency(Math.abs(data.net))}</span>
            </div>
            <div class="account-activity">
                <div class="account-income">
                    <span class="account-label">${t("stats_income")}</span>
                    <span class="account-amount" dir="ltr">${formatCurrency(data.income)}</span>
                </div>
                <div class="account-expense">
                    <span class="account-label">${t("stats_expense")}</span>
                    <span class="account-amount" dir="ltr">${formatCurrency(data.expense)}</span>
                </div>
            </div>
        </div>
        `;
    }).join("");
}