from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.filters import CommandStart
from app import config

bot = Bot(token=config.BOT_TOKEN)
dp = Dispatcher()

@dp.message(CommandStart())
async def cmd_start(message: Message):
    # Кнопка открытия Mini App
#    kb = InlineKeyboardMarkup(inline_keyboard=[[
#        InlineKeyboardButton(
#            text="🚀 Открыть VoidSpace HUB", 
#            web_app=WebAppInfo(url=config.WEB_APP_URL)
#        )
#    ]])
    
    await message.answer(
        f"🌌 Привет, {message.from_user.first_name}!\n\n"
        f"Добро пожаловать в **VoidSpace HUB**. Нажми кнопку ниже, чтобы управлять своими подключениями и получить ссылки.",
#        reply_markup=kb,
        parse_mode="Markdown"
    )