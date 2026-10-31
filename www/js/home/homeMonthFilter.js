// ======================================
// home/homeMonthFilter.js
// فلتر الشهر (السابق / التالي / اختيار شهر)
// ======================================

function initHomeMonthFilter(expenseList, renderExpenses) {
    const prevMonthBtn = document.getElementById("prevMonthBtn");
    const nextMonthBtn = document.getElementById("nextMonthBtn");
    const monthLabelBtn = document.getElementById("monthLabelBtn");
    const monthPicker = document.getElementById("monthPicker");

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

    function changeMonth(diff) {
        const [year, month] = window.selectedMonth.split("-").map(Number);
        const date = new Date(year, month - 1 + diff, 1);
        window.selectedMonth = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
        renderMonthLabel();
        renderExpenses();
        expenseList.classList.remove("month-slide-next", "month-slide-prev");
        void expenseList.offsetWidth;
        expenseList.classList.add(diff > 0 ? "month-slide-next" : "month-slide-prev");
    }

    renderMonthLabel();

    if (prevMonthBtn) prevMonthBtn.onclick = () => changeMonth(-1);
    if (nextMonthBtn) nextMonthBtn.onclick = () => changeMonth(1);

    if (monthLabelBtn && monthPicker) {
        monthLabelBtn.onclick = () => {
            monthPicker.value = window.selectedMonth;
            monthPicker.showPicker ? monthPicker.showPicker() : monthPicker.click();
        };
        monthPicker.onchange = () => {
            if (!monthPicker.value) return;
            window.selectedMonth = monthPicker.value;
            renderMonthLabel();
            renderExpenses();
        };
    }
}
