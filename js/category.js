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

// مكتبة أيقونات كبيرة (Lucide) قابلة للبحث - المستخدم مش مقيد بأيقونات معينة
const CATEGORY_ICON_LIBRARY = [
    { icon: "utensils", label: "Food", keywords: ["eat", "dinner", "lunch", "meal", "restaurant"] },
    { icon: "coffee", label: "Coffee", keywords: ["drink", "cafe", "tea"] },
    { icon: "pizza", label: "Fast Food", keywords: ["eat", "burger", "snack"] },
    { icon: "shopping-cart", label: "Shopping", keywords: ["buy", "store", "market"] },
    { icon: "shopping-bag", label: "Shopping Bag", keywords: ["buy", "store", "mall"] },
    { icon: "car", label: "Transport", keywords: ["taxi", "ride", "drive", "uber"] },
    { icon: "bus", label: "Bus", keywords: ["transport", "ride"] },
    { icon: "fuel", label: "Fuel", keywords: ["gas", "petrol", "car"] },
    { icon: "bike", label: "Bike", keywords: ["cycle", "transport"] },
    { icon: "plane", label: "Travel", keywords: ["flight", "airport", "trip"] },
    { icon: "hotel", label: "Hotel", keywords: ["travel", "stay", "trip"] },
    { icon: "map-pin", label: "Location", keywords: ["place", "map"] },
    { icon: "receipt", label: "Bills", keywords: ["invoice", "payment"] },
    { icon: "file-text", label: "Documents", keywords: ["paper", "file"] },
    { icon: "heart-pulse", label: "Health", keywords: ["medical", "clinic"] },
    { icon: "pill", label: "Medicine", keywords: ["drug", "pharmacy", "health"] },
    { icon: "stethoscope", label: "Doctor", keywords: ["health", "clinic", "medical"] },
    { icon: "dumbbell", label: "Gym", keywords: ["fitness", "sport", "workout"] },
    { icon: "gamepad-2", label: "Entertainment", keywords: ["games", "fun"] },
    { icon: "clapperboard", label: "Movies", keywords: ["cinema", "film"] },
    { icon: "music", label: "Music", keywords: ["song", "audio"] },
    { icon: "tv", label: "TV", keywords: ["television", "screen"] },
    { icon: "home", label: "Home", keywords: ["house", "rent"] },
    { icon: "building-2", label: "Building", keywords: ["office", "apartment"] },
    { icon: "lamp", label: "Furniture", keywords: ["home", "decor"] },
    { icon: "wrench", label: "Maintenance", keywords: ["repair", "fix"] },
    { icon: "briefcase", label: "Work", keywords: ["job", "office", "salary"] },
    { icon: "graduation-cap", label: "Education", keywords: ["school", "university", "study"] },
    { icon: "book-open", label: "Books", keywords: ["read", "study"] },
    { icon: "gift", label: "Gifts", keywords: ["present", "birthday"] },
    { icon: "cake", label: "Celebration", keywords: ["birthday", "party"] },
    { icon: "wifi", label: "Internet", keywords: ["network", "data"] },
    { icon: "smartphone", label: "Phone", keywords: ["mobile", "call"] },
    { icon: "laptop", label: "Electronics", keywords: ["computer", "tech"] },
    { icon: "wallet", label: "Money", keywords: ["cash", "budget"] },
    { icon: "banknote", label: "Cash", keywords: ["money"] },
    { icon: "landmark", label: "Bank", keywords: ["money", "finance"] },
    { icon: "piggy-bank", label: "Savings", keywords: ["money", "budget"] },
    { icon: "credit-card", label: "Card", keywords: ["payment", "bank"] },
    { icon: "chart-no-axes-combined", label: "Investment", keywords: ["stocks", "growth"] },
    { icon: "circle-dollar-sign", label: "Income", keywords: ["salary", "money"] },
    { icon: "hand-coins", label: "Debts", keywords: ["loan", "borrow"] },
    { icon: "shirt", label: "Clothes", keywords: ["fashion", "wear"] },
    { icon: "scissors", label: "Salon", keywords: ["haircut", "barber"] },
    { icon: "baby", label: "Baby", keywords: ["kid", "child"] },
    { icon: "paw-print", label: "Pets", keywords: ["animal"] },
    { icon: "dog", label: "Dog", keywords: ["pet", "animal"] },
    { icon: "cat", label: "Cat", keywords: ["pet", "animal"] },
    { icon: "leaf", label: "Nature", keywords: ["plant", "eco"] },
    { icon: "sun", label: "Weather", keywords: ["sunny", "climate"] },
    { icon: "umbrella", label: "Insurance", keywords: ["protection"] },
    { icon: "shield", label: "Security", keywords: ["protection", "safety"] },
    { icon: "church", label: "Charity", keywords: ["donation"] },
    { icon: "hand-heart", label: "Donation", keywords: ["charity", "give"] },
    { icon: "trophy", label: "Sports", keywords: ["win", "competition"] },
    { icon: "party-popper", label: "Party", keywords: ["celebration", "fun"] },
    { icon: "camera", label: "Photography", keywords: ["photo", "picture"] },
    { icon: "palette", label: "Art", keywords: ["paint", "design"] },
    { icon: "hammer", label: "Repair", keywords: ["fix", "tools"] },
    { icon: "phone-call", label: "Calls", keywords: ["phone", "talk"] },
    { icon: "mail", label: "Mail", keywords: ["email", "post"] },
    { icon: "printer", label: "Printer", keywords: ["print", "office"] },
    { icon: "tag", label: "Tag", keywords: ["label", "other"] },
    { icon: "ellipsis", label: "Other", keywords: ["misc", "more"] }
];

