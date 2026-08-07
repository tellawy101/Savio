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

const debtPerson = document.getElementById("debtPerson");

const debtAmount = document.getElementById("debtAmount");

const debtDueDate = document.getElementById("debtDueDate");

const debtNotes = document.getElementById("debtNotes");

const debtsList = document.getElementById("debtsList");

const totalReceivable = document.getElementById("totalReceivable");

const totalPayable = document.getElementById("totalPayable");


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

    if (
        debtPerson.value.trim() === "" ||
        debtAmount.value.trim() === ""
    ) {

        alert("Please enter person name and amount");

        return;

    }

    const debt = {

        id: Date.now(),

        type: debtType.value,

        person: debtPerson.value.trim(),

        amount: Number(debtAmount.value),

        paid: 0,

        remaining: Number(debtAmount.value),

        dueDate: debtDueDate.value,

        notes: debtNotes.value.trim(),

        status: "open",

        createdAt: new Date().toLocaleDateString()

    };

    debts.push(debt);

    localStorage.setItem("debts", JSON.stringify(debts));

    renderDebts();
    clearForm();

    debtModal.classList.remove("show");

    showToast("Debt Added", "success");

};



// ==============================
// Clear Form
// ==============================

function clearForm() {

    debtType.selectedIndex = 0;

    debtPerson.value = "";

    debtAmount.value = "";

    debtDueDate.value = "";

    debtNotes.value = "";

}
// ==============================
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

deleteBtn.onclick = function (e) {

    e.stopPropagation();

    alert("Delete .debt-actions button works");

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
    lucide.createIcons();

}
renderDebts();

