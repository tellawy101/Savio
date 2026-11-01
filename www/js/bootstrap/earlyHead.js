// ==============================================================
// bootstrap/earlyHead.js
// بيشتغل في <head> قبل أول رسم للصفحة: لغة + اتجاه + خلفية الدارك مود
// لازم يتحمّل بدون defer عشان ما يحصلش وميض
// ==============================================================
(function () {
    var lang = localStorage.getItem("language") || "en";
    var dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", dir);
        var theme = localStorage.getItem("theme") || "light";
    var isDark = theme === "dark" ||
        (theme === "system" && window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
        document.documentElement.style.background = "#101817";
    }
})();
