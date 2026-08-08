// ==============================
// expense.js
// ==============================

// ==============================
// العناصر الأساسية
// ==============================

const backBtn = document.getElementById("backBtn");
const expenseAmount = document.getElementById("expenseAmount");
const saveExpenseBtn = document.getElementById("saveExpenseBtn");

const expenseAccount = document.getElementById("expenseAccount");
const expenseDescription = document.getElementById("expenseDescription");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");


// ==============================
// زر الرجوع
// ==============================

backBtn.onclick = function () {
    window.location.href = "../index.html";
};


// ==============================
// التحكم في السكرول مع الكيبورد
// ==============================

document.addEventListener("focusout", function (e) {

    if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA"
    ) {
        window.scrollTo(0, 0);
    }

});


// ==============================
// قياس عرض النص
// ==============================

function getTextWidth(text, font) {

    const canvas =
        getTextWidth.canvas ||
        (getTextWidth.canvas = document.createElement("canvas"));

    const ctx = canvas.getContext("2d");

    ctx.font = font;

    return ctx.measureText(text).width;
}


// ==============================
// تغيير حجم خانة المبلغ
// ==============================

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

    const computedStyle =
        window.getComputedStyle(expenseAmount);

    const font =
        computedStyle.fontWeight +
        " " +
        computedStyle.fontSize +
        " " +
        computedStyle.fontFamily;

    const textWidth =
        getTextWidth(formatted, font);

    expenseAmount.style.width =
        (Math.ceil(textWidth) + 8) + "px";
}


// ==============================
// تحديث المبلغ أثناء الكتابة
// ==============================

expenseAmount.addEventListener("input", function () {

    let value = this.value.replace(/,/g, "");

    if (value === "") {

        this.value = "0";

        checkExpenseForm();

        return;
    }

    value = value.replace(/\D/g, "");

    if (value === "") {

        this.value = "0";

        checkExpenseForm();

        return;
    }

    const formatted =
        Number(value).toLocaleString("en-US");

    this.value = formatted;

    resizeAmountInput(formatted);

    checkExpenseForm();

});


// ==============================
// التاريخ الافتراضي
// ==============================

const today =
    new Date().toISOString().split("T")[0];

expenseDate.value = today;


// ==============================
// وضع التعديل
// ==============================

// لو جاي من الصفحة الرئيسية بالشكل:
// expense.html?edit=3

const urlParams =
    new URLSearchParams(window.location.search);

let editIndex =
    urlParams.has("edit")
        ? Number(urlParams.get("edit"))
        : -1;


// ==============================
// معرفة الحقل الناقص
// ==============================

function getMissingField() {

    const amount =
        Number(
            expenseAmount.value.replace(/,/g, "")
        );

    const account =
        expenseAccount.textContent.trim();

    const category =
        expenseCategory.textContent.trim();

    const date =
        expenseDate.value;


    if (amount <= 0) {
        return "المبلغ";
    }

    if (account === "Select Account") {
        return "الحساب";
    }

    if (category === "Select Category") {
        return "التصنيف";
    }

    if (date.length === 0) {
        return "التاريخ";
    }

    return null;
}


// ==============================
// فحص الفورم
// ==============================

function checkExpenseForm() {

    if (!saveExpenseBtn) {
        return;
    }

    saveExpenseBtn.style.opacity =
        getMissingField() ? "0.5" : "1";
}


// ==============================
// تغيير التاريخ
// ==============================

expenseDate.addEventListener(
    "change",
    checkExpenseForm
);


// ==============================
// تحميل المصروف عند التعديل
// ==============================

function loadEditingExpense() {

    if (editIndex === -1) {
        return;
    }

    const transactions =
        loadTransactions();

    const entry =
        transactions[editIndex];

    if (!entry) {
        return;
    }

    // المبلغ
    const formatted =
        Number(entry.amount)
            .toLocaleString("en-US");

    expenseAmount.value = formatted;

    resizeAmountInput(formatted);


    // الحساب
    expenseAccount.textContent =
        entry.account || "Select Account";


    // التصنيف
    expenseCategory.textContent =
        entry.category || "Select Category";


    // الوصف
    expenseDescription.value =
        entry.description || "";


    // التاريخ
    expenseDate.value =
        entry.date || today;


    // زر الحفظ
    saveExpenseBtn.textContent = "✓";

}


