import os
from aiogram import Router, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from app.bot.keyboards import get_main_menu_keyboard
from app.services.leads_store import get_public_leads

router = Router()

START_TEXT = """🏠 <b>Smeta24 — Ta'mirlash va qurilish uchun aqlli kalkulyator!</b>

Ushbu ilova orqali 1 daqiqada:
✅ Xona o'lchamiga qarab aniq kvadraturani (m²);
✅ Qancha gruntovka, shpaklyovka, pautinka, bo'yoq yoki kafel ketishini (qop va paqir sonigacha);
✅ O'rtacha bozor narxlari va usta ish haqini hisoblab olasiz.

👷‍♂️ <b>Ustalar uchun:</b> O'z logotipingiz, telefon raqamingiz va stavkalaringiz tushirilgan rasmiy PDF-smeta tayyorlab, mijozga yuboring!

🏬 <b>Lid-Birja:</b> Do'konlar va ustalar uchun tayyor xaridor buyurtmalari!

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
    web_app_url = os.getenv("WEB_APP_URL", "https://smeta24.vercel.app")
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="⚙️ Profilni Mini App'da sozlash",
                    web_app=WebAppInfo(url=web_app_url)
                )
            ]
        ]
    )
    await callback.message.answer(
        "👷‍♂️ <b>Sizning profilingiz:</b>\n\n"
        "👤 <b>Status:</b> Faol Usta / Prorab\n"
        "💼 <b>Tarif:</b> Pro Rejim 2026\n"
        "💳 <b>Balans:</b> 15 000 so'm (Ichki hamyon)\n\n"
        "Logotip, brend nomi va $1\\text{ m}^2$ stavkalaringizni Mini App sozlamalarida kiritishingiz mumkin.",
        reply_markup=kb,
        parse_mode="HTML"
    )

@router.callback_query(lambda c: c.data == "leads_market")
async def process_leads_market(callback: types.CallbackQuery):
    await callback.answer()
    leads = get_public_leads(user_id=callback.from_user.id)
    web_app_url = os.getenv("WEB_APP_URL", "https://smeta24.vercel.app")

    leads_text = f"🏬 <b>Smeta24 — Buyurtmalar Birjasi (Lidlar)</b>\n\n"
    leads_text += f"Hozirda birjada <b>{len(leads)} ta</b> yangi faol buyurtma mavjud!\n\n"
    leads_text += "📌 <b>Eng so'nggi arizalar:</b>\n"

    for idx, ld in enumerate(leads[:3], 1):
        type_icon = "📦" if ld.get("lead_type") == "materials_order" else "🔨"
        leads_text += (
            f"\n{idx}. {type_icon} <b>{ld['title']}</b>\n"
            f"   📐 Maydon: {ld['area']} | 💰 Budjet: {ld['budget']}\n"
            f"   📍 Hudud: {ld['region']} ({ld['date']})\n"
        )

    leads_text += (
        "\n👇 <i>Mijozlarning telefon raqamini ochish va buyurtmani qabul qilish uchun birjaga kiring:</i>"
    )

    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🚀 Birjani ochish (Mini App)",
                    web_app=WebAppInfo(url=web_app_url)
                )
            ],
            [
                InlineKeyboardButton(
                    text="🔄 Yangilash",
                    callback_data="leads_market"
                )
            ]
        ]
    )

    await callback.message.answer(leads_text, reply_markup=kb, parse_mode="HTML")

@router.callback_query(lambda c: c.data == "topup_balance")
async def process_topup(callback: types.CallbackQuery):
    await callback.answer()
    web_app_url = os.getenv("WEB_APP_URL", "https://smeta24.vercel.app")
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="💳 Hamyonni to'ldirish (Mini App)",
                    web_app=WebAppInfo(url=web_app_url)
                )
            ]
        ]
    )
    await callback.message.answer(
        "💳 <b>Hisobni to'ldirish:</b>\n\n"
        "PDF smetalarni cheksiz yuklab olish va buyurtmalar birjasidan mijoz kontaktlarini ochish uchun "
        "balansingizni Click yoki Payme orqali to'ldirishingiz mumkin.",
        reply_markup=kb,
        parse_mode="HTML"
    )
