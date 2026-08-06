


// ==============================
// Income
// ==============================

const backBtn = document.getElementById("backBtn");
const expenseAmount = document.getElementById("expenseAmount");

// زر الرجوع
backBtn.onclick = function () {
    window.location.href = "../index.html";
};

// السماح بالسكرول مؤقتًا بس وقت ما الكيبورد يكون فاتح (خانة متركز عليها)،
// وترجيع الصفحة لوضعها الطبيعي أول ما الكيبورد يقفل
// لما الكيبورد يقفل (تسيب أي خانة كتابة)، الصفحة ترجع لفوق تلقائي
document.addEventListener("focusout", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        window.scrollTo(0, 0);
    }
});

// دالة بتقيس عرض النص بالبكسل
function getTextWidth(text, font) {
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");
    ctx.font = font;
    return ctx.measureText(text).width;
}

// دالة بتظبط شكل الخط وعرض الخانة حسب طول الرقم
function resizeAmountInput(formatted) {

    const len = formatted.replace(/,/g, "").length;

    if (len <= 3) {
        expenseAmount.style.fontSize = "52px";
    } else if (len <= 6) {
        expenseAmount.style.fontSize = "44px";
    } else if (len <= 8) {
        expenseAmount.style.fontSize = "32px";
    } else if (len <= 10) {
        expenseAmount.style.fontSize = "26px";
    } else {
        expenseAmount.style.fontSize = "22px";
    }

    const font = window.getComputedStyle(expenseAmount).fontWeight + " " +
                 window.getComputedStyle(expenseAmount).fontSize + " " +
                 window.getComputedStyle(expenseAmount).fontFamily;

    const textWidth = getTextWidth(formatted, font);

    expenseAmount.style.width = (Math.ceil(textWidth) + 8) + "px";
}

// تحديث المبلغ
expenseAmount.addEventListener("input", function () {

    let value = this.value.replace(/,/g, "");

    if (value === "") {
        expenseAmount.value = "0";
        return;
    }

    value = value.replace(/\D/g, "");

    if (value === "") {
        expenseAmount.value = "0";
        this.value = "";
        return;
    }

    const formatted = Number(value).toLocaleString("en-US");

    this.value = formatted;

    resizeAmountInput(formatted);

    checkExpenseForm();
});

const saveExpenseBtn = document.getElementById("saveExpenseBtn");
const expenseAccount = document.getElementById("expenseAccount");
const expenseDescription = document.getElementById("expenseDescription");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");
const today = new Date().toISOString().split("T")[0];
expenseDate.value = today;
// وضع التعديل: لو جاي من الصفحة الرئيسية بـ ?edit=index
const urlParams = new URLSearchParams(window.location.search);
const editIndex = urlParams.has("edit") ? Number(urlParams.get("edit")) : -1;

// دالة بترجع اسم أول حقل ناقص، أو null لو كله تمام
function getMissingField() {

    const amount = Number(expenseAmount.value.replace(/,/g, ""));
    const account = expenseAccount.textContent.trim();
    const category = expenseCategory.textContent.trim();
    const date = expenseDate.value;

    if (amount <= 0) return "المبلغ";
    if (account === "Select Account") return "الحساب";
if (category === "Select Category") return "التصنيف";
    if (date.length === 0) return "التاريخ";
    return null;
}

// شكل الزرار بيتغير بس للتوضيح، لكن هو شغال دايمًا (validation بتحصل وقت الضغط)
function checkExpenseForm() {    saveExpenseBtn.style.opacity = getMissingField() ? "0.5" : "1";
}

expenseDate.addEventListener("change", checkExpenseForm);

// لو في تعديل، هات بيانات العنصر واملأ الفورم بيها
function loadEditingExpense() {

    if (editIndex === -1) return;

    const transactions = loadTransactions();
    const entry = transactions[editIndex];

    if (!entry) return;

    const formatted = Number(entry.amount).toLocaleString("en-US");
    expenseAmount.value = formatted;
    resizeAmountInput(formatted);

    expenseAccount.textContent = entry.account;
    expenseCategory.textContent = entry.category;
    expenseDescription.value = entry.description || "";
    expenseDate.value = entry.date;

    saveExpenseBtn.textContent = "✓";
}

const newAccountBalance = document.getElementById("newAccountBalance");

newAccountBalance.addEventListener("input", function () {

    let value = this.value.replace(/,/g, "");

    // اسمح بالأرقام فقط
    value = value.replace(/\D/g, "");

    if (value === "") {
        this.value = "";
        return;
    }

    // إضافة الفواصل
    this.value = Number(value).toLocaleString("en-US");
});

