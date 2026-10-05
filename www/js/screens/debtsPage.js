// ==============================================================
// screens/debtsPage.js
// كل منطق صفحة الديون مجمّع في دالة واحدة initDebtsPage()
// بتتنادى يدويًا من الراوتر بعد ما محتوى الصفحة يتحقن جوه #app
// ==============================================================

function initDebtsPage() {

    const modalsPlaceholder = document.getElementById("modals-placeholder");
    if (modalsPlaceholder) {
        modalsPlaceholder.innerHTML = renderSharedModals();
    }

    // ------------------------------
    // العناصر (لازم نجيبها "طازة" كل مرة، لأن الصفحة بتتحقن من جديد)
    // ------------------------------
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
            editDebtTypeButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
        };
    });

    let editingDebt = null;
    let currentPayDebt = null;

    // ------------------------------
    // Storage
    // ------------------------------
    let debts = getDebts();                     
    // ------------------------------
    // Payments History
    // ------------------------------
    const paymentsHistoryModal = document.getElementById("paymentsHistoryModal");
    const paymentsHistoryList = document.getElementById("paymentsHistoryList");
    const paymentsHistoryTitle = document.getElementById("paymentsHistoryTitle");
    const closePaymentsHistoryBtn = document.getElementById("closePaymentsHistoryBtn");

    async function deletePayment(debt, payment) {
        const confirmed = await customConfirm(t("debts_payment_delete_confirm"), { danger: true });

        if (!confirmed) return;

        debt.payments = debt.payments.filter(function (p) {
            return p.id !== payment.id;
        });

        debt.paid = Math.max(0, Math.round((debt.paid - payment.amount) * 100) / 100);
        debt.remaining = Math.round((debt.amount - debt.paid) * 100) / 100;
        debt.status = debt.remaining <= 0 ? "paid" : "open";

        saveDebts(debts);

        const transactions = loadTransactions().filter(function (tx) {
            return tx.debtPaymentId !== payment.id;
        });

        saveTransactions(transactions);

        renderDebts();
        openPaymentsHistory(debt);

        showToast(t("debts_payment_deleted_toast"), "success");
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
                account.textContent = payment.account;

                const date = document.createElement("span");
                date.className = "payment-row-date";
                date.textContent = payment.date + " " + payment.time;

                main.appendChild(account);
                main.appendChild(date);

                const end = document.createElement("div");
                end.className = "payment-row-end";

                const amount = document.createElement("span");
                amount.className = "payment-row-amount " + debt.type;
                amount.textContent =
                    (debt.type === "receivable" ? "+" : "-") + " EGP " +
                    Number(payment.amount).toLocaleString("en-US");

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

    if (paymentsHistoryModal) {
        paymentsHistoryModal.onclick = function (e) {
            if (e.target === paymentsHistoryModal) {
                paymentsHistoryModal.classList.remove("show");
            }
        };
    }
    // ------------------------------
    // Modals
    // ------------------------------
    if (addDebtBtn) {
        addDebtBtn.onclick = function () {
            debtDueDate.value = new Date().toISOString().split("T")[0];
            debtModal.classList.add("show");
        };
    }

    if (cancelDebtBtn) {
        cancelDebtBtn.onclick = function () {
            debtModal.classList.remove("show");
        };
    }

    if (debtModal) {
        debtModal.onclick = function (e) {
            if (e.target === debtModal) debtModal.classList.remove("show");
        };
    }

    if (cancelPayBtn) {
        cancelPayBtn.onclick = function () {
            payDebtModal.classList.remove("show");
            currentPayDebt = null;
        };
    }

    if (payDebtModal) {
        payDebtModal.onclick = function (e) {
            if (e.target === payDebtModal) {
                payDebtModal.classList.remove("show");
                currentPayDebt = null;
            }
        };
    }

    if (cancelEditDebtBtn) {
        cancelEditDebtBtn.onclick = function () {
            editDebtModal.classList.remove("show");
            editingDebt = null;
        };
    }

    if (editDebtModal) {
        editDebtModal.onclick = function (e) {
            if (e.target === editDebtModal) {
                editDebtModal.classList.remove("show");
                editingDebt = null;
            }
        };
    }

    // ------------------------------
    // Save Debt
    // ------------------------------
    if (saveDebtBtn) {
    saveDebtBtn.onclick = async function() {
                const person = debtPerson.value.trim();
                const amount = Number(debtAmount.value);
                const dueDate = debtDueDate.value || new Date().toISOString().split("T")[0];
                
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

            debts.push(debt);
saveDebts(debts);
            renderDebts();
            clearForm();
            debtModal.classList.remove("show");
            showToast(t("debts_added_toast"), "success");
        };
    }

    // ------------------------------
    // Confirm Pay
    // ------------------------------
    if (confirmPayBtn) {
        confirmPayBtn.onclick = async function() {
            if (!currentPayDebt) return;

            const payment = Math.round(Number(payAmount.value) * 100) / 100;
            const account = payAccount.value;

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

            const now = new Date();
            const paymentId = Date.now();
            const dateText = now.toISOString().split("T")[0];
            const timeText = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            if (!Array.isArray(currentPayDebt.payments)) currentPayDebt.payments = [];

            currentPayDebt.payments.push({
                id: paymentId,
                amount: payment,
                account: account,
                date: dateText,
                time: timeText
            });

            currentPayDebt.paid = Math.round((currentPayDebt.paid + payment) * 100) / 100;
            currentPayDebt.remaining = Math.round((currentPayDebt.remaining - payment) * 100) / 100;
            currentPayDebt.status = currentPayDebt.remaining <= 0 ? "paid" : "open";

            saveDebts(debts);

            const transactions = loadTransactions();

            transactions.push({
                amount: payment,
                account: account,
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

            saveTransactions(transactions);
            renderDebts();

            payDebtModal.classList.remove("show");
            currentPayDebt = null;

            showToast(t("debts_payment_added_toast"), "success");
        };
    }
    // ------------------------------
    // Save Edited Debt
    // ------------------------------
    if (saveEditDebtBtn) {
    saveEditDebtBtn.onclick = async function() {
                if (!editingDebt) return;

            const person = editDebtPerson.value.trim();
            const amount = Number(editDebtAmount.value);
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

    // ------------------------------
    // Clear Form
    // ------------------------------
    function clearForm() {
        debtType.value = "receivable";
        debtTypeButtons.forEach(btn => btn.classList.remove("active"));
        document.querySelector('.debt-type-btn[data-type="receivable"]').classList.add("active");
        debtPerson.value = "";
        debtAmount.value = "";
        debtDueDate.value = "";
        debtNotes.value = "";
    }
    
    document.addEventListener("touchstart", function (e) {
        document.querySelectorAll(".debt-card").forEach(function (otherCard) {
            if (!otherCard.contains(e.target)) {
                otherCard.style.transform = "translateX(0px)";
                const otherWrapper = otherCard.closest(".debt-card-wrapper");
                if (otherWrapper) {
                    otherWrapper.querySelector(".bg-delete").style.opacity = 0;
                    otherWrapper.querySelector(".bg-edit").style.opacity = 0;
                }
            }
        });
    });

    function renderDebts() {
    debtsList.innerHTML = "";
    
    const { receivable, payable, net } = calculateDebtTotals(debts);

        [...debts].reverse().forEach(debt => {
            const isSettled = debt.remaining <= 0;

            const wrapper = document.createElement("div");
            wrapper.className = "debt-card-wrapper";

            wrapper.innerHTML = `
    <div class="debt-card-bg bg-delete">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-2 14H7L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
    </div>
    <div class="debt-card-bg bg-edit">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
    </div>

    <div class="debt-card">

        <div class="debt-card-header">
            <h3 class="debt-person-name">${debt.person}</h3>
            <span class="debt-badge ${isSettled ? "settled" : debt.type}">
                ${isSettled ? t("debts_settled_badge") : (debt.type === "receivable" ? t("debts_owed_to_you_badge") : t("debts_you_owe_badge"))}
            </span>
        </div>

        <div class="debt-card-main-row">
            <div class="debt-card-details">
                ${debt.dueDate || t("debts_no_due_date")}            </div>

          <div class="debt-card-amount">
                ${debt.type === "receivable" ? "+" : "-"} <span class="debt-currency">EGP</span> <span class="debt-amount-value">${Number(debt.remaining).toLocaleString("en-US")}</span>
            </div>
        </div>

        <div class="debt-card-main-row">
            ${
                debt.paid > 0
                ? `<span class="debt-paid-note"><span class="debt-currency">EGP</span> <span class="debt-amount-value">${Number(debt.paid).toLocaleString("en-US")}</span> ${typeof t === "function" ? t("debts_paid_note") : "Paid"}</span>`
                : `<span></span>`
            }
            ${
                !isSettled
                ? `<button class="debt-card-pay-btn">${typeof t === "function" ? t("debts_pay_btn") : "Pay"}</button>`
                : ``
            }
        </div>
    </div>
`;
            
const card = wrapper.querySelector(".debt-card");
            const bgDelete = wrapper.querySelector(".bg-delete");
            const bgEdit = wrapper.querySelector(".bg-edit"); 
            
            const paidNote = wrapper.querySelector(".debt-paid-note");

            if (paidNote) {
                paidNote.onclick = function (e) {
                    e.stopPropagation();
                    openPaymentsHistory(debt);
                };
            }
            if (!isSettled) {
                const payBtn = wrapper.querySelector(".debt-card-pay-btn");
                payBtn.onclick = function (e) {
                    e.stopPropagation();
                    currentPayDebt = debt;
                    payAmount.value = "";

                    const accounts = getAccounts();

                    payAccount.innerHTML = `<option value="">${t("select_account")}</option>` +
                        accounts.map(acc => `<option value="${acc.name}">${acc.name}</option>`).join("");

                    payDebtModal.classList.add("show");
                };
            }

            async function deleteThisDebt() {
                const confirmed = await customConfirm(
                    t("debts_delete_confirm"),
                    { danger: true }
                );

                if (!confirmed) return;

                const linkedTransactions = loadTransactions().filter(function (tx) {
                    return tx.debtId === debt.id;
                });

                let deleteLinked = false;

                if (linkedTransactions.length > 0) {
                    deleteLinked = await customConfirm(
                        t("debts_delete_linked_confirm"),
                        { danger: true }
                    );
                }

                const deletedPosition = debts.indexOf(debt);

                debts = debts.filter(d => d.id !== debt.id);
                saveDebts(debts);

                if (deleteLinked) {
                    const remainingTransactions = loadTransactions().filter(function (tx) {
                        return tx.debtId !== debt.id;
                    });

                    saveTransactions(remainingTransactions);
                }

                renderDebts();

                showUndoToast(
                    t("debts_deleted_toast"),
                    function () {
                        const insertAt = Math.min(deletedPosition, debts.length);
                        debts.splice(insertAt, 0, debt);
                        saveDebts(debts);

                        if (deleteLinked) {
                            saveTransactions(loadTransactions().concat(linkedTransactions));
                        }

                        renderDebts();
                    }
                );
            }

            function editThisDebt() {
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

            bgDelete.addEventListener("click", function (e) {
                e.stopPropagation();
                deleteThisDebt();
            });

            bgEdit.addEventListener("click", function (e) {
                e.stopPropagation();
                editThisDebt();
            });

// استدعاء مكوّن السحب المشترك نفسه!
attachSwipeActions(card, { deleteEl: bgDelete, editEl: bgEdit, maxOffset: 60, threshold: 35 });

            debtsList.appendChild(wrapper);
        });

        totalReceivable.querySelector(".stat-value").innerText = Math.round(receivable).toLocaleString("en-US");
totalPayable.querySelector(".stat-value").innerText = Math.round(payable).toLocaleString("en-US");
        netBalance.querySelector(".currency").innerText = "EGP";
        netBalance.querySelector(".amount").innerText = Math.round(net).toLocaleString("en-US");

        if (window.lucide) lucide.createIcons();
    }

    renderDebts();
}