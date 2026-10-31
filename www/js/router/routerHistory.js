// ======================================
// router/routerHistory.js
// مراقب المودالات ونقاط التراجع الوهمية + popstate
// ======================================

// مراقب يمنع متصفح Acode من الخروج عند الرجوع: يضيف نقطة تراجع وهمية فور فتح أي مودال أو أيقونات
// ويشيلها لما يتقفل بأي طريقة غير زر الرجوع
let fakeHistoryCount = 0;   // عدد النقاط الوهمية الموجودة حالياً
let ignorePopCount = 0;     // popstate ناتج عن تنظيفنا إحنا (نتجاهله)
let closedByBackCount = 0;  // مودال اتقفل بزر الرجوع (النقطة اتشالت خلاص)

const overlayObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type !== "attributes" || mutation.attributeName !== "class") return;

        const target = mutation.target;
        if (!target.classList.contains("modal") && !target.classList.contains("icon-dropdown-list")) return;

        const wasShown = (mutation.oldValue || "").split(/\s+/).indexOf("show") !== -1;
        const isShown = target.classList.contains("show");

        if (!wasShown && isShown) {
            history.pushState({ overlay: true }, "");
            fakeHistoryCount++;
        } else if (wasShown && !isShown) {
            if (closedByBackCount > 0) {
                closedByBackCount--;
                return;
            }
            if (fakeHistoryCount > 0) {
                fakeHistoryCount--;
                ignorePopCount++;
                history.back();
            }
        }
    });
});
overlayObserver.observe(document.body, { attributes: true, attributeOldValue: true, subtree: true, attributeFilter: ["class"] });

// حماية حدث popstate لمنع الخروج إلى محرر Acode أو الرجوع للصفحة السابقة
window.addEventListener("popstate", function(e) {
    if (ignorePopCount > 0) {
        ignorePopCount--;
        return;
    }

    const hasOpenOverlay = document.querySelector(".icon-dropdown-list.show") || document.querySelector(".modal.show");
    if (hasOpenOverlay) {
        if (fakeHistoryCount > 0) fakeHistoryCount--;
        closedByBackCount++;
        window.handleHardwareBack();
        return;
    }
    
    // نقطة وهمية قديمة فاضلة من مودال اتشال
    if (e.state && e.state.overlay) {
        history.back();
        return;
    }    
    const page = (e.state && e.state.page) || "home";
    if (page !== currentPageName) {
navigateTo(page, true);
    }
});
