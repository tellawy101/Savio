// ==============================
// components/countUp.js
// بيخلي الأرقام تعدّ من القيمة القديمة للجديدة بدل ما تقفز
// الاستخدام: عنصر فيه data-countup="مفتاح" و data-value="الرقم" و data-prefix="النص قبل الرقم"
// وبعد ما العنصر يتحط في الصفحة نناديه: countUp(root)
// ==============================

const countUpPrev = {};

function countUp(root) {
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.querySelectorAll("[data-countup]").forEach(function (el) {
        const key = el.dataset.countup;
        const target = Number(el.dataset.value) || 0;
        const from = countUpPrev[key] !== undefined ? countUpPrev[key] : 0;
        const numEl = el.querySelector(".cu-num");
        const prefix = numEl ? "" : (el.dataset.prefix || "");

        countUpPrev[key] = target;

        if (reduceMotion || from === target) return;

        const duration = 600;
        const start = performance.now();

        function frame(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
(numEl || el).textContent = prefix + formatWholeAmount(from + (target - from) * eased);
            if (p < 1) requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    });
}
