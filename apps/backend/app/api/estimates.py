import uuid
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.calculator import RoomInput, calculate_smart_estimate
from app.services.pdf_service import render_estimate_html, generate_estimate_pdf

router = APIRouter(prefix="/estimates", tags=["Estimates"])

# In-memory mock store for development before database is connected
ESTIMATES_STORE: Dict[str, Any] = {}

@router.post("/calculate")
def calculate_estimate(room: RoomInput):
    result = calculate_smart_estimate(room)
    estimate_id = str(uuid.uuid4())

    # Create estimate object
    record = {
        "id": estimate_id,
        "room_name": room.roomName,
        "input": room.model_dump(),
        "result": result,
        "is_paid": False,
    }
    ESTIMATES_STORE[estimate_id] = record

    # Frontend receives blurred/locked package counts unless paid
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

@router.post("/{estimate_id}/unlock")
def unlock_estimate(estimate_id: str):
    if estimate_id not in ESTIMATES_STORE:
        raise HTTPException(status_code=404, detail="Smeta topilmadi")

    record = ESTIMATES_STORE[estimate_id]
    record["is_paid"] = True

    # Render PDF
    html = render_estimate_html({
        "estimate_number": estimate_id[:8].upper(),
        "master_brand_name": "ProFinish Uz",
        "master_phone": "+998 90 123 45 67",
        "created_date": "2026-10-16",
        "room_name": record["room_name"],
        "length": record["input"]["length"],
        "width": record["input"]["width"],
        "height": record["input"]["height"],
        "net_wall_area": record["result"]["geometry"]["net_wall_area"],
        "ceiling_area": record["result"]["geometry"]["ceiling_area"],
        "total_area": record["result"]["geometry"]["total_work_area"],
        "materials": [
            {
                "name": m["name"],
                "exact": m["exact"],
                "packages": m["packages"],
                "unit": m["unit"],
                "price_formatted": f"{m['unit_price']:,} so'm",
                "total_formatted": f"{m['total_price']:,} so'm"
            }
            for m in record["result"]["materials"]
        ],
        "labor_items": [
            {
                "name": l["name"],
                "area": l["area"],
                "rate_formatted": f"{l['rate']:,} so'm",
                "total_formatted": f"{l['total']:,} so'm"
            }
            for l in record["result"]["labor_items"]
        ],
        "materials_total_formatted": f"{record['result']['materials_total']:,} so'm",
        "labor_total": record["result"]["labor_total"],
        "labor_total_formatted": f"{record['result']['labor_total']:,} so'm",
        "grand_total_formatted": f"{record['result']['grand_total']:,} so'm",
    })

    pdf_file_path = f"estimate_{estimate_id[:8]}.pdf"
    generate_estimate_pdf(html, pdf_file_path)

    return {
        "status": "unlocked",
        "estimate_id": estimate_id,
        "is_paid": True,
        "pdf_download_url": f"/api/estimates/{estimate_id}/download",
        "raw_materials": record["result"]["materials"],
    }
