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
    accountsWithBalance.forEach(account => {
      const item = document.createElement("div");
      item.className = "account-item account-detail-item";
      
      item.innerHTML = `
                <div class="account-item-icon">${account.icon}</div>
                <div class="account-info">
                    <div class="account-name">${account.name}</div>
                    <div class="account-activity">
                        <span class="activity-income">↗ ${Math.round(account.income).toLocaleString("en-US")}</span>
                        <span class="activity-expense">↘ ${Math.round(account.expense).toLocaleString("en-US")}</span>
                    </div>
                </div>
                <div class="account-balance-detail">
                    EGP ${Math.round(account.currentBalance).toLocaleString("en-US")}
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
}

renderAccountsPage();