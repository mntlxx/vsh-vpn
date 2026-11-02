const tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
}

const phrases = [
    "Изучаем логи...",
    "Подключаемся к серверу...",
    "Загружаем интерфейс...",
    "Готовим данные...",
    "Отличного дня...",
    "Ищем лазейки..."
];

const loadingText = document.getElementById("loading-text");
const loadingScreen = document.getElementById("loading-screen");
const appContainer = document.getElementById("app-container");

// Получаем Telegram ID пользователя (или дефолтный для локального теста)
const userId = tg?.initDataUnsafe?.user?.id || 1240523155;
const userIdDisplay = document.getElementById('user-id-display');
if (userIdDisplay) {
    userIdDisplay.textContent = userId;
}

// Переключение рандомных фраз при загрузке
const intervalId = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    if (loadingText) loadingText.textContent = phrases[randomIndex];
}, 1200);

// Запрос данных с бэкенда FastAPI (работа с 3x-ui / БД)
// Запрос данных с бэкенда FastAPI (работа с 3x-ui / БД)
fetch(`/api/get_config/${userId}`)
    .then(async res => {
        if (res.status === 404 || res.status === 403) {
            throw new Error("ACCESS_DENIED");
        }
        return res.json();
    })
    .then(data => {
        if (data.access_denied) {
            throw new Error("ACCESS_DENIED");
        }

        // --- ТВОЙ ОБЫЧНЫЙ КОД ОТРИСОВКИ ПРИЛОЖЕНИЯ ---
        const subInput = document.getElementById('sub_link');
        if (subInput) subInput.value = data.sub_link || '';

        const usedBytes = document.getElementById('stat-used-bytes');
        const downEl = document.getElementById('stat-down');
        const upEl = document.getElementById('stat-up');
        const daysEl = document.getElementById('stat-days');
        const expireEl = document.getElementById('stat-expire');
        const statusBadge = document.getElementById('sub-status-badge');
        
        if (usedBytes) usedBytes.textContent = data.used_bytes || '0.00';
        if (downEl) downEl.textContent = data.download || '0.00 GB';
        if (upEl) upEl.textContent = data.upload || '0.00 GB';
        if (daysEl) daysEl.textContent = data.expire_days || '∞';
        if (expireEl) expireEl.textContent = data.expire_date || 'Бессрочно';
        
        if (statusBadge) {
            statusBadge.textContent = data.status || 'Активна';
            if (data.status === 'Неактивна' || data.status === 'Отключена') {
                statusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
                statusBadge.style.color = '#f87171';
            }
        }

        // Отрисовка профиля...
        const profileContainer = document.getElementById('profile-cards-container');
        if (profileContainer) {
            const isActive = Boolean(data.is_active);
            const subStatusColor = isActive ? '#34d399' : '#f87171';
            const subStatusText = isActive ? 'Активна' : 'Неактивна';

            if (isActive) {
                profileContainer.innerHTML = `
                    <div class="card">
                        <div class="card-header">
                            <h3>Информация аккаунта</h3>
                        </div>
                        <p class="small">Telegram ID: <span style="color: #60a5fa;">${userId}</span></p>
                        <p class="small" style="margin-bottom: 0;">Статус подписки: <span style="color: ${subStatusColor}; font-weight: 600;">${subStatusText}</span></p>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <h3>Warp-программа</h3>
                            <span class="badge">Beta</span>
                        </div>
                        <p class="small">Кросс-подписка для подключения семьи и друзей без перегрузки личного трафика.</p>
                        <button class="btn-copy" onclick="showToast('Подключение Warp в разработке')">Подключить Warp</button>
                    </div>
                `;
            } else {
                profileContainer.innerHTML = `
                    <div class="card">
                        <div class="card-header">
                            <h3>Информация аккаунта</h3>
                        </div>
                        <p class="small">Telegram ID: <span style="color: #60a5fa;">${userId}</span></p>
                        <p class="small" style="margin-bottom: 0;">Статус подписки: <span style="color: ${subStatusColor}; font-weight: 600;">${subStatusText}</span></p>
                    </div>
                    <div class="card" style="border-color: rgba(239, 68, 68, 0.3);">
                        <div class="card-header">
                            <h3>Подписка неактивна</h3>
                            <span class="badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171;">Требуется продление</span>
                        </div>
                        <p class="small" style="line-height: 1.5; margin-bottom: 12px;">
                            У вашего аккаунта истек срок действия подписки или доступ был временно приостановлен. Для активации или продления доступа обратитесь к администратору:
                        </p>
                        <a href="https://t.me/${(data.support_username || 'support').replace('@', '')}" target="_blank" class="btn-copy" style="display: block; text-align: center; text-decoration: none; background: #3b82f6; color: white; padding: 10px; border-radius: 8px; font-weight: 600;">
                            Написать в поддержку (${data.support_username || '@support'})
                        </a>
                    </div>
                `;
            }
        }

        clearInterval(intervalId);
        if (appContainer) appContainer.style.display = 'flex';

        requestAnimationFrame(() => {
            const mainPage = document.getElementById('page-main');
            if (mainPage) mainPage.classList.add('show-up');
            if (loadingScreen) loadingScreen.classList.add('hide-up');
        });

        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = 'none';
        }, 600);
    })
    .catch(err => {
        if (err.message === "ACCESS_DENIED") {
            // Мгновенно перенаправляем на отдельную страницу-заглушку
            window.location.href = "/403";
        } else {
            console.error("Ошибка связи с сервером:", err);
            clearInterval(intervalId);
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (loadingText) loadingText.textContent = "Ошибка связи с сервером";
        }
    });

