import os
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, estimates, billing, leads
from aiogram import Bot, Dispatcher
from app.bot.handlers import router as bot_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("Smeta24")

@asynccontextmanager
async def lifespan(app: FastAPI):
    bot_token = os.getenv("BOT_TOKEN", "").strip()
    bot_task = None
    bot = None
    
    if bot_token and "BU_YERGA" not in bot_token:
        try:
            bot = Bot(token=bot_token)
            dp = Dispatcher()
            dp.include_router(bot_router)
            me = await bot.get_me()
            logger.info(f"✅ Smeta24 Bot muvaffaqiyatli ishga tushdi: @{me.username}")
            logger.info("Dastur muallifi: Nurmurodov Damirjon")
            bot_task = asyncio.create_task(dp.start_polling(bot))
        except Exception as e:
            logger.error(f"❌ Botni ishga tushirishda xatolik: {e}")
            
    yield
    
    if bot_task:
        bot_task.cancel()
        try:
            await bot_task
        except asyncio.CancelledError:
            pass
    if bot:
        await bot.session.close()

app = FastAPI(
    title="Smeta24 API",
    description="Aqlli Smeta (Smeta24Bot) Backend API & Calculation Engine",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(estimates.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")
app.include_router(leads.router, prefix="/api/v1")

@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {
        "app": "Smeta24 API & Telegram Bot",
        "author": "Nurmurodov Damirjon",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok"}

