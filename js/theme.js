// ==============================
// Theme (Dark / Light Mode)
// ==============================
const themeBtn = document.getElementById("themeBtn");
const themeIconWrap = document.getElementById("themeIconWrap");

function setThemeIcon(iconName) {
    if (!themeIconWrap) return;
    themeIconWrap.innerHTML = `<i data-lucide="${iconName}"></i>`;
    if (window.lucide) {
        lucide.createIcons();
    }
}

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

document.addEventListener("DOMContentLoaded", function() {
    setThemeIcon(document.body.classList.contains("dark") ? "sun" : "moon");
});

themeBtn.onclick = () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        setThemeIcon("sun");
    } else {
        localStorage.setItem("theme", "light");
        setThemeIcon("moon");
    }
};