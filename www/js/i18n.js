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
        tab_income: "Income",
        tab_expense: "Expense",
        tab_transfer: "Transfer",
        add_transaction_title: "Add Transaction",
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
        undo_btn: "Undo",
        item_deleted_toast: "Item Deleted",

        // Income modal
income_title: "Income",
    expense_title: "Expense",
    transfer_title: "Transfer",
    account_label: "Account",
    category_label: "Category",
    description_label: "Description",
    description_placeholder: "Description",
    note_placeholder: "Write a note",
    date_label: "Date",
    amount_label: "Amount",
    select_account: "Select Account",
    select_category: "Select Category",
    
    accounts_title: "Accounts",
    add_account_btn: "+ Add Account",
    new_account_title: "New Account",
    account_name_placeholder: "Account name",
    account_description_placeholder: "Description (optional)",
    initial_balance_placeholder: "Initial Balance",
    choose_icon_label: "Choose Icon",
    categories_title: "Categories",
    add_category_btn: "+ Add Category",
    new_category_title: "New Category",
    icon_search_placeholder: "Search any icon (English)...",
    edit_btn: "✏️ Edit",
    delete_btn: "🗑 Delete",
    account_exists_toast: "Account name already exists",
    account_added_toast: "Account added",
    account_deleted_toast: "Account Deleted",
    enter_account_name_alert: "Please enter account name",
    icon_not_found_toast: "Icon name not found, try another name",
    enter_category_name_toast: "Please enter a category name",
    category_deleted_toast: "Category deleted",
    category_updated_toast: "Category updated",
    category_added_toast: "Category added",
    enter_person_name_alert: "Please enter person name",
    enter_valid_amount_alert: "Please enter a valid amount",
    debt_added_toast: "Debt Added",
    select_account_alert: "Please select an account",
    payment_exceeds_alert: "Payment is greater than remaining amount",
    payment_added_toast: "Payment Added",
    debt_updated_toast: "Debt Updated",
    debt_deleted_toast: "Debt Deleted",
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
        settings_export_done: "Backup file saved to your device.",
    settings_import_confirm: "This will overwrite your current data with the backup file. Continue?",
    settings_import_done: "Data restored successfully.",
    settings_import_invalid: "Invalid or corrupted backup file.",
    settings_export_fallback_title: "Backup Data",
    settings_export_fallback_desc: "Copy the text below and save it as a .json file.",
    settings_export_copy: "Copy",
    settings_export_copied: "Copied!",
    settings_import_manual_desc: "Paste the backup text you copied earlier, then tap Restore.",
    settings_import_restore: "Restore",
        // Debts page
        debts_net_balance: "Net Balance",
        debts_receivable: "Receivable",
        debts_payable: "Payable",
        debts_list_title: "Debts List",
        debts_add_btn: "+ Add Debt",
        debts_add_title: "Add New Debt",
        debts_owed_to_me: "Owed to Me",
        debts_i_owe: "I Owe",
        debts_person_placeholder: "Person Name",
        debts_amount_placeholder: "Amount",
        debts_notes_placeholder: "Notes (Optional)",
        debts_pay_title: "Pay Debt",
        debts_edit_title: "Edit Debt",
        confirm_btn: "Confirm",
        debts_owed_to_you_badge: "Owed to You",
        debts_you_owe_badge: "You Owe",
        debts_settled_badge: "Settled",
        debts_no_due_date: "No due date",
        debts_paid_note: "Paid EGP",
        debts_pay_btn: "Pay",
        debts_delete_confirm: "Are you sure you want to delete this debt?",
        debts_added_toast: "Debt Added",
        debts_updated_toast: "Debt Updated",
        debts_deleted_toast: "Debt Deleted",
        debts_payment_added_toast: "Payment Added",
        debts_enter_person_alert: "Please enter person name",
        debts_enter_amount_alert: "Please enter a valid amount",
        debts_select_account_alert: "Please select an account",
        debts_payment_exceeds_alert: "Payment is greater than remaining amount",
        debts_payment_from: "Debt payment from",
        debts_payment_to: "Debt payment to",
        debts_category_payment: "Debt Payment",
        // Statistics
