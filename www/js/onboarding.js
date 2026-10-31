// ==============================
// onboarding.js
// شاشة الترحيب (أول مرة بس)
// ==============================
const ONBOARDING_KEY = "onboardingDone";

const ONBOARDING_TEXT = {
    ar: {
        currencyTitle: "اختار عملتك",
        currencySub: "كل المبالغ هتظهر بيها",
        accountTitle: "اعمل أول حساب",
        accountSub: "مثلًا كاش أو حساب البنك",
        accountName: "اسم الحساب",
        accountDefault: "كاش",
        accountBalance: "الرصيد الحالي",
        budgetTitle: "ميزانية الشهر",
        budgetSub: "اختياري، وتقدر تغيرها بعدين",
        budgetPlaceholder: "مثلًا 5000",
        next: "التالي",
        start: "ابدأ",
        skip: "تخطي"
    },
    en: {
        currencyTitle: "Pick your currency",
        currencySub: "All amounts will use it",
        accountTitle: "Create your first account",
        accountSub: "For example Cash or your bank",
        accountName: "Account name",
        accountDefault: "Cash",
        accountBalance: "Current balance",
        budgetTitle: "Monthly budget",
        budgetSub: "Optional, you can change it later",
        budgetPlaceholder: "e.g. 5000",
        next: "Next",
        start: "Start",
        skip: "Skip"
    }
};

function showOnboardingIfNeeded() {
    try {
        if (localStorage.getItem(ONBOARDING_KEY)) return;
        if (getAccounts().length > 0 || loadTransactions().length > 0) {
            safeSetItem(ONBOARDING_KEY, "1");
            return;
        }
        startOnboarding();
    } catch (e) {
        console.error("Onboarding failed:", e);
    }
}

function startOnboarding() {
    const L = ONBOARDING_TEXT[getLanguage()] || ONBOARDING_TEXT.en;
    const currencies = ["EGP", "USD", "EUR", "SAR", "AED"];
    const state = { step: 0, currency: getCurrency() };

    const overlay = document.createElement("div");
    overlay.className = "ob-overlay";
    document.body.appendChild(overlay);

    function finish() {
        safeSetItem(ONBOARDING_KEY, "1");
        overlay.remove();
        navigateTo("home");
    }

    function toNumber(value) {
        return Number(String(value).replace(/,/g, "")) || 0;
    }

    function render() {
        const dots = [0, 1, 2].map(function (i) {
            return `<span class="ob-dot ${i === state.step ? "active" : ""}"></span>`;
        }).join("");

        let body = "";
        if (state.step === 0) {
            body = `
                <h2>${L.currencyTitle}</h2>
                <p>${L.currencySub}</p>
                <div class="ob-chips">
                    ${currencies.map(function (c) {
                        return `<button type="button" class="ob-chip ${state.currency === c ? "active" : ""}" data-cur="${c}">${c}</button>`;
                    }).join("")}
                </div>`;
        } else if (state.step === 1) {
            body = `
                <h2>${L.accountTitle}</h2>
                <p>${L.accountSub}</p>
                <input id="obAccName" class="ob-input" type="text" value="${L.accountDefault}" placeholder="${L.accountName}">
                <input id="obAccBalance" class="ob-input" type="text" inputmode="decimal" placeholder="${L.accountBalance}">`;
        } else {
            body = `
                <h2>${L.budgetTitle}</h2>
                <p>${L.budgetSub}</p>
                <input id="obBudget" class="ob-input" type="text" inputmode="decimal" placeholder="${L.budgetPlaceholder}">`;
        }

        overlay.innerHTML = `
            <div class="ob-top">
                <div class="ob-dots">${dots}</div>
                <button type="button" class="ob-skip" id="obSkip">${L.skip}</button>
            </div>
            <div class="ob-body">${body}</div>
            <button type="button" class="ob-next" id="obNext">${state.step === 2 ? L.start : L.next}</button>
        `;

        overlay.querySelectorAll(".ob-chip").forEach(function (chip) {
            chip.onclick = function () {
                hapticTap();
                state.currency = chip.dataset.cur;
                render();
            };
        });

        document.getElementById("obSkip").onclick = finish;

        document.getElementById("obNext").onclick = function () {
            hapticTap();
            if (state.step === 0) {
                setCurrency(state.currency);
                state.step = 1;
                render();
            } else if (state.step === 1) {
                const name = document.getElementById("obAccName").value.trim();
                const balance = toNumber(document.getElementById("obAccBalance").value);
                if (name) {
                    const accounts = getAccounts();
                    accounts.push({
                        id: generateId("acc"),
                        name: name,
                        description: "",
                        icon: "wallet",
                        balance: balance
                    });
                    saveAccounts(accounts);
                }
                state.step = 2;
                render();
            } else {
                const budget = toNumber(document.getElementById("obBudget").value);
                if (budget > 0) saveBudget(budget);
                hapticSuccess();
                finish();
            }
        };
    }

    render();
}