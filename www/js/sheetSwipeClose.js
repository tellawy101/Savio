// ==============================
// sheetSwipeClose.js
// اسحب أي شيت لتحت بصباعك: يمشي معاك ويقفل لو نزّلته أكتر من نص طوله أو سحبة سريعة
// ==============================
(function () {
    let modal = null;
    let sheet = null;
    let scroller = null;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let dy = 0;
    let decided = false;
    let dragging = false;

    function reset() {
        modal = null;
        sheet = null;
        scroller = null;
        dragging = false;
        decided = false;
        dy = 0;
    }

    document.addEventListener("touchstart", function (e) {
        reset();
        if (e.touches.length !== 1) return;

        const m = e.target.closest(".modal.show");
        if (!m) return;
        if (getComputedStyle(m).alignItems !== "flex-end") return;

        const c = m.querySelector(".modal-content");
        if (!c || !c.contains(e.target)) return;

        // لو اللمسة جوه قايمة بتتسكرول، نراقب السكرول بتاعها
        let el = e.target;
        while (el && el !== m) {
            const oy = getComputedStyle(el).overflowY;
            if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) {
                scroller = el;
                break;
            }
            el = el.parentElement;
        }

        modal = m;
        sheet = c;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
    }, { passive: true });

    document.addEventListener("touchmove", function (e) {
        if (!sheet) return;

        const t = e.touches[0];
        const moveY = t.clientY - startY;
        const moveX = t.clientX - startX;

        if (!decided) {
            if (Math.abs(moveY) < 8 && Math.abs(moveX) < 8) return;
            decided = true;
            const goingDown = moveY > 0 && Math.abs(moveY) > Math.abs(moveX);
            const scrolledInside = scroller && scroller.scrollTop > 0;
            if (!goingDown || scrolledInside) {
                reset();
                return;
            }
            dragging = true;
            sheet.style.transition = "none";
        }

        if (dragging) {
            dy = Math.max(0, moveY);
            sheet.style.transform = "translateY(" + dy + "px)";
            if (e.cancelable) e.preventDefault();
        }
    }, { passive: false });

    function finish() {
        if (!sheet || !dragging) {
            reset();
            return;
        }

        const s = sheet;
        const m = modal;
        const height = s.offsetHeight;
        const speed = dy / Math.max(1, Date.now() - startTime);
        const shouldClose = dy > height / 2 || (speed > 0.6 && dy > 40);

        s.style.transition = "transform .25s cubic-bezier(.2, .8, .2, 1)";

        if (shouldClose) {
            s.style.transform = "translateY(100%)";
            setTimeout(function () {
                m.classList.remove("show");
                s.style.transition = "";
                s.style.transform = "";
            }, 250);
        } else {
            s.style.transform = "";
            setTimeout(function () {
                s.style.transition = "";
            }, 250);
        }

        reset();
    }

    document.addEventListener("touchend", finish, { passive: true });
    document.addEventListener("touchcancel", finish, { passive: true });
})();