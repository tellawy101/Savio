// ======================================
// debts/debtsPay.js
// مودال سداد الدين (فتح / تأكيد / إلغاء)
// ======================================

function initDebtsPay(debts, renderDebts) {
    const payDebtModal = document.getElementById("payDebtModal");
    const payAmount = document.getElementById("payAmount");
    const payAccount = document.getElementById("payAccount");
    const cancelPayBtn = document.getElementById("cancelPayBtn");
    const confirmPayBtn = document.getElementById("confirmPayBtn");

    const payDate = document.getElementById("payDate");
    const payDateText = document.getElementById("payDateText");
    if (payDate) {
        payDate.onchange = function () {
            syncDateText(payDate, payDateText);
        };
    }
       const payDebtInfo = document.getElementById("payDebtInfo");
    const payFullBtn = document.getElementById("payFullBtn");
    if (payFullBtn) {
        payFullBtn.onclick = function() {
            if (!currentPayDebt) return;
            payAmount.value = Number(currentPayDebt.remaining).toLocaleString("en-US");
        };
    } 

let currentPayDebt = null;
    attachThousandsFormatter(payAmount);

    if (cancelPayBtn) {
        cancelPayBtn.onclick = function () {
            payDebtModal.classList.remove("show");
            currentPayDebt = null;
        };
    }

    closeModalOnBackdropClick(payDebtModal, function() {
    currentPayDebt = null;
});

    if (confirmPayBtn) {
        confirmPayBtn.onclick = async function() {
            if (!currentPayDebt) return;

const payment = Math.round(readAmount(payAmount) * 100) / 100;
            const accountId = payAccount.value;
const accountObj = getAccounts().find(function(a) { return a.id === accountId; });
const account = accountObj ? accountObj.name : "";

            if (!account) {
                await customAlert(t("debts_select_account_alert"));
                return;
            }

            if (!payment || payment <= 0) {
                await customAlert(t("debts_enter_amount_alert"));
                payAmount.focus();
                return;
            }

            if (payment > currentPayDebt.remaining) {
                await customAlert(t("debts_payment_exceeds_alert"));
                return;
            }
                        if (currentPayDebt.type === "payable") {
                const currentBalance = calculateAccountBalance(accountObj, loadTransactions());
                if (payment > currentBalance) {
                    const proceed = await customConfirm(t("debts_pay_low_balance_confirm"));
                    if (!proceed) return;
                }
            }

            const paymentId = generateTransactionId("pay");
            const dateText = payDate.value || getTodayDateString();
            const timeText = getCurrentTimeString();

            const transactions = loadTransactions();

            transactions.push({
                amount: payment,
                account: account,
                accountId: accountId,
                description: currentPayDebt.type === "receivable" ?
                    `${t("debts_payment_from")} ${currentPayDebt.person}` :
                    `${t("debts_payment_to")} ${currentPayDebt.person}`,
                category: "Debt Payment",
                categoryIcon: "hand-coins",
                type: currentPayDebt.type === "receivable" ? "income" : "expense",
                date: dateText,
                time: timeText,
                debtId: currentPayDebt.id,
                debtPaymentId: paymentId
            });

            // نحفظ المعاملات الأول، ولو فشل مفيش حاجة اتغيرت في الدين
            if (!saveTransactions(transactions)) return;

            if (!Array.isArray(currentPayDebt.payments)) currentPayDebt.payments = [];

            currentPayDebt.payments.push({
                id: paymentId,
                amount: payment,
                account: account,
                accountId: accountId,
                date: dateText,
                time: timeText
            });

            currentPayDebt.paid = Math.round((currentPayDebt.paid + payment) * 100) / 100;
            currentPayDebt.remaining = Math.round((currentPayDebt.remaining - payment) * 100) / 100;
            currentPayDebt.status = currentPayDebt.remaining <= 0 ? "paid" : "open";

            saveDebts(debts);
            renderDebts();

            payDebtModal.classList.remove("show");
            currentPayDebt = null;

            showToast(t("debts_payment_added_toast"), "success");
        };
    }

function openPayDebt(debt) {
                    currentPayDebt = debt;
                    payAmount.value = "";
                    payDate.value = getTodayDateString();
                    syncDateText(payDate, payDateText);
                                        payDebtInfo.textContent = debt.person + " - " + t("debts_pay_remaining_label") + ": " + getCurrency() + " " + formatAmountNumber(debt.remaining);
                    const accounts = getAccounts();

                                                            fillSelect(payAccount, [{ value: "", label: t("select_account") }].concat(
                        accounts.map(function(acc) { return { value: acc.id, label: acc.name }; })
                    ));
makeSelectSheet(payAccount, t("select_account"));
                    payDebtModal.classList.add("show");
}

return { openPayDebt };
}
