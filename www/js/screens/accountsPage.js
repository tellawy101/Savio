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

    // ------------------------------
    // زرار الرجوع
    // ------------------------------
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
        backBtn.onclick = function () {
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
        openAddAccountBtn.onclick = function () {
            document.getElementById("addAccountModal").classList.add("show");
        };
    }

    // ------------------------------
    // حالة إضافة/تعديل الحساب (كانت accounts.js)
    // ------------------------------
    let selectedAccount = "";
    let editingAccount = null;

    const accountModal = document.getElementById("accountModal");
    const addAccountModal = document.getElementById("addAccountModal");
    const accountMenu = document.getElementById("accountMenu");
    const saveAccountBtn = document.getElementById("saveAccountBtn");
    const editAccountBtn = document.getElementById("editAccountBtn");
    const deleteAccountBtn = document.getElementById("deleteAccountBtn");
    const cancelAddAccountBtn = document.getElementById("cancelAddAccountBtn");

    const iconDropdownTrigger = document.getElementById("iconDropdownTrigger");
    const iconDropdownList = document.getElementById("iconDropdownList");
    const selectedIconLabel = document.getElementById("selectedIconLabel");
    const newAccountIconInput = document.getElementById("newAccountIcon");

    closeModalOnBackdropClick(accountModal);
    closeModalOnBackdropClick(addAccountModal);
    closeModalOnBackdropClick(accountMenu);

    attachThousandsFormatter(document.getElementById("newAccountBalance"));

    if (iconDropdownTrigger) {
        iconDropdownTrigger.onclick = function (e) {
            e.stopPropagation();
            iconDropdownList.classList.toggle("show");
        };
    }

    document.querySelectorAll(".icon-option").forEach(function (option) {
        option.onclick = function () {
            const icon = this.dataset.icon;
            const label = this.dataset.label;
            newAccountIconInput.value = icon;
            document.getElementById("selectedIconPreviewWrap").innerHTML =
                `<i data-lucide="${icon}" id="selectedIconPreview"></i>`;
            selectedIconLabel.textContent = label;
            iconDropdownList.classList.remove("show");
            if (window.lucide) lucide.createIcons();
        };
    });

    if (cancelAddAccountBtn) {
        cancelAddAccountBtn.onclick = function () {
            addAccountModal.classList.remove("show");
            editingAccount = null;
            document.getElementById("newAccountName").value = "";
            document.getElementById("newAccountDescription").value = "";
            document.getElementById("newAccountBalance").value = "";
            document.getElementById("selectedIconPreviewWrap").innerHTML =
                `<i data-lucide="wallet" id="selectedIconPreview"></i>`;
            selectedIconLabel.textContent = t("choose_icon_label");
            newAccountIconInput.value = "wallet";
            if (window.lucide) lucide.createIcons();
        };
    }

    if (saveAccountBtn) {
    saveAccountBtn.onclick = async function() {
                let name = document.getElementById("newAccountName").value.trim();
            let description = document.getElementById("newAccountDescription").value.trim();
            let icon = newAccountIconInput.value;
            let balance = document.getElementById("newAccountBalance").value.trim();
            if (balance === "") balance = "0";

            if (name === "") {
    await customAlert(t("enter_account_name_alert"));
    return;
}
            let accounts = getAccounts();
            let sameAccount = accounts.find(a => a.name.toLowerCase() === name.toLowerCase());

            if (sameAccount && (!editingAccount || sameAccount.name !== editingAccount.name)) {
                showToast(t("account_exists_toast"));
                return;
            }

            if (editingAccount) {
                let index = accounts.findIndex(a => a.name === editingAccount.name);
                accounts[index] = { name, description, icon, balance: Number(balance.replace(/,/g, "")) };
                editingAccount = null;
            } else {
                accounts.push({ name, description, icon, balance: Number(balance.replace(/,/g, "")) });
            }

            saveAccounts(accounts);

            renderAccountsPage();
            showToast(t("account_added_toast"), "success");
            addAccountModal.classList.remove("show");

            document.getElementById("newAccountName").value = "";
            document.getElementById("newAccountDescription").value = "";
            document.getElementById("newAccountBalance").value = "";
            document.getElementById("selectedIconPreviewWrap").innerHTML =
                `<i data-lucide="wallet" id="selectedIconPreview"></i>`;
            selectedIconLabel.textContent = t("choose_icon_label");
            newAccountIconInput.value = "wallet";
            if (window.lucide) lucide.createIcons();
        };
    }

    if (editAccountBtn) {
        editAccountBtn.onclick = function () {
            let accounts = getAccounts();
            editingAccount = accounts.find(a => a.name === selectedAccount);
            if (!editingAccount) return;

            document.getElementById("newAccountName").value = editingAccount.name;
            document.getElementById("newAccountDescription").value = editingAccount.description || "";
            document.getElementById("selectedIconPreviewWrap").innerHTML =
                `<i data-lucide="${editingAccount.icon}" id="selectedIconPreview"></i>`;
            const matchedOption = document.querySelector(`.icon-option[data-icon="${editingAccount.icon}"]`);
            selectedIconLabel.textContent = matchedOption ? matchedOption.dataset.label : editingAccount.icon;
            newAccountIconInput.value = editingAccount.icon;
            if (window.lucide) lucide.createIcons();

            document.getElementById("newAccountBalance").value =
                Number(editingAccount.balance).toLocaleString("en-US");

            accountMenu.classList.remove("show");
            addAccountModal.classList.add("show");
        };
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.onclick = function () {
            let accounts = getAccounts();
const deletedAccount = accounts.find(a => a.name === selectedAccount);
const deletedPosition = accounts.indexOf(deletedAccount);

accounts = accounts.filter(a => a.name !== selectedAccount);
saveAccounts(accounts);
            renderAccountsPage();
            accountMenu.classList.remove("show");

            if (deletedAccount) {
                showUndoToast(
                    typeof t === "function" ? t("account_deleted_toast") : "Account Deleted",
                    function () {
                        let currentAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
                        const insertAt = Math.min(deletedPosition, currentAccounts.length);
                        currentAccounts.splice(insertAt, 0, deletedAccount);
                        localStorage.setItem("accounts", JSON.stringify(currentAccounts));
                        renderAccountsPage();
                    }
                );
            }
        };
    }

    // ------------------------------
    // عرض قائمة الحسابات (كانت accountsPage.js)
    // ------------------------------
    window.onFormFieldChanged = renderAccountsPage;

    function getAccountActivity(accountKey, transactions) {
        let income = 0, expense = 0;
        transactions.forEach(function (tr) {
            if (tr.account !== accountKey) return;
            if (tr.type === "income") income += Number(tr.amount) || 0;
            else if (tr.type === "expense") expense += Number(tr.amount) || 0;
        });
        return { income, expense };
    }

    function renderAccountsPage() {
        const container = document.getElementById("accountsContainer");
        if (!container) return;

        const accounts = getAccounts();
        const transactions = loadTransactions();

        const accountsWithBalance = accounts.map(function (account) {
            const activity = getAccountActivity(account.name, transactions);
            const currentBalance = Number(account.balance) + activity.income - activity.expense;
            return Object.assign({}, account, activity, { currentBalance });
        });

        const totalBalance = accountsWithBalance.reduce((sum, a) => sum + a.currentBalance, 0);

        container.innerHTML = "";

        const summary = document.createElement("div");
        summary.className = "balance-card";
        summary.innerHTML = `
            <h3>Total Balance</h3>
            <h1 id="accountsTotalBalance">
                <span class="currency">EGP</span>
                <span class="amount">${Math.round(totalBalance).toLocaleString("en-US")}</span>
            </h1>
        `;
        container.appendChild(summary);

        const list = document.createElement("div");
        list.className = "accounts-list";

        // مسار روابط "الدخل/المصروف" جوه كارت الحساب - لازم يتظبط حسب مكان الصفحة
        // (فاتحة من /pages/ القديمة ولا من الراوتر جوه الهوم)
        const transactionsBase = window.location.pathname.includes("/pages/") ? "" : "pages/";

        if (accountsWithBalance.length === 0) {
            list.innerHTML = `
                <p class="accounts-empty">
                    لسه معندكش حسابات. دوس على + فوق عشان تضيف أول حساب.
                </p>
            `;
        } else {
            accountsWithBalance.forEach(function (account, index) {
                const netBalance = account.income - account.expense;
                const isMain = index === 0;

                const item = document.createElement("div");
                item.className = "account-card";

                item.innerHTML = `
                    <div class="account-card-top">
                        <div class="account-avatar">
                            <i data-lucide="${account.icon}"></i>
                        </div>
                        <div class="account-card-info">
                            <div class="account-name">${account.name}</div>
                            ${isMain ? `
                              <div class="account-main-badge">
                                <i data-lucide="badge-check"></i>
                                <span>Main Account</span>
                              </div>
                            ` : `
                              <div class="account-sub-name">${account.description || ""}</div>
                            `}
                        </div>
                        <div class="account-card-balance">
                            <div class="account-card-balance-amount">${Math.round(account.currentBalance).toLocaleString("en-US")}</div>
                            <div class="account-card-balance-currency">EGP</div>
                        </div>
                    </div>

                    <div class="account-divider"></div>

                    <div class="account-stats-row">
                        <div class="stat-item">
                            <div class="stat-icon stat-icon-income">
                                <i data-lucide="arrow-up-right"></i>
                            </div>
                            <div class="stat-texts">
                                <div class="stat-label">Income</div>
                                <div class="stat-value stat-value-income">${Math.round(account.income).toLocaleString("en-US")}</div>
                                <div class="stat-currency">EGP</div>
                            </div>
                            <svg class="stat-sparkline" viewBox="0 0 60 24" preserveAspectRatio="none">
                                <polyline points="0,20 15,16 30,14 45,8 60,4" fill="none" stroke="#16a34a" stroke-width="2"/>
                            </svg>
                        </div>

                        <div class="stat-item">
                            <div class="stat-icon stat-icon-expense">
                                <i data-lucide="arrow-down-right"></i>
                            </div>
                            <div class="stat-texts">
                                <div class="stat-label">Expense</div>
                                <div class="stat-value stat-value-expense">${Math.round(account.expense).toLocaleString("en-US")}</div>
                                <div class="stat-currency">EGP</div>
                            </div>
                            <svg class="stat-sparkline" viewBox="0 0 60 24" preserveAspectRatio="none">
                                <polyline points="0,4 15,8 30,10 45,16 60,20" fill="none" stroke="#dc2626" stroke-width="2"/>
                            </svg>
                        </div>

                        <div class="stat-item stat-item-last">
                            <div class="stat-icon stat-icon-balance">
                                <i data-lucide="wallet"></i>
                            </div>
                            <div class="stat-texts">
                                <div class="stat-label">Net Balance</div>
                                <div class="stat-value stat-value-balance">${Math.round(netBalance).toLocaleString("en-US")}</div>
                                <div class="stat-currency">EGP</div>
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
        window.pendingAccountTransactionsAccount = account.name;
        window.pendingAccountTransactionsType = "income";
        navigateTo("account-transactions");
    };
}

if (expenseStat) {
    expenseStat.onclick = function(e) {
        e.stopPropagation();
        window.pendingAccountTransactionsAccount = account.name;
        window.pendingAccountTransactionsType = "expense";
        navigateTo("account-transactions");
    };
}
             const cardHeader = item.querySelector(".account-card-top");

let pressTimer;
cardHeader.addEventListener("touchstart", function() {
            pressTimer = setTimeout(function() {
                        selectedAccount = account.name;
                        document.getElementById("accountMenu").classList.add("show");
                    }, 700);
                });
                cardHeader.addEventListener("touchend", function() {
    clearTimeout(pressTimer);
});
cardHeader.addEventListener("touchmove", function() {
    clearTimeout(pressTimer);
});
                cardHeader.onclick = function (e) {
                    e.stopPropagation();
                    selectedAccount = account.name;
                    document.getElementById("accountMenu").classList.add("show");
                };

                list.appendChild(item);
            });
        }

        container.appendChild(list);

        if (window.lucide) lucide.createIcons();
    }

    renderAccountsPage();
}