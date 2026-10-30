// ==============================
// components/periodReport.js
// كارت تقرير الفترة (الكل / الشهر ده / ...) - مشترك بين الرئيسية والحسابات
// ==============================

function periodPad2(n) { return String(n).padStart(2, "0"); }

function periodToISO(d) {
    return d.getFullYear() + "-" + periodPad2(d.getMonth() + 1) + "-" + periodPad2(d.getDate());
}

function getPeriodRangeFor(period, customFrom, customTo) {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    if (period === "this_month") return { from: periodToISO(new Date(y, m, 1)), to: periodToISO(new Date(y, m + 1, 0)) };
    if (period === "last_month") return { from: periodToISO(new Date(y, m - 1, 1)), to: periodToISO(new Date(y, m, 0)) };
    if (period === "this_year") return { from: y + "-01-01", to: y + "-12-31" };
    if (period === "last_year") return { from: (y - 1) + "-01-01", to: (y - 1) + "-12-31" };
    if (period === "all") return { from: "0000-01-01", to: "9999-12-31" };
    return { from: customFrom, to: customTo };
}

function getPeriodTotalsFor(transactions, from, to) {
    let income = 0, expense = 0;
    if (!from || !to) return { income, expense };
    transactions.forEach(function (tr) {
        if (!tr.date || tr.isTransfer) return;
        const d = tr.date.slice(0, 10);
        if (d < from || d > to) return;
        if (tr.type === "income") income += Number(tr.amount) || 0;
        else if (tr.type === "expense") expense += Number(tr.amount) || 0;
    });
    return { income, expense };
}

// state = { period, from, to } (بيتعدل جواها مباشرة) / onChange بتتنادى بعد أي تغيير
function buildPeriodReportCard(state, transactions, onChange) {
    const periods = [
        ["all", "report_all"],
        ["this_month", "report_this_month"],
        ["last_month", "report_last_month"],
        ["this_year", "report_this_year"],
        ["last_year", "report_last_year"],
        ["custom", "report_custom"]
    ];
    const range = getPeriodRangeFor(state.period, state.from, state.to);
    const totals = getPeriodTotalsFor(transactions, range.from, range.to);
    const net = totals.income - totals.expense;
    const cur = escapeHTML(getCurrency());
    const fmt = formatWholeAmount;
    const total = totals.income + totals.expense;
    const incPct = total > 0 ? Math.round((totals.income / total) * 100) : 0;
    const netCls = net < 0 ? "period-expense" : "period-income";
    const rangeLabel = (state.period !== "all" && range.from && range.to) ? range.from + "  →  " + range.to : "";

    const card = document.createElement("div");
    card.className = "period-report";
    card.innerHTML = `
        <div class="period-chips">
            ${periods.map(function (p) {
                return `<button type="button" class="period-chip ${state.period === p[0] ? "active" : ""}" data-period="${p[0]}">${t(p[1])}</button>`;
            }).join("")}
        </div>
        ${state.period === "custom" ? `
            <div class="period-custom">
                <label>${t("report_from")}<input type="date" id="reportFrom" value="${state.from}"></label>
                <label>${t("report_to")}<input type="date" id="reportTo" value="${state.to}"></label>
            </div>` : ""}
        <div class="period-range">${rangeLabel}</div>
        <div class="period-net">
            <span class="period-label">${t("stats_net_balance")}</span>
            <span class="period-net-value ${netCls}">${cur} ${fmt(net)}</span>
        </div>
        <div class="period-bar ${total === 0 ? "empty" : ""}"><span style="width:${incPct}%"></span></div>
        <div class="period-totals">
            <div class="period-item">
                <span class="period-label">${t("stats_income")}</span>
                <span class="period-value period-income">${cur} ${fmt(totals.income)}</span>
            </div>
            <div class="period-item">
                <span class="period-label">${t("stats_expense")}</span>
                <span class="period-value period-expense">${cur} ${fmt(totals.expense)}</span>
            </div>
        </div>
    `;

    const chipsEl = card.querySelector(".period-chips");
    if (state.chipsScroll) {
        requestAnimationFrame(function() { chipsEl.scrollLeft = state.chipsScroll; });
    }
    card.querySelectorAll(".period-chip").forEach(function(btn) {
        btn.onclick = function() {
            state.period = btn.dataset.period;
            state.chipsScroll = chipsEl.scrollLeft;
            onChange();
        };
    });
    const fromInput = card.querySelector("#reportFrom");
    const toInput = card.querySelector("#reportTo");
    if (fromInput) fromInput.onchange = function () { state.from = fromInput.value; onChange(); };
    if (toInput) toInput.onchange = function () { state.to = toInput.value; onChange(); };
    return card;
}