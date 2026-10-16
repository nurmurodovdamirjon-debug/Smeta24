# Smeta24 Professional Hisoblash Dvigateli (2026 O'zbekiston standartlari va bozor narxlari)
# Dastur muallifi: Nurmurodov Damirjon

import math
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class RoomInput(BaseModel):
    roomName: str = "Mehmonxona"
    length: float = 5.0
    width: float = 4.0
    height: float = 3.0
    openingsArea: float = 4.0

    # 1. Shift ishlari
    ceilingWork: str = "gipsokarton_plain"  # 'none', 'paint_roller', 'paint_spray', 'gipsokarton_plain', 'gipsokarton_decor', 'stretch'
    
    # 2. Devor ishlari
    wallWork: str = "paint_roller"          # 'none', 'paint_roller', 'paint_spray', 'wallpaper', 'tile', 'paint_standard'
    includePlaster: bool = False            # Mayoq bo'yicha gipsli suvoq (Rotband)
    includePautinka: bool = True            # Stekloxolst (pautinka)
    plasterThicknessCm: float = 1.0

    # 3. Pol ishlari
    floorWork: str = "laminate"             # 'none', 'laminate', 'parquet', 'tile'
    includeScreed: bool = False             # Pol steshkasi (5 sm)
    includeSelfLeveling: bool = False       # Nalivnoy pol (3 mm)

    tier: str = "standard"                  # 'econom', 'standard', 'premium'

    # Usta stavkalari
    masterRates: Optional[Dict[str, float]] = None

    # Tuman / Do'kon material narxlari
    materialPrices: Optional[Dict[str, float]] = None

    # Eski versiyalar bilan moslik uchun:
    includeCeiling: Optional[bool] = None
    workType: Optional[str] = None


DEFAULT_MASTER_RATES: Dict[str, float] = {
    # Shift
    "ceiling_paint_roller": 25000,
    "ceiling_paint_spray": 35000,
    "ceiling_gipsokarton_plain": 50000,
    "ceiling_gipsokarton_decor": 85000,
    "ceiling_stretch": 65000,

    # Devor
    "wall_paint_roller": 30000,
    "wall_paint_spray": 40000,
    "wall_wallpaper": 30000,
    "wall_tile": 90000,
    "wall_paint_standard": 25000,
    "wall_plaster": 35000,
    "wall_pautinka": 20000,

    # Pol
    "floor_screed": 35000,
    "floor_self_leveling": 20000,
    "floor_laminate": 25000,
    "floor_parquet": 85000,
    "floor_tile": 95000,
}


