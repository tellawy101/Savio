// ==========================
// router.js
// نظام تنقل SPA
// ==========================
let navigationToken = 0;

async function navigateTo(pageName, fromPopState = false) {
        const navToken = ++navigationToken;
        const route = ROUTES[pageName];
        
        if (!route) {
            console.error("Unknown route:", pageName);
            window.location.href = "index.html";
            return;
        }
        const app = document.getElementById("app");
        if (!app) {
            window.location.href = "index.html";
            return;
        }
        try {
            let html = templateCache[pageName];
            if (!html) {
                app.innerHTML = renderSkeleton();
                const res = await fetch(route.template + "?v=" + Date.now());
                if (!res.ok) throw new Error("HTTP " + res.status);
                html = await res.text();
                templateCache[pageName] = html;
            }
            
            // لو حصل تنقل أحدث أثناء التحميل، نلغي التنقل ده
            if (navToken !== navigationToken) return;
                    currentPageName = pageName;
        app.style.visibility = "hidden";
        if (pageName !== "accounts") {
            const oldFab = document.getElementById("openAddAccountBtn");
            if (oldFab) oldFab.remove();
        }
        
        if (pageName !== "add-transaction") {
            document.body.classList.remove("add-transaction-page");
            document.body.classList.remove("has-scroll");
        }
                        if (typeof window.cleanupStatisticsPage === "function") {
            window.cleanupStatisticsPage();
            window.cleanupStatisticsPage = null;
        }
        if (typeof window.cleanupHomePage === "function") {
            window.cleanupHomePage();
            window.cleanupHomePage = null;
        }
                if (typeof window.cleanupDebtsPage === "function") {
            window.cleanupDebtsPage();
            window.cleanupDebtsPage = null;
        }
        app.innerHTML = html;
        ensureCustomConfirmModal();
        if (window.lucide) lucide.createIcons({ root: app });
        updateBottomNavForPage(pageName);
                const initName = ROUTE_INIT_NAMES[pageName];
        if (initName && typeof window[initName] !== "function") {
            console.error("Missing init function:", initName);
        }
        try {
            route.init();
        } catch (initError) {
            console.error("Page init failed:", pageName, initError);
            if (typeof showToast === "function") {
                showToast(t("page_load_failed_retry"));
            }
        }
        if (typeof applyLanguage === "function") applyLanguage();
        
        app.style.visibility = "visible";
                if (fromPopState ||
            (history.state && history.state.page === pageName)) {
            history.replaceState({ page: pageName }, "", "#" + pageName);
        } else {
            history.pushState({ page: pageName }, "", "#" + pageName);
        }
    } catch (err) {
        app.style.visibility = "visible";
        console.error("Router failed to load page:", pageName, err);
        
        // نعرض الخطأ بس لو ده آخر تنقل (مش تنقل قديم اتلغى)
        if (navToken === navigationToken) {
            if (typeof showToast === "function") {
showToast(t("page_load_failed_retry"));
            }
            if (!templateCache[pageName]) {
app.innerHTML = '<div style="padding:40px 20px;text-align:center;">' + t("page_load_failed") + '</div>';
            }
        }
    }
}