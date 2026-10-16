from fastapi import APIRouter, Request
from pydantic import BaseModel

router = APIRouter(prefix="/billing", tags=["Billing"])

class TopupRequest(BaseModel):
    user_id: int
    amount: int
    provider: str = "click"

@router.post("/topup")
def topup_balance(req: TopupRequest):
    return {
        "status": "pending",
        "payment_url": f"https://my.click.uz/services/pay?service_id=12345&merchant_id=67890&amount={req.amount}&transaction_param={req.user_id}",
        "message": f"{req.amount:,} so'm to'lov havolasi yaratildi"
    }

@router.post("/webhook/click")
async def click_webhook(request: Request):
    data = await request.form()
    return {"error": 0, "error_note": "Success", "click_trans_id": data.get("click_trans_id")}

@router.post("/webhook/payme")
async def payme_webhook(request: Request):
    return {"result": {"allow": True}}
