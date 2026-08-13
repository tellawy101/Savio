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
editDebtTypeButtons.forEach(button => {

    button.onclick = function () {

        editDebtTypeButtons.forEach(btn => {
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

const personDetailModal = document.getElementById("personDetailModal");
const personDetailName = document.getElementById("personDetailName");
const personDetailList = document.getElementById("personDetailList");
const closePersonDetailBtn = document.getElementById("closePersonDetailBtn");

closePersonDetailBtn.onclick = function () {
    personDetailModal.classList.remove("show");
};

personDetailModal.onclick = function (e) {
    if (e.target === personDetailModal) {
        personDetailModal.classList.remove("show");
    }
};

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

    // نحدّث "المتبقي" حسب المبلغ الجديد والمدفوع اللي فات، من غير ما يقل عن صفر
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

    // ==============================
    // حساب الإجماليات
    // ==============================

    debts.forEach(debt => {

        const remaining = Number(debt.remaining) || 0;

        if (debt.type === "receivable") {
            receivable += remaining;
        } else {
            payable += remaining;
        }

    });


    // ==============================
    // تجميع الديون حسب الشخص
    // ==============================

    const people = {};

    debts.forEach(debt => {

        const personKey =
            debt.person.trim().toLowerCase();

        if (!people[personKey]) {

            people[personKey] = {

                person: debt.person,

                receivable: 0,

                payable: 0,

                debts: []

            };

        }

        people[personKey].debts.push(debt);

        const remaining =
            Number(debt.remaining) || 0;

        if (debt.type === "receivable") {

            people[personKey].receivable += remaining;

        } else {

            people[personKey].payable += remaining;

        }

    });


    // ==============================
    // إنشاء كارت لكل شخص
    // ==============================

    Object.values(people)
        .reverse()
        .forEach(person => {

            const total =
                person.receivable -
                person.payable;


            const card =
                document.createElement("div");

            card.className = "debt-card";


            card.innerHTML = `

                <div class="debt-card-header">

                    <h3 class="debt-person-name">
                        ${person.person}
                    </h3>

                    <span class="debt-badge ${
                        total >= 0
                            ? "receivable"
                            : "payable"
                    }">

                        ${
                            total >= 0
                                ? "Owed to You"
                                : "You Owe"
                        }

                    </span>

                </div>


                <div class="debt-card-main-row">

                    <div class="debt-card-details">

                        ${
                            person.debts.length
                        }

                        ${
                            person.debts.length === 1
                                ? "Debt"
                                : "Debts"
                        }

                    </div>


                    <div class="debt-card-amount">

                        ${
                            total >= 0
                                ? "+"
                                : "-"
                        }

                        EGP ${
                            Math.abs(total)
                                .toLocaleString("en-US")
                        }

                    </div>

                </div>

            `;


            // ==============================
            // فتح صفحة الشخص
            // ==============================

            card.onclick = function () {

                window.location.href =
                    `person-debt.html?person=${encodeURIComponent(
                        person.person
                    )}`;

            };


            debtsList.appendChild(card);

        });


    // ==============================
    // تحديث الإجماليات
    // ==============================

    totalReceivable.innerText =
        "EGP " +
        Math.round(receivable)
            .toLocaleString("en-US");


    totalPayable.innerText =
        "EGP " +
        Math.round(payable)
            .toLocaleString("en-US");


    const net =
        receivable - payable;


    netBalance
        .querySelector(".currency")
        .innerText = "EGP";


    netBalance
        .querySelector(".amount")
        .innerText =
        Math.round(net)
            .toLocaleString("en-US");


    lucide.createIcons();

}

function openPersonDetail(personName) {

    const personDebts = debts.filter(d => d.person === personName);

    personDetailName.innerText = personName;

    personDetailList.innerHTML = "";

    personDebts.forEach(debt => {

        const row = document.createElement("div");
        row.className = "debt-card";

        row.innerHTML = `
            <div class="debt-card-main-row">
                <div class="debt-card-amount">
                    ${debt.type === "receivable" ? "+" : "-"} EGP ${Number(debt.remaining).toLocaleString("en-US")}
                </div>
                <div class="debt-card-details">
                    ${debt.dueDate || "No due date"}
                </div>
            </div>

            <div class="debt-actions">
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

        personDetailList.appendChild(row);
        const editBtn = row.querySelector(".edit-btn");
        const payBtn = row.querySelector(".pay-btn");
        const deleteBtn = row.querySelector(".delete-btn");

        editBtn.onclick = function () {

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

            personDetailModal.classList.remove("show");
            editDebtModal.classList.add("show");

        };

        payBtn.onclick = function () {

            const payment = Number(
                prompt(`Enter payment amount\nRemaining: ${debt.remaining} EGP`)
            );

            if (!payment || payment <= 0) return;

            if (payment > debt.remaining) {
                showToast("Payment is greater than remaining amount", "error");
                return;
            }

            debt.paid += payment;
            debt.remaining -= payment;
            debt.status = debt.remaining === 0 ? "paid" : "open";

            localStorage.setItem("debts", JSON.stringify(debts));

            renderDebts();
            openPersonDetail(personName);

            showToast("Payment Added", "success");

        };

        deleteBtn.onclick = function () {

            const confirmed = confirm("Are you sure you want to delete this debt?");
            if (!confirmed) return;

            debts = debts.filter(d => d.id !== debt.id);

            localStorage.setItem("debts", JSON.stringify(debts));

            renderDebts();

            if (debts.some(d => d.person === personName)) {
                openPersonDetail(personName);
            } else {
                personDetailModal.classList.remove("show");
            }

            showToast("Debt Deleted", "success");

        };

    });

    lucide.createIcons();

    personDetailModal.classList.add("show");

}
renderDebts();