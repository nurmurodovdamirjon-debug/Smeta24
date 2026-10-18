import os
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

def get_main_menu_keyboard(web_app_url: str = None):
    url = web_app_url or os.getenv("WEB_APP_URL", "https://smeta24.vercel.app")
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📐 Smeta hisoblash",
                    web_app=WebAppInfo(url=url)
                )
            ],
            [
                InlineKeyboardButton(text="👷‍♂️ Usta Profili", callback_data="my_profile"),
                InlineKeyboardButton(text="🏬 Lid-Birja", callback_data="leads_market"),
            ],
            [
                InlineKeyboardButton(text="💳 Hamyonni to'ldirish", callback_data="topup_balance")
            ]
        ]
    )