saveExpenseBtn.onclick = function () {

    const missing = getMissingField();

    if (missing) {
        showToast("من فضلك حدد " + missing);
        return;
    }

    let transactions = loadTransactions();

    const entryData = {
        amount: Number(expenseAmount.value.replace(/,/g, "")),
        account: expenseAccount.textContent.trim(),
        description: expenseDescription.value.trim(),
        category: expenseCategory.textContent.trim(),
        type: "expense",
        date: expenseDate.value,
        time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    };

    if (editIndex !== -1 && transactions[editIndex]) {
        transactions[editIndex] = { ...transactions[editIndex], ...entryData };
    } else {
        transactions.push(entryData);
    }

    saveTransactions(transactions);
    
    window.location.href = "../index.html";
};

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

const accountBox = document.querySelector(".account-select-box");
const accountModal = document.getElementById("accountModal");

accountBox.onclick = function () {
    accountModal.classList.add("show");
};

const categoryBox = document.querySelector(".category-select-box");
const categoryModal = document.getElementById("categoryModal");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const addCategoryModal = document.getElementById("addCategoryModal");

categoryBox.onclick = function () {
    categoryModal.classList.add("show");
};

addCategoryBtn.onclick = function (e) {

    e.stopPropagation();

    categoryModal.classList.remove("show");

    setTimeout(function () {
        addCategoryModal.classList.add("show");
    }, 250);

};

// إغلاق نافذة الحساب عند الضغط خارجها
accountModal.onclick = function (e) {
    if (e.target === accountModal) {
        accountModal.classList.remove("show");
    }
};

// إغلاق نافذة التصنيف عند الضغط خارجها
categoryModal.onclick = function (e) {
    if (e.target === categoryModal) {
        categoryModal.classList.remove("show");
    }
};

const addAccountBtn = document.getElementById("addAccountBtn");
const addAccountModal = document.getElementById("addAccountModal");

const accountMenu = document.getElementById("accountMenu");
let selectedAccount = "";
let selectedCategory = "";

addAccountBtn.onclick = function (e) {

    e.stopPropagation();

    accountModal.classList.remove("show");

    setTimeout(function () {
        addAccountModal.classList.add("show");
    }, 250);

};

addAccountModal.onclick = function (e) {
    if (e.target === addAccountModal) {
        addAccountModal.classList.remove("show");
    }
};

let editingAccount = null;
let editingCategory = null;
const editAccountBtn = document.getElementById("editAccountBtn");
const editCategoryBtn = document.getElementById("editCategoryBtn");
const saveAccountBtn = document.getElementById("saveAccountBtn");
const saveCategoryBtn = document.getElementById("saveCategoryBtn");

function showToast(message, type = "error") {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    if (type === "success") {
        toast.style.background = "#43A047";
    } else {
        toast.style.background = "#E53935";
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);

}

saveAccountBtn.onclick = function () {

    let name = document.getElementById("newAccountName").value.trim();
    let icon = document.getElementById("newAccountIcon").value;
    let balance = document.getElementById("newAccountBalance").value.trim();

    if (name === "" || balance === "") {
        alert("Please fill all fields");
        return;
    }

    let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    let sameAccount = accounts.find(account =>
        account.name.toLowerCase() === name.toLowerCase()
    );

    if (sameAccount && (!editingAccount || sameAccount.name !== editingAccount.name)) {
        showToast("Account name already exists");
        return;
    }

    if (editingAccount) {

        let index = accounts.findIndex(a => a.name === editingAccount.name);

        accounts[index] = {
            name: name,
            icon: icon,
            balance: Number(balance.replace(/,/g, ""))
        };

        editingAccount = null;

    } else {

        accounts.push({
            name: name,
            icon: icon,
            balance: Number(balance.replace(/,/g, ""))
        });

    }

    localStorage.setItem("accounts", JSON.stringify(accounts));

    expenseAccount.textContent = `${icon} ${name}`;

    renderAccounts();

    showToast("Account added", "success");

    // قفل نافذة إضافة الحساب
    addAccountModal.classList.remove("show");

    // فضّي الفورم
    document.getElementById("newAccountName").value = "";
    document.getElementById("newAccountIcon").selectedIndex = 0;
    document.getElementById("newAccountBalance").value = "";
    editingAccount = null;

    checkExpenseForm();
};

