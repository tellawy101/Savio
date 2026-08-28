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
    }
    // هنضيف باقي الصفحات هنا واحدة واحدة بعدين (debts, statistics...)
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
        if (typeof applyLanguage === "function") applyLanguage();

        route.init();

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