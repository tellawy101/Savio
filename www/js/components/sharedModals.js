// ==============================
// components/sharedModals.js
// المودالز المشتركة (Accounts + Categories)
// ==============================

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
           <button id="setMainAccountBtn"><i data-lucide="badge-check"></i> <span data-i18n="set_main_account_btn">Set as Main</span></button>
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