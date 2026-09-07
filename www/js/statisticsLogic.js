// ==============================================================
// statisticsLogic.js
// كل الحسابات الخاصة بصفحة الإحصائيات (منطق بيزنس بحت، بدون DOM)
// ==============================================================

function calculateSummary(transactions) {
    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {
        if (transaction.isTransfer === true) return;
        const amount = Number(transaction.amount) || 0;
        if (transaction.type === "income") income += amount;
        if (transaction.type === "expense") expense += amount;
    });

    return { income, expense, balance: income - expense };
}

function calculateCategoryBreakdown(transactions) {
    const categories = {};

    transactions.forEach(transaction => {
        if (transaction.type !== "expense" || transaction.isTransfer === true) return;
        const category = transaction.category || "Other";
        const amount = Number(transaction.amount) || 0;
        categories[category] = (categories[category] || 0) + amount;
    });

    const entries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return [];

    const maxAmount = entries[0][1];
    const totalAmount = entries.reduce((sum, entry) => sum + entry[1], 0);

    return entries.map(([category, amount]) => ({
        category,
        amount,
        percentage: maxAmount > 0 ? (amount / maxAmount) * 100 : 0,
        share: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
    }));
}

function calculateAccountBreakdown(transactions) {
    const accounts = {};

    transactions.forEach(transaction => {
        if (transaction.isTransfer === true) return;
        const account = transaction.account || "Unknown";
        const amount = Number(transaction.amount) || 0;

        if (!accounts[account]) accounts[account] = { income: 0, expense: 0 };

        if (transaction.type === "income") accounts[account].income += amount;
        if (transaction.type === "expense") accounts[account].expense += amount;
    });

    return Object.entries(accounts)
        .map(([account, data]) => ({
            account,
            income: data.income,
            expense: data.expense,
            net: data.income - data.expense
        }))
        .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
}

function groupTransactionsForChart(transactions, currentPeriod, getTransactionDate, locale) {
    const grouped = {};

    transactions.forEach(transaction => {
        if (transaction.isTransfer === true || !transaction.date) return;
        const date = getTransactionDate(transaction);
        if (!date) return;

        const key = currentPeriod === "year"
            ? date.toLocaleString(locale, { month: "short" })
            : date.toLocaleDateString(locale, { month: "short", day: "numeric" });

        if (!grouped[key]) grouped[key] = { income: 0, expense: 0, date };

        const amount = Number(transaction.amount) || 0;
        if (transaction.type === "income") grouped[key].income += amount;
        if (transaction.type === "expense") grouped[key].expense += amount;
    });

    const entries = Object.entries(grouped).sort((a, b) => a[1].date - b[1].date);

    return {
        labels: entries.map(entry => entry[0]),
        incomeData: entries.map(entry => entry[1].income),
        expenseData: entries.map(entry => entry[1].expense)
    };
}