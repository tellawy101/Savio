// ==========================
// router.js
// نظام تنقل SPA (تجريبي) - هيبدأ بصفحة الإعدادات بس
// أي صفحة لسه مش متسجلة هنا هتفتح بالطريقة القديمة العادية
// ==========================

const ROUTES = {
    settings: {
        template: "templates/settings.html",
        init: function () {
            if (typeof initSettingsPage === "function") {
                initSettingsPage();
            }
        }
    },
    accounts: {
        template: "templates/accounts.html",
        init: function () {
            if (typeof initAccountsPage === "function") {
                initAccountsPage();
            }
        }
    },
    debts: {
        template: "templates/debts.html",
        init: function () {
            if (typeof initDebtsPage === "function") {
                initDebtsPage();
            }
        }
    },
    statistics: {
        template: "templates/statistics.html",
        init: function () {
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
};
async function navigateTo(pageName) {
    const route = ROUTES[pageName];

    // لو الصفحة دي لسه مش متحولة، سيبها تفتح بالطريقة القديمة
    if (!route) {
        window.location.href = "pages/" + pageName + ".html";
        return;
    }

    const app = document.getElementById("app");
    if (!app) {
        // لو مفيش div#app أصلاً (يعني index.html لسه معملهاش)، ارجع للطريقة القديمة
        window.location.href = "pages/" + pageName + ".html";
        return;
    }

    try {
        const res = await fetch(route.template);
const html = await res.text();

// نظّف أي عنصر خاص بصفحة سابقة اتحقن برّه #app (زي فاب "+ إضافة حساب")
if (pageName !== "accounts") {
    const oldFab = document.getElementById("openAddAccountBtn");
    if (oldFab) oldFab.remove();
}

app.innerHTML = html;
        if (window.lucide) lucide.createIcons();
        const navPlaceholder = document.getElementById("nav-placeholder");
if (navPlaceholder && typeof renderBottomNav === "function") {
    navPlaceholder.innerHTML = renderBottomNav(pageName);
    if (typeof setupBottomNav === "function") setupBottomNav("");
}
route.init();
if (typeof applyLanguage === "function") applyLanguage();

        history.pushState({ page: pageName }, "", "#" + pageName);
    } catch (err) {
        console.error("Router failed, falling back:", err);
        window.location.href = "pages/" + pageName + ".html";
    }
}

window.addEventListener("popstate", function (e) {
    const page = (e.state && e.state.page) || "home";
    navigateTo(page);
});