// ==============================
// رصيد الحساب الجديد
// ==============================

const newAccountBalance =
    document.getElementById("newAccountBalance");

if (newAccountBalance) {

    newAccountBalance.addEventListener(
        "input",
        function () {

            let value =
                this.value.replace(/,/g, "");

            // أرقام فقط
            value =
                value.replace(/\D/g, "");

            if (value === "") {

                this.value = "";

                return;
            }

            // إضافة الفواصل
            this.value =
                Number(value)
                    .toLocaleString("en-US");

        }
    );

}


// ==============================
// حفظ المصروف
// ==============================

saveExpenseBtn.onclick = function () {

    const missing =
        getMissingField();

    if (missing) {

        showToast(
            "من فضلك حدد " + missing
        );

        return;
    }


    let transactions =
        loadTransactions();


    const entryData = {

        amount:
            Number(
                expenseAmount.value
                    .replace(/,/g, "")
            ),

        account:
            expenseAccount.textContent.trim(),

        description:
            expenseDescription.value.trim(),

        category:
            expenseCategory.textContent.trim(),

        type:
            "expense",

        date:
            expenseDate.value,

        time:
            new Date().toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )

    };


    // تعديل مصروف موجود
    if (
        editIndex !== -1 &&
        transactions[editIndex]
    ) {

        transactions[editIndex] = {
            ...transactions[editIndex],
            ...entryData
        };

    }

    // إضافة مصروف جديد
    else {

        transactions.push(entryData);

    }


    saveTransactions(transactions);


    // الرجوع للصفحة الرئيسية
    window.location.href =
        "../index.html";

};


// ==============================
// الثيم
// ==============================

if (
    localStorage.getItem("theme") === "dark"
) {

    document.body.classList.add("dark");

}


// ==============================
// التصنيفات
// ==============================

const categoryBox =
    document.querySelector(
        ".category-select-box"
    );

const categoryModal =
    document.getElementById(
        "categoryModal"
    );

const addCategoryBtn =
    document.getElementById(
        "addCategoryBtn"
    );

const addCategoryModal =
    document.getElementById(
        "addCategoryModal"
    );

const editCategoryBtn =
    document.getElementById(
        "editCategoryBtn"
    );

const saveCategoryBtn =
    document.getElementById(
        "saveCategoryBtn"
    );

const deleteCategoryBtn =
    document.getElementById(
        "deleteCategoryBtn"
    );

const categoryMenu =
    document.getElementById(
        "categoryMenu"
    );


// ==============================
// فتح قائمة التصنيفات
// ==============================

if (categoryBox) {

    categoryBox.onclick = function () {

        categoryModal.classList.add("show");

    };

}


// ==============================
// إضافة تصنيف جديد
// ==============================

if (addCategoryBtn) {

    addCategoryBtn.onclick = function (e) {

        e.stopPropagation();

        categoryModal.classList.remove("show");


        setTimeout(function () {

            addCategoryModal.classList.add("show");

        }, 250);

    };

}


// ==============================
// إغلاق قائمة التصنيفات
// عند الضغط خارجها
// ==============================

if (categoryModal) {

    categoryModal.onclick = function (e) {

        if (e.target === categoryModal) {

            categoryModal.classList.remove("show");

        }

    };

}


// ==============================
// عرض التصنيفات
// ==============================

function renderCategories() {

    const categoriesList =
        document.getElementById(
            "categoriesList"
        );

    if (!categoriesList) {
        return;
    }


    categoriesList.innerHTML = "";


    let categories =
        JSON.parse(
            localStorage.getItem("categories")
        ) || [];


    categories.forEach(function (category) {

        const item =
            document.createElement("div");


        item.className =
            "account-item";


        item.innerHTML = `
            <div class="account-item-icon">
                ${category.icon}
            </div>

            <div class="account-info">
                <div class="account-name">
                    ${category.name}
                </div>
            </div>

            <div class="account-arrow">
                ›
            </div>
        `;


        // ==============================
        // الضغط المطول
        // ==============================

        let pressTimer;


        item.addEventListener(
            "touchstart",
            function () {

                pressTimer =
                    setTimeout(function () {

                        selectedCategory =
                            category;

                        if (categoryMenu) {

                            categoryMenu.classList.add(
                                "show"
                            );

                        }

                    }, 700);

            }
        );


        item.addEventListener(
            "touchend",
            function () {

                clearTimeout(pressTimer);

            }
        );


        item.addEventListener(
            "touchmove",
            function () {

                clearTimeout(pressTimer);

            }
        );


        // ==============================
        // اختيار التصنيف
        // ==============================

        item.onclick = function () {

            expenseCategory.textContent =
                category.icon +
                " " +
                category.name;


            categoryModal.classList.remove(
                "show"
            );


            checkExpenseForm();

        };


        categoriesList.appendChild(item);

    });

}

