// زر الرجوع في الصفحات الفرعية: <button data-back="اسم الصفحة">
document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-back]");
    if (!btn) return;
    if (typeof hapticTap === "function") hapticTap();
    navigateTo(btn.dataset.back);
});
// زر الرجوع في صفحات اختيار الحساب والتصنيف
document.addEventListener("click", function (e) {
    const btn = e.target.closest(".modal-page-back");
    if (!btn) return;
    if (typeof hapticTap === "function") hapticTap();
    if (typeof window.handleHardwareBack === "function") window.handleHardwareBack();
});