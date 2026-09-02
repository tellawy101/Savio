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
    
    document.getElementById("statsPlaceholder").innerHTML =
        renderStatBox({ icon: '<i data-lucide="trending-up"></i>', labelKey: "income", labelText: "Income", valueId: "totalIncome" }) +
        renderStatBox({ icon: '<i data-lucide="trending-down"></i>', labelKey: "expenses", labelText: "Expenses", valueId: "totalExpense" });

    // ------------------------------
    // العناصر
    // ------------------------------
    const amount = document.getElementById("amount");
    const category = document.getElementById("category");

    const expenseList = document.getElementById("expenseList");
    const searchInput = document.getElementById("searchInput");
    const totalExpense = document.getElementById("totalExpense");
    const totalIncome = document.getElementById("totalIncome");
    const balance = document.getElementById("balanceValue");
    const addMenuBtn = document.getElementById("addMenuBtn");
    const balanceCurrency = document.getElementById("balanceCurrency");
    const toggleBalanceBtn = document.getElementById("toggleBalanceBtn");

    const prevMonthBtn = document.getElementById("prevMonthBtn");
    const nextMonthBtn = document.getElementById("nextMonthBtn");
    const monthLabelBtn = document.getElementById("monthLabelBtn");
    const monthPicker = document.getElementById("monthPicker");

    window.selectedMonth = new Date().toISOString().slice(0, 7);

    // تحميل البيانات
    let expenses = loadTransactions();
    let income = 0;
    let total = 0;
    let editIndex = -1;

    // عرض البيانات
    function renderExpenses() {

        expenseList.innerHTML = "";
        total = 0;
        income = 0;

        // بنرتب المعاملات حسب التاريخ (الأحدث فوق)، ولو نفس التاريخ الأحدث إضافة الأول
        // من غير ما نغيّر ترتيبها الأصلي جوه الـ localStorage (عشان index يفضل صحيح للتعديل/الحذف)
        const sortedEntries = expenses
            .map((expense, index) => ({ expense, index }))
            .sort((a, b) => {
                if (a.expense.date !== b.expense.date) {
                    return b.expense.date.localeCompare(a.expense.date);
                }
                return b.index - a.index;
            });

        // إجمالي الدخل/المصروف/الرصيد بيتحسب من كل المعاملات (بعد فلتر الشهر بس)،
        // من غير ما يتأثر بالبحث - عشان الأرقام تفضل ثابتة وهو بيدور
        sortedEntries.forEach(({ expense }) => {

            if (
                window.selectedMonth &&
                expense.date &&
                !expense.date.startsWith(window.selectedMonth)
            ) {
                return;
            }

            if (!expense.isTransfer) {
                if (expense.type === "expense") {
                    total += expense.amount;
                } else if (expense.type === "income") {
                    income += expense.amount;
                }
            }

        });

        // نص البحث بعد تنضيفه من المسافات الزيادة وتحويله لحروف صغيرة
        const searchTerm = searchInput.value.trim().toLowerCase();

        sortedEntries.forEach(({ expense, index }) => {

            const searchableText = [
                expense.description,
                expense.category,
                expense.account
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            if (searchTerm && !searchableText.includes(searchTerm)) {
                return;
            }

            if (
                window.selectedMonth &&
                expense.date &&
                !expense.date.startsWith(window.selectedMonth)
            ) {
                return;
            }

            const li = document.createElement("li");

            // إزالة الإيموجي من النص وإبقاء الاسم فقط
            function cleanLabel(text) {
                return String(text || "")
                    .replace(/^[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\s]+/u, "")
                    .trim();
            }

            const cleanCategory = cleanLabel(expense.category);
            const cleanAccount = cleanLabel(expense.account);

            li.innerHTML = `
    <div class="expense-swipe">

        <div class="swipe-action swipe-delete">
            <i data-lucide="trash-2"></i>
        </div>

        <div class="swipe-action swipe-edit">
            <i data-lucide="pencil"></i>
        </div>

        <div class="expense-main">

<div class="expense-icon-box">
    <i data-lucide="${expense.categoryIcon || "tag"}"></i>
</div>

            <div class="expense-info">

                <div class="expense-desc">
                    ${expense.description || ""}
                </div>

                <div class="expense-category">
                    ${cleanCategory}
                </div>

                <div class="expense-account">
                    ${cleanAccount}
                </div>

            </div>

            <div class="expense-right">

               <div class="expense-amount">
    <span class="expense-amount-currency">${getCurrency()}</span> <span class="expense-amount-value">${Math.round(Number(expense.amount) || 0).toLocaleString("en-US")}</span>
</div>

                <div class="expense-meta">
                    ${expense.date}
                </div>

            </div>

        </div>

    </div>
`;
            expenseList.appendChild(li);

            if (window.lucide) {
                lucide.createIcons();
            }
            let startX = 0;
            let currentX = 0;
            let offsetX = 0;
            let startY = 0;

            const card = li.querySelector(".expense-main");
            const deleteBtn = li.querySelector(".swipe-delete");
            const editBtn = li.querySelector(".swipe-edit");

            const isRTL = document.documentElement.dir === "rtl";

            // بنحدد مين اللي المفروض يتكشف مع كل اتجاه سحب، حسب مكانه الفعلي على الشاشة (RTL/LTR)
            const revealOnSwipeRight = deleteBtn;
            const revealOnSwipeLeft = editBtn;
            deleteBtn.addEventListener("click", async (e) => {

                e.stopPropagation();

                const confirmed = await customConfirm(
                    typeof t === "function" ? t("delete_confirm") : "Delete this item?",
                    { danger: true }
                );

                if (!confirmed) {
                    return;
                }

                // بنحفظ العناصر اللي هتتحذف مع مكانها الأصلي، عشان نقدر نرجّعها لو المستخدم دوس "تراجع"
                // (في حالة التحويل بيتحذف قيدين مع بعض: من الحساب وللحساب)
                const itemsToDelete = expense.isTransfer
                    ? expenses.filter(item => item.transferId === expense.transferId)
                    : expenses.filter(item => item.id === expense.id);

                const deletedWithPositions = itemsToDelete.map(item => ({
                    item,
                    position: expenses.indexOf(item)
                }));

                expenses = expense.isTransfer
                    ? expenses.filter(item => item.transferId !== expense.transferId)
                    : expenses.filter(item => item.id !== expense.id);

                saveTransactions(expenses);
                renderExpenses();

                showUndoToast(
                    typeof t === "function" ? t("item_deleted_toast") : "Item Deleted",
                    function () {

                        deletedWithPositions
                            .sort((a, b) => a.position - b.position)
                            .forEach(({ item, position }) => {
                                const insertAt = Math.min(position, expenses.length);
                                expenses.splice(insertAt, 0, item);
                            });

                        saveTransactions(expenses);
                        renderExpenses();

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
    
    if (expense.type === "income") {
        
        window.pendingAddTransactionTab = "income";
        window.pendingEditTransactionId = expense.id;
        navigateTo("add-transaction");
        return;
        
    }
    
    if (expense.type === "expense") {
        
        window.pendingAddTransactionTab = "expense";
        window.pendingEditTransactionId = expense.id;
        navigateTo("add-transaction");
        return;
        
    }
});

            card.addEventListener("touchstart", (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            });

            card.addEventListener("touchmove", (e) => {

                const deltaX = e.touches[0].clientX - startX;
                const deltaY = e.touches[0].clientY - startY;

                if (Math.abs(deltaY) > Math.abs(deltaX)) return;
                e.preventDefault();
                currentX = offsetX + deltaX;

                if (currentX > 80) currentX = 80;
                if (currentX < -80) currentX = -80;

                card.style.transform = `translateX(${currentX}px)`;
                if (currentX > 0) {
                    revealOnSwipeRight.style.opacity = currentX / 80;
                    revealOnSwipeLeft.style.opacity = 0;
                } else {
                    revealOnSwipeLeft.style.opacity = Math.abs(currentX) / 80;
                    revealOnSwipeRight.style.opacity = 0;
                }

                card.style.transition = "none";

            }, { passive: false });
            card.addEventListener("touchend", () => {

                if (currentX > 50) {

                    offsetX = 70;

                } else if (currentX < -50) {

                    offsetX = -70;

                } else {

                    offsetX = 0;

                }

                card.style.transition = "transform .25s ease";
                card.style.transform = `translateX(${offsetX}px)`;

                if (offsetX === 70) {
                    revealOnSwipeRight.style.opacity = 1;
                    revealOnSwipeLeft.style.opacity = 0;
                } else if (offsetX === -70) {
                    revealOnSwipeLeft.style.opacity = 1;
                    revealOnSwipeRight.style.opacity = 0;
                } else {
                    revealOnSwipeRight.style.opacity = 0;
                    revealOnSwipeLeft.style.opacity = 0;
                }
                currentX = 0;

            });

        });

        totalExpense.innerHTML = formatCurrencyHTML(Math.round(total));
        totalIncome.innerHTML = formatCurrencyHTML(Math.round(income));

        balanceCurrency.innerText = getCurrency();
        balance.innerText = Math.round(income - total).toLocaleString("en-US");

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
        const monthName = date.toLocaleDateString("en-US", { month: "long" });
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

    if (searchInput) searchInput.oninput = renderExpenses;

    document.addEventListener("touchstart", (e) => {
    
    document.querySelectorAll(".expense-main").forEach(card => {
        
        const swipe = card.parentElement;
        
        if (!swipe.contains(e.target)) {
            
            card.style.transform = "translateX(0px)";
            
            const deleteBtn = swipe.querySelector(".swipe-delete");
            const editBtn = swipe.querySelector(".swipe-edit");
            
            deleteBtn.style.opacity = 0;
            deleteBtn.style.pointerEvents = "none";
            editBtn.style.opacity = 0;
            editBtn.style.pointerEvents = "none";
            
        }
        
    });
    
});
    if (addMenuBtn) {
    addMenuBtn.onclick = function() {
        window.pendingAddTransactionTab = "expense";
        navigateTo("add-transaction");
    };
}

    const searchBtn = document.getElementById("searchBtn");
    const expensesTitle = document.querySelector(".expenses-header h2");

    if (searchBtn) {
        searchBtn.onclick = function () {

            expensesTitle.style.display = "none";
            searchBtn.style.display = "none";

            searchInput.style.display = "block";

            document.body.style.paddingBottom = "300px"; // مساحة إضافية عشان الاسكرول يشتغل

            searchInput.focus();

            setTimeout(() => {
                searchInput.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 400);

        };
    }

    document.addEventListener("click", function (e) {

        // لو الخانة مش ظاهرة، متعملش حاجة
        if (searchInput.style.display !== "block") return;

        // لو اللي اتدوس عليه مش الخانة نفسها ولا زرار البحث
        if (!searchInput.contains(e.target) && !searchBtn.contains(e.target)) {

            searchInput.style.display = "none";
            searchInput.value = "";

            expensesTitle.style.display = "block";
            searchBtn.style.display = "flex";

            document.body.style.paddingBottom = "";

            if (typeof renderExpenses === "function") {
                renderExpenses();
            }
        }

    });

    // ------------------------------
    // Balance Chart (last 7 days, week starts Saturday)
    // ------------------------------
    function updateChartDays() {
        const days = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
        for (let i = 0; i < 7; i++) {
            const element = document.getElementById(`day${i}`);
            if (element) element.textContent = days[i];
        }
    }
    updateChartDays();

    function getLocalDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function updateBalanceChart() {
        const chartLine = document.getElementById("chartLine");
        const chartArea = document.getElementById("chartArea");
        if (!chartLine || !chartArea) return;

        const transactions = loadTransactions();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentDay = today.getDay();
        const daysFromSaturday = (currentDay + 1) % 7;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - daysFromSaturday);

        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            dates.push(date);
        }

        let runningBalance = 0;
        const firstDayKey = getLocalDateKey(weekStart);

        transactions.forEach(transaction => {
            if (!transaction.date) return;
            if (transaction.date >= firstDayKey) return;
            if (transaction.isTransfer) return;
            const amt = Number(transaction.amount) || 0;
            if (transaction.type === "income") runningBalance += amt;
            if (transaction.type === "expense") runningBalance -= amt;
        });

        const balances = [];
        dates.forEach(date => {
            const dateKey = getLocalDateKey(date);
            if (date > today) {
                balances.push(runningBalance);
                return;
            }
            transactions.forEach(transaction => {
                if (transaction.date !== dateKey) return;
                if (transaction.isTransfer) return;
                const amt = Number(transaction.amount) || 0;
                if (transaction.type === "income") runningBalance += amt;
                if (transaction.type === "expense") runningBalance -= amt;
            });
            balances.push(runningBalance);
        });

        let minValue = Math.min(...balances);
        let maxValue = Math.max(...balances);

        if (minValue === maxValue) {
            minValue -= 100;
            maxValue += 100;
        } else {
            const padding = (maxValue - minValue) * 0.15;
            minValue -= padding;
            maxValue += padding;
        }

        const width = 700;
        const height = 120;
        const topPadding = 15;
        const bottomPadding = 15;
        const chartHeight = height - topPadding - bottomPadding;

        const points = balances.map((value, index) => {
            const x = (width / 6) * index;
            const ratio = (value - minValue) / (maxValue - minValue);
            const y = height - bottomPadding - (ratio * chartHeight);
            return { x, y };
        });

        let linePath = "";
        points.forEach((point, index) => {
            if (index === 0) {
                linePath = `M ${point.x} ${point.y}`;
            } else {
                const previous = points[index - 1];
                const midX = (previous.x + point.x) / 2;
                linePath += ` C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y} `;
            }
        });

        const areaPath = linePath + ` L ${width} ${height} L 0 ${height} Z`;

        chartLine.setAttribute("d", linePath);
        chartArea.setAttribute("d", areaPath);
    }
    updateBalanceChart();

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
        const digits = budgetAmountInput.value.replace(/\D/g, "");
        budgetAmountInput.value = digits ? Number(digits).toLocaleString("en-US") : "";
    });
}

if (budgetBtn && budgetModal) {
        budgetBtn.onclick = function () {
            budgetModal.classList.add("show");
        };
    }

    if (closeBudgetBtn && budgetModal) {
        closeBudgetBtn.onclick = function () {
            budgetModal.classList.remove("show");
        };
    }

    function updateBudgetButton() {
        const budgetValue = document.getElementById("budgetValue");
        if (!budgetValue) return;

        const budget = getBudget();

        if (budget <= 0) {
    budgetValue.textContent = typeof t === "function" ? t("budget") : "Budget";
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

        if (remaining >= 0) {
            budgetValue.textContent = formatCurrency(remaining);
        } else {
            budgetValue.textContent = `${formatCurrency(Math.abs(remaining))} over`;
        }
    }

    if (saveBudgetBtn && budgetAmountInput) {
    saveBudgetBtn.onclick = async function() {
                const amt = Number(budgetAmountInput.value.replace(/,/g, ""));
                
                if (!amt || amt <= 0) {
                    await customAlert("Please enter a valid budget.");
                return;
            }

            saveBudget(amt);
            budgetAmountInput.value = "";

            if (budgetModal) budgetModal.classList.remove("show");

            updateBudgetButton();
        };
    }

    updateBudgetButton();
}