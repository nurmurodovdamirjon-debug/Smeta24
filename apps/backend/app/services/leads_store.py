import os
import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
LEADS_FILE = os.path.join(DATA_DIR, "leads.json")

def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)

def mask_phone(phone: str) -> str:
    cleaned = "".join(c for c in phone if c.isdigit() or c == "+")
    if len(cleaned) >= 12:
        return f"{cleaned[:6]} ••• •• {cleaned[-2:]}"
    return "+998 9• ••• •• ••"

INITIAL_LEADS: List[Dict[str, Any]] = [
    {
        "id": "LD-9821",
        "title": "Yunusobod — 3 xonali gipskarton va kraskapult bo'yoq",
        "client_name": "Farrux",
        "client_phone": "+998 90 847 32 11",
        "region": "Toshkent shahri",
        "area": "78.4 m²",
        "budget": "16 400 000 so'm",
        "lead_type": "materials_order",
        "price": 10000,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "purchased_by": [],
        "status": "open"
    },
    {
        "id": "LD-9818",
        "title": "Chilonzor — Polga parket yotqizish va plintus",
        "client_name": "Sanjar",
        "client_phone": "+998 97 122 89 00",
        "region": "Toshkent shahri",
        "area": "42.5 m²",
        "budget": "7 250 000 so'm",
        "lead_type": "need_master",
        "price": 10000,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "purchased_by": [],
        "status": "open"
    },
    {
        "id": "LD-9804",
        "title": "Samarqand — Kottej pol steshkasi, oboy va figurali shift",
        "client_name": "Jamshid",
        "client_phone": "+998 93 456 78 90",
        "region": "Samarqand",
        "area": "140.0 m²",
        "budget": "38 000 000 so'm",
        "lead_type": "materials_order",
        "price": 15000,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "purchased_by": [],
        "status": "open"
    },
    {
        "id": "LD-9795",
        "title": "Farg'ona — Yangi xonadon kafel va devor shpaklyovka",
        "client_name": "Otabek",
        "client_phone": "+998 91 654 32 10",
        "region": "Farg'ona",
        "area": "64.0 m²",
        "budget": "11 200 000 so'm",
        "lead_type": "need_master",
        "price": 10000,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "purchased_by": [],
        "status": "open"
    }
]

def load_leads() -> List[Dict[str, Any]]:
    ensure_data_dir()
    if not os.path.exists(LEADS_FILE):
        save_leads(INITIAL_LEADS)
        return INITIAL_LEADS
    try:
        with open(LEADS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else INITIAL_LEADS
    except Exception:
        return INITIAL_LEADS

def save_leads(leads: List[Dict[str, Any]]):
    ensure_data_dir()
    try:
        with open(LEADS_FILE, "w", encoding="utf-8") as f:
            json.dump(leads, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving leads to {LEADS_FILE}: {e}")

def get_public_leads(user_id: Optional[Any] = None) -> List[Dict[str, Any]]:
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

def add_new_lead(
    client_phone: str,
    region: str,
    room_name: str,
    area_m2: float,
    budget_sum: int,
    client_name: str = "Mijoz",
    lead_type: str = "materials_order"
) -> Dict[str, Any]:
    leads = load_leads()
    new_num = 9900 + len(leads) + 1
    new_id = f"LD-{new_num}"

    type_title = "Ulgurji material" if lead_type == "materials_order" else "Usta xizmati"
    title = f"{region} — {room_name} ({type_title})"

    new_lead = {
        "id": new_id,
        "title": title,
        "client_name": client_name or "Mijoz",
        "client_phone": client_phone,
        "region": region,
        "area": f"{area_m2:.1f} m²" if area_m2 else "Noma'lum",
        "budget": f"{budget_sum:,}".replace(",", " ") + " so'm",
        "lead_type": lead_type,
        "price": 10000,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "purchased_by": [],
        "status": "open"
    }

    # Yangi lidni ro'yxat boshiga qo'shamiz
    leads.insert(0, new_lead)
    save_leads(leads)
    return new_lead

def purchase_lead(lead_id: str, user_id: Any) -> Optional[Dict[str, Any]]:
    leads = load_leads()
    target = None
    user_str = str(user_id)

    for item in leads:
        if item["id"] == lead_id:
            purchased_list = [str(u) for u in item.get("purchased_by", [])]
            if user_str not in purchased_list:
                purchased_list.append(user_str)
                item["purchased_by"] = purchased_list
                save_leads(leads)
            target = item
            break

    if not target:
        return None

    return {
        "id": target["id"],
        "title": target["title"],
        "client_name": target.get("client_name", "Mijoz"),
        "client_phone": target["client_phone"],
        "region": target.get("region"),
        "area": target.get("area"),
        "budget": target.get("budget"),
        "lead_type": target.get("lead_type"),
        "price": target.get("price", 10000)
    }
