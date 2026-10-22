// ==============================================================
// screens/homePage.js
// كل منطق صفحة الرئيسية مجمّع في دالة واحدة initHomePage()
// بتتنادى يدويًا من الراوتر بعد ما محتوى الصفحة يتحقن جوه #app
// ==============================================================

function initHomePage() {
    
    const modalsPlaceholder = document.getElementById("modals-placeholder");
    if (modalsPlaceholder) {
        modalsPlaceholder.innerHTML = renderSharedModals();
    }
    
        // ------------------------------
    // العناصر
    // ------------------------------
    
    
    const expenseList = document.getElementById("expenseList");
    const searchInput = document.getElementById("searchInput");
    const homeReport = document.getElementById("homeReport");
    const addMenuBtn = document.getElementById("addMenuBtn");
    const toggleBalanceBtn = document.getElementById("toggleBalanceBtn");
    
    const prevMonthBtn = document.getElementById("prevMonthBtn");
    const nextMonthBtn = document.getElementById("nextMonthBtn");
    const monthLabelBtn = document.getElementById("monthLabelBtn");
    const monthPicker = document.getElementById("monthPicker");
    const accountFilter = document.getElementById("accountFilter");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");
    const typeFilter = document.getElementById("typeFilter");
    const filterSummary = document.getElementById("filterSummary");
    const filterCount = document.getElementById("filterCount");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");
    const nowLocal = new Date();
    window.selectedMonth = window.selectedMonth || (nowLocal.getFullYear() + "-" + String(nowLocal.getMonth() + 1).padStart(2, "0"));
    // تحميل البيانات
    let expenses = loadTransactions();
    const reportState = window.homeReportState || (window.homeReportState = { period: "all", from: "", to: "" });
    
    // كارت التقرير اللي فوق (الرصيد الصافي / الدخل / المصروفات)
    function renderHomeReport() {
        if (!homeReport) return;
        homeReport.innerHTML = "";
        homeReport.appendChild(buildPeriodReportCard(reportState, expenses, renderHomeReport));
    }
        // هل فيه بحث أو فلتر شغّال؟ (الترتيب بيتحسب لو اتغير عن الافتراضي)
    function hasAnyFilter() {
        return (searchInput && searchInput.value.trim() !== "") ||
            (accountFilter && accountFilter.value !== "") ||
            (categoryFilter && categoryFilter.value !== "") ||
            (typeFilter && typeFilter.value !== "") ||
            (sortFilter && sortFilter.value !== "date_desc");
    }

    // صف عدد النتائج + زرار مسح الفلاتر
    function updateFilterSummary(count) {
        if (!filterSummary) return;
        const active = hasAnyFilter();
        filterSummary.style.display = active ? "flex" : "none";
        if (active && filterCount) {
            filterCount.textContent = count + " " + t("filter_results");
        }
    }
    // عرض البيانات
    function renderExpenses() {

        expenseList.innerHTML = "";
if (expenses.length === 0) {
        expenseList.innerHTML = renderEmptyState(
            "receipt-text", 
                        t("no_transactions"),
                t("add_first_transaction")
        );
        if (window.lucide) lucide.createIcons();
                                updateFilterSummary(0);
        renderHomeReport();
        return;
    }
        // بنرتب المعاملات حسب التاريخ (الأحدث فوق)، ولو نفس التاريخ الأحدث إضافة الأول
        // من غير ما نغيّر ترتيبها الأصلي جوه الـ localStorage (عشان index يفضل صحيح للتعديل/الحذف)
        const sortedEntries = expenses
            .map((expense, index) => ({ expense, index }))
            .sort((a, b) => {
                const mode = sortFilter ? sortFilter.value : "date_desc";
                const amountA = Math.abs(Number(a.expense.amount || 0));
                const amountB = Math.abs(Number(b.expense.amount || 0));
                if (mode === "amount_desc" && amountA !== amountB) return amountB - amountA;
                if (mode === "amount_asc" && amountA !== amountB) return amountA - amountB;
                                const dateA = a.expense.date || "";
                const dateB = b.expense.date || "";
                if (dateA !== dateB) {
                    return mode === "date_asc"
                        ? dateA.localeCompare(dateB)
                        : dateB.localeCompare(dateA);
                }
                return mode === "date_asc" ? a.index - b.index : b.index - a.index;
            });


        // نص البحث بعد تنضيفه من المسافات الزيادة وتحويله لحروف صغيرة
        const searchTerm = searchInput.value.trim().toLowerCase();

        sortedEntries.forEach(({ expense, index }) => {
            if (expense.isTransfer && expense.type === "income") return;
                        const accountValue = accountFilter ? accountFilter.value : "";
            if (accountValue && getTxAccountId(expense) !== accountValue && (expense.transferToId || getAccountIdByName(expense.transferTo)) !== accountValue) return;
                        const categoryValue = categoryFilter ? categoryFilter.value : "";
            if (categoryValue && getTxCategoryId(expense) !== categoryValue) return;
            const typeValue = typeFilter ? typeFilter.value : "";
            if (typeValue === "transfer" && !expense.isTransfer) return;
            if (typeValue === "income" && (expense.isTransfer || expense.type !== "income")) return;
            if (typeValue === "expense" && (expense.isTransfer || expense.type !== "expense")) return;
            const searchableText = [
                                expense.description,
                    getTxCategoryName(expense),
                    getTxAccountName(expense)
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            if (searchTerm && !searchableText.includes(searchTerm)) {
                return;
            }

                        if (
                window.selectedMonth &&
                (!expense.date || !expense.date.startsWith(window.selectedMonth))
            ) {
                return;
            }
            // استخدام مكوّن الكارت المشترك
            const li = createTransactionElement(expense);
            expenseList.appendChild(li);

const card = li.querySelector(".expense-main");
            const deleteBtn = li.querySelector(".swipe-delete");
            const editBtn = li.querySelector(".swipe-edit");

            deleteBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const confirmed = await customConfirm(
t("delete_confirm"),
                    { danger: true }
                );
                if (!confirmed) return;

                const itemsToDelete = expense.isTransfer
                    ? expenses.filter(item => item.transferId === expense.transferId)
                    : expenses.filter(item => item.id === expense.id);
                const deletedWithPositions = itemsToDelete.map(item => ({
                    item,
                    position: expenses.indexOf(item)
                }));
                                const remaining = expense.isTransfer ?
                    expenses.filter(item => item.transferId !== expense.transferId) :
                    expenses.filter(item => item.id !== expense.id);
                if (!saveTransactions(remaining)) return;
                expenses = remaining;
                               const removedDebtPayment = expense.debtPaymentId
                    ? removeDebtPayment(expense.debtPaymentId)
                    : null;
                renderExpenses();
 updateBudgetButton();
                showUndoToast(
t("item_deleted_toast"),
                    function () {
                                                const currentList = loadTransactions();
                        deletedWithPositions
                            .sort((a, b) => a.position - b.position)
                            .forEach(({ item, position }) => {
                                const insertAt = Math.min(position, currentList.length);
                                currentList.splice(insertAt, 0, item);
                            });
                        if (!saveTransactions(currentList)) return;
                        expenses = currentList;
                        restoreDebtPayment(removedDebtPayment);
                        renderExpenses();
                        updateBudgetButton();
                    }
                );
            });

            editBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (expense.isTransfer) {
                    window.pendingAddTransactionTab = "transfer";
                    window.pendingEditTransactionId = expense.transferId;
                    navigateTo("add-transaction");
                    return;
                }
                window.pendingAddTransactionTab = expense.type;
                window.pendingEditTransactionId = expense.id;
                navigateTo("add-transaction");
            });

            // استدعاء مكوّن السحب المشترك بسطر واحد!
            attachSwipeActions(card, { deleteEl: deleteBtn, editEl: editBtn });

        });
                updateFilterSummary(expenseList.children.length);
        if (!expenseList.children.length) {
            expenseList.innerHTML = renderEmptyState(
                "search",
                t("no_transactions"),
                ""
            );
        }
                renderHomeReport();

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // ------------------------------
    // Balance Visibility
    // ------------------------------
    function setEyeIcon(iconName) {
        if (!toggleBalanceBtn) return;
        toggleBalanceBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;
        if (window.lucide) lucide.createIcons();
    }

    function applyBalanceVisibility(hidden) {
        if (hidden) {
            document.body.classList.add("amounts-hidden");
            setEyeIcon("eye-off");
        } else {
            document.body.classList.remove("amounts-hidden");
            setEyeIcon("eye");
        }
    }

    // ------------------------------
    // Month Filter
    // ------------------------------
    function renderMonthLabel() {
        if (!monthLabelBtn) return;
        const [year, month] = window.selectedMonth.split("-");
        const date = new Date(Number(year), Number(month) - 1);
const monthName = date.toLocaleDateString(getLanguage() === "ar" ? "ar-EG" : "en-US", { month: "long" });
        monthLabelBtn.innerHTML = `
            <span class="month-label-month">${monthName}</span>
            <span class="month-label-year">${year}</span>
        `;
    }

    function changeMonth(diff) {
        const [year, month] = window.selectedMonth.split("-").map(Number);
        const date = new Date(year, month - 1 + diff, 1);
        window.selectedMonth = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
        renderMonthLabel();
        renderExpenses();
        expenseList.classList.remove("month-slide-next", "month-slide-prev");
        void expenseList.offsetWidth;
        expenseList.classList.add(diff > 0 ? "month-slide-next" : "month-slide-prev");
    }
    // ------------------------------
    // تشغيل التطبيق
    // ------------------------------
    applyBalanceVisibility(getBalanceHidden());
    renderMonthLabel();
    renderExpenses();

    if (toggleBalanceBtn) {
        toggleBalanceBtn.onclick = function () {
            const newHidden = !document.body.classList.contains("amounts-hidden");
            saveBalanceHidden(newHidden);
            applyBalanceVisibility(newHidden);
        };
    }

    if (prevMonthBtn) prevMonthBtn.onclick = () => changeMonth(-1);
    if (nextMonthBtn) nextMonthBtn.onclick = () => changeMonth(1);

    if (monthLabelBtn && monthPicker) {
        monthLabelBtn.onclick = () => {
            monthPicker.value = window.selectedMonth;
            monthPicker.showPicker ? monthPicker.showPicker() : monthPicker.click();
        };
        monthPicker.onchange = () => {
            if (!monthPicker.value) return;
            window.selectedMonth = monthPicker.value;
            renderMonthLabel();
            renderExpenses();
        };
    }

    let searchTimer = null;
    if (searchInput) {
        searchInput.oninput = function() {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(renderExpenses, 250);
        };
    }
        if (searchInput) {
        searchInput.addEventListener("focus", function() {
            setTimeout(function() {
                searchInput.style.scrollMarginTop = "20px";
                searchInput.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 400);
        });
    }
            fillSelect(accountFilter, [{ value: "", label: t("filter_all_accounts") }].concat(
        getAccounts().map(function(a) { return { value: a.id, label: a.name }; })
    ));
    if (accountFilter) accountFilter.onchange = renderExpenses;
    makeSelectSheet(accountFilter, t("filter_account"));
    
    fillSelect(categoryFilter, [{ value: "", label: t("filter_all_categories") }].concat(
        getCategories().map(function(c) { return { value: c.id, label: c.name }; })
    ));
    if (categoryFilter) categoryFilter.onchange = renderExpenses;
    makeSelectSheet(categoryFilter, t("filter_category"));
    
    fillSelect(sortFilter, getSortOptions(), "date_desc");
    if (sortFilter) sortFilter.onchange = renderExpenses;
    makeSelectSheet(sortFilter, t("sort_by"));
    
    fillSelect(typeFilter, [
        { value: "", label: t("filter_all_types") },
        { value: "income", label: t("tab_income") },
        { value: "expense", label: t("tab_expense") },
        { value: "transfer", label: t("tab_transfer") }
    ]);
    if (typeFilter) typeFilter.onchange = renderExpenses;
    makeSelectSheet(typeFilter, t("filter_type"));

    if (clearFiltersBtn) {
        clearFiltersBtn.onclick = function() {
            searchInput.value = "";
            if (accountFilter) accountFilter.value = "";
            if (categoryFilter) categoryFilter.value = "";
            if (typeFilter) typeFilter.value = "";
            if (sortFilter) sortFilter.value = "date_desc";
            renderExpenses();
        };
    }
    if (addMenuBtn) {
    addMenuBtn.onclick = function() {
        window.pendingAddTransactionTab = "expense";
        navigateTo("add-transaction");
    };
}

    const searchBtn = document.getElementById("searchBtn");
    const searchPanel = document.getElementById("searchPanel");
    const expensesTitle = document.querySelector(".expenses-header h2");
    
    if (searchBtn) {
        searchBtn.onclick = function() {
            
            expensesTitle.style.display = "none";
            searchBtn.style.display = "none";
            
            searchPanel.style.display = "block";
            
document.body.style.paddingBottom = "70vh"; // مساحة إضافية عشان الاسكرول يشتغل
            
            //searchInput.focus();
            
            setTimeout(() => {
                searchInput.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 400);
            
        };
    }
    
        if (window._homeClickHandler) {
        document.removeEventListener("click", window._homeClickHandler);
    }
    window._homeClickHandler = function(e) {
        
        // لو لوحة البحث مش ظاهرة، متعملش حاجة
        if (searchPanel.style.display !== "block") return;
                // لو فيه فلتر شغّال، سيب اللوحة مفتوحة والفلتر زي ما هو
if (hasAnyFilter()) return;
        // لو اللي اتدوس عليه مش اللوحة نفسها ولا زرار البحث
        if (!searchPanel.contains(e.target) && !searchBtn.contains(e.target)) {
            
            searchPanel.style.display = "none";
            searchInput.value = "";
            if (accountFilter) accountFilter.value = "";
            if (categoryFilter) categoryFilter.value = "";
            
            if (sortFilter) sortFilter.value = "date_desc";
            
            expensesTitle.style.display = "block";
            searchBtn.style.display = "flex";
            
            document.body.style.paddingBottom = "";
            
            renderExpenses();
        }
        
    };
    document.addEventListener("click", window._homeClickHandler);

    // ------------------------------
    // Budget Modal
    // ------------------------------
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
        // تنظيف لما نسيب الصفحة الرئيسية
    window.cleanupHomePage = function() {
        if (window._homeClickHandler) {
            document.removeEventListener("click", window._homeClickHandler);
            window._homeClickHandler = null;
        }
        document.body.style.paddingBottom = "";
                clearTimeout(searchTimer);
    };
}