// ==============================================================
// screens/goalsPage.js
// كل منطق صفحة أهداف التوفير مجمّع في دالة واحدة initGoalsPage()
// بتتنادى يدويًا من الراوتر بعد ما محتوى الصفحة يتحقن جوه #app
// ==============================================================

function initGoalsPage() {

    // ------------------------------
    // العناصر
    // ------------------------------
    const addGoalBtn = document.getElementById("addGoalBtn");
    const goalsList = document.getElementById("goalsList");
    const goalModal = document.getElementById("goalModal");
    const goalNameInput = document.getElementById("goalName");
    const goalTargetInput = document.getElementById("goalTarget");
    const goalCurrentInput = document.getElementById("goalCurrent");
    const goalDateInput = document.getElementById("goalDate");
    const goalDateText = document.getElementById("goalDateText");
    const cancelGoalBtn = document.getElementById("cancelGoalBtn");
    const saveGoalBtn = document.getElementById("saveGoalBtn");

    const goalMoneyModal = document.getElementById("goalMoneyModal");
    const goalMoneyAmountInput = document.getElementById("goalMoneyAmount");
    const cancelGoalMoneyBtn = document.getElementById("cancelGoalMoneyBtn");
    const confirmGoalMoneyBtn = document.getElementById("confirmGoalMoneyBtn");

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
    // RENDER GOALS
    // ------------------------------
    function renderGoals() {

        if (!goalsList) {
            return;
        }

        const goals = getGoals();
        const summaryEl = document.getElementById("goalsSummary");
        const subtitleEl = document.getElementById("goalsSubtitle");
        const doneCount = goals.filter(g => Number(g.target) > 0 && Number(g.current) >= Number(g.target)).length;
        const totalSaved = goals.reduce((s, g) => s + (Number(g.current) || 0), 0);
        const totalTarget = goals.reduce((s, g) => s + (Number(g.target) || 0), 0);
        const totalPercent = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

        if (subtitleEl) {
            subtitleEl.textContent = goals.length
                ? `${goals.length} ${t("goals_count_label")} · ${doneCount} ${t("goals_done_label")}`
                : "";
        }

        if (summaryEl) {
            summaryEl.innerHTML = goals.length ? `
            <div class="goals-summary-card">
                <span class="goals-summary-label">${t("goals_total_saved")}</span>
                <div class="goals-summary-value">${formatCurrency(totalSaved)}</div>
                <div class="goal-progress"><div class="goal-progress-fill" style="width: ${totalPercent}%"></div></div>
                <span class="goals-summary-sub">${totalPercent}% ${t("goals_total_progress")}</span>
            </div>` : "";
        }
        if (!goals.length) {

            goalsList.innerHTML = `
            <div class="empty-stat">
                <i data-lucide="target"></i>
                <span>${t("goals_empty")}</span>
            </div>
            `;

            if (window.lucide) lucide.createIcons({ root: goalsList });

            return;
        }

        const locale = getLanguage() === "ar" ? "ar-EG" : "en-US";

        goalsList.innerHTML = goals.map(goal => {

            const target = Number(goal.target) || 0;
            const current = Number(goal.current) || 0;

            const percent = target > 0
                ? Math.min(100, Math.round((current / target) * 100))
                : 0;

            const done = target > 0 && current >= target;

            let dateText = "";

            if (goal.date) {
                const parts = goal.date.split("-").map(Number);

                if (parts.length === 3 && !parts.some(Number.isNaN)) {
                    dateText = new Date(parts[0], parts[1] - 1, parts[2])
                        .toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
                }
            }

                        return `
            <div class="goal-card ${done ? "goal-done" : ""}">

                <div class="goal-top">
                    <div class="goal-icon"><i data-lucide="${done ? "check" : "target"}"></i></div>
                    <div class="goal-info">
                        <span class="goal-name">${escapeHTML(goal.name)}</span>
                        <span class="goal-amounts-text">${formatCurrency(current)} ${t("goals_saved_of")} ${formatCurrency(target)}</span>
                    </div>
                    ${done
                        ? `<span class="goal-badge">${t("goals_done_label")}</span>`
                        : `<span class="goal-percent">${percent}%</span>`}
                </div>

                <div class="goal-progress">
                    <div class="goal-progress-fill" style="width: ${percent}%"></div>
                </div>

                ${dateText ? `<div class="goal-date"><i data-lucide="calendar"></i><span>${dateText}</span></div>` : ""}

                <div class="goal-actions">
                    <button class="goal-btn goal-add-btn" data-id="${goal.id}"><i data-lucide="plus"></i><span>${t("goals_deposit")}</span></button>
                    <button class="goal-btn goal-delete-btn" data-id="${goal.id}"><i data-lucide="trash-2"></i></button>
                </div>

            </div>
            `;

        }).join("");

        if (window.lucide) lucide.createIcons({ root: goalsList });
    }

    // ------------------------------
    // Initialize
    // ------------------------------
    renderGoals();

    // ------------------------------
    // MODALS (فتح وقفل مودال إضافة الهدف)
    // ------------------------------
        if (goalDateInput) {
        goalDateInput.onchange = function () {
            syncDateText(goalDateInput, goalDateText);
        };
    }
    if (addGoalBtn && goalModal) {
        addGoalBtn.onclick = function () {

            if (goalNameInput) goalNameInput.value = "";
            if (goalTargetInput) goalTargetInput.value = "";
            if (goalCurrentInput) goalCurrentInput.value = "";
                        if (goalDateInput) goalDateInput.value = getTodayDateString();
              syncDateText(goalDateInput, goalDateText);
            goalModal.classList.add("show");
        };
    }
if (saveGoalBtn) {
        saveGoalBtn.onclick = async function () {

            const name = goalNameInput ? goalNameInput.value.trim() : "";
            const target = goalTargetInput ? Number(goalTargetInput.value) : 0;
            const current = goalCurrentInput ? Number(goalCurrentInput.value) || 0 : 0;
            const date = goalDateInput ? goalDateInput.value : "";

            if (name === "") {
                await customAlert("Please enter goal name");
                if (goalNameInput) goalNameInput.focus();
                return;
            }

            if (!target || target <= 0) {
                await customAlert("Please enter a valid target amount");
                if (goalTargetInput) goalTargetInput.focus();
                return;
            }

            if (current < 0) {
                await customAlert("Please enter a valid amount");
                if (goalCurrentInput) goalCurrentInput.focus();
                return;
            }

            const goals = getGoals();

            goals.push({
                id: Date.now(),
                name: name,
                target: target,
                current: current,
                date: date
            });

            saveGoals(goals);
            renderGoals();

            if (goalModal) goalModal.classList.remove("show");

            showToast("Goal Added", "success");
        };
    }
    if (cancelGoalBtn && goalModal) {
        cancelGoalBtn.onclick = function () {
            goalModal.classList.remove("show");
        };
    }

    if (goalModal) {
        goalModal.onclick = function (e) {
            if (e.target === goalModal) goalModal.classList.remove("show");
        };
    }
    // ------------------------------
    // ADD MONEY TO GOAL
    // ------------------------------
    let selectedGoalId = null;

    if (goalsList) {
        goalsList.onclick = function (e) {
const deleteBtn = e.target.closest(".goal-delete-btn");

            if (deleteBtn) {
                const goalId = deleteBtn.dataset.id;

                customConfirm("Are you sure you want to delete this goal?", { danger: true }).then(function (confirmed) {

                    if (!confirmed) return;

                    const goals = getGoals().filter(g => String(g.id) !== String(goalId));

                    saveGoals(goals);
                    renderGoals();

                    showToast("Goal Deleted", "success");
                });

                return;
            }
            const addBtn = e.target.closest(".goal-add-btn");

            if (addBtn && goalMoneyModal) {
                selectedGoalId = addBtn.dataset.id;

                if (goalMoneyAmountInput) goalMoneyAmountInput.value = "";

                goalMoneyModal.classList.add("show");
            }
        };
    }

    if (cancelGoalMoneyBtn && goalMoneyModal) {
        cancelGoalMoneyBtn.onclick = function () {
            goalMoneyModal.classList.remove("show");
        };
    }

    if (goalMoneyModal) {
        goalMoneyModal.onclick = function (e) {
            if (e.target === goalMoneyModal) goalMoneyModal.classList.remove("show");
        };
    }

    if (confirmGoalMoneyBtn) {
        confirmGoalMoneyBtn.onclick = async function () {

            const amount = goalMoneyAmountInput ? Number(goalMoneyAmountInput.value) : 0;

            if (!amount || amount <= 0) {
                await customAlert("Please enter a valid amount");
                if (goalMoneyAmountInput) goalMoneyAmountInput.focus();
                return;
            }

            const goals = getGoals();
            const goal = goals.find(g => String(g.id) === String(selectedGoalId));

            if (!goal) {
                goalMoneyModal.classList.remove("show");
                return;
            }

                        const wasDone = (Number(goal.current) || 0) >= Number(goal.target);
            goal.current = (Number(goal.current) || 0) + amount;
            const nowDone = goal.current >= Number(goal.target);
            
            saveGoals(goals);
            
            if (nowDone && !wasDone) {
                sendNotificationNow(
                    Date.now() % 2147483647,
                    "🎉 " + goal.name,
                    t("goals_completed")                );
            }
            renderGoals();

            goalMoneyModal.classList.remove("show");

            showToast("Amount Added", "success");
        };
    }
}