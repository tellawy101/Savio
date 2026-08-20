// ==============================
// expense.js
// ==============================

const backBtn = document.getElementById("backBtn");
const expenseAmount = document.getElementById("expenseAmount");
const saveExpenseBtn = document.getElementById("saveExpenseBtn");
const expenseAccount = document.getElementById("expenseAccount");
const expenseDescription = document.getElementById("expenseDescription");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");

backBtn.onclick = function() {
    window.location.href = "../index.html";
};

fixScrollOnFocusOut();
applyStoredTheme();
const expenseCurrencyEl = document.querySelector(".amount-display .currency");
if (expenseCurrencyEl) expenseCurrencyEl.textContent = getCurrency();

const today = new Date().toISOString().split("T")[0];
expenseDate.value = today;

const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get("edit") || null;

function getMissingField() {
    const amount = Number(expenseAmount.value.replace(/,/g, ""));
    const account = expenseAccount.textContent.trim();
    const category = expenseCategory.textContent.trim();
    const date = expenseDate.value;
    
    if (amount <= 0) return "المبلغ";
    if (account === "Select Account") return "الحساب";
    if (category === "Select Category") return "التصنيف";
    if (date.length === 0) return "التاريخ";
    return null;
}

function checkExpenseForm() {
    if (!saveExpenseBtn) return;
    saveExpenseBtn.style.opacity = getMissingField() ? "0.5" : "1";
}

window.onFormFieldChanged = checkExpenseForm;

expenseDate.addEventListener("change", checkExpenseForm);

attachAmountFormatter(expenseAmount, checkExpenseForm);
attachThousandsFormatter(document.getElementById("newAccountBalance"));

function loadEditingExpense() {
    if (!editId) return;
    
    const transactions = loadTransactions();
    const entry = transactions.find(t => t.id === editId);
    
    if (!entry) return;
    
    const formatted = Number(entry.amount).toLocaleString("en-US");
    expenseAmount.value = formatted;
    resizeAmountInput(expenseAmount, formatted);
    
    expenseAccount.textContent = entry.account || "Select Account";
expenseCategory.innerHTML = entry.categoryIcon
    ? `<i data-lucide="${entry.categoryIcon}"></i> ${entry.category}`
    : (entry.category || "Select Category");
expenseCategory.dataset.icon = entry.categoryIcon || "tag";
if (window.lucide) lucide.createIcons();
    expenseDescription.value = entry.description || "";
    expenseDate.value = entry.date || today;
    
    saveExpenseBtn.textContent = "✓";
}

saveExpenseBtn.onclick = function() {
    const missing = getMissingField();
    
    if (missing) {
        showToast("من فضلك حدد " + missing);
        return;
    }
    
    let transactions = loadTransactions();
    
    const entryData = {
    amount: Number(expenseAmount.value.replace(/,/g, "")),
    account: expenseAccount.textContent.trim(),
    description: expenseDescription.value.trim(),
    category: expenseCategory.textContent.trim(),
    categoryIcon: expenseCategory.dataset.icon || "tag",
    type: "expense",
    date: expenseDate.value,
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
loadEditingExpense();
checkExpenseForm();