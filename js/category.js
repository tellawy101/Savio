// ======================================
// category.js
// إدارة التصنيفات داخل التطبيق (Reusable Component - DRY)
// ======================================

const categoryBox = document.querySelector(".category-select-box");
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

const categoryIconDropdownTrigger =
    document.getElementById("categoryIconDropdownTrigger");

const categoryIconDropdownList =
    document.getElementById("categoryIconDropdownList");

const selectedCategoryIconLabel =
    document.getElementById("selectedCategoryIconLabel");

const newCategoryIconInput =
    document.getElementById("newCategoryIcon");

if (categoryIconDropdownTrigger) {

    categoryIconDropdownTrigger.onclick = function (e) {

        e.stopPropagation();

        categoryIconDropdownList.classList.toggle("show");

    };
}

if (categoryIconDropdownList) {

    categoryIconDropdownList
        .querySelectorAll(".icon-option")
        .forEach(option => {

            option.onclick = function () {

                const icon = this.dataset.icon;
                const label = this.dataset.label;

                newCategoryIconInput.value = icon;

                document.getElementById(
                    "selectedCategoryIconPreviewWrap"
                ).innerHTML =
                    `<i data-lucide="${icon}"
                        id="selectedCategoryIconPreview"></i>`;

                selectedCategoryIconLabel.textContent = label;

                categoryIconDropdownList.classList.remove("show");

                if (window.lucide) {
                    lucide.createIcons();
                }

            };

        });
}

document.addEventListener("click", function (e) {

    if (
        categoryIconDropdownList &&
        !categoryIconDropdownList.contains(e.target) &&
        e.target !== categoryIconDropdownTrigger
    ) {

        categoryIconDropdownList.classList.remove("show");

    }

});

if (categoryBox) {
    categoryBox.onclick = function () {
        categoryModal.classList.add("show");
    };
}

if (categoryModal) {
    categoryModal.onclick = function (e) {
        if (e.target === categoryModal) {
            categoryModal.classList.remove("show");
        }
    };
}

if (addCategoryBtn) {
    addCategoryBtn.onclick = function (e) {
        e.stopPropagation();
        categoryModal.classList.remove("show");
        setTimeout(function () {
            addCategoryModal.classList.add("show");
        }, 250);
    };
}

if (addCategoryModal) {
    addCategoryModal.onclick = function (e) {
        if (e.target === addCategoryModal) {
            addCategoryModal.classList.remove("show");
        }
    };
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
                if (categoryMenu) categoryMenu.classList.add("show");
            }, 700);
        });

        item.addEventListener("touchend", function () {
            clearTimeout(pressTimer);
        });

        item.addEventListener("touchmove", function () {
            clearTimeout(pressTimer);
        });

        item.onclick = function () {
            const field = getCategoryFieldEl();
            if (field) field.textContent = `${category.icon} ${category.name}`;
            categoryModal.classList.remove("show");
            notifyFormFieldChanged();
        };

        categoriesList.appendChild(item);
    });
}

if (saveCategoryBtn) {
    saveCategoryBtn.onclick = function () {
        const nameInput = document.getElementById("newCategoryName");
        const iconInput = document.getElementById("newCategoryIcon");

        const name = nameInput.value.trim();
        const icon = iconInput.value.trim();

        if (name === "" || icon === "") {
            showToast("Please fill all fields");
            return;
        }

        let categories = JSON.parse(localStorage.getItem("categories")) || [];
        const isEditing = editingCategory !== null;

        if (editingCategory) {
            const index = categories.findIndex(c => c.name === editingCategory.name);
            if (index !== -1) {
                categories[index] = { name, icon };
            }

            const field = getCategoryFieldEl();
            if (field && field.textContent.includes(editingCategory.name)) {
                field.textContent = `${icon} ${name}`;
            }

            editingCategory = null;
            selectedCategory = null;
        } else {
            categories.push({ name, icon });

            const field = getCategoryFieldEl();
            if (field) field.textContent = `${icon} ${name}`;
        }

        localStorage.setItem("categories", JSON.stringify(categories));
        renderCategories();
        addCategoryModal.classList.remove("show");

        nameInput.value = "";
        iconInput.value = "";

        showToast(isEditing ? "Category updated" : "Category added", "success");
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
    `<i data-lucide="${icon}"
        id="selectedCategoryIconPreview"></i>`;

const selectedOption =
    categoryIconDropdownList?.querySelector(
        `.icon-option[data-icon="${icon}"]`
    );

if (selectedOption) {
    selectedCategoryIconLabel.textContent =
        selectedOption.dataset.label;
} else {
    selectedCategoryIconLabel.textContent =
        "Choose Icon";
}

if (window.lucide) {
    lucide.createIcons();
}
        

        if (categoryMenu) categoryMenu.classList.remove("show");
        addCategoryModal.classList.add("show");
    };
}

if (deleteCategoryBtn) {
    deleteCategoryBtn.onclick = function () {
        if (!selectedCategory) return;

        let categories = JSON.parse(localStorage.getItem("categories")) || [];
        categories = categories.filter(category => category.name !== selectedCategory.name);

        localStorage.setItem("categories", JSON.stringify(categories));
        renderCategories();

        const field = getCategoryFieldEl();
        if (field && field.textContent.includes(selectedCategory.name)) {
            field.textContent = "Select Category";
        }

        if (categoryMenu) categoryMenu.classList.remove("show");
        showToast("Category deleted", "success");
        selectedCategory = null;
    };
}

if (categoryMenu) {
    categoryMenu.onclick = function (e) {
        if (e.target === this) {
            this.classList.remove("show");
        }
    };
}