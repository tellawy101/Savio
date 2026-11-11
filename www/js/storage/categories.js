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

function saveCategories(categories) {
safeSetItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function getCustomCategoryIcons() {
    return safeParse(CUSTOM_CATEGORY_ICONS_KEY, []);
}

function saveCustomCategoryIcons(icons) {
safeSetItem(CUSTOM_CATEGORY_ICONS_KEY, JSON.stringify(icons));
}
