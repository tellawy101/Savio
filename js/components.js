// ============================
// components.js
// مكان موحد للأجزاء المتكررة بين الصفحات (DRY)
// ============================

// 1) بناء الـ Bottom Navigation حسب الصفحة الحالية
function renderBottomNav(activePage) {
    // activePage تكون: 'home' | 'debts' | 'accounts' | 'settings'

    const isHome = activePage === 'home';

    return `
    <nav class="bottom-nav ${isHome ? '' : 'no-fab'}">
        <button class="nav-item ${activePage === 'home' ? 'active' : ''}" data-page="home">
            <i data-lucide="home"></i>
            <span>Home</span>
        </button>

        <button class="nav-item ${activePage === 'debts' ? 'active' : ''}" data-page="debts">
            <i data-lucide="hand-coins"></i>
            <span>Debts</span>
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

    setTimeout(() => {
        window.location.href = url;
    }, 400);
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

                <div class="icon-option"
                     data-icon="utensils"
                     data-label="Food">
                    <i data-lucide="utensils"></i>
                    <span>Food</span>
                </div>

                <div class="icon-option"
                     data-icon="car"
                     data-label="Transport">
                    <i data-lucide="car"></i>
                    <span>Transport</span>
                </div>

                <div class="icon-option"
                     data-icon="shopping-cart"
                     data-label="Shopping">
                    <i data-lucide="shopping-cart"></i>
                    <span>Shopping</span>
                </div>

                <div class="icon-option"
                     data-icon="receipt"
                     data-label="Bills">
                    <i data-lucide="receipt"></i>
                    <span>Bills</span>
                </div>

                <div class="icon-option"
                     data-icon="heart-pulse"
                     data-label="Health">
                    <i data-lucide="heart-pulse"></i>
                    <span>Health</span>
                </div>

                <div class="icon-option"
                     data-icon="gamepad-2"
                     data-label="Entertainment">
                    <i data-lucide="gamepad-2"></i>
                    <span>Entertainment</span>
                </div>

                <div class="icon-option"
                     data-icon="home"
                     data-label="Home">
                    <i data-lucide="home"></i>
                    <span>Home</span>
                </div>

                <div class="icon-option"
                     data-icon="briefcase"
                     data-label="Work">
                    <i data-lucide="briefcase"></i>
                    <span>Work</span>
                </div>

                <div class="icon-option"
                     data-icon="gift"
                     data-label="Gifts">
                    <i data-lucide="gift"></i>
                    <span>Gifts</span>
                </div>

                <div class="icon-option"
                     data-icon="graduation-cap"
                     data-label="Education">
                    <i data-lucide="graduation-cap"></i>
                    <span>Education</span>
                </div>

                <div class="icon-option"
                     data-icon="plane"
                     data-label="Travel">
                    <i data-lucide="plane"></i>
                    <span>Travel</span>
                </div>

                <div class="icon-option"
                     data-icon="music"
                     data-label="Music">
                    <i data-lucide="music"></i>
                    <span>Music</span>
                </div>

                <div class="icon-option"
                     data-icon="wifi"
                     data-label="Internet">
                    <i data-lucide="wifi"></i>
                    <span>Internet</span>
                </div>

                <div class="icon-option"
                     data-icon="smartphone"
                     data-label="Phone">
                    <i data-lucide="smartphone"></i>
                    <span>Phone</span>
                </div>

                <div class="icon-option"
                     data-icon="wallet"
                     data-label="Money">
                    <i data-lucide="wallet"></i>
                    <span>Money</span>
                </div>

                <div class="icon-option"
                     data-icon="banknote"
                     data-label="Cash">
                    <i data-lucide="banknote"></i>
                    <span>Cash</span>
                </div>

                <div class="icon-option"
                     data-icon="landmark"
                     data-label="Bank">
                    <i data-lucide="landmark"></i>
                    <span>Bank</span>
                </div>

                <div class="icon-option"
                     data-icon="chart-no-axes-combined"
                     data-label="Investment">
                    <i data-lucide="chart-no-axes-combined"></i>
                    <span>Investment</span>
                </div>

                <div class="icon-option"
                     data-icon="circle-dollar-sign"
                     data-label="Income">
                    <i data-lucide="circle-dollar-sign"></i>
                    <span>Income</span>
                </div>

                <div class="icon-option"
                     data-icon="ellipsis"
                     data-label="Other">
                    <i data-lucide="ellipsis"></i>
                    <span>Other</span>
                </div>

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
    `;
}