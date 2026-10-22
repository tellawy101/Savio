// =========================
// components.js
// مكان موحد للأجزاء المتكررة بين الصفحات (DRY)
// ============================

// 1) بناء الـ Bottom Navigation حسب الصفحة الحالية

if (
    window.Capacitor &&
    window.Capacitor.isNativePlatform()
) {
    document.body.classList.add('capacitor-app');
}
function renderBottomNav(activePage) {
   // activePage تكون: 'home' | 'debts' | 'statistics' | 'accounts' | 'settings'
   
    const isHome = activePage === 'home';

    return `
<nav class="bottom-nav test-bottom ${isHome ? '' : 'no-fab'}">
    <button class="nav-item ${activePage === 'home' ? 'active' : ''}" data-page="home">
    <span class="nav-icon"><i data-lucide="home"></i></span>
    <span class="nav-label" data-i18n="nav_home">Home</span>
</button>

<button class="nav-item ${activePage === 'debts' ? 'active' : ''}" data-page="debts">
    <span class="nav-icon"><i data-lucide="hand-coins"></i></span>
    <span class="nav-label" data-i18n="nav_debts">Debts</span>
</button>

<button class="nav-item ${activePage === 'statistics' ? 'active' : ''}" data-page="statistics">
    <span class="nav-icon"><i data-lucide="chart-no-axes-combined"></i></span>
    <span class="nav-label" data-i18n="nav_stats">Statistics</span>
</button>

${ isHome ? `
<button id="addMenuBtn" class="fab-nav">
    <i data-lucide="plus"></i>
</button>
` : '' }

<button class="nav-item ${activePage === 'accounts' ? 'active' : ''}" data-page="accounts">
    <span class="nav-icon"><i data-lucide="wallet"></i></span>
    <span class="nav-label" data-i18n="nav_accounts">Accounts</span>
</button>

<button class="nav-item ${activePage === 'settings' ? 'active' : ''}" data-page="settings">
    <span class="nav-icon"><i data-lucide="settings"></i></span>
    <span class="nav-label" data-i18n="nav_settings">Settings</span>
</button>
</nav>
    `;
}
// 3) تفعيل أيقونات lucide (موحدة)
function initIcons() {
    if (!window.lucide) return;
    lucide.createIcons();

    // عشان أي createIcons() تاني من الصفحات ما يعيد بنائها ويقطع الأنيميشن
    document.querySelectorAll('.bottom-nav .nav-icon svg[data-lucide]')
        .forEach(svg => svg.removeAttribute('data-lucide'));
}

