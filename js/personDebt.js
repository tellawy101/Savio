// =======================================
// Person Debt
// تفاصيل ديون شخص واحد
// =======================================

const params = new URLSearchParams(window.location.search);
const person = params.get("person");


// ==============================
// Storage
// ==============================

let debts = JSON.parse(localStorage.getItem("debts")) || [];


// ==============================
// Elements
// ==============================

const personStatus =
    document.getElementById("personStatus");

const personName =
    document.getElementById("personName");

const personTotal =
    document.getElementById("personTotal");

const personDebtCount =
    document.getElementById("personDebtCount");

const personDebtsList =
    document.getElementById("personDebtsList");

const personEmptyState =
    document.getElementById("personEmptyState");

const settlementBtn =
    document.getElementById("settlementBtn");

const payablesBtn =
    document.getElementById("payablesBtn");

const receivablesBtn =
    document.getElementById("receivablesBtn");
// ==============================
// Get Person Debts
// ==============================

function getPersonDebts() {

    if (!person) return [];

    return debts.filter(debt =>
        String(debt.person).trim().toLowerCase() ===
        String(person).trim().toLowerCase()
    );

}


// ==============================
// Render Person
// ==============================

function renderPersonDebt() {

    debts =
        JSON.parse(localStorage.getItem("debts")) || [];

    const personDebts = getPersonDebts();

    personDebtsList.innerHTML = "";


    // ==============================
    // Person Name
    // ==============================

    personName.innerText =
        person || "Person";


    // ==============================
    // Calculate Total
    // ==============================

    let receivable = 0;
    let payable = 0;

    personDebts.forEach(debt => {

        const remaining =
            Number(debt.remaining) || 0;

        if (debt.type === "receivable") {

            receivable += remaining;

        } else {

            payable += remaining;

        }

    });


    const total =
        receivable - payable;


    // ==============================
    // Status
    // ==============================

    if (total >= 0) {

        personStatus.innerText =
            "Owed to You";

    } else {

        personStatus.innerText =
            "You Owe";

    }


    // ==============================
    // Total
    // ==============================

    personTotal.innerText =
        Math.abs(total).toLocaleString("en-US");


    // ==============================
    // Count
    // ==============================

    personDebtCount.innerText =
        personDebts.length;


    // ==============================
    // Empty State
    // ==============================

    if (personDebts.length === 0) {

        personEmptyState.style.display =
            "block";

        return;

    }

    personEmptyState.style.display =
        "none";


    // ==============================
    // Render Debts
    // ==============================

    personDebts
        .slice()
        .reverse()
        .forEach(debt => {

            createDebtCard(debt);

        });


    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

}


// =======================================
// Create Debt Card
// =======================================

function createDebtCard(debt) {

    const card =
        document.createElement("div");

    card.className =
        "person-debt-card";


    const remaining =
        Number(debt.remaining) || 0;


    const isReceivable =
        debt.type === "receivable";


    const status =
        debt.status === "paid"
            ? "Paid"
            : "Open";


    card.innerHTML = `

        <div class="person-debt-header">

            <span class="person-debt-type ${
                isReceivable
                    ? "receivable"
                    : "payable"
            }">

                ${
                    isReceivable
                        ? "Owed to You"
                        : "You Owe"
                }

            </span>


            <span class="person-debt-status ${
                status === "paid"
                    ? "paid"
                    : "open"
            }">

                ${status}

            </span>

        </div>


        <div class="person-debt-amount">

            ${
                isReceivable
                    ? "+"
                    : "-"
            }

            EGP
            ${remaining.toLocaleString("en-US")}

        </div>


        <div class="person-debt-info">

            <span>
                📅 ${debt.dueDate || "No due date"}
            </span>

            ${
                debt.notes
                    ? `
                        <span>
                            📝 ${debt.notes}
                        </span>
                    `
                    : ""
            }

        </div>


        <div class="person-debt-actions">

            <button
                class="person-edit-btn"
                data-id="${debt.id}">

                ✏️ Edit

            </button>


            <button
                class="person-pay-btn"
                data-id="${debt.id}">

                💰 Pay

            </button>


            <button
                class="person-delete-btn"
                data-id="${debt.id}">

                🗑️ Delete

            </button>

        </div>

    `;


    // ==============================
    // Edit
    // ==============================

    card.querySelector(".person-edit-btn")
        .onclick = function () {

            editDebt(debt);

        };


    // ==============================
    // Pay
    // ==============================

    card.querySelector(".person-pay-btn")
        .onclick = function () {

            payDebt(debt);

        };


    // ==============================
    // Delete
    // ==============================

    card.querySelector(".person-delete-btn")
        .onclick = function () {

            deleteDebt(debt);

        };


    personDebtsList.appendChild(card);

}


// =======================================
// Pay Debt
// =======================================

