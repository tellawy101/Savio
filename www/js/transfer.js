// ==============================
// transfer.js
// تحويل مبلغ بين حسابين (خصم من حساب + إضافة لحساب التاني)
// ==============================
function initTransferForm(initialTab) {
const backBtn = document.getElementById("transferBackBtn");
const transferAmount = document.getElementById("transferAmount");
const saveTransferBtn = document.getElementById("saveTransferBtn");
const transferFromAccount = document.getElementById("transferFromAccount");
const transferToAccount = document.getElementById("transferToAccount");
const transferDescription = document.getElementById("transferDescription");
const transferDate = document.getElementById("transferDate");
const swapAccountsBtn = document.getElementById("swapAccountsBtn");

initBackButton(backBtn);

setupCommonFormPage();
const existingAccounts = JSON.parse(localStorage.getItem("accounts")) || [];

if (existingAccounts.length < 2 && initialTab === "transfer") {
    showNoAccountsModal(existingAccounts.length);
    
    document.getElementById("noAccountsCancelBtn").onclick = function() {
        navigateTo("home");
    };
}
const today = getTodayDateString();
transferDate.value = today;

const urlParams = new URLSearchParams(window.location.search);
const editTransferId = urlParams.get("edit"); // transferId مش index

// ==============================
// منع اختيار نفس الحساب في From وTo
// ==============================

// بيقول لـ accounts.js إن الحساب المختار في الخانة التانية (From أو To)
// المفروض يبقى باهت ومش قابل للاختيار تاني في القائمة
window.getDisabledAccountName = function () {
    if (!activeAccountBox) return null;

    const fromBox = transferFromAccount.closest(".account-select-box");
    const toBox = transferToAccount.closest(".account-select-box");

    if (activeAccountBox === toBox) {
    const from = transferFromAccount.textContent.trim();
    return from === t("select_account") ? null : from;
}

if (activeAccountBox === fromBox) {
    const to = transferToAccount.textContent.trim();
    return to === t("select_account") ? null : to;
}
    return null;
};

// ==============================
// تبديل حساب المصدر والوجهة
// ==============================

swapAccountsBtn.onclick = function () {
    const fromText = transferFromAccount.textContent.trim();
    const toText = transferToAccount.textContent.trim();

    transferFromAccount.textContent = toText;
    transferToAccount.textContent = fromText;

    checkTransferForm();
};

// ==============================
// التحقق من الفورم
// ==============================

function getMissingField() {
    const amount = Number(transferAmount.value.replace(/,/g, ""));
    const from = transferFromAccount.textContent.trim();
    const to = transferToAccount.textContent.trim();
    const date = transferDate.value;

    if (amount <= 0) return "المبلغ";
    if (from === t("select_account")) return "حساب المصدر";
if (to === t("select_account")) return "حساب الوجهة";
    if (from === to) return "حساب وجهة مختلف عن حساب المصدر";
    if (date.length === 0) return "التاريخ";
    return null;
}

function checkTransferForm() {
    saveTransferBtn.style.opacity = getMissingField() ? "0.5" : "1";
}

window.onFormFieldChanged = checkTransferForm;

transferDate.addEventListener("change", checkTransferForm);

attachAmountFormatter(transferAmount, checkTransferForm);

// ==============================
// تحميل بيانات التحويل لو بنعدّل
// ==============================

function loadEditingTransfer() {
    if (!editTransferId) return;

    const transactions = loadTransactions();
    const pair = transactions.filter(t => t.transferId === editTransferId);

    const fromSide = pair.find(t => t.type === "expense");
    const toSide = pair.find(t => t.type === "income");

    if (!fromSide || !toSide) return;

    const formatted = Number(fromSide.amount).toLocaleString("en-US");
    transferAmount.value = formatted;
    resizeAmountInput(transferAmount, formatted);

    transferFromAccount.textContent = fromSide.account;
    transferToAccount.textContent = toSide.account;

    transferDescription.value = fromSide.note || "";
    transferDate.value = fromSide.date;

    saveTransferBtn.textContent = "✓";
}

// ==============================
// حفظ التحويل
// ==============================

saveTransferBtn.onclick = function () {
    const missing = getMissingField();

    if (missing) {
        showToast("من فضلك حدد " + missing);
        return;
    }

    const amount = Number(transferAmount.value.replace(/,/g, ""));
    const fromAccount = transferFromAccount.textContent.trim();
    const toAccount = transferToAccount.textContent.trim();
    const note = transferDescription.value.trim();
    const date = transferDate.value;
    const time = getCurrentTimeString();

    let transactions = loadTransactions();

    const transferId = editTransferId || generateTransactionId("tr");

    // لو بنعدّل تحويل قديم، نشيل النسختين القدام الأول
    if (editTransferId) {
        transactions = transactions.filter(t => t.transferId !== editTransferId);
    }

    const fromEntry = {
        amount,
        account: fromAccount,
        description: "Transfer → " + toAccount + (note ? " • " + note : ""),
        note,
        category: "Transfer",
        categoryIcon: "repeat",
        type: "expense",
        date,
        time,
        isTransfer: true,
        transferId,
        transferTo: toAccount
    };

    const toEntry = {
        amount,
        account: toAccount,
        description: "Transfer ← " + fromAccount + (note ? " • " + note : ""),
        note,
        category: "Transfer",
        categoryIcon: "repeat",
        type: "income",
        date,
        time,
        isTransfer: true,
        transferId,
        transferFrom: fromAccount
    };

    transactions.push(fromEntry, toEntry);

    saveTransactions(transactions);
navigateTo("home");
};

renderAccounts();
loadEditingTransfer();
checkTransferForm();
}