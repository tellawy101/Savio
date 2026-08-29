// =====================================================
// File: monthFilter.js
// Purpose: Month Navigation & Filtering (Home Page)
// =====================================================

const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const monthLabelBtn = document.getElementById("monthLabelBtn");
const monthPicker = document.getElementById("monthPicker");

// الشهر المختار حالياً بصيغة "YYYY-MM"
window.selectedMonth = new Date().toISOString().slice(0, 7);


// ==============================
// عرض اسم الشهر على الزرار
// ==============================

function renderMonthLabel() {

    if (!monthLabelBtn) return;

    const [year, month] = window.selectedMonth.split("-");
    const date = new Date(Number(year), Number(month) - 1);

    const monthName = date.toLocaleDateString(getLanguage() === "ar" ? "ar-EG" : "en-US", { month: "long" });

    monthLabelBtn.innerHTML = `
        <span class="month-label-month">${monthName}</span>
        <span class="month-label-year">${year}</span>
    `;
}


// ==============================
// تغيير الشهر (فرق بالشهور: -1 أو +1)
// ==============================

function changeMonth(diff) {

    const [year, month] = window.selectedMonth.split("-").map(Number);

    const date = new Date(year, month - 1 + diff, 1);

    window.selectedMonth =
        date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");

    renderMonthLabel();

    if (typeof renderExpenses === "function") {
        renderExpenses();
    }
}


// ==============================
// أحداث الأزرار
// ==============================

document.addEventListener("DOMContentLoaded", function () {

    renderMonthLabel();

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener("click", () => changeMonth(-1));
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener("click", () => changeMonth(1));
    }

    // دوس على اسم الشهر يفتح اختيار شهر/سنة مخصص
    if (monthLabelBtn && monthPicker) {

        monthLabelBtn.addEventListener("click", () => {
            monthPicker.value = window.selectedMonth;
            monthPicker.showPicker
                ? monthPicker.showPicker()
                : monthPicker.click();
        });

        monthPicker.addEventListener("change", () => {

            if (!monthPicker.value) return;

            window.selectedMonth = monthPicker.value;

            renderMonthLabel();

            if (typeof renderExpenses === "function") {
                renderExpenses();
            }

        });

    }

});