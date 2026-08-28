// ==============================================================
// addTransactionTabs.js
// التحكم في التابس (Income/Expense/Transfer) في الصفحة الموحّدة
// ==============================================================

initTransactionForm("income");
initTransactionForm("expense");
// ملحوظة: transfer.js بينادي initTransferForm() لوحده جوّه نفسه

const tabs = document.querySelectorAll(".tx-tab");
const panels = {
    income: document.getElementById("incomeFormWrap"),
    expense: document.getElementById("expenseFormWrap"),
    transfer: document.getElementById("transferFormWrap")
};

function activateTab(target) {
    if (!panels[target]) return;

    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === target));

    Object.keys(panels).forEach(function(key) {
        panels[key].classList.toggle("active", key === target);
    });
}

tabs.forEach(function(tab) {
    tab.onclick = function() {
        activateTab(this.dataset.tab);
    };
});

// لو الصفحة اتفتحت برابط فيه ?tab=income/expense/transfer
const params = new URLSearchParams(window.location.search);
const requestedTab = params.get("tab");
if (requestedTab) {
    activateTab(requestedTab);
}

const closeBtn = document.getElementById("txCloseBtn");
if (closeBtn) {
    closeBtn.onclick = function () {
        window.location.href = "../index.html";
    };
}

const confirmBtn = document.getElementById("txConfirmBtn");
if (confirmBtn) {
    confirmBtn.onclick = function () {
        const activeTabBtn = document.querySelector(".tx-tab.active");
        if (!activeTabBtn) return;

        const activeType = activeTabBtn.dataset.tab;
        const saveBtn = document.getElementById(
            "save" + activeType.charAt(0).toUpperCase() + activeType.slice(1) + "Btn"
        );
        if (saveBtn) saveBtn.click();
    };
}
document.body.style.visibility = "visible";