stats_week: "Week",
stats_month: "Month",
stats_year: "Year",
stats_all: "All",
stats_net_balance: "Net Balance",
stats_total_income: "Total Income",
stats_total_expense: "Total Expense",
stats_cash_flow: "Cash Flow",
stats_income_vs_expense: "Income vs Expense",
stats_expenses_by_category: "Expenses by Category",
stats_where_money_goes: "Where your money goes",
stats_no_expense_data: "No expense data yet",
stats_activity_by_account: "Activity by Account",
stats_financial_activity: "Financial activity across accounts",
stats_no_account_data: "No account data yet",
stats_income: "Income",
stats_expense: "Expense",
    },
    ar: {
        // Bottom nav
        nav_home: "الرئيسية",
        nav_debts: "الديون",
        nav_stats: "الإحصائيات",
        nav_expense: "مصروف",
        tab_income: "دخل",
        tab_expense: "مصروف",
        tab_transfer: "تحويل",
        add_transaction_title: "إضافة معاملة",
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
    undo_btn: "تراجع",
    item_deleted_toast: "تم الحذف",

        // Income modal
income_title: "دخل",
    expense_title: "مصروف",
       transfer_title: "تحويل",
    account_label: "الحساب",
    category_label: "التصنيف",
    description_label: "الوصف",
    description_placeholder: "الوصف",
    note_placeholder: "اكتب ملاحظة",
    date_label: "التاريخ",
    amount_label: "المبلغ",
    select_account: "اختر الحساب",
    select_category: "اختر التصنيف",
    accounts_title: "الحسابات",
    add_account_btn: "+ إضافة حساب",
    new_account_title: "حساب جديد",
    account_name_placeholder: "اسم الحساب",
    account_description_placeholder: "الوصف (اختياري)",
    initial_balance_placeholder: "الرصيد الابتدائي",
    choose_icon_label: "اختر أيقونة",
    categories_title: "التصنيفات",
    add_category_btn: "+ إضافة تصنيف",
    new_category_title: "تصنيف جديد",
    icon_search_placeholder: "ابحث عن أيقونة (بالإنجليزي)...",
    edit_btn: "✏️ تعديل",
    delete_btn: "🗑 حذف",
    account_exists_toast: "اسم الحساب موجود بالفعل",
    account_added_toast: "تم إضافة الحساب",
    account_deleted_toast: "تم حذف الحساب",
    enter_account_name_alert: "من فضلك اكتب اسم الحساب",
    icon_not_found_toast: "الأيقونة غير موجودة، جرب اسم تاني",
    enter_category_name_toast: "من فضلك اكتب اسم التصنيف",
    category_deleted_toast: "تم حذف التصنيف",
    category_updated_toast: "تم تعديل التصنيف",
    category_added_toast: "تم إضافة التصنيف",
enter_person_name_alert: "من فضلك اكتب اسم الشخص",
    enter_valid_amount_alert: "من فضلك اكتب مبلغ صحيح",
    debt_added_toast: "تم إضافة الدين",
    select_account_alert: "من فضلك اختر حساب",
    payment_exceeds_alert: "المبلغ المدفوع أكبر من المتبقي",
    payment_added_toast: "تم إضافة الدفعة",
    debt_updated_toast: "تم تعديل الدين",
    debt_deleted_toast: "تم حذف الدين",
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
        settings_export_done: "تم حفظ ملف النسخة الاحتياطية على جهازك.",
    settings_import_confirm: "هذه العملية هتستبدل بياناتك الحالية بالبيانات الموجودة في ملف النسخة الاحتياطية. عايز تكمل؟",
    settings_import_done: "تم استعادة بياناتك بنجاح.",
    settings_import_invalid: "ملف النسخة الاحتياطية غير صالح أو تالف.",
    settings_export_fallback_title: "نسخة البيانات الاحتياطية",
    settings_export_fallback_desc: "انسخ النص اللي تحت واحفظه في ملف .json.",
    settings_export_copy: "نسخ",
    settings_export_copied: "تم النسخ!",
    settings_import_manual_desc: "الصق نص النسخة الاحتياطية اللي نسخته قبل كده، وبعدين دوس استعادة.",
    settings_import_restore: "استعادة",

        // Debts page
        debts_net_balance: "الرصيد الصافي",
        debts_receivable: "مستحق لك",
        debts_payable: "مستحق عليك",
        debts_list_title: "قائمة الديون",
        debts_add_btn: "+ إضافة دين",
        debts_add_title: "إضافة دين جديد",
        debts_owed_to_me: "مستحق لي",
        debts_i_owe: "عليّ",
        debts_person_placeholder: "اسم الشخص",
        debts_amount_placeholder: "المبلغ",
        debts_notes_placeholder: "ملاحظات (اختياري)",
        debts_pay_title: "سداد دين",
        debts_edit_title: "تعديل الدين",
        confirm_btn: "تأكيد",
        debts_owed_to_you_badge: "مستحق لك",
        debts_you_owe_badge: "عليك",
        debts_settled_badge: "تم السداد",
        debts_no_due_date: "بدون تاريخ استحقاق",
        debts_paid_note: "مدفوع",
        debts_pay_btn: "سداد",
        debts_delete_confirm: "هل أنت متأكد من حذف هذا الدين؟",
        debts_added_toast: "تم إضافة الدين",
        debts_updated_toast: "تم تعديل الدين",
        debts_deleted_toast: "تم حذف الدين",
        debts_payment_added_toast: "تم إضافة السداد",
        debts_enter_person_alert: "من فضلك اكتب اسم الشخص",
        debts_enter_amount_alert: "من فضلك اكتب مبلغ صحيح",
        debts_select_account_alert: "من فضلك اختر الحساب",
        debts_payment_exceeds_alert: "المبلغ المدفوع أكبر من المتبقي",
        debts_payment_from: "سداد دين من",
        debts_payment_to: "سداد دين لـ",
        debts_category_payment: "سداد دين",
        // Statistics
stats_week: "أسبوع",
    stats_month: "شهر",
    stats_year: "سنة",
    stats_all: "الكل",
    stats_net_balance: "الرصيد الصافي",
    stats_total_income: "إجمالي الدخل",
    stats_total_expense: "إجمالي المصروفات",
    stats_cash_flow: "التدفق النقدي",
    stats_income_vs_expense: "الدخل مقابل المصروفات",
    stats_expenses_by_category: "المصروفات حسب التصنيف",
    stats_where_money_goes: "أين تذهب أموالك",
    stats_no_expense_data: "لا توجد بيانات مصروفات حتى الآن",
    stats_activity_by_account: "النشاط حسب الحساب",
    stats_financial_activity: "النشاط المالي عبر الحسابات",
    stats_no_account_data: "لا توجد بيانات حسابات حتى الآن",
    stats_income: "الدخل",
    stats_expense: "المصروفات",
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


applyLanguage();
document.addEventListener("DOMContentLoaded", applyLanguage);