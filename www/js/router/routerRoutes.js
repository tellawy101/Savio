// ======================================
// router/routerRoutes.js
// جدول الصفحات (ROUTES) + كاش القوالب + الصفحة الحالية
// ======================================

const templateCache = {};
let currentPageName = "home";
const ROUTES = {
    settings: {
        template: "templates/settings.html",
        init: function() {
            if (typeof initSettingsPage === "function") {
                initSettingsPage();
            }
        }
    },
    accounts: {
        template: "templates/accounts.html",
        init: function() {
            if (typeof initAccountsPage === "function") {
                initAccountsPage();
            }
        }
    },
    debts: {
        template: "templates/debts.html",
        init: function() {
            if (typeof initDebtsPage === "function") {
                initDebtsPage();
            }
        }
    },
    
    goals: {
        template: "templates/goals.html",
        init: function() {
            if (typeof initGoalsPage === "function") {
                initGoalsPage();
            }
        }
    },
        recurring: {
        template: "templates/recurring.html",
        init: function() {
            if (typeof initRecurringPage === "function") {
                initRecurringPage();
            }
        }
    },
        budgets: {
        template: "templates/budgets.html",
        init: function() {
            if (typeof initBudgetsPage === "function") {
                initBudgetsPage();
            }
        }
    },
    statistics: {
        template: "templates/statistics.html",
        init: function() {
            if (typeof initStatisticsPage === "function") {
                initStatisticsPage();
            }
        }
    },
    home: {
        template: "templates/home.html",
        init: function() {
            if (typeof initHomePage === "function") {
                initHomePage();
            }
        }
    },
    "add-transaction": {
        template: "templates/add-transaction.html",
        init: function() {
            if (typeof initAddTransactionPage === "function") {
                initAddTransactionPage(window.pendingAddTransactionTab || "income", window.pendingEditTransactionId || null);
                window.pendingAddTransactionTab = null;
                window.pendingEditTransactionId = null;
            }
        }
    },
    "account-transactions": {
        template: "templates/account-transactions.html",
        init: function() {
            if (typeof initAccountTransactionsPage === "function") {
                initAccountTransactionsPage();
            }
        }
    },
};
const ROUTE_INIT_NAMES = {
    settings: "initSettingsPage",
    accounts: "initAccountsPage",
    debts: "initDebtsPage",
    goals: "initGoalsPage",
        recurring: "initRecurringPage",
    budgets: "initBudgetsPage",
    statistics: "initStatisticsPage",
    home: "initHomePage",
    "add-transaction": "initAddTransactionPage",
    "account-transactions": "initAccountTransactionsPage"
};
