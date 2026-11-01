// ======================================
// accountsPage/accountsPageMenu.js
// قايمة الحساب (تعديل / حساب رئيسي / حذف)
// ======================================

function initAccountsPageMenu(form, renderAccountsPage) {
    const addAccountModal = document.getElementById("addAccountModal");
    const accountMenu = document.getElementById("accountMenu");
    const editAccountBtn = document.getElementById("editAccountBtn");
    const deleteAccountBtn = document.getElementById("deleteAccountBtn");
    const selectedIconLabel = document.getElementById("selectedIconLabel");
    const newAccountIconInput = document.getElementById("newAccountIcon");

    let selectedAccount = "";

    if (editAccountBtn) {
        editAccountBtn.onclick = function () {
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
    const setMainAccountBtn = document.getElementById("setMainAccountBtn");

    if (setMainAccountBtn) {
        setMainAccountBtn.onclick = function () {
            let accounts = getAccounts();
            const index = accounts.findIndex(a => a.id === selectedAccount);
            if (index > 0) {
                const mainAccount = accounts.splice(index, 1)[0];
                accounts.unshift(mainAccount);
                saveAccounts(accounts);
                renderAccountsPage();
            }
            accountMenu.classList.remove("show");
        };
    }
        const accountTransfersBtn = document.getElementById("accountTransfersBtn");
    
    if (accountTransfersBtn) {
        accountTransfersBtn.onclick = function() {
            accountMenu.classList.remove("show");
            window.pendingAccountTransactionsAccount = selectedAccount;
            window.pendingAccountTransactionsType = "transfer";
            navigateTo("account-transactions");
        };
    }
    if (deleteAccountBtn) {
        deleteAccountBtn.onclick = async function() {
                                const linkedTxCount = loadTransactions().filter(function(tx) {
                return getTxAccountId(tx) === selectedAccount;
            }).length;
            const deleteMessage = linkedTxCount > 0 ? t("account_delete_has_tx_confirm") : t("delete_confirm");
            if (!(await customConfirm(deleteMessage, { danger: true }))) return;
            deleteAccountWithUndo(selectedAccount, renderAccountsPage);
            accountMenu.classList.remove("show");
        };
    }

function openAccountMenu(accountId) {
    selectedAccount = accountId;
    accountMenu.classList.add("show");
}

return { openAccountMenu };
}
