import os
import logging
from typing import Optional, List, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from aiogram import Bot
from app.services.leads_store import (
    get_public_leads,
    add_new_lead,
    purchase_lead,
    get_lead_by_id
)
from app.services.wallet_store import get_user_balance, deduct_user_balance

logger = logging.getLogger("Smeta24.Leads")
router = APIRouter(prefix="/leads", tags=["Leads"])

class LeadCreateRequest(BaseModel):
    client_phone: str
    client_name: Optional[str] = "Mijoz"
    region: str
    room_name: str
    area: Optional[float] = 0.0
    materials_total: Optional[int] = 0
    labor_total: Optional[int] = 0
    grand_total: Optional[int] = 0
    lead_type: Optional[str] = "materials_order"  # 'materials_order' | 'need_master'
    estimate_id: Optional[str] = None

class LeadBuyRequest(BaseModel):
    user_id: int

@router.get("")
@router.get("/")
def list_leads(user_id: Optional[int] = Query(None)):
    """Birjadagi barcha faol lidlarni qaytaradi."""
    leads = get_public_leads(user_id=user_id)
    return {
        "success": True,
        "count": len(leads),
        "leads": leads
    }

@router.post("/create")
async def create_lead(req: LeadCreateRequest):
    """Mijoz smetasidan yangi lid (buyurtma) yaratish."""
    if not req.client_phone or len(req.client_phone.strip()) < 9:
        raise HTTPException(status_code=400, detail="Telefon raqami noto'g'ri kiritildi")

    budget = req.grand_total or req.materials_total or 0
    new_lead = add_new_lead(
        client_phone=req.client_phone.strip(),
        region=req.region.strip(),
        room_name=req.room_name.strip(),
        area_m2=req.area or 0.0,
        budget_sum=budget,
        client_name=req.client_name or "Mijoz",
        lead_type=req.lead_type or "materials_order"
    )

    logger.info(f"✅ Yangi lid yaratildi: {new_lead['id']} - {new_lead['title']}")

    # Telegram orqali xabar yuborish (agar LEADS_CHANNEL_ID yoki ADMIN_ID bo'lsa)
    bot_token = os.getenv("BOT_TOKEN", "").strip()
    leads_channel = os.getenv("LEADS_CHANNEL_ID", "").strip() or os.getenv("ADMIN_CHAT_ID", "").strip()
    if bot_token and leads_channel and "BU_YERGA" not in bot_token:
        try:
            bot = Bot(token=bot_token)
            text = (
                f"🔥 <b>YANGI BUYURTMA (LID) BIRJAGA TUSHDI!</b>\n\n"
                f"🆔 <b>Kod:</b> {new_lead['id']}\n"
                f"📍 <b>Hudud:</b> {new_lead['region']}\n"
                f"📐 <b>Maydon:</b> {new_lead['area']}\n"
                f"💰 <b>Budjet:</b> {new_lead['budget']}\n"
                f"🏷 <b>Turi:</b> {'Ulgurji materiallar' if new_lead['lead_type'] == 'materials_order' else 'Usta xizmati'}\n\n"
                f"👉 @Smeta24Bot ga kirib 'Lid-Birja' bo'limidan buyurtmani qabul qilishingiz mumkin!"
            )
            await bot.send_message(chat_id=int(leads_channel), text=text, parse_mode="HTML")
            await bot.session.close()
        except Exception as e:
            logger.warning(f"Telegramga bildirishnoma yuborilmadi: {e}")

    return {
        "status": "published",
        "lead_id": new_lead["id"],
        "lead": new_lead,
        "message": "Buyurtmangiz birjaga e'lon qilindi! Tez orada ustalar yoki do'konlar siz bilan bog'lanishadi."
    }

@router.post("/{lead_id}/buy")
async def buy_lead_endpoint(lead_id: str, req: LeadBuyRequest):
    """Ustaning lid kontaktlarini ochishi va sotib olishi."""
    target_lead = get_lead_by_id(lead_id)
    if not target_lead:
        raise HTTPException(status_code=404, detail="Bunday buyurtma topilmadi")

    lead_price = int(target_lead.get("price", 10000))
    purchased_users = [str(u) for u in target_lead.get("purchased_by", [])]
    is_already_bought = str(req.user_id) in purchased_users

    # Agar hali sotib olinmagan bo'lsa, balans tekshiriladi va yechiladi
    if not is_already_bought:
        deducted = deduct_user_balance(user_id=req.user_id, amount=lead_price)
        if not deducted:
            user_bal = get_user_balance(req.user_id)
            raise HTTPException(
                status_code=402,
                detail=f"Hisobingizda mablag' yetarli emas! Sizning balansingiz: {user_bal:,} so'm. Lid narxi: {lead_price:,} so'm."
            )

    res = purchase_lead(lead_id=lead_id, user_id=req.user_id)
    if not res:
        raise HTTPException(status_code=404, detail="Bunday buyurtma topilmadi")

    # Usta shaxsiy chatiga ma'lumotlarni yuborish
    bot_token = os.getenv("BOT_TOKEN", "").strip()
    if bot_token and req.user_id and req.user_id > 0 and "BU_YERGA" not in bot_token:
        try:
            async with Bot(token=bot_token) as bot:
                lead_info_msg = (
                    f"🎉 <b>Lid muvaffaqiyatli sotib olindi!</b>\n\n"
                    f"🆔 <b>Buyurtma ID:</b> {res['id']}\n"
                    f"📌 <b>Nomi:</b> {res['title']}\n"
                    f"📍 <b>Hudud:</b> {res.get('region', '-')}\n"
                    f"📐 <b>Hajmi:</b> {res.get('area', '-')}\n"
                    f"💰 <b>Mo'ljal budjet:</b> {res.get('budget', '-')}\n\n"
                    f"👤 <b>Mijoz:</b> {res['client_name']}\n"
                    f"📞 <b>Telefon raqami:</b> <code>{res['client_phone']}</code>\n\n"
                    f"💡 <i>Darhol mijozga qo'ng'iroq qilib, buyurtmani rasmiylashtiring!</i>"
                )
                await bot.send_message(chat_id=req.user_id, text=lead_info_msg, parse_mode="HTML")
        except Exception as e:
            logger.warning(f"Ustaga telegram orqali xabar yuborishda xatolik: {e}")

    current_bal = get_user_balance(req.user_id)
    return {
        "status": "purchased",
        "lead_id": lead_id,
        "lead": res,
        "client_phone": res["client_phone"],
        "client_name": res["client_name"],
        "current_balance": current_bal,
        "message": f"Lid ochildi! Mijoz telefoni: {res['client_phone']}"
    }
