// ==============================
// Balance & Stats Visibility (Eye Toggle)
// ==============================

const toggleBalanceBtn = document.getElementById("toggleBalanceBtn");


// ==============================
// Set Eye Icon
// ==============================

function setEyeIcon(iconName) {

    if (!toggleBalanceBtn) return;

    toggleBalanceBtn.innerHTML = `
        <i data-lucide="${iconName}"></i>
    `;

    if (window.lucide) {
        lucide.createIcons();
    }
}


// ==============================
// Apply Visibility
// ==============================

function applyBalanceVisibility(hidden) {

    if (hidden) {

        document.body.classList.add("amounts-hidden");
        setEyeIcon("eye-off");

    } else {

        document.body.classList.remove("amounts-hidden");
        setEyeIcon("eye");

    }
}


// ==============================
// Load Saved State
// ==============================

const savedBalanceHidden = getBalanceHidden();

applyBalanceVisibility(savedBalanceHidden);


// ==============================
// DOM Loaded
// ==============================

document.addEventListener("DOMContentLoaded", function () {

    const currentHidden = getBalanceHidden();

    applyBalanceVisibility(currentHidden);


    // ==========================
    // Eye Button Click
    // ==========================

    if (toggleBalanceBtn) {

        toggleBalanceBtn.addEventListener("click", function () {

            const isHidden = document.body.classList.contains("amounts-hidden");
            const newHidden = !isHidden;

            saveBalanceHidden(newHidden);

            applyBalanceVisibility(newHidden);

        });

    }

});