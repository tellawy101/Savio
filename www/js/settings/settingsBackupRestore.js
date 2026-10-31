// ==============================
// settings/settingsBackupRestore.js
// استعادة البيانات: استبدال كامل أو دمج ذكي
// ==============================
// ------------------------------
// استعادة البيانات: استبدال كامل أو دمج ذكي
// كل دالة بتاخد بيانات النسخة وبترجّع true لو نجحت، و false لو فشلت أو اتلغت
// ------------------------------

// استبدال كامل: بنمسح الحالي ونحط اللي في النسخة
function replaceAllData(data) {
    // لقطة احتياطية من البيانات الحالية قبل ما نمسحها
    if (!createPreRestoreSnapshot()) {
        showToast(t("backup_take_failed_replace"), "error");
        return false;
    }

    // الميزانيات منمسحهاش لو النسخة القديمة مفيهاش (النسخ القديمة قبل الميزة دي)
    const KEEP_IF_MISSING = [BUDGET_KEY, CATEGORY_BUDGETS_KEY];

    const previousValues = {};
    BACKUP_KEYS.forEach(function (key) {
        previousValues[key] = localStorage.getItem(key);
    });

    try {
        BACKUP_KEYS.forEach(function (key) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                localStorage.setItem(key, data[key]);
            } else if (KEEP_IF_MISSING.indexOf(key) === -1) {
                localStorage.removeItem(key);
            }
        });
    } catch (writeError) {
        console.error("Restore write failed:", writeError);
        BACKUP_KEYS.forEach(function (key) {
            try {
                if (previousValues[key] === null) localStorage.removeItem(key);
                else localStorage.setItem(key, previousValues[key]);
            } catch (e) {}
        });
        showToast(t("storage_full"), "error");
        return false;
    }

    return true;
}

// قراءة صارمة: لو البيانات الحالية تالفة نوقف الدمج كله
function readCurrentArray(key) {
    const raw = localStorage.getItem(key);
    if (raw === null) return [];
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) {
        throw new Error("Current data is corrupted: " + key);
    }
    return value;
}

// الحسابات اللي ينفع المعاملات والديون تشاور عليها (الحالية + اللي هتضاف من النسخة)
function collectKnownAccountIds(data) {
    const accountIds = new Set(getAccounts().map(a => a.id));
    const accountNames = new Set(getAccounts().map(a => a.name));
    if (data.accounts) {
        JSON.parse(data.accounts).forEach(function (a) {
            if (a.id && !accountNames.has(a.name)) accountIds.add(a.id);
        });
    }
    return accountIds;
}

// الفئات: بنضيف الجديد بس (بالاسم أو الـ id) من غير تكرار
function mergeCategories(data, writes) {
    if (!data[CATEGORIES_KEY]) return;

    const merged = readCurrentArray(CATEGORIES_KEY);
    const names = new Set(merged.map(x => x.name));
    const ids = new Set(merged.map(x => x.id).filter(Boolean));
    JSON.parse(data[CATEGORIES_KEY]).forEach(function (x) {
        if (names.has(x.name)) return;
        if (x.id && ids.has(x.id)) return;
        merged.push(x);
    });
    writes[CATEGORIES_KEY] = merged;
}

// الأهداف: بنضيف الجديد بس (بالـ id، أو بالمحتوى لو من غير id)
function mergeGoals(data, writes) {
    if (!data[GOALS_KEY]) return;

    const merged = readCurrentArray(GOALS_KEY);

    const goalSignature = function (x) {
        return [x.name, x.target, x.date].join("|");
    };

    const knownIds = new Set();
    const knownSignatures = new Set();
    merged.forEach(function (x) {
        if (x.id !== undefined && x.id !== null) knownIds.add(x.id);
        knownSignatures.add(goalSignature(x));
    });

    JSON.parse(data[GOALS_KEY]).forEach(function (x) {
        if (x.id !== undefined && x.id !== null) {
            if (knownIds.has(x.id)) return;
        } else {
            if (knownSignatures.has(goalSignature(x))) return;
            x.id = Date.now() + Math.floor(Math.random() * 1000);
        }
        merged.push(x);
    });

    writes[GOALS_KEY] = merged;
}

