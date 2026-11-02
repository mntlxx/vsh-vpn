// Хранилище состояния текущего выбранного аниме
let currentAnimeState = {
    id: null,
    title: '',
    currentEpisode: 1,
    currentDub: '',
    catalogData: null // Сюда загрузится JSON с сервера (каталог озвучек и серий)
};

/**
 * Получение Telegram ID пользователя (с поддержкой WebApp и локального фолбека)
 */
function getUserId() {
    if (typeof tg !== 'undefined' && tg?.initDataUnsafe?.user?.id) {
        return tg.initDataUnsafe.user.id;
    }
    if (typeof userId !== 'undefined') {
        return userId;
    }
    return 1240523155; // Дефолтный ID для локального теста в браузере
}

/**
 * Функция открытия детальной страницы / плеера при клике на тайтл в каталоге
 */
async function openAnimeDetail(animeId, animeTitle = 'Аниме') {
    currentAnimeState.id = animeId;
    currentAnimeState.title = animeTitle;
    currentAnimeState.currentEpisode = 1;

    // Переключаем вкладку на плеер (функция switchTab из index.js)
    if (typeof switchTab === 'function') {
        switchTab('watch');
    } else {
        document.querySelectorAll('.page-section').forEach(sec => sec.style.display = 'none');
        const watchSec = document.getElementById('page-watch');
        if (watchSec) watchSec.style.display = 'block';
    }

    // Обновляем заголовки на время загрузки
    const titleEl = document.getElementById('watch-video-title');
    const topTitleEl = document.getElementById('watch-anime-top-title');
    if (titleEl) titleEl.innerText = `${animeTitle} — Серия 1`;
    if (topTitleEl) topTitleEl.innerText = animeTitle;

    // Включаем лоадер загрузки
    const loader = document.getElementById('yt-player-loader');
    if (loader) loader.style.display = 'flex';

    try {
        // Запрашиваем реальные данные из FastAPI эндпоинта
        const response = await fetch(`/api/anime/${animeId}`);
        if (!response.ok) throw new Error("Не удалось загрузить данные аниме");
        
        currentAnimeState.catalogData = await response.json();
        
        // Если с сервера пришло точное название из базы, обновляем его
        if (currentAnimeState.catalogData.info && currentAnimeState.catalogData.info.title) {
            currentAnimeState.title = currentAnimeState.catalogData.info.title;
            if (topTitleEl) topTitleEl.innerText = currentAnimeState.title;
        }

        // Получаем список доступных озвучек из каталога
        const voices = Object.keys(currentAnimeState.catalogData.catalog || {});
        if (voices.length > 0) {
            currentAnimeState.currentDub = voices[0];
            renderDubButtons(voices);
            renderEpisodesForCurrentDub();
        } else {
            console.warn("Для этого аниме пока нет доступных озвучек в базе.");
        }

        // Загружаем плеер и отправляем прогресс
        updatePlayerAndProgress();

    } catch (error) {
        console.error("Ошибка при загрузке аниме:", error);
        if (titleEl) titleEl.innerText = "Ошибка загрузки контента";
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

/**
 * Рендеринг кнопок озвучек
 */
function renderDubButtons(voices) {
    const dubContainer = document.getElementById('dub-selector');
    if (!dubContainer) return;

    dubContainer.innerHTML = '';
    voices.forEach(dub => {
        const btn = document.createElement('button');
        btn.className = `dub-btn ${dub === currentAnimeState.currentDub ? 'active' : ''}`;
        btn.innerText = dub;
        btn.onclick = (e) => selectDub(dub, e.currentTarget);
        dubContainer.appendChild(btn);
    });
}

/**
 * Выбор озвучки пользователем
 */
function selectDub(dubName, btnElement) {
    currentAnimeState.currentDub = dubName;
    currentAnimeState.currentEpisode = 1; // Сбрасываем на 1 серию при смене озвучки

    // Подсветка активной кнопки озвучки
    document.querySelectorAll('.dub-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '#1f2937';
        btn.style.color = '#94a3b8';
    });
    
    if (btnElement) {
        btnElement.classList.add('active');
        btnElement.style.background = '#6366f1';
        btnElement.style.color = 'white';
    } else {
        // Если вызов программный, ищем кнопку по тексту
        document.querySelectorAll('.dub-btn').forEach(btn => {
            if (btn.innerText === dubName) {
                btn.classList.add('active');
                btn.style.background = '#6366f1';
                btn.style.color = 'white';
            }
        });
    }

    renderEpisodesForCurrentDub();
    updatePlayerAndProgress();
}

/**
 * Рендеринг кнопок серий на основе реальных данных из базы для выбранной озвучки
 */
function renderEpisodesForCurrentDub() {
    const episodesContainer = document.getElementById('episodes-list-bar');
    if (!episodesContainer || !currentAnimeState.catalogData) return;

    episodesContainer.innerHTML = '';
    
    const episodesList = currentAnimeState.catalogData.catalog[currentAnimeState.currentDub] || [];
    
    episodesList.forEach(epItem => {
        const btn = document.createElement('button');
        btn.innerText = epItem.episode;
        btn.className = `ep-btn ${epItem.episode === currentAnimeState.currentEpisode ? 'active' : ''}`;
        btn.style.marginRight = '5px';
        btn.style.minWidth = '40px';
        
        btn.onclick = () => selectEpisode(epItem.episode);
        episodesContainer.appendChild(btn);
    });
}

/**
 * Выбор конкретной серии
 */
function selectEpisode(epNum) {
    currentAnimeState.currentEpisode = epNum;
    
    // Обновляем визуальный активный статус у кнопок серий
    document.querySelectorAll('#episodes-list-bar .ep-btn').forEach(btn => {
        if (parseInt(btn.innerText) === epNum) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    updatePlayerAndProgress();
}

/**
 * Загрузка/обновление iframe-плеера и сохранение прогресса на бэкенд
 */
function updatePlayerAndProgress() {
    const videoContainer = document.querySelector('.video-container');
    if (!videoContainer) return;

    // Ищем существующий iframe или создаем его, если он отсутствовал
    let iframe = videoContainer.querySelector('iframe');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('allow', 'autoplay; fullscreen');
        videoContainer.appendChild(iframe);
    }

    // Ищем точную iframe-ссылку из загруженного каталога по озвучке и номеру серии
    const episodesList = currentAnimeState.catalogData.catalog[currentAnimeState.currentDub] || [];
    const targetEpisode = episodesList.find(e => e.episode === currentAnimeState.currentEpisode);

    if (targetEpisode && targetEpisode.iframe) {
        iframe.src = targetEpisode.iframe;
    } else {
        iframe.src = '';
        console.warn("⚠️ Ссылка на плеер для этой серии не найдена в базе данных.");
    }

    // Обновляем заголовок под плеером
    const titleEl = document.getElementById('watch-video-title');
    if (titleEl) {
        titleEl.innerText = `${currentAnimeState.title} — Серия ${currentAnimeState.currentEpisode}`;
    }

    // В фоне отправляем прогресс в базу данных FastAPI через user_history
    const activeUserId = getUserId();
    fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: activeUserId,
            anime_id: currentAnimeState.id,
            episode: currentAnimeState.currentEpisode
        })
    }).catch(err => console.warn("Не удалось сохранить прогресс просмотра:", err));
}

/**
 * Поиск аниме из поисковой строки каталога
 */
function searchAnime() {
    const input = document.getElementById('anime-search-input');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    console.log(`[AniGM] Поиск по запросу: ${query}`);
    // Здесь в будущем можно подключить вызов поискового API бэкенда
}

/**
 * Функция для копирования ссылки на текущую страницу
 */
function copyCurrentVideoLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert('Ссылка скопирована в буфер обмена!');
    }).catch(() => {
        alert('Не удалось скопировать ссылку.');
    });
}