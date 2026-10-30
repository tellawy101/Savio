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

function saveCategories(categories) {
safeSetItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function getCustomCategoryIcons() {
    return safeParse(CUSTOM_CATEGORY_ICONS_KEY, []);
}

function saveCustomCategoryIcons(icons) {
safeSetItem(CUSTOM_CATEGORY_ICONS_KEY, JSON.stringify(icons));
}
