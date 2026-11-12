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
// نوع التصنيفات المعروضة حالياً: income | expense | transfer
let currentCategoryType = "expense";
// الرئيسيين اللي فرعيهم مفتوح في القايمة
const expandedCategoryIds = new Set();
// لو مش null يبقى بنضيف تصنيف فرعي تحت التصنيف ده
let newSubParent = null;

// الفرعي بياخد لون الرئيسي، فبنخفي اختيار اللون وقت إضافته
function setColorSectionVisible(visible) {
    const section = document.querySelector(".color-picker-section");
    if (section) section.style.display = visible ? "" : "none";
}
// ==============================
// Category Icon Picker
// ==============================
const iconPicker = initCategoryIconPicker();
const categoryIconDropdownList = iconPicker.dropdownList;
const categoryIconDropdownHome = iconPicker.dropdownHome;
const selectedCategoryIconLabel = iconPicker.selectedLabel;

const colorPicker = initCategoryColorPicker();
window.activeCategoryBox = null;

categoryBoxes.forEach(function (box) {
    box.onclick = function () {
        window.activeCategoryBox = box;
                const typeField = box.querySelector(".category-select");
        const typeId = typeField ? typeField.id.replace("Category", "") : "";
        currentCategoryType = CATEGORY_TYPES.includes(typeId) ? typeId : "expense";
                const searchInput = document.getElementById("categorySearchInput");
        if (searchInput) {
            searchInput.value = "";
            searchInput.oninput = function() { renderCategories(); };
        }
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
                newSubParent = null;
        setColorSectionVisible(true);
        document.getElementById("newCategoryName").value = "";
        document.getElementById("newCategoryIcon").value = "";
        document.getElementById("selectedCategoryIconPreviewWrap").innerHTML =
            `<i data-lucide="tag" id="selectedCategoryIconPreview"></i>`;
        selectedCategoryIconLabel.textContent = t("choose_icon_label");
                colorPicker.setColor(CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]);
        if (window.lucide) lucide.createIcons();
                if (document.body.classList.contains("add-transaction-page")) {
                    addCategoryModal.classList.add("show");
                } else {
            categoryModal.classList.remove("show");
            setTimeout(function() {
                addCategoryModal.classList.add("show");
            }, 250);
        }
    };
}

const addSubCategoryBtn = document.getElementById("addSubCategoryBtn");
if (addSubCategoryBtn) {
    addSubCategoryBtn.onclick = function() {
        if (!selectedCategory || isSubCategory(selectedCategory)) return;
        
        newSubParent = selectedCategory;
        editingCategory = null;
        
        document.getElementById("newCategoryName").value = "";
        document.getElementById("newCategoryIcon").value = "";
        document.getElementById("selectedCategoryIconPreviewWrap").innerHTML =
            `<i data-lucide="tag" id="selectedCategoryIconPreview"></i>`;
        selectedCategoryIconLabel.textContent = t("choose_icon_label");
        setColorSectionVisible(false);
        if (window.lucide) lucide.createIcons();
        
        if (categoryMenu) categoryMenu.classList.remove("show");
        addCategoryModal.classList.add("show");
    };
}

