// ==============================
// transactionForm.js
// منطق موحد لصفحتي Income و Expense (DRY)
// type: "income" | "expense"
// ==============================
function initTransactionForm(type) {
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

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("edit") || null;

    if (!editId) {
        setTimeout(() => amountEl.focus(), 300);
    }
    function getMissingField() {
        const amount = Number(amountEl.value.replace(/,/g, ""));
        const account = accountEl.textContent.trim();
        const category = categoryEl.textContent.trim();
        const date = dateEl.value;

        if (amount <= 0) return "المبلغ";
        if (account === t("select_account")) return "الحساب";
        if (category === t("select_category")) return "التصنيف";
        if (date.length === 0) return "التاريخ";
        return null;
    }

    function checkForm() {
        if (!saveBtn) return;
        saveBtn.style.opacity = getMissingField() ? "0.5" : "1";
    }

    window.onFormFieldChanged = checkForm;
    dateEl.addEventListener("change", checkForm);
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

        accountEl.textContent = entry.account || t("select_account");
if (entry.account) accountEl.removeAttribute("data-i18n");

categoryEl.innerHTML = entry.categoryIcon ?
    `<i data-lucide="${entry.categoryIcon}"></i> ${entry.category}` :
    (entry.category || t("select_category"));
categoryEl.dataset.icon = entry.categoryIcon || "tag";
if (entry.category) categoryEl.removeAttribute("data-i18n");
        if (window.lucide) lucide.createIcons();
        descriptionEl.value = entry.description || "";
        dateEl.value = entry.date || today;
    }

    saveBtn.onclick = function () {
        const missing = getMissingField();
        if (missing) {
            showToast("من فضلك حدد " + missing);
            return;
        }

        let transactions = loadTransactions();
        const entryData = {
            amount: Number(amountEl.value.replace(/,/g, "")),
            account: accountEl.textContent.trim(),
            description: descriptionEl.value.trim(),
            category: categoryEl.textContent.trim(),
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

        saveTransactions(transactions);
navigateTo("home");
};
    renderAccounts();
    renderCategories();
    loadEditingEntry();
    checkForm();
}