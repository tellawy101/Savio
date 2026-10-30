// ==============================
// storage/debts.js
// تخزين الديون وحساباتها
// ==============================
// ==============================
// حساب إجمالي الديون (منطق بيزنس منفصل عن العرض)
// ==============================
function calculateDebtTotals(debts) {
    let receivable = 0;
    let payable = 0;

    debts.forEach(debt => {
        const remaining = Number(debt.remaining) || 0;
        if (debt.type === "receivable") {
            receivable += remaining;
        } else {
            payable += remaining;
        }
    });

    return { receivable, payable, net: receivable - payable };
}
// ==============================
// Debts
// ==============================

const DEBTS_KEY = "debts";

function getDebts() {
    return safeParse(DEBTS_KEY, []);
}

function saveDebts(debts) {
safeSetItem(DEBTS_KEY, JSON.stringify(debts));
}
function removeDebtPayment(paymentId) {
    const debts = getDebts();
    let removed = null;

    debts.forEach(function (debt) {
        if (!Array.isArray(debt.payments)) return;

        const payment = debt.payments.find(function (p) {
            return p.id === paymentId;
        });
        if (!payment) return;

        removed = { debtId: debt.id, payment: payment };

        debt.payments = debt.payments.filter(function (p) {
            return p.id !== paymentId;
        });
                debt.paid = Math.max(0, Math.round((debt.paid - payment.amount) * 100) / 100);
        debt.remaining = Math.round((debt.amount - debt.paid) * 100) / 100;
        debt.status = debt.remaining <= 0 ? "paid" : "open";
    });

    if (removed) saveDebts(debts);
    return removed;
}
function restoreDebtPayment(removed) {
    if (!removed) return;
    
    const debts = getDebts();
    const debt = debts.find(function(d) {
        return d.id === removed.debtId;
    });
    if (!debt) return;
    
    if (!Array.isArray(debt.payments)) debt.payments = [];
    debt.payments.push(removed.payment);
    // المعرّفات القديمة أرقام (Date.now) والجديدة نصوص "pay_<وقت>_<عشوائي>"
    // فبنستخرج الوقت من النوعين عشان الترتيب يفضل صح
    function idTime(id) {
        if (typeof id === "number") return id;
        const m = /_(\d{10,})_/.exec(String(id));
        return m ? Number(m[1]) : 0;
    }
    debt.payments.sort(function(a, b) {
        return idTime(a.id) - idTime(b.id);
    });
    
    debt.paid = Math.round((debt.paid + removed.payment.amount) * 100) / 100;
    debt.remaining = Math.max(0, Math.round((debt.amount - debt.paid) * 100) / 100);
    debt.status = debt.remaining <= 0 ? "paid" : "open";
    
    saveDebts(debts);
}
function updateDebtPayment(paymentId, newAmount, account, accountId, date) {
        newAmount = Number(newAmount);
    if (!Number.isFinite(newAmount) || newAmount <= 0) return false;
    const debts = getDebts();
    let found = false;
    let exceeds = false;

    debts.forEach(function (debt) {
        if (found || !Array.isArray(debt.payments)) return;

        const payment = debt.payments.find(function (p) {
            return p.id === paymentId;
        });
        if (!payment) return;
        found = true;

        const newPaid = Math.round((debt.paid - payment.amount + newAmount) * 100) / 100;
        if (newPaid > debt.amount) {
            exceeds = true;
            return;
        }

        payment.amount = newAmount;
        payment.account = account;
        payment.accountId = accountId;
        payment.date = date;
        debt.paid = newPaid;
        debt.remaining = Math.round((debt.amount - debt.paid) * 100) / 100;
        debt.status = debt.remaining <= 0 ? "paid" : "open";
    });

                if (!found) return true;
        if (exceeds) return false;
    saveDebts(debts);
    return true;
}