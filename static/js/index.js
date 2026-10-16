const tg = window.Telegram.WebApp;
tg.expand();

const phrases = [
    "Изучаем логи...",
    "Подключаемся к серверу...",
    "Загружаем интерфейс...",
    "Готовим данные...",
    "Отличного дня!",
    "Ищем лазейки..."
];

const loadingText = document.getElementById("loading-text");
const loadingScreen = document.getElementById("loading-screen");
const contentScreen = document.getElementById("content");

// Переключение рандомных фраз при загрузке
const intervalId = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    if (loadingText) loadingText.textContent = phrases[randomIndex];
}, 1200);

// ==========================================
// ВРЕМЕННЫЙ СКРИПТ (Эмуляция плавного перехода)
// ==========================================
setTimeout(() => {
    // Подставляем данные
    document.getElementById('sub_link').value = 'http://123.45.67.89:2053/sub/test_sub_id_123';

    clearInterval(intervalId);

    // 1. Показываем контент под экраном загрузки
    contentScreen.style.display = 'flex';

    // 2. Анимируем: контент мягко проявляется, а лоадер плавно улетает наверх
    requestAnimationFrame(() => {
        contentScreen.classList.add('show-up');
        loadingScreen.classList.add('hide-up');
    });

    // 3. Полностью отключаем заставку после анимации
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 600);

}, 1000);

/*
// КОГДА БУДЕТ ГОТОВ БЭКЕНД — РАСКОММЕНТИРУЕШЬ ЭТОТ БЛОК:
const userId = tg.initDataUnsafe?.user?.id || 123456789;
fetch(`/api/get_config/${userId}`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('sub_link').value = data.sub_link || '';
        document.getElementById('vless_link').value = data.vless_link || '';
        
        clearInterval(intervalId);
        contentScreen.style.display = 'flex';
        
        requestAnimationFrame(() => {
            loadingScreen.classList.add('hide-up');
            contentScreen.classList.add('show-up');
        });
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 600);
    })
    .catch(err => {
        if (loadingText) loadingText.textContent = "Ошибка загрузки";
    });
*/

// Выдвижная панель меню навигации
function toggleMoreSettings() {
    const menu = document.getElementById("expanded-menu");
    const icon = document.getElementById("more-icon");

    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }

    menu.classList.toggle("open");

    if (menu.classList.contains("open")) {
        icon.style.transform = "rotate(180deg)";
    } else {
        icon.style.transform = "rotate(0deg)";
    }
}

// Обработка клика по кнопкам выдвижного меню
function onMenuClick(sectionName) {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
    showToast(`Раздел "${sectionName}" в разработке`);
}

// Копирование текста
function copyText(elementId) {
    const input = document.getElementById(elementId);
    if (!input || !input.value) return;

    input.select();
    navigator.clipboard.writeText(input.value);

    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }

    showToast('Скопировано в буфер обмена!');
}

function showToast(message = 'Скопировано в буфер обмена!') {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}