// =======================================
// Debts.js
// إدارة صفحة الديون
// =======================================


// ==============================
// Elements
// ==============================



const debtModal = document.getElementById("debtModal");

const addDebtBtn = document.getElementById("addDebtBtn");

const cancelDebtBtn = document.getElementById("cancelDebtBtn");

const saveDebtBtn = document.getElementById("saveDebtBtn");

const debtType = document.getElementById("debtType");

const editDebtModal = document.getElementById("editDebtModal");

const editDebtPerson = document.getElementById("editDebtPerson");

const editDebtAmount = document.getElementById("editDebtAmount");

const editDebtDueDate = document.getElementById("editDebtDueDate");

const editDebtNotes = document.getElementById("editDebtNotes");

const cancelEditDebtBtn = document.getElementById("cancelEditDebtBtn");

const saveEditDebtBtn = document.getElementById("saveEditDebtBtn");

const editDebtTypeButtons =
    document.querySelectorAll(".edit-debt-type-btn");
    let editingDebt = null;

const debtTypeButtons = document.querySelectorAll(".debt-type-btn");

debtTypeButtons.forEach(button => {

    button.onclick = function () {

        debtType.value = this.dataset.type;

        debtTypeButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

    };

});


const debtPerson = document.getElementById("debtPerson");

const debtAmount = document.getElementById("debtAmount");

const debtDueDate = document.getElementById("debtDueDate");

const debtNotes = document.getElementById("debtNotes");

const debtsList = document.getElementById("debtsList");

const totalReceivable = document.getElementById("totalReceivable");

const totalPayable = document.getElementById("totalPayable");
const netBalance = document.getElementById("netBalance");

// ==============================
// Storage
// ==============================


let debts = JSON.parse(localStorage.getItem("debts")) || [];


// ==============================
// Modal
// ==============================

addDebtBtn.onclick = function () {

    debtModal.classList.add("show");

};

cancelDebtBtn.onclick = function () {

    debtModal.classList.remove("show");

};

debtModal.onclick = function (e) {

    if (e.target === debtModal) {

        debtModal.classList.remove("show");

    }

};


// ==============================
// Save Debt
// ==============================

saveDebtBtn.onclick = function () {

    const person = debtPerson.value.trim();
    const amount = Number(debtAmount.value);

    // التحقق من البيانات
    if (person === "") {
        alert("Please enter person name");
        debtPerson.focus();
        return;
    }

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        debtAmount.focus();
        return;
    }

    // إنشاء الدين
    const debt = {

        id: Date.now(),

        type: debtType.value,

        person: person,

        amount: amount,

        paid: 0,

        remaining: amount,

        dueDate: debtDueDate.value,

        notes: debtNotes.value.trim(),

        status: "open",

        createdAt: new Date().toLocaleDateString()

    };

    // إضافة الدين
    debts.push(debt);

    // حفظ في الجهاز
    localStorage.setItem(
        "debts",
        JSON.stringify(debts)
    );

    // تحديث القائمة والأرقام
    renderDebts();

    // تنظيف الحقول
    clearForm();

    // إغلاق النافذة
    debtModal.classList.remove("show");

    // رسالة نجاح
    showToast("Debt Added", "success");

};

// ==============================
// Clear Form
// ==============================

function clearForm() {
    
    debtType.value = "receivable";
    
    debtTypeButtons.forEach(btn => {
        btn.classList.remove("active");
    });
    
    document
        .querySelector('.debt-type-btn[data-type="receivable"]')
        .classList.add("active");
    
    debtPerson.value = "";
    
    debtAmount.value = "";
    
    debtDueDate.value = "";
    
    debtNotes.value = "";
    
}// ==============================
// Render Debts
// ==============================

function renderDebts() {

    debtsList.innerHTML = "";

    let receivable = 0;

    let payable = 0;

    debts.forEach(debt => {

        if (debt.type === "receivable") {

            receivable += debt.remaining;

        } else {

            payable += debt.remaining;

        }

        const card = document.createElement("div");
        
        

        card.className = "debt-card";

        card.innerHTML = `
    <div class="debt-title">${debt.person}</div>

    <div>Original : ${debt.amount} EGP</div>

    <div>Paid : ${debt.paid} EGP</div>

    <div>Remaining : ${debt.remaining} EGP</div>

    <div>Status : ${debt.status}</div>

   <div class="debt-actions hidden">
    <button class="edit-btn">
        <i data-lucide="pen"></i>
    </button>

    <button class="pay-btn">
        <i data-lucide="hand-coins"></i>
    </button>

    <button class="delete-btn">
        <i data-lucide="trash-2"></i>
    </button>
</div>
`;
const editBtn = card.querySelector(".edit-btn");
const payBtn = card.querySelector(".pay-btn");
const deleteBtn = card.querySelector(".delete-btn");

editBtn.onclick = function (e) {

    e.stopPropagation();

    editingDebt = debt;

    editDebtPerson.value = debt.person;

    editDebtAmount.value = debt.amount;

    editDebtDueDate.value = debt.dueDate || "";

    editDebtNotes.value = debt.notes || "";

    editDebtTypeButtons.forEach(btn => {

        btn.classList.remove("active");

        if (btn.dataset.type === debt.type) {
            btn.classList.add("active");
        }

    });

    editDebtModal.classList.add("show");

};

payBtn.onclick = function (e) {

    e.stopPropagation();

    const payment = Number(
        prompt(`Enter payment amount\nRemaining: ${debt.remaining} EGP`)
    );

    if (!payment || payment <= 0) {
        return;
    }

    if (payment > debt.remaining) {
        showToast("Payment is greater than remaining amount", "error");
        return;
    }

    debt.paid += payment;

    debt.remaining -= payment;

    if (debt.remaining === 0) {
        debt.status = "paid";
    } else {
        debt.status = "open";
    }

    localStorage.setItem(
        "debts",
        JSON.stringify(debts)
    );

    renderDebts();

    showToast("Payment Added", "success");

};

deleteBtn.onclick = function (e) {

    e.stopPropagation();

    const confirmed = confirm("Are you sure you want to delete this debt?");

    if (!confirmed) {
        return;
    }

    debts = debts.filter(d => d.id !== debt.id);

    localStorage.setItem("debts", JSON.stringify(debts));

    renderDebts();

    showToast("Debt Deleted", "success");

};

        debtsList.appendChild(card);
card.onclick = function () {

    const actions = card.querySelector(".debt-actions");
    const isHidden = actions.classList.contains("hidden");

    // يقفل كل القوائم
    document.querySelectorAll(".debt-actions").forEach(menu => {
        menu.classList.add("hidden");
    });

    // لو كانت مقفولة يفتحها، ولو مفتوحة يسيبها مقفولة
    if (isHidden) {
        actions.classList.remove("hidden");
    }

};
    });

    totalReceivable.innerText =
    "EGP " + Math.round(receivable).toLocaleString("en-US");

totalPayable.innerText =
    "EGP " + Math.round(payable).toLocaleString("en-US");

const net = receivable - payable;

netBalance.querySelector(".currency").innerText = "EGP";

netBalance.querySelector(".amount").innerText =
    Math.round(net).toLocaleString("en-US");

lucide.createIcons();

}
renderDebts();

