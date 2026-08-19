// ==============================
// Theme (Dark / Light Mode)
// ==============================

const themeBtn = document.getElementById("themeBtn");
const themeIconWrap = document.getElementById("themeIconWrap");
const darkModeToggle = document.getElementById("darkModeToggle");


// ==============================
// Set Theme Icon
// ==============================

function setThemeIcon(iconName) {

    if (!themeIconWrap) return;

    themeIconWrap.innerHTML = `
        <i data-lucide="${iconName}"></i>
    `;

    if (window.lucide) {
        lucide.createIcons();
    }
}


// ==============================
// Apply Theme
// ==============================

function applyTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add("dark");

    } else {

        document.body.classList.remove("dark");

    }


    // Update Settings Toggle

    if (darkModeToggle) {
        darkModeToggle.checked = theme === "dark";
    }


    // Update Header Theme Icon

    if (themeIconWrap) {
        setThemeIcon(theme === "dark" ? "sun" : "moon");
    }
}


// ==============================
// Load Saved Theme
// ==============================

const savedTheme = localStorage.getItem("theme") || "light";

applyTheme(savedTheme);


// ==============================
// DOM Loaded
// ==============================

document.addEventListener("DOMContentLoaded", function () {

    const currentTheme =
        localStorage.getItem("theme") || "light";

    applyTheme(currentTheme);


    // ==========================
    // Settings Dark Mode Toggle
    // ==========================

    if (darkModeToggle) {

        darkModeToggle.addEventListener("change", function () {

            const newTheme =
                this.checked ? "dark" : "light";

            localStorage.setItem("theme", newTheme);

            applyTheme(newTheme);

        });

    }

});