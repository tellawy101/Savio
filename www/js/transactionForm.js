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

    window.onFormFieldChanged = checkForm;
    dateEl.addEventListener("change", checkForm);
        dateEl.addEventListener("change", () => syncDateText(dateEl, dateTextEl));
    attachAmountFormatter(amountEl, checkForm);
    attachThousandsFormatter(document.getElementById("newAccountBalance"));

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
    accountEl.removeAttribute("data-i18n");
    const accountIconEl = document.getElementById(type + "AccountIcon");
    if (accountIconEl) {
        accountIconEl.innerHTML = `<i data-lucide="${escapeHTML(accIcon)}"></i>`;
    }
} else {
    accountEl.textContent = t("select_account");
}

categoryEl.textContent = getTxCategoryName(entry) || t("select_category");
categoryEl.dataset.icon = entry.categoryIcon || "tag";
if (entry.category) {
    categoryEl.removeAttribute("data-i18n");
    const categoryIconEl = document.getElementById(type + "CategoryIcon");
    if (categoryIconEl && entry.categoryIcon) {
        categoryIconEl.innerHTML = `<i data-lucide="${escapeHTML(entry.categoryIcon)}"></i>`;
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
                accountId: getAccountIdByName(accountEl.textContent.trim()),
                description: descriptionEl.value.trim(),
                category: categoryEl.textContent.trim(),
                categoryId: categoryEl.dataset.id || getCategoryIdByName(categoryEl.textContent.trim()),
            categoryIcon: categoryEl.dataset.icon || "tag",
            type: type,
            date: dateEl.value,
            time: getCurrentTimeString()
        };

        if (editId) {
            const entryIndex = transactions.findIndex(tx => tx.id === editId);
            if (entryIndex !== -1) {
                transactions[entryIndex] = { ...transactions[entryIndex], ...entryData };
            } else {
                entryData.id = generateTransactionId("tx");
                transactions.push(entryData);
            }
        } else {
            entryData.id = generateTransactionId("tx");
            transactions.push(entryData);
        }

if (!saveTransactions(transactions)) return;
        
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
        
        navigateTo("home");
};
    renderAccounts();
    renderCategories();
    loadEditingEntry();
    checkForm();
}