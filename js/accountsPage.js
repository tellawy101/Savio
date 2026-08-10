applyStoredTheme();

const backBtn = document.getElementById("backBtn");

backBtn.onclick = function() {
  window.location.href = "../index.html";
};

const openAddAccountBtn = document.getElementById("openAddAccountBtn");

if (openAddAccountBtn) {
  openAddAccountBtn.onclick = function() {
    document.getElementById("addAccountModal").classList.add("show");
  };
}

window.onFormFieldChanged = renderAccountsPage;

function getAccountActivity(accountKey, transactions) {
  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    if (t.account !== accountKey) return;
    if (t.type === "income") {
      income += Number(t.amount) || 0;
    } else if (t.type === "expense") {
      expense += Number(t.amount) || 0;
    }
  });

  return { income, expense };
}

function renderAccountsPage() {
  const container = document.getElementById("accountsContainer");
  if (!container) return;

  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  const transactions = loadTransactions();

  const accountsWithBalance = accounts.map(account => {
    const key = `${account.icon} ${account.name}`;
    const { income, expense } = getAccountActivity(key, transactions);
    const currentBalance = Number(account.balance) + income - expense;
    return { ...account, income, expense, currentBalance };
  });

  const totalBalance = accountsWithBalance.reduce((sum, a) => sum + a.currentBalance, 0);

  container.innerHTML = "";

  const summary = document.createElement("div");
  summary.className = "balance-card";
  summary.innerHTML = `
        <h3>Total Balance</h3>
        <h1 id="accountsTotalBalance">
            <span class="currency">EGP</span>
            <span class="amount">${Math.round(totalBalance).toLocaleString("en-US")}</span>
        </h1>
    `;
  container.appendChild(summary);

  const list = document.createElement("div");
  list.className = "accounts-list";

  if (accountsWithBalance.length === 0) {
    list.innerHTML = `
            <p class="accounts-empty">
                لسه معندكش حسابات. دوس على + فوق عشان تضيف أول حساب.
            </p>
        `;
  } else {
    accountsWithBalance.forEach((account, index) => {
      const netBalance = account.income - account.expense;
      const isMain = index === 0;

      const item = document.createElement("div");
      item.className = "account-card";

      item.innerHTML = `
        <div class="account-card-top">
          <div class="account-avatar">
            <i data-lucide="${account.icon}"></i>
          </div>
          <div class="account-card-info">
            <div class="account-name">${account.name}</div>
            ${isMain ? `
              <div class="account-main-badge">
                <i data-lucide="badge-check"></i>
                <span>Main Account</span>
              </div>
            ` : `
              <div class="account-sub-name">${account.description || ""}</div>
            `}
          </div>
          <div class="account-card-balance">
            <div class="account-card-balance-amount">${account.currentBalance.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <div class="account-card-balance-currency">EGP</div>
          </div>
        </div>

        <div class="account-divider"></div>

        <div class="account-stats-row">
          <div class="stat-item">
            <div class="stat-icon stat-icon-income">
              <i data-lucide="arrow-up-right"></i>
            </div>
            <div class="stat-texts">
              <div class="stat-label">Income</div>
              <div class="stat-value stat-value-income">${account.income.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div class="stat-currency">EGP</div>
            </div>
            <svg class="stat-sparkline" viewBox="0 0 60 24" preserveAspectRatio="none">
              <polyline points="0,20 15,16 30,14 45,8 60,4" fill="none" stroke="#16a34a" stroke-width="2"/>
            </svg>
          </div>

          <div class="stat-item">
            <div class="stat-icon stat-icon-expense">
              <i data-lucide="arrow-down-right"></i>
            </div>
            <div class="stat-texts">
              <div class="stat-label">Expense</div>
              <div class="stat-value stat-value-expense">${account.expense.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div class="stat-currency">EGP</div>
            </div>
            <svg class="stat-sparkline" viewBox="0 0 60 24" preserveAspectRatio="none">
              <polyline points="0,4 15,8 30,10 45,16 60,20" fill="none" stroke="#dc2626" stroke-width="2"/>
            </svg>
          </div>

          <div class="stat-item stat-item-last">
            <div class="stat-icon stat-icon-balance">
              <i data-lucide="wallet"></i>
            </div>
            <div class="stat-texts">
              <div class="stat-label">Net Balance</div>
              <div class="stat-value stat-value-balance">${netBalance.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div class="stat-currency">EGP</div>
            </div>
          </div>

          <div class="account-corner-icon">
            <i data-lucide="scale"></i>
          </div>
        </div>
      `;

      let pressTimer;
      item.addEventListener("touchstart", function() {
        pressTimer = setTimeout(function() {
          selectedAccount = account.name;
          document.getElementById("accountMenu").classList.add("show");
        }, 700);
      });
      item.addEventListener("touchend", function() {
        clearTimeout(pressTimer);
      });
      item.addEventListener("touchmove", function() {
        clearTimeout(pressTimer);
      });
      item.onclick = function() {
        selectedAccount = account.name;
        document.getElementById("accountMenu").classList.add("show");
      };

      list.appendChild(item);
    });
  }

  container.appendChild(list);

  if (window.lucide) lucide.createIcons();
}

renderAccountsPage();