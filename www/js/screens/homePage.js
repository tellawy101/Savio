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
    const expenseList = document.getElementById("expenseList");
    const searchInput = document.getElementById("searchInput");
    const homeReport = document.getElementById("homeReport");
    const addMenuBtn = document.getElementById("addMenuBtn");
    const accountFilter = document.getElementById("accountFilter");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");
    const typeFilter = document.getElementById("typeFilter");
    const filterSummary = document.getElementById("filterSummary");
    const filterCount = document.getElementById("filterCount");
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

    // الأجزاء المنقولة (js/home/)
    const { updateBudgetButton } = initHomeBudget();
    initHomeBalanceVisibility();
    initHomeMonthFilter(expenseList, renderExpenses);
    renderExpenses();
    const searchFilters = initHomeSearchFilters(renderExpenses, hasAnyFilter);

    if (addMenuBtn) {
    addMenuBtn.onclick = function() {
        window.pendingAddTransactionTab = "expense";
        navigateTo("add-transaction");
    };
}

    // تنظيف لما نسيب الصفحة الرئيسية
    window.cleanupHomePage = function() {
        searchFilters.cleanup();
    };
}