// 4) تجهيز الـ nav بعد إضافتها للصفحة (أيقونات + روابط الأزرار)
function setupBottomNav(basePath = '') {
    initIcons();



    document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    btn.addEventListener('click', function() {
        const page = this.dataset.page;
        
       // أي صفحة اتسجلت في الراوتر (SPA) - تفتح من غير Reload
if (typeof ROUTES !== 'undefined' && ROUTES[page] && typeof navigateTo === 'function' && document.getElementById('app')) {
            const nav = this.closest('.bottom-nav');
            const current = nav ? nav.querySelector('.nav-item.active') : null;
            if (current && current !== this) current.classList.remove('active');
            this.classList.add('active');
            navigateTo(page);
            return;
        }
    });
});
}
// 5) المودالز المشتركة بين صفحتي Expense و Income (Accounts + Categories)
function renderSharedModals() {
    return `
    <div id="accountModal" class="modal">
        <div class="modal-content">
            <h2 data-i18n="accounts_title">Accounts</h2>
            <div id="accountsList"></div>
            <button id="addAccountBtn" data-i18n="add_account_btn">
                + Add Account
            </button>
        </div>
    </div>

    <div id="addAccountModal" class="modal">
        <div class="modal-content">
            <h2 data-i18n="new_account_title">New Account</h2>
            <input
                type="text"
                id="newAccountName"
                class="form-input"
                placeholder="Account name" data-i18n-placeholder="account_name_placeholder">
                
               <input
    type="text"
    id="newAccountDescription"
    class="form-input"
    placeholder="Description (optional)" data-i18n-placeholder="account_description_placeholder">
                
<div class="icon-dropdown" id="iconDropdown">
    <button type="button" class="icon-dropdown-trigger" id="iconDropdownTrigger">
        <span id="selectedIconPreviewWrap"><i data-lucide="wallet" id="selectedIconPreview"></i></span>
        <span id="selectedIconLabel" data-i18n="choose_icon_label">اختر أيقونة</span>
        <i data-lucide="chevron-right"></i>
    </button>
    <div class="icon-dropdown-list" id="iconDropdownList">
        <div class="icon-search-wrap">
            <input
                type="text"
                id="iconSearchInput"
                class="icon-search-input"
                placeholder="Search icon..." data-i18n-placeholder="icon_search_placeholder">
        </div>
        <div class="icon-option" data-icon="wallet" data-label="Wallet">
            <i data-lucide="wallet"></i><span>Wallet</span>
        </div>
        <div class="icon-option" data-icon="credit-card" data-label="Bank Card">
            <i data-lucide="credit-card"></i><span>Bank Card</span>
        </div>
        <div class="icon-option" data-icon="banknote" data-label="Cash">
            <i data-lucide="banknote"></i><span>Cash</span>
        </div>
        <div class="icon-option" data-icon="landmark" data-label="Bank">
            <i data-lucide="landmark"></i><span>Bank</span>
        </div>
        <div class="icon-option" data-icon="piggy-bank" data-label="Savings">
            <i data-lucide="piggy-bank"></i><span>Savings</span>
        </div>
<div class="icon-option" data-icon="trending-up" data-label="Investment">
            <i data-lucide="trending-up"></i><span>Investment</span>
        </div>
        <div class="icon-option" data-icon="briefcase" data-label="Business">
            <i data-lucide="briefcase"></i><span>Business</span>
        </div>
        <div class="icon-option" data-icon="target" data-label="Goal">
            <i data-lucide="target"></i><span>Goal</span>
        </div>
        <div class="icon-option" data-icon="vault" data-label="Vault">
            <i data-lucide="vault"></i><span>Vault</span>
        </div>
        <div class="icon-option" data-icon="coins" data-label="Coins">
            <i data-lucide="coins"></i><span>Coins</span>
        </div>
        <div class="icon-option" data-icon="circle-dollar-sign" data-label="Dollar">
            <i data-lucide="circle-dollar-sign"></i><span>Dollar</span>
        </div>
        <div class="icon-option" data-icon="gem" data-label="Gem">
            <i data-lucide="gem"></i><span>Gem</span>
        </div>
        <div class="icon-option" data-icon="smartphone" data-label="Mobile Wallet">
            <i data-lucide="smartphone"></i><span>Mobile Wallet</span>
        </div>
        <div class="icon-option" data-icon="building-2" data-label="Company">
            <i data-lucide="building-2"></i><span>Company</span>
        </div>
        <div class="icon-option" data-icon="shield-check" data-label="Insurance">
            <i data-lucide="shield-check"></i><span>Insurance</span>
        </div>
<div class="icon-option" data-icon="gift" data-label="Gift">
            <i data-lucide="gift"></i><span>Gift</span>
        </div>
    </div>
</div>
<input type="hidden" id="newAccountIcon" value="wallet">
           <input
                type="tel"
                id="newAccountBalance"
                class="form-input"
                placeholder="Initial Balance" data-i18n-placeholder="initial_balance_placeholder">
            <div class="modal-actions">
    <button id="cancelAddAccountBtn" class="account-cancel-btn" data-i18n="cancel">
    Cancel
</button>
<button id="saveAccountBtn" class="account-save-btn" data-i18n="save">
    Save
</button>
</div>
        </div>
    </div>

    <div id="categoryModal" class="modal">
        <div class="modal-content">
            <h2 data-i18n="categories_title">Categories</h2>
            <div id="categoriesList"></div>
            <button id="addCategoryBtn" data-i18n="add_category_btn">
    + Add Category
</button>
        </div>
    </div>

<div id="addCategoryModal" class="modal">
    <div class="modal-content">

        <h2 data-i18n="new_category_title">New Category</h2>

        <input
            type="text"
            id="newCategoryName"
            class="form-input"
            placeholder="Category name" data-i18n-placeholder="category_name_placeholder">

        <!-- Category Icon Picker -->
        <div class="icon-dropdown" id="categoryIconDropdown">

            <button
                type="button"
                class="icon-dropdown-trigger"
                id="categoryIconDropdownTrigger">

                <span id="selectedCategoryIconPreviewWrap">
                    <i data-lucide="tag" id="selectedCategoryIconPreview"></i>
                </span>

                <span id="selectedCategoryIconLabel" data-i18n="choose_icon_label">
    Choose Icon
</span>

                <i data-lucide="chevron-right"></i>

            </button>

            <div
                class="icon-dropdown-list"
                id="categoryIconDropdownList">

                <div class="icon-search-wrap">
                    <input
                        type="text"
                        id="categoryIconSearchInput"
                        class="icon-search-input"
                        placeholder="Search any icon (English)..." data-i18n-placeholder="icon_search_placeholder">
                </div>

                <div id="categoryIconResults"></div>

            </div>
        </div>

        <input
            type="hidden"
            id="newCategoryIcon"
            value="tag">

        <button
    id="saveCategoryBtn"
    class="account-save-btn"
    data-i18n="save">
    Save
</button>

    </div>
</div>

    <div id="accountMenu" class="modal">
        <div class="modal-content">
<button id="editAccountBtn"><i data-lucide="pencil"></i> <span data-i18n="menu_edit">Edit</span></button>
                        <button id="setMainAccountBtn" data-i18n="set_main_account_btn"><i data-lucide="badge-check"></i> Set as Main</button>
<button id="deleteAccountBtn"><i data-lucide="trash-2"></i> <span data-i18n="menu_delete">Delete</span></button>
        </div>
    </div>
    <div id="categoryMenu" class="modal">
        <div class="modal-content">
            <button id="editCategoryBtn"><i data-lucide="pencil"></i> <span data-i18n="menu_edit">Edit</span></button>
            <button id="deleteCategoryBtn"><i data-lucide="trash-2"></i> <span data-i18n="menu_delete">Delete</span></button>
        </div>
    </div>
    <div id="noAccountsModal" class="modal">
        <div class="modal-content" style="text-align:center;">
            <div style="width:56px;height:56px;border-radius:50%;background:#F3F4F6;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
                <i data-lucide="wallet-cards"></i>
            </div>
            <h2 id="noAccountsTitle">Add Accounts First</h2>
            <p id="noAccountsMessage" style="color:#777;font-size:14px;margin:8px 0 18px;">
                You need at least two accounts to make a transfer.
            </p>
            <div class="modal-actions">
                <button id="noAccountsCancelBtn" class="account-cancel-btn">Cancel</button>
                <button id="noAccountsAddBtn" class="account-save-btn">+ Add Account</button>
            </div>
      </div>
    </div>
    `;
}

