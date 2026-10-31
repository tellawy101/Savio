// ======================================
// accounts/accountIconDropdown.js
// قايمة اختيار أيقونة الحساب (بحث + اختيار)
// ======================================

function initAccountIconDropdown() {
// ==============================
// Icon Dropdown
// ==============================

const iconDropdownTrigger = document.getElementById("iconDropdownTrigger");
const iconDropdownList = document.getElementById("iconDropdownList");
const selectedIconPreview = document.getElementById("selectedIconPreview");
const selectedIconLabel = document.getElementById("selectedIconLabel");
const newAccountIconInput = document.getElementById("newAccountIcon");

const iconSearchInput = document.getElementById("iconSearchInput");
const iconDropdownHome = iconDropdownTrigger ? iconDropdownTrigger.parentElement : null;
if (iconDropdownTrigger) {
    iconDropdownTrigger.onclick = function(e) {
        e.stopPropagation();
        const isOpen = iconDropdownList.classList.contains("show");
        if (!isOpen) {
            if (document.activeElement) document.activeElement.blur();
            document.body.appendChild(iconDropdownList);
            iconDropdownList.classList.add("show");
            if (iconSearchInput) iconSearchInput.value = "";
            filterAccountIcons("");
        } else {
            iconDropdownList.classList.remove("show");
            if (iconDropdownHome) iconDropdownHome.appendChild(iconDropdownList);
        }
    };
}

if (iconSearchInput) {
    iconSearchInput.addEventListener("input", function() {
        filterAccountIcons(this.value);
    });
    iconSearchInput.addEventListener("click", function(e) {
        e.stopPropagation();
    });
}

document.querySelectorAll(".icon-option").forEach(option => {
    option.onclick = function() {
        const icon = this.dataset.icon;
        const label = this.dataset.label;

        newAccountIconInput.value = icon;
document.getElementById("selectedIconPreviewWrap").innerHTML =
  `<i data-lucide="${escapeHTML(icon)}" id="selectedIconPreview"></i>`;
selectedIconLabel.textContent = label;

        iconDropdownList.classList.remove("show");
if (iconDropdownHome) iconDropdownHome.appendChild(iconDropdownList);
        if (window.lucide) lucide.createIcons();
    };
});

if (window._accountsIconCloseHandler) {
    document.removeEventListener("click", window._accountsIconCloseHandler);
}
window._accountsIconCloseHandler = function(e) {
    if (iconDropdownList && !iconDropdownList.contains(e.target) && e.target !== iconDropdownTrigger) {
        iconDropdownList.classList.remove("show");
        if (iconDropdownHome) iconDropdownHome.appendChild(iconDropdownList);
    }
};
document.addEventListener("click", window._accountsIconCloseHandler);
}