// ==========================
// router.js
// نظام تنقل SPA
// ==========================
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
    currentPageName = pageName;
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
    const res = await fetch(route.template + "?v=" + Date.now());
    html = await res.text();
    templateCache[pageName] = html;
}
        
        app.style.visibility = "hidden";
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
                    existingNav.querySelectorAll(".nav-item[data-page]").forEach(function(btn) {
                        btn.classList.toggle("active", btn.dataset.page === pageName);
                    });
                    
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

// ==========================================
// معالجة زر الرجوع الفيزيائي في الهاتف (Hardware Back)
// ==========================================
window.handleHardwareBack = function() {
    // 1. إذا كانت قائمة اختيار الأيقونات مفتوحة، نغلقها أولاً
    const openIconList = document.querySelector(".icon-dropdown-list.show");
    if (openIconList) {
        openIconList.classList.remove("show");
        const trigger = document.getElementById("iconDropdownTrigger") || document.getElementById("categoryIconDropdownTrigger");
        if (trigger && trigger.parentElement && openIconList.parentElement === document.body) {
            trigger.parentElement.appendChild(openIconList);
        }
        return true;
    }
    
    // 2. فحص النوافذ المنبثقة المفتوحة (Modals)
    const openModals = Array.from(document.querySelectorAll(".modal.show"));
    if (openModals.length > 0) {
        const topmostModal = openModals[openModals.length - 1];
        topmostModal.classList.remove("show");
        
        if (topmostModal.id === "addAccountModal" && window.activeAccountBox) {
            const accountModal = document.getElementById("accountModal");
            if (accountModal) accountModal.classList.add("show");
        }
        
        if (topmostModal.id === "addCategoryModal" && window.activeCategoryBox) {
            const categoryModal = document.getElementById("categoryModal");
            if (categoryModal) categoryModal.classList.add("show");
        }
        
        return true;
    }
    
    // 3. إذا لم يكن هناك أي نافذة مفتوحة وكنا خارج الصفحة الرئيسية، نرجع للرئيسية
    if (currentPageName !== "home") {
        navigateTo("home");
        return true;
    }
    
    // 4. إذا كنا بالفعل في الصفحة الرئيسية، نطلب إغلاق التطبيق
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AppExit) {
        window.Capacitor.Plugins.AppExit.exitApp();
        return true;
    }
    
    return false;
};

// مراقب يمنع متصفح Acode من الخروج عند الرجوع: يضيف نقطة تراجع وهمية فور فتح أي مودال أو أيقونات
const overlayObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
            const target = mutation.target;
            if (target.classList.contains("show") &&
                (target.classList.contains("modal") || target.classList.contains("icon-dropdown-list"))) {
                history.pushState({ overlay: true }, "");
            }
        }
    });
});
overlayObserver.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class"] });

// حماية حدث popstate لمنع الخروج إلى محرر Acode أو الرجوع للصفحة السابقة
window.addEventListener("popstate", function(e) {
    const hasOpenOverlay = document.querySelector(".icon-dropdown-list.show") || document.querySelector(".modal.show");
    if (hasOpenOverlay) {
        window.handleHardwareBack();
        return;
    }
    
    const page = (e.state && e.state.page) || "home";
    if (page !== currentPageName) {
        navigateTo(page);
    }
});

// تحميل باقي الصفحات في الخلفية بعد أول تحميل
function preloadAllPages() {
    const pageNames = Object.keys(ROUTES);
    let index = 0;
    
    function loadNext() {
        if (index >= pageNames.length) return;
        const pageName = pageNames[index];
        index++;
        
        if (!templateCache[pageName]) {
            fetch(ROUTES[pageName].template)
                .then(function(res) { return res.text(); })
                .then(function(html) {
                    templateCache[pageName] = html;
                })
                .catch(function() {})
                .finally(function() {
                    setTimeout(loadNext, 50);
                });
        } else {
            setTimeout(loadNext, 0);
        }
    }
    
    loadNext();
}

setTimeout(preloadAllPages, 800);