function renderAccounts() {

    const accountsList = document.getElementById("accountsList");

    if (!accountsList) return;

    accountsList.innerHTML = "";

    let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    accounts.forEach(account => {

        const item = document.createElement("div");

        item.dataset.name = account.name;

        item.className = "account-item";

        item.innerHTML = `
    <div class="account-item-icon">${account.icon}</div>

    <div class="account-info">
        <div class="account-name">${account.name}</div>
        <div class="account-balance">
            ${Number(account.balance).toLocaleString()} EGP
        </div>
    </div>

    <div class="account-arrow">›</div>
`;
        let pressTimer;

        item.addEventListener("touchstart", function () {

            pressTimer = setTimeout(function () {
                selectedAccount = account.name;

                document.getElementById("accountMenu").classList.add("show");

            }, 700);

        });

        item.addEventListener("touchend", function () {

            clearTimeout(pressTimer);

        });

        item.onclick = function() {
    
    expenseAccount.textContent = `${account.icon} ${account.name}`;
    
    accountModal.classList.remove("show");
    checkExpenseForm();
};

        accountsList.appendChild(item);

    });

}

function renderCategories() {

    const categoriesList = document.getElementById("categoriesList");

    if (!categoriesList) return;

    categoriesList.innerHTML = "";

    let categories = JSON.parse(localStorage.getItem("categories")) || [];

    categories.forEach(category => {

        const item = document.createElement("div");

        item.className = "account-item";

        item.innerHTML = `
            <div class="account-item-icon">${category.icon}</div>

            <div class="account-info">
                <div class="account-name">${category.name}</div>
            </div>

            <div class="account-arrow">›</div>
        `;

        let pressTimer;

        item.addEventListener("touchstart", function () {

            pressTimer = setTimeout(function () {

                selectedCategory = category;

                document.getElementById("categoryMenu").classList.add("show");

            }, 700);

        });

        item.addEventListener("touchend", function () {

            clearTimeout(pressTimer);

        });

        item.onclick = function () {

            expenseCategory.textContent =
                category.icon + " " + category.name;

            categoryModal.classList.remove("show");
            checkExpenseForm();
        };

        categoriesList.appendChild(item);

    });

}

renderAccounts();
renderCategories();
loadEditingExpense();
checkExpenseForm();

document.getElementById("accountMenu").onclick = function (e) {

    if (e.target === this) {
        this.classList.remove("show");
    }

};

document.getElementById("categoryMenu").onclick = function (e) {

    if (e.target === this) {
        this.classList.remove("show");
    }

};

const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const deleteCategoryBtn = document.getElementById("deleteCategoryBtn");
const categoryMenu = document.getElementById("categoryMenu");

deleteAccountBtn.onclick = function () {

    let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    accounts = accounts.filter(account => account.name !== selectedAccount);

    localStorage.setItem("accounts", JSON.stringify(accounts));

    renderAccounts();

    accountMenu.classList.remove("show");

};

deleteCategoryBtn.onclick = function () {

    let categories = JSON.parse(localStorage.getItem("categories")) || [];

    categories = categories.filter(category => category.name !== selectedCategory.name);

    localStorage.setItem("categories", JSON.stringify(categories));

    renderCategories();

    if (expenseCategory.textContent.includes(selectedCategory.name)) {
        expenseCategory.textContent = "Select Category";
    }

    categoryMenu.classList.remove("show");

    showToast("Category deleted", "success");

};

editAccountBtn.onclick = function () {

    let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    editingAccount = accounts.find(a => a.name === selectedAccount);

    if (!editingAccount) return;

    document.getElementById("newAccountName").value = editingAccount.name;
    document.getElementById("newAccountIcon").value = editingAccount.icon;
    document.getElementById("newAccountBalance").value =
        Number(editingAccount.balance).toLocaleString("en-US");

    accountMenu.classList.remove("show");

    addAccountModal.classList.add("show");

};

editCategoryBtn.onclick = function () {

    editingCategory = selectedCategory;

    if (!editingCategory) return;

    document.getElementById("newCategoryName").value = editingCategory.name;
    document.getElementById("newCategoryIcon").value = editingCategory.icon;

    categoryMenu.classList.remove("show");

    addCategoryModal.classList.add("show");

};

saveCategoryBtn.onclick = function () {

    let name = document.getElementById("newCategoryName").value.trim();
    let icon = document.getElementById("newCategoryIcon").value.trim();

    if (name === "" || icon === "") {
        showToast("Please fill all fields");
        return;
    }

    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    let isEditing = editingCategory !== null;

    if (editingCategory) {

        let index = categories.findIndex(c => c.name === editingCategory.name);

        categories[index] = {
            name: name,
            icon: icon
        };

        editingCategory = null;

    } else {

        categories.push({
            name: name,
            icon: icon
        });

    }

    localStorage.setItem("categories", JSON.stringify(categories));
    renderCategories();
    addCategoryModal.classList.remove("show");

    document.getElementById("newCategoryName").value = "";
    document.getElementById("newCategoryIcon").value = "";

    if (isEditing) {
        showToast("Category updated", "success");
    } else {
        showToast("Category added", "success");
    }

};