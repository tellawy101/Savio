// ==============================================================
// screens/statisticsPage.js
// كل منطق صفحة الإحصائيات مجمّع في دالة واحدة initStatisticsPage()
// بتتنادى يدويًا من الراوتر بعد ما محتوى الصفحة يتحقن جوه #app
// ==============================================================

function initStatisticsPage() {
  
  // ------------------------------
  // الحالة (لازم تتصفر كل مرة الصفحة تتفتح من جديد)
  // ------------------------------
  let currentPeriod = "week";
  let cashFlowChart = null;
  
  // ------------------------------
  // FORMAT MONEY
  // ------------------------------
  function formatMoney(amount) {
    return formatCurrency(amount);
  }
  
  // ------------------------------
  // GET DATE
  // ------------------------------
  function getTransactionDate(transaction) {
    if (!transaction.date) {
      return null;
    }
    
    const date = new Date(transaction.date);
    
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  }
  
// ------------------------------
    // FILTER BY PERIOD
    // ------------------------------
    function filterTransactions(transactions) {

        if (currentPeriod === "all") {
            return transactions;
        }

        const now = new Date();

        return transactions.filter(transaction => {

            const date = getTransactionDate(transaction);

            if (!date) {
                return false;
            }

            if (currentPeriod === "week") {

                const start = new Date(now);
                start.setHours(0, 0, 0, 0);

                const day = start.getDay();

                // الأسبوع يبدأ من السبت
                const daysFromSaturday =
                    day === 6 ? 0 : day + 1;

                start.setDate(
                    start.getDate() - daysFromSaturday
                );

                return date >= start && date <= now;
            }

            if (currentPeriod === "month") {

                return (
                    date.getFullYear() === now.getFullYear() &&
                    date.getMonth() === now.getMonth()
                );
            }

            if (currentPeriod === "year") {

                return date.getFullYear() === now.getFullYear();
            }

            return true;
        });
    }

    // ------------------------------
    // IGNORE TRANSFERS
    // ------------------------------
    function isTransfer(transaction) {

        const text = [
            transaction.type,
            transaction.category,
            transaction.description
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return (
            text.includes("transfer") ||
            text.includes("تحويل")
        );
    }

// ------------------------------
    // SUMMARY
    // ------------------------------
    function updateSummary(transactions) {

        let income = 0;
        let expense = 0;

        transactions.forEach(transaction => {

            if (isTransfer(transaction)) {
                return;
            }

            const amount = Number(transaction.amount) || 0;

            if (transaction.type === "income") {
                income += amount;
            }

            if (transaction.type === "expense") {
                expense += amount;
            }
        });

        const balance = income - expense;

        const incomeElement = document.getElementById("totalIncome");
        const expenseElement = document.getElementById("totalExpense");
        const balanceElement = document.getElementById("netBalance");

        if (incomeElement) {
            incomeElement.textContent = formatMoney(income);
        }

        if (expenseElement) {
            expenseElement.textContent = formatMoney(expense);
        }

        if (balanceElement) {
            balanceElement.textContent = formatMoney(balance);
        }
    }

    // ------------------------------
    // CATEGORY STATISTICS
    // ------------------------------
    function updateCategoryStats(transactions) {

        const container = document.getElementById("categoryStats");

        if (!container) {
            return;
        }

        const categories = {};

        transactions.forEach(transaction => {

            if (
                transaction.type !== "expense" ||
                isTransfer(transaction)
            ) {
                return;
            }

            const category =
                transaction.category ||
                "Other";

            const amount =
                Number(transaction.amount) || 0;

            categories[category] =
                (categories[category] || 0) + amount;
        });

        const entries = Object.entries(categories)
            .sort((a, b) => b[1] - a[1]);

        if (!entries.length) {

            container.innerHTML = `
    <div class="empty-stat">
        <i data-lucide="pie-chart"></i>
        <span>${t("stats_no_expense_data")}</span>
    </div>
`;

            if (window.lucide) lucide.createIcons();

            return;
        }

        const maxAmount = entries[0][1];

        const totalAmount = entries.reduce(
            (sum, entry) => sum + entry[1],
            0
        );

        container.innerHTML = entries.map(([category, amount]) => {

            const percentage =
                maxAmount > 0
                    ? (amount / maxAmount) * 100
                    : 0;

            const share =
                totalAmount > 0 ?
                Math.round((amount / totalAmount) * 100) :
                0;

            return `
            <div class="category-row">

                <div class="category-top">

                    <span class="category-name">
                        ${escapeHTML(category)}
                    </span>

                    <span class="category-amount">
                        ${formatMoney(amount)}
                    </span>

                </div>

                <div class="category-progress">

                    <div
                        class="category-progress-fill"
                        style="width: ${percentage}%">
                    </div>

                </div>

            </div>
        `;

        }).join("");
    }

// ------------------------------
    // ACCOUNT STATISTICS
    // ------------------------------
    function updateAccountStats(transactions) {

        const container = document.getElementById("accountStats");

        if (!container) {
            return;
        }

        const accounts = {};

        transactions.forEach(transaction => {

            // تجاهل التحويلات لأنها لا تعتبر دخل أو مصروف
            if (isTransfer(transaction)) {
                return;
            }

            const account =
                transaction.account ||
                "Unknown";

            const amount =
                Number(transaction.amount) || 0;

            // إنشاء الحساب أول مرة
            if (!accounts[account]) {
                accounts[account] = {
                    income: 0,
                    expense: 0
                };
            }

            // حساب الدخل والمصروف لكل Account
            if (transaction.type === "income") {
                accounts[account].income += amount;
            }

            if (transaction.type === "expense") {
                accounts[account].expense += amount;
            }
        });

        // تحويل البيانات إلى Array وترتيب الحسابات
        const entries = Object.entries(accounts)
            .map(([account, data]) => {

                const net =
                    data.income -
                    data.expense;

                return {
                    account,
                    income: data.income,
                    expense: data.expense,
                    net
                };
            })
            .sort((a, b) =>
                Math.abs(b.net) -
                Math.abs(a.net)
            );

        // لو مفيش بيانات
        if (!entries.length) {

            container.innerHTML = `
    <div class="empty-stat">
        <i data-lucide="wallet-cards"></i>
        <span>${t("stats_no_account_data")}</span>
    </div>
`;

            if (window.lucide) lucide.createIcons();

            return;
        }

        // عرض Activity لكل Account
        container.innerHTML = entries.map(data => {

            const sign =
                data.net >= 0 ?
                "+" :
                "";

            return `
            <div class="account-row">

                <div class="account-info">

                    <span class="account-name">
                        ${escapeHTML(data.account)}
                    </span>

                    <div class="account-activity">

    <span class="account-income">
        ${t("stats_income")}:
        ${formatMoney(data.income)}
    </span>

    <span class="account-expense">
        ${t("stats_expense")}:
        ${formatMoney(data.expense)}
    </span>

</div>

                </div>

                <span class="account-value">
                    ${sign}${formatMoney(data.net)}
                </span>

            </div>
        `;

        }).join("");
    }

// ------------------------------
    // CASH FLOW CHART
    // ------------------------------
    function updateCashFlowChart(transactions) {

        const canvas =
            document.getElementById("cashFlowChart");

        if (!canvas || typeof Chart === "undefined") {
            return;
        }

        const grouped = {};

        transactions.forEach(transaction => {

            if (
                isTransfer(transaction) ||
                !transaction.date
            ) {
                return;
            }

            const date =
                getTransactionDate(transaction);

            if (!date) {
                return;
            }

            let key;

            const locale =
        getLanguage() === "ar" ? "ar-EG" : "en-US";

    if (currentPeriod === "year") {

        key = date.toLocaleString(locale, {
            month: "short"
        });

    } else {

        key =
            date.toLocaleDateString(locale, {
                month: "short",
                day: "numeric"
            });
    }

            if (!grouped[key]) {

                grouped[key] = {
                    income: 0,
                    expense: 0,
                    date: date
                };
            }

            const amount =
                Number(transaction.amount) || 0;

            if (transaction.type === "income") {
                grouped[key].income += amount;
            }

            if (transaction.type === "expense") {
                grouped[key].expense += amount;
            }

        });

        const entries =
            Object.entries(grouped)
                .sort((a, b) =>
                    a[1].date - b[1].date
                );

        const labels =
            entries.map(entry => entry[0]);

        const incomeData =
            entries.map(entry => entry[1].income);

        const expenseData =
            entries.map(entry => entry[1].expense);

        if (cashFlowChart) {
            cashFlowChart.destroy();
        }

        cashFlowChart = new Chart(canvas, {

            type: "line",

            data: {

                labels,

                datasets: [

                    {
        label: t("stats_income"),
        data: incomeData,

        borderColor: "#0F766E",
        backgroundColor: "#0F766E",

        borderWidth: 2,

        tension: 0.35,

        fill: false
    },

    {
        label: t("stats_expense"),
        data: expenseData,

        borderColor: "#EF4444",
        backgroundColor: "#EF4444",

        borderWidth: 2,

        tension: 0.35,

        fill: false
    }

                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {
                    mode: "index",
                    intersect: false
                },

                plugins: {

                    legend: {
                        display: true
                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback: function(value) {
                                return value.toLocaleString();
                            }

                        }

                    }

                }

            }

        });
    }

// ------------------------------
    // ESCAPE HTML
    // ------------------------------
    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ------------------------------
    // UPDATE EVERYTHING
    // ------------------------------
    function updateStatistics() {

        const transactions =
            loadTransactions();

        const filteredTransactions =
            filterTransactions(transactions);

        updateSummary(filteredTransactions);

        updateCategoryStats(filteredTransactions);

        updateAccountStats(filteredTransactions);

        updateCashFlowChart(filteredTransactions);

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    // ------------------------------
    // PERIOD BUTTONS
    // ------------------------------
    document.querySelectorAll(".period-btn")
        .forEach(button => {

            button.onclick = function () {

                document
                    .querySelectorAll(".period-btn")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );

                button.classList.add("active");

                currentPeriod =
                    button.dataset.period;

                updateStatistics();

            };

        });

    // ------------------------------
    // Initialize
    // ------------------------------
    updateStatistics();
}