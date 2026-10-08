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
  let categoryPieChart = null;
  let barChart = null;
  const CATEGORY_COLORS = ["#0F766E", "#14B8A6", "#2DD4BF", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#EC4899", "#84CC16", "#64748B"];
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
    // بعد
function isTransfer(transaction) {
    return transaction.isTransfer === true;
}

// ------------------------------
    // SUMMARY
    // ------------------------------
    function updateSummary(transactions) {
    
    const { income, expense, balance } = calculateSummary(transactions);

        const incomeElement = document.getElementById("totalIncome");
const expenseElement = document.getElementById("totalExpense");
const balanceElement = document.getElementById("statsNetBalance");

if (incomeElement) {
    incomeElement.innerHTML = formatCurrencyHTMLStats(income);
}

if (expenseElement) {
    expenseElement.innerHTML = formatCurrencyHTMLStats(expense);
}

if (balanceElement) {
    balanceElement.innerHTML = formatCurrencyHTMLStats(balance);
}
const dailyElement = document.getElementById("dailyAverage");

    if (dailyElement) {
        dailyElement.innerHTML = formatCurrencyHTMLStats(
            calculateDailyAverage(transactions, currentPeriod)
        );
    }
    const topCategoryElement = document.getElementById("topCategory");

if (topCategoryElement) {
    const topCategory = calculateCategoryBreakdown(transactions)[0];
    
    topCategoryElement.innerHTML = topCategory ?
        `<span class="stats-stat-value">${escapeHTML(topCategory.category)}</span> <span class="stats-stat-currency">${topCategory.share}%</span>` :
        "-";
}
const topAccountElement = document.getElementById("topAccount");

    if (topAccountElement) {
        const accountsActivity = calculateAccountBreakdown(transactions)
            .map(item => ({
                account: item.account,
                volume: item.income + item.expense
            }))
            .sort((a, b) => b.volume - a.volume);

        const totalVolume = accountsActivity.reduce((sum, item) => sum + item.volume, 0);
        const topAccount = accountsActivity[0];

        topAccountElement.innerHTML = topAccount && totalVolume > 0
            ? `<span class="stats-stat-value">${escapeHTML(topAccount.account)}</span> <span class="stats-stat-currency">${Math.round((topAccount.volume / totalVolume) * 100)}%</span>`
            : "-";
    }
    }

// ------------------------------
    // CATEGORY PIE CHART
    // ------------------------------
    function updateCategoryPieChart(transactions) {

        const canvas = document.getElementById("categoryPieChart");

        if (!canvas || typeof Chart === "undefined") {
            return;
        }

        if (categoryPieChart) {
            categoryPieChart.destroy();
            categoryPieChart = null;
        }

        const breakdown = calculateCategoryBreakdown(transactions);

        if (!breakdown.length) {
            canvas.parentElement.style.display = "none";
            return;
        }

        canvas.parentElement.style.display = "";

        const colors = CATEGORY_COLORS;

        categoryPieChart = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: breakdown.map(item => item.category),
                datasets: [{
                    data: breakdown.map(item => item.amount),
                    backgroundColor: breakdown.map((item, i) => colors[i % colors.length]),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "60%",
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    // ------------------------------
    // CATEGORY STATISTICS
    // ------------------------------
    function updateCategoryStats(transactions) {

        const container = document.getElementById("categoryStats");

        if (!container) {
            return;
        }

        const breakdown = calculateCategoryBreakdown(transactions);

if (!breakdown.length) {
    
    container.innerHTML = `
    <div class="empty-stat">
        <i data-lucide="pie-chart"></i>
        <span>${t("stats_no_expense_data")}</span>
    </div>
`;
    
    if (window.lucide) lucide.createIcons();
    
    return;
}

container.innerHTML = breakdown.map(({ category, amount, percentage }, index) => {
            
            return `
            <div class="category-row">

                <div class="category-top">

                    <span class="category-name">
                        <span class="category-dot" style="background: ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}"></span>
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

        const entries = calculateAccountBreakdown(transactions);

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

const locale = getLanguage() === "ar" ? "ar-EG" : "en-US";

const { labels, incomeData, expenseData } =
groupTransactionsForChart(transactions, currentPeriod, getTransactionDate, locale);
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
    // BAR CHART
    // ------------------------------
    function updateBarChart(transactions) {

        const canvas = document.getElementById("barChart");

        if (!canvas || typeof Chart === "undefined") {
            return;
        }

        const locale = getLanguage() === "ar" ? "ar-EG" : "en-US";

        const { labels, incomeData, expenseData } =
            groupTransactionsForChart(transactions, currentPeriod, getTransactionDate, locale);

        if (barChart) {
            barChart.destroy();
            barChart = null;
        }

        barChart = new Chart(canvas, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: t("stats_income"),
                        data: incomeData,
                        backgroundColor: "#0F766E",
                        borderRadius: 4
                    },
                    {
                        label: t("stats_expense"),
                        data: expenseData,
                        backgroundColor: "#EF4444",
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
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
    // MONTH COMPARISON
    // ------------------------------
    function updateMonthCompare(transactions) {

        const container = document.getElementById("monthCompare");

        if (!container) {
            return;
        }

        const now = new Date();
        const thisYear = now.getFullYear();
        const thisMonth = now.getMonth();
        const lastDate = new Date(thisYear, thisMonth - 1, 1);

        function inMonth(transaction, year, month) {
            const date = getTransactionDate(transaction);
            return date && date.getFullYear() === year && date.getMonth() === month;
        }

        const current = calculateSummary(
            transactions.filter(item => inMonth(item, thisYear, thisMonth))
        );

        const previous = calculateSummary(
            transactions.filter(item => inMonth(item, lastDate.getFullYear(), lastDate.getMonth()))
        );

        function buildRow(label, currentValue, previousValue, higherIsGood) {

            let changeText = "-";
            let changeClass = "compare-neutral";

            if (previousValue > 0) {
                const change = Math.round(((currentValue - previousValue) / previousValue) * 100);
                const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "";
                changeText = arrow + " " + Math.abs(change) + "%";

                if (change !== 0) {
                    const isGood = higherIsGood ? change > 0 : change < 0;
                    changeClass = isGood ? "compare-good" : "compare-bad";
                }
            }

            return `
            <div class="compare-row">

                <div class="compare-top">
                    <span class="compare-label">${label}</span>
                    <span class="compare-change ${changeClass}">${changeText}</span>
                </div>

                <div class="compare-values">

                    <div class="compare-value">
                        <span>${t("stats_this_month")}</span>
                        <strong>${formatMoney(currentValue)}</strong>
                    </div>

                    <div class="compare-value">
                        <span>${t("stats_last_month")}</span>
                        <strong>${formatMoney(previousValue)}</strong>
                    </div>

                </div>

            </div>
            `;
        }

        container.innerHTML =
            buildRow(t("stats_income"), current.income, previous.income, true) +
            buildRow(t("stats_expense"), current.expense, previous.expense, false);
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

        updateCategoryPieChart(filteredTransactions);
        updateAccountStats(filteredTransactions);

        updateCashFlowChart(filteredTransactions);

        updateBarChart(filteredTransactions);
        updateMonthCompare(transactions);
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

  // بعد
// ------------------------------
// PERIOD BUTTONS
// ------------------------------
const periodIndicator = document.getElementById("periodIndicator");

function movePeriodIndicator(button) {
    if (!periodIndicator || !button) return;
    periodIndicator.style.left = button.offsetLeft + "px";
    periodIndicator.style.width = button.offsetWidth + "px";
}

document.querySelectorAll(".period-btn")
    .forEach(button => {
        
        button.onclick = function() {
            
            document
                .querySelectorAll(".period-btn")
                .forEach(btn =>
                    btn.classList.remove("active")
                );
            
            button.classList.add("active");
            
            movePeriodIndicator(button);
            
            currentPeriod =
                button.dataset.period;
            
            updateStatistics();
            
        };
        
    });

movePeriodIndicator(document.querySelector(".period-btn.active"));

    // ------------------------------
    // Initialize
    // ------------------------------
    updateStatistics();
}