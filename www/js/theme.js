// ==============================
// Theme (Dark / Light Mode)
// ==============================

function applyTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
}

applyTheme(getTheme());

document.addEventListener("DOMContentLoaded", function() {
    applyTheme(getTheme());
});