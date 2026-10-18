from fastapi import APIRouter, Request, Query
from pydantic import BaseModel
from app.services.wallet_store import get_user_balance, add_user_balance

router = APIRouter(prefix="/billing", tags=["Billing"])

class TopupRequest(BaseModel):
    user_id: int
    amount: int
    provider: str = "click"

@router.get("/balance")
def get_balance(user_id: int = Query(..., description="Telegram User ID")):
    """Foydalanuvchining serverdagi joriy hamyon balansini qaytaradi."""
    return {
        "user_id": user_id,
        "balance": get_user_balance(user_id)
    }

@router.post("/topup")
def topup_balance(req: TopupRequest):
    """Click yoki Payme uchun rasmiy to'lov havolasini shakllantirish."""
    return {
        "status": "pending",
        "payment_url": f"https://my.click.uz/services/pay?service_id=12345&merchant_id=67890&amount={req.amount}&transaction_param={req.user_id}",
        "message": f"{req.amount:,} so'm to'lov havolasi yaratildi"
    }

@router.post("/topup-demo")
def topup_demo(req: TopupRequest):
    """Sinov va ishlab chiqish rejimida hisobni to'ldirish (demo credit)."""
    new_bal = add_user_balance(req.user_id, req.amount)
    return {
        "ok": True,
        "status": "success",
        "new_balance": new_bal,
        "message": f"Hisobingiz muvaffaqiyatli {req.amount:,} so'mga to'ldirildi!"
    }

@router.post("/webhook/click")
async def click_webhook(request: Request):
    data = await request.form()
    # Click to'lovi tasdiqlanganda foydalanuvchi hisobiga pul qo'shiladi
    user_id = data.get("merchant_trans_id") or data.get("param2")
    amount = data.get("amount")
    if user_id and amount:
        try:
            add_user_balance(int(user_id), int(float(amount)))
        except Exception:
            pass
    return {"error": 0, "error_note": "Success", "click_trans_id": data.get("click_trans_id")}

@router.post("/webhook/payme")
async def payme_webhook(request: Request):
    return {"result": {"allow": True}}
