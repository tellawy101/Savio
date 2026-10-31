// ======================================
// debts/debtsEdit.js
// مودال تعديل الدين (فتح / حفظ / إلغاء)
// ======================================

function initDebtsEdit(debts, renderDebts) {
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
            editDebtTypeButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
        };
    });

let editingDebt = null;
    attachThousandsFormatter(editDebtAmount);

    if (cancelEditDebtBtn) {
        cancelEditDebtBtn.onclick = function () {
            editDebtModal.classList.remove("show");
            editingDebt = null;
        };
    }

    closeModalOnBackdropClick(editDebtModal, function () {
    editingDebt = null;
});

    if (saveEditDebtBtn) {
    saveEditDebtBtn.onclick = async function() {
                if (!editingDebt) return;

            const person = editDebtPerson.value.trim();
const amount = readAmount(editDebtAmount);
            const dueDate = editDebtDueDate.value || editingDebt.dueDate;
            const activeTypeBtn = document.querySelector(".edit-debt-type-btn.active");
            const type = activeTypeBtn ? activeTypeBtn.dataset.type : editingDebt.type;

            if (person === "") {
    await customAlert(t("debts_enter_person_alert"));
    editDebtPerson.focus();
    return;
}

if (!amount || amount <= 0) {
    await customAlert(t("debts_enter_amount_alert"));
    editDebtAmount.focus();
    return;
}
if (amount < editingDebt.paid) {
    await customAlert(t("debts_amount_below_paid_alert"));
    editDebtAmount.focus();
    return;
}
if (type !== editingDebt.type && Array.isArray(editingDebt.payments) && editingDebt.payments.length > 0) {
    await customAlert(t("debts_type_change_blocked_alert"));
    return;
}
            editingDebt.person = person;
            editingDebt.amount = amount;
            editingDebt.type = type;
            editingDebt.dueDate = dueDate;
            editingDebt.notes = editDebtNotes.value.trim();

            editingDebt.remaining = Math.max(0, Math.round((editingDebt.amount - editingDebt.paid) * 100) / 100);
            editingDebt.status = editingDebt.remaining <= 0 ? "paid" : "open";

saveDebts(debts);
            renderDebts();
            editDebtModal.classList.remove("show");
            editingDebt = null;

            showToast(t("debts_updated_toast"), "success");
        };
    }

function openEditDebt(debt) {
                editingDebt = debt;

                editDebtPerson.value = debt.person;
                editDebtAmount.value = Number(debt.amount).toLocaleString("en-US");
                
                const editDebtDueDateText = document.getElementById("editDebtDueDateText");
                editDebtDueDate.value = debt.dueDate || "";
                syncDateText(editDebtDueDate, editDebtDueDateText);
                editDebtDueDate.onchange = function() {
                    syncDateText(editDebtDueDate, editDebtDueDateText);
                };
                editDebtNotes.value = debt.notes || "";

                editDebtTypeButtons.forEach(btn => {
                    btn.classList.remove("active");
                    if (btn.dataset.type === debt.type) {
                        btn.classList.add("active");
                    }
                });

                editDebtModal.classList.add("show");
}

return { openEditDebt };
}
