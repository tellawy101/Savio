// ======================================
// accountsPage/accountsPageIconDropdown.js
// قايمة اختيار أيقونة الحساب في صفحة الحسابات
// ======================================

function initAccountsPageIconDropdown() {
    const iconDropdownTrigger = document.getElementById("iconDropdownTrigger");
    const iconDropdownList = document.getElementById("iconDropdownList");
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
if (window._accountsPageIconCloseHandler) {
    document.removeEventListener("click", window._accountsPageIconCloseHandler);
}
window._accountsPageIconCloseHandler = function(e) {
    if (iconDropdownList.classList.contains("show") && !iconDropdownList.contains(e.target) && e.target !== iconDropdownTrigger) {
        iconDropdownList.classList.remove("show");
        if (iconDropdownHome) iconDropdownHome.appendChild(iconDropdownList);
    }
};
document.addEventListener("click", window._accountsPageIconCloseHandler);
    document.querySelectorAll(".icon-option").forEach(function (option) {
        option.onclick = function () {
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
}
