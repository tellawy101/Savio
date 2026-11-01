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
    if (localStorage.getItem("theme") === "dark") {
        document.documentElement.style.background = "#101817";
    }
})();
