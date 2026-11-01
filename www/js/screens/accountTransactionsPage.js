// ==============================================================
// screens/accountTransactionsPage.js
// منطق صفحة عمليات الحساب (Income/Expense) - كانت accountTransactions.js
// اتحولت تشتغل جوه راوتر الـ SPA
// ==============================================================

function initAccountTransactionsPage() {

    const accountId = window.pendingAccountTransactionsAccount ||
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
    const sameAccount = getTxAccountId(transaction) === accountId;
        const sameType = type === "transfer" ? !!transaction.isTransfer : transaction.type === type;
    return sameAccount && sameType && (type === "transfer" || !transaction.isTransfer);
});
const openingAccount = getAccounts().find(a => a.id === accountId);
const openingBalance = openingAccount ? (Number(openingAccount.balance) || 0) : 0;
const showOpening = type !== "transfer" && openingBalance !== 0 && ((type === "income") === (openingBalance > 0));
if (accountNameEl) {
    accountNameEl.textContent = t("account_label");
}
if (accountId && accountIconEl) {
    const accounts = getAccounts();
const account = accounts.find(a => a.id === accountId);
    if (account) {
        accountNameEl.textContent = account.name;
  accountIconEl.innerHTML = `<i data-lucide="${escapeHTML(account.icon)}"></i>`;
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}
const isIncome = type === "income";
const isTransferView = type === "transfer";
if (transactionTypeEl) {
    transactionTypeEl.textContent = isTransferView ? t("transfer_title") : (isIncome ? t("income_title") : t("expense_title"));
}
if (totalLabelEl) {
    totalLabelEl.textContent = isTransferView ? t("account_transfers_net") : (isIncome ? t("stats_total_income") : t("stats_total_expense"));
}
if (listTitleEl) {
    listTitleEl.textContent = isTransferView ? t("transfer_title") : (isIncome ? t("income_title") : t("expense_title"));
}
const total = isTransferView ?
    accountTransactions.reduce(function(sum, tx) {
        return sum + (tx.type === "income" ? 1 : -1) * (Number(tx.amount) || 0);
    }, 0) :
    calculateTransactionsTotal(accountTransactions);
if (totalAmountEl) {
    totalAmountEl.textContent = total.toLocaleString("en-US");
    const totalCurrencyEl = totalAmountEl.parentElement.querySelector(".currency");
    if (totalCurrencyEl) totalCurrencyEl.textContent = getCurrency();
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
        accountTransactions.length === 0 && !showOpening ? "block" : "none";

    const sortEl = document.getElementById("accSortFilter");
    
    // ترتيب المعاملات من غير ما نغيّر الأصل
    function getSortedTransactions() {
        const mode = sortEl ? sortEl.value : "date_desc";
        return accountTransactions
            .map((transaction, index) => ({ transaction, index }))
            .sort((a, b) => {
                const amountA = Math.abs(Number(a.transaction.amount || 0));
                const amountB = Math.abs(Number(b.transaction.amount || 0));
                if (mode === "amount_desc" && amountA !== amountB) return amountB - amountA;
                if (mode === "amount_asc" && amountA !== amountB) return amountA - amountB;
                const dateA = a.transaction.date || "";
                const dateB = b.transaction.date || "";
                if (dateA !== dateB) {
                    return mode === "date_asc" ?
                        dateA.localeCompare(dateB) :
                        dateB.localeCompare(dateA);
                }
                return mode === "date_asc" ? a.index - b.index : b.index - a.index;
            })
            .map(entry => entry.transaction);
    }
    
    function renderTransactionsList() {
        
        transactionsListEl.innerHTML = "";
        
        getSortedTransactions().forEach(transaction => {
            
const li = document.createElement("li");
const rowIsIncome = isTransferView ? transaction.type === "income" : isIncome;
li.className = rowIsIncome ? "is-income" : "is-expense";
const amount = Number(transaction.amount || 0);

const categoryName = isTransferView ? t("transfer_title") : (getTxCategoryName(transaction) || "Transaction");

let note = String(transaction.description || "").trim();
if (isTransferView) {
    note = transaction.type === "income" ?
        getAccountNameById(transaction.transferFromId, transaction.transferFrom) + " ➔ " + getTxAccountName(transaction) :
        getTxAccountName(transaction) + " ➔ " + getAccountNameById(transaction.transferToId, transaction.transferTo);
} else if (note === categoryName) {
    note = "";
} else if (note.startsWith(categoryName)) {
    note = note.slice(categoryName.length).trim() || note;
}
li.innerHTML = `
    <div class="transaction-icon-box">
        <i data-lucide="${escapeHTML(getTxCategoryIcon(transaction))}"></i>
    </div>

    <div class="tx-main">
        <div class="tx-top">
            <strong class="tx-title">${escapeHTML(categoryName)}</strong>
            <strong class="transaction-amount">${escapeHTML(getCurrency())} ${amount.toLocaleString("en-US")}</strong>
        </div>
        <div class="tx-bottom">
            <span class="tx-note">${escapeHTML(note)}</span>
            <span class="tx-date">${escapeHTML(formatDisplayDate(transaction.date) || "")}</span>
        </div>
    </div>
`;
            
            transactionsListEl.appendChild(li);
            
        });
                if (showOpening) {
            const openingLi = document.createElement("li");
            openingLi.className = openingBalance > 0 ? "is-income" : "is-expense";
            openingLi.innerHTML = `
                <div class="transaction-icon-box">
                    <i data-lucide="wallet"></i>
                </div>
                <div class="tx-main">
                    <div class="tx-top">
                        <strong class="tx-title">${escapeHTML(t("opening_balance_label"))}</strong>
                        <strong class="transaction-amount">${escapeHTML(getCurrency())} ${Math.abs(openingBalance).toLocaleString("en-US")}</strong>
                    </div>
                </div>
            `;
            if (sortEl && sortEl.value === "date_asc") transactionsListEl.prepend(openingLi);
            else transactionsListEl.appendChild(openingLi);
        }
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    if (sortEl) {
                fillSelect(sortEl, getSortOptions(), "date_desc");
        sortEl.onchange = renderTransactionsList;
        makeSelectSheet(sortEl, t("sort_by"));
        // مفيش لازمة للترتيب لو فيه معاملة واحدة أو مفيش
        sortEl.parentElement.style.display = accountTransactions.length > 1 ? "" : "none";
    }
    
    renderTransactionsList();
    }