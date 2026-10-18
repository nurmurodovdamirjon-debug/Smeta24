import os
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from aiogram import Bot
from aiogram.types import BufferedInputFile
from app.services.calculator import RoomInput, calculate_smart_estimate
from app.services.pdf_service import render_estimate_html, generate_estimate_pdf, generate_estimate_pdf_bytes

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/estimates", tags=["Estimates"])

# In-memory mock store for development before database is connected
ESTIMATES_STORE: Dict[str, Any] = {}

class MaterialItem(BaseModel):
    name: str
    exact: Optional[str] = ""
    packages: str
    price_formatted: Optional[str] = "0 so'm"
    total_formatted: str

class LaborItem(BaseModel):
    name: str
    area: Optional[str] = ""
    rate_formatted: Optional[str] = "0 so'm"
    total_formatted: str

class SendTelegramPdfRequest(BaseModel):
    chat_id: int
    room_name: str
    length: float
    width: float
    height: float
    total_area: float
    brand_name: Optional[str] = "ProFinish Uz"
    master_phone: Optional[str] = "+998 90 123 45 67"
    materials: List[MaterialItem]
    labor_items: Optional[List[LaborItem]] = []
    materials_total: str
    labor_total: Optional[str] = "0 so'm"
    grand_total: str

@router.post("/calculate")
def calculate_estimate(room: RoomInput):
    result = calculate_smart_estimate(room)
    estimate_id = str(uuid.uuid4())

    record = {
        "id": estimate_id,
        "room_name": room.roomName,
        "input": room.model_dump(),
        "result": result,
        "is_paid": False,
    }
    ESTIMATES_STORE[estimate_id] = record

    censored_materials = []
    for item in result["materials"]:
        c_item = dict(item)
        c_item["packages_locked"] = True
        censored_materials.append(c_item)

    return {
        "estimate_id": estimate_id,
        "geometry": result["geometry"],
        "materials": censored_materials,
        "materials_total": result["materials_total"],
        "labor_total": result["labor_total"],
        "grand_total": result["grand_total"],
        "is_paid": False
    }

@router.post("/send-telegram-pdf")
@limiter.limit("10/minute")
async def send_telegram_pdf(request: Request, payload: SendTelegramPdfRequest):
    bot_token = os.getenv("BOT_TOKEN", "").strip()
    if not bot_token:
        raise HTTPException(status_code=500, detail="BOT_TOKEN serverda sozlanmagan")

    # 1. HTML shablonini render qilish
    html_data = {
        "estimate_number": uuid.uuid4().hex[:8].upper(),
        "master_brand_name": payload.brand_name or "ProFinish Uz",
        "master_phone": payload.master_phone or "+998 90 123 45 67",
        "created_date": datetime.now().strftime("%Y-%m-%d"),
        "room_name": payload.room_name,
        "length": payload.length,
        "width": payload.width,
        "height": payload.height,
        "net_wall_area": payload.total_area,
        "ceiling_area": round(payload.length * payload.width, 1),
        "total_area": payload.total_area,
        "materials": [
            {
                "name": m.name,
                "exact": m.exact,
                "packages": m.packages,
                "unit": "",
                "price_formatted": m.price_formatted,
                "total_formatted": m.total_formatted,
            }
            for m in payload.materials
        ],
        "labor_items": [
            {
                "name": l.name,
                "area": l.area,
                "rate_formatted": l.rate_formatted,
                "total_formatted": l.total_formatted,
            }
            for l in payload.labor_items
        ],
        "materials_total_formatted": payload.materials_total,
        "labor_total": payload.labor_total,
        "labor_total_formatted": payload.labor_total,
        "grand_total_formatted": payload.grand_total,
    }
    
    html = render_estimate_html(html_data)
    pdf_bytes = generate_estimate_pdf_bytes(html)

    # 2. Telegram Bot orqali foydalanuvchiga yuborish
    try:
        async with Bot(token=bot_token) as bot:
            filename = f"Smeta24_{payload.room_name}.pdf"
            caption = (
                f"📄 <b>Rasmiy Smeta24 hisob-kitob hujjati tayyor!</b>\n\n"
                f"🏠 Obyekt: <b>{payload.room_name}</b>\n"
                f"📐 Jami maydon: <b>{payload.total_area} m²</b>\n"
                f"🧱 Materiallar: <b>{payload.materials_total}</b>\n"
                f"👷‍♂️ Usta xizmati: <b>{payload.labor_total}</b>\n"
                f"💰 <b>Jami budjet: {payload.grand_total}</b>\n\n"
                f"👨‍💻 Dastur muallifi: <b>Nurmurodov Damirjon</b>\n"
                f"🤖 @Smeta24Bot orqali avtomatik shakllantirildi."
            )
            
            await bot.send_document(
                chat_id=payload.chat_id,
                document=BufferedInputFile(pdf_bytes, filename=filename),
                caption=caption,
                parse_mode="HTML"
            )
        return {"ok": True, "success": True, "message": "PDF muvaffaqiyatli Telegram chatga yuborildi!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Telegramga yuborishda xatolik: {str(e)}")

@router.post("/{estimate_id}/unlock")
def unlock_estimate(estimate_id: str):
    if estimate_id not in ESTIMATES_STORE:
        raise HTTPException(status_code=404, detail="Smeta topilmadi")

    record = ESTIMATES_STORE[estimate_id]
    record["is_paid"] = True

    return {
        "status": "unlocked",
        "estimate_id": estimate_id,
        "is_paid": True,
        "raw_materials": record["result"]["materials"],
    }
