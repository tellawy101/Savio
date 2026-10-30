// ==============================
// components/transactionForms.js
// فورم Income / Expense / Transfer (هيدر + حقول)
// ==============================

// capitalize موحدة (بتستخدمها transactionForm.js كمان)
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// هيدر موحد (زرار رجوع + عنوان + زرار حفظ) لأي صفحة فورم - Income/Expense/Transfer
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

// هيدر + الحقول مع بعض
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

// حقول فورم الـ Transfer بس (من غير هيدر)
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