// ==============================
// إغلاق category menu
// ==============================

if (categoryMenu) {

    categoryMenu.onclick = function (e) {

        if (e.target === this) {

            this.classList.remove("show");

        }

    };

}


// ==============================
// حذف التصنيف
// ==============================

if (deleteCategoryBtn) {

    deleteCategoryBtn.onclick = function () {

        if (!selectedCategory) {
            return;
        }


        let categories =
            JSON.parse(
                localStorage.getItem("categories")
            ) || [];


        categories =
            categories.filter(
                function (category) {

                    return (
                        category.name !==
                        selectedCategory.name
                    );

                }
            );


        localStorage.setItem(
            "categories",
            JSON.stringify(categories)
        );


        renderCategories();


        if (
            expenseCategory.textContent.includes(
                selectedCategory.name
            )
        ) {

            expenseCategory.textContent =
                "Select Category";

        }


        if (categoryMenu) {

            categoryMenu.classList.remove(
                "show"
            );

        }


        showToast(
            "Category deleted",
            "success"
        );


        selectedCategory = null;

    };

}


// ==============================
// تعديل التصنيف
// ==============================

if (editCategoryBtn) {

    editCategoryBtn.onclick = function () {

        if (!selectedCategory) {
            return;
        }


        editingCategory =
            selectedCategory;


        document.getElementById(
            "newCategoryName"
        ).value =
            editingCategory.name;


        document.getElementById(
            "newCategoryIcon"
        ).value =
            editingCategory.icon;


        if (categoryMenu) {

            categoryMenu.classList.remove(
                "show"
            );

        }


        addCategoryModal.classList.add(
            "show"
        );

    };

}


// ==============================
// حفظ / إضافة / تعديل التصنيف
// ==============================

if (saveCategoryBtn) {

    saveCategoryBtn.onclick = function () {

        const nameInput =
            document.getElementById(
                "newCategoryName"
            );

        const iconInput =
            document.getElementById(
                "newCategoryIcon"
            );


        const name =
            nameInput.value.trim();

        const icon =
            iconInput.value.trim();


        if (
            name === "" ||
            icon === ""
        ) {

            showToast(
                "Please fill all fields"
            );

            return;
        }


        let categories =
            JSON.parse(
                localStorage.getItem("categories")
            ) || [];


        const isEditing =
            editingCategory !== null;


        // ==============================
        // تعديل تصنيف
        // ==============================

        if (editingCategory) {

            const index =
                categories.findIndex(
                    function (category) {

                        return (
                            category.name ===
                            editingCategory.name
                        );

                    }
                );


            if (index !== -1) {

                categories[index] = {

                    name: name,
                    icon: icon

                };

            }


            // تحديث التصنيف المختار
            if (
                expenseCategory.textContent.includes(
                    editingCategory.name
                )
            ) {

                expenseCategory.textContent =
                    icon + " " + name;

            }


            editingCategory = null;
            selectedCategory = null;

        }


        // ==============================
        // إضافة تصنيف جديد
        // ==============================

        else {

            categories.push({

                name: name,
                icon: icon

            });

        }


        // حفظ التصنيفات
        localStorage.setItem(
            "categories",
            JSON.stringify(categories)
        );


        // إعادة عرض القائمة
        renderCategories();


        // إغلاق النافذة
        addCategoryModal.classList.remove(
            "show"
        );


        // تنظيف الحقول
        nameInput.value = "";
        iconInput.value = "";


        // الرسالة
        if (isEditing) {

            showToast(
                "Category updated",
                "success"
            );

        } else {

            showToast(
                "Category added",
                "success"
            );

        }

    };

}


// ==============================
// تشغيل الصفحة
// ==============================

renderAccounts();

renderCategories();

loadEditingExpense();

checkExpenseForm();