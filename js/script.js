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
    expenses.forEach((expense, index) => {
        
        if (
            !expense.category
            .toLowerCase()
            .includes(searchInput.value.toLowerCase())
        ) {
            return;
        }
        
        if (expense.type === "expense") {
            total += expense.amount;
        } else if (expense.type === "income") {
            income += expense.amount;
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
                    EGP ${Number(expense.amount).toLocaleString("en-US")}
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

        expenses.splice(index, 1);
        saveTransactions(expenses);
        renderExpenses();

    }

});

editBtn.addEventListener("click", (e) => {

    e.stopPropagation();

    if (expense.type === "income") {

        window.location.href = "pages/income.html?edit=" + index;
        return;

    }

    if (expense.type === "expense") {

        window.location.href = "pages/expense.html?edit=" + index;
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
    
    totalExpense.innerText = "EGP " + Math.round(total).toLocaleString("en-US");
    
    totalIncome.innerText = "EGP " + Math.round(income).toLocaleString("en-US");
    
   balance.innerText = (income - total).toLocaleString("en-US");
    
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

fabTransfer.onclick = function () {
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