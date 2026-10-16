// Открытие видео в YouTubeGM
function openVideoPlayer(title, duration) {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    const titleEl = document.getElementById('watch-video-title');
    if (titleEl) titleEl.textContent = title;
    
    switchTab('watch');
}

// Лайки и подписки для видео
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

// Открытие фильма в Кинозале
function openMoviePlayer(title, genres, year, rating) {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    const mTitle = document.getElementById('movie-title');
    const mGenres = document.getElementById('movie-genres');
    const mYear = document.getElementById('movie-year');

    if (mTitle) mTitle.textContent = title;
    if (mGenres) mGenres.textContent = genres;
    if (mYear) mYear.textContent = year;

    switchTab('movie-watch');
}

async function loadYouTubeVideo(videoUrl) {
    try {
        const response = await fetch(`/api/youtube/resolve?url=${encodeURIComponent(videoUrl)}`);
        const data = await response.json();

        if (data.success) {
            console.log("Видео найдено:", data.title);
            
            // Передаем прямую ссылку в стандартный HTML5 тег <video> или в кастомный плеер
            const videoPlayer = document.getElementById('my-video-player');
            if (videoPlayer) {
                videoPlayer.src = data.stream_url;
                videoPlayer.play();
            }
        }
    } catch (err) {
        console.error("Ошибка загрузки YouTube потока:", err);
        showToast('Не удалось запустить видео');
    }
}