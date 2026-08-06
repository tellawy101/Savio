// =======================================
// Debts.js
// إدارة صفحة الديون
// =======================================


// ==============================
// Elements
// ==============================

const backBtn = document.getElementById("backBtn");

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
// Navigation
// ==============================

backBtn.onclick = function () {

    window.location.href = "../index.html";

};


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

        <button class="edit-btn">✏️</button>

        <button class="pay-btn">💵</button>

        <button class="delete-btn">🗑</button>

    </div>
`;
const actions = card.querySelector(".debt-actions");

let pressTimer;

card.addEventListener("touchstart", function () {

    pressTimer = setTimeout(function () {

        actions.classList.remove("hidden");

    }, 600);

});

card.addEventListener("touchend", function () {

    clearTimeout(pressTimer);

});
        debtsList.appendChild(card);

    });

    totalReceivable.innerText = "EGP " + receivable.toFixed(2);

    totalPayable.innerText = "EGP " + payable.toFixed(2);

}
renderDebts();