// بتقفل رسالة التأكيد/التنبيه المفتوحة (زي ما لو المستخدم داس Cancel)
// بنستخدمها من زر الرجوع عشان الكود اللي مستني الرسالة يكمّل بدل ما يفضل معلّق
let dismissCustomDialog = null;

function customConfirm(message, options) {
    options = options || {};
    return new Promise(function(resolve) {
        const modal = document.getElementById("customConfirmModal");
        const msgEl = document.getElementById("customConfirmMessage");
        const okBtn = document.getElementById("customConfirmOkBtn");
        const cancelBtn = document.getElementById("customConfirmCancelBtn");
        
        if (!modal || !msgEl || !okBtn || !cancelBtn) {
            resolve(window.confirm(message));
            return;
        }
        
        msgEl.textContent = message;
        okBtn.className = "custom-confirm-ok-btn" + (options.danger ? " danger" : "");
        // زرار Cancel لازم يظهر دايماً (ممكن يكون اتخفى من customAlert قبل كده)
        cancelBtn.style.display = "";
        modal.classList.add("show");
        
        function cleanup(result) {
            modal.classList.remove("show");
            okBtn.onclick = null;
            cancelBtn.onclick = null;
            dismissCustomDialog = null;
            resolve(result);
        }
        
        okBtn.onclick = function() { cleanup(true); };
        cancelBtn.onclick = function() { cleanup(false); };
        dismissCustomDialog = function() { cleanup(false); };
    });
}

