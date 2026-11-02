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