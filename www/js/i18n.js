// ==============================
// i18n.js
// نظام الترجمة (عربي / إنجليزي) + اتجاه الصفحة (RTL/LTR)
// ==============================

const LANGUAGE_KEY = "language";
const DEFAULT_LANGUAGE = "en";

const translations = {
    en: {
        // Bottom nav
        nav_home: "Home",
        nav_debts: "Debts",
        nav_stats: "Statistics",
        nav_expense: "Expense",
        nav_transfer: "Transfer",
        nav_accounts: "Accounts",
        nav_settings: "Settings",

        // Home
        balance: "Balance",
        budget: "Budget",
        income: "Income",
        expenses: "Expenses",
        expenses_title: "Expenses",
        search_placeholder: "Search by category, description, or account...",
        monthly_budget: "Monthly Budget",
        save: "Save",
        cancel: "Cancel",
        delete_confirm: "Delete this item?",

        // Income modal
        income_title: "Income",
        account_label: "Account",
        description_label: "Description",
        description_placeholder: "Description",
        date_label: "Date",
        amount_label: "Amount",

        // Category modal
        add_category: "Add Category",
        category_name_placeholder: "Category Name",
        category_icon_placeholder: "😀 Icon",

        // Settings
        settings_account: "Account",
        settings_profile: "Profile",
        settings_profile_desc: "Manage your profile",
        settings_appearance: "Appearance",
        settings_dark_mode: "Dark Mode",
        settings_dark_mode_desc: "Change the app appearance",
        settings_language: "Language",
        settings_language_desc: "Change the app language",
        settings_currency: "Currency",
        settings_currency_desc: "Choose your default currency",
        settings_data: "Data",
        settings_export: "Export Data",
        settings_export_desc: "Save a backup of your data",
        settings_import: "Import Data",
        settings_import_desc: "Restore your saved data",
        settings_clear: "Clear All Data",
        settings_clear_desc: "Delete all your saved data",
        settings_about: "About",
        settings_about_savio: "About Savio",
        settings_about_savio_desc: "Learn more about the app",
        settings_privacy: "Privacy",
        settings_privacy_desc: "Your data stays on your device",
        settings_developer: "Developer",
        settings_contact: "Contact",
        settings_close: "Close",
        settings_clear_confirm: "Are you sure? All your data (transactions, accounts, debts, budget) will be permanently deleted and cannot be undone.",
        settings_clear_done: "All data has been deleted successfully.",
    },
    ar: {
        // Bottom nav
        nav_home: "الرئيسية",
        nav_debts: "الديون",
        nav_stats: "الإحصائيات",
        nav_expense: "مصروف",
        nav_transfer: "تحويل",
        nav_accounts: "الحسابات",
        nav_settings: "الإعدادات",

        // Home
        balance: "الرصيد",
        budget: "الميزانية",
        income: "الدخل",
        expenses: "المصروفات",
        expenses_title: "المصروفات",
        search_placeholder: "دور بالوصف أو التصنيف أو الحساب...",
        monthly_budget: "الميزانية الشهرية",
        save: "حفظ",
        cancel: "إلغاء",
        delete_confirm: "هل تريد حذف هذا العنصر؟",

        // Income modal
        income_title: "دخل",
        account_label: "الحساب",
        description_label: "الوصف",
        description_placeholder: "الوصف",
        date_label: "التاريخ",
        amount_label: "المبلغ",

        // Category modal
        add_category: "إضافة تصنيف",
        category_name_placeholder: "اسم التصنيف",
        category_icon_placeholder: "😀 أيقونة",

        // Settings
        settings_account: "الحساب",
        settings_profile: "الملف الشخصي",
        settings_profile_desc: "إدارة ملفك الشخصي",
        settings_appearance: "المظهر",
        settings_dark_mode: "الوضع الليلي",
        settings_dark_mode_desc: "تغيير مظهر التطبيق",
        settings_language: "اللغة",
        settings_language_desc: "تغيير لغة التطبيق",
        settings_currency: "العملة",
        settings_currency_desc: "اختر عملتك الافتراضية",
        settings_data: "البيانات",
        settings_export: "تصدير البيانات",
        settings_export_desc: "احفظ نسخة احتياطية من بياناتك",
        settings_import: "استيراد البيانات",
        settings_import_desc: "استعادة بياناتك المحفوظة",
        settings_clear: "حذف كل البيانات",
        settings_clear_desc: "حذف كل بياناتك المحفوظة",
        settings_about: "حول",
        settings_about_savio: "عن Savio",
        settings_about_savio_desc: "اعرف أكتر عن التطبيق",
        settings_privacy: "الخصوصية",
        settings_privacy_desc: "بياناتك تفضل على جهازك بس",
        settings_developer: "المطوّر",
        settings_contact: "تواصل",
        settings_close: "إغلاق",
        settings_clear_confirm: "هل أنت متأكد؟ سيتم حذف كل بياناتك (المعاملات، الحسابات، الديون، الميزانية) نهائياً ولا يمكن التراجع عن هذه الخطوة.",
        settings_clear_done: "تم حذف جميع البيانات بنجاح.",
    }
};


// بترجع اللغة الحالية
function getLanguage() {
    return localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE;
}


// بتغيّر اللغة وتطبق الاتجاه على الصفحة
function setLanguage(lang) {
    localStorage.setItem(LANGUAGE_KEY, lang);
    applyLanguage();
}


// بترجع نص مترجم حسب المفتاح
function t(key) {
    const lang = getLanguage();
    return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
}


// بتطبق الترجمة على كل عنصر عليه data-i18n، وتظبط اتجاه الصفحة
function applyLanguage() {

    const lang = getLanguage();
    const dir = lang === "ar" ? "rtl" : "ltr";

    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", dir);

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        el.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        el.setAttribute("placeholder", t(key));
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach(el => {
        const key = el.getAttribute("data-i18n-aria-label");
        el.setAttribute("aria-label", t(key));
    });

}


document.addEventListener("DOMContentLoaded", applyLanguage);