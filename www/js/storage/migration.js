// ==============================
// storage/migration.js
// ترحيل البيانات القديمة لنظام الـ ID
// ==============================

function ensureAccountAndCategoryIds() {
    const accounts = getAccounts();
    let accountsChanged = false;
    accounts.forEach(function (account) {
        if (!account.id) {
            account.id = generateId("acc");
            accountsChanged = true;
        }
    });
    if (accountsChanged) saveAccounts(accounts);

    const categories = getCategories();
    let categoriesChanged = false;
    categories.forEach(function (category) {
        if (!category.id) {
            category.id = generateId("cat");
            categoriesChanged = true;
        }
    });
    if (categoriesChanged) saveCategories(categories);
}
function migrateDataToIds() {
    const failuresBefore = storageWriteFailures;
    ensureAccountAndCategoryIds();
    if (localStorage.getItem("savioIdMigrationDone") === "1") return;

    const accountIdByName = {};
    getAccounts().forEach(function (account) {
                if (!Object.prototype.hasOwnProperty.call(
                accountIdByName, account.name)) {
            accountIdByName[account.name] = account.id;
        }
    });

    const categoryIdByName = {};
    getCategories().forEach(function (category) {
                if (!Object.prototype.hasOwnProperty.call(
                categoryIdByName, category.name)) {
            categoryIdByName[category.name] = category.id;
        }
    });

    const transactions = loadTransactions();
    let transactionsChanged = false;
    transactions.forEach(function (tx) {
        if (!tx.accountId && tx.account && accountIdByName[tx.account]) {
            tx.accountId = accountIdByName[tx.account];
            transactionsChanged = true;
        }
        if (!tx.categoryId && tx.category && categoryIdByName[tx.category]) {
            tx.categoryId = categoryIdByName[tx.category];
            transactionsChanged = true;
        }
        if (!tx.transferToId && tx.transferTo && accountIdByName[tx.transferTo]) {
            tx.transferToId = accountIdByName[tx.transferTo];
            transactionsChanged = true;
        }
        if (!tx.transferFromId && tx.transferFrom && accountIdByName[tx.transferFrom]) {
            tx.transferFromId = accountIdByName[tx.transferFrom];
            transactionsChanged = true;
        }
    });
    if (transactionsChanged) saveTransactions(transactions);
    
        const debts = getDebts();
    let debtsChanged = false;
    debts.forEach(function (debt) {
        if (!Array.isArray(debt.payments)) return;
        debt.payments.forEach(function (payment) {
            if (!payment.accountId && payment.account && accountIdByName[payment.account]) {
                payment.accountId = accountIdByName[payment.account];
                debtsChanged = true;
            }
        });
    });
    if (debtsChanged) saveDebts(debts);   
        const budgets = getCategoryBudgets();
    const newBudgets = {};
    let budgetsChanged = false;
    Object.keys(budgets).forEach(function(key) {
        if (categoryIdByName[key]) {
            newBudgets[categoryIdByName[key]] = budgets[key];
            budgetsChanged = true;
        } else {
            newBudgets[key] = budgets[key];
        }
    });
    if (budgetsChanged) saveCategoryBudgets(newBudgets);
    // العلامة بتتحط بس لو كل الكتابات نجحت، عشان لو فشلت التحويل يتعاد بعدين
    if (storageWriteFailures === failuresBefore) {
        safeSetItem("savioIdMigrationDone", "1");
    }
    }