def calculate_smart_estimate(input_data: RoomInput) -> Dict[str, Any]:
    l = max(0.1, input_data.length)
    w = max(0.1, input_data.width)
    h = max(0.1, input_data.height)
    openings = max(0.0, input_data.openingsArea)

    # Moslik tekshiruvi:
    ceiling_work = input_data.ceilingWork
    wall_work = input_data.wallWork
    floor_work = input_data.floorWork

    if input_data.includeCeiling is False:
        ceiling_work = "none"
    if input_data.workType:
        if input_data.workType == "paint_euro":
            wall_work = "paint_roller"
        elif input_data.workType == "paint_standard":
            wall_work = "paint_standard"
        elif input_data.workType == "tile":
            wall_work = "tile"

    # 1. Geometriya
    perimeter = round(2 * (l + w), 2)
    raw_wall_area = round(perimeter * h, 2)
    net_wall_area = round(max(0.0, raw_wall_area - openings), 2)
    ceiling_area = round(l * w, 2)
    floor_area = round(l * w, 2)
    door_width = 0.9 if openings > 0 else 0.0
    plinth_length = round(max(0.0, perimeter - door_width), 2)
    total_work_area = round(net_wall_area + (ceiling_area if ceiling_work != "none" else 0.0), 2)

    tier_mult = 1.35 if input_data.tier == "premium" else 0.85 if input_data.tier == "econom" else 1.0
    rates = dict(DEFAULT_MASTER_RATES)
    if input_data.masterRates:
        rates.update(input_data.masterRates)

    materials: List[Dict[str, Any]] = []
    labor_items: List[Dict[str, Any]] = []

    # ========================================================
    # 1. SHIFT (CEILING) ISHLARI
    # ========================================================
    if ceiling_work == "paint_roller" or ceiling_work == "paint_spray":
        is_spray = ceiling_work == "paint_spray"

        # Gruntovka
        primer_l = ceiling_area * 0.15 * 2
        primer_cans = math.ceil(primer_l / 10)
        p_price = round(85000 * tier_mult)
        materials.append({
            "code": "ceiling_primer_10l",
            "name": "Shift uchun chuqur singuvchi gruntovka (10 L)",
            "category": "ceiling",
            "unit": "kanistra",
            "exact": f"{primer_l:.1f} litr",
            "packages": primer_cans,
            "unit_price": p_price,
            "total_price": primer_cans * p_price,
        })

        # Start shpaklyovka
        start_kg = ceiling_area * 1.5
        start_bags = math.ceil(start_kg / 25)
        st_price = round(48000 * tier_mult)
        materials.append({
            "code": "ceiling_start_putty_25kg",
            "name": "Shift uchun gipsli shpaklyovka (25 kg)",
            "category": "ceiling",
            "unit": "qop",
            "exact": f"{start_kg:.1f} kg",
            "packages": start_bags,
            "unit_price": st_price,
            "total_price": start_bags * st_price,
        })

        # Finish pasta
        pasta_kg = ceiling_area * 0.9
        pasta_pails = math.ceil(pasta_kg / 28)
        ps_price = round(260000 * tier_mult)
        materials.append({
            "code": "ceiling_finish_pasta_28kg",
            "name": "Super Finish polimer pasta (28 kg)",
            "category": "ceiling",
            "unit": "paqir",
            "exact": f"{pasta_kg:.1f} kg",
            "packages": pasta_pails,
            "unit_price": ps_price,
            "total_price": pasta_pails * ps_price,
        })

        # Shift bo'yog'i
        paint_l = ceiling_area * (0.22 if is_spray else 0.26)
        paint_pails = math.ceil(paint_l / 15)
        pt_price = round(380000 * tier_mult)
        materials.append({
            "code": "ceiling_paint_white_15l",
            "name": f"Shift uchun qor-oq matoviy kraska (15 L, {'Kraskapult' if is_spray else 'Valik'})",
            "category": "ceiling",
            "unit": "paqir",
            "exact": f"{paint_l:.1f} litr",
            "packages": paint_pails,
            "unit_price": pt_price,
            "total_price": paint_pails * pt_price,
        })

        rate_key = "ceiling_paint_spray" if is_spray else "ceiling_paint_roller"
        rate = rates.get(rate_key, 35000 if is_spray else 25000)
        labor_items.append({
            "id": f"labor_{rate_key}",
            "name": f"Shiftni shpaklyovkalash va bo'yash ({'Kraskapultda purkash' if is_spray else 'Valikda'})",
            "category": "ceiling",
            "area": ceiling_area,
            "unit_str": "m²",
            "rate_per_m2": rate,
            "total_price": round(ceiling_area * rate),
        })

    elif ceiling_work in ("gipsokarton_plain", "gipsokarton_decor"):
        is_decor = ceiling_work == "gipsokarton_decor"
        area_mult = 1.35 if is_decor else 1.05

        # Gipskarton listlari Knauf 9.5mm (2.4 x 1.2 = 2.88 m2)
        gips_sheets = math.ceil((ceiling_area * area_mult) / 2.88)
        sheet_price = round(52000 * tier_mult)
        materials.append({
            "code": "gypsum_board_9_5mm",
            "name": f"Knauf Gipskarton listi 9.5mm (2.5x1.2m) — {'2-qavatli figurali' if is_decor else 'Tekis'}",
            "category": "ceiling",
            "unit": "dona",
            "exact": f"{ceiling_area * area_mult:.1f} m²",
            "packages": gips_sheets,
            "unit_price": sheet_price,
            "total_price": gips_sheets * sheet_price,
        })

        # Profil UD (28x27)
        ud_length = perimeter * (2.2 if is_decor else 1.2)
        ud_pcs = math.ceil(ud_length / 3.0)
        ud_price = round(18000 * tier_mult)
        materials.append({
            "code": "profile_ud_3m",
            "name": "Yo'naltiruvchi profil UD 28/27 (3 metr)",
            "category": "ceiling",
            "unit": "dona",
            "exact": f"{ud_length:.1f} m",
            "packages": ud_pcs,
            "unit_price": ud_price,
            "total_price": ud_pcs * ud_price,
        })

        # Profil CD (60x27)
        cd_length = ceiling_area * (3.8 if is_decor else 2.6)
        cd_pcs = math.ceil(cd_length / 3.0)
        cd_price = round(26000 * tier_mult)
        materials.append({
            "code": "profile_cd_3m",
            "name": "Shift karkas profili CD 60/27 (3 metr)",
            "category": "ceiling",
            "unit": "dona",
            "exact": f"{cd_length:.1f} m",
            "packages": cd_pcs,
            "unit_price": cd_price,
            "total_price": cd_pcs * cd_price,
        })

        # Tyaga / Podves
        hangers = math.ceil(ceiling_area * (4.5 if is_decor else 3.0))
        h_price = round(3000 * tier_mult)
        materials.append({
            "code": "hanger_direct",
            "name": "To'g'ridan-to'g'ri osgich (Podves ES 60/125)",
            "category": "ceiling",
            "unit": "dona",
            "exact": f"{hangers} dona",
            "packages": hangers,
            "unit_price": h_price,
            "total_price": hangers * h_price,
        })

        # Samorezlar
        screws_packs = math.ceil(ceiling_area / 18.0)
        sc_price = round(45000 * tier_mult)
        materials.append({
            "code": "screws_gypsum_pack",
            "name": "Metall-gips samorezlari 3.5x25 (1000 dona/quti)",
            "category": "ceiling",
            "unit": "quti",
            "exact": f"{screws_packs} quti",
            "packages": screws_packs,
            "unit_price": sc_price,
            "total_price": screws_packs * sc_price,
        })

        # Fugenfyuller Knauf choklar uchun
        fugen_bags = math.ceil(ceiling_area / 20.0)
        fg_price = round(65000 * tier_mult)
        materials.append({
            "code": "fugen_knauf_25kg",
            "name": "Knauf Fugen shpaklyovkasi choklar uchun (25 kg)",
            "category": "ceiling",
            "unit": "qop",
            "exact": f"{fugen_bags} qop",
            "packages": fugen_bags,
            "unit_price": fg_price,
            "total_price": fugen_bags * fg_price,
        })

        # Serpyanka
        serp_rolls = math.ceil(ceiling_area / 25.0)
        materials.append({
            "code": "serpyanka_tape_45m",
            "name": "Serpyanka lenta armatura choklari uchun (45 m)",
            "category": "ceiling",
            "unit": "rulon",
            "exact": f"{serp_rolls} rulon",
            "packages": serp_rolls,
            "unit_price": 20000,
            "total_price": serp_rolls * 20000,
        })

        rate_key = "ceiling_gipsokarton_decor" if is_decor else "ceiling_gipsokarton_plain"
        rate = rates.get(rate_key, 85000 if is_decor else 50000)
        labor_items.append({
            "id": f"labor_{rate_key}",
            "name": f"Shiftga gipskarton karkas terish va montaj ({'Figurali/2-qavat' if is_decor else 'Tekis/1-qavat'})",
            "category": "ceiling",
            "area": ceiling_area,
            "unit_str": "m²",
            "rate_per_m2": rate,
            "total_price": round(ceiling_area * rate),
        })

    elif ceiling_work == "stretch":
        stretch_m2 = ceiling_area
        st_price = round(65000 * tier_mult)
        materials.append({
            "code": "stretch_ceiling_pack",
            "name": "Natyajnoy potolok (Premium MSD plyonka + baget + o'rnatish)",
            "category": "ceiling",
            "unit": "m²",
            "exact": f"{stretch_m2:.1f} m²",
            "packages": math.ceil(stretch_m2),
            "unit_price": st_price,
            "total_price": math.ceil(stretch_m2) * st_price,
        })

        rate = rates.get("ceiling_stretch", 65000)
        labor_items.append({
            "id": "labor_ceiling_stretch",
            "name": "Natyajnoy potolok o'rnatish va lyustra karkasi",
            "category": "ceiling",
            "area": ceiling_area,
            "unit_str": "m²",
            "rate_per_m2": rate,
            "total_price": round(ceiling_area * rate),
        })

    # ========================================================
    # 2. DEVOR (WALL) ISHLARI
    # ========================================================
    if input_data.includePlaster and net_wall_area > 0:
        thick = input_data.plasterThicknessCm or 1.0
        plaster_kg = net_wall_area * 8.5 * thick
        plaster_bags = math.ceil(plaster_kg / 30)
        pl_price = round(52000 * tier_mult)
        materials.append({
            "code": "wall_plaster_rotband_30kg",
            "name": f"Mayoq bo'yicha gipsli suvoq Rotband ({thick} sm)",
            "category": "plaster",
            "unit": "qop",
            "exact": f"{plaster_kg:.1f} kg",
            "packages": plaster_bags,
            "unit_price": pl_price,
            "total_price": plaster_bags * pl_price,
        })

        beacons = math.ceil(perimeter / 1.2)
        materials.append({
            "code": "plaster_beacons_3m",
            "name": "Suvoq mayoqlari 6mm metall (3 metr)",
            "category": "plaster",
            "unit": "dona",
            "exact": f"{beacons} dona",
            "packages": beacons,
            "unit_price": 7000,
            "total_price": beacons * 7000,
        })

        p_rate = rates.get("wall_plaster", 35000)
        labor_items.append({
            "id": "labor_wall_plaster",
            "name": "Devorlarga mayoq bo'yicha gipsli suvoq (Rotband) tortish",
            "category": "wall",
            "area": net_wall_area,
            "unit_str": "m²",
            "rate_per_m2": p_rate,
            "total_price": round(net_wall_area * p_rate),
        })

    if wall_work != "none" and net_wall_area > 0:
        # Gruntovka
        primer_l = net_wall_area * 0.15 * 2
        primer_cans = math.ceil(primer_l / 10)
        p_price = round(85000 * tier_mult)
        materials.append({
            "code": "wall_primer_10l",
            "name": "Devor uchun chuqur singuvchi gruntovka (10 L)",
            "category": "wall",
            "unit": "kanistra",
            "exact": f"{primer_l:.1f} litr",
            "packages": primer_cans,
            "unit_price": p_price,
            "total_price": primer_cans * p_price,
        })

        if wall_work in ("paint_roller", "paint_spray"):
            is_spray = wall_work == "paint_spray"

            # Start shpaklyovka
            start_kg = net_wall_area * 1.6
            start_bags = math.ceil(start_kg / 25)
            materials.append({
                "code": "wall_start_putty_25kg",
                "name": "Devor uchun start gipsli shpaklyovka (25 kg)",
                "category": "wall",
                "unit": "qop",
                "exact": f"{start_kg:.1f} kg",
                "packages": start_bags,
                "unit_price": 48000,
                "total_price": start_bags * 48000,
            })

            # Pautinka
            if input_data.includePautinka:
                paut_m2 = net_wall_area * 1.1
                paut_rolls = math.ceil(paut_m2 / 50)
                materials.append({
                    "code": "wall_pautinka_50m2",
                    "name": "Stekloxolst Pautinka 40g/m² yoriqlarga qarshi",
                    "category": "wall",
                    "unit": "rulon",
                    "exact": f"{paut_m2:.1f} m²",
                    "packages": paut_rolls,
                    "unit_price": 240000,
                    "total_price": paut_rolls * 240000,
                })

                glue_kg = net_wall_area * 0.25
                glue_pails = math.ceil(glue_kg / 10)
                materials.append({
                    "code": "wall_pautinka_glue_10kg",
                    "name": "Pautinka uchun maxsus tayyor kley (10 kg)",
                    "category": "wall",
                    "unit": "paqir",
                    "exact": f"{glue_kg:.1f} kg",
                    "packages": glue_pails,
                    "unit_price": 110000,
                    "total_price": glue_pails * 110000,
                })

            # Finish pasta
            pasta_kg = net_wall_area * 0.8
            pasta_pails = math.ceil(pasta_kg / 28)
            materials.append({
                "code": "wall_finish_pasta_28kg",
                "name": "Super Finish polimer pasta devor uchun (28 kg)",
                "category": "wall",
                "unit": "paqir",
                "exact": f"{pasta_kg:.1f} kg",
                "packages": pasta_pails,
                "unit_price": 260000,
                "total_price": pasta_pails * 260000,
            })

            # Devor bo'yog'i
            paint_l = net_wall_area * (0.24 if is_spray else 0.28)
            paint_pails = math.ceil(paint_l / 15)
            materials.append({
                "code": "wall_paint_15l",
                "name": f"Devor uchun premium yuviladigan mat emulsiya (15 L, {'Kraskapult' if is_spray else 'Valik'})",
                "category": "wall",
                "unit": "paqir",
                "exact": f"{paint_l:.1f} litr",
                "packages": paint_pails,
                "unit_price": 420000,
                "total_price": paint_pails * 420000,
            })

            rate_key = "wall_paint_spray" if is_spray else "wall_paint_roller"
            rate = rates.get(rate_key, 40000 if is_spray else 30000)
            labor_items.append({
                "id": f"labor_{rate_key}",
                "name": f"Devorni shpaklyovkalash va bo'yash ({'Kraskapultda sepish' if is_spray else 'Valikda'})",
                "category": "wall",
                "area": net_wall_area,
                "unit_str": "m²",
                "rate_per_m2": rate,
                "total_price": round(net_wall_area * rate),
            })

            if input_data.includePautinka:
                p_rate = rates.get("wall_pautinka", 20000)
                labor_items.append({
                    "id": "labor_wall_pautinka",
                    "name": "Devorga stekloxolst (Pautinka) yopishtirish",
                    "category": "wall",
                    "area": net_wall_area,
                    "unit_str": "m²",
                    "rate_per_m2": p_rate,
                    "total_price": round(net_wall_area * p_rate),
                })

        elif wall_work == "wallpaper":
            start_kg = net_wall_area * 1.5
            start_bags = math.ceil(start_kg / 25)
            materials.append({
                "code": "wall_putty_wallpaper_25kg",
                "name": "Oboy ostiga gipsli shpaklyovka (25 kg)",
                "category": "wall",
                "unit": "qop",
                "exact": f"{start_kg:.1f} kg",
                "packages": start_bags,
                "unit_price": 48000,
                "total_price": start_bags * 48000,
            })

            rolls_exact = net_wall_area / 5.0
            rolls = math.ceil(rolls_exact)
            materials.append({
                "code": "wallpaper_flizelin_roll",
                "name": "Vinil / Flizelin oboy 1.06m x 10m (+10% zapas)",
                "category": "wall",
                "unit": "rulon",
                "exact": f"{rolls_exact:.1f} rulon",
                "packages": rolls,
                "unit_price": 180000,
                "total_price": rolls * 180000,
            })

            glue_packs = math.ceil(net_wall_area / 30.0)
            materials.append({
                "code": "wallpaper_glue_pack",
                "name": "Metylan / Kelid flizelin oboy kleyi (paket)",
                "category": "wall",
                "unit": "quti",
                "exact": f"{glue_packs} quti",
                "packages": glue_packs,
                "unit_price": 45000,
                "total_price": glue_packs * 45000,
            })

            rate = rates.get("wall_wallpaper", 30000)
            labor_items.append({
                "id": "labor_wall_wallpaper",
                "name": "Devorni tayyorlash va vinil/flizelin oboy yopishtirish",
                "category": "wall",
                "area": net_wall_area,
                "unit_str": "m²",
                "rate_per_m2": rate,
                "total_price": round(net_wall_area * rate),
            })

        elif wall_work == "tile":
            tile_m2 = net_wall_area * 1.10
            tile_packs = math.ceil(tile_m2 / 1.44)
            materials.append({
                "code": "wall_tile_pack",
                "name": "Devor kafel / keramogranit (+10% zapas)",
                "category": "wall",
                "unit": "pachka",
                "exact": f"{tile_m2:.1f} m²",
                "packages": tile_packs,
                "unit_price": 165000,
                "total_price": tile_packs * 165000,
            })

            glue_bags = math.ceil((net_wall_area * 4.5) / 25)
            materials.append({
                "code": "wall_tile_glue_25kg",
                "name": "Kafel kleyi C2 kuchaytirilgan (25 kg)",
                "category": "wall",
                "unit": "qop",
                "exact": f"{net_wall_area * 4.5:.1f} kg",
                "packages": glue_bags,
                "unit_price": 55000,
                "total_price": glue_bags * 55000,
            })

            materials.append({
                "code": "wall_tile_grout_2kg",
                "name": "Chok to'ldirgich Zatirka Ceresit CE40 (2 kg)",
                "category": "wall",
                "unit": "paqir",
                "exact": "2 paqir",
                "packages": 2,
                "unit_price": 35000,
                "total_price": 70000,
            })

            rate = rates.get("wall_tile", 90000)
            labor_items.append({
                "id": "labor_wall_tile",
                "name": "Devorga kafel terish va choklarini to'ldirish (zatirka)",
                "category": "wall",
                "area": net_wall_area,
                "unit_str": "m²",
                "rate_per_m2": rate,
                "total_price": round(net_wall_area * rate),
            })

        elif wall_work == "paint_standard":
            start_kg = net_wall_area * 1.5
            start_bags = math.ceil(start_kg / 25)
            materials.append({
                "code": "wall_start_putty_25kg",
                "name": "Start shpaklyovka (25 kg)",
                "category": "wall",
                "unit": "qop",
                "exact": f"{start_kg:.1f} kg",
                "packages": start_bags,
                "unit_price": 48000,
                "total_price": start_bags * 48000,
            })

            finish_kg = net_wall_area * 1.0
            finish_bags = math.ceil(finish_kg / 20)
            materials.append({
                "code": "wall_finish_putty_20kg",
                "name": "Finish quruq shpaklyovka (20 kg)",
                "category": "wall",
                "unit": "qop",
                "exact": f"{finish_kg:.1f} kg",
                "packages": finish_bags,
                "unit_price": 65000,
                "total_price": finish_bags * 65000,
            })

            paint_l = net_wall_area * 0.28
            paint_pails = math.ceil(paint_l / 15)
            materials.append({
                "code": "wall_paint_15l",
                "name": "Matoviy emulsiya (15 L)",
                "category": "wall",
                "unit": "paqir",
                "exact": f"{paint_l:.1f} litr",
                "packages": paint_pails,
                "unit_price": 320000,
                "total_price": paint_pails * 320000,
            })

            rate = rates.get("wall_paint_standard", 25000)
            labor_items.append({
                "id": "labor_wall_paint_standard",
                "name": "Standart shpaklyovka va bo'yash",
                "category": "wall",
                "area": net_wall_area,
                "unit_str": "m²",
                "rate_per_m2": rate,
                "total_price": round(net_wall_area * rate),
            })

    # ========================================================
    # 3. POL (FLOOR) ISHLARI
    # ========================================================
    if floor_area > 0:
        # Pol steshkasi (5 sm)
        if input_data.includeScreed:
            cement_bags = math.ceil(floor_area * 0.40)
            materials.append({
                "code": "screed_cement_m400_50kg",
                "name": "Sement M400 styajka uchun (50 kg)",
                "category": "floor",
                "unit": "qop",
                "exact": f"{cement_bags} qop",
                "packages": cement_bags,
                "unit_price": 45000,
                "total_price": cement_bags * 45000,
            })

            sand_tons = math.ceil(floor_area * 0.08)
            materials.append({
                "code": "screed_sand_ton",
                "name": "Yuvilgan daryo qumi (tonna)",
                "category": "floor",
                "unit": "tonna",
                "exact": f"{sand_tons} t",
                "packages": sand_tons,
                "unit_price": 140000,
                "total_price": sand_tons * 140000,
            })

            materials.append({
                "code": "screed_mesh_50x50",
                "name": "Metall armatura to'ri (styajka mustahkamligi uchun)",
                "category": "floor",
                "unit": "m²",
                "exact": f"{floor_area} m²",
                "packages": math.ceil(floor_area),
                "unit_price": 12000,
                "total_price": math.ceil(floor_area) * 12000,
            })

            s_rate = rates.get("floor_screed", 35000)
            labor_items.append({
                "id": "labor_floor_screed",
                "name": "Mayoq bo'yicha beton pol styajkasi quyish (5 sm)",
                "category": "floor",
                "area": floor_area,
                "unit_str": "m²",
                "rate_per_m2": s_rate,
                "total_price": round(floor_area * s_rate),
            })

        # Nalivnoy pol
        if input_data.includeSelfLeveling:
            self_bags = math.ceil((floor_area * 4.5) / 25)
            materials.append({
                "code": "floor_self_leveling_25kg",
                "name": "Nalivnoy pol tez qotuvchi samonivelir (25 kg)",
                "category": "floor",
                "unit": "qop",
                "exact": f"{floor_area * 4.5:.1f} kg",
                "packages": self_bags,
                "unit_price": 65000,
                "total_price": self_bags * 65000,
            })

            materials.append({
                "code": "floor_primer_betonkontakt_10l",
                "name": "Betonkontakt mustahkamlovchi gruntovka (10 L)",
                "category": "floor",
                "unit": "kanistra",
                "exact": "1 kanistra",
                "packages": 1,
                "unit_price": 95000,
                "total_price": 95000,
            })

            nl_rate = rates.get("floor_self_leveling", 20000)
            labor_items.append({
                "id": "labor_floor_self_leveling",
                "name": "Nalivnoy pol quyish va ignali valikda tekislash",
                "category": "floor",
                "area": floor_area,
                "unit_str": "m²",
                "rate_per_m2": nl_rate,
                "total_price": round(floor_area * nl_rate),
            })

        # Laminat
        if floor_work == "laminate":
            lam_m2 = floor_area * 1.08
            lam_packs = math.ceil(lam_m2 / 2.13)
            materials.append({
                "code": "laminate_33class_pack",
                "name": "Laminat 33-klass faskali (2.13 m²/pachka)",
                "category": "floor",
                "unit": "pachka",
                "exact": f"{lam_m2:.1f} m²",
                "packages": lam_packs,
                "unit_price": round(120000 * 2.13),
                "total_price": lam_packs * round(120000 * 2.13),
            })

            sub_packs = math.ceil(floor_area / 10.0)
            materials.append({
                "code": "laminate_subfloor_pack",
                "name": "Laminat osti podlojkasi 3mm XPS (10 m²)",
                "category": "floor",
                "unit": "pachka",
                "exact": f"{sub_packs} pachka",
                "packages": sub_packs,
                "unit_price": 45000,
                "total_price": sub_packs * 45000,
            })

            plinth_pcs = math.ceil(plinth_length / 2.5)
            materials.append({
                "code": "plinth_plastic_2_5m",
                "name": "Kabel-kanalli plastik plintus (2.5 metr)",
                "category": "floor",
                "unit": "dona",
                "exact": f"{plinth_length:.1f} m",
                "packages": plinth_pcs,
                "unit_price": 22000,
                "total_price": plinth_pcs * 22000,
            })

            rate = rates.get("floor_laminate", 25000)
            labor_items.append({
                "id": "labor_floor_laminate",
                "name": "Laminat va plintus montaj qilish",
                "category": "floor",
                "area": floor_area,
                "unit_str": "m²",
                "rate_per_m2": rate,
                "total_price": round(floor_area * rate),
            })

        # Parket
        elif floor_work == "parquet":
            parq_m2 = floor_area * 1.08
            materials.append({
                "code": "parquet_board_m2",
                "name": "Parket taxtasi / Inzhenernaya doska eman (m²)",
                "category": "floor",
                "unit": "m²",
                "exact": f"{parq_m2:.1f} m²",
                "packages": math.ceil(parq_m2),
                "unit_price": 280000,
                "total_price": math.ceil(parq_m2) * 280000,
            })

            glue_pails = math.ceil(floor_area / 11.0)
            materials.append({
                "code": "parquet_glue_14kg",
                "name": "Poliuretan 2-komponentli parket yelimi (14 kg)",
                "category": "floor",
                "unit": "paqir",
                "exact": f"{glue_pails} paqir",
                "packages": glue_pails,
                "unit_price": 420000,
                "total_price": glue_pails * 420000,
            })

            plinth_pcs = math.ceil(plinth_length / 2.4)
            materials.append({
                "code": "plinth_wood_2_4m",
                "name": "Yog'och / MDF shponli parket plintusi (2.4 m)",
                "category": "floor",
                "unit": "dona",
                "exact": f"{plinth_length:.1f} m",
                "packages": plinth_pcs,
                "unit_price": 45000,
                "total_price": plinth_pcs * 45000,
            })

            rate = rates.get("floor_parquet", 85000)
            labor_items.append({
                "id": "labor_floor_parquet",
                "name": "Parket yotqizish, yelimlash va plintus o'rnatish",
                "category": "floor",
                "area": floor_area,
                "unit_str": "m²",
                "rate_per_m2": rate,
                "total_price": round(floor_area * rate),
            })

        # Kafel pol
        elif floor_work == "tile":
            tile_m2 = floor_area * 1.10
            tile_packs = math.ceil(tile_m2 / 1.44)
            materials.append({
                "code": "floor_tile_pack",
                "name": "Pol uchun keramogranit / kafel (+10% zapas)",
                "category": "floor",
                "unit": "pachka",
                "exact": f"{tile_m2:.1f} m²",
                "packages": tile_packs,
                "unit_price": round(135000 * 1.44),
                "total_price": tile_packs * round(135000 * 1.44),
            })

            glue_bags = math.ceil(floor_area / 4.5)
            materials.append({
                "code": "floor_tile_glue_25kg",
                "name": "Pol uchun kuchaytirilgan elastik kafel kleyi (25 kg)",
                "category": "floor",
                "unit": "qop",
                "exact": f"{glue_bags} qop",
                "packages": glue_bags,
                "unit_price": 55000,
                "total_price": glue_bags * 55000,
            })

            rate = rates.get("floor_tile", 95000)
            labor_items.append({
                "id": "labor_floor_tile",
                "name": "Polga keramogranit / kafel yotqizish va zatirka",
                "category": "floor",
                "area": floor_area,
                "unit_str": "m²",
                "rate_per_m2": rate,
                "total_price": round(floor_area * rate),
            })

    materials_total = sum(m["total_price"] for m in materials)
    labor_total = sum(item["total_price"] for item in labor_items)

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
