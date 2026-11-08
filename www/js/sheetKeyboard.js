// ==============================
// sheetKeyboard.js
// انزلاق ناعم للشيت لما الكيبورد يفتح أو يقفل (بدل القفزة)
// ==============================
(function () {
    const lastTop = new WeakMap();

    function getOpenSheet() {
        return document.querySelector(".modal.show .modal-content");
    }

    // نحفظ مكان الشيت قبل ما الكيبورد يتحرك
    function remember() {
        const el = getOpenSheet();
        if (el) lastTop.set(el, el.getBoundingClientRect().top);
    }

    // بعد تغيير حجم الشاشة: نرجّعه لمكانه القديم وننزلق للجديد
    function smooth() {
        const el = getOpenSheet();
        if (!el) return;

        const before = lastTop.get(el);
        const after = el.getBoundingClientRect().top;
        lastTop.set(el, after);

        if (before === undefined || Math.abs(before - after) < 2) return;

        el.style.transition = "none";
        el.style.transform = "translateY(" + (before - after) + "px)";
        el.getBoundingClientRect();
        el.style.transition = "transform .28s cubic-bezier(.2, .8, .2, 1)";
        el.style.transform = "";

        setTimeout(function () {
            el.style.transition = "";
        }, 320);
    }

    document.addEventListener("focusin", remember);
    document.addEventListener("focusout", remember);
    window.addEventListener("resize", smooth);
})();