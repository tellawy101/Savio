/* =========================================
   ACCOUNT TRANSACTIONS PAGE
   عرض Income / Expense الخاص بالحساب
   ========================================= */

const params = new URLSearchParams(window.location.search);

const accountName = params.get("account");

const type = params.get("type");


/* =========================================
   ELEMENTS
   ========================================= */

const accountNameEl = document.getElementById("accountName");
const accountIconEl = document.querySelector(".account-icon");
const transactionTypeEl = document.getElementById("transactionType");

const totalLabelEl = document.getElementById("totalLabel");
const totalAmountEl = document.getElementById("totalAmount");

const listTitleEl = document.getElementById("listTitle");
const transactionCountEl = document.getElementById("transactionCount");

const transactionsListEl =
    document.getElementById("transactionsList");

const emptyStateEl =
    document.getElementById("emptyState");


/* =========================================
   LOAD TRANSACTIONS
   ========================================= */

const transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];


/* =========================================
   FILTER ACCOUNT TRANSACTIONS
   ========================================= */

const accountTransactions = transactions.filter(transaction => {

    const sameAccount =
        transaction.account === accountName;

    const sameType =
        transaction.type === type;

    return sameAccount && sameType;
});


/* =========================================
   PAGE INFORMATION
   ========================================= */

accountNameEl.textContent = "Account";

if (accountName && accountIconEl) {

    const accounts =
        JSON.parse(localStorage.getItem("accounts")) || [];

    const account = accounts.find(
        a => `${a.icon} ${a.name}` === accountName
    );

    if (account) {

        accountNameEl.textContent = account.name;

        accountIconEl.innerHTML =
            `<i data-lucide="${account.icon}"></i>`;

        if (window.lucide) {
            lucide.createIcons();
        }
    }
}
const isIncome = type === "income";

transactionTypeEl.textContent =
    isIncome ? "Income" : "Expense";

totalLabelEl.textContent =
    isIncome ? "Total Income" : "Total Expense";

listTitleEl.textContent =
    isIncome ? "Income" : "Expense";


/* =========================================
   CALCULATE TOTAL
   ========================================= */

const total = accountTransactions.reduce(
    (sum, transaction) => {

        return sum + Number(transaction.amount || 0);

    },
    0
);


totalAmountEl.textContent =
    total.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });


/* =========================================
   TRANSACTION COUNT
   ========================================= */

transactionCountEl.textContent =
    accountTransactions.length;


/* =========================================
   EMPTY STATE
   ========================================= */

if (accountTransactions.length === 0) {

    emptyStateEl.style.display = "block";

} else {

    emptyStateEl.style.display = "none";
}


/* =========================================
   DISPLAY TRANSACTIONS
   ========================================= */

accountTransactions.forEach(transaction => {

    const li = document.createElement("li");

    const amount = Number(transaction.amount || 0);

    li.innerHTML = `
        <div>
            <strong>
                ${transaction.category || "Transaction"}
            </strong>

            <small>
                ${transaction.description || ""}
            </small>
        </div>

        <strong>
            EGP ${amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}
        </strong>
    `;

    transactionsListEl.appendChild(li);

});