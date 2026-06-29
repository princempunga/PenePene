export function isAdminDemoMode(usingDemoData) {
    return Boolean(usingDemoData);
}

export function adminDemoAlert(message = 'Données de démonstration — action simulée.') {
    window.alert(message);
}

export function blockAdminDemoAction(usingDemoData, message) {
    if (isAdminDemoMode(usingDemoData)) {
        adminDemoAlert(message);
        return true;
    }
    return false;
}
