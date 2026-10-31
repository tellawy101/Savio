// ======================================
// accounts/accountList.js
// قايمة الحسابات (عرض / اختيار) + تعديل وحذف الحساب
// ======================================

function initAccountList(form) {
const accountModal = document.getElementById("accountModal");
const addAccountModal = document.getElementById("addAccountModal");
const accountMenu = document.getElementById("accountMenu");
const editAccountBtn = document.getElementById("editAccountBtn");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const selectedIconLabel = document.getElementById("selectedIconLabel");
const newAccountIconInput = document.getElementById("newAccountIcon");

let selectedAccount = "";

window.renderAccounts = function() {
    
    const accountsList = document.getElementById("accountsList");
    
    if (!accountsList) return;
    
    accountsList.innerHTML = "";
    
let accounts = getAccounts();
    let transactions = typeof loadTransactions === "function" ? loadTransactions() : [];

    // لو الصفحة الحالية (زي Transfer) محددة دالة getDisabledAccountName
    // هنستخدمها عشان نعرف الحساب اللي المفروض يبقى باهت ومش قابل للاختيار
        const disabledAccountId = (typeof window.getDisabledAccountId === "function") ?
        window.getDisabledAccountId() :
        null;
    accounts.forEach(account => {
        
        let income = 0;
        let expense = 0;
        
        transactions.forEach(t => {
if (getTxAccountId(t) !== account.id) return;
            if (t.type === "income") income += Number(t.amount) || 0;
            else if (t.type === "expense") expense += Number(t.amount) || 0;
        });
        
                const currentBalance = (Number(account.balance) || 0) + income - expense;
        
        const item = document.createElement("div");
        
        item.dataset.name = account.name;
        
        const isDisabled = disabledAccountId && account.id === disabledAccountId;

item.className = "account-item" + (isDisabled ? " account-item-disabled" : "");
        
        item.innerHTML = renderListItemHTML(
    account.icon,
    account.name,
`<div class="account-balance">${formatAmountNumber(currentBalance)} ${escapeHTML(getCurrency())}</div>`
);
        let pressTimer;
        
        item.addEventListener("touchstart", function() {
            pressTimer = setTimeout(function() {
                            selectedAccount = account.id;
                document.getElementById("accountMenu").classList.add("show");
            }, 700);
        });
        
        item.addEventListener("touchend", function() {
            clearTimeout(pressTimer);
        });
                item.addEventListener("touchmove", function() {
            clearTimeout(pressTimer);
        });
        item.onclick = function() {
    if (isDisabled) return;
    
    const field = getAccountFieldEl();
    if (field) {
        field.textContent = account.name;
        field.dataset.id = account.id;
        field.removeAttribute("data-i18n");
    }
    
    const iconEl = window.activeAccountBox ? window.activeAccountBox.querySelector(".account-icon") : null;
    if (iconEl) iconEl.innerHTML = `<i data-lucide="${escapeHTML(account.icon)}"></i>`;
    
    if (window.lucide) lucide.createIcons();
    
    accountModal.classList.remove("show");
    notifyFormFieldChanged();
};
        
        accountsList.appendChild(item);
    });
    
    if (window.lucide) lucide.createIcons();
};

if (editAccountBtn) {
    editAccountBtn.onclick = function() {
        
        let accounts = getAccounts();
        
        const editingAccount = accounts.find(a => a.id === selectedAccount);
        
        if (!editingAccount) return;
        form.setEditingAccount(editingAccount);
        
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

// ==============================
// Delete Account
// ==============================

if (deleteAccountBtn) {
    deleteAccountBtn.onclick = async function() {
                const linkedTxCount = loadTransactions().filter(function(tx) {
            return getTxAccountId(tx) === selectedAccount;
        }).length;
        const deleteMessage = linkedTxCount > 0 ? t("account_delete_has_tx_confirm") : t("delete_confirm");
        if (!(await customConfirm(deleteMessage, { danger: true }))) return;
         deleteAccountWithUndo(selectedAccount, function() {
            renderAccounts();
            notifyFormFieldChanged();
        });
        const deletedField = getAccountFieldEl();
        if (deletedField && deletedField.dataset.id === selectedAccount) {
            deletedField.textContent = t("select_account");
            delete deletedField.dataset.id;
        }
        accountMenu.classList.remove("show");
        notifyFormFieldChanged();
    };
}
const setMainAccountBtn = document.getElementById("setMainAccountBtn");
if (setMainAccountBtn) {
    setMainAccountBtn.onclick = function() {
        let accounts = getAccounts();
        const index = accounts.findIndex(a => a.id === selectedAccount);
        if (index > 0) {
            const mainAccount = accounts.splice(index, 1)[0];
            accounts.unshift(mainAccount);
            saveAccounts(accounts);
            renderAccounts();
            notifyFormFieldChanged();
        }
        accountMenu.classList.remove("show");
    };
}
}