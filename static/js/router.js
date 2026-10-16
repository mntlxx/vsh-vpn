// SPA ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
function switchTab(tabName) {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }

    // Скрываем все секции
    document.querySelectorAll('.page-section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('show-up');
    });

    // Показываем нужную секцию
    const targetSection = document.getElementById(`page-${tabName}`);
    if (targetSection) {
        targetSection.style.display = 'flex';
        requestAnimationFrame(() => {
            targetSection.classList.add('show-up');
        });
    }

    // Управляем подсветкой кнопок в нижнем баре
    const navMain = document.getElementById('nav-main');
    const navSettings = document.getElementById('nav-settings');

    if (navMain) navMain.classList.toggle('active', tabName === 'main');
    if (navSettings) navSettings.classList.toggle('active', tabName === 'settings');

    // Закрываем выдвижное меню при переходе
    const menu = document.getElementById("expanded-menu");
    const icon = document.getElementById("more-icon");
    if (menu && menu.classList.contains("open")) {
        menu.classList.remove("open");
        if (icon) icon.style.transform = "rotate(0deg)";
    }
}

// Выдвижная панель меню навигации
function toggleMoreSettings() {
    const menu = document.getElementById("expanded-menu");
    const icon = document.getElementById("more-icon");
    const tg = window.Telegram?.WebApp;

    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }

    if (!menu) return;
    menu.classList.toggle("open");

    if (icon) {
        if (menu.classList.contains("open")) {
            icon.style.transform = "rotate(180deg)";
        } else {
            icon.style.transform = "rotate(0deg)";
        }
    }
}

// Клик по пунктам меню в разработке
function onMenuClick(sectionName) {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
    showToast(`Раздел "${sectionName}" в разработке`);
}