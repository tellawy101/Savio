// ======================================
// router/routerUi.js
// عناصر واجهة الراوتر: الـ skeleton + مودال التأكيد + الشريط السفلي
// ======================================

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

function ensureCustomConfirmModal() {
        if (!document.getElementById("customConfirmModal")) {
            const confirmHolder = document.createElement("div");
            confirmHolder.innerHTML = `
            <div id="customConfirmModal" class="modal">
                <div class="modal-content custom-confirm-content">
                    <p id="customConfirmMessage" class="custom-confirm-message"></p>
                    <div class="custom-confirm-actions">
                                                <button id="customConfirmCancelBtn" class="custom-confirm-cancel-btn" data-i18n="cancel">Cancel</button>
                        <button id="customConfirmOkBtn" class="custom-confirm-ok-btn" data-i18n="ok">OK</button>
                    </div>
                </div>
            </div>`;
            document.body.appendChild(confirmHolder.firstElementChild);
        }
}

function updateBottomNavForPage(pageName) {
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
}
