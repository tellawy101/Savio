// ==============================
// i18n.js
// نظام الترجمة (عربي / إنجليزي) + اتجاه الصفحة (RTL/LTR)
// ==============================

const LANGUAGE_KEY = "language";
const DEFAULT_LANGUAGE = "en";

const translations = { en: translationsEn, ar: translationsAr };

// بترجع اللغة الحالية
function getLanguage() {
    return localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE;
}


// بتغيّر اللغة وتطبق الاتجاه على الصفحة
function setLanguage(lang) {
    localStorage.setItem(LANGUAGE_KEY, lang);
    applyLanguage();
}


// بترجع نص مترجم حسب المفتاح
function t(key) {
    const lang = getLanguage();
    return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
}


// بتطبق الترجمة على كل عنصر عليه data-i18n، وتظبط اتجاه الصفحة
function applyLanguage() {

    const lang = getLanguage();
    const dir = lang === "ar" ? "rtl" : "ltr";

    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", dir);

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        el.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        el.setAttribute("placeholder", t(key));
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach(el => {
        const key = el.getAttribute("data-i18n-aria-label");
        el.setAttribute("aria-label", t(key));
    });

}


applyLanguage();
document.addEventListener("DOMContentLoaded", applyLanguage);