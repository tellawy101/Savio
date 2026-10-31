// ==============================
// category/categoryIconPicker.js
// قايمة اختيار أيقونة التصنيف (بحث + اختيار)
// ==============================

function initCategoryIconPicker() {
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
const categoryIconDropdownHome = categoryIconDropdownTrigger ? categoryIconDropdownTrigger.parentElement : null;

function selectCategoryIcon(icon, label) {
    newCategoryIconInput.value = icon;
    document.getElementById(
            "selectedCategoryIconPreviewWrap"
        ).innerHTML =
       `<i data-lucide="${escapeHTML(icon)}"
            id="selectedCategoryIconPreview"></i>`;
    selectedCategoryIconLabel.textContent = label;
    categoryIconDropdownList.classList.remove("show");
    if (categoryIconDropdownHome) categoryIconDropdownHome.appendChild(categoryIconDropdownList);
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
option.innerHTML = `<i data-lucide="${escapeHTML(item.icon)}"></i><span>${escapeHTML(item.label)}</span>`;
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
                `<i data-lucide="${escapeHTML(term)}"></i><span>Use "${escapeHTML(filter)}" as icon name</span>`;
            customOption.onclick = function () {
                const svg = customOption.querySelector("svg");
                if (!svg) {
                    showToast(t("icon_not_found_toast"));
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
        const isOpen = categoryIconDropdownList.classList.contains("show");
        if (!isOpen) {
            if (document.activeElement) document.activeElement.blur();
            document.body.appendChild(categoryIconDropdownList);
            categoryIconDropdownList.classList.add("show");
            if (categoryIconSearchInput) {
                categoryIconSearchInput.value = "";
            }
            renderCategoryIconResults("");
        } else {
            categoryIconDropdownList.classList.remove("show");
            if (categoryIconDropdownHome) categoryIconDropdownHome.appendChild(categoryIconDropdownList);
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

if (window._categoryIconCloseHandler) {
    document.removeEventListener("click", window._categoryIconCloseHandler);
}
window._categoryIconCloseHandler = function(e) {
    if (
        categoryIconDropdownList &&
        !categoryIconDropdownList.contains(e.target) &&
        e.target !== categoryIconDropdownTrigger
    ) {
        categoryIconDropdownList.classList.remove("show");
        if (categoryIconDropdownHome) categoryIconDropdownHome.appendChild(categoryIconDropdownList);
    }
};
document.addEventListener("click", window._categoryIconCloseHandler);
    return {
        dropdownList: categoryIconDropdownList,
        dropdownHome: categoryIconDropdownHome,
        selectedLabel: selectedCategoryIconLabel
    };
}