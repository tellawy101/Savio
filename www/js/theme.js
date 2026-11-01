// ==============================
// Theme (Dark / Light Mode)
// ==============================

function resolveTheme(theme) {
    if (theme === "system") {
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ?
            "dark" :
            "light";
    }
    return theme;
}

function applyTheme(theme) {
    document.body.classList.toggle("dark", resolveTheme(theme) === "dark");
}

// لو الثيم "حسب النظام" وغيّرت وضع التليفون، التطبيق يتغير معاه
if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function() {
        if (getTheme() === "system") applyTheme("system");
    });
}

applyTheme(getTheme());

document.addEventListener("DOMContentLoaded", function() {
    applyTheme(getTheme());
});