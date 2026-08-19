// =====================================================
// File: Script.js
// Purpose: Home Page
//
// مسؤول عن:
// - عرض العمليات
// - حساب الرصيد
// - البحث
// - Swipe Edit / Delete
// - Floating Action Button
// =====================================================

const amount = document.getElementById("amount");
const category = document.getElementById("category");

const expenseList = document.getElementById("expenseList");
const searchInput = document.getElementById("searchInput");
const totalExpense = document.getElementById("totalExpense");
const totalIncome = document.getElementById("totalIncome");
const balance = document.getElementById("balanceValue");
const addMenuBtn = document.getElementById("addMenuBtn");
const fabMenu = document.getElementById("fabMenu");

const fabExpense = document.getElementById("fabExpense");
const fabIncome = document.getElementById("fabIncome");
const fabTransfer = document.getElementById("fabTransfer");
const balanceCurrency = document.getElementById("balanceCurrency");


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

sortedEntries.forEach(({ expense, index }) => {
        
        if (
            !expense.category
            .toLowerCase()
            .includes(searchInput.value.toLowerCase())
        ) {
            return;
        }
        
        // معاملات الترانسفير بتتحسب في رصيد كل حساب بس مش في إجمالي الدخل/المصروف
// (لأنها مش دخل أو مصروف حقيقي، مجرد نقل بين حسابات المستخدم نفسه)
if (!expense.isTransfer) {
    if (expense.type === "expense") {
        total += expense.amount;
    } else if (expense.type === "income") {
        income += expense.amount;
    }
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
    ${formatCurrency(expense.amount)}
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

const leftAction = deleteBtn;
const rightAction = editBtn;

deleteBtn.addEventListener("click", (e) => {

    e.stopPropagation();

    if (confirm("Delete this item?")) {
    
    if (expense.isTransfer) {
        // التحويل بيتخزن كنصين (خصم + إضافة)، فلازم يتشالوا مع بعض
        expenses = expenses.filter(t => t.transferId !== expense.transferId);
    } else {
        expenses.splice(index, 1);
    }
    
    saveTransactions(expenses);
    renderExpenses();
    
}
});

editBtn.addEventListener("click", (e) => {

    e.stopPropagation();

    if (expense.isTransfer) {

        window.location.href = "pages/transfer.html?edit=" + expense.transferId;
        return;

    }

    if (expense.type === "income") {

        window.location.href = "pages/income.html?edit=" + index;
        return;

    }

    if (expense.type === "expense") {

        window.location.href = "pages/expense.html?edit=" + index;
        return;

    }

});card.addEventListener("touchstart", (e) => {
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
    const leftAction = li.querySelector(".swipe-delete");
const rightAction = li.querySelector(".swipe-edit");

if (currentX > 0) {
    leftAction.style.opacity = currentX / 80;
    rightAction.style.opacity = 0;
} else {
    rightAction.style.opacity = Math.abs(currentX) / 80;
    leftAction.style.opacity = 0;
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
    leftAction.style.opacity = 1;
    rightAction.style.opacity = 0;
} else if (offsetX === -70) {
    rightAction.style.opacity = 1;
    leftAction.style.opacity = 0;
} else {
    leftAction.style.opacity = 0;
    rightAction.style.opacity = 0;
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

// // تشغيل التطبيق
renderExpenses();

document.addEventListener("touchstart", (e) => {

    document.querySelectorAll(".expense-main").forEach(card => {

        if (!card.contains(e.target)) {

            card.style.transform = "translateX(0px)";

            const swipe = card.parentElement;

            swipe.querySelector(".swipe-delete").style.opacity = 0;
            swipe.querySelector(".swipe-edit").style.opacity = 0;

        }

    });

});

addMenuBtn.onclick = function() {

    if (fabMenu.classList.contains("show")) {
        fabMenu.classList.remove("show");
        addMenuBtn.classList.remove("open");
    } else {
        fabMenu.classList.add("show");
        addMenuBtn.classList.add("open");
    }
    
};
const fabButtons = document.querySelectorAll(".fab-menu button");

fabButtons.forEach(btn => {
    btn.addEventListener("click", function () {

        fabButtons.forEach(b => b.classList.remove("active"));


    });
});

fabExpense.onclick = function () {
    location.href = "pages/expense.html";
};

fabIncome.onclick = function () {
    window.location.href = "pages/income.html";
};

fabTransfer.onclick = function() {
    window.location.href = "pages/transfer.html";
};

const searchBtn = document.getElementById("searchBtn");
const expensesTitle = document.querySelector(".expenses-header h2");

searchBtn.addEventListener("click", function() {
    
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
    
});
document.addEventListener("click", function(e) {
    
    // لو الخانة مش ظاهرة، متعملش حاجة
    if (searchInput.style.display !== "block") return;
    
    // لو اللي اتدوس عليه مش الخانة نفسها ولا زرار البحث
    if (!searchInput.contains(e.target) && e.target !== searchBtn) {
        
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
// =========================
// Balance Chart Days
// Starts from today
// =========================

// =========================
// Balance Chart Days
// Last 7 days
// =========================

// =========================
// Balance Chart Days
// Week starts Saturday
// =========================

function updateChartDays() {

    const days = [
        "Sat",
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri"
    ];

    for (let i = 0; i < 7; i++) {

        const element =
            document.getElementById(`day${i}`);

        if (element) {
            element.textContent = days[i];
        }
    }
}
document.addEventListener("DOMContentLoaded", updateChartDays);
// ================================
// SAVIO BALANCE CHART
// ================================

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
    
    // =========================
    // تحديد بداية الأسبوع
    // السبت = بداية الأسبوع
    // =========================
    
    const currentDay = today.getDay();
    
    const daysFromSaturday =
        (currentDay + 1) % 7;
    
    const weekStart = new Date(today);
    
    weekStart.setDate(
        today.getDate() - daysFromSaturday
    );
    
    // =========================
    // إنشاء أيام السبت → الجمعة
    // =========================
    
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
        
        const date = new Date(weekStart);
        
        date.setDate(
            weekStart.getDate() + i
        );
        
        dates.push(date);
    }
    
    // =========================
    // حساب الرصيد قبل بداية الأسبوع
    // =========================
    
    let runningBalance = 0;
    
    const firstDayKey =
        getLocalDateKey(weekStart);
    
    transactions.forEach(transaction => {
        
        if (!transaction.date) return;
        
        if (transaction.date >= firstDayKey) return;
        
        if (transaction.isTransfer) return;
        
        const amount =
            Number(transaction.amount) || 0;
        
        if (transaction.type === "income") {
            runningBalance += amount;
        }
        
        if (transaction.type === "expense") {
            runningBalance -= amount;
        }
        
    });
    
    // =========================
    // رصيد كل يوم
    // =========================
    
    const balances = [];
    
    dates.forEach(date => {
        
        const dateKey =
            getLocalDateKey(date);
        
        // الأيام المستقبلية
        if (date > today) {
            
            balances.push(runningBalance);
            
            return;
        }
        
        transactions.forEach(transaction => {
            
            if (transaction.date !== dateKey) {
                return;
            }
            
            if (transaction.isTransfer) {
                return;
            }
            
            const amount =
                Number(transaction.amount) || 0;
            
            if (transaction.type === "income") {
                runningBalance += amount;
            }
            
            if (transaction.type === "expense") {
                runningBalance -= amount;
            }
            
        });
        
        balances.push(runningBalance);
        
    });
    
    // =========================
    // تحديد نطاق الرسم
    // =========================
    
    let minValue =
        Math.min(...balances);
    
    let maxValue =
        Math.max(...balances);
    
    if (minValue === maxValue) {
        
        minValue -= 100;
        maxValue += 100;
        
    } else {
        
        const padding =
            (maxValue - minValue) * 0.15;
        
        minValue -= padding;
        maxValue += padding;
        
    }
    
    // =========================
    // إعداد SVG
    // =========================
    
    const width = 700;
    const height = 120;
    
    const topPadding = 15;
    const bottomPadding = 15;
    
    const chartHeight =
        height -
        topPadding -
        bottomPadding;
    
    // =========================
    // تحويل القيم لنقاط
    // =========================
    
    const points =
        balances.map((value, index) => {
            
            const x =
                (width / 6) * index;
            
            const ratio =
                (value - minValue) /
                (maxValue - minValue);
            
            const y =
                height -
                bottomPadding -
                (ratio * chartHeight);
            
            return {
                x,
                y
            };
            
        });
    
    // =========================
    // رسم المنحنى
    // =========================
    
    let linePath = "";
    
    points.forEach((point, index) => {
        
        if (index === 0) {
            
            linePath =
                `M ${point.x} ${point.y}`;
            
        } else {
            
            const previous =
                points[index - 1];
            
            const midX =
                (previous.x + point.x) / 2;
            
            linePath += `
                C ${midX} ${previous.y},
                  ${midX} ${point.y},
                  ${point.x} ${point.y}
            `;
            
        }
        
    });
    
    // =========================
    // المنطقة تحت الخط
    // =========================
    
    const areaPath =
        linePath +
        ` L ${width} ${height}
          L 0 ${height}
          Z`;
    
    chartLine.setAttribute(
        "d",
        linePath
    );
    
    chartArea.setAttribute(
        "d",
        areaPath
    );
}
updateBalanceChart();
// =========================
// Budget Modal
// =========================

const budgetBtn = document.getElementById("budgetBtn");
const budgetModal = document.getElementById("budgetModal");
const closeBudgetBtn = document.getElementById("closeBudgetBtn");

if (budgetBtn && budgetModal) {

    budgetBtn.addEventListener("click", () => {
        budgetModal.classList.add("show");
    });

}

if (closeBudgetBtn && budgetModal) {

    closeBudgetBtn.addEventListener("click", () => {
        budgetModal.classList.remove("show");
    });

}
// =========================
// Save Budget
// =========================

const saveBudgetBtn = document.getElementById("saveBudgetBtn");
const budgetAmountInput = document.getElementById("budgetAmount");

if (saveBudgetBtn && budgetAmountInput) {

    saveBudgetBtn.addEventListener("click", () => {

        const amount = Number(
            budgetAmountInput.value.replace(/,/g, "")
        );

        if (!amount || amount <= 0) {
            alert("Please enter a valid budget.");
            return;
        }

        localStorage.setItem(
    "savioBudget",
    amount
);

budgetAmountInput.value = "";

if (budgetModal) {
    budgetModal.classList.remove("show");
}

// تحديث قيمة Budget فورًا
updateBudgetButton();

    });

}

// =========================
// Update Monthly Budget
// =========================

function updateBudgetButton() {

    const budgetValue =
        document.getElementById("budgetValue");

    if (!budgetValue) return;

    const budget =
        Number(localStorage.getItem("savioBudget")) || 0;

    // مفيش ميزانية
    if (budget <= 0) {
        budgetValue.textContent = "Budget";
        return;
    }

    const transactions = loadTransactions();

    // الشهر الحالي
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // مصاريف الشهر الحالي فقط
    const totalExpenses = transactions
        .filter(transaction => {

            if (transaction.type !== "expense") {
    return false;
}

if (transaction.isTransfer) {
    return false;
}
            if (!transaction.date) {
                return false;
            }

            const parts = transaction.date.split("-");

            if (parts.length !== 3) {
                return false;
            }

            const year = Number(parts[0]);
            const month = Number(parts[1]) - 1;

            return (
                year === currentYear &&
                month === currentMonth
            );

        })
        .reduce((total, transaction) => {

            return total +
                (Number(transaction.amount) || 0);

        }, 0);

    // المتبقي من ميزانية الشهر
    const remaining =
        budget - totalExpenses;

    if (remaining >= 0) {

    budgetValue.textContent =
        formatCurrency(remaining);

} else {

    budgetValue.textContent =
        `${formatCurrency(Math.abs(remaining))} over`;

}
}

// تشغيل الحساب عند فتح الصفحة
updateBudgetButton();