// ==============================
// components/fabScroll.js
// زرار الإضافة (FAB) ينزل مع السكرول لتحت ويرجع مع السكرول لفوق
// السكرول في التطبيق على الـ body مش الـ window، فبنسمع بـ capture
// ==============================

(function() {
    const THRESHOLD = 8;
    const TOP_OFFSET = 40;
    let lastY = 0;
    
    function getY() {
        return Math.max(document.body.scrollTop, window.scrollY, 0);
    }
    
    window.addEventListener("scroll", function() {
        const fab = document.getElementById("addMenuBtn");
        const y = getY();
        
        if (!fab) {
            lastY = y;
            return;
        }
        
        if (y <= TOP_OFFSET) {
            fab.classList.remove("fab-hidden");
            lastY = y;
            return;
        }
        
        const diff = y - lastY;
        if (Math.abs(diff) < THRESHOLD) return;
        
        if (diff > 0) {
            fab.classList.add("fab-hidden");
        } else {
            fab.classList.remove("fab-hidden");
        }
        lastY = y;
    }, { passive: true, capture: true });
})();