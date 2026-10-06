// ==============================
// notifications.js
// أدوات التنبيهات المحلية (مشتركة بين كل أنواع التنبيهات)
// ==============================

function getLocalNotifications() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
        return window.Capacitor.Plugins.LocalNotifications;
    }
    return null;
}

async function requestNotificationPermission() {
    const plugin = getLocalNotifications();
    if (!plugin) return false;

    try {
        const status = await plugin.checkPermissions();
        if (status.display === "granted") return true;

        const result = await plugin.requestPermissions();
        return result.display === "granted";
    } catch (error) {
        console.error("Notification permission error:", error);
        return false;
    }
}

async function sendNotificationNow(id, title, body) {
    const plugin = getLocalNotifications();
    if (!plugin) return;

    const allowed = await requestNotificationPermission();
    if (!allowed) return;

    try {
                await plugin.createChannel({
            id: "savio_alerts",
            name: "Savio Alerts",
            importance: 5,
            visibility: 1,
            vibration: true
        });
        await plugin.schedule({
                        notifications: [{ id: id, title: title, body: body, channelId: "savio_alerts" }]
        });
    } catch (error) {
        console.error("Notification send error:", error);
    }
}