function customAlert(message) {
    return new Promise(function(resolve) {
        const modal = document.getElementById("customConfirmModal");
        const msgEl = document.getElementById("customConfirmMessage");
        const okBtn = document.getElementById("customConfirmOkBtn");
        const cancelBtn = document.getElementById("customConfirmCancelBtn");
        
        if (!modal || !msgEl || !okBtn || !cancelBtn) {
            window.alert(message);
            resolve();
            return;
        }
        
        msgEl.textContent = message;
        okBtn.className = "custom-confirm-ok-btn";
        cancelBtn.style.display = "none";
        modal.classList.add("show");
        
        function cleanup() {
            modal.classList.remove("show");
            cancelBtn.style.display = "";
            okBtn.onclick = null;
            dismissCustomDialog = null;
            resolve();
        }
        
        okBtn.onclick = cleanup;
        dismissCustomDialog = cleanup;
    });
}
// بيفتح مودال "محتاج تعمل حسابين" برسالة تختلف حسب عدد الحسابات الموجود

// existingAccountsCount = عدد الحسابات الحالي (0 أو 1)
function showNoAccountsModal(existingAccountsCount) {
    const modal = document.getElementById("noAccountsModal");
    const title = document.getElementById("noAccountsTitle");
    const message = document.getElementById("noAccountsMessage");

    if (!modal) return;

    if (existingAccountsCount === 0) {
title.textContent = t("need_two_accounts_title");
        message.textContent = t("need_two_accounts_msg");
    } else {
        title.textContent = t("need_one_more_title");
        message.textContent = t("need_one_more_msg");
    }
    modal.classList.add("show");

closeModalOnBackdropClick(modal);

document.getElementById("noAccountsCancelBtn").onclick = function() {
        modal.classList.remove("show");
    };

    document.getElementById("noAccountsAddBtn").onclick = function() {
    modal.classList.remove("show");
    navigateTo("accounts");
};
}
// 6) دالة capitalize موحدة (تستخدمها transactionForm.js كمان)
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// 7) بناء فورم الـ Income / Expense (نفس الشكل، بيتفرق بس بالـ type)
// 7) هيدر موحد (زرار رجوع + عنوان + زرار حفظ) لأي صفحة فورم - Income/Expense/Transfer
function renderFormHeader(type, titleText, saveBtnContent) {
    const titleKey = type + "_title";
    return `
<header class="${type}-header">
    <button id="${type}BackBtn" class="back-btn">←</button>
    <h1 data-i18n="${titleKey}">${titleText}</h1>
    <button id="save${capitalize(type)}Btn" class="save-btn">${saveBtnContent}</button>
</header>
    `;
}

