// ======================================
// home/homeBalanceVisibility.js
// زرار إخفاء/إظهار الرصيد (العين)
// ======================================

function initHomeBalanceVisibility() {
    const toggleBalanceBtn = document.getElementById("toggleBalanceBtn");

    function setEyeIcon(iconName) {
        if (!toggleBalanceBtn) return;
        toggleBalanceBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;
        if (window.lucide) lucide.createIcons();
    }

    function applyBalanceVisibility(hidden) {
        if (hidden) {
            document.body.classList.add("amounts-hidden");
            setEyeIcon("eye-off");
        } else {
            document.body.classList.remove("amounts-hidden");
            setEyeIcon("eye");
        }
    }

    applyBalanceVisibility(getBalanceHidden());

    if (toggleBalanceBtn) {
        toggleBalanceBtn.onclick = function () {
            const newHidden = !document.body.classList.contains("amounts-hidden");
            saveBalanceHidden(newHidden);
            applyBalanceVisibility(newHidden);
        };
    }
}
