// ==============================
// components/saveTick.js
// علامة صح متحركة بتظهر في نص الشاشة لحظة بعد الحفظ
// الاستخدام: showSaveTick();
// ==============================

function showSaveTick() {
    const old = document.getElementById("saveTick");
    if (old) old.remove();

    const el = document.createElement("div");
    el.id = "saveTick";
    el.className = "save-tick";
    el.innerHTML =
        '<svg viewBox="0 0 52 52" aria-hidden="true">' +
        '<circle class="save-tick-circle" cx="26" cy="26" r="24"></circle>' +
        '<path class="save-tick-check" d="M14 27l8 8 16-17"></path>' +
        '</svg>';
    document.body.appendChild(el);

    setTimeout(function () { el.classList.add("hide"); }, 800);
    setTimeout(function () { el.remove(); }, 1100);
}