// المعاملات: بنضيف الجديد بس، وبنشيل أي ربط بحساب أو فئة مش موجودة
function mergeTransactions(data, writes) {
    if (!data.transactions) return;

    const merged = readCurrentArray("transactions");

    // المعاملة اللي من غير id بنقارنها بمحتواها
    const txSignature = function (x) {
        return [x.date, x.time, x.amount, x.account, x.type, x.category, x.description].join("|");
    };

    const knownIds = new Set();
    const knownSignatures = new Set();
    merged.forEach(function (x) {
        if (x.id) knownIds.add(x.id);
        knownSignatures.add(txSignature(x));
    });

    const knownAccountIds = collectKnownAccountIds(data);
    const knownCategoryIds = new Set((writes[CATEGORIES_KEY] || getCategories()).map(c => c.id));

    JSON.parse(data.transactions).forEach(function (x) {
        ["accountId", "transferToId", "transferFromId"].forEach(function (k) {
            if (x[k] && !knownAccountIds.has(x[k])) delete x[k];
        });
        if (x.categoryId && !knownCategoryIds.has(x.categoryId)) delete x.categoryId;
        if (x.id) {
            if (knownIds.has(x.id)) return;
        } else {
            if (knownSignatures.has(txSignature(x))) return;
            x.id = "tx_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
        }
        merged.push(x);
    });

    writes.transactions = merged;
}

// الديون: بنضيف الجديد بس، وبنشيل أي ربط بحساب مش موجود من الدفعات
function mergeDebts(data, writes) {
    if (!data.debts) return;

    const merged = readCurrentArray("debts");

    // الدين اللي من غير id بنقارنه بمحتواه
    const debtSignature = function (x) {
        return [x.type, x.person, x.amount, x.dueDate, x.createdAt, x.notes].join("|");
    };

    const knownIds = new Set();
    const knownSignatures = new Set();
    merged.forEach(function (x) {
        if (x.id !== undefined && x.id !== null) knownIds.add(x.id);
        knownSignatures.add(debtSignature(x));
    });

    const knownAccountIds = collectKnownAccountIds(data);

    JSON.parse(data.debts).forEach(function (x) {
        if (Array.isArray(x.payments)) {
            x.payments.forEach(function (p) {
                if (p.accountId && !knownAccountIds.has(p.accountId)) delete p.accountId;
            });
        }
        if (x.id !== undefined && x.id !== null) {
            if (knownIds.has(x.id)) return;
        } else {
            if (knownSignatures.has(debtSignature(x))) return;
            x.id = Date.now() + Math.floor(Math.random() * 1000);
        }
        merged.push(x);
    });

    writes.debts = merged;
}

// الحسابات: بنضيف الجديد بس (بالاسم أو الـ id)
function mergeAccounts(data, writes) {
    if (!data.accounts) return;

    const merged = readCurrentArray("accounts");
    const names = new Set(merged.map(x => x.name));
    const ids = new Set(merged.map(x => x.id).filter(Boolean));
    JSON.parse(data.accounts).forEach(x => {
        if (names.has(x.name)) return;
        if (x.id && ids.has(x.id)) return;
        merged.push(x);
    });
    writes.accounts = merged;
}

// الكتابة بعد ما كله نجح، ولو فشلت نرجّع القديم
function writeMergedData(writes) {
    const previousValues = {};
    Object.keys(writes).forEach(function (key) {
        previousValues[key] = localStorage.getItem(key);
    });

    try {
        Object.keys(writes).forEach(function (key) {
            localStorage.setItem(key, JSON.stringify(writes[key]));
        });
    } catch (writeError) {
        console.error("Merge write failed:", writeError);
        Object.keys(previousValues).forEach(function (key) {
            try {
                if (previousValues[key] === null) localStorage.removeItem(key);
                else localStorage.setItem(key, previousValues[key]);
            } catch (e) {}
        });
        showToast(t("storage_full"), "error");
        return false;
    }

    return true;
}

// دمج ذكي (Smart Merge): بنجهّز كل النتايج الأول من غير ما نكتب أي حاجة
function mergeBackupData(data) {
    try {
        const writes = {};

        // الترتيب مهم: المعاملات بتعتمد على الفئات اللي اتجهزت قبلها
        mergeCategories(data, writes);
        mergeGoals(data, writes);
        mergeTransactions(data, writes);
        mergeDebts(data, writes);
        mergeAccounts(data, writes);

        return writeMergedData(writes);
    } catch (e) {
        console.error("Merge aborted:", e);
        showToast(t("merge_cancelled_corrupt"), "error");
        return false;
    }
}