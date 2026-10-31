// ======================================
// accountsPage/accountsPageHelpers.js
// دوال مساعدة لكروت الحسابات (نشاط الحساب + الـ sparkline)
// ======================================

    function getAccountActivity(accountKey, transactions, from, to) {
        let income = 0, expense = 0;
        transactions.forEach(function (tr) {
            if (getTxAccountId(tr) !== accountKey) return;
            // التحويلات مش دخل ولا مصروف حقيقي، فمش بتتعد هنا
            if (tr.isTransfer) return;
            if (from && to) {
    const d = (tr.date || "").slice(0, 10);
    if (d < from || d > to) return;
}
            if (tr.type === "income") income += Number(tr.amount) || 0;
            else if (tr.type === "expense") expense += Number(tr.amount) || 0;
        });
        return { income, expense };
    }

    function getSparklinePoints(accountKey, type, transactions) {
        const MONTHS = 5;
        const now = new Date();
        const keys = [];
        for (let i = MONTHS - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            keys.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"));
        }
        const sums = keys.map(function () { return 0; });
        transactions.forEach(function (tr) {
if (getTxAccountId(tr) !== accountKey || tr.type !== type || !tr.date || tr.isTransfer) return;
            const idx = keys.indexOf(tr.date.slice(0, 7));
            if (idx !== -1) sums[idx] += Number(tr.amount) || 0;
        });
        const max = Math.max.apply(null, sums);
        return sums.map(function (v, i) {
            const y = max > 0 ? 22 - (v / max) * 20 : 22;
            return (i * 15) + "," + y.toFixed(1);
        }).join(" ");
    }
