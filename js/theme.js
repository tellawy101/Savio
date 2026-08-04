// ==============================
// theme.js
// تبديل الوضع الليلي/النهاري
// ==============================

const themeBtn = document.getElementById("themeBtn");

// تطبيق الوضع المحفوظ عند فتح الصفحة
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";
}

themeBtn.onclick = function () {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeBtn.textContent = "☀️";
    } else {
        localStorage.setItem("theme", "light");
        themeBtn.textContent = "🌙";
    }

};