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
    backBtn.onclick = function() {
        navigateTo("accounts");
    };
}

const accountNameEl = document.getElementById("accountName");
const accountIconEl = document.querySelector(".acc-header-icon");
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

if (accountNameEl) {
    accountNameEl.textContent = t("account_label");
}
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
if (transactionTypeEl) {
    transactionTypeEl.textContent = isIncome ? t("income_title") : t("expense_title");
}
if (totalLabelEl) {
    totalLabelEl.textContent = isIncome ? t("stats_total_income") : t("stats_total_expense");
}
if (listTitleEl) {
    listTitleEl.textContent = isIncome ? t("income_title") : t("expense_title");
}
const total = calculateTransactionsTotal(accountTransactions);
if (totalAmountEl) {
    totalAmountEl.textContent = total.toLocaleString("en-US");
    const totalLen = String(Math.round(total)).length;
    if (totalLen <= 4) {
        totalAmountEl.style.fontSize = "26px";
    } else if (totalLen <= 7) {
        totalAmountEl.style.fontSize = "22px";
    } else {
        totalAmountEl.style.fontSize = "18px";
    }
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