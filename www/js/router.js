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
    
    goals: {
        template: "templates/goals.html",
        init: function() {
            if (typeof initGoalsPage === "function") {
                initGoalsPage();
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
function renderSkeleton() {
    return `
    <div class="skeleton-page">
        <div class="sk sk-title"></div>
        <div class="sk sk-hero"></div>
        <div class="sk sk-row"></div>
        <div class="sk sk-row"></div>
        <div class="sk sk-row"></div>
        <div class="sk sk-row"></div>
    </div>`;
}
let navigationToken = 0;

async function navigateTo(pageName) {
        currentPageName = pageName;
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
        if (!document.getElementById("customConfirmModal")) {
            const confirmHolder = document.createElement("div");
            confirmHolder.innerHTML = `
            <div id="customConfirmModal" class="modal">
                <div class="modal-content custom-confirm-content">
                    <p id="customConfirmMessage" class="custom-confirm-message"></p>
                    <div class="custom-confirm-actions">
                        <button id="customConfirmCancelBtn" class="custom-confirm-cancel-btn">Cancel</button>
                        <button id="customConfirmOkBtn" class="custom-confirm-ok-btn">OK</button>
                    </div>
                </div>
            </div>`;
            document.body.appendChild(confirmHolder.firstElementChild);
        }
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
// ويشيلها لما يتقفل بأي طريقة غير زر الرجوع
let fakeHistoryCount = 0;   // عدد النقاط الوهمية الموجودة حالياً
let ignorePopCount = 0;     // popstate ناتج عن تنظيفنا إحنا (نتجاهله)
let closedByBackCount = 0;  // مودال اتقفل بزر الرجوع (النقطة اتشالت خلاص)

const overlayObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type !== "attributes" || mutation.attributeName !== "class") return;

        const target = mutation.target;
        if (!target.classList.contains("modal") && !target.classList.contains("icon-dropdown-list")) return;

        const wasShown = (mutation.oldValue || "").split(/\s+/).indexOf("show") !== -1;
        const isShown = target.classList.contains("show");

        if (!wasShown && isShown) {
            history.pushState({ overlay: true }, "");
            fakeHistoryCount++;
        } else if (wasShown && !isShown) {
            if (closedByBackCount > 0) {
                closedByBackCount--;
                return;
            }
            if (fakeHistoryCount > 0) {
                fakeHistoryCount--;
                ignorePopCount++;
                history.back();
            }
        }
    });
});
overlayObserver.observe(document.body, { attributes: true, attributeOldValue: true, subtree: true, attributeFilter: ["class"] });

// حماية حدث popstate لمنع الخروج إلى محرر Acode أو الرجوع للصفحة السابقة
window.addEventListener("popstate", function(e) {
    if (ignorePopCount > 0) {
        ignorePopCount--;
        return;
    }

    const hasOpenOverlay = document.querySelector(".icon-dropdown-list.show") || document.querySelector(".modal.show");
    if (hasOpenOverlay) {
        if (fakeHistoryCount > 0) fakeHistoryCount--;
        closedByBackCount++;
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
                .then(function(res) {
                    if (!res.ok) throw new Error("HTTP " + res.status);
                    return res.text();
                })
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