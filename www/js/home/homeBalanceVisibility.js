// ======================================
// home/homeBalanceVisibility.js
// إخفاء/إظهار الرصيد بقلب الموبايل
// ======================================

function applyBalanceVisibility(hidden) {
    document.body.classList.toggle("amounts-hidden", hidden);
}

function toggleBalanceVisibility() {
    if (typeof hapticTap === "function") hapticTap();
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
    
    window.addEventListener("devicemotion", function(e) {
        // شغّال في الصفحة الرئيسية بس
        if (typeof currentPageName !== "undefined" && currentPageName !== "home") return;
        
        const g = e.accelerationIncludingGravity;
        if (!g || g.z == null) return;
        
        if (!faceDown && g.z < -7) {
            faceDown = true;
            toggleBalanceVisibility(); // ظاهر ← يخفي، مخفي ← يظهر
        } else if (faceDown && g.z > -3) {
            faceDown = false; // اتعدل تاني، جاهز للقلبة الجاية
        }
    });
}