// ==============================
// storage/lookup.js
// توليد الـ ID وجداول البحث بالاسم والـ ID
// ==============================

function generateId(prefix) {
    return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}
// جداول بحث (بالـ id وبالاسم) للحسابات والفئات
// بتتبني مرة واحدة وبتتجدد بس لما البيانات المخزّنة تتغير (بدل JSON.parse مع كل معاملة)
const lookupCache = {};

function getLookup(storageKey, readList) {
    const raw = localStorage.getItem(storageKey);
    let entry = lookupCache[storageKey];

    if (!entry || entry.raw !== raw) {
        const byId = new Map();
        const byName = new Map();

        readList().forEach(function (item) {
            if (!item) return;
            if (item.id && !byId.has(item.id)) byId.set(item.id, item);
            if (!byName.has(item.name)) byName.set(item.name, item);
        });

        entry = { raw: raw, byId: byId, byName: byName };
        lookupCache[storageKey] = entry;
    }

    return entry;
}

function getAccountIdByName(name) {
    const acc = getLookup(ACCOUNTS_KEY, getAccounts).byName.get(name);
    return acc ? acc.id : null;
}

function getCategoryIdByName(name) {
    const cat = getLookup(CATEGORIES_KEY, getCategories).byName.get(name);
    return cat ? cat.id : null;
}
function getTxAccountId(tx) {
        if (tx.accountId) return tx.accountId;
    return getAccountIdByName(tx.account) || null;
}

function getTxCategoryId(tx) {
    if (tx.categoryId) return tx.categoryId;
    return getCategoryIdByName(tx.category) || null;
}
function getAccountNameById(id, fallback) {
    const acc = id ? getLookup(ACCOUNTS_KEY, getAccounts).byId.get(id) : null;
    return acc ? acc.name : (fallback || "");
}
function getAccountIconById(id, fallbackName) {
    const lookup = getLookup(ACCOUNTS_KEY, getAccounts);
    const acc = (id && lookup.byId.get(id)) || (fallbackName && lookup.byName.get(fallbackName)) || null;
    return acc && acc.icon ? acc.icon : "";
}
function getCategoryById(id) {
    return id ? (getLookup(CATEGORIES_KEY, getCategories).byId.get(id) || null) : null;
}
function getCategoryNameById(id, fallback) {
    const cat = id ? getLookup(CATEGORIES_KEY, getCategories).byId.get(id) : null;
    return cat ? cat.name : (fallback || "");
}

// اسم التصنيف كامل: "رئيسي › فرعي" للفرعي، واسمه بس للرئيسي
function getCategoryFullName(category) {
    if (!category) return "";
    const parent = typeof getParentCategory === "function" ? getParentCategory(category) : null;
    return parent ? parent.name + " › " + category.name : category.name;
}

function getTxAccountName(tx) {
    return getAccountNameById(tx.accountId, tx.account);
}
function getTxCategoryIcon(tx) {
    const id = getTxCategoryId(tx);
    const cat = id ? getLookup(CATEGORIES_KEY, getCategories).byId.get(id) : null;
    return (cat && cat.icon) || tx.categoryIcon || "tag";
}
function getTxCategoryName(tx) {
    if (!tx.categoryId && tx.category === "Debt Payment") {
        return t("debts_category_payment");
    }
    const cat = getCategoryById(tx.categoryId);
    return cat ? getCategoryFullName(cat) : (tx.category || "");
}
