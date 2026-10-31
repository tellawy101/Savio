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
    initFlipToHide();
    if (toggleBalanceBtn) {
        toggleBalanceBtn.onclick = function () {
            const newHidden = !document.body.classList.contains("amounts-hidden");
            saveBalanceHidden(newHidden);
            applyBalanceVisibility(newHidden);
        };
    }
}
let flipListenerAdded = false;

function initFlipToHide() {
    if (flipListenerAdded) return;
    flipListenerAdded = true;

    let faceDown = false;

    window.addEventListener("devicemotion", function (e) {
        const g = e.accelerationIncludingGravity;
        if (!g || g.z == null) return;

        if (!faceDown && g.z < -7) {
            faceDown = true;
            const btn = document.getElementById("toggleBalanceBtn");
            if (btn) btn.click();
        } else if (faceDown && g.z > -3) {
            faceDown = false;
        }
    });
}