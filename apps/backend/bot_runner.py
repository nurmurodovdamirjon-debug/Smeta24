import os
import sys
import subprocess

# 1. Windows terminalida UTF-8 kodlashni yoqish
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# 2. Avtomatik ravishda .venv muhitini aniqlash va o'tish
current_dir = os.path.dirname(os.path.abspath(__file__))
venv_python = os.path.join(current_dir, ".venv", "Scripts", "python.exe")
if os.path.exists(venv_python) and os.path.normcase(sys.executable) != os.path.normcase(venv_python):
    sys.exit(subprocess.call([venv_python] + sys.argv))

import asyncio
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from aiogram import Bot, Dispatcher
from app.bot.handlers import router as bot_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("Smeta24Bot")

BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()

async def main():
    if not BOT_TOKEN or "BU_YERGA" in BOT_TOKEN:
        print("\n" + "="*60)
        print("❌ XATOLIK: BOT_TOKEN topilmadi yoki kiritilmadi!")
        print("Iltimos, apps/backend/.env fayliga @BotFather dan olingan")
        print("haqiqiy tokenni kiriting:")
        print("BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ")
        print("="*60 + "\n")
        sys.exit(1)

    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()
    dp.include_router(bot_router)

    me = await bot.get_me()
    print("\n" + "="*60)
    print(f"✅ Smeta24 Bot muvaffaqiyatli ishga tushdi: @{me.username}")
    print("Dastur muallifi: Nurmurodov Damirjon")
    print("Telegram orqali @Smeta24Bot ga kirib /start bosing!")
    print("="*60 + "\n")

    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot to'xtatildi.")
