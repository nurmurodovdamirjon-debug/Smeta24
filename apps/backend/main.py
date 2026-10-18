import os
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, estimates, billing, leads
from aiogram import Bot, Dispatcher
from app.bot.handlers import router as bot_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("Smeta24")

async def run_bot_polling(bot: Bot, dp: Dispatcher):
    """Telegram bot polling uzilib qolganda avtomatik qayta tiklanish (auto-reconnect) funksiyasi."""
    while True:
        try:
            await dp.start_polling(bot)
            break
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"⚠️ Telegram polling uzildi: {e}. 5 soniyadan so'ng qayta ulanadi...")
            await asyncio.sleep(5)

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
            bot_task = asyncio.create_task(run_bot_polling(bot, dp))
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

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

app = FastAPI(
    title="Smeta24 API",
    description="Aqlli Smeta (Smeta24Bot) Backend API & Calculation Engine",
    version="1.0.0",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://smeta24.vercel.app").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(estimates.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")
app.include_router(leads.router, prefix="/api/v1")

@app.api_route("/", methods=["GET", "HEAD"])
def root(request: Request):
    if request.method == "HEAD":
        return Response(status_code=200, headers={"Content-Type": "application/json"})
    return JSONResponse({
        "app": "Smeta24 API & Telegram Bot",
        "author": "Nurmurodov Damirjon",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    })

@app.api_route("/health", methods=["GET", "HEAD"])
def health(request: Request):
    if request.method == "HEAD":
        return Response(status_code=200)
    data_dir_exists = os.path.exists(os.path.join(os.path.dirname(__file__), "data"))
    return JSONResponse({
        "status": "ok",
        "service": "Smeta24 API",
        "storage": "connected" if data_dir_exists else "initializing"
    })

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Barcha ushlanmagan xatoliklarni xavfsiz JSON ko'rinishida qaytarish va adminga alert yuborish."""
    logger.error(f"🚨 Kutilmagan server xatoligi [{request.method} {request.url.path}]: {exc}", exc_info=True)
    admin_id = os.getenv("ADMIN_CHAT_ID", "").strip()
    bot_token = os.getenv("BOT_TOKEN", "").strip()
    if admin_id and bot_token and "BU_YERGA" not in bot_token:
        try:
            async with Bot(token=bot_token) as bot:
                error_alert = (
                    f"🚨 <b>Smeta24 Server Xatoligi!</b>\n\n"
                    f"📍 <b>Marshrut:</b> {request.method} {request.url.path}\n"
                    f"⚠️ <b>Xato turi:</b> {type(exc).__name__}\n"
                    f"💬 <b>Tafsilot:</b> {str(exc)[:200]}"
                )
                await bot.send_message(chat_id=int(admin_id), text=error_alert, parse_mode="HTML")
        except Exception:
            pass

    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Serverda kutilmagan xatolik yuz berdi. Mutaxassislar ogohlantirildi."}
    )

