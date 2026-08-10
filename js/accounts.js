// ======================================
// accounts.js
// إدارة الحسابات داخل التطبيق (Reusable Component - DRY)
//
// شغال على أي صفحة فيها العناصر دي (Income أو Expense):
// - فتح نافذة الحسابات
// - إضافة حساب جديد
// - تعديل حساب
// - حذف حساب
// - حفظ الحسابات في LocalStorage
// - عرض الحسابات داخل المودال
// ======================================

// Elements
const accountBox = document.querySelector(".account-select-box");
const accountModal = document.getElementById("accountModal");
const addAccountBtn = document.getElementById("addAccountBtn");
const addAccountModal = document.getElementById("addAccountModal");
const accountMenu = document.getElementById("accountMenu");

const saveAccountBtn = document.getElementById("saveAccountBtn");
const editAccountBtn = document.getElementById("editAccountBtn");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

// State
let selectedAccount = "";
let editingAccount = null;

// ==============================
// Events
// ==============================

if (accountBox) {
    accountBox.onclick = function() {
        accountModal.classList.add("show");
    };
}

if (accountModal) {
    accountModal.onclick = function(e) {
        if (e.target === accountModal) {
            accountModal.classList.remove("show");
        }
    };
}

if (addAccountBtn) {
    addAccountBtn.onclick = function(e) {
        e.stopPropagation();
        
        accountModal.classList.remove("show");
        
        setTimeout(function() {
            addAccountModal.classList.add("show");
        }, 250);
    };
}

if (addAccountModal) {
    addAccountModal.onclick = function(e) {
        if (e.target === addAccountModal) {
            addAccountModal.classList.remove("show");
        }
    };
}

// ==============================
// Render
// ==============================

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
    <div class="account-item-icon"><i data-lucide="${account.icon}"></i></div>

    <div class="account-info">
        <div class="account-name">${account.name}</div>
        <div class="account-balance">
            ${Number(account.balance).toLocaleString()} EGP
        </div>
    </div>

    <div class="account-arrow">›</div>
