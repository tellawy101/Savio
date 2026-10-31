// ======================================
// category.js
// إدارة التصنيفات داخل التطبيق (Reusable Component - DRY)
// ======================================


function initCategoryPicker() {
const categoryBoxes = document.querySelectorAll(".category-select-box");
const categoryModal = document.getElementById("categoryModal");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const addCategoryModal = document.getElementById("addCategoryModal");
const categoryMenu = document.getElementById("categoryMenu");

const saveCategoryBtn = document.getElementById("saveCategoryBtn");
const editCategoryBtn = document.getElementById("editCategoryBtn");
const deleteCategoryBtn = document.getElementById("deleteCategoryBtn");

let selectedCategory = null;
let editingCategory = null;

// ==============================
// Category Icon Picker
// ==============================
const iconPicker = initCategoryIconPicker();
const categoryIconDropdownList = iconPicker.dropdownList;
const categoryIconDropdownHome = iconPicker.dropdownHome;
const selectedCategoryIconLabel = iconPicker.selectedLabel;

window.activeCategoryBox = null;

categoryBoxes.forEach(function (box) {
    box.onclick = function () {
        window.activeCategoryBox = box;
        renderCategories();
        categoryModal.classList.add("show");
    };
});
closeModalOnBackdropClick(categoryModal);
if (addCategoryBtn) {
    addCategoryBtn.onclick = function(e) {
        e.stopPropagation();
        
        // بنتأكد إننا بنبدأ إضافة تصنيف جديد من الصفر، مش استكمال تعديل قديم
        editingCategory = null;
        
        document.getElementById("newCategoryName").value = "";
        document.getElementById("newCategoryIcon").value = "";
        document.getElementById("selectedCategoryIconPreviewWrap").innerHTML =
            `<i data-lucide="tag" id="selectedCategoryIconPreview"></i>`;
        selectedCategoryIconLabel.textContent = t("choose_icon_label");
        if (window.lucide) lucide.createIcons();
        
        categoryModal.classList.remove("show");
        setTimeout(function() {
            addCategoryModal.classList.add("show");
        }, 250);
    };
}

closeModalOnBackdropClick(addCategoryModal, function () {
    editingCategory = null;
});
window.renderCategories = function() {
    const categoriesList = document.getElementById("categoriesList");
    if (!categoriesList) return;

    categoriesList.innerHTML = "";

    let categories = getCategories();

    categories.forEach(category => {
        const item = document.createElement("div");
        item.className = "account-item";
        item.innerHTML = renderListItemHTML(category.icon, category.name);
        let pressTimer;

        item.addEventListener("touchstart", function () {
            pressTimer = setTimeout(function () {
                selectedCategory = category;
                if (categoryMenu) categoryMenu.classList.add("show");
            }, 700);
        });

        item.addEventListener("touchend", function () {
            clearTimeout(pressTimer);
        });

        item.addEventListener("touchmove", function () {
            clearTimeout(pressTimer);
        });

        item.onclick = function() {
    const field = getCategoryFieldEl();
    if (field) {
        field.textContent = category.name;
        field.dataset.icon = category.icon;
                field.dataset.id = category.id;
        field.removeAttribute("data-i18n");
    }
    const iconEl = window.activeCategoryBox ? window.activeCategoryBox.querySelector(".category-icon") : null;
    if (iconEl) iconEl.innerHTML = `<i data-lucide="${escapeHTML(category.icon)}"></i>`;
    if (window.lucide) lucide.createIcons();
    categoryModal.classList.remove("show");
    notifyFormFieldChanged();
};

        categoriesList.appendChild(item);
    });

    if (window.lucide) {
        lucide.createIcons();
    }
};

if (saveCategoryBtn) {
    saveCategoryBtn.onclick = function () {
        const nameInput = document.getElementById("newCategoryName");
        const iconInput = document.getElementById("newCategoryIcon");

        const name = nameInput.value.trim();
        const icon = iconInput.value.trim() || "tag";

        if (name === "") {
            showToast(t("enter_category_name_toast"));
            return;
        }

        let categories = getCategories();
const isEditing = editingCategory !== null;
        // منع تكرار الاسم (من غير حساس لحالة الحروف)، مع تجاهل الفئة اللي بتتعدّل
        const nameTaken = categories.some(function (c) {
            return c.name.trim().toLowerCase() === name.toLowerCase() &&
                (!editingCategory || c.id !== editingCategory.id);
        });
        if (nameTaken) {
            showToast(t("category_exists_toast"));
            return;
        }
        if (editingCategory) {
                        const index = categories.findIndex(c => c.id === editingCategory.id);
            if (index !== -1) {
                categories[index] = { id: editingCategory.id, name, icon };
            }

            const field = getCategoryFieldEl();
            if (field && field.dataset.id === editingCategory.id) {
field.textContent = name;
const boxIcon = window.activeCategoryBox ? window.activeCategoryBox.querySelector(".category-icon") : null;
if (boxIcon) boxIcon.innerHTML = `<i data-lucide="${escapeHTML(icon)}"></i>`;
field.dataset.icon = icon;
field.dataset.id = editingCategory.id;
field.removeAttribute("data-i18n");
if (window.lucide) lucide.createIcons();
}

            editingCategory = null;
            selectedCategory = null;
        } else {
            const newCategory = { id: generateId("cat"), name, icon };
    categories.push(newCategory);
    const field = getCategoryFieldEl();
       if (field) {
        field.textContent = name;
        field.dataset.icon = icon;
        field.dataset.id = newCategory.id;
        field.removeAttribute("data-i18n");
    }
    const iconEl = window.activeCategoryBox ? window.activeCategoryBox.querySelector(".category-icon") : null;
    if (iconEl) iconEl.innerHTML = `<i data-lucide="${escapeHTML(icon)}"></i>`;
    if (window.lucide) lucide.createIcons();
}
        saveCategories(categories);
renderCategories();
addCategoryModal.classList.remove("show");
if (categoryIconDropdownList && categoryIconDropdownList.classList.contains("show")) {
    categoryIconDropdownList.classList.remove("show");
    if (categoryIconDropdownHome) categoryIconDropdownHome.appendChild(categoryIconDropdownList);
}
nameInput.value = "";
        iconInput.value = "";

        showToast(isEditing ? t("category_updated_toast") : t("category_added_toast"), "success");
        notifyFormFieldChanged();
    };
}

if (editCategoryBtn) {
    editCategoryBtn.onclick = function () {
        if (!selectedCategory) return;

        editingCategory = selectedCategory;

        document.getElementById("newCategoryName").value = editingCategory.name;
        document.getElementById("newCategoryIcon").value = editingCategory.icon;
        
        const icon = editingCategory.icon || "tag";

document.getElementById(
    "selectedCategoryIconPreviewWrap"
).innerHTML =
   `<i data-lucide="${escapeHTML(icon)}"
        id="selectedCategoryIconPreview"></i>`;

const matchedIcon = getFullIconLibrary().find(item => item.icon === icon);

selectedCategoryIconLabel.textContent =
    matchedIcon ? matchedIcon.label : icon;

if (window.lucide) {
    lucide.createIcons();
}
        

        if (categoryMenu) categoryMenu.classList.remove("show");
        addCategoryModal.classList.add("show");
    };
}

if (deleteCategoryBtn) {
    deleteCategoryBtn.onclick = async function() {
                if (!selectedCategory) return;
                if (!(await customConfirm(t("delete_confirm"), { danger: true }))) return;

        let categories = getCategories();
                categories = categories.filter(category => category.id !== selectedCategory.id);
        saveCategories(categories);
                // نمسح ميزانية الفئة معاها عشان متفضلش يتيمة
        const budgets = getCategoryBudgets();
        if (Object.prototype.hasOwnProperty.call(budgets, selectedCategory.id)) {
            delete budgets[selectedCategory.id];
            saveCategoryBudgets(budgets);
        }
        renderCategories();

        const field = getCategoryFieldEl();
        if (field && field.dataset.id === selectedCategory.id) {
            field.textContent = t("select_category");
                        delete field.dataset.id;
        }

        if (categoryMenu) categoryMenu.classList.remove("show");
        showToast(t("category_deleted_toast"), "success");
        selectedCategory = null;
    };
}

closeModalOnBackdropClick(categoryMenu);
}

initCategoryPicker();