// ==============================================================
// statistics/statsCompare.js
// مقارنة الشهر الحالي بالشهر اللي فات
// ==============================================================

// مدخلات: القيمتين + هل الزيادة حاجة كويسة ← مخرجات: { text, cssClass }
function getCompareChange(currentValue, previousValue, higherIsGood) {
    if (previousValue > 0) {
        const change = Math.round(((currentValue - previousValue) / previousValue) * 100);
        const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "";
        let cssClass = "compare-neutral";

        if (change !== 0) {
            const isGood = higherIsGood ? change > 0 : change < 0;
            cssClass = isGood ? "compare-good" : "compare-bad";
        }

        return { text: arrow + " " + Math.abs(change) + "%", cssClass };
    }

    if (currentValue > 0) {
        return {
            text: t("stats_compare_new"),
            cssClass: higherIsGood ? "compare-good" : "compare-bad"
        };
    }

    return { text: "-", cssClass: "compare-neutral" };
}

function buildCompareRow(label, currentValue, previousValue, higherIsGood) {
    const change = getCompareChange(currentValue, previousValue, higherIsGood);

    return `
    <div class="compare-row">

        <div class="compare-top">
            <span class="compare-label">${label}</span>
            <span class="compare-change ${change.cssClass}">${change.text}</span>
        </div>

        <div class="compare-values">

            <div class="compare-value">
                <span>${t("stats_this_month")}</span>
                <strong>${formatCurrency(currentValue)}</strong>
            </div>

            <div class="compare-value">
                <span>${t("stats_last_month")}</span>
                <strong>${formatCurrency(previousValue)}</strong>
            </div>

        </div>

    </div>
    `;
}

// بياخد كل المعاملات (مش المفلترة بالفترة)
function renderMonthCompare(transactions) {
    const container = document.getElementById("monthCompare");

    if (!container) {
        return;
    }

    const { current, previous } = calculateMonthComparison(transactions);

    container.innerHTML =
        buildCompareRow(t("stats_income"), current.income, previous.income, true) +
        buildCompareRow(t("stats_expense"), current.expense, previous.expense, false);
}