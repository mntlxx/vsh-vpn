const tg = window.Telegram.WebApp;
tg.expand();

const phrases = [
    "Изучаем логи...",
    "Подключаемся к серверу...",
    "Загружаем интерфейс...",
    "Готовим данные...",
    "Отличного дня...",
    "Ищем лазейки..."
];

const userId = tg.initDataUnsafe?.user?.id || 123456789;
document.getElementById('user-id-display').textContent = userId;

const loadingText = document.getElementById("loading-text");
const loadingScreen = document.getElementById("loading-screen");
const appContainer = document.getElementById("app-container");

// Переключение рандомных фраз при загрузке
const intervalId = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    if (loadingText) loadingText.textContent = phrases[randomIndex];
}, 1200);

// ==========================================
// ЭМУЛЯЦИЯ ЗАГРУЗКИ ПРИЛОЖЕНИЯ
// ==========================================
setTimeout(() => {
    // Подставляем данные в поля главной страницы
    document.getElementById('sub_link').value = 'http://123.45.67.89:2053/sub/test_sub_id_123';
    document.getElementById('stat_link').value = 'Использовано: 14.2 GB / Безлимит';
    document.getElementById('server_status').value = 'Нидерланды (NL-01) — Онлайн (12ms)';

    clearInterval(intervalId);

    // 1. Показываем контейнер приложения
    appContainer.style.display = 'flex';

    // 2. Анимируем появление главной секции и улетание лоадера вверх
    requestAnimationFrame(() => {
        document.getElementById('page-main').classList.add('show-up');
        loadingScreen.classList.add('hide-up');
    });

    // 3. Убираем лоадер из DOM после завершения анимации
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 600);

}, 2000);

/*
// КОГДА БУДЕТ ГОТОВ БЭКЕНД — РАСКОММЕНТИРУЕШЬ ЭТОТ БЛОК:
const userId = tg.initDataUnsafe?.user?.id || 123456789;
fetch(`/api/get_config/${userId}`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('sub_link').value = data.sub_link || '';
        document.getElementById('stat_link').value = data.traffic_stats || '';
        document.getElementById('server_status').value = data.server_status || '';
        
        clearInterval(intervalId);
        appContainer.style.display = 'flex';
        
        requestAnimationFrame(() => {
            document.getElementById('page-main').classList.add('show-up');
            loadingScreen.classList.add('hide-up');
        });
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 600);
    })
    .catch(err => {
        if (loadingText) loadingText.textContent = "Ошибка загрузки";
    });
*/

