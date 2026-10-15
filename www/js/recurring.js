// ==============================
// recurring.js
// منطق المعاملات المتكررة: حساب الموعد الجاي + إضافة المعاملات المستحقة تلقائيًا
// ==============================

// أقصى عدد معاملات بتتضاف لمعاملة متكررة واحدة في المرة الواحدة (حماية لو التطبيق اتقفل فترة طويلة)
const RECURRING_MAX_CATCHUP = 120;

function formatRecurringDate(year, month, day) {
    return year + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
}

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

// بترجع تاريخ الموعد الجاي بعد dateStr
// anchorDay: اليوم الأصلي في الشهر (عشان يوم 31 يرجع 31 في الشهور اللي فيها 31)
function getNextRecurringDate(dateStr, frequency, anchorDay) {
    const parts = String(dateStr).split("-").map(Number);
    let year = parts[0];
    let month = parts[1];
    const day = parts[2];

    if (frequency === "daily" || frequency === "weekly") {
        const step = frequency === "daily" ? 1 : 7;
        const next = new Date(year, month - 1, day + step);
        return formatRecurringDate(next.getFullYear(), next.getMonth() + 1, next.getDate());
    }

    if (frequency === "yearly") {
        year += 1;
    } else {
        month += 1;
        if (month > 12) {
            month = 1;
            year += 1;
        }
    }

    const wantedDay = anchorDay || day;
    return formatRecurringDate(year, month, Math.min(wantedDay, getDaysInMonth(year, month)));
}

// بتعدّي المواعيد الفايتة من غير ما تضيف معاملات (بنستخدمها لما المتكررة ترجع من الإيقاف)
function skipRecurringToToday(item) {
    const today = getTodayDateString();
    let guard = 0;
    while (item.nextDate < today && guard < 2000) {
        item.nextDate = getNextRecurringDate(item.nextDate, item.frequency, item.anchorDay);
        guard++;
    }
}

// بتضيف كل المعاملات المتكررة اللي موعدها جه (أو فات) وبترجع عددها
function processRecurringTransactions() {
    const items = getRecurring();
    if (!items.length) return 0;

    const today = getTodayDateString();
    const accounts = getAccounts();
    const categories = getCategories();
    const newTransactions = [];
    let itemsChanged = false;

    items.forEach(function (item) {
        if (!item.active) return;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(item.nextDate))) return;

        const account = accounts.find(function (a) { return a.id === item.accountId; });

        // الحساب اتحذف: بنوقف المتكررة لحد ما المستخدم يختار حساب تاني
        if (!account) {
            item.active = false;
            itemsChanged = true;
            return;
        }

        const category = categories.find(function (c) { return c.id === item.categoryId; });
        let count = 0;

        while (item.nextDate <= today && count < RECURRING_MAX_CATCHUP) {
            newTransactions.push({
                id: generateTransactionId("tx"),
                amount: Number(item.amount),
                account: account.name,
                accountId: account.id,
                description: item.description || "",
                category: category ? category.name : item.category,
                categoryId: item.categoryId,
                categoryIcon: category ? category.icon : (item.categoryIcon || "tag"),
                type: item.type,
                date: item.nextDate,
                time: "00:00",
                recurringId: item.id
            });

            item.nextDate = getNextRecurringDate(item.nextDate, item.frequency, item.anchorDay);
            itemsChanged = true;
            count++;
        }
    });

    if (newTransactions.length) {
        const allTransactions = loadTransactions();
        // لو الحفظ فشل مبنحفظش المتكررة، عشان المواعيد متتعداش من غير ما المعاملات تتضاف
        if (!saveTransactions(allTransactions.concat(newTransactions))) return 0;
    }

    if (itemsChanged) saveRecurring(items);

    return newTransactions.length;
}