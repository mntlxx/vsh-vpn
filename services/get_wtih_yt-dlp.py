import sys
import time
from playwright.sync_api import sync_playwright
import yt_dlp

def get_stream_url_for_ytdlp(anime_page_url: str) -> str:
    """Твой проверенный метод перехвата m3u8 через Playwright."""
    print(f"🔍 Ищем поток для yt-dlp на странице: {anime_page_url}")
    captured_url = None

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        def handle_request(request):
            nonlocal captured_url
            url = request.url
            # Ловим solodcdn манифесты или прямые mp4/m3u8 потоки
            if ("solodcdn.com" in url or "kodik" in url) and (".m3u8" in url or ".mp4" in url):
                if not captured_url and "manifest.m3u8" in url:
                    captured_url = url
                    print(f"🎯 [ПОЙМАНО]: {url}")

        page.on("request", handle_request)

        try:
            page.goto(anime_page_url, timeout=60000)
            time.sleep(2)

            # Проверяем все фреймы
            for frame in page.frames:
                frame.on("request", handle_request)

            # Кликаем по плееру для инициализации трафика
            try:
                page.click("video, .fp-play, .fp-big-play, iframe", timeout=3000)
            except:
                pass

            # Ждем появления ссылки
            start_time = time.time()
            while not captured_url and (time.time() - start_time) < 12:
                time.sleep(0.5)

        except Exception as e:
            print(f"⚠️ Ошибка Playwright: {e}")
        
        browser.close()

    return captured_url

def download_anime(urls_list: list, output_filename: str = "anime_episode.mp4"):
    """Каскадный перебор массива сайтов через твою функцию и скачивание через yt-dlp API."""
    stream_link = None

    # Перебираем массив зеркал/сайтов
    for index, url in enumerate(urls_list, 1):
        print(f"\n🚀 [{index}/{len(urls_list)}] Проверяем зеркало: {url}")
        
        stream_link = get_stream_url_for_ytdlp(url)
        
        if stream_link:
            print(f"🎉 УСПЕХ! Поток успешно пойман на источнике #{index}.")
            break
        else:
            print(f"⚠️ Источник #{index} не отдал поток, переходим к следующему...")

    if not stream_link:
        print("\n❌ Критическая ошибка: ни одно из зеркал не дало ссылку на поток.")
        return

    print(f"\n📥 Запуск скачивания через yt-dlp API в файл {output_filename}...")
    
    # Настройки для yt-dlp
    ydl_opts = {
        'outtmpl': output_filename,
        'referer': 'https://kodikplayer.com/',
        'hls_use_mpegts': True,
        'merge_output_format': 'mp4',
        'postprocessor_args': ['ffmpeg:-movflags +faststart'],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([stream_link])
            
        print(f"\n🎉 ГОТОВО! Видео успешно скачано: {output_filename}")
    except Exception as e:
        print(f"\n❌ Ошибка при скачивании: {e}")

if __name__ == "__main__":
    # Если передал ссылки через терминал — используем их, иначе берем дефолтный массив
    if len(sys.argv) > 1:
        sources = sys.argv[1:]
    else:
        sources = [
            "https://animeow.org/title/9926",
            "https://animeyard.org/1147-provozhajuschaja-v-poslednij-put-friren.html"
        ]

    download_anime(sources, "anime_episode_final.mp4")