fetch('/api/system_status')
    .then(res => res.json())
    .then(statusData => {
        const container = document.getElementById('servers-list-container');
        if (!container || !statusData.servers) return;

        container.innerHTML = ''; // Очищаем статику

        for (const key in statusData.servers) {
            const server = statusData.servers[key];
            const isOnline = server.status === 'online';
            const pillClass = isOnline ? 'online' : 'offline';
            const pillText = isOnline ? 'Онлайн' : 'Оффлайн';

            // Генерируем карточку сервера точно в таком же дизайне, как у тебя
            container.innerHTML += `
                <div class="status-row">
                    <div class="status-info">
                        <span class="status-name">${server.name}</span>
                        <span class="status-sub">${server.protocol.toUpperCase()} • Порт: ${server.port}</span>
                    </div>
                    <span class="status-pill ${pillClass}">${pillText}</span>
                </div>
            `;
        }
    })
    .catch(err => console.error("Ошибка загрузки статусов серверов:", err));

// 3. Динамическое заполнение вкладки "Профиль" в зависимости от подписки
const profileContainer = document.getElementById('profile-cards-container');
if (profileContainer) {
    // Жестко приводим к булевому типу
    const isActive = data.is_active === true || data.is_active === 1 || data.is_active === "1";
    
    // Вычисляем цвет и текст СТРОГО на основе isActive, игнорируя чужие поля
    const subStatusColor = isActive ? '#34d399' : '#f87171';
    const subStatusText = isActive ? 'Активна' : 'Неактивна';
    if (isActive) {
        // Карточки для АКТИВНОЙ подписки
        profileContainer.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>Информация об аккаунте</h3>
                </div>
                <p class="small">Telegram ID: <span style="color: #60a5fa;">${userId}</span></p>
                <p class="small" style="margin-bottom: 0;">Статус подписки: <span style="color: ${subStatusColor}; font-weight: 600;">${subStatusText}</span></p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>Устройства</h3>
                </div>
                <p class="small">Привязанных активных клиентов: <strong>1 / 10</strong></p>
                <button class="btn-copy" onclick="showToast('Сброс ключей выполнен')">Сбросить активные сессии</button>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3>Warp-программа</h3>
                    <span class="badge">Beta</span>
                </div>
                <p class="small">Кросс-подписка для подключения семьи и друзей без перегрузки личного трафика.</p>
                <button class="btn-copy" onclick="showToast('Подключение Warp в разработке')">Подключить Warp</button>
            </div>
        `;
    } else {
        // Карточки для НЕАКТИВНОЙ подписки
        profileContainer.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>Информация об аккаунте</h3>
                </div>
                <p class="small">Telegram ID: <span style="color: #60a5fa;">${userId}</span></p>
                <p class="small" style="margin-bottom: 0;">Статус подписки: <span style="color: ${subStatusColor}; font-weight: 600;">${subStatusText}</span></p>
            </div>
            <div class="card" style="border-color: rgba(239, 68, 68, 0.3);">
                <div class="card-header">
                    <h3>Подписка неактивна</h3>
                    <span class="badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171;">Требуется продление</span>
                </div>
                <p class="small" style="line-height: 1.5; margin-bottom: 12px;">
                    У вашего аккаунта истек срок действия подписки или доступ был временно приостановлен. Для активации или продления доступа обратитесь к администратору:
                </p>
                <a href="https://t.me/${(data.support_username || 'support').replace('@', '')}" target="_blank" class="btn-copy" style="display: block; text-align: center; text-decoration: none; background: #3b82f6; color: white; padding: 10px; border-radius: 8px; font-weight: 600;">
                    Написать в поддержку (${data.support_username || '@support'})
                </a>
            </div>
        `;
    }
}