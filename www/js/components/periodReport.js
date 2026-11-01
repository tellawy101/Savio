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
    
    const range = getPeriodRangeFor(state.period, state.from, state.to);
    const totals = getPeriodTotalsFor(transactions, range.from, range.to);
        const allTransactions = loadTransactions();
    const net = getAccounts().reduce(function(sum, acc) {
        return sum + calculateAccountBalance(acc, allTransactions);
    }, 0);
    const cur = escapeHTML(getCurrency());
    const fmt = formatWholeAmount;
    const total = totals.income + totals.expense;
    const incPct = total > 0 ? Math.round((totals.income / total) * 100) : 0;
    const netCls = net < 0 ? "period-expense" : "period-income";
    const rangeLabel = (state.period !== "all" && range.from && range.to) ? range.from + "  →  " + range.to : "";

    const card = document.createElement("div");
    card.className = "period-report";
    card.innerHTML = `
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
    return card;
}