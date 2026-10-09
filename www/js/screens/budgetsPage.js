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

const category = tx.categoryId || getCategoryIdByName(tx.category) || tx.category || "Other";
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
                const ids = Object.keys(budgets);
        
        if (!ids.length) {
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

                catBudgetsList.innerHTML = ids.map(function(id) {
                    
                    const cat = getCategories().find(function(c) { return c.id === id; });
                    const name = cat ? cat.name : id;
                    const limit = Number(budgets[id]) || 0;
                    const used = spent[id] || 0;

            const rawPercent = limit > 0 ? Math.round((used / limit) * 100) : 0;
            const percent = Math.min(100, rawPercent);

            return `
<div class="goal-card ${rawPercent >= 100 ? "cb-over" : ""}">

                <div class="goal-top">
                    <span class="goal-name">${escapeHTML(name)}</span>
                    <div class="cb-top-end">
                        <span class="goal-percent">${rawPercent}%</span>
                        <button class="cb-delete-btn" data-id="${escapeHTML(id)}"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>

                <div class="goal-progress">
                    <div class="goal-progress-fill" style="width: ${percent}%"></div>
                </div>

                <div class="cb-amounts">
                    <span class="cb-used">${formatCurrency(used)}</span>
                    <span class="cb-limit">${formatCurrency(limit)}</span>
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

const id = deleteBtn.dataset.id;

            customConfirm(t("cb_delete_confirm"), { danger: true }).then(function (confirmed) {
                if (!confirmed) return;

                const budgets = getCategoryBudgets();
delete budgets[id];
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
        
        const picker = document.querySelector(".cb-picker");
        const pickerBtn = document.getElementById("catBudgetPickerBtn");
        const pickerText = document.getElementById("catBudgetPickerText");
        const pickerList = document.getElementById("catBudgetPickerList");
        
        if (!picker || !pickerBtn || !pickerText || !pickerList) return;
        
        const budgets = getCategoryBudgets();
        
        const available = getCategories().filter(function(c) {
return !(c.id in budgets);
        });
        
        catBudgetCategory.value = "";
        pickerText.textContent = t("cb_select_category");
        picker.classList.remove("open");
        
        pickerList.innerHTML = available.map(function(c) {
            return `<div class="cb-picker-item" data-value="${escapeHTML(c.id)}">${escapeHTML(c.name)}</div>`;
        }).join("");
        
        pickerBtn.onclick = function() {
            picker.classList.toggle("open");
        };
        
        pickerList.onclick = function(e) {
            const item = e.target.closest(".cb-picker-item");
            if (!item) return;
            
            catBudgetCategory.value = item.dataset.value;
pickerText.textContent = item.textContent;
            
            pickerList.querySelectorAll(".cb-picker-item").forEach(function(el) {
                el.classList.remove("selected");
            });
            item.classList.add("selected");
            
            picker.classList.remove("open");
        };
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