// 7.1) بناء فورم الـ Income / Expense (نفس الشكل، بيتفرق بس بالـ type)
// حقول فورم الـ Income / Expense بس (من غير هيدر) - قابلة لإعادة الاستخدام
function renderTransactionFields(type) {
    return `
<div class="form-group">
    <label data-i18n="account_label">Account</label>
    <div class="account-select-box">
        <span class="account-icon" id="${type}AccountIcon"><i data-lucide="credit-card"></i></span>
        <div id="${type}Account" class="account-select" data-i18n="select_account">Select Account</div>
        <span class="account-arrow">›</span>
    </div>
</div>

<div class="form-group">
    <label data-i18n="category_label">Category</label>
    <div class="category-select-box">
        <span class="category-icon" id="${type}CategoryIcon"><i data-lucide="tag"></i></span>
        <div id="${type}Category" class="category-select" data-i18n="select_category">Select Category</div>
        <span class="category-arrow">›</span>
    </div>
</div>

<div class="form-group">
    <label data-i18n="description_label">Description</label>
    <div class="description-box">
        <input type="text" id="${type}Description" class="description-input" placeholder="Write a note" data-i18n-placeholder="note_placeholder">
    </div>
</div>

<div class="form-group">
    <label data-i18n="date_label">Date</label>
    <div class="description-box">
        <div class="date-wrap">
            <input type="text" id="${type}DateText" class="description-input date-visible" readonly>
            <input type="date" id="${type}Date" class="date-native">
        </div>
    </div>
</div>
    `;
}

// هيدر + الحقول مع بعض (زي الأول بالظبط) - بتستخدم الدالة اللي فوق جواها
function renderTransactionForm(type) {
    return `
${renderFormHeader(type, capitalize(type), '<i data-lucide="check"></i>')}

<main class="${type}-content">

<div class="amount-section">
    <div class="amount-display">
<span class="currency">${escapeHTML(getCurrency())}</span>
        <input type="tel" id="${type}Amount" inputmode="numeric" value="0">
    </div>
</div>

${renderTransactionFields(type)}

</main>
    `;
}

// حقول فورم الـ Transfer بس (من غير هيدر) - قابلة لإعادة الاستخدام
// حقول فورم الـ Transfer بس
function renderTransferFields() {
    return `
<div class="form-group">
<label data-i18n="transfer_from_label">From Account</label>
    <div class="account-select-box">
        <span class="account-icon">💳</span>
        <div id="transferFromAccount" class="account-select" data-i18n="select_account">Select Account</div>
        <span class="account-arrow">›</span>
    </div>
</div>

<div class="transfer-swap-row">
    <button id="swapAccountsBtn" type="button" class="swap-accounts-btn">
        <i data-lucide="arrow-down-up"></i>
    </button>
</div>

<div class="form-group">
<label data-i18n="transfer_to_label">To Account</label>
    <div class="account-select-box">
        <span class="account-icon">💳</span>
        <div id="transferToAccount" class="account-select" data-i18n="select_account">Select Account</div>
        <span class="account-arrow">›</span>
    </div>
</div>

<div class="form-group">
    <label data-i18n="description_label">Description</label>
    <div class="description-box">
        <input type="text" id="transferDescription" class="description-input" placeholder="Write a note" data-i18n-placeholder="note_placeholder">
    </div>
</div>

<div class="form-group">
    <label data-i18n="date_label">Date</label>
    <div class="description-box">
        <input type="date" id="transferDate" class="description-input">
    </div>
</div>
    `;
}
function renderTransferForm() {
    return `
${renderFormHeader("transfer", "Transfer", '<i data-lucide="check"></i>')}

<main class="transfer-content">
<div class="amount-section">
    <div class="amount-display">
<span class="currency">${escapeHTML(getCurrency())}</span>
        <input type="tel" id="transferAmount" inputmode="numeric" value="0">
    </div>
</div>
${renderTransferFields()}
</main>
    `;
}

// 7.4) كارت تقرير الفترة (الكل / الشهر ده / ...) - مشترك بين الرئيسية والحسابات
function periodPad2(n) { return String(n).padStart(2, "0"); }
function periodToISO(d) {
    return d.getFullYear() + "-" + periodPad2(d.getMonth() + 1) + "-" + periodPad2(d.getDate());
}

