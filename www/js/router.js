// ==========================
// router.js
// نظام تنقل SPA (تجريبي) - هيبدأ بصفحة الإعدادات بس
// أي صفحة لسه مش متسجلة هنا هتفتح بالطريقة القديمة العادية
// ==========================

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
async function navigateTo(pageName) {
        const route = ROUTES[pageName];
        
        // كل الصفحات بقت مسجّلة في الراوتر - لو اسم مش موجود، ارجع للهوم
        if (!route) {
            console.error("Unknown route:", pageName);
            window.location.href = "index.html";
            return;
        }
    const app = document.getElementById("app");
if (!app) {
    // لو مفيش div#app أصلاً (يعني index.html لسه معملهاش)
    window.location.href = "index.html";
    return;
}
  try {
    const res = await fetch(route.template);
    const html = await res.text();

    app.style.visibility = "hidden";
// نظّف أي عنصر خاص بصفحة سابقة اتحقن برّه #app (زي فاب "+ إضافة حساب")
if (pageName !== "accounts") {
    const oldFab = document.getElementById("openAddAccountBtn");
    if (oldFab) oldFab.remove();
}

if (pageName !== "add-transaction") {
    document.body.classList.remove("add-transaction-page");
    document.body.classList.remove("has-scroll");
}

app.innerHTML = html;
        if (window.lucide) lucide.createIcons({ root: app });
        const navPlaceholder = document.getElementById("nav-placeholder");
if (navPlaceholder && typeof renderBottomNav === "function") {
    if (pageName === "add-transaction") {
        navPlaceholder.innerHTML = "";
    } else {
        const existingNav = navPlaceholder.querySelector(".bottom-nav");
        if (existingNav) {
            // الـ nav موجود بالفعل - بدّل كلاس active بس عشان الـ transition يشتغل
            existingNav.querySelectorAll(".nav-item[data-page]").forEach(function(btn) {
                btn.classList.toggle("active", btn.dataset.page === pageName);
            });
            
            // إظهار/إخفاء زرار الـ FAB حسب لو دخلنا/خرجنا من الرئيسية
            const isHome = pageName === "home";
            existingNav.classList.toggle("no-fab", !isHome);
            let fabBtn = existingNav.querySelector("#addMenuBtn");
            if (isHome && !fabBtn) {
                fabBtn = document.createElement("button");
                fabBtn.id = "addMenuBtn";
                fabBtn.className = "fab-nav";
                fabBtn.innerHTML = '<i data-lucide="plus"></i>';
                const accountsBtn = existingNav.querySelector('.nav-item[data-page="accounts"]');
                if (accountsBtn) {
                    existingNav.insertBefore(fabBtn, accountsBtn);
                } else {
                    existingNav.appendChild(fabBtn);
                }
                if (window.lucide) lucide.createIcons({ root: fabBtn });
            } else if (!isHome && fabBtn) {
                fabBtn.remove();
            }
        } else {
            // أول تحميل للـ nav - ابنيه زي ما هو
            navPlaceholder.innerHTML = renderBottomNav(pageName);
            if (typeof setupBottomNav === "function") setupBottomNav("");
        }
    }
}
route.init();
if (typeof applyLanguage === "function") applyLanguage();

        app.style.visibility = "visible";

        history.pushState({ page: pageName }, "", "#" + pageName);
  } catch (err) {
        app.style.visibility = "visible";
        console.error("Router failed to load page:", pageName, err);
    }
}

window.addEventListener("popstate", function (e) {
    const page = (e.state && e.state.page) || "home";
    navigateTo(page);
});