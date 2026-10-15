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
                        resetAddAccountForm();
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
    function resetAddAccountForm() {
        editingAccount = null;
        document.getElementById("newAccountName").value = "";
        document.getElementById("newAccountDescription").value = "";
        document.getElementById("newAccountBalance").value = "";
        document.getElementById("selectedIconPreviewWrap").innerHTML =
            `<i data-lucide="wallet" id="selectedIconPreview"></i>`;
        selectedIconLabel.textContent = t("choose_icon_label");
        newAccountIconInput.value = "wallet";
        if (window.lucide) lucide.createIcons();
    }
    closeModalOnBackdropClick(accountModal);
    closeModalOnBackdropClick(addAccountModal);
    closeModalOnBackdropClick(accountMenu);

attachThousandsFormatter(document.getElementById("newAccountBalance"), true);

    const iconSearchInput = document.getElementById("iconSearchInput");
const iconDropdownHome = iconDropdownTrigger ? iconDropdownTrigger.parentElement : null;

if (iconDropdownTrigger) {
    iconDropdownTrigger.onclick = function(e) {
        e.stopPropagation();
        const isOpen = iconDropdownList.classList.contains("show");
        if (!isOpen) {
            if (document.activeElement) document.activeElement.blur();
            document.body.appendChild(iconDropdownList);
            iconDropdownList.classList.add("show");
            if (iconSearchInput) iconSearchInput.value = "";
            filterAccountIcons("");
        } else {
            iconDropdownList.classList.remove("show");
            if (iconDropdownHome) iconDropdownHome.appendChild(iconDropdownList);
        }
    };
}

