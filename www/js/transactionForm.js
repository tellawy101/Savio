// ==============================
// transactionForm.js
// منطق موحد لصفحتي Income و Expense (DRY)
// type: "income" | "expense"
// ==============================
function initTransactionForm(type, editId) {
    const backBtn = document.getElementById(type + "BackBtn");
    const amountEl = document.getElementById(type + "Amount");
    const saveBtn = document.getElementById("save" + capitalize(type) + "Btn");
    const accountEl = document.getElementById(type + "Account");
    const descriptionEl = document.getElementById(type + "Description");
    const categoryEl = document.getElementById(type + "Category");
    const dateEl = document.getElementById(type + "Date");

    initBackButton(backBtn);
setupCommonFormPage();
    const currencyEl = document.querySelector(".amount-display .currency");
    if (currencyEl) currencyEl.textContent = getCurrency();

    const today = getTodayDateString();
    dateEl.value = today;
    const dateTextEl = document.getElementById(type + "DateText");
    syncDateText(dateEl, dateTextEl);
    editId = editId || new URLSearchParams(window.location.search).get("edit") || null;

    if (!editId) {
        setTimeout(() => amountEl.focus(), 300);
    }
    function getMissingField() {
        const amount = Number(amountEl.value.replace(/,/g, ""));
        const account = accountEl.textContent.trim();
        const category = categoryEl.textContent.trim();
        const date = dateEl.value;

                if (amount <= 0) return t("field_amount");
        if (account === t("select_account")) return t("field_account");
        if (category === t("select_category")) return t("field_category");
        if (date.length === 0) return t("field_date");
        return null;
    }

    function checkForm() {
        if (!saveBtn) return;
        saveBtn.style.opacity = getMissingField() ? "0.5" : "1";
    }

    // بنضيف التحقق بتاع الفورم ده فوق اللي قبله (بدل ما نكتب فوقه)
    const previousFieldHandler = window.onFormFieldChanged;
    window.onFormFieldChanged = function() {
        checkForm();
        if (typeof previousFieldHandler === "function") previousFieldHandler();
    };
    dateEl.addEventListener("change", checkForm);
        dateEl.addEventListener("change", () => syncDateText(dateEl, dateTextEl));
    attachAmountFormatter(amountEl, checkForm);
attachThousandsFormatter(document.getElementById("newAccountBalance"), true);

    function loadEditingEntry() {
        if (!editId) return;
        const transactions = loadTransactions();
        const entry = transactions.find(tx => tx.id === editId);
        if (!entry || entry.type !== type) return;

        const formatted = Number(entry.amount).toLocaleString("en-US");
        amountEl.value = formatted;
        resizeAmountInput(amountEl, formatted);

        if (entry.account) {
const matchedAccount = getAccounts().find(acc => acc.id === getTxAccountId(entry));
    const accIcon = matchedAccount ? matchedAccount.icon : "credit-card";
accountEl.textContent = getTxAccountName(entry);
     const entryAccountId = getTxAccountId(entry);
    if (entryAccountId) {
        accountEl.dataset.id = entryAccountId;
    } else {
        delete accountEl.dataset.id;
    }
   accountEl.removeAttribute("data-i18n");
    const accountIconEl = document.getElementById(type + "AccountIcon");
    if (accountIconEl) {
        accountIconEl.innerHTML = `<i data-lucide="${escapeHTML(accIcon)}"></i>`;
    }
} else {
    accountEl.textContent = t("select_account");
}

categoryEl.textContent = getTxCategoryName(entry) || t("select_category");
categoryEl.dataset.icon = getTxCategoryIcon(entry);
const entryCategoryId = getTxCategoryId(entry);
if (entryCategoryId) {
    categoryEl.dataset.id = entryCategoryId;
} else {
    delete categoryEl.dataset.id;
}
if (entry.category) {
    categoryEl.removeAttribute("data-i18n");
    const categoryIconEl = document.getElementById(type + "CategoryIcon");
    if (categoryIconEl && entry.categoryIcon) {
        categoryIconEl.innerHTML = `<i data-lucide="${escapeHTML(getTxCategoryIcon(entry))}"></i>`;
    }
}
if (window.lucide) lucide.createIcons();
        descriptionEl.value = entry.description || "";
        dateEl.value = entry.date || today;
                syncDateText(dateEl, dateTextEl);
    }

    saveBtn.onclick = async function () {
        const missing = getMissingField();
        if (missing) {
showToast(t("missing_prefix") + missing);
            return;
        }

        let transactions = loadTransactions();
        const entryData = {
            amount: Number(amountEl.value.replace(/,/g, "")),
                        account: accountEl.textContent.trim(),
                accountId: accountEl.dataset.id || getAccountIdByName(accountEl.textContent.trim()),
                description: descriptionEl.value.trim(),
                category: categoryEl.textContent.trim(),
                categoryId: categoryEl.dataset.id || getCategoryIdByName(categoryEl.textContent.trim()),
            categoryIcon: categoryEl.dataset.icon || "tag",
            type: type,
            date: dateEl.value,
            time: getCurrentTimeString()
        };
        let debtsBackup = null;
        if (editId) {
            const entryIndex = transactions.findIndex(tx => tx.id === editId);
            if (entryIndex !== -1) {
                                const oldTx = transactions[entryIndex];
                if (oldTx.debtPaymentId) {
                                    if (entryData.type !== oldTx.type) {
                        await customAlert(t("debts_payment_type_change_blocked_alert"));
                        return;
                    }
                    debtsBackup = JSON.stringify(getDebts());
                    const debtOk = updateDebtPayment(
                        oldTx.debtPaymentId,
                        entryData.amount,
                        entryData.account,
                        entryData.accountId,
                        entryData.date
                    );
                    if (!debtOk) {
                        await customAlert(t("debts_payment_exceeds_alert"));
                        return;
                    }
                }
                // بنحافظ على وقت المعاملة الأصلي (التعديل ميغيّرش الوقت)
                entryData.time = oldTx.time || entryData.time;
                transactions[entryIndex] = { ...transactions[entryIndex], ...entryData };
            } else {
                entryData.id = generateTransactionId("tx");
                transactions.push(entryData);
            }
        } else {
            entryData.id = generateTransactionId("tx");
            transactions.push(entryData);
        }

if (!saveTransactions(transactions)) {
    if (debtsBackup !== null) saveDebts(JSON.parse(debtsBackup));
    return;
};
        
                if (type === "expense" && !editId) {
            const alertType = getBudgetAlertType(entryData.categoryId, entryData.amount, entryData.date);
            if (alertType) {
                sendNotificationNow(
                    Date.now() % 2147483647,
                    "💰 " + entryData.category,
                    t("cb_alert_" + alertType)
                );
            }
        }
                if (!editId) {
            safeSetItem("lastAccountId_" + type, entryData.accountId || "");
            safeSetItem("lastCategoryId_" + type, entryData.categoryId || "");
        }
                hapticSuccess();
        navigateTo("home");
};
        function prefillLastChoices() {
        const lastAccId = localStorage.getItem("lastAccountId_" + type);
        const lastCatId = localStorage.getItem("lastCategoryId_" + type);
        
        const acc = lastAccId && getAccounts().find(a => a.id === lastAccId);
        if (acc) {
            accountEl.textContent = acc.name;
            accountEl.dataset.id = acc.id;
            accountEl.removeAttribute("data-i18n");
            const accIconEl = document.getElementById(type + "AccountIcon");
            if (accIconEl) accIconEl.innerHTML = `<i data-lucide="${escapeHTML(acc.icon)}"></i>`;
        }
        
        const cat = lastCatId && getCategories().find(c => c.id === lastCatId);
        if (cat) {
            categoryEl.textContent = cat.name;
            categoryEl.dataset.icon = cat.icon;
            categoryEl.dataset.id = cat.id;
            categoryEl.removeAttribute("data-i18n");
            const catIconEl = document.getElementById(type + "CategoryIcon");
            if (catIconEl) catIconEl.innerHTML = `<i data-lucide="${escapeHTML(cat.icon)}"></i>`;
        }
        
        if (window.lucide) lucide.createIcons();
    }
    
    renderAccounts();
    renderCategories();
    loadEditingEntry();
    if (!editId) prefillLastChoices();
    checkForm();
}