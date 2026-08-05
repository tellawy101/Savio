// ==============================
// scrip الرئيسي 
// ==============================


const modal = document.getElementById("expenseModal");
const closeBtn = document.getElementById("closeBtn");
const saveBtn = document.getElementById("saveBtn");



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
const addCategoryBtn = document.getElementById("addCategoryBtn");
const categoryModal = document.getElementById("categoryModal");
const closeCategoryBtn = document.getElementById("closeCategoryBtn");
const saveCategoryBtn = document.getElementById("saveCategoryBtn");

const newCategoryName = document.getElementById("newCategoryName");
const newCategoryIcon = document.getElementById("newCategoryIcon");
// تحميل البيانات
let expenses = loadTransactions();
let income = 0;
let total = 0;
let editIndex = -1;

// غلق نافذة المصروف
closeBtn.onclick = () => {
    modal.style.display = "none";
};

// ألوان وأيقونات كل فئة
const CATEGORY_STYLES = {
    "Food": { icon: "🍔", color: "#F59E0B" },
    "Transport": { icon: "🚗", color: "#3B82F6" },
    "Bills": { icon: "🧾", color: "#EF4444" },
    "Shopping": { icon: "🛍️", color: "#EC4899" },
    "Health": { icon: "💊", color: "#10B981" },
    "Entertainment": { icon: "🎬", color: "#8B5CF6" },
    "Other": { icon: "📦", color: "#6B7280" }
};

function getCategoryStyle(category) {
    const firstWord = category.split(" ")[0];
    // لو أول حرف في اسم الفئة مش إنجليزي، يبقى الأرجح إنه إيموجي مختار يدوي
    if (firstWord && firstWord.codePointAt(0) > 127) {
        return { icon: firstWord, color: "#0F766E" };
    }
    return CATEGORY_STYLES[category] || { icon: "💰", color: "#0F766E" };
}

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
        
        const catStyle = getCategoryStyle(expense.category);
        
        li.innerHTML = `
<div class="expense-main">

    <div class="expense-icon-box" style="background:${catStyle.color}33;">
        <span>${catStyle.icon}</span>
    </div>

    <div class="expense-info">
        <div class="expense-desc">
            ${expense.description || expense.category}
        </div>

        <div class="expense-account">
            ${expense.account || ""}
        </div>
    </div>

    <div class="expense-right">
        <div class="expense-amount">
            EGP ${expense.amount}
        </div>

        <div class="expense-meta">
            ${expense.date}
        </div>
    </div>

</div>
`;
        expenseList.appendChild(li);
        expenseList.appendChild(li);
        
    });
    
    totalExpense.innerText = "EGP " + Math.round(total).toLocaleString("en-US");
    
    totalIncome.innerText = "EGP " + Math.round(income).toLocaleString("en-US");
    
   balance.innerText = (income - total).toLocaleString("en-US");
    
    if (window.lucide) {
        lucide.createIcons();
    }
}
// حفظ المصروف
saveBtn.onclick = () => {
    
    if (amount.value === "") {
        alert("Please enter an amount.");
        return;
    }
    
    const expenseData = createExpenseData(
        amount.value,
        category.value
    );
    if (editIndex === -1) {
        expenses.push(expenseData);
    } else {
        expenses[editIndex] = expenseData;
        editIndex = -1;
    }
    
    saveTransactions(expenses);
    
    renderExpenses();
    
    amount.value = "";
    category.selectedIndex = 0;
    editIndex = -1;
    
    modal.style.display = "none";
    
};

// // تشغيل التطبيق
renderExpenses();
addMenuBtn.onclick = function() {
    
    if (fabMenu.classList.contains("show")) {
        fabMenu.classList.remove("show");
        addMenuBtn.classList.remove("open");
    } else {
        fabMenu.classList.add("show");
        addMenuBtn.classList.add("open");
    }
    
};

fabExpense.onclick = function() {
    fabMenu.classList.remove("show");
    addMenuBtn.classList.remove("open");
    modal.style.display = "flex";
};

fabIncome.onclick = function() {
    window.location.href = "pages/income.html";
};

addCategoryBtn.onclick = function() {
    categoryModal.style.display = "flex";
};

closeCategoryBtn.onclick = function() {
    categoryModal.style.display = "none";
};
saveCategoryBtn.onclick = function() {
    
    if (newCategoryName.value === "" || newCategoryIcon.value === "") {
        alert("Enter category name and icon");
        return;
    }
    
    const option = document.createElement("option");
    option.value = `${newCategoryIcon.value} ${newCategoryName.value}`;
    option.textContent = `${newCategoryIcon.value} ${newCategoryName.value}`;
    
    category.appendChild(option);
    
    category.value = option.value;
    
    newCategoryName.value = "";
    newCategoryIcon.value = "";
    
    categoryModal.style.display = "none";
    
};