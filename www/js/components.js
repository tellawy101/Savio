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
            <span>Home</span>
        </button>

        <button class="nav-item ${activePage === 'debts' ? 'active' : ''}" data-page="debts">
            <i data-lucide="hand-coins"></i>
            <span>Debts</span>
        </button>
<button class="nav-item ${activePage === 'statistics' ? 'active' : ''}" data-page="statistics">
    <i data-lucide="chart-no-axes-combined"></i>
    <span>Statistics</span>
</button>
        ${isHome ? `
        <button id="addMenuBtn" class="fab-nav">
            <i data-lucide="plus"></i>
        </button>
        <div id="fabMenu" class="fab-menu">
            <button id="fabIncome">
                <i data-lucide="trending-up"></i>
                <span>Income</span>
            </button>
            <button id="fabExpense">
                <i data-lucide="trending-down"></i>
                <span>Expense</span>
            </button>
            <button id="fabTransfer">
                <i data-lucide="repeat"></i>
                <span>Transfer</span>
            </button>
        </div>
        ` : ''}

        <button class="nav-item ${activePage === 'accounts' ? 'active' : ''}" data-page="accounts">
            <i data-lucide="wallet"></i>
            <span>Accounts</span>
        </button>

        <button class="nav-item ${activePage === 'settings' ? 'active' : ''}" data-page="settings">
            <i data-lucide="settings"></i>
            <span>Settings</span>
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
            <h2>Accounts</h2>
            <div id="accountsList"></div>
            <button id="addAccountBtn">
                + Add Account
            </button>
        </div>
    </div>

    <div id="addAccountModal" class="modal">
        <div class="modal-content">
            <h2>New Account</h2>
            <input
                type="text"
                id="newAccountName"
                class="form-input"
                placeholder="Account name">
                
               <input
    type="text"
    id="newAccountDescription"
    class="form-input"
    placeholder="Description (optional)"> 
                
<div class="icon-dropdown" id="iconDropdown">
    <button type="button" class="icon-dropdown-trigger" id="iconDropdownTrigger">
        <span id="selectedIconPreviewWrap"><i data-lucide="wallet" id="selectedIconPreview"></i></span>
        <span id="selectedIconLabel">اختر أيقونة</span>
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
                placeholder="Initial Balance">
            <div class="modal-actions">
    <button id="cancelAddAccountBtn" class="account-cancel-btn">
        Cancel
    </button>
    <button id="saveAccountBtn" class="account-save-btn">
        Save
    </button>
</div>
        </div>
    </div>

    <div id="categoryModal" class="modal">
        <div class="modal-content">
            <h2>Categories</h2>
            <div id="categoriesList"></div>
            <button id="addCategoryBtn">
                + Add Category
            </button>
        </div>
    </div>

<div id="addCategoryModal" class="modal">
    <div class="modal-content">

        <h2>New Category</h2>

        <input
            type="text"
            id="newCategoryName"
            class="form-input"
            placeholder="Category name">

        <!-- Category Icon Picker -->
        <div class="icon-dropdown" id="categoryIconDropdown">

            <button
                type="button"
                class="icon-dropdown-trigger"
                id="categoryIconDropdownTrigger">

                <span id="selectedCategoryIconPreviewWrap">
                    <i data-lucide="tag" id="selectedCategoryIconPreview"></i>
                </span>

                <span id="selectedCategoryIconLabel">
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
                        placeholder="Search any icon (English)...">
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
            class="account-save-btn">
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

    modal.onclick = function (e) {
        if (e.target === modal) modal.classList.remove("show");
    };

    document.getElementById("noAccountsCancelBtn").onclick = function () {
        modal.classList.remove("show");
    };

    document.getElementById("noAccountsAddBtn").onclick = function () {
        const insidePagesFolder = window.location.pathname.includes("/pages/");
        window.location.href = insidePagesFolder ? "accounts.html" : "pages/accounts.html";
    };
}