function getPeriodRangeFor(period, customFrom, customTo) {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    if (period === "this_month") return { from: periodToISO(new Date(y, m, 1)), to: periodToISO(new Date(y, m + 1, 0)) };
    if (period === "last_month") return { from: periodToISO(new Date(y, m - 1, 1)), to: periodToISO(new Date(y, m, 0)) };
    if (period === "this_year") return { from: y + "-01-01", to: y + "-12-31" };
    if (period === "last_year") return { from: (y - 1) + "-01-01", to: (y - 1) + "-12-31" };
    if (period === "all") return { from: "0000-01-01", to: "9999-12-31" };
    return { from: customFrom, to: customTo };
}

function getPeriodTotalsFor(transactions, from, to) {
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

// state = { period, from, to } (بيتعدل جواها مباشرة) / onChange بتتنادى بعد أي تغيير
function buildPeriodReportCard(state, transactions, onChange) {
    const periods = [
        ["all", "report_all"],
        ["this_month", "report_this_month"],
        ["last_month", "report_last_month"],
        ["this_year", "report_this_year"],
        ["last_year", "report_last_year"],
        ["custom", "report_custom"]
    ];
    const range = getPeriodRangeFor(state.period, state.from, state.to);
    const totals = getPeriodTotalsFor(transactions, range.from, range.to);
    const net = totals.income - totals.expense;
    const cur = escapeHTML(getCurrency());
    const fmt = function (v) { return Math.round(v).toLocaleString("en-US"); };
    const total = totals.income + totals.expense;
    const incPct = total > 0 ? Math.round((totals.income / total) * 100) : 0;
    const netCls = net < 0 ? "period-expense" : "period-income";
    const rangeLabel = (state.period !== "all" && range.from && range.to) ? range.from + "  →  " + range.to : "";

    const card = document.createElement("div");
    card.className = "period-report";
    card.innerHTML = `
        <div class="period-chips">
            ${periods.map(function (p) {
                return `<button type="button" class="period-chip ${state.period === p[0] ? "active" : ""}" data-period="${p[0]}">${t(p[1])}</button>`;
            }).join("")}
        </div>
        ${state.period === "custom" ? `
            <div class="period-custom">
                <label>${t("report_from")}<input type="date" id="reportFrom" value="${state.from}"></label>
                <label>${t("report_to")}<input type="date" id="reportTo" value="${state.to}"></label>
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

        const chipsEl = card.querySelector(".period-chips");
    if (state.chipsScroll) {
        requestAnimationFrame(function() { chipsEl.scrollLeft = state.chipsScroll; });
    }
    card.querySelectorAll(".period-chip").forEach(function(btn) {
        btn.onclick = function() {
            state.period = btn.dataset.period;
            state.chipsScroll = chipsEl.scrollLeft;
            onChange();
        };
    });
    const fromInput = card.querySelector("#reportFrom");
    const toInput = card.querySelector("#reportTo");
    if (fromInput) fromInput.onchange = function () { state.from = fromInput.value; onChange(); };
    if (toInput) toInput.onchange = function () { state.to = toInput.value; onChange(); };
    return card;
}
// 8) إغلاق أي مودال لما يتم الضغط برّه (خارج المحتوى) - نمط متكرر في كل المودالز
function closeModalOnBackdropClick(modal, onClose) {
    if (!modal) return;
    modal.onclick = function (e) {
        if (e.target === modal) {
            const openIconList = document.querySelector(".icon-dropdown-list.show");
            if (openIconList) {
                openIconList.classList.remove("show");
                return;
            }
            modal.classList.remove("show");
            if (typeof onClose === "function") onClose();
        }
    };
}

// ==============================
// Shared List Item (Icon + Title + Arrow)
// دالة مشتركة لبناء شكل الكارت في ليستة الحسابات/التصنيفات
// ==============================
function renderListItemHTML(icon, name, extraHTML) {
    return `
   <div class="account-item-icon"><i data-lucide="${escapeHTML(icon)}"></i></div>
    <div class="account-info">
        <div class="account-name">${escapeHTML(name)}</div>
        ${extraHTML || ""}
    </div>
    <div class="account-arrow">›</div>
`;
}

// ==========================================
// Reusable Component: Swipe Actions (DRY)
// تفعيل السحب لليمين واليسار (حذف / تعديل) على أي كارت
// ==========================================
function attachSwipeActions(cardElement, options) {
    if (!cardElement) return;

    const deleteBtn = options.deleteEl;
    const editBtn = options.editEl;
    const maxOffset = options.maxOffset || 70;
    const threshold = options.threshold || 45;

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let offsetX = 0;

    cardElement.addEventListener("touchstart", function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        cardElement.style.transition = "none";
    });

    cardElement.addEventListener("touchmove", function(e) {
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;

        if (Math.abs(deltaY) > Math.abs(deltaX)) return;
        if (e.cancelable) e.preventDefault();

        currentX = offsetX + deltaX;
        if (currentX > maxOffset) currentX = maxOffset;
        if (currentX < -maxOffset) currentX = -maxOffset;

        cardElement.style.transform = `translateX(${currentX}px)`;
        if (deleteBtn) deleteBtn.style.transition = "none";
        if (editBtn) editBtn.style.transition = "none";
        if (currentX > 0) {
            if (deleteBtn) {
                deleteBtn.style.opacity = currentX / maxOffset;
                deleteBtn.style.pointerEvents = "auto";
            }
            if (editBtn) {
                editBtn.style.opacity = 0;
                editBtn.style.pointerEvents = "none";
            }
        } else {
            if (editBtn) {
                editBtn.style.opacity = Math.abs(currentX) / maxOffset;
                editBtn.style.pointerEvents = "auto";
            }
            if (deleteBtn) {
                deleteBtn.style.opacity = 0;
                deleteBtn.style.pointerEvents = "none";
            }
        }
    }, { passive: false });

    cardElement.addEventListener("touchend", function() {
                if (deleteBtn) deleteBtn.style.transition = "";
        if (editBtn) editBtn.style.transition = "";
        if (currentX > threshold) {
            offsetX = maxOffset;
        } else if (currentX < -threshold) {
            offsetX = -maxOffset;
        } else {
            offsetX = 0;
        }

        cardElement.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
        cardElement.style.transform = `translateX(${offsetX}px)`;

        if (offsetX === maxOffset) {
            if (deleteBtn) { deleteBtn.style.opacity = 1; deleteBtn.style.pointerEvents = "auto"; }
            if (editBtn) { editBtn.style.opacity = 0; editBtn.style.pointerEvents = "none"; }
        } else if (offsetX === -maxOffset) {
            if (editBtn) { editBtn.style.opacity = 1; editBtn.style.pointerEvents = "auto"; }
            if (deleteBtn) { deleteBtn.style.opacity = 0; deleteBtn.style.pointerEvents = "none"; }
        } else {
            if (deleteBtn) { deleteBtn.style.opacity = 0; deleteBtn.style.pointerEvents = "none"; }
            if (editBtn) { editBtn.style.opacity = 0; editBtn.style.pointerEvents = "none"; }
        }

        currentX = 0;
    });

    function handleOutsideTouch(e) {
        // لو الكارت اتشال من الصفحة، نشيل المستمع ده من على الصفحة
        if (!cardElement.isConnected) {
            document.removeEventListener("touchstart", handleOutsideTouch);
            return;
        }
        if (deleteBtn && deleteBtn.contains(e.target)) return;
        if (editBtn && editBtn.contains(e.target)) return;

        if (!cardElement.contains(e.target) && offsetX !== 0) {
            offsetX = 0;
            cardElement.style.transition = "transform 0.25s ease";
            cardElement.style.transform = "translateX(0px)";
            setTimeout(() => {
                if (deleteBtn) { deleteBtn.style.opacity = 0; deleteBtn.style.pointerEvents = "none"; }
                if (editBtn) { editBtn.style.opacity = 0; editBtn.style.pointerEvents = "none"; }
            }, 250);
        }
    }
    document.addEventListener("touchstart", handleOutsideTouch);
    
}

