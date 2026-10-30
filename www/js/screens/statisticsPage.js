// ==============================================================
// screens/statisticsPage.js
// المنسّق بس: الحالة + الأزرار + استدعاء الـ renderers
// (الحسابات في statisticsLogic.js، والعرض في js/statistics/)
// بتتنادى يدويًا من الراوتر بعد ما محتوى الصفحة يتحقن جوه #app
// ==============================================================

function initStatisticsPage() {

    // الحالة (بتتصفر كل مرة الصفحة تتفتح)
    let currentPeriod = "week";
    let cashFlowChart = null;
    let categoryPieChart = null;
    let barChart = null;

    function updateStatistics() {
        const transactions = loadTransactions();
        const filtered = filterTransactionsByPeriod(transactions, currentPeriod);

        // بيتحسب مرة واحدة ويتوزع على اللي محتاجه
        const categoryBreakdown = calculateCategoryBreakdown(filtered);

        renderStatsSummary(filtered, currentPeriod, categoryBreakdown);
        renderCategoryList(categoryBreakdown);
        categoryPieChart = renderCategoryPie(categoryBreakdown, categoryPieChart);
        renderAccountList(filtered);
        cashFlowChart = renderFlowChart("line", filtered, currentPeriod, cashFlowChart);
        barChart = renderFlowChart("bar", filtered, currentPeriod, barChart);
        renderMonthCompare(transactions);

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    // ------------------------------
    // PERIOD BUTTONS
    // ------------------------------
    const periodIndicator = document.getElementById("periodIndicator");

    function movePeriodIndicator(button) {
        if (!periodIndicator || !button) return;
        periodIndicator.style.left = button.offsetLeft + "px";
        periodIndicator.style.width = button.offsetWidth + "px";
    }

    document.querySelectorAll(".period-btn").forEach(button => {
        button.onclick = function() {
            document.querySelectorAll(".period-btn")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");
            movePeriodIndicator(button);

            currentPeriod = button.dataset.period;
            updateStatistics();
        };
    });

    movePeriodIndicator(document.querySelector(".period-btn.active"));

    // ------------------------------
    // Initialize
    // ------------------------------
    updateStatistics();

    // تنظيف الرسوم لما نسيب الصفحة
    window.cleanupStatisticsPage = function() {
        if (cashFlowChart) { cashFlowChart.destroy(); cashFlowChart = null; }
        if (categoryPieChart) { categoryPieChart.destroy(); categoryPieChart = null; }
        if (barChart) { barChart.destroy(); barChart = null; }
    };
}