function payDebt(debt) {

    const remaining =
        Number(debt.remaining) || 0;


    if (remaining <= 0) {

        alert("This debt is already paid.");

        return;

    }


    const payment =
        Number(
            prompt(
                `Enter payment amount\nRemaining: ${remaining} EGP`
            )
        );


    if (!payment || payment <= 0) {
        return;
    }


    if (payment > remaining) {

        alert(
            "Payment is greater than remaining amount."
        );

        return;

    }


    debt.paid =
        Number(debt.paid || 0) + payment;


    debt.remaining =
        remaining - payment;


    debt.status =
        debt.remaining === 0
            ? "paid"
            : "open";


    localStorage.setItem(
        "debts",
        JSON.stringify(debts)
    );


    renderPersonDebt();

}


// =======================================
// Delete Debt
// =======================================

function deleteDebt(debt) {

    const confirmed =
        confirm(
            `Delete this debt of ${debt.amount} EGP?`
        );


    if (!confirmed) {
        return;
    }


    debts =
        debts.filter(item =>
            item.id !== debt.id
        );


    localStorage.setItem(
        "debts",
        JSON.stringify(debts)
    );


    renderPersonDebt();

}


// =======================================
// Edit Debt
// =======================================

function editDebt(debt) {

    const newAmount =
        Number(
            prompt(
                `Edit amount\nCurrent: ${debt.amount} EGP`,
                debt.amount
            )
        );


    if (!newAmount || newAmount <= 0) {
        return;
    }


    debt.amount =
        newAmount;


    debt.remaining =
        Math.max(
            0,
            newAmount - Number(debt.paid || 0)
        );


    debt.status =
        debt.remaining === 0
            ? "paid"
            : "open";


    localStorage.setItem(
        "debts",
        JSON.stringify(debts)
    );


    renderPersonDebt();

}


// =======================================
// Start
// =======================================

renderPersonDebt();

// =======================================
// Bottom Nav Actions (Settlement / Payable / Receivable)
// =======================================

const navButtons = document.querySelectorAll(".person-nav-item");

const personActionModal = document.getElementById("personActionModal");
const personActionTitle = document.getElementById("personActionTitle");
const personActionAmount = document.getElementById("personActionAmount");
const personActionDate = document.getElementById("personActionDate");
const personActionNote = document.getElementById("personActionNote");

const closePersonActionModal = document.getElementById("closePersonActionModal");
const cancelPersonAction = document.getElementById("cancelPersonAction");
const savePersonAction = document.getElementById("savePersonAction");

let currentAction = null; // "settlement" | "payable" | "receivable"

navButtons.forEach(btn => {

    btn.onclick = function () {

        currentAction = this.dataset.action;

        personActionTitle.innerText =
            currentAction === "settlement"
                ? "Settlement"
                : currentAction === "payable"
                    ? "Add Payable"
                    : "Add Receivable";

        personActionAmount.value = "";
        personActionDate.value = new Date().toISOString().split("T")[0];
        personActionNote.value = "";

        personActionModal.classList.add("show");
        personActionAmount.focus();

    };

});

function closePersonAction() {
    personActionModal.classList.remove("show");
    currentAction = null;
}

closePersonActionModal.onclick = closePersonAction;
cancelPersonAction.onclick = closePersonAction;

personActionModal.onclick = function (e) {
    if (e.target === personActionModal) {
        closePersonAction();
    }
};

savePersonAction.onclick = function () {

    const amount = Number(personActionAmount.value);

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        personActionAmount.focus();
        return;
    }

    if (currentAction === "settlement") {

        const openDebts = debts.filter(d =>
            String(d.person).trim().toLowerCase() ===
            String(person).trim().toLowerCase() &&
            Number(d.remaining) > 0
        );

        if (openDebts.length === 0) {
            showToast("No open debts", "error");
            closePersonAction();
            return;
        }

        let remainingPayment = amount;

        for (const debt of openDebts) {

            if (remainingPayment <= 0) break;

            const payment = Math.min(remainingPayment, Number(debt.remaining));

            debt.paid = Number(debt.paid || 0) + payment;
            debt.remaining = Math.max(0, Number(debt.remaining) - payment);
            debt.status = debt.remaining === 0 ? "paid" : "open";

            remainingPayment -= payment;

        }

        localStorage.setItem("debts", JSON.stringify(debts));

        showToast("Settlement Added", "success");

    } else {

        const debt = {

            id: Date.now(),

            type: currentAction, // "payable" or "receivable"

            person: person,

            amount: amount,

            paid: 0,

            remaining: amount,

            dueDate: personActionDate.value || new Date().toISOString().split("T")[0],

            notes: personActionNote.value.trim(),

            status: "open",

            createdAt: new Date().toLocaleDateString()

        };

        debts.push(debt);

        localStorage.setItem("debts", JSON.stringify(debts));

        showToast(
            currentAction === "payable" ? "Payable Added" : "Receivable Added",
            "success"
        );

    }

    closePersonAction();
    renderPersonDebt();

};