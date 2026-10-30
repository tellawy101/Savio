// ==============================
// storage/goals.js
// تخزين أهداف الادخار
// ==============================
// ==============================
// Savings Goals
// ==============================

const GOALS_KEY = "savioGoals";

function getGoals() {
    return safeParse(GOALS_KEY, []);
}

function saveGoals(goals) {
safeSetItem(GOALS_KEY, JSON.stringify(goals));

}