// ==========================================
// SPA ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК (РОУТИНГ)
// ==========================================
function switchTab(tabName) {
    if (tg.HapticFeedback) {
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

    // Управляем подсветкой кнопок в нижнем баре (Главная и Настройки)
    const navMain = document.getElementById('nav-main');
    const navSettings = document.getElementById('nav-settings');

    navMain.classList.toggle('active', tabName === 'main');
    navSettings.classList.toggle('active', tabName === 'settings');

    // Закрываем меню при клике
    const menu = document.getElementById("expanded-menu");
    const icon = document.getElementById("more-icon");
    if (menu.classList.contains("open")) {
        menu.classList.remove("open");
        icon.style.transform = "rotate(0deg)";
    }
}

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

// Клик по пунктам меню в разработке
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

function openYouTubeApp() {
    window.open('https://youtube.com', '_blank');
}

// ==========================================
// ЛОКАЛЬНЫЙ АУДИОПЛЕЕР
// ==========================================

// Список тестовых треков из папки ../testing/player
// Можешь добавлять сюда свои файлы по мере необходимости
const playlistTracks = [
    { title: "Тестовый трек 1", file: "../testing/player/track1.mp3", format: "MP3" },
    { title: "Электронный вайб", file: "../testing/player/track2.wav", format: "WAV" },
    { title: "Космический эмбиент", file: "../testing/player/track3.ogg", format: "OGG" },
    { title: "Тестовый трек 1", file: "../testing/player/track1.mp3", format: "MP3" },
    { title: "Электронный вайб", file: "../testing/player/track2.wav", format: "WAV" },
    { title: "Космический эмбиент", file: "../testing/player/track3.ogg", format: "OGG" },
    { title: "Тестовый трек 1", file: "../testing/player/track1.mp3", format: "MP3" },
    { title: "Электронный вайб", file: "../testing/player/track2.wav", format: "WAV" },
    { title: "Космический эмбиент", file: "../testing/player/track3.ogg", format: "OGG" },
    { title: "Тестовый трек 1", file: "../testing/player/track1.mp3", format: "MP3" },
    { title: "Электронный вайб", file: "../testing/player/track2.wav", format: "WAV" },
    { title: "Космический эмбиент", file: "../testing/player/track3.ogg", format: "OGG" },
    { title: "Тестовый трек 1", file: "../testing/player/track1.mp3", format: "MP3" },
    { title: "Электронный вайб", file: "../testing/player/track2.wav", format: "WAV" },
    { title: "Космический эмбиент", file: "../testing/player/track3.ogg", format: "OGG" },
    { title: "Тестовый трек 1", file: "../testing/player/track1.mp3", format: "MP3" },
    { title: "Электронный вайб", file: "../testing/player/track2.wav", format: "WAV" },
    { title: "Космический эмбиент", file: "../testing/player/track3.ogg", format: "OGG" },
    { title: "Тестовый трек 1", file: "../testing/player/track1.mp3", format: "MP3" },
    { title: "Электронный вайб", file: "../testing/player/track2.wav", format: "WAV" },
    { title: "Космический эмбиент", file: "../testing/player/track3.ogg", format: "OGG" },
    { title: "Тестовый трек 1", file: "../testing/player/track1.mp3", format: "MP3" },
    { title: "Электронный вайб", file: "../testing/player/track2.wav", format: "WAV" },
    { title: "Космический эмбиент", file: "../testing/player/track3.ogg", format: "OGG" },
];

let currentTrackIndex = 0;
const audioElement = new Audio();
let isPlaying = false;

// Инициализация плейлиста при загрузке
function initPlayer() {
    const playlistContainer = document.getElementById("playlist");
    if (!playlistContainer) return;

    playlistContainer.innerHTML = "";

    playlistTracks.forEach((track, index) => {
        const item = document.createElement("div");
        item.className = `playlist-item ${index === currentTrackIndex ? 'active' : ''}`;
        item.innerHTML = `
            <span>${track.title}</span>
            <span class="format-badge">${track.format}</span>
        `;
        item.onclick = () => selectAndPlayTrack(index);
        playlistContainer.appendChild(item);
    });

    if (playlistTracks.length > 0) {
        audioElement.src = playlistTracks[0].file;
        document.getElementById("current-track-title").textContent = playlistTracks[0].title;
    }
}

// Выбор и запуск трека из списка
function selectAndPlayTrack(index) {
    currentTrackIndex = index;
    audioElement.src = playlistTracks[index].file;
    document.getElementById("current-track-title").textContent = playlistTracks[index].title;
    
    playTrack();
    updatePlaylistUI();
}

// Воспроизведение / Пауза
function togglePlay() {
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

function playTrack() {
    audioElement.play().then(() => {
        isPlaying = true;
        document.getElementById("play-btn").textContent = "⏸";
        if (window.Telegram?.WebApp?.HapticFeedback) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }).catch(err => {
        console.error("Ошибка воспроизведения:", err);
        showToast("Файл трека не найден в testing/player");
    });
}

function pauseTrack() {
    audioElement.pause();
    isPlaying = false;
    document.getElementById("play-btn").textContent = "▶";
}

// Следующий / Предыдущий трек
function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlistTracks.length;
    selectAndPlayTrack(currentTrackIndex);
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + playlistTracks.length) % playlistTracks.length;
    selectAndPlayTrack(currentTrackIndex);
}

