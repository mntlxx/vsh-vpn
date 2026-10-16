import asyncio
import uvicorn
from app.bot import bot, dp
from app.web import app

async def main():
    # Запуск FastAPI в фоновой задаче
    config = uvicorn.Config(app, host="0.0.0.0", port=8080, log_level="info")
    server = uvicorn.Server(config)
    
    # Запускаем бота и веб-сервер параллельно
    await asyncio.gather(
        dp.start_polling(bot),
        server.serve()
    )

if __name__ == "__main__":
    asyncio.run(main())