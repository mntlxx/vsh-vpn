// Всплывающие уведомления (Toast)
function showToast(message = 'Скопировано в буфер обмена!') {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

// Копирование текста из инпутов
function copyText(elementId) {
    const input = document.getElementById(elementId);
    if (!input || !input.value) return;

    input.select();
    navigator.clipboard.writeText(input.value);

    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }

    showToast('Скопировано в буфер обмена!');
}

function openYouTubeApp() {
    window.open('https://youtube.com', '_blank');
}