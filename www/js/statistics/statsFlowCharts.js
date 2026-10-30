// ==============================================================
// statistics/statsFlowCharts.js
// رسمة الدخل/المصروف (Line) والأعمدة (Bar) — نفس الداتا ونفس الكود
// ==============================================================

const STATS_INCOME_COLOR = "#0F766E";
const STATS_EXPENSE_COLOR = "#EF4444";

// الفرق الوحيد بين الرسمتين
const FLOW_CHART_TYPES = {
    line: {
        canvasId: "cashFlowChart",
        colorKeys: ["borderColor", "backgroundColor"],
        datasetStyle: { borderWidth: 2, tension: 0.35, fill: false },
        interaction: { mode: "index", intersect: false }
    },
    bar: {
        canvasId: "barChart",
        colorKeys: ["backgroundColor"],
        datasetStyle: { borderRadius: 4 },
        interaction: undefined
    }
};

// مدخلات: النوع (line/bar) + المعاملات + الفترة + الرسم القديم
// مخرجات: الرسم الجديد (أو null لو مفيش بيانات، أو القديم لو الـ canvas مش موجود)
function renderFlowChart(type, transactions, period, oldChart) {
    const config = FLOW_CHART_TYPES[type];
    const canvas = document.getElementById(config.canvasId);

    if (!canvas || typeof Chart === "undefined") {
        return oldChart;
    }

    const locale = getLanguage() === "ar" ? "ar-EG" : "en-US";
    const { labels, incomeData, expenseData } =
        groupTransactionsForChart(transactions, period, getTransactionDate, locale);

    if (oldChart) {
        oldChart.destroy();
    }

    const card = canvas.closest(".statistics-card");
    if (card) {
        card.style.display = labels.length ? "" : "none";
    }

    if (!labels.length) {
        return null;
    }

    // dataset واحد (دخل أو مصروف) بالألوان والستايل الخاص بالنوع
    function buildDataset(label, data, color) {
        const dataset = { label, data, ...config.datasetStyle };
        config.colorKeys.forEach(key => { dataset[key] = color; });
        return dataset;
    }

    return new Chart(canvas, {
        type,
        data: {
            labels,
            datasets: [
                buildDataset(t("stats_income"), incomeData, STATS_INCOME_COLOR),
                buildDataset(t("stats_expense"), expenseData, STATS_EXPENSE_COLOR)
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: config.interaction,
            plugins: {
                legend: { display: true }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString("en-US");
                        }
                    }
                }
            }
        }
    });
}