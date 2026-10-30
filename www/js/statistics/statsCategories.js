// ==============================================================
// statistics/statsCategories.js
// إحصائيات الفئات: الدونات + القائمة (بيشاركوا نفس الألوان)
// ==============================================================

const STATS_CATEGORY_COLORS = ["#0F766E", "#14B8A6", "#2DD4BF", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#EC4899", "#84CC16", "#64748B", "#F97316", "#06B6D4", "#A855F7", "#10B981", "#E11D48", "#6366F1", "#EAB308", "#0EA5E9", "#D946EF", "#78716C"];

// مدخلات: تقسيم الفئات + الرسم القديم ← مخرجات: الرسم الجديد (أو القديم لو الـ canvas مش موجود)
function renderCategoryPie(breakdown, oldChart) {
    const canvas = document.getElementById("categoryPieChart");

    if (!canvas || typeof Chart === "undefined") {
        return oldChart;
    }

    if (oldChart) {
        oldChart.destroy();
    }

    if (!breakdown.length) {
        canvas.parentElement.style.display = "none";
        return null;
    }

    canvas.parentElement.style.display = "";

    return new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: breakdown.map(item => item.category),
            datasets: [{
                data: breakdown.map(item => item.amount),
                backgroundColor: breakdown.map((item, i) => STATS_CATEGORY_COLORS[i % STATS_CATEGORY_COLORS.length]),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "60%",
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ": " + formatCurrency(context.parsed);
                        }
                    }
                }
            }
        }
    });
}

function renderCategoryList(breakdown) {
    const container = document.getElementById("categoryStats");

    if (!container) {
        return;
    }

    if (!breakdown.length) {
        container.innerHTML = `
            <div class="empty-stat">
                <i data-lucide="pie-chart"></i>
                <span>${t("stats_no_expense_data")}</span>
            </div>
        `;
        return;
    }

    container.innerHTML = breakdown.map(({ category, amount, percentage }, index) => `
        <div class="category-row">

            <div class="category-top">

                <span class="category-name">
                    <span class="category-dot" style="background: ${STATS_CATEGORY_COLORS[index % STATS_CATEGORY_COLORS.length]}"></span>
                    ${escapeHTML(category)}
                </span>

                <span class="category-amount">
                    ${formatCurrency(amount)}
                </span>

            </div>

            <div class="category-progress">
                <div class="category-progress-fill" style="width: ${percentage}%"></div>
            </div>

        </div>
    `).join("");
}