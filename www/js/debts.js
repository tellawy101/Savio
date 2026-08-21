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
const payDebtModal = document.getElementById("payDebtModal");
const payAmount = document.getElementById("payAmount");
const payAccount = document.getElementById("payAccount");
const cancelPayBtn = document.getElementById("cancelPayBtn");
const confirmPayBtn = document.getElementById("confirmPayBtn");

const editDebtModal = document.getElementById("editDebtModal");
const editDebtPerson = document.getElementById("editDebtPerson");
const editDebtAmount = document.getElementById("editDebtAmount");
const editDebtDueDate = document.getElementById("editDebtDueDate");
const editDebtNotes = document.getElementById("editDebtNotes");
const cancelEditDebtBtn = document.getElementById("cancelEditDebtBtn");
const saveEditDebtBtn = document.getElementById("saveEditDebtBtn");

const editDebtTypeButtons = document.querySelectorAll(".edit-debt-type-btn");

editDebtTypeButtons.forEach(button => {

    button.onclick = function () {

        editDebtTypeButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

    };

});

let editingDebt = null;
let currentPayDebt = null;

// ==============================
// Storage
// ==============================


let debts = JSON.parse(localStorage.getItem("debts")) || [];


// ==============================
// Modal
// ==============================

addDebtBtn.onclick = function () {

    debtDueDate.value =
        new Date().toISOString().split("T")[0];

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
cancelPayBtn.onclick = function () {

    payDebtModal.classList.remove("show");
    currentPayDebt = null;

};

payDebtModal.onclick = function (e) {

    if (e.target === payDebtModal) {

        payDebtModal.classList.remove("show");
        currentPayDebt = null;

    }

};

cancelEditDebtBtn.onclick = function () {

    editDebtModal.classList.remove("show");
    editingDebt = null;

};

editDebtModal.onclick = function (e) {

    if (e.target === editDebtModal) {

        editDebtModal.classList.remove("show");
        editingDebt = null;

    }

};



// ==============================
// Save Debt
// ==============================

saveDebtBtn.onclick = function () {

    const person = debtPerson.value.trim();
    const amount = Number(debtAmount.value);

const dueDate = debtDueDate.value || new Date().toISOString().split("T")[0];


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

        dueDate: dueDate,

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
// Confirm Pay
// ==============================

confirmPayBtn.onclick = function() {
    
    if (!currentPayDebt) return;
    
    const payment = Number(payAmount.value);
    const account = payAccount.value;
    
    if (!account) {
        alert("Please select an account");
        return;
    }
    
    if (!payment || payment <= 0) {
        alert("Please enter a valid amount");
        payAmount.focus();
        return;
    }
    
    if (payment > currentPayDebt.remaining) {
        alert("Payment is greater than remaining amount");
        return;
    }
    
    currentPayDebt.paid += payment;
    currentPayDebt.remaining -= payment;
    currentPayDebt.status = currentPayDebt.remaining === 0 ? "paid" : "open";
    
    localStorage.setItem("debts", JSON.stringify(debts));
    
    // تسجيل المبلغ كمعاملة Income أو Expense حسب نوع الدين
    const transactions = loadTransactions();
    
    transactions.push({
        amount: payment,
        account: account,
        description: currentPayDebt.type === "receivable" ?
            `Debt payment from ${currentPayDebt.person}` :
            `Debt payment to ${currentPayDebt.person}`,
        category: "Debt Payment",
        categoryIcon: "hand-coins",
        type: currentPayDebt.type === "receivable" ? "income" : "expense",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });
    
    saveTransactions(transactions);
    
    renderDebts();
    
    payDebtModal.classList.remove("show");
    currentPayDebt = null;
    
    showToast("Payment Added", "success");
    
};

// ==============================
// Save Edited Debt
// ==============================

saveEditDebtBtn.onclick = function () {

    if (!editingDebt) return;

    const person = editDebtPerson.value.trim();
    const amount = Number(editDebtAmount.value);
    const dueDate = editDebtDueDate.value || editingDebt.dueDate;
    const activeTypeBtn = document.querySelector(".edit-debt-type-btn.active");
    const type = activeTypeBtn ? activeTypeBtn.dataset.type : editingDebt.type;

    if (person === "") {
        alert("Please enter person name");
        editDebtPerson.focus();
        return;
    }

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        editDebtAmount.focus();
        return;
    }

    editingDebt.person = person;
    editingDebt.amount = amount;
    editingDebt.type = type;
    editingDebt.dueDate = dueDate;
    editingDebt.notes = editDebtNotes.value.trim();

    editingDebt.remaining = Math.max(0, editingDebt.amount - editingDebt.paid);
    editingDebt.status = editingDebt.remaining === 0 ? "paid" : "open";

    localStorage.setItem("debts", JSON.stringify(debts));

    renderDebts();

    editDebtModal.classList.remove("show");
    editingDebt = null;

    showToast("Debt Updated", "success");

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
        const remaining = Number(debt.remaining) || 0;
        if (debt.type === "receivable") {
            receivable += remaining;
        } else {
            payable += remaining;
        }
    });

    [...debts].reverse().forEach(debt => {

        const isSettled = debt.remaining === 0;

        const wrapper = document.createElement("div");
        wrapper.className = "debt-card-wrapper";

        wrapper.innerHTML = `
            <div class="debt-card-bg bg-delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-2 14H7L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
                Delete
            </div>
            <div class="debt-card-bg bg-edit">
                Edit
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </div>

            <div class="debt-card">

                <div class="debt-card-header">
                    <h3 class="debt-person-name">${debt.person}</h3>
                    <span class="debt-badge ${isSettled ? "settled" : debt.type}">
                        ${isSettled ? "Settled" : (debt.type === "receivable" ? "Owed to You" : "You Owe")}
                    </span>
                </div>

                <div class="debt-card-main-row">
                    <div class="debt-card-details">
                        ${debt.dueDate || "No due date"}
                    </div>

                    <div class="debt-card-amount">
                        ${debt.type === "receivable" ? "+" : "-"} EGP ${Number(debt.remaining).toLocaleString("en-US")}
                    </div>
                </div>

                <div class="debt-card-main-row">
                    ${
                        debt.paid > 0
                        ? `<span class="debt-paid-note">Paid EGP ${Number(debt.paid).toLocaleString("en-US")}</span>`
                        : `<span></span>`
                    }
                    ${
                        !isSettled
                        ? `<button class="debt-card-pay-btn">Pay</button>`
                        : ``
                    }
                </div>
            </div>
        `;

        const card = wrapper.querySelector(".debt-card");
        const bgDelete = wrapper.querySelector(".bg-delete");
        const bgEdit = wrapper.querySelector(".bg-edit");

        if (!isSettled) {
            const payBtn = wrapper.querySelector(".debt-card-pay-btn");
            payBtn.onclick = function (e) {
                e.stopPropagation();
                currentPayDebt = debt;
                payAmount.value = "";

                const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

                payAccount.innerHTML = `<option value="">${t("select_account")}</option>` +
                    accounts.map(acc => `<option value="${acc.name}">${acc.name}</option>`).join("");

                payDebtModal.classList.add("show");
            };
        }

        let startX = 0;
        let currentX = 0;
        let dragging = false;

        card.addEventListener("touchstart", function (e) {
            startX = e.touches[0].clientX;
            dragging = true;
            card.style.transition = "none";
        });

        card.addEventListener("touchmove", function(e) {
    if (!dragging) return;
    currentX = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${currentX}px)`;
    
    if (currentX > 0) {
        bgDelete.classList.add("show");
        bgEdit.classList.remove("show");
    } else if (currentX < 0) {
        bgEdit.classList.add("show");
        bgDelete.classList.remove("show");
    }
});

        card.addEventListener("touchend", function () {
            dragging = false;
            card.style.transition = "transform 0.25s ease";

            if (currentX > 80) {

                const confirmed = confirm("Are you sure you want to delete this debt?");
                if (confirmed) {
                    debts = debts.filter(d => d.id !== debt.id);
                    localStorage.setItem("debts", JSON.stringify(debts));
                    renderDebts();
                    showToast("Debt Deleted", "success");
                    return;
                }

            } else if (currentX < -80) {

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

            }

            card.style.transform = "translateX(0)";
            currentX = 0;
            bgDelete.classList.remove("show");
            bgEdit.classList.remove("show");

        });
        debtsList.appendChild(wrapper);

    });

    totalReceivable.innerText = "EGP " + Math.round(receivable).toLocaleString("en-US");
    totalPayable.innerText = "EGP " + Math.round(payable).toLocaleString("en-US");

    const net = receivable - payable;

    netBalance.querySelector(".currency").innerText = "EGP";
    netBalance.querySelector(".amount").innerText = Math.round(net).toLocaleString("en-US");

    lucide.createIcons();

}
renderDebts();