// ==============================================================
// statistics/statsCategories.js
// إحصائيات الفئات: الدونات + القائمة (بيشاركوا نفس الألوان)
// ==============================================================

const STATS_CATEGORY_COLORS = ["#F97316", "#3B82F6", "#EC4899", "#10B981", "#8B5CF6", "#F59E0B", "#06B6D4", "#E11D48", "#84CC16", "#6366F1", "#14B8A6", "#D946EF", "#EAB308", "#0EA5E9", "#A855F7", "#F43F5E", "#22C55E", "#FB923C", "#2DD4BF", "#78716C"];

function getStatsCategoryColor(name, index) {
    const cat = getCategories().find(function (c) {
        return c.name === name && getCategoryType(c) === "expense";
    });
    if (cat) return getCategoryColor(cat);
    return STATS_CATEGORY_COLORS[index % STATS_CATEGORY_COLORS.length];
}

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
backgroundColor: breakdown.map((item, i) => getStatsCategoryColor(item.category, i)),
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

function renderCategoryList(breakdown, transactions){
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
const iconByName = {};
getCategories().forEach(function(c) { iconByName[c.name] = c.icon; });
    container.innerHTML = breakdown.map(({ id, category, amount, percentage }, index) => `
        <div class="category-row">

            <div class="category-top">

                <span class="category-name">
<span class="category-dot" style="background: ${getStatsCategoryColor(category, index)}"></span>
<i data-lucide="${escapeHTML(iconByName[category] || 'tag')}" style="width:16px;height:16px;color:${getStatsCategoryColor(category, index)}"></i>    ${escapeHTML(category)}
                </span>

                <span class="category-amount">
                    ${formatCurrency(amount)}
                </span>

            </div>

            <div class="category-progress">
<div class="category-progress-fill" style="width: ${percentage}%; background: ${getStatsCategoryColor(category, index)}"></div>
            </div>
 <div class="category-subs"></div>
        </div>
       `).join("");

    container.querySelectorAll(".category-row").forEach(function (row, i) {
        const item = breakdown[i];
        if (!item.id || !getSubCategories(item.id).length) return;
        row.classList.add("has-subs");
        row.onclick = function () {
            const box = row.querySelector(".category-subs");
            if (!box.innerHTML) {
                const color = getStatsCategoryColor(item.category, i);
                box.innerHTML = calculateSubBreakdown(transactions, item.id).map(function (s) {
                    const pct = item.amount > 0 ? Math.round(s.amount / item.amount * 100) : 0;
                    return '<div class="sub-row"><span>' + escapeHTML(s.name) + '</span><span>' +
                        formatCurrency(s.amount) + ' · ' + pct + '%</span></div>' +
                        '<div class="category-progress"><div class="category-progress-fill" style="width:' + pct + '%;background:' + color + '"></div></div>';
                }).join("");
            }
            row.classList.toggle("open");
        };
    });
}