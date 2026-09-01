// ==============================================================
// screens/accountTransactionsPage.js
// منطق صفحة عمليات الحساب (Income/Expense) - كانت accountTransactions.js
// اتحولت تشتغل جوه راوتر الـ SPA
// ==============================================================

function initAccountTransactionsPage() {

    const accountName = window.pendingAccountTransactionsAccount ||
        new URLSearchParams(window.location.search).get("account");

    const type = window.pendingAccountTransactionsType ||
        new URLSearchParams(window.location.search).get("type");

    window.pendingAccountTransactionsAccount = null;
    window.pendingAccountTransactionsType = null;

    applyStoredTheme();

    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
        backBtn.onclick = function () {
            navigateTo("accounts");
        };
    }

    const accountNameEl = document.getElementById("accountName");
    const accountIconEl = document.querySelector(".account-icon");
    const transactionTypeEl = document.getElementById("transactionType");

    const totalLabelEl = document.getElementById("totalLabel");
    const totalAmountEl = document.getElementById("totalAmount");

    const listTitleEl = document.getElementById("listTitle");
    const transactionCountEl = document.getElementById("transactionCount");

    const transactionsListEl = document.getElementById("transactionsList");
    const emptyStateEl = document.getElementById("emptyState");

    const transactions = loadTransactions();

    const accountTransactions = transactions.filter(transaction => {
        const sameAccount = transaction.account === accountName;
        const sameType = transaction.type === type;
        return sameAccount && sameType;
    });

    accountNameEl.textContent = t("account_label");

    if (accountName && accountIconEl) {

        const accounts = getAccounts();

        const account = accounts.find(a => a.name === accountName);

        if (account) {
            accountNameEl.textContent = account.name;
            accountIconEl.innerHTML = `<i data-lucide="${account.icon}"></i>`;
            if (window.lucide) {
                lucide.createIcons();
            }
        }
    }

    const isIncome = type === "income";

    transactionTypeEl.textContent =
        isIncome ? t("income_title") : t("expense_title");

    totalLabelEl.textContent =
        isIncome ? t("stats_total_income") : t("stats_total_expense");

    listTitleEl.textContent =
        isIncome ? t("income_title") : t("expense_title");

    const total = accountTransactions.reduce((sum, transaction) => {
        return sum + Number(transaction.amount || 0);
    }, 0);

    totalAmountEl.textContent = total.toLocaleString("en-US");

    const totalLen = String(Math.round(total)).length;

    if (totalLen <= 3) {
        totalAmountEl.style.fontSize = "48px";
    } else if (totalLen <= 6) {
        totalAmountEl.style.fontSize = "38px";
    } else if (totalLen <= 8) {
        totalAmountEl.style.fontSize = "30px";
    } else {
        totalAmountEl.style.fontSize = "24px";
    }

    transactionCountEl.textContent = accountTransactions.length;

    emptyStateEl.style.display =
        accountTransactions.length === 0 ? "block" : "none";

    transactionsListEl.innerHTML = "";

    accountTransactions.forEach(transaction => {

        const li = document.createElement("li");
        const amount = Number(transaction.amount || 0);

        li.innerHTML = `
            <div class="transaction-icon-box">
                <i data-lucide="${transaction.categoryIcon || "tag"}"></i>
            </div>

            <div class="transaction-info">
                <strong>${transaction.category || "Transaction"}</strong>
                <small>${transaction.description || ""}</small>
            </div>

            <strong class="transaction-amount">
                EGP ${amount.toLocaleString("en-US")}
            </strong>
        `;

        transactionsListEl.appendChild(li);

    });

    if (window.lucide) {
        lucide.createIcons();
    }
}