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
];

let currentTrackIndex = 0;
const audioElement = new Audio();
let isPlaying = false;

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
        const titleEl = document.getElementById("current-track-title");
        if (titleEl) titleEl.textContent = playlistTracks[0].title;
    }
}

function selectAndPlayTrack(index) {
    currentTrackIndex = index;
    audioElement.src = playlistTracks[index].file;
    const titleEl = document.getElementById("current-track-title");
    if (titleEl) titleEl.textContent = playlistTracks[index].title;
    
    playTrack();
    updatePlaylistUI();
}

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
        const playBtn = document.getElementById("play-btn");
        if (playBtn) playBtn.textContent = "⏸";

        const tg = window.Telegram?.WebApp;
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    }).catch(err => {
        console.error("Ошибка воспроизведения:", err);
        showToast("Файл трека не найден в testing/player");
    });
}

function pauseTrack() {
    audioElement.pause();
    isPlaying = false;
    const playBtn = document.getElementById("play-btn");
    if (playBtn) playBtn.textContent = "▶";
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlistTracks.length;
    selectAndPlayTrack(currentTrackIndex);
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + playlistTracks.length) % playlistTracks.length;
    selectAndPlayTrack(currentTrackIndex);
}

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

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

audioElement.addEventListener("timeupdate", () => {
    if (audioElement.duration) {
        const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
        const progressBar = document.getElementById("progress-bar");
        if (progressBar) progressBar.style.width = `${progressPercent}%`;
        
        const currTime = document.getElementById("current-time");
        const totDur = document.getElementById("total-duration");
        if (currTime) currTime.textContent = formatTime(audioElement.currentTime);
        if (totDur) totDur.textContent = formatTime(audioElement.duration);
    }
});

audioElement.addEventListener("ended", () => {
    nextTrack();
});

function seekTrack(event) {
    const container = event.currentTarget;
    const clickX = event.offsetX;
    const width = container.clientWidth;
    const percent = clickX / width;
    
    if (audioElement.duration) {
        audioElement.currentTime = percent * audioElement.duration;
    }
}

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
        if (playlistView) playlistView.style.display = "none";
        if (searchView) searchView.style.display = "flex";
        if (searchBtn) searchBtn.classList.add("active");
    } else {
        if (playlistView) playlistView.style.display = "flex";
        if (searchView) searchView.style.display = "none";
        if (searchBtn) searchBtn.classList.remove("active");
    }

    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initPlayer();
});