// ==========================================
// Reusable Component: Transaction Item (DRY)
// قالب كارت المعاملة المشترك (مصروف / دخل / تحويل)
// ==========================================
function createTransactionElement(expense, options = {}) {
    const curr = options.currency || (typeof getCurrency === "function" ? getCurrency() : "EGP");
    const isIncome = expense.type === "income";
    const isTransfer = !!expense.isTransfer;

    const li = document.createElement("li");
    li.className = "expense-item expense-swipe";

    // تحديد الأيقونة ولون الكارت
    let iconHTML = `<i data-lucide="receipt"></i>`;
    if (expense.categoryIcon) {
    iconHTML = `<i data-lucide="${escapeHTML(getTxCategoryIcon(expense))}"></i>`;
    } else if (isTransfer) {
        iconHTML = `<i data-lucide="repeat"></i>`;
    }

    // تحديد الإشارة والمبلغ
    let sign = "-";
    let amountClass = "expense-amount-negative";
        if (isTransfer) {
        sign = "";
        amountClass = "expense-amount-transfer";
    } else if (isIncome) {
        sign = "+";
        amountClass = "expense-amount-positive";
    }
const formattedAmount = formatAmountNumber(expense.amount);

    // العنوان والوصف
let title = getTxCategoryName(expense) || expense.title || (typeof t === "function" ? t("unspecified") : "Unspecified");
let subtitle = getTxAccountName(expense);
    if (isTransfer) {
        title = typeof t === "function" ? t("transfer_title") : "Transfer";
subtitle = `${getTxAccountName(expense)} ➔ ${getAccountNameById(expense.transferToId, expense.transferTo)}`;
    }

    li.innerHTML = `
       <div class="swipe-action swipe-delete" title="Delete">
            <i data-lucide="trash-2"></i>
        </div>
        <div class="swipe-action swipe-edit" title="Edit">
            <i data-lucide="pencil"></i>
        </div>
        <div class="expense-main">
            <div class="expense-icon-box ${isIncome ? 'income' : (isTransfer ? 'transfer' : 'expense')}">
                ${iconHTML}
            </div>
            <div class="expense-info">
                <span class="expense-title">${escapeHTML(title)}</span>
                <span class="expense-category">${escapeHTML(subtitle)}</span>
                ${(!isTransfer && expense.description) ? `<span class="expense-note">${escapeHTML(expense.description)}</span>` : ""}
            </div>
            <div class="expense-right">
                <span class="expense-amount ${amountClass}">${sign}${formattedAmount} <small class="expense-currency">${escapeHTML(curr)}</small></span>
                <span class="expense-date">${formatDisplayDate(expense.date)}</span>
${expense.time ? `<span class="expense-date">${escapeHTML(expense.time)}</span>` : ""}
            </div>
        </div>
    `;

    return li;
}
// ==========================================
// Reusable Component: Empty State (DRY)
// قالب حالة الفراغ الموحد (عند عدم وجود بيانات)
// ==========================================
function renderEmptyState(icon = "inbox", title = "No data found", subtitle = "") {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">
               <i data-lucide="${escapeHTML(icon)}"></i>
            </div>
            <p class="empty-state-title">${title}</p>
            ${subtitle ? `<span class="empty-state-sub">${subtitle}</span>` : ""}
        </div>
    `;
}
// ==========================================
// Reusable Component: Progress Bar (DRY)
// شريط التقدم الموحد (الأهداف + الميزانيات)
// ==========================================
function renderProgressBar(percent) {
    const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
    return `
        <div class="goal-progress">
            <div class="goal-progress-fill" style="width: ${safePercent}%"></div>
        </div>
    `;
}