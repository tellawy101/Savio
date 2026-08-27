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
        <i data-lucide="home"></i>
        <span data-i18n="nav_home">Home</span>
    </button>

    <button class="nav-item ${activePage === 'debts' ? 'active' : ''}" data-page="debts">
        <i data-lucide="hand-coins"></i>
        <span data-i18n="nav_debts">Debts</span>
    </button>
<button class="nav-item ${activePage === 'statistics' ? 'active' : ''}" data-page="statistics">
    <i data-lucide="chart-no-axes-combined"></i>
    <span data-i18n="nav_stats">Statistics</span>
</button>
    ${isHome ? `
    <button id="addMenuBtn" class="fab-nav">
        <i data-lucide="plus"></i>
    </button>
    <div id="fabMenu" class="fab-menu">
        <button id="fabIncome">
            <i data-lucide="trending-up"></i>
            <span data-i18n="income">Income</span>
        </button>
        <button id="fabExpense">
            <i data-lucide="trending-down"></i>
            <span data-i18n="nav_expense">Expense</span>
        </button>
        <button id="fabTransfer">
            <i data-lucide="repeat"></i>
            <span data-i18n="nav_transfer">Transfer</span>
        </button>
    </div>
    ` : ''}

    <button class="nav-item ${activePage === 'accounts' ? 'active' : ''}" data-page="accounts">
        <i data-lucide="wallet"></i>
        <span data-i18n="nav_accounts">Accounts</span>
    </button>

    <button class="nav-item ${activePage === 'settings' ? 'active' : ''}" data-page="settings">
        <i data-lucide="settings"></i>
        <span data-i18n="nav_settings">Settings</span>
    </button>
</nav>
    `;
}

// 2) دالة الانتقال بين الصفحات مع أنيميشن (موحدة بدل ما كانت مكررة)
function navigateWithAnimation(button, url) {
    const nav = button.closest(".bottom-nav");
    const current = nav ? nav.querySelector(".nav-item.active") : null;

    if (current && current !== button) {
        current.classList.remove("active");
    }

    button.classList.add("active");

        window.location.href = url;
}

// 3) تفعيل أيقونات lucide (موحدة)
function initIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}

// 4) تجهيز الـ nav بعد إضافتها للصفحة (أيقونات + روابط الأزرار)
function setupBottomNav(basePath = '') {
    initIcons();

    const routes = {
    home: basePath + 'index.html',
    debts: basePath + 'pages/debts.html',
    statistics: basePath + 'pages/statistics.html',
    accounts: basePath + 'pages/accounts.html',
    settings: basePath + 'pages/settings.html'
};

    document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
        btn.addEventListener('click', function () {
            const page = this.dataset.page;
            navigateWithAnimation(this, routes[page]);
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
            <button id="editAccountBtn">✏️ Edit</button>
            <button id="deleteAccountBtn">🗑 Delete</button>
        </div>
    </div>

    <div id="toast" class="toast">
        Account name already exists
    </div>

   <div id="categoryMenu" class="modal">
        <div class="modal-content">
            <button id="editCategoryBtn">✏️ Edit</button>
            <button id="deleteCategoryBtn">🗑 Delete</button>
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

// بيفتح مودال "محتاج تعمل حسابين" برسالة تختلف حسب عدد الحسابات الموجود
// existingAccountsCount = عدد الحسابات الحالي (0 أو 1)
function showNoAccountsModal(existingAccountsCount) {
    const modal = document.getElementById("noAccountsModal");
    const title = document.getElementById("noAccountsTitle");
    const message = document.getElementById("noAccountsMessage");

    if (!modal) return;

    if (existingAccountsCount === 0) {
        title.textContent = "لسه معملتش أي حساب";
        message.textContent = "لازم تعمل حسابين على الأقل عشان تقدر تحوّل فلوس بينهم.";
    } else {
        title.textContent = "محتاج حساب واحد كمان";
        message.textContent = "عندك حساب واحد بس دلوقتي. اعمل حساب تاني عشان تقدر تحوّل.";
    }

    modal.classList.add("show");

closeModalOnBackdropClick(modal);

document.getElementById("noAccountsCancelBtn").onclick = function() {
        modal.classList.remove("show");
    };

    document.getElementById("noAccountsAddBtn").onclick = function () {
        const insidePagesFolder = window.location.pathname.includes("/pages/");
        window.location.href = insidePagesFolder ? "accounts.html" : "pages/accounts.html";
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
    <button id="backBtn" class="back-btn">←</button>
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
        <span class="account-icon">💳</span>
        <div id="${type}Account" class="account-select" data-i18n="select_account">Select Account</div>
        <span class="account-arrow">›</span>
    </div>
</div>

<div class="form-group">
    <label data-i18n="category_label">Category</label>
    <div class="category-select-box">
        <span class="category-icon">🏷️</span>
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
        <input type="date" id="${type}Date" class="description-input" placeholder="Write the date">
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
        <span class="currency">EGP</span>
        <input type="tel" id="${type}Amount" inputmode="numeric" autofocus value="0">
    </div>
</div>

${renderTransactionFields(type)}

</main>
    `;
}

// حقول فورم الـ Transfer بس (من غير هيدر) - قابلة لإعادة الاستخدام
function renderTransferFields() {
    return `
<div class="form-group">
    <label>From Account</label>
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
    <label>To Account</label>
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

// هيدر + الحقول مع بعض (زي الأول بالظبط) - بتستخدم الدالة اللي فوق جواها
function renderTransferForm() {
    return `
${renderFormHeader("transfer", "Transfer", '<i data-lucide="check"></i>')}

<main class="transfer-content">

<div class="amount-section">
    <div class="amount-display">
        <span class="currency">EGP</span>
        <input type="tel" id="transferAmount" inputmode="numeric" value="0">
    </div>
</div>

${renderTransferFields()}

</main>
    `;
}
// 7.3) بناء صندوق إحصائية واحد (Income/Expense بالهوم، Receivable/Payable بالديون) - نفس الشكل بيتفرق بس بالمحتوى
function renderStatBox({ statClass = "", icon, labelKey, labelText, valueId, currency = "EGP" }) {
    return `
<div class="stat ${statClass}">
    <span>${icon}</span>
    <h4 data-i18n="${labelKey}">${labelText}</h4>
    <p id="${valueId}"><span class="stat-currency">${currency}</span> <span class="stat-value">0</span></p>
</div>
    `;
}
// 8) إغلاق أي مودال لما يتم الضغط برّه (خارج المحتوى) - نمط متكرر في كل المودالز

function closeModalOnBackdropClick(modal, onClose) {
    if (!modal) return;
    modal.onclick = function (e) {
        if (e.target === modal) {
            modal.classList.remove("show");
            if (typeof onClose === "function") onClose();
        }
    };
}