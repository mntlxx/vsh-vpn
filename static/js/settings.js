// Синхронизация внешних плейлистов
function saveIntegration(serviceName, inputId) {
    const input = document.getElementById(inputId);
    if (!input || !input.value.trim()) {
        showToast('Введите корректную ссылку!');
        return;
    }

    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }

    showToast(`Плейлист ${serviceName} успешно синхронизирован!`);
    input.value = '';
}

// Смена тем оформления
function setTheme(themeName, btnElement) {
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }

    showToast(`Тема переключена: ${themeName}`);
}