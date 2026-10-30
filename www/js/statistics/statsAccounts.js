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

    container.innerHTML = entries.map(data => {
        const sign = data.net >= 0 ? "+" : "";

        return `
        <div class="account-row">

            <div class="account-info">

                <span class="account-name">
                    ${escapeHTML(data.account)}
                </span>

                <div class="account-activity">

                    <span class="account-income">
                        ${t("stats_income")}:
                        ${formatCurrency(data.income)}
                    </span>

                    <span class="account-expense">
                        ${t("stats_expense")}:
                        ${formatCurrency(data.expense)}
                    </span>

                </div>

            </div>

            <span class="account-value">
                ${sign}${formatCurrency(data.net)}
            </span>

        </div>
        `;
    }).join("");
}