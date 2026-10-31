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
    const debtsList = document.getElementById("debtsList");
    const totalReceivable = document.getElementById("totalReceivable");
    const totalPayable = document.getElementById("totalPayable");
    const netBalance = document.getElementById("netBalance");

    const debts = getDebts();

    // الأجزاء المنقولة (js/debts/)
    const { openPaymentsHistory } = initDebtsPaymentsHistory(debts, renderDebts);
    const { openPayDebt } = initDebtsPay(debts, renderDebts);
    const { openEditDebt } = initDebtsEdit(debts, renderDebts);
    initDebtsAdd(debts, renderDebts);

        if (window._debtsTouchHandler) {
        document.removeEventListener("touchstart", window._debtsTouchHandler);
    }
    window._debtsTouchHandler = function (e) {
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
    };
    document.addEventListener("touchstart", window._debtsTouchHandler);
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
<h3 class="debt-person-name">${escapeHTML(debt.person)}</h3>
            <span class="debt-badge ${isSettled ? "settled" : debt.type}">
                ${isSettled ? t("debts_settled_badge") : (debt.type === "receivable" ? t("debts_owed_to_you_badge") : t("debts_you_owe_badge"))}
            </span>
        </div>

        <div class="debt-card-main-row">
            <div class="debt-card-details">
${debt.dueDate ? escapeHTML(debt.dueDate) : t("debts_no_due_date")}
                </div>
          <div class="debt-card-amount">

${debt.type === "receivable" ? "+" : "-"} <span class="debt-currency">${escapeHTML(getCurrency())}</span> <span class="debt-amount-value">${formatAmountNumber(debt.remaining)}</span>
            </div>
        </div>

        <div class="debt-card-main-row">
            ${
                debt.paid > 0
? `<span class="debt-paid-note"><span class="debt-currency">${escapeHTML(getCurrency())}</span> <span class="debt-amount-value">${formatAmountNumber(debt.paid)}</span> ${t("debts_paid_note")}</span>`
                : `<span></span>`
            }
            ${
                !isSettled
? `<button class="debt-card-pay-btn">${t("debts_pay_btn")}</button>`
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
                    openPayDebt(debt);
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

                                if (deleteLinked) {
                    const remainingTransactions = loadTransactions().filter(function(tx) {
                        return tx.debtId !== debt.id;
                    });
                    
                    if (!saveTransactions(remainingTransactions)) return;
                }
                
                debts.splice(0, debts.length, ...debts.filter(d => d.id !== debt.id));
                saveDebts(debts);

                renderDebts();

                showUndoToast(
                    t("debts_deleted_toast"),
                    function () {
                        const insertAt = Math.min(deletedPosition, debts.length);
                                                if (deleteLinked) {
                            if (!saveTransactions(loadTransactions().concat(linkedTransactions))) return;
                        }
                        
                        debts.splice(insertAt, 0, debt);
                        saveDebts(debts);

                        renderDebts();
                    }
                );
            }

            bgDelete.addEventListener("click", function (e) {
                e.stopPropagation();
                deleteThisDebt();
            });

            bgEdit.addEventListener("click", function (e) {
                e.stopPropagation();
                openEditDebt(debt);
            });

// استدعاء مكوّن السحب المشترك نفسه!
attachSwipeActions(card, { deleteEl: bgDelete, editEl: bgEdit, maxOffset: 60, threshold: 35 });

            debtsList.appendChild(wrapper);
        });

          totalReceivable.querySelector(".stat-value").innerText = formatAmountNumber(receivable);
        totalPayable.querySelector(".stat-value").innerText = formatAmountNumber(payable);
        totalReceivable.querySelector(".stat-currency").innerText = getCurrency();
        totalPayable.querySelector(".stat-currency").innerText = getCurrency();
        netBalance.querySelector(".currency").innerText = getCurrency();
        netBalance.querySelector(".amount").innerText = formatAmountNumber(net);
                const debtsTotal = receivable + payable;
        const debtsBar = document.getElementById("debtsBar");
        if (debtsBar) {
            debtsBar.classList.toggle("empty", debtsTotal === 0);
            debtsBar.firstElementChild.style.width =
                (debtsTotal > 0 ? Math.round((receivable / debtsTotal) * 100) : 0) + "%";
        }
        netBalance.classList.toggle("period-expense", net < 0);
        netBalance.classList.toggle("period-income", net >= 0);

        if (window.lucide) lucide.createIcons();
    }
    renderDebts();
    window.cleanupDebtsPage = function() {
        if (window._debtsTouchHandler) {
            document.removeEventListener("touchstart", window._debtsTouchHandler);
            window._debtsTouchHandler = null;
        }
    };
}