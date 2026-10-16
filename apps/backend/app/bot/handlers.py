from aiogram import Router, types
from aiogram.filters import CommandStart
from app.bot.keyboards import get_main_menu_keyboard

router = Router()

START_TEXT = """🏠 <b>Smeta24 — Ta'mirlash va qurilish uchun aqlli kalkulyator!</b>

Ushbu ilova orqali 1 daqiqada:
✅ Xona o'lchamiga qarab aniq kvadraturani (m²);
✅ Qancha gruntovka, shpaklyovka, pautinka, bo'yoq yoki kafel ketishini (qop va paqir sonigacha);
✅ O'rtacha bozor narxlari va usta ish haqini hisoblab olasiz.

👷‍♂️ <b>Ustalar uchun:</b> O'z logotipingiz, telefon raqamingiz va stavkalaringiz tushirilgan rasmiy PDF-smeta tayyorlab, mijozga yuboring!

👨‍💻 <b>Dastur muallifi:</b> Nurmurodov Damirjon

👇 <i>Boshlash uchun pastdagi "📐 Smeta hisoblash" tugmasini bosing:</i>
"""

@router.message(CommandStart())
async def cmd_start(message: types.Message):
    await message.answer(
        START_TEXT,
        reply_markup=get_main_menu_keyboard(),
        parse_mode="HTML"
    )

@router.callback_query(lambda c: c.data == "my_profile")
async def process_profile(callback: types.CallbackQuery):
    await callback.answer()
    await callback.message.answer(
        "👷‍♂️ <b>Sizning profilingiz:</b>\n\n"
        "Nom: ProFinish Uz\n"
        "Balans: 15 000 so'm\n"
        "Daraja: Tasdiqlangan Prorab\n\n"
        "Sozlamalarni o'zgartirish uchun Mini App'ga kiring.",
        parse_mode="HTML"
    )
