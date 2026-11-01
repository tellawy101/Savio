// زر الرجوع في الصفحات الفرعية: <button data-back="اسم الصفحة">
document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-back]");
    if (!btn) return;
    if (typeof hapticTap === "function") hapticTap();
    navigateTo(btn.dataset.back);
});