`;
        let pressTimer;
        
        item.addEventListener("touchstart", function() {
            pressTimer = setTimeout(function() {
                selectedAccount = account.name;
                document.getElementById("accountMenu").classList.add("show");
            }, 700);
        });
        
        item.addEventListener("touchend", function() {
            clearTimeout(pressTimer);
        });
        
        item.onclick = function() {
            const field = getAccountFieldEl();
            if (field) {
                field.innerHTML = `<i data-lucide="${account.icon}"></i> ${account.name}`;
                if (window.lucide) lucide.createIcons();
            }
            
            accountModal.classList.remove("show");
            notifyFormFieldChanged();
        };
        
        accountsList.appendChild(item);
    });
    
    if (window.lucide) lucide.createIcons();
}

// ==============================
// Add / Edit Account
// ==============================

if (saveAccountBtn) {
    saveAccountBtn.onclick = function() {
        
        let name = document.getElementById("newAccountName").value.trim();
let description = document.getElementById("newAccountDescription").value.trim();
let icon = document.getElementById("newAccountIcon").value;
let balance = document.getElementById("newAccountBalance").value.trim();

if (balance === "") {
    balance = "0";
}

if (name === "") {
    alert("Please enter account name");
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
    name,
    description,
    icon,
    balance: Number(balance.replace(/,/g, ""))
};

            editingAccount = null;
            
        } else {
            
            accounts.push({
    name,
    description,
    icon,
    balance: Number(balance.replace(/,/g, ""))
});
}

localStorage.setItem("accounts", JSON.stringify(accounts));
        
        const field = getAccountFieldEl();
        if (field) {
            field.innerHTML = `<i data-lucide="${icon}"></i> ${name}`;
            if (window.lucide) lucide.createIcons();
        }
        
        renderAccounts();
        
        showToast("Account added", "success");
        
        addAccountModal.classList.remove("show");
        
        document.getElementById("newAccountName").value = "";
document.getElementById("newAccountDescription").value = "";
document.getElementById("newAccountBalance").value = "";
selectedIconPreview.setAttribute("data-lucide", "wallet");
selectedIconLabel.textContent = "اختر أيقونة";
newAccountIconInput.value = "wallet";
if (window.lucide) lucide.createIcons();
        
        notifyFormFieldChanged();
    };
}

if (editAccountBtn) {
    editAccountBtn.onclick = function() {
        
        let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
        
        editingAccount = accounts.find(a => a.name === selectedAccount);
        
        if (!editingAccount) return;
        
        document.getElementById("newAccountName").value = editingAccount.name;
document.getElementById("newAccountDescription").value = editingAccount.description || "";
document.getElementById("selectedIconPreviewWrap").innerHTML =
    `<i data-lucide="${editingAccount.icon}" id="selectedIconPreview"></i>`;
const matchedOption = document.querySelector(`.icon-option[data-icon="${editingAccount.icon}"]`);
selectedIconLabel.textContent = matchedOption ? matchedOption.dataset.label : editingAccount.icon;
newAccountIconInput.value = editingAccount.icon;
if (window.lucide) lucide.createIcons();
        document.getElementById("newAccountBalance").value =
            Number(editingAccount.balance).toLocaleString("en-US");
        
        accountMenu.classList.remove("show");
        
        addAccountModal.classList.add("show");
    };
}

// ==============================
// Delete Account
// ==============================

if (deleteAccountBtn) {
    deleteAccountBtn.onclick = function() {
        
        let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
        
        accounts = accounts.filter(account => account.name !== selectedAccount);
        
        localStorage.setItem("accounts", JSON.stringify(accounts));
        
        renderAccounts();
        
        accountMenu.classList.remove("show");
        notifyFormFieldChanged();
    };
}



// ==============================
// إغلاق قائمة تعديل/حذف الحساب عند الضغط برّه
// ==============================

if (accountMenu) {
    accountMenu.onclick = function(e) {
        if (e.target === this) {
            this.classList.remove("show");
        }
    };
}

// فواصل الآلاف تلقائيًا في خانة "رصيد الحساب الجديد" (من formHelpers.js)
attachThousandsFormatter(document.getElementById("newAccountBalance"));

// ==============================
// Icon Dropdown
// ==============================

const iconDropdownTrigger = document.getElementById("iconDropdownTrigger");
const iconDropdownList = document.getElementById("iconDropdownList");
const selectedIconPreview = document.getElementById("selectedIconPreview");
const selectedIconLabel = document.getElementById("selectedIconLabel");
const newAccountIconInput = document.getElementById("newAccountIcon");

if (iconDropdownTrigger) {
    iconDropdownTrigger.onclick = function(e) {
        e.stopPropagation();
        iconDropdownList.classList.toggle("show");
    };
}

document.querySelectorAll(".icon-option").forEach(option => {
    option.onclick = function() {
        const icon = this.dataset.icon;
        const label = this.dataset.label;

        newAccountIconInput.value = icon;
document.getElementById("selectedIconPreviewWrap").innerHTML =
    `<i data-lucide="${icon}" id="selectedIconPreview"></i>`;
selectedIconLabel.textContent = label;

        iconDropdownList.classList.remove("show");

        if (window.lucide) lucide.createIcons();
    };
});

document.addEventListener("click", function(e) {
    if (iconDropdownList && !iconDropdownList.contains(e.target) && e.target !== iconDropdownTrigger) {
        iconDropdownList.classList.remove("show");
    }
});
const cancelAddAccountBtn = document.getElementById("cancelAddAccountBtn");

if (cancelAddAccountBtn) {
    cancelAddAccountBtn.onclick = function() {
        addAccountModal.classList.remove("show");
        editingAccount = null;

        document.getElementById("newAccountName").value = "";
        document.getElementById("newAccountDescription").value = "";
        document.getElementById("newAccountBalance").value = "";
        selectedIconPreview.setAttribute("data-lucide", "wallet");
        selectedIconLabel.textContent = "اختر أيقونة";
        newAccountIconInput.value = "wallet";
        if (window.lucide) lucide.createIcons();
    };
}
