// ======================================
// accountsPage/accountsPageForm.js
// فورم إضافة وتعديل الحساب في صفحة الحسابات (تفريغ / حفظ / إلغاء)
// ======================================

function initAccountsPageForm(renderAccountsPage) {
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
    
    attachThousandsFormatter(document.getElementById("newAccountBalance"), true);
    
    if (cancelAddAccountBtn) {
        cancelAddAccountBtn.onclick = function() {
            // نطلب الرجوع خطوة للخلف كأنك ضغطت زر الرجوع في الهاتف بالضبط
            history.back();
        };
    }
    
    if (saveAccountBtn) {
        saveAccountBtn.onclick = async function() {
            const name = document.getElementById("newAccountName").value.trim();
            const description = document.getElementById("newAccountDescription").value.trim();
            const icon = newAccountIconInput.value;
            let balance = document.getElementById("newAccountBalance").value.trim();
            if (balance === "") balance = "0";
            
            if (name === "") {
                await customAlert(t("enter_account_name_alert"));
                return;
            }
            
            const accounts = getAccounts();
            const sameAccount = accounts.find(a => a.name.toLowerCase() === name.toLowerCase());
            
            if (sameAccount && (!editingAccount || sameAccount.id !== editingAccount.id)) {
                showToast(t("account_exists_toast"));
                return;
            }
            
            if (editingAccount) {
                const index = accounts.findIndex(a => a.id === editingAccount.id);
                accounts[index] = { id: editingAccount.id, name, description, icon, balance: parseAmount(balance), createdAt: editingAccount.createdAt };
                editingAccount = null;
            } else {
                accounts.push({ id: generateId("acc"), name, description, icon, balance: parseAmount(balance), createdAt: getTodayDateString() });
            }
            
            saveAccounts(accounts);
            showSaveTick();
            renderAccountsPage();
            showToast(t("account_added_toast"), "success");
            addAccountModal.classList.remove("show");
            resetAddAccountForm();
        };
    }
    
    return {
        resetAddAccountForm: resetAddAccountForm,
        setEditingAccount: function(account) { editingAccount = account; }
    };
}