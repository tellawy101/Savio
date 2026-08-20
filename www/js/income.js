// ==============================
// income.js
// ==============================

const backBtn = document.getElementById("backBtn");
const incomeAmount = document.getElementById("incomeAmount");
const saveIncomeBtn = document.getElementById("saveIncomeBtn");
const incomeAccount = document.getElementById("incomeAccount");
const incomeDescription = document.getElementById("incomeDescription");
const incomeCategory = document.getElementById("incomeCategory");
const incomeDate = document.getElementById("incomeDate");

backBtn.onclick = function () {
    window.location.href = "../index.html";
};

fixScrollOnFocusOut();
applyStoredTheme();
const incomeCurrencyEl = document.querySelector(".amount-display .currency");
if (incomeCurrencyEl) incomeCurrencyEl.textContent = getCurrency();

const today = new Date().toISOString().split("T")[0];
incomeDate.value = today;

const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get("edit") || null;

function getMissingField() {
    const amount = Number(incomeAmount.value.replace(/,/g, ""));
    const account = incomeAccount.textContent.trim();
    const category = incomeCategory.textContent.trim();
    const date = incomeDate.value;

    if (amount <= 0) return "المبلغ";
    if (account === "Select Account") return "الحساب";
    if (category === "Select Category") return "التصنيف";
    if (date.length === 0) return "التاريخ";
    return null;
}

function checkIncomeForm() {
    saveIncomeBtn.style.opacity = getMissingField() ? "0.5" : "1";
}

window.onFormFieldChanged = checkIncomeForm;

incomeDate.addEventListener("change", checkIncomeForm);

attachAmountFormatter(incomeAmount, checkIncomeForm);
attachThousandsFormatter(document.getElementById("newAccountBalance"));

function loadEditingIncome() {
    if (!editId) return;

    const transactions = loadTransactions();
    const entry = transactions.find(t => t.id === editId);

    if (!entry || entry.type !== "income") return;

    const formatted = Number(entry.amount).toLocaleString("en-US");
    incomeAmount.value = formatted;
    resizeAmountInput(incomeAmount, formatted);

    incomeAccount.textContent = entry.account;
    incomeCategory.innerHTML = entry.categoryIcon
        ? `<i data-lucide="${entry.categoryIcon}"></i> ${entry.category}`
        : entry.category;
    incomeCategory.dataset.icon = entry.categoryIcon || "tag";
    if (window.lucide) lucide.createIcons();
    incomeDescription.value = entry.description || "";
    incomeDate.value = entry.date;

    saveIncomeBtn.textContent = "✓";
}

saveIncomeBtn.onclick = function () {
    const missing = getMissingField();

    if (missing) {
        showToast("من فضلك حدد " + missing);
        return;
    }

    let transactions = loadTransactions();

    const entryData = {
        amount: Number(incomeAmount.value.replace(/,/g, "")),
        account: incomeAccount.textContent.trim(),
        description: incomeDescription.value.trim(),
        category: incomeCategory.textContent.trim(),
        categoryIcon: incomeCategory.dataset.icon || "tag",
        type: "income",
        date: incomeDate.value,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    if (editId) {

        const entryIndex = transactions.findIndex(t => t.id === editId);

        if (entryIndex !== -1) {
            transactions[entryIndex] = { ...transactions[entryIndex], ...entryData };
        } else {
            entryData.id = "tx_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
            transactions.push(entryData);
        }

    } else {

        entryData.id = "tx_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
        transactions.push(entryData);

    }
    saveTransactions(transactions);
    window.location.href = "../index.html";
};

renderAccounts();
renderCategories();
loadEditingIncome();
checkIncomeForm();