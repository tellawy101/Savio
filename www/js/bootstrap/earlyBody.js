// ==============================================================
// bootstrap/earlyBody.js
// أول حاجة في <body>: تفعيل كلاس الدارك مود قبل ما الصفحة تتعرض
// ==============================================================
(function() {
  var theme = localStorage.getItem("theme") || "light";
  var isDark = theme === "dark" ||
    (theme === "system" && window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (isDark) document.body.classList.add("dark");
})();