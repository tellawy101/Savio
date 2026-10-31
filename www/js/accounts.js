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

function initAccountPicker() {

// Elements
const accountBoxes = document.querySelectorAll(".account-select-box");
window.activeAccountBox = null; // الصندوق اللي المستخدم داس عليه آخر مرة
const accountModal = document.getElementById("accountModal");
const addAccountBtn = document.getElementById("addAccountBtn");
const addAccountModal = document.getElementById("addAccountModal");
const accountMenu = document.getElementById("accountMenu");

const form = initAccountForm();
initAccountList(form);
initAccountIconDropdown();
    
// ==============================
// Events
// ==============================

accountBoxes.forEach(function (box) {
    box.onclick = function() {
        window.activeAccountBox = box;
        renderAccounts(); // نبني القائمة تاني عشان تاخد آخر حالة (الحساب المعطل يتحدث)
        accountModal.classList.add("show");
    };
});

closeModalOnBackdropClick(accountModal);
if (addAccountBtn) {
    addAccountBtn.onclick = function(e) {
        e.stopPropagation();
                form.resetAddAccountForm();
        accountModal.classList.remove("show");
        
        setTimeout(function() {
            addAccountModal.classList.add("show");
        }, 250);
    };
}

closeModalOnBackdropClick(addAccountModal);

// ==============================
// إغلاق قائمة تعديل/حذف الحساب عند الضغط برّه
// ==============================

closeModalOnBackdropClick(accountMenu);
// فواصل الآلاف تلقائيًا في خانة "رصيد الحساب الجديد" (من formHelpers.js)
attachThousandsFormatter(document.getElementById("newAccountBalance"), true);
}

initAccountPicker();