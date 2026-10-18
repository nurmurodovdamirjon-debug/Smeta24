import os
import json
import uuid
import threading
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.db.database import get_connection

_leads_lock = threading.Lock()

def mask_phone(phone: str) -> str:
    cleaned = "".join(c for c in phone if c.isdigit() or c == "+")
    if len(cleaned) >= 12:
        return f"{cleaned[:6]} ••• •• {cleaned[-2:]}"
    return "+998 9• ••• •• ••"

def format_lead_date(dt_str: Optional[str]) -> str:
    if not dt_str:
        return "Yaqinda"
    try:
        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        diff = now - dt
        minutes = int(diff.total_seconds() // 60)
        if minutes < 5:
            return "Hozirgina"
        elif minutes < 60:
            return f"{minutes} daqiqa oldin"
        hours = minutes // 60
        if hours < 24:
            return f"{hours} soat oldin"
        days = hours // 24
        return f"{days} kun oldin"
    except Exception:
        return "Bugun"

def _row_to_lead_dict(row: Any) -> Dict[str, Any]:
    purchased_by_raw = row["purchased_by"] or "[]"
    try:
        purchased_by = json.loads(purchased_by_raw) if isinstance(purchased_by_raw, str) else purchased_by_raw
    except Exception:
        purchased_by = []

    return {
        "id": row["id"],
        "title": row["title"],
        "client_name": row["client_name"],
        "client_phone": row["client_phone"],
        "region": row["region"],
        "area": row["area"],
        "budget": row["budget"],
        "lead_type": row["lead_type"],
        "price": row["price"],
        "created_at": row["created_at"],
        "status": row["status"],
        "purchased_by": purchased_by
    }

def load_leads() -> List[Dict[str, Any]]:
    """Barcha lidlarni SQLite bazasidan yuklash."""
    with _leads_lock:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM leads ORDER BY created_at DESC")
        rows = cursor.fetchall()
        leads = [_row_to_lead_dict(r) for r in rows]
        conn.close()
        return leads

def save_leads(leads: List[Dict[str, Any]]):
    """Lidlarni SQLite bazasiga saqlash (moslik uchun)."""
    with _leads_lock:
        conn = get_connection()
        cursor = conn.cursor()
        for l in leads:
            purchased_str = json.dumps(l.get("purchased_by", []))
            cursor.execute("""
                INSERT OR REPLACE INTO leads 
                (id, title, client_name, client_phone, region, area, budget, lead_type, price, created_at, status, purchased_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                l.get("id"),
                l.get("title"),
                l.get("client_name"),
                l.get("client_phone"),
                l.get("region"),
                l.get("area"),
                l.get("budget"),
                l.get("lead_type"),
                l.get("price", 10000),
                l.get("created_at"),
                l.get("status", "open"),
                purchased_str
            ))
        conn.commit()
        conn.close()

def get_lead_by_id(lead_id: str) -> Optional[Dict[str, Any]]:
    """Lidni ID orqali bazadan olish."""
    with _leads_lock:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return _row_to_lead_dict(row)

def get_public_leads(user_id: Optional[Any] = None) -> List[Dict[str, Any]]:
    """Birja ro'yxati uchun formatlangan lidlarni qaytaradi."""
    leads = load_leads()
    formatted = []
    user_str = str(user_id) if user_id else None

    for item in leads:
        purchased_users = [str(uid) for uid in item.get("purchased_by", [])]
        is_purchased = user_str is not None and user_str in purchased_users

        formatted_contact = (
            f"{item['client_phone']} ({item.get('client_name', 'Mijoz')})"
            if is_purchased
            else f"{mask_phone(item['client_phone'])} ({item.get('client_name', 'Mijoz')})"
        )

        formatted.append({
            "id": item["id"],
            "title": item["title"],
            "area": item.get("area", "-"),
            "budget": item.get("budget", "-"),
            "region": item.get("region", "O'zbekiston"),
            "price": item.get("price", 10000),
            "lead_type": item.get("lead_type", "materials_order"),
            "date": format_lead_date(item.get("created_at")),
            "isPurchased": is_purchased,
            "contact": formatted_contact,
            "phone_raw": item['client_phone'] if is_purchased else None,
            "client_name": item.get('client_name', 'Mijoz') if is_purchased else None,
        })
    return formatted

def add_new_lead(
    client_phone: str,
    region: str,
    room_name: str,
    area_m2: float,
    budget_sum: int,
    client_name: str = "Mijoz",
    lead_type: str = "materials_order"
) -> Dict[str, Any]:
    """Yangi buyurtmani SQLite bazasiga kiritish."""
    with _leads_lock:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM leads")
        count = cursor.fetchone()["cnt"]

        new_num = 9900 + count + 1
        new_id = f"LD-{new_num}"

        type_title = "Ulgurji material" if lead_type == "materials_order" else "Usta xizmati"
        title = f"{region} — {room_name} ({type_title})"
        now_str = datetime.now(timezone.utc).isoformat()
        area_str = f"{area_m2:.1f} m²" if area_m2 else "Noma'lum"
        budget_str = f"{budget_sum:,}".replace(",", " ") + " so'm"

        cursor.execute("""
            INSERT INTO leads 
            (id, title, client_name, client_phone, region, area, budget, lead_type, price, created_at, status, purchased_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            new_id,
            title,
            client_name or "Mijoz",
            client_phone,
            region,
            area_str,
            budget_str,
            lead_type,
            10000,
            now_str,
            "open",
            "[]"
        ))
        conn.commit()
        conn.close()

        return {
            "id": new_id,
            "title": title,
            "client_name": client_name or "Mijoz",
            "client_phone": client_phone,
            "region": region,
            "area": area_str,
            "budget": budget_str,
            "lead_type": lead_type,
            "price": 10000,
            "created_at": now_str,
            "purchased_by": [],
            "status": "open"
        }

def purchase_lead(lead_id: str, user_id: Any) -> Optional[Dict[str, Any]]:
    """Foydalanuvchi tomonidan lidni sotib olish."""
    with _leads_lock:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None

        lead_dict = _row_to_lead_dict(row)
        purchased_list = [str(u) for u in lead_dict.get("purchased_by", [])]
        user_str = str(user_id)

        if user_str not in purchased_list:
            purchased_list.append(user_str)
            cursor.execute(
                "UPDATE leads SET purchased_by = ? WHERE id = ?",
                (json.dumps(purchased_list), lead_id)
            )
            conn.commit()
            lead_dict["purchased_by"] = purchased_list

        conn.close()

        return {
            "id": lead_dict["id"],
            "title": lead_dict["title"],
            "client_name": lead_dict.get("client_name", "Mijoz"),
            "client_phone": lead_dict["client_phone"],
            "region": lead_dict.get("region"),
            "area": lead_dict.get("area"),
            "budget": lead_dict.get("budget"),
            "lead_type": lead_dict.get("lead_type"),
            "price": lead_dict.get("price", 10000)
        }
