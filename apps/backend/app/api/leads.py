from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/leads", tags=["Leads"])

class LeadCreateRequest(BaseModel):
    client_phone: str
    region: str
    room_name: str
    materials_total: int
    estimate_id: Optional[str] = None

@router.post("/create")
def create_lead(req: LeadCreateRequest):
    return {
        "status": "published",
        "lead_id": "LD-9901",
        "message": "Ariza B2B guruhga yuborildi va do'konlar uchun birjada e'lon qilindi"
    }

@router.post("/{lead_id}/buy")
def buy_lead(lead_id: str, user_id: int):
    return {
        "status": "purchased",
        "lead_id": lead_id,
        "client_phone": "+998 90 123 45 67",
        "message": "Lid ochildi! Mijoz telefoni va smetasi profilingizga yuborildi."
    }
