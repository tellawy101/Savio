// ======================================
// accounts/accountForm.js
// فورم إضافة وتعديل الحساب (تفريغ / حفظ / إلغاء)
// ======================================

function initAccountForm() {
const addAccountModal = document.getElementById("addAccountModal");
const saveAccountBtn = document.getElementById("saveAccountBtn");
const selectedIconLabel = document.getElementById("selectedIconLabel");
const newAccountIconInput = document.getElementById("newAccountIcon");

let editingAccount = null;

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

if (saveAccountBtn) {
    saveAccountBtn.onclick = function() {
        
        let name = document.getElementById("newAccountName").value.trim();
let description = document.getElementById("newAccountDescription").value.trim();
let icon = document.getElementById("newAccountIcon").value;
let balance = document.getElementById("newAccountBalance").value.trim();

if (balance === "") {
    balance = "0";
}

if (name === "") {
customAlert(t("enter_account_name_alert"));
    return;
}
        
        let accounts = getAccounts();
                const wasEditing = !!editingAccount;
        const savedAccountId = wasEditing ? editingAccount.id : generateId("acc");
        let sameAccount = accounts.find(account =>
            account.name.toLowerCase() === name.toLowerCase()
        );
        
        if (sameAccount && (!editingAccount || sameAccount.id !== editingAccount.id)) {
            showToast(t("account_exists_toast"));
            return;
        }
        
        if (editingAccount) {
            
                        let index = accounts.findIndex(a => a.id === editingAccount.id);
            
            accounts[index] = {
                id: editingAccount.id,
                name,
                description,
                icon,
                balance: Number(balance.replace(/,/g, ""))
            };

            editingAccount = null;
            
        } else {
            
            accounts.push({
                    id: savedAccountId,
    name,
    description,
    icon,
    balance: Number(balance.replace(/,/g, ""))
});
}

saveAccounts(accounts);
        
      const field = getAccountFieldEl();
      if (field && (!wasEditing || field.dataset.id === savedAccountId)) {
          field.textContent = name;
          field.dataset.id = savedAccountId;
          field.removeAttribute("data-i18n");
          
          const iconEl = window.activeAccountBox ? window.activeAccountBox.querySelector(".account-icon") : null;
          if (iconEl) iconEl.innerHTML = `<i data-lucide="${escapeHTML(icon)}"></i>`;
      }

if (window.lucide) lucide.createIcons();
renderAccounts();

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
        
        notifyFormFieldChanged();
    };
}

const cancelAddAccountBtn = document.getElementById("cancelAddAccountBtn");
if (cancelAddAccountBtn) {
    cancelAddAccountBtn.onclick = function() {
        // 1. إغلاق نافذة إضافة الحساب وتفريغ الحقول
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
        
        // 2. إذا كان المستخدم قادماً من شاشة اختيار حساب في معاملة:
        // نعيد إظهار نافذة الحسابات فوراً بدلاً من البقاء تائهاً
        if (window.activeAccountBox) {
            const accountModal = document.getElementById("accountModal");
            if (accountModal) {
                accountModal.classList.add("show");
            }
        }
    };
}

return {
    resetAddAccountForm: resetAddAccountForm,
    setEditingAccount: function (account) { editingAccount = account; }
};
}
