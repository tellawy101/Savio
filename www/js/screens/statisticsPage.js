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

container.innerHTML = breakdown.map(({ category, amount, percentage }) => {
            
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