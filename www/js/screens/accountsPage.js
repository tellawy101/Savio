// ==============================================================
// screens/accountsPage.js
// منطق صفحة الحسابات (كان متقسم accounts.js + accountsPage.js)
// اتجمع كله في initAccountsPage() عشان الراوتر ينادِيها يدويًا
// ==============================================================

function initAccountsPage() {
    
    applyStoredTheme();
    
    // مودالز الحسابات المشتركة (Add/Edit/Delete)
    const modalsPlaceholder = document.getElementById("modals-placeholder");
    if (modalsPlaceholder) {
        modalsPlaceholder.innerHTML = renderSharedModals();
    }
    const accountModal = document.getElementById("accountModal");
    const addAccountModal = document.getElementById("addAccountModal");
    const accountMenu = document.getElementById("accountMenu");
    
    // الأجزاء المنقولة (js/accountsPage/)
    const form = initAccountsPageForm(renderAccountsPage);
    initAccountsPageIconDropdown();
    const { openAccountMenu } = initAccountsPageMenu(form, renderAccountsPage);
    
    // ------------------------------
    // زرار الرجوع
    // ------------------------------
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
        backBtn.onclick = function() {
            if (typeof navigateTo === "function" && document.getElementById("app")) {
                navigateTo("home");
            } else {
                window.location.href = "../index.html";
            }
        };
    }
    
    // ------------------------------
    // فاب "+ إضافة حساب" في الشريط السفلي
    // ------------------------------
    const bottomNav = document.querySelector(".bottom-nav");
    let openAddAccountBtn = document.getElementById("openAddAccountBtn");
    
    if (bottomNav && !openAddAccountBtn) {
        bottomNav.insertAdjacentHTML("beforeend", `
            <button id="openAddAccountBtn" class="fab-nav">
                <i data-lucide="plus"></i>
            </button>
        `);
        openAddAccountBtn = document.getElementById("openAddAccountBtn");
        if (window.lucide) lucide.createIcons();
    }
    
    if (openAddAccountBtn) {
        openAddAccountBtn.onclick = function() {
            form.resetAddAccountForm();
            document.getElementById("addAccountModal").classList.add("show");
        };
    }
    
    closeModalOnBackdropClick(accountModal);
    closeModalOnBackdropClick(addAccountModal);
    closeModalOnBackdropClick(accountMenu);
    
    // ------------------------------
    // عرض قائمة الحسابات (كانت accountsPage.js)
    // ------------------------------
    window.onFormFieldChanged = renderAccountsPage;
    
    // ---- تقرير الفترة ----
    let reportPeriod = "all";
    let reportFrom = "";
    let reportTo = "";
    
    function getPeriodRange(period) {
        return getPeriodRangeFor(period, reportFrom, reportTo);
    }
    
    function renderAccountsPage() {
        const container = document.getElementById("accountsContainer");
        if (!container) return;
        
        const accounts = getAccounts();
        const transactions = loadTransactions();
        
        const accountsWithBalance = accounts.map(function(account) {
            const range = getPeriodRange(reportPeriod);
            const activity = getAccountActivity(account.id, transactions, range.from, range.to);
            const currentBalance = calculateAccountBalance(account, transactions);
            return Object.assign({}, account, activity, { currentBalance });
        });
        
        
        
        container.innerHTML = "";
        
        
        const list = document.createElement("div");
        list.className = "accounts-list";
        
        if (accountsWithBalance.length === 0) {
            list.innerHTML = `
                <p class="accounts-empty">
                    ${t("accounts_empty_hint")}
                </p>
            `;
        } else {
            accountsWithBalance.forEach(function(account, index) {
                const netBalance = account.income - account.expense;
                const isMain = index === 0;
                
                const item = document.createElement("div");
                item.className = "account-card";
                
                item.innerHTML = `
                    <div class="account-card-top">
                        <div class="account-avatar">
                           <i data-lucide="${escapeHTML(account.icon)}"></i>
                        </div>
                        <div class="account-card-info">
<div class="account-name">${escapeHTML(account.name)}</div>
                            ${isMain ? `
                              <div class="account-main-badge">
                                <i data-lucide="badge-check"></i>
                                                        <span>${t("main_account_badge")}</span>
                              </div>
                            ` : `
<div class="account-sub-name">${escapeHTML(account.description || "")}</div>
                            `}
                        </div>
<div class="account-card-balance">
                            <span class="account-card-balance-currency">${escapeHTML(typeof getCurrency === "function" ? getCurrency() : "EGP")}</span>
                            <span class="account-card-balance-amount">${formatAmountNumber(account.currentBalance)}</span>
                        </div>
                    </div>
                    <div class="account-divider"></div>
                    <div class="account-stats-row">
                        <div class="stat-item">
                            <div class="stat-icon stat-icon-income">
                                <i data-lucide="arrow-up-right"></i>
                            </div>
                            <div class="stat-texts">
<div class="stat-label">${t("stats_income")}</div>
                                <div class="stat-amount-row">
                                    <span class="stat-currency">${escapeHTML(typeof getCurrency === "function" ? getCurrency() : "EGP")}</span>
<span class="stat-value stat-value-income">${formatWholeAmount(account.income)}</span>
                                </div>
                            </div>
                            <svg class="stat-sparkline" viewBox="0 0 60 24" preserveAspectRatio="none">
<polyline points="${getSparklinePoints(account.id, "income", transactions)}" fill="none" stroke="#16a34a" stroke-width="2"/>                            </svg>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon stat-icon-expense">
                                <i data-lucide="arrow-down-right"></i>
                            </div>
                            <div class="stat-texts">
<div class="stat-label">${t("stats_expense")}</div>
                                <div class="stat-amount-row">
                                    <span class="stat-currency">${escapeHTML(typeof getCurrency === "function" ? getCurrency() : "EGP")}</span>
<span class="stat-value stat-value-expense">${formatWholeAmount(account.expense)}</span>
                                </div>
                            </div>
                            <svg class="stat-sparkline" viewBox="0 0 60 24" preserveAspectRatio="none">
                                <polyline points="${getSparklinePoints(account.id, "expense", transactions)}" fill="none" stroke="#dc2626" stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="stat-item stat-item-last">
                            <div class="stat-icon stat-icon-balance">
                                <i data-lucide="wallet"></i>
                            </div>
                            <div class="stat-texts">
<div class="stat-label">${t("stats_net_balance")}</div>
                                <div class="stat-amount-row">
                                    <span class="stat-currency">${escapeHTML(typeof getCurrency === "function" ? getCurrency() : "EGP")}</span>
<span class="stat-value stat-value-balance">${formatWholeAmount(netBalance)}</span>
                                </div>
                            </div>
                        </div>

                        <div class="account-corner-icon">
                            <i data-lucide="scale"></i>
                        </div>
                    </div>
                `;
                
                const incomeStat = item.querySelector(".stat-item:nth-child(1)");
                const expenseStat = item.querySelector(".stat-item:nth-child(2)");
                
                if (incomeStat) {
                    incomeStat.onclick = function(e) {
                        e.stopPropagation();
                        window.pendingAccountTransactionsAccount = account.id;
                        window.pendingAccountTransactionsType = "income";
                        navigateTo("account-transactions");
                    };
                }
                
                if (expenseStat) {
                    expenseStat.onclick = function(e) {
                        e.stopPropagation();
                        window.pendingAccountTransactionsAccount = account.id;
                        window.pendingAccountTransactionsType = "expense";
                        navigateTo("account-transactions");
                    };
                }
                const cardHeader = item.querySelector(".account-card-top");
                
                let pressTimer;
                cardHeader.addEventListener("touchstart", function() {
                    pressTimer = setTimeout(function() {
                        openAccountMenu(account.id);
                    }, 700);
                });
                cardHeader.addEventListener("touchend", function() {
                    clearTimeout(pressTimer);
                });
                cardHeader.addEventListener("touchmove", function() {
                    clearTimeout(pressTimer);
                });
                cardHeader.onclick = function(e) {
                    e.stopPropagation();
                    openAccountMenu(account.id);
                };
                
                list.appendChild(item);
            });
        }
        
        container.appendChild(list);
        
        if (window.lucide) lucide.createIcons();
    }
    
    renderAccountsPage();
}