import math
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class MasterRates(BaseModel):
    puttyPerM2: int = 35000
    pautinkaPerM2: int = 20000
    paintPerM2: int = 25000
    tilePerM2: int = 90000
    plasterPerM2: int = 30000

class RoomInput(BaseModel):
    roomName: str = "Mehmonxona"
    length: float
    width: float
    height: float
    openingsArea: float = 0.0
    includeCeiling: bool = True
    workType: str = "paint_euro" # 'paint_euro', 'paint_standard', 'tile'
    tier: str = "standard"       # 'econom', 'standard', 'premium'
    includePlaster: bool = False
    plasterThicknessCm: float = 1.0
    masterRates: Optional[MasterRates] = None

def calculate_smart_estimate(data: RoomInput) -> Dict[str, Any]:
    l = max(0.1, data.length)
    w = max(0.1, data.width)
    h = max(0.1, data.height)
    openings = max(0.0, data.openingsArea)

    # 1. Bazaviy Geometriya Formulalari
    perimeter = round(2 * (l + w), 2)
    raw_wall_area = round(perimeter * h, 2)
    net_wall_area = round(max(0.0, raw_wall_area - openings), 2)
    ceiling_area = round(l * w, 2) if data.includeCeiling else 0.0
    floor_area = round(l * w, 2)
    door_width = 0.9 if openings > 0 else 0.0
    plinth_length = round(max(0.0, perimeter - door_width), 2)

    total_work_area = round(net_wall_area + ceiling_area, 2)
    tile_area = round(net_wall_area, 2)

    tier_mult = 1.35 if data.tier == "premium" else 0.85 if data.tier == "econom" else 1.0
    materials: List[Dict[str, Any]] = []

    # Gipsli suvoq (Rotband)
    if data.includePlaster and total_work_area > 0:
        thickness = data.plasterThicknessCm or 1.0
        plaster_kg = total_work_area * 8.5 * thickness
        plaster_bags = math.ceil(plaster_kg / 30)
        plaster_price = round(52000 * tier_mult)
        materials.append({
            "code": "plaster_rotband_30kg",
            "name": f"Gipsli suvoq (Rotband, {thickness} sm qatlam)",
            "unit": "qop",
            "exact": f"{plaster_kg:.1f} kg",
            "packages": plaster_bags,
            "unit_price": plaster_price,
            "total_price": plaster_bags * plaster_price,
        })

    # Bo'yoq va shpaklyovka
    if data.workType in ("paint_euro", "paint_standard"):
        # Gruntovka (3 qatlam)
        primer_liters = total_work_area * 0.15 * 3
        primer_cans = math.ceil(primer_liters / 10)
        primer_price = round(85000 * tier_mult)
        materials.append({
            "code": "primer_10l",
            "name": "Chuqur singdiruvchi Gruntovka (3 qatlam)",
            "unit": "kanistra",
            "exact": f"{primer_liters:.1f} litr",
            "packages": primer_cans,
            "unit_price": primer_price,
            "total_price": primer_cans * primer_price,
        })

        # Start shpaklyovka
        start_kg = total_work_area * 1.8
        start_bags = math.ceil(start_kg / 25)
        start_price = round(48000 * tier_mult)
        materials.append({
            "code": "start_putty_25kg",
            "name": "Start gipsli shpaklyovka (25 kg)",
            "unit": "qop",
            "exact": f"{start_kg:.1f} kg",
            "packages": start_bags,
            "unit_price": start_price,
            "total_price": start_bags * start_price,
        })

        if data.workType == "paint_euro":
            pautinka_m2 = total_work_area * 1.1
            pautinka_rolls = math.ceil(pautinka_m2 / 50)
            pautinka_price = round(240000 * tier_mult)
            materials.append({
                "code": "pautinka_50m2",
                "name": "Stekloxolst Pautinka 40g/m² (+10% zapas)",
                "unit": "rulon",
                "exact": f"{pautinka_m2:.1f} m²",
                "packages": pautinka_rolls,
                "unit_price": pautinka_price,
                "total_price": pautinka_rolls * pautinka_price,
            })

            glue_kg = total_work_area * 0.25
            glue_buckets = math.ceil(glue_kg / 10)
            glue_price = round(110000 * tier_mult)
            materials.append({
                "code": "pautinka_glue_10kg",
                "name": "Pautinka uchun maxsus kley (10 kg)",
                "unit": "paqir",
                "exact": f"{glue_kg:.1f} kg",
                "packages": glue_buckets,
                "unit_price": glue_price,
                "total_price": glue_buckets * glue_price,
            })

            pasta_kg = total_work_area * 0.8
            pasta_buckets = math.ceil(pasta_kg / 28)
            pasta_price = round(260000 * tier_mult)
            materials.append({
                "code": "finish_pasta_28kg",
                "name": "Super Finish tayyor pasta (28 kg)",
                "unit": "paqir",
                "exact": f"{pasta_kg:.1f} kg",
                "packages": pasta_buckets,
                "unit_price": pasta_price,
                "total_price": pasta_buckets * pasta_price,
            })
        else:
            finish_kg = total_work_area * 1.0
            finish_bags = math.ceil(finish_kg / 20)
            finish_price = round(65000 * tier_mult)
            materials.append({
                "code": "finish_putty_20kg",
                "name": "Finish quruq shpaklyovka (20 kg)",
                "unit": "qop",
                "exact": f"{finish_kg:.1f} kg",
                "packages": finish_bags,
                "unit_price": finish_price,
                "total_price": finish_bags * finish_price,
            })

        paint_liters = total_work_area * 0.28
        paint_buckets = math.ceil(paint_liters / 15)
        paint_price = round(420000 * tier_mult)
        materials.append({
            "code": "paint_15l",
            "name": "Yuviladigan matoviy emulsiya (15 L)",
            "unit": "paqir",
            "exact": f"{paint_liters:.1f} litr",
            "packages": paint_buckets,
            "unit_price": paint_price,
            "total_price": paint_buckets * paint_price,
        })

    # Kafel
    elif data.workType == "tile":
        primer_liters = tile_area * 0.15
        primer_cans = math.ceil(primer_liters / 10)
        primer_price = round(85000 * tier_mult)
        materials.append({
            "code": "primer_10l",
            "name": "Gruntovka / Betonkontakt (10 L)",
            "unit": "kanistra",
            "exact": f"{primer_liters:.1f} litr",
            "packages": primer_cans,
            "unit_price": primer_price,
            "total_price": primer_cans * primer_price,
        })

        tile_m2 = tile_area * 1.1
        tile_packs = math.ceil(tile_m2 / 1.44)
        tile_price = round(165000 * tier_mult)
        materials.append({
            "code": "tile_1_44m2",
            "name": "Kafel / Keramogranit (+10% kesishga)",
            "unit": "pachka",
            "exact": f"{tile_m2:.1f} m²",
            "packages": tile_packs,
            "unit_price": tile_price,
            "total_price": tile_packs * tile_price,
        })

        glue_kg = tile_area * 4.5
        glue_bags = math.ceil(glue_kg / 25)
        glue_price = round(55000 * tier_mult)
        materials.append({
            "code": "tile_glue_25kg",
            "name": "Kafel kleyi C2 (25 kg)",
            "unit": "qop",
            "exact": f"{glue_kg:.1f} kg",
            "packages": glue_bags,
            "unit_price": glue_price,
            "total_price": glue_bags * glue_price,
        })

    materials_total = sum(m["total_price"] for m in materials)

    # Usta ish haqi
    rates = data.masterRates or MasterRates()
    labor_items: List[Dict[str, Any]] = []

    if data.includePlaster and total_work_area > 0:
        p_rate = rates.plasterPerM2
        labor_items.append({
            "name": "Mayoq bo'yicha suvoq tortish",
            "area": total_work_area,
            "rate": p_rate,
            "total": round(total_work_area * p_rate)
        })

    if data.workType == "paint_euro":
        labor_items.append({
            "name": "Shpaklyovka surtish",
            "area": total_work_area,
            "rate": rates.puttyPerM2,
            "total": round(total_work_area * rates.puttyPerM2)
        })
        labor_items.append({
            "name": "Stekloxolst (Pautinka) yopishtirish",
            "area": total_work_area,
            "rate": rates.pautinkaPerM2,
            "total": round(total_work_area * rates.pautinkaPerM2)
        })
        labor_items.append({
            "name": "Emulsiya bo'yoq purkash (2 qatlam)",
            "area": total_work_area,
            "rate": rates.paintPerM2,
            "total": round(total_work_area * rates.paintPerM2)
        })
    elif data.workType == "paint_standard":
        labor_items.append({
            "name": "Start/Finish shpaklyovka surtish",
            "area": total_work_area,
            "rate": rates.puttyPerM2,
            "total": round(total_work_area * rates.puttyPerM2)
        })
        labor_items.append({
            "name": "Emulsiya bo'yoq surtish (2 qatlam)",
            "area": total_work_area,
            "rate": rates.paintPerM2,
            "total": round(total_work_area * rates.paintPerM2)
        })
    elif data.workType == "tile":
        labor_items.append({
            "name": "Kafel terish va chok to'ldirish",
            "area": tile_area,
            "rate": rates.tilePerM2,
            "total": round(tile_area * rates.tilePerM2)
        })

    labor_total = sum(item["total"] for item in labor_items)

    return {
        "geometry": {
            "perimeter": perimeter,
            "raw_wall_area": raw_wall_area,
            "net_wall_area": net_wall_area,
            "ceiling_area": ceiling_area,
            "floor_area": floor_area,
            "plinth_length": plinth_length,
            "total_work_area": total_work_area,
        },
        "materials": materials,
        "labor_items": labor_items,
        "materials_total": materials_total,
        "labor_total": labor_total,
        "grand_total": materials_total + labor_total,
    }
