import yt_dlp
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/youtube", tags=["YouTube"])

@router.get("/resolve")
async def resolve_youtube_stream(url: str):
    """
    Принимает ссылку на YouTube, извлекает прямую ссылку на поток и метаданные без скачивания.
    """
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    # Настройки yt-dlp для получения оптимального потока
    ydl_opts = {
        'format': 'best[height<=720]/best',  # Берем качество до 720p (идеально для скорости и экономии трафика)
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Извлекаем информацию о видео без скачивания
            info = ydl.extract_info(url, download=False)
            
            # Получаем прямую ссылку на медиапоток
            stream_url = info.get('url')
            title = info.get('title', 'Без названия')
            thumbnail = info.get('thumbnail', '')
            duration = info.get('duration', 0)

            if not stream_url:
                raise HTTPException(status_code=500, detail="Не удалось получить поток от YouTube")

            return JSONResponse(content={
                "success": True,
                "title": title,
                "thumbnail": thumbnail,
                "duration": duration,
                "stream_url": stream_url
            })

    except Exception as e:
        print(f"Ошибка yt-dlp: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка обработки видео: {str(e)}")