function loadCustomCategoryIcons() {
    return JSON.parse(localStorage.getItem("customCategoryIcons")) || [];
}

function saveCustomCategoryIcon(icon, label) {
    let custom = loadCustomCategoryIcons();
    const exists = custom.some(item => item.icon === icon) ||
        CATEGORY_ICON_LIBRARY.some(item => item.icon === icon);
    if (!exists) {
        custom.push({ icon, label });
        localStorage.setItem("customCategoryIcons", JSON.stringify(custom));
    }
}

function getFullIconLibrary() {
    return CATEGORY_ICON_LIBRARY.concat(loadCustomCategoryIcons());
}

const categoryIconDropdownTrigger =
    document.getElementById("categoryIconDropdownTrigger");

const categoryIconDropdownList =
    document.getElementById("categoryIconDropdownList");

const categoryIconResults =
    document.getElementById("categoryIconResults");

const categoryIconSearchInput =
    document.getElementById("categoryIconSearchInput");

const selectedCategoryIconLabel =
    document.getElementById("selectedCategoryIconLabel");

const newCategoryIconInput =
    document.getElementById("newCategoryIcon");

function selectCategoryIcon(icon, label) {

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
}

function renderCategoryIconResults(filter) {

    if (!categoryIconResults) return;

    const term = (filter || "").trim().toLowerCase();

    let matches = getFullIconLibrary().filter(item =>
        item.label.toLowerCase().includes(term) ||
        item.icon.toLowerCase().includes(term) ||
        (item.keywords || []).some(k => k.toLowerCase().includes(term))
    );

    categoryIconResults.innerHTML = "";

    matches.forEach(item => {
        const option = document.createElement("div");
        option.className = "icon-option";
        option.dataset.icon = item.icon;
        option.dataset.label = item.label;
        option.innerHTML = `<i data-lucide="${item.icon}"></i><span>${item.label}</span>`;
        option.onclick = function () {
            selectCategoryIcon(item.icon, item.label);
        };
        categoryIconResults.appendChild(option);
    });

    // لو مفيش نتيجة مطابقة، اسمح للمستخدم يستخدم اسم الأيقونة اللي كتبه بنفسه
    // (طالما هي اسم أيقونة صحيح من مكتبة Lucide)
    if (term !== "") {
        const exactMatch = getFullIconLibrary().some(
            item => item.icon.toLowerCase() === term
        );

        if (!exactMatch) {
            const customOption = document.createElement("div");
            customOption.className = "icon-option icon-option-custom";
            customOption.innerHTML =
                `<i data-lucide="${term}"></i><span>Use "${filter}" as icon name</span>`;
            customOption.onclick = function () {
                const svg = customOption.querySelector("svg");
                if (!svg) {
                    showToast("Icon name not found, try another name");
                    return;
                }
                const label = filter.charAt(0).toUpperCase() + filter.slice(1);
                saveCustomCategoryIcon(term, label);
                selectCategoryIcon(term, label);
            };
            categoryIconResults.appendChild(customOption);
        }
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

if (categoryIconDropdownTrigger) {

    categoryIconDropdownTrigger.onclick = function (e) {

        e.stopPropagation();

        categoryIconDropdownList.classList.toggle("show");

        if (categoryIconDropdownList.classList.contains("show")) {
            if (categoryIconSearchInput) {
                categoryIconSearchInput.value = "";
                categoryIconSearchInput.focus();
            }
            renderCategoryIconResults("");
        }

    };
}

if (categoryIconSearchInput) {

    categoryIconSearchInput.addEventListener("input", function () {
        renderCategoryIconResults(this.value);
    });

    categoryIconSearchInput.addEventListener("click", function (e) {
        e.stopPropagation();
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
        const icon = iconInput.value.trim() || "tag";

        if (name === "") {
            showToast("Please enter a category name");
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