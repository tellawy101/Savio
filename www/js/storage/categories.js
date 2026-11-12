// ==============================
// storage/categories.js
// تخزين الفئات وأيقوناتها
// ==============================

// ==============================
// Categories
// ==============================

const CATEGORIES_KEY = "categories";
const CUSTOM_CATEGORY_ICONS_KEY = "customCategoryIcons";

function getCategories() {
    return safeParse(CATEGORIES_KEY, []);
}

// الأنواع المسموحة للتصنيف
const CATEGORY_TYPES = ["income", "expense", "transfer"];

// التصنيف القديم من غير type بيتعامل كأنه "expense"
function getCategoryType(category) {
    return CATEGORY_TYPES.includes(category.type) ? category.type : "expense";
}

function getCategoriesByType(type) {
    return getCategories().filter(function (c) {
        return getCategoryType(c) === type;
    });
}

// التصنيف الفرعي هو اللي ليه parentId
function isSubCategory(category) {
    return !!category.parentId;
}

// التصنيفات الرئيسية بس (من غير الفرعي) لنوع معين
function getMainCategoriesByType(type) {
    return getCategoriesByType(type).filter(function (c) {
        return !isSubCategory(c);
    });
}

// الفرعي التابع لتصنيف رئيسي
function getSubCategories(parentId) {
    return getCategories().filter(function (c) {
        return c.parentId === parentId;
    });
}

// الرئيسي بتاع تصنيف فرعي (أو null لو هو نفسه رئيسي)
function getParentCategory(category) {
    if (!category || !category.parentId) return null;
    return getCategories().find(function (c) {
        return c.id === category.parentId;
    }) || null;
}

// نقل معاملات ومتكررات من تصنيف لتصنيف تاني (بتتستخدم لما الفرعي يتحذف)
function moveCategoryReferences(fromId, toCategory) {
    const transactions = loadTransactions();
    let txChanged = false;
    transactions.forEach(function (tx) {
        if (tx.categoryId === fromId) {
            tx.categoryId = toCategory.id;
            tx.category = toCategory.name;
            tx.categoryIcon = toCategory.icon;
            txChanged = true;
        }
    });
    if (txChanged) saveTransactions(transactions);

    const recurring = getRecurring();
    let recChanged = false;
    recurring.forEach(function (item) {
        if (item.categoryId === fromId) {
            item.categoryId = toCategory.id;
            item.category = toCategory.name;
            recChanged = true;
        }
    });
    if (recChanged) saveRecurring(recurring);
}

// عدد المعاملات والمتكررات المرتبطة بتصنيف واحد (من غير فرعياته)
function countCategoryUsage(categoryId) {
    const txCount = loadTransactions().filter(function (tx) {
        return tx.categoryId === categoryId;
    }).length;
    const recCount = getRecurring().filter(function (item) {
        return item.categoryId === categoryId;
    }).length;
    return txCount + recCount;
}

function saveCategories(categories) {
safeSetItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function getCustomCategoryIcons() {
    return safeParse(CUSTOM_CATEGORY_ICONS_KEY, []);
}

function saveCustomCategoryIcons(icons) {
safeSetItem(CUSTOM_CATEGORY_ICONS_KEY, JSON.stringify(icons));
}
// عدد معاملات التصنيف (الرئيسي بيشمل فرعياته)
function countCategoryTransactions(category) {
    const ids = [category.id].concat(getSubCategories(category.id).map(function (s) { return s.id; }));
    return loadTransactions().filter(function (tx) { return ids.includes(tx.categoryId); }).length;
}

// إعادة ترتيب مجموعة تصنيفات (نفس الـ ids بترتيب جديد)
function reorderCategories(orderedIds) {
    const all = getCategories();
    const byId = {};
    all.forEach(function (c) { byId[c.id] = c; });
    const slots = new Set(orderedIds);
    let i = 0;
    saveCategories(all.map(function (c) {
        return slots.has(c.id) ? byId[orderedIds[i++]] : c;
    }));
}
// تصنيفات جاهزة للمستخدم الجديد (بتتزرع مرة واحدة بس)
function seedDefaultCategories() {
    if (localStorage.getItem("savioDefaultCatsDone")) return;
    if (getCategories().length > 0 || loadTransactions().length > 0) {
        safeSetItem("savioDefaultCatsDone", "1");
        return;
    }
    const ar = getLanguage() === "ar";
    const defs = [
        { type: "income", name: ar ? "راتب" : "Salary", icon: "banknote", color: "#22C55E",
          subs: [[ar ? "حافز" : "Incentive", "banknote"], [ar ? "مكافأة" : "Bonus", "gift"]] },
        { type: "expense", name: ar ? "أكل" : "Food", icon: "utensils", color: "#F97316",
          subs: [[ar ? "مطاعم" : "Restaurants", "utensils"], [ar ? "بقالة" : "Groceries", "shopping-cart"]] },
        { type: "expense", name: ar ? "مواصلات" : "Transport", icon: "car", color: "#3B82F6", subs: [] }
    ];
    const list = [];
    defs.forEach(function (d) {
        const main = { id: generateId("cat"), name: d.name, icon: d.icon, type: d.type, color: d.color };
        list.push(main);
        d.subs.forEach(function (s) {
            list.push({ id: generateId("cat"), name: s[0], icon: s[1], type: d.type, parentId: main.id });
        });
    });
    saveCategories(list);
    safeSetItem("savioDefaultCatsDone", "1");
}