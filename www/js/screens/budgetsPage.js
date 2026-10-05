// ==============================================================
// screens/budgetsPage.js
// صفحة ميزانية كل فئة
// ==============================================================

function initBudgetsPage() {

    // ------------------------------
    // العناصر
    // ------------------------------
    const addCatBudgetBtn = document.getElementById("addCatBudgetBtn");
    const catBudgetsList = document.getElementById("catBudgetsList");
    const catBudgetModal = document.getElementById("catBudgetModal");
    const catBudgetCategory = document.getElementById("catBudgetCategory");
    const catBudgetAmount = document.getElementById("catBudgetAmount");
    const cancelCatBudgetBtn = document.getElementById("cancelCatBudgetBtn");
    const saveCatBudgetBtn = document.getElementById("saveCatBudgetBtn");
        if (catBudgetAmount) {
        catBudgetAmount.addEventListener("input", function () {
            const digits = catBudgetAmount.value.replace(/\D/g, "");
            catBudgetAmount.value = digits ? Number(digits).toLocaleString("en-US") : "";
        });
    }

    // ------------------------------
    // ESCAPE HTML
    // ------------------------------
    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ------------------------------
    // المصروف الفعلي لكل فئة في الشهر الحالي
    // ------------------------------
    function getMonthSpentByCategory() {
        const now = new Date();
        const spent = {};

        loadTransactions().forEach(function (tx) {
            if (tx.type !== "expense" || tx.isTransfer === true) return;
            if (!tx.date) return;

            const date = new Date(tx.date);
            if (Number.isNaN(date.getTime())) return;
            if (date.getFullYear() !== now.getFullYear() || date.getMonth() !== now.getMonth()) return;

            const category = tx.category || "Other";
            spent[category] = (spent[category] || 0) + (Number(tx.amount) || 0);
        });

        return spent;
    }

    // ------------------------------
    // RENDER
    // ------------------------------
    function renderCatBudgets() {

        if (!catBudgetsList) return;

        const budgets = getCategoryBudgets();
        const names = Object.keys(budgets);

        if (!names.length) {
            catBudgetsList.innerHTML = `
            <div class="empty-stat">
                <i data-lucide="wallet"></i>
                <span>${t("cb_empty")}</span>
            </div>
            `;
            if (window.lucide) lucide.createIcons({ root: catBudgetsList });
            return;
        }

        const spent = getMonthSpentByCategory();

        catBudgetsList.innerHTML = names.map(function (name) {

            const limit = Number(budgets[name]) || 0;
            const used = spent[name] || 0;

            const rawPercent = limit > 0 ? Math.round((used / limit) * 100) : 0;
            const percent = Math.min(100, rawPercent);

            return `
<div class="goal-card ${rawPercent >= 100 ? "cb-over" : ""}">

                <div class="goal-top">
                    <span class="goal-name">${escapeHTML(name)}</span>
                    <span class="goal-percent">${rawPercent}%</span>
                </div>

                <div class="goal-progress">
                    <div class="goal-progress-fill" style="width: ${percent}%"></div>
                </div>

                <div class="goal-amounts">
                    <span>${formatCurrency(used)} ${t("cb_spent_of")} ${formatCurrency(limit)}</span>
                </div>

                <div class="goal-actions">
                    <button class="goal-btn cb-delete-btn" data-name="${escapeHTML(name)}"><i data-lucide="trash-2"></i></button>
                </div>

            </div>
            `;

        }).join("");

        if (window.lucide) lucide.createIcons({ root: catBudgetsList });
    }

    // ------------------------------
    // Initialize
    // ------------------------------
    renderCatBudgets();

    if (catBudgetsList) {
        catBudgetsList.onclick = function (e) {
            const deleteBtn = e.target.closest(".cb-delete-btn");
            if (!deleteBtn) return;

            const name = deleteBtn.dataset.name;

            customConfirm(t("cb_delete_confirm"), { danger: true }).then(function (confirmed) {
                if (!confirmed) return;

                const budgets = getCategoryBudgets();
                delete budgets[name];
                saveCategoryBudgets(budgets);
                renderCatBudgets();
            });
        };
    }

    // ------------------------------
    // MODALS
    // ------------------------------
        function fillCategorySelect() {
        if (!catBudgetCategory) return;

        const budgets = getCategoryBudgets();

        const available = getCategories().filter(function (c) {
            return !(c.name in budgets);
        });

        catBudgetCategory.innerHTML =
            `<option value="">${t("cb_select_category")}</option>` +
            available.map(function (c) {
                return `<option value="${escapeHTML(c.name)}">${escapeHTML(c.name)}</option>`;
            }).join("");
    }

    if (addCatBudgetBtn && catBudgetModal) {
        addCatBudgetBtn.onclick = function () {
            fillCategorySelect();
            if (catBudgetAmount) catBudgetAmount.value = "";
            catBudgetModal.classList.add("show");
        };
    }

    if (cancelCatBudgetBtn && catBudgetModal) {
        cancelCatBudgetBtn.onclick = function () {
            catBudgetModal.classList.remove("show");
        };
    }

    if (catBudgetModal) {
        catBudgetModal.onclick = function (e) {
            if (e.target === catBudgetModal) catBudgetModal.classList.remove("show");
        };
    }
        if (saveCatBudgetBtn) {
        saveCatBudgetBtn.onclick = async function () {

            const category = catBudgetCategory ? catBudgetCategory.value : "";
            const amount = catBudgetAmount ? Number(catBudgetAmount.value.replace(/,/g, "")) : 0;

            if (!category) {
                await customAlert(t("cb_select_category"));
                return;
            }

            if (!amount || amount <= 0) {
                await customAlert(t("cb_enter_amount"));
                if (catBudgetAmount) catBudgetAmount.focus();
                return;
            }

            const budgets = getCategoryBudgets();
            budgets[category] = amount;

            saveCategoryBudgets(budgets);
            renderCatBudgets();

            if (catBudgetModal) catBudgetModal.classList.remove("show");
        };
    }
}