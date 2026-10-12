// ==============================================================
// statisticsLogic.js
// كل الحسابات الخاصة بصفحة الإحصائيات (منطق بيزنس بحت، بدون DOM)
// ==============================================================

function getWeekStart(date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const day = start.getDay();
    const daysFromSaturday = day === 6 ? 0 : day + 1;
    start.setDate(start.getDate() - daysFromSaturday);
    return start;
}
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
    const catNameById = {};
    getCategories().forEach(function(c) { catNameById[c.id] = c.name; });

    transactions.forEach(transaction => {
        if (transaction.type !== "expense" || transaction.isTransfer === true) return;
        const knownName = transaction.categoryId && catNameById[transaction.categoryId];
        const legacyName = transaction.category === "Debt Payment" ? t("debts_category_payment") : transaction.category;
        const name = knownName || legacyName || t("stats_category_other");
                const key = "name:" + name;
        const amount = Number(transaction.amount) || 0;
        if (!categories[key]) categories[key] = { name, amount: 0 };
        categories[key].amount += amount;
    });

    const entries = Object.values(categories).sort((a, b) => b.amount - a.amount);
    if (!entries.length) return [];

    const maxAmount = entries[0].amount;
    const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);

    // نسب صحيحة مجموعها 100 بالضبط
    const rawShares = entries.map(entry => totalAmount > 0 ? (entry.amount / totalAmount) * 100 : 0);
    const shares = rawShares.map(value => Math.floor(value));
    let remaining = totalAmount > 0 ? 100 - shares.reduce((sum, value) => sum + value, 0) : 0;
    rawShares
        .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
        .sort((a, b) => b.fraction - a.fraction)
        .forEach(item => {
            if (remaining > 0) { shares[item.index]++; remaining--; }
        });

    return entries.map((entry, index) => ({
        category: entry.name,
        amount: entry.amount,
        percentage: maxAmount > 0 ? (entry.amount / maxAmount) * 100 : 0,
        share: shares[index]
    }));
}

function calculateAccountBreakdown(transactions) {
    const accounts = {};
    const accNameById = {};
    getAccounts().forEach(function(a) { accNameById[a.id] = a.name; });
    
    transactions.forEach(transaction => {
        if (transaction.isTransfer === true) return;
        const knownName = transaction.accountId && accNameById[transaction.accountId];
        const name = knownName || transaction.account || t("stats_account_unknown");
        const key = knownName ? "id:" + transaction.accountId : "name:" + name;
        const amount = Number(transaction.amount) || 0;
        
        if (!accounts[key]) accounts[key] = { name, income: 0, expense: 0 };
        
        if (transaction.type === "income") accounts[key].income += amount;
        if (transaction.type === "expense") accounts[key].expense += amount;
    });
    
    return Object.values(accounts)
        .map(data => ({
            account: data.name,
            income: data.income,
            expense: data.expense,
            net: data.income - data.expense
        }))
        .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
}

function groupTransactionsForChart(transactions, currentPeriod, getTransactionDate, locale) {
    const grouped = {};
    const formatOptions = currentPeriod === "year"
        ? { month: "short" }
        : currentPeriod === "all"
            ? { month: "short", year: "numeric" }
            : { month: "short", day: "numeric" };
    const formatter = new Intl.DateTimeFormat(locale, formatOptions);
    transactions.forEach(transaction => {
        if (transaction.isTransfer === true || !transaction.date) return;
        const date = getTransactionDate(transaction);
        if (!date) return;

const key = formatter.format(date);        
if (!grouped[key]) grouped[key] = { income: 0, expense: 0, date };

        const amount = Number(transaction.amount) || 0;
        if (transaction.type === "income") grouped[key].income += amount;
        if (transaction.type === "expense") grouped[key].expense += amount;
    });
    if (Object.keys(grouped).length) {
        const now = new Date();
        let cursor = null;
        let endDate = null;
        let stepDays = true;
        if (currentPeriod === "week") {
            cursor = getWeekStart(now);
            endDate = new Date(cursor);
            endDate.setDate(cursor.getDate() + 6);
        } else if (currentPeriod === "month") {
            cursor = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (currentPeriod === "year") {
            cursor = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 1);
            stepDays = false;
        }
        while (cursor && cursor <= endDate) {
            const key = formatter.format(cursor);
            if (!grouped[key]) grouped[key] = { income: 0, expense: 0, date: new Date(cursor) };
            if (stepDays) cursor.setDate(cursor.getDate() + 1);
            else cursor.setMonth(cursor.getMonth() + 1);
        }
    }
    const entries = Object.entries(grouped).sort((a, b) => a[1].date - b[1].date);

    return {
        labels: entries.map(entry => entry[0]),
        incomeData: entries.map(entry => entry[1].income),
        expenseData: entries.map(entry => entry[1].expense)
    };
}
function calculateDailyAverage(transactions, currentPeriod) {
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const pastTransactions = transactions.filter(transaction => {
        if (!transaction.date) return true;
        const parts = String(transaction.date).split("-").map(Number);
        if (parts.length !== 3 || parts.some(Number.isNaN)) return true;
        return new Date(parts[0], parts[1] - 1, parts[2]) <= todayEnd;
    });
    const { expense } = calculateSummary(pastTransactions);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start = new Date(today);

    if (currentPeriod === "week") {
        start = getWeekStart(today);
    } else if (currentPeriod === "month") {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (currentPeriod === "year") {
        start = new Date(today.getFullYear(), 0, 1);
    } else {
        transactions.forEach(transaction => {
            if (transaction.isTransfer === true || !transaction.date) return;
            const parts = String(transaction.date).split("-").map(Number);
            if (parts.length !== 3 || parts.some(Number.isNaN)) return;
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
            if (date < start) start = date;
        });
    }

    const days = Math.max(1, Math.round((today - start) / 86400000) + 1);

    return expense / days;
}