// ==============================
// autoBackup.js
// النسخ الاحتياطي التلقائي (بيشتغل لما التطبيق يتفتح)
// ==============================

const AUTO_BACKUP_ENABLED_KEY = "savioAutoBackup";
const AUTO_BACKUP_LAST_KEY = "savio_last_backup_time";
const AUTO_BACKUP_INTERVAL_DAYS = 7;

function isAutoBackupEnabled() {
    return localStorage.getItem(AUTO_BACKUP_ENABLED_KEY) === "1";
}

function setAutoBackupEnabled(enabled) {
    if (enabled) {
        localStorage.setItem(AUTO_BACKUP_ENABLED_KEY, "1");
    } else {
        localStorage.removeItem(AUTO_BACKUP_ENABLED_KEY);
    }
}

function buildBackupPayload() {
    const backup = {};

    BACKUP_KEYS.forEach(function (key) {
        const value = localStorage.getItem(key);
        if (value !== null) backup[key] = value;
    });

    return {
        app: "Savio",
        version: 1,
        exportedAt: new Date().toISOString(),
        data: backup
    };
}

async function saveAutoBackup() {

    if (!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SaveToDownloads)) {
        return false;
    }

    const now = new Date();
    const fileName = "savio-auto-backup-" + now.toISOString().slice(0, 10) + ".json";

    try {
        await window.Capacitor.Plugins.SaveToDownloads.save({
            fileName: fileName,
            content: JSON.stringify(buildBackupPayload(), null, 2)
        });

        localStorage.setItem(AUTO_BACKUP_LAST_KEY, now.toISOString());

        showToast(t("autobackup_done_toast"), "success");

        return true;

    } catch (err) {
        console.warn("Auto backup error:", err);
        return false;
    }
}

function isAutoBackupDue() {
    const last = localStorage.getItem(AUTO_BACKUP_LAST_KEY);

    if (!last) return true;

    const lastTime = new Date(last).getTime();

    if (isNaN(lastTime)) return true;

    const intervalMs = AUTO_BACKUP_INTERVAL_DAYS * 24 * 60 * 60 * 1000;

    return (Date.now() - lastTime) >= intervalMs;
}

function runAutoBackupIfNeeded() {
    if (!isAutoBackupEnabled()) return;
    if (!isAutoBackupDue()) return;

    saveAutoBackup();
}