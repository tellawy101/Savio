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
renderDebts();