if (iconSearchInput) {
    iconSearchInput.addEventListener("input", function() {
        filterAccountIcons(this.value);
    });
    iconSearchInput.addEventListener("click", function(e) {
        e.stopPropagation();
    });
}
if (window._accountsPageIconCloseHandler) {
    document.removeEventListener("click", window._accountsPageIconCloseHandler);
}
window._accountsPageIconCloseHandler = function(e) {
    if (iconDropdownList.classList.contains("show") && !iconDropdownList.contains(e.target) && e.target !== iconDropdownTrigger) {
        iconDropdownList.classList.remove("show");
        if (iconDropdownHome) iconDropdownHome.appendChild(iconDropdownList);
    }
};
document.addEventListener("click", window._accountsPageIconCloseHandler);
    document.querySelectorAll(".icon-option").forEach(function (option) {
        option.onclick = function () {
            const icon = this.dataset.icon;
            const label = this.dataset.label;
            newAccountIconInput.value = icon;
            document.getElementById("selectedIconPreviewWrap").innerHTML =
            `<i data-lucide="${escapeHTML(icon)}" id="selectedIconPreview"></i>`;
            selectedIconLabel.textContent = label;
iconDropdownList.classList.remove("show");
if (iconDropdownHome) iconDropdownHome.appendChild(iconDropdownList);
if (window.lucide) lucide.createIcons();
        };
    });

    if (cancelAddAccountBtn) {
    cancelAddAccountBtn.onclick = function () {
        // نطلب الرجوع خطوة للخلف كأنك ضغطت زر الرجوع في الهاتف بالضبط
        history.back();
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

            if (sameAccount && (!editingAccount || sameAccount.id !== editingAccount.id)) {
                showToast(t("account_exists_toast"));
                return;
            }

                        if (editingAccount) {
                let index = accounts.findIndex(a => a.id === editingAccount.id);
                accounts[index] = { id: editingAccount.id, name, description, icon, balance: Number(balance.replace(/,/g, "")) };
                editingAccount = null;
            } else {
                accounts.push({ id: generateId("acc"), name, description, icon, balance: Number(balance.replace(/,/g, "")) });
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
            editingAccount = accounts.find(a => a.id === selectedAccount);
            if (!editingAccount) return;

            document.getElementById("newAccountName").value = editingAccount.name;
            document.getElementById("newAccountDescription").value = editingAccount.description || "";
            document.getElementById("selectedIconPreviewWrap").innerHTML =
              `<i data-lucide="${escapeHTML(editingAccount.icon)}" id="selectedIconPreview"></i>`;
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
    const setMainAccountBtn = document.getElementById("setMainAccountBtn");

    if (setMainAccountBtn) {
        setMainAccountBtn.onclick = function () {
            let accounts = getAccounts();
            const index = accounts.findIndex(a => a.id === selectedAccount);
            if (index > 0) {
                const mainAccount = accounts.splice(index, 1)[0];
                accounts.unshift(mainAccount);
                saveAccounts(accounts);
                renderAccountsPage();
            }
            accountMenu.classList.remove("show");
        };
    }
    if (deleteAccountBtn) {
        deleteAccountBtn.onclick = async function() {
                                const linkedTxCount = loadTransactions().filter(function(tx) {
                return getTxAccountId(tx) === selectedAccount;
            }).length;
            const deleteMessage = linkedTxCount > 0 ? t("account_delete_has_tx_confirm") : t("delete_confirm");
            if (!(await customConfirm(deleteMessage, { danger: true }))) return;
            let accounts = getAccounts();
const deletedAccount = accounts.find(a => a.id === selectedAccount);
const deletedPosition = accounts.indexOf(deletedAccount);

accounts = accounts.filter(a => a.id !== selectedAccount);
saveAccounts(accounts);
            renderAccountsPage();
            accountMenu.classList.remove("show");

            if (deletedAccount) {
                showUndoToast(
    typeof t === "function" ? t("account_deleted_toast") : "Account Deleted",
    function () {
        let currentAccounts = getAccounts();
        const insertAt = Math.min(deletedPosition, currentAccounts.length);
        currentAccounts.splice(insertAt, 0, deletedAccount);
        saveAccounts(currentAccounts);
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

    function getAccountActivity(accountKey, transactions, from, to) {
        let income = 0, expense = 0;
        transactions.forEach(function (tr) {
            if (getTxAccountId(tr) !== accountKey) return;
            // التحويلات مش دخل ولا مصروف حقيقي، فمش بتتعد هنا
            if (tr.isTransfer) return;
            if (from && to) {
    const d = (tr.date || "").slice(0, 10);
    if (d < from || d > to) return;
}
            if (tr.type === "income") income += Number(tr.amount) || 0;
            else if (tr.type === "expense") expense += Number(tr.amount) || 0;
        });
        return { income, expense };
    }
        // ---- تقرير الفترة ----
    let reportPeriod = "all";
    let reportFrom = "";
    let reportTo = "";

    function pad2(n) { return String(n).padStart(2, "0"); }
    function toISO(d) {
        return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
    }

    function getPeriodRange(period) {
        const now = new Date();
        const y = now.getFullYear(), m = now.getMonth();
        if (period === "this_month") return { from: toISO(new Date(y, m, 1)), to: toISO(new Date(y, m + 1, 0)) };
        if (period === "last_month") return { from: toISO(new Date(y, m - 1, 1)), to: toISO(new Date(y, m, 0)) };
        if (period === "this_year") return { from: y + "-01-01", to: y + "-12-31" };
        if (period === "last_year") return { from: (y - 1) + "-01-01", to: (y - 1) + "-12-31" };
        if (period === "all") return { from: "0000-01-01", to: "9999-12-31" };
return { from: reportFrom, to: reportTo };
        return { from: reportFrom, to: reportTo };
    }

    function getPeriodTotals(transactions, from, to) {
        let income = 0, expense = 0;
        if (!from || !to) return { income, expense };
        transactions.forEach(function (tr) {
            if (!tr.date || tr.isTransfer) return;
            const d = tr.date.slice(0, 10);
            if (d < from || d > to) return;
            if (tr.type === "income") income += Number(tr.amount) || 0;
            else if (tr.type === "expense") expense += Number(tr.amount) || 0;
        });
        return { income, expense };
    }

    function renderPeriodReport(container, transactions) {
        const periods = [
    ["all", "report_all"],  
            ["this_month", "report_this_month"],
            ["last_month", "report_last_month"],
            ["this_year", "report_this_year"],
            ["last_year", "report_last_year"],
            ["custom", "report_custom"]
        ];
        const range = getPeriodRange(reportPeriod);
        const totals = getPeriodTotals(transactions, range.from, range.to);
        const net = totals.income - totals.expense;
        const cur = escapeHTML(getCurrency());
        const fmt = function (v) { return Math.round(v).toLocaleString("en-US"); };
const total = totals.income + totals.expense;
const incPct = total > 0 ? Math.round((totals.income / total) * 100) : 0;
const netCls = net < 0 ? "period-expense" : "period-income";
const rangeLabel = (reportPeriod !== "all" && range.from && range.to) ? range.from + "  →  " + range.to : "";
        const card = document.createElement("div");
        card.className = "period-report";
        card.innerHTML = `
            <div class="period-chips">
                ${periods.map(function (p) {
                    return `<button type="button" class="period-chip ${reportPeriod === p[0] ? "active" : ""}" data-period="${p[0]}">${t(p[1])}</button>`;
                }).join("")}
            </div>
            ${reportPeriod === "custom" ? `
                <div class="period-custom">
                    <label>${t("report_from")}<input type="date" id="reportFrom" value="${reportFrom}"></label>
                    <label>${t("report_to")}<input type="date" id="reportTo" value="${reportTo}"></label>
                </div>` : ""}
            <div class="period-range">${rangeLabel}</div>
<div class="period-net">
    <span class="period-label">${t("stats_net_balance")}</span>
    <span class="period-net-value ${netCls}">${cur} ${fmt(net)}</span>
</div>
<div class="period-bar ${total === 0 ? "empty" : ""}"><span style="width:${incPct}%"></span></div>
<div class="period-totals">
    <div class="period-item">
        <span class="period-label">${t("stats_income")}</span>
        <span class="period-value period-income">${cur} ${fmt(totals.income)}</span>
    </div>
    <div class="period-item">
        <span class="period-label">${t("stats_expense")}</span>
        <span class="period-value period-expense">${cur} ${fmt(totals.expense)}</span>
    </div>
</div>
        `;

        card.querySelectorAll(".period-chip").forEach(function (btn) {
            btn.onclick = function () {
                reportPeriod = btn.dataset.period;
                renderAccountsPage();
            };
        });
        const fromInput = card.querySelector("#reportFrom");
        const toInput = card.querySelector("#reportTo");
        if (fromInput) fromInput.onchange = function () { reportFrom = fromInput.value; renderAccountsPage(); };
        if (toInput) toInput.onchange = function () { reportTo = toInput.value; renderAccountsPage(); };

        container.appendChild(card);
    }
    function getSparklinePoints(accountKey, type, transactions) {
        const MONTHS = 5;
        const now = new Date();
        const keys = [];
        for (let i = MONTHS - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            keys.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"));
        }
        const sums = keys.map(function () { return 0; });
        transactions.forEach(function (tr) {
if (getTxAccountId(tr) !== accountKey || tr.type !== type || !tr.date || tr.isTransfer) return;
            const idx = keys.indexOf(tr.date.slice(0, 7));
            if (idx !== -1) sums[idx] += Number(tr.amount) || 0;
        });
        const max = Math.max.apply(null, sums);
        return sums.map(function (v, i) {
            const y = max > 0 ? 22 - (v / max) * 20 : 22;
            return (i * 15) + "," + y.toFixed(1);
        }).join(" ");
    }

    function renderAccountsPage() {
        const container = document.getElementById("accountsContainer");
        if (!container) return;

        const accounts = getAccounts();
        const transactions = loadTransactions();

        const accountsWithBalance = accounts.map(function (account) {
const range = getPeriodRange(reportPeriod);
const activity = getAccountActivity(account.id, transactions, range.from, range.to);
const currentBalance = calculateAccountBalance(account, transactions);
            return Object.assign({}, account, activity, { currentBalance });
        });

        const totalBalance = accountsWithBalance.reduce((sum, a) => sum + a.currentBalance, 0);

        container.innerHTML = "";

        const summary = document.createElement("div");
        summary.className = "balance-card";
        summary.innerHTML = `
<h3>${t("total_balance")}</h3>
<h1>
<span class="currency">${escapeHTML(getCurrency())}</span>
                                <span class="amount">${formatAmountNumber(totalBalance)}</span>
            </h1>
        `;
        container.appendChild(summary);
        renderPeriodReport(container, transactions);
        const list = document.createElement("div");
        list.className = "accounts-list";

        if (accountsWithBalance.length === 0) {
            list.innerHTML = `
                <p class="accounts-empty">
                    ${t("accounts_empty_hint")}
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
                                    <span class="stat-value stat-value-income">${Math.round(account.income).toLocaleString("en-US")}</span>
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
                                    <span class="stat-value stat-value-expense">${Math.round(account.expense).toLocaleString("en-US")}</span>
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
                                    <span class="stat-value stat-value-balance">${Math.round(netBalance).toLocaleString("en-US")}</span>
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
                        selectedAccount = account.id;
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
                    selectedAccount = account.id;
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