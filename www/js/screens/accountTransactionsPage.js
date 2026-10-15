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
    const sameType = transaction.type === type;
    return sameAccount && sameType && !transaction.isTransfer;
});

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
        accountTransactions.length === 0 ? "block" : "none";

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
li.className = isIncome ? "is-income" : "is-expense";
const amount = Number(transaction.amount || 0);

const categoryName = getTxCategoryName(transaction) || "Transaction";

let note = String(transaction.description || "").trim();
if (note === categoryName) {
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
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    if (sortEl) {
        const sortOptions = [
            ["date_desc", t("sort_newest")],
            ["date_asc", t("sort_oldest")],
            ["amount_desc", t("sort_highest")],
            ["amount_asc", t("sort_lowest")]
        ];
        sortEl.innerHTML = "";
        sortOptions.forEach(function(o) {
            const opt = document.createElement("option");
            opt.value = o[0];
            opt.textContent = o[1];
            sortEl.appendChild(opt);
        });
        sortEl.onchange = renderTransactionsList;
        makeSelectSheet(sortEl, t("sort_by"));
        // مفيش لازمة للترتيب لو فيه معاملة واحدة أو مفيش
        sortEl.parentElement.style.display = accountTransactions.length > 1 ? "" : "none";
    }
    
    renderTransactionsList();
    }