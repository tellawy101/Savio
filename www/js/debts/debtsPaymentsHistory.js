// ======================================
// debts/debtsPaymentsHistory.js
// سجل دفعات الدين (عرض + حذف دفعة)
// ======================================

function initDebtsPaymentsHistory(debts, renderDebts) {
    const paymentsHistoryModal = document.getElementById("paymentsHistoryModal");
    const paymentsHistoryList = document.getElementById("paymentsHistoryList");
    const paymentsHistoryTitle = document.getElementById("paymentsHistoryTitle");
    const closePaymentsHistoryBtn = document.getElementById("closePaymentsHistoryBtn");

    async function deletePayment(debt, payment) {
        const confirmed = await customConfirm(t("debts_payment_delete_confirm"), { danger: true });

        if (!confirmed) return;
        const removedPaymentTxs = loadTransactions().filter(function(tx) {
            return tx.debtPaymentId === payment.id;
        });
                const transactions = loadTransactions().filter(function(tx) {
            return tx.debtPaymentId !== payment.id;
        });
        
        // نحفظ المعاملات الأول، ولو فشل مفيش حاجة اتغيرت في الدين
        if (!saveTransactions(transactions)) return;
        
        debt.payments = debt.payments.filter(function(p) {
            return p.id !== payment.id;
        });
        
        debt.paid = Math.max(0, Math.round((debt.paid - payment.amount) * 100) / 100);
        debt.remaining = Math.round((debt.amount - debt.paid) * 100) / 100;
        debt.status = debt.remaining <= 0 ? "paid" : "open";
        
        saveDebts(debts);

        renderDebts();
        openPaymentsHistory(debt);

                showUndoToast(
            t("debts_payment_deleted_toast"),
            function() {
                if (!getDebts().some(function(d) { return d.id === debt.id; })) return;
                if (!saveTransactions(loadTransactions().concat(removedPaymentTxs))) return;
                restoreDebtPayment({ debtId: debt.id, payment: payment });
                debts.splice(0, debts.length, ...getDebts());
                renderDebts();
                const freshDebt = debts.find(function(d) { return d.id === debt.id; });
                if (freshDebt && paymentsHistoryModal && paymentsHistoryModal.classList.contains("show")) {
                    openPaymentsHistory(freshDebt);
                }
            }
        );
    }

    function openPaymentsHistory(debt) {
        if (!paymentsHistoryModal || !paymentsHistoryList) return;

        const payments = Array.isArray(debt.payments) ? debt.payments : [];

        paymentsHistoryTitle.textContent = t("debts_history_title") + " - " + debt.person;
        paymentsHistoryList.innerHTML = "";

        if (payments.length === 0) {
            const empty = document.createElement("div");
            empty.className = "payments-history-empty";
            empty.textContent = t("debts_history_empty");
            paymentsHistoryList.appendChild(empty);
        } else {
            [...payments].reverse().forEach(function (payment) {
                const row = document.createElement("div");
                row.className = "payment-row";

                const main = document.createElement("div");
                main.className = "payment-row-main";

                const account = document.createElement("span");
                account.className = "payment-row-account";
account.textContent = getAccountNameById(payment.accountId, payment.account);

                const date = document.createElement("span");
                date.className = "payment-row-date";
date.textContent = [payment.date, payment.time].filter(Boolean).join(" ");

                main.appendChild(account);
                main.appendChild(date);

                const end = document.createElement("div");
                end.className = "payment-row-end";

                const amount = document.createElement("span");
                amount.className = "payment-row-amount " + debt.type;
                amount.textContent =
(debt.type === "receivable" ? "+" : "-") + " " + getCurrency() + " " +
formatAmountNumber(payment.amount);

                const deleteBtn = document.createElement("button");
                deleteBtn.type = "button";
                deleteBtn.className = "payment-delete-btn";
                deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-2 14H7L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>';
                deleteBtn.onclick = function () {
                    deletePayment(debt, payment);
                };

                end.appendChild(amount);
                end.appendChild(deleteBtn);

                row.appendChild(main);
                row.appendChild(end);
                paymentsHistoryList.appendChild(row);
            });
        }

        paymentsHistoryModal.classList.add("show");
    }

    if (closePaymentsHistoryBtn) {
        closePaymentsHistoryBtn.onclick = function () {
            paymentsHistoryModal.classList.remove("show");
        };
    }

    closeModalOnBackdropClick(paymentsHistoryModal);

return { openPaymentsHistory };
}
