// ==============================
// scrip الرئيسي 
// ==============================

    
const modal = document.getElementById("expenseModal");
const closeBtn = document.getElementById("closeBtn");
const saveBtn = document.getElementById("saveBtn");



const amount = document.getElementById("amount");
const category = document.getElementById("category");

const  expenseList = document.getElementById("expenseList");
const searchInput = document.getElementById("searchInput");
const totalExpense = document.getElementById("totalExpense");
const totalIncome = document.getElementById("totalIncome");
const balance = document.getElementById("balance");
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
        
        li.innerHTML = `
<div>
    <strong>${expense.category}</strong><br>
    EGP ${expense.amount}<br>
    📅 ${expense.date}<br>
    🕒 ${expense.time}
</div>

<div>
    <button class="editBtn">
        <i data-lucide="pencil"></i>
    </button>

    <button class="deleteBtn">
        <i data-lucide="trash-2"></i>
    </button>
</div>
`;
        li.querySelector(".editBtn").onclick = () => {

    // عنصر الدخل ليه صفحته الخاصة، فبنبعت المستخدم يعدّل هناك
    if (expense.type === "income") {
        window.location.href = "pages/income.html?edit=" + index;
        return;
    }

    amount.value = expense.amount;
    category.value = expense.category;

    editIndex = index;

    modal.style.display = "flex";

};
        li.querySelector(".deleteBtn").onclick = () => {

    if (confirm("Delete this item?")) {

        expenses.splice(index, 1);

        saveTransactions(expenses);
        renderExpenses();
    }

};
        
        expenseList.appendChild(li);
        
    });
    
    totalExpense.innerText = "EGP " + Math.round(total).toLocaleString("en-US");

totalIncome.innerText = "EGP " + Math.round(income).toLocaleString("en-US");

balance.innerText = "EGP " + (income - total).toFixed(2);

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
console.log(addMenuBtn);
console.log(fabMenu);
addMenuBtn.onclick = function () {

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

closeCategoryBtn.onclick = function () {
    categoryModal.style.display = "none";
};
saveCategoryBtn.onclick = function () {

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