// Обновление подсветки активного трека в списке
function updatePlaylistUI() {
    const items = document.querySelectorAll(".playlist-item");
    items.forEach((item, index) => {
        if (index === currentTrackIndex) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

// Форматирование времени (секунды -> мм:сс)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Отслеживание прогресса трека
audioElement.addEventListener("timeupdate", () => {
    if (audioElement.duration) {
        const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
        document.getElementById("progress-bar").style.width = `${progressPercent}%`;
        
        document.getElementById("current-time").textContent = formatTime(audioElement.currentTime);
        document.getElementById("total-duration").textContent = formatTime(audioElement.duration);
    }
});

// Автоматический переход к следующему треку по окончании
audioElement.addEventListener("ended", () => {
    nextTrack();
});

// Перемотка кликом по шкале
function seekTrack(event) {
    const container = event.currentTarget;
    const clickX = event.offsetX;
    const width = container.clientWidth;
    const percent = clickX / width;
    
    if (audioElement.duration) {
        audioElement.currentTime = percent * audioElement.duration;
    }
}

// Вызываем инициализацию плеера при старте скрипта
document.addEventListener("DOMContentLoaded", () => {
    initPlayer();
});

function changeVolume(value) {
    audioElement.volume = parseFloat(value);
}

let isSearchMode = false;

function toggleSearchMode() {
    isSearchMode = !isSearchMode;
    
    const playlistView = document.getElementById("view-playlist");
    const searchView = document.getElementById("view-search");
    const searchBtn = document.getElementById("search-toggle-btn");

    if (isSearchMode) {
        playlistView.style.display = "none";
        searchView.style.display = "flex"; // Используем flex для сохранения верстки поиска
        searchBtn.classList.add("active");
    } else {
        playlistView.style.display = "flex"; // Возвращаем flex, чтобы список треков снова корректно скроллился
        searchView.style.display = "none";
        searchBtn.classList.remove("active");
    }

    if (window.Telegram?.WebApp?.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}

function openVideoPlayer(title, duration) {
    if (window.Telegram?.WebApp?.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
    showToast(`Запуск: "${title}"`);
}

function openVideoPlayer(title, duration) {
    if (window.Telegram?.WebApp?.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }

    // Подставляем название в шапку страницы просмотра
    document.getElementById('watch-video-title').textContent = title;
    
    // Переключаемся на секцию watch через нашу SPA-функцию
    switchTab('watch');
}

// Дополнительные интерактивные функции для страницы просмотра
function toggleLike(btn) {
    btn.classList.toggle('liked');
    const isLiked = btn.classList.contains('liked');
    if (isLiked) {
        btn.style.color = '#ef4444';
        showToast('Видео понравилось');
    } else {
        btn.style.color = '#f8fafc';
    }
}

function toggleSubscribe(btn) {
    btn.classList.toggle('subscribed');
    const isSubscribed = btn.classList.contains('subscribed');
    if (isSubscribed) {
        btn.textContent = 'Вы подписаны';
        showToast('Вы подписаны на канал');
    } else {
        btn.textContent = 'Подписаться';
        showToast('Отписка от канала');
    }
}

function openMoviePlayer(title, genres, year, rating) {
    if (window.Telegram?.WebApp?.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }

    // Подставляем данные фильма на экран просмотра
    document.getElementById('movie-title').textContent = title;
    document.getElementById('movie-genres').textContent = genres;
    document.getElementById('movie-year').textContent = year;

    // Переключаемся на секцию просмотра кино
    switchTab('movie-watch');
}

// Сохранение/синхронизация внешних плейлистов
function saveIntegration(serviceName, inputId) {
    const input = document.getElementById(inputId);
    if (!input || !input.value.trim()) {
        showToast('Введите корректную ссылку!');
        return;
    }

    if (window.Telegram?.WebApp?.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }

    showToast(`Плейлист ${serviceName} успешно синхронизирован!`);
    input.value = '';
}

// Задел на будущее под смену тем оформления
function setTheme(themeName, btnElement) {
    // Подсветка активной кнопки темы
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    if (window.Telegram?.WebApp?.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }

    showToast(`Тема переключена: ${themeName}`);
    
    // В будущем здесь можно будет менять переменные :root или класс на body
    // Например: document.body.className = `theme-${themeName}`;
}