closeModalOnBackdropClick(addCategoryModal, function() {
    editingCategory = null;
    newSubParent = null;
    setColorSectionVisible(true);
});
window.renderCategories = function() {
    if (typeof window.onCategoriesChanged === "function") window.onCategoriesChanged();
    const categoriesList = document.getElementById("categoriesList");
    if (!categoriesList) return;
    categoriesList.innerHTML = "";
    
    const searchInput = document.getElementById("categorySearchInput");
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    
    const items = [];
    getMainCategoriesByType(currentCategoryType).forEach(function(main) {
        let subs = getSubCategories(main.id);
        if (query) {
            const mainMatches = main.name.toLowerCase().includes(query);
            subs = subs.filter(function(s) { return s.name.toLowerCase().includes(query); });
            if (!mainMatches && subs.length === 0) return;
        }
        items.push({ main: main, subs: subs });
    });
    
    if (items.length === 0) {
        const empty = document.createElement("div");
        empty.className = "category-empty";
        empty.textContent = t("no_results");
        categoriesList.appendChild(empty);
        return;
    }
    
    function isOpen(entry) {
        return entry.subs.length > 0 && (query ? true : expandedCategoryIds.has(entry.main.id));
    }
    
    function pick(category) {
        const field = getCategoryFieldEl();
        if (field) {
            field.textContent = getCategoryFullName(category);
            field.dataset.icon = category.icon;
            field.dataset.id = category.id;
            field.removeAttribute("data-i18n");
        }
        const iconEl = window.activeCategoryBox ? window.activeCategoryBox.querySelector(".category-icon") : null;
        if (iconEl) {
            iconEl.innerHTML = `<i data-lucide="${escapeHTML(category.icon)}"></i>`;
            iconEl.style.cssText = categoryIconStyle(getCategoryColor(category));
        }
        if (window.lucide) lucide.createIcons();
        categoryModal.classList.remove("show");
        notifyFormFieldChanged();
    }
    
    function addLongPress(el, category) {
        let timer;
        el.addEventListener("touchstart", function() {
            timer = setTimeout(function() {
                selectedCategory = category;
                const addSubBtn = document.getElementById("addSubCategoryBtn");
                if (addSubBtn) addSubBtn.style.display = isSubCategory(category) ? "none" : "";
                if (categoryMenu) categoryMenu.classList.add("show");
            }, 700);
        });
        el.addEventListener("touchend", function() { clearTimeout(timer); });
        el.addEventListener("touchmove", function() { clearTimeout(timer); });
    }
    
    function buildPanel(entry) {
        const main = entry.main;
        const panel = document.createElement("div");
        panel.className = "category-sub-panel";
        panel.style.setProperty("--c", getCategoryColor(main));
        
        const chips = [{ cat: main, label: t("stats_sub_general") }].concat(
            entry.subs.map(function(s) { return { cat: s, label: s.name }; })
        );
        chips.forEach(function(c) {
            const chip = document.createElement("div");
            chip.className = "category-sub-chip";
            chip.innerHTML = `<i data-lucide="${escapeHTML(c.cat.icon)}"></i><span>${escapeHTML(c.label)}</span>`;
            chip.onclick = function() { pick(c.cat); };
            addLongPress(chip, c.cat);
            panel.appendChild(chip);
        });
        
        if (!query && addSubCategoryBtn) {
            const add = document.createElement("div");
            add.className = "category-sub-chip category-sub-add";
            add.innerHTML = `<i data-lucide="plus"></i>`;
            add.onclick = function() {
                selectedCategory = main;
                addSubCategoryBtn.onclick();
            };
            panel.appendChild(add);
        }
        return panel;
    }
    
    items.forEach(function(entry, i) {
        const main = entry.main;
        const hasSubs = entry.subs.length > 0;
        const tile = document.createElement("div");
        tile.className = "category-tile" + (isOpen(entry) ? " category-tile-open" : "");
        tile.style.setProperty("--c", getCategoryColor(main));
        tile.innerHTML =
            `<div class="category-tile-icon" style="${categoryIconStyle(getCategoryColor(main))}"><i data-lucide="${escapeHTML(main.icon)}"></i></div>` +
            `<div class="category-tile-name">${escapeHTML(main.name)}</div>` +
            (hasSubs && !query ? `<span class="category-sub-count">${entry.subs.length}</span>` : "");
        addLongPress(tile, main);
        tile.onclick = function() {
            if (hasSubs && !query) {
                const wasOpen = expandedCategoryIds.has(main.id);
                expandedCategoryIds.clear();
                if (!wasOpen) expandedCategoryIds.add(main.id);
                renderCategories();
            } else {
                pick(main);
            }
        };
        categoriesList.appendChild(tile);
        
        if (i % 3 === 2 || i === items.length - 1) {
            for (let k = i - (i % 3); k <= i; k++) {
                if (isOpen(items[k])) categoriesList.appendChild(buildPanel(items[k]));
            }
        }
    });
    
    if (window.lucide) lucide.createIcons();
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
            return getCategoryType(c) === currentCategoryType &&
                c.name.trim().toLowerCase() === name.toLowerCase() &&
                (!editingCategory || c.id !== editingCategory.id);
        });
        if (nameTaken) {
            showToast(t("category_exists_toast"));
            return;
        }
        if (editingCategory) {
                        const index = categories.findIndex(c => c.id === editingCategory.id);
            if (index !== -1) {
categories[index] = { ...editingCategory, name, icon, type: getCategoryType(editingCategory) };
if (!isSubCategory(editingCategory)) {
    categories[index].color = colorPicker.getColor();
}
            }

            const field = getCategoryFieldEl();
            if (field && field.dataset.id === editingCategory.id) {
field.textContent = getCategoryFullName(categories[index] || editingCategory);
const boxIcon = window.activeCategoryBox ? window.activeCategoryBox.querySelector(".category-icon") : null;
if (boxIcon) boxIcon.innerHTML = `<i data-lucide="${escapeHTML(icon)}"></i>`;
if (boxIcon) boxIcon.style.cssText = categoryIconStyle(getCategoryColor(categories[index] || editingCategory));
field.dataset.icon = icon;
field.dataset.id = editingCategory.id;
field.removeAttribute("data-i18n");
if (window.lucide) lucide.createIcons();
}

            editingCategory = null;
            selectedCategory = null;
        } else {
const newCategory = newSubParent ?
    { id: generateId("cat"), name, icon, type: getCategoryType(newSubParent), parentId: newSubParent.id } :
    { id: generateId("cat"), name, icon, type: currentCategoryType, color: colorPicker.getColor() };
    categories.push(newCategory);
    const field = getCategoryFieldEl();
       if (field) {
field.textContent = getCategoryFullName(newCategory);
        field.dataset.icon = icon;
        field.dataset.id = newCategory.id;
        field.removeAttribute("data-i18n");
    }
    const iconEl = window.activeCategoryBox ? window.activeCategoryBox.querySelector(".category-icon") : null;
    if (iconEl) iconEl.innerHTML = `<i data-lucide="${escapeHTML(icon)}"></i>`;
if (iconEl) iconEl.style.cssText = categoryIconStyle(getCategoryColor(newCategory));
    if (window.lucide) lucide.createIcons();
}
        saveCategories(categories);
                if (newSubParent) {
            expandedCategoryIds.add(newSubParent.id);
            newSubParent = null;
            setColorSectionVisible(true);
        }
                setColorSectionVisible(true);
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
        
                colorPicker.setColor(getCategoryColor(editingCategory));
        
 setColorSectionVisible(!isSubCategory(editingCategory));
        
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
                        // لو فرعي: معاملاته بتروح للرئيسي. لو رئيسي: الفرعي بيتحذف معاه
        const deletedIds = [selectedCategory.id];
        if (isSubCategory(selectedCategory)) {
            const parent = getParentCategory(selectedCategory);
            if (parent) moveCategoryReferences(selectedCategory.id, parent);
        } else {
            getSubCategories(selectedCategory.id).forEach(function (sub) {
                deletedIds.push(sub.id);
            });
        }
        categories = categories.filter(category => !deletedIds.includes(category.id));
        saveCategories(categories);
        // نمسح ميزانية الفئة (وفرعيها) معاها عشان متفضلش يتيمة
        const budgets = getCategoryBudgets();
        let budgetsChanged = false;
        deletedIds.forEach(function (id) {
            if (Object.prototype.hasOwnProperty.call(budgets, id)) {
                delete budgets[id];
                budgetsChanged = true;
            }
        });
        if (budgetsChanged) saveCategoryBudgets(budgets);
        renderCategories();

        const field = getCategoryFieldEl();
if (field && deletedIds.includes(field.dataset.id)) {
            field.textContent = t("select_category");
                        delete field.dataset.id;
        }

        if (categoryMenu) categoryMenu.classList.remove("show");
        showToast(t("category_deleted_toast"), "success");
        selectedCategory = null;
    };
}

closeModalOnBackdropClick(categoryMenu);
window.categoryActions = {
    add: function (type) {
        currentCategoryType = type;
        addCategoryBtn.onclick({ stopPropagation: function () {} });
    },
    addSub: function (parent) {
        currentCategoryType = getCategoryType(parent);
        selectedCategory = parent;
        addSubCategoryBtn.onclick();
    },
    edit: function (cat) {
        currentCategoryType = getCategoryType(cat);
        selectedCategory = cat;
        editCategoryBtn.onclick();
    },
    remove: function (cat) {
        selectedCategory = cat;
        deleteCategoryBtn.onclick();
    }
};
}

initCategoryPicker();