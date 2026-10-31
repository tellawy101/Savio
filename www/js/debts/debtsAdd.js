// ======================================
// debts/debtsAdd.js
// مودال إضافة دين جديد
// ======================================

function initDebtsAdd(debts, renderDebts) {
    const debtModal = document.getElementById("debtModal");
    const addDebtBtn = document.getElementById("addDebtBtn");
    const cancelDebtBtn = document.getElementById("cancelDebtBtn");
    const saveDebtBtn = document.getElementById("saveDebtBtn");
    const debtType = document.getElementById("debtType");

    const debtTypeButtons = document.querySelectorAll(".debt-type-btn");
    debtTypeButtons.forEach(button => {
        button.onclick = function () {
            debtType.value = this.dataset.type;
            debtTypeButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
        };
    });

    const debtPerson = document.getElementById("debtPerson");
    const debtAmount = document.getElementById("debtAmount");
    const debtDueDate = document.getElementById("debtDueDate");
    const debtNotes = document.getElementById("debtNotes");

    attachThousandsFormatter(debtAmount);

        const debtDueDateText = document.getElementById("debtDueDateText");
    
    if (debtDueDate) {
        debtDueDate.onchange = function() {
            syncDateText(debtDueDate, debtDueDateText);
        };
    }
    
    if (addDebtBtn) {
        addDebtBtn.onclick = function() {
            debtDueDate.value = getTodayDateString();
            syncDateText(debtDueDate, debtDueDateText);
            debtModal.classList.add("show");
        };
    }
    if (cancelDebtBtn) {
        cancelDebtBtn.onclick = function () {
            debtModal.classList.remove("show");
        };
    }

    closeModalOnBackdropClick(debtModal);

    if (saveDebtBtn) {
    saveDebtBtn.onclick = async function() {
                const person = debtPerson.value.trim();
const amount = readAmount(debtAmount);
                const dueDate = debtDueDate.value || getTodayDateString();
                
                if (person === "") {
                    await customAlert(t("debts_enter_person_alert"));
                    debtPerson.focus();
                    return;
                }
                
                if (!amount || amount <= 0) {
                    await customAlert(t("debts_enter_amount_alert"));
                    debtAmount.focus();
                    return;
                }

            const debt = {
                id: generateTransactionId("debt"),
                type: debtType.value,
                person: person,
                amount: amount,
                paid: 0,
                remaining: amount,
                dueDate: dueDate,
                notes: debtNotes.value.trim(),
                status: "open",
createdAt: new Date().toISOString()
            };

            debts.push(debt);
saveDebts(debts);
            renderDebts();
            clearForm();
            debtModal.classList.remove("show");
            showToast(t("debts_added_toast"), "success");
        };
    }

    function clearForm() {
        debtType.value = "receivable";
        debtTypeButtons.forEach(btn => btn.classList.remove("active"));
        document.querySelector('.debt-type-btn[data-type="receivable"]').classList.add("active");
        debtPerson.value = "";
        debtAmount.value = "";
        debtDueDate.value = "";
        debtNotes.value = "";
    }
}
