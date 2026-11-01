// ======================================
// home/homeBalanceVisibility.js
// زرار إخفاء/إظهار الرصيد (العين)
// ======================================

function applyBalanceVisibility(hidden) {
    document.body.classList.toggle("amounts-hidden", hidden);
}

function toggleBalanceVisibility() {
    hapticTap();
    const newHidden = !document.body.classList.contains("amounts-hidden");
    saveBalanceHidden(newHidden);
    applyBalanceVisibility(newHidden);
}

function initHomeBalanceVisibility() {
    applyBalanceVisibility(getBalanceHidden());
    initFlipToHide();
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
            toggleBalanceVisibility();
        } else if (faceDown && g.z > -3) {
            faceDown = false;
        }
    });
}