// ==============================
// Search Transactions
// ==============================
// بيدور على خانة البحث ودالة renderExpenses بعد ما كل السكربتات تخلص تحميل،
// عشان يشتغل صح مهما كان ترتيب تحميل الملفات
document.addEventListener("DOMContentLoaded", function () {

    const searchBox = document.getElementById("searchInput");

    if (searchBox && typeof renderExpenses === "function") {
        searchBox.addEventListener("input", renderExpenses);
    }

});
