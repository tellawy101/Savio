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

const today = new Date().toISOString().split("T")[0];
incomeDate.value = today;

const urlParams = new URLSearchParams(window.location.search);
const editIndex = urlParams.has("edit") ? Number(urlParams.get("edit")) : -1;

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
    if (editIndex === -1) return;

    const transactions = loadTransactions();
    const entry = transactions[editIndex];

    if (!entry || entry.type !== "income") return;

    const formatted = Number(entry.amount).toLocaleString("en-US");
    incomeAmount.value = formatted;
    resizeAmountInput(incomeAmount, formatted);

    incomeAccount.textContent = entry.account;
    incomeCategory.textContent = entry.category;
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
        type: "income",
        date: incomeDate.value,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    if (editIndex !== -1 && transactions[editIndex]) {
        transactions[editIndex] = { ...transactions[editIndex], ...entryData };
    } else {
        transactions.push(entryData);
    }

    saveTransactions(transactions);
    window.location.href = "../index.html";
};

renderAccounts();
renderCategories();
loadEditingIncome();
checkIncomeForm();