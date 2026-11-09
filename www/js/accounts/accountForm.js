// ======================================
// accounts/accountForm.js
// فورم إضافة وتعديل الحساب (تفريغ / حفظ / إلغاء)
// ======================================

function initAccountForm() {
    const addAccountModal = document.getElementById("addAccountModal");
    const saveAccountBtn = document.getElementById("saveAccountBtn");
    const cancelAddAccountBtn = document.getElementById("cancelAddAccountBtn");
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
            const name = document.getElementById("newAccountName").value.trim();
            const description = document.getElementById("newAccountDescription").value.trim();
            const icon = document.getElementById("newAccountIcon").value;
            let balance = document.getElementById("newAccountBalance").value.trim();
            
            if (balance === "") {
                balance = "0";
            }
            
            if (name === "") {
                customAlert(t("enter_account_name_alert"));
                return;
            }
            
            const accounts = getAccounts();
            const wasEditing = !!editingAccount;
            const savedAccountId = wasEditing ? editingAccount.id : generateId("acc");
            const sameAccount = accounts.find(account =>
                account.name.toLowerCase() === name.toLowerCase()
            );
            
            if (sameAccount && (!editingAccount || sameAccount.id !== editingAccount.id)) {
                showToast(t("account_exists_toast"));
                return;
            }
            
            if (editingAccount) {
                const index = accounts.findIndex(a => a.id === editingAccount.id);
                
                accounts[index] = {
                    id: editingAccount.id,
                    name,
                    description,
                    icon,
                    balance: parseAmount(balance),
                    createdAt: editingAccount.createdAt
                };
                
                editingAccount = null;
            } else {
                accounts.push({
                    id: savedAccountId,
                    name,
                    description,
                    icon,
                    balance: parseAmount(balance),
                    createdAt: getTodayDateString()
                });
            }
            
            saveAccounts(accounts);
            showSaveTick();
            
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
            resetAddAccountForm();
            
            notifyFormFieldChanged();
        };
    }
    
    if (cancelAddAccountBtn) {
        cancelAddAccountBtn.onclick = function() {
            // 1. إغلاق نافذة إضافة الحساب وتفريغ الحقول
            addAccountModal.classList.remove("show");
            resetAddAccountForm();
            
            // 2. لو جاي من شاشة اختيار حساب في معاملة، نرجّع نافذة الحسابات
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
        setEditingAccount: function(account) { editingAccount = account; }
    };
}