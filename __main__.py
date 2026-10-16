import asyncio
import uvicorn
import os
from app.web import app

# Проверяем, задан ли токен бота (чтобы локально не падало без него)
BOT_TOKEN_EXISTS = os.getenv("BOT_TOKEN") or True # Замени на проверку из config.py при необходимости

async def main():
    config_uvicorn = uvicorn.Config(app, host="0.0.0.0", port=8080, log_level="info")
    server = uvicorn.Server(config_uvicorn)
    
    tasks = [server.serve()]

    # Если бот настроен, запускаем его параллельно с веб-сервером
    try:
        from app.bot import bot, dp
        print("🤖 Бот инициализирован, запускаем polling...")
        tasks.append(dp.start_polling(bot))
    except Exception as e:
        print(f"⚠️ Telegram бот пропущен (запуск только веб-интерфейса): {e}")

    print("🚀 VoidSpace HUB запущен локально: http://127.0.0.1:8080")
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())