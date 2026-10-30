// ==============================
// storage/accounts.js
// تخزين الحسابات وحساب الأرصدة
// ==============================

// ==============================
// Accounts
// ==============================

const ACCOUNTS_KEY = "accounts";

// بترجع كل الحسابات المخزّنة
function getAccounts() {
    return safeParse(ACCOUNTS_KEY, []);
}
function saveAccounts(accounts) {
safeSetItem(ACCOUNTS_KEY, JSON.stringify(accounts));

}

// رصيد حساب واحد = الرصيد الافتتاحي + كل الدخل - كل المصروف (التحويلات داخلة في الرصيد)
function calculateAccountBalance(account, transactions) {
    let balance = Number(account.balance) || 0;

    transactions.forEach(function (tr) {
        if (getTxAccountId(tr) !== account.id) return;

        const amount = Number(tr.amount) || 0;
        if (tr.type === "income") balance += amount;
        else if (tr.type === "expense") balance -= amount;
    });

    return balance;
}
