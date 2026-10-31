// ======================================
// home/homeBudget.js
// مودال الميزانية + زرار الميزانية
// ======================================

function initHomeBudget() {
    const budgetBtn = document.getElementById("budgetBtn");
    const budgetModal = document.getElementById("budgetModal");
    const closeBudgetBtn = document.getElementById("closeBudgetBtn");
    const saveBudgetBtn = document.getElementById("saveBudgetBtn");
    const budgetAmountInput = document.getElementById("budgetAmount");

if (budgetAmountInput) {
    budgetAmountInput.addEventListener("input", function() {
                // نحوّل الأرقام العربية لإنجليزي، ونسمح بعلامة عشرية واحدة ورقمين بعدها
        const raw = budgetAmountInput.value
            .replace(/[٠-٩]/g, function(d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); })
            .replace(/[^0-9.]/g, "");
        const dotIndex = raw.indexOf(".");
        const intPart = dotIndex === -1 ? raw : raw.slice(0, dotIndex);
        const decPart = dotIndex === -1 ? "" : raw.slice(dotIndex + 1).replace(/\./g, "").slice(0, 2);
        const intText = intPart ? Number(intPart).toLocaleString("en-US") : (dotIndex === -1 ? "" : "0");
        budgetAmountInput.value = dotIndex === -1 ? intText : intText + "." + decPart;    });
}

if (budgetBtn && budgetModal) {
        budgetBtn.onclick = function () {
                        const currencyLabel = budgetModal.querySelector(".budget-input-currency");
            if (currencyLabel) currencyLabel.textContent = getCurrency();
            budgetModal.classList.add("show");
        };
    }

    if (closeBudgetBtn && budgetModal) {
    closeBudgetBtn.onclick = function() {
        budgetModal.classList.remove("show");
    };
}

closeModalOnBackdropClick(budgetModal);

    function updateBudgetButton() {
    const budgetValue = document.getElementById("budgetValue");
    if (!budgetValue) return;
    const budget = getBudget();
    if (budget <= 0) {
budgetValue.textContent = t("budget");
        return;
    }
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const totalExpenses = loadTransactions()
        .filter(transaction => {
            if (transaction.type !== "expense") return false;
            if (transaction.isTransfer) return false;
            if (!transaction.date) return false;
            const parts = transaction.date.split("-");
            if (parts.length !== 3) return false;
            const year = Number(parts[0]);
            const month = Number(parts[1]) - 1;
            return year === currentYear && month === currentMonth;
        })
        .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);
    const remaining = budget - totalExpenses;
    const curr = getCurrency();
    
    if (remaining >= 0) {
const val = formatCompactAmount(remaining);
        budgetValue.innerHTML = `<span class="budget-currency">${escapeHTML(curr)}</span> <span class="budget-number">${val}</span>`;
    } else {
const val = formatCompactAmount(Math.abs(remaining));
const overText = t("budget_over");
    budgetValue.innerHTML = `<span class="budget-currency">${escapeHTML(curr)}</span> <span class="budget-number">${val}</span> <span class="budget-over">${overText}</span>`;
}
}

    if (saveBudgetBtn && budgetAmountInput) {
    saveBudgetBtn.onclick = async function() {
                const amt = Number(budgetAmountInput.value.replace(/,/g, ""));
                
                if (!amt || amt <= 0) {
                                        await customAlert(t("enter_valid_amount_alert"));
                return;
            }

            saveBudget(amt);
            budgetAmountInput.value = "";

            if (budgetModal) budgetModal.classList.remove("show");

            updateBudgetButton();
        };
    }

    updateBudgetButton();

return { updateBudgetButton };
}
