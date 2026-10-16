export type WorkType = 'paint_euro' | 'paint_standard' | 'tile';
export type QualityTier = 'econom' | 'standard' | 'premium';

export interface RoomInput {
  roomName: string;
  length: number;        // Uzunligi (m)
  width: number;         // Eni (m)
  height: number;        // Balandligi (m)
  openingsArea: number;  // Eshik va derazalar jami yuzasi (m2)
  includeCeiling: boolean;
  workType: WorkType;
  tier?: QualityTier;
  includePlaster?: boolean;       // Gipsli suvoq (Rotband) kerakmi
  plasterThicknessCm?: number;    // Suvoq qalinligi (sm)
  masterRates?: {
    puttyPerM2: number;
    pautinkaPerM2: number;
    paintPerM2: number;
    tilePerM2: number;
    plasterPerM2?: number;
  };
}

export interface MaterialItem {
  code: string;
  name: string;
  category: 'primer' | 'plaster' | 'putty' | 'paint' | 'tile' | 'accessory';
  unit: string;
  exactAmount: number;
  exactUnitStr: string;
  packagesCount: number;
  packageSize: string;
  unitPrice: number;
  totalPrice: number;
  description?: string;
}

export interface LaborItem {
  id: string;
  name: string;
  area: number;
  ratePerM2: number;
  totalPrice: number;
}

export interface EstimateResult {
  geometry: {
    perimeter: number;
    rawWallArea: number;
    netWallArea: number;
    ceilingArea: number;
    floorArea: number;
    plinthLength: number;
    totalWorkArea: number;
  };
  materials: MaterialItem[];
  laborItems: LaborItem[];
  materialsTotal: number;
  laborTotal: number;
  laborPerM2: number;
  grandTotal: number;
}

export function calculateSmartEstimate(input: RoomInput): EstimateResult {
  const length = Math.max(0.1, input.length || 0);
  const width = Math.max(0.1, input.width || 0);
  const height = Math.max(0.1, input.height || 0);
  const openingsArea = Math.max(0, input.openingsArea || 0);
  const tier = input.tier || 'standard';

  // 1. Bazaviy Geometriya Formulalari
  const perimeter = Number((2 * (length + width)).toFixed(2));
  const rawWallArea = Number((perimeter * height).toFixed(2));
  const netWallArea = Number(Math.max(0, rawWallArea - openingsArea).toFixed(2));
  const ceilingArea = input.includeCeiling ? Number((length * width).toFixed(2)) : 0;
  const floorArea = Number((length * width).toFixed(2));
  // Plintus: Perimetr - taxminan 1 dona eshik eni (0.9m)
  const estimatedDoorWidth = openingsArea > 0 ? 0.9 : 0;
  const plinthLength = Number(Math.max(0, perimeter - estimatedDoorWidth).toFixed(2));

  // Jami ish yuzasi: Bo'yoq/shpaklyovkada devor + (agar belgilangan bo'lsa) shift. Kafelda asosan devor (yoki pol)
  const totalWorkArea = Number((netWallArea + ceilingArea).toFixed(2));
  const tileArea = Number((netWallArea).toFixed(2)); // sanuzelda devor yuzasi yoki alohida pol

  const materials: MaterialItem[] = [];

  // Narx koeffitsiyenti (Ekonom, Standart, Premium)
  const tierMultiplier = tier === 'premium' ? 1.35 : tier === 'econom' ? 0.85 : 1.0;

  // GIPSLI SUVOQ (ROTBAND) — Agar tanlangan bo'lsa
  if (input.includePlaster && totalWorkArea > 0) {
    const thickness = input.plasterThicknessCm || 1.0;
    // Sarf: 1 sm (10mm) uchun 8.5 kg / m2. 30 kg qop
    const plasterKg = totalWorkArea * 8.5 * thickness;
    const plasterBags = Math.ceil(plasterKg / 30);
    const plasterPrice = Math.round(52000 * tierMultiplier);

    materials.push({
      code: 'plaster_rotband_30kg',
      name: `Gipsli suvoq (Rotband/Knauf, ${thickness} sm qatlam)`,
      category: 'plaster',
      unit: 'qop',
      exactAmount: Number(plasterKg.toFixed(1)),
      exactUnitStr: `${plasterKg.toFixed(1)} kg`,
      packagesCount: plasterBags,
      packageSize: '30 kg',
      unitPrice: plasterPrice,
      totalPrice: plasterBags * plasterPrice,
      description: 'Devorlarni mayoq bo\'yicha tekislash uchun gipsli qorishma'
    });
  }

  // BO'YOQ VA SHPAKLYOVKA ISHLARI
  if (input.workType === 'paint_euro' || input.workType === 'paint_standard') {
    // 1. Gruntovka (3 qatlam: startdan oldin, finishdan oldin, bo'yoqdan oldin)
    const primerCoats = 3;
    const primerLiters = totalWorkArea * 0.15 * primerCoats;
    const primerCans = Math.ceil(primerLiters / 10);
    const primerPrice = Math.round(85000 * tierMultiplier);

    materials.push({
      code: 'primer_deep_10l',
      name: 'Chuqur singdiruvchi Gruntovka (3 qatlam)',
      category: 'primer',
      unit: 'kanistra',
      exactAmount: Number(primerLiters.toFixed(1)),
      exactUnitStr: `${primerLiters.toFixed(1)} litr`,
      packagesCount: primerCans,
      packageSize: '10 L',
      unitPrice: primerPrice,
      totalPrice: primerCans * primerPrice,
      description: 'Yuzani mustahkamlash va changni yo\'qotish uchun'
    });

    // 2. Start shpaklyovka (1.8 kg/m2, 25 kg qop)
    const startKg = totalWorkArea * 1.8;
    const startBags = Math.ceil(startKg / 25);
    const startPrice = Math.round(48000 * tierMultiplier);

    materials.push({
      code: 'start_putty_25kg',
      name: 'Start gipsli shpaklyovka (2 mm)',
      category: 'putty',
      unit: 'qop',
      exactAmount: Number(startKg.toFixed(1)),
      exactUnitStr: `${startKg.toFixed(1)} kg`,
      packagesCount: startBags,
      packageSize: '25 kg',
      unitPrice: startPrice,
      totalPrice: startBags * startPrice,
      description: 'Yoriqlarni to\'ldirish va asosiy tekislash qatlami'
    });

    // 3. Finish qatlami
    if (input.workType === 'paint_euro') {
      // Yevroremont: Pautinka + Maxsus kley + Super Finish tayyor pasta
      const pautinkaM2 = totalWorkArea * 1.1; // +10% zapas
      const pautinkaRolls = Math.ceil(pautinkaM2 / 50);
      const pautinkaPrice = Math.round(240000 * tierMultiplier);

      materials.push({
        code: 'pautinka_stekloxolst_50m2',
        name: 'Stekloxolst Pautinka 40g/m² (+10% zapas)',
        category: 'putty',
        unit: 'rulon',
        exactAmount: Number(pautinkaM2.toFixed(1)),
        exactUnitStr: `${pautinkaM2.toFixed(1)} m²`,
        packagesCount: pautinkaRolls,
        packageSize: '50 m²',
        unitPrice: pautinkaPrice,
        totalPrice: pautinkaRolls * pautinkaPrice,
        description: 'Mikroyoriqlarning oldini oluvchi mustahkam to\'r'
      });

      const glueKg = totalWorkArea * 0.25;
      const glueBuckets = Math.ceil(glueKg / 10);
      const gluePrice = Math.round(110000 * tierMultiplier);

      materials.push({
        code: 'pautinka_glue_10kg',
        name: 'Pautinka uchun tayyor kley (10 kg)',
        category: 'putty',
        unit: 'paqir',
        exactAmount: Number(glueKg.toFixed(1)),
        exactUnitStr: `${glueKg.toFixed(1)} kg`,
        packagesCount: glueBuckets,
        packageSize: '10 kg',
        unitPrice: gluePrice,
        totalPrice: glueBuckets * gluePrice,
        description: 'Stekloxolstni devorga yopishtiruvchi yelim'
      });

      // Finish tayyor pasta (Sheetrock/DANObox) 0.8 kg/m2, 28 kg paqir
      const pastaKg = totalWorkArea * 0.8;
      const pastaBuckets = Math.ceil(pastaKg / 28);
      const pastaPrice = Math.round(260000 * tierMultiplier);

      materials.push({
        code: 'finish_pasta_sheetrock_28kg',
        name: 'Super Finish tayyor shpaklyovka-pasta',
        category: 'putty',
        unit: 'paqir',
        exactAmount: Number(pastaKg.toFixed(1)),
        exactUnitStr: `${pastaKg.toFixed(1)} kg`,
        packagesCount: pastaBuckets,
        packageSize: '28 kg',
        unitPrice: pastaPrice,
        totalPrice: pastaBuckets * pastaPrice,
        description: 'Oyna kabi silliq yuzani ta\'minlovchi yakuniy pasta'
      });
    } else {
      // Standart ta'mir: Quruq Finish shpaklyovka (1.0 kg/m2, 20 kg qop)
      const finishKg = totalWorkArea * 1.0;
      const finishBags = Math.ceil(finishKg / 20);
      const finishPrice = Math.round(65000 * tierMultiplier);

      materials.push({
        code: 'finish_putty_dry_20kg',
        name: 'Finish polimer/gips shpaklyovka (20 kg)',
        category: 'putty',
        unit: 'qop',
        exactAmount: Number(finishKg.toFixed(1)),
        exactUnitStr: `${finishKg.toFixed(1)} kg`,
        packagesCount: finishBags,
        packageSize: '20 kg',
        unitPrice: finishPrice,
        totalPrice: finishBags * finishPrice,
        description: 'Silliqlash uchun quruq qorishma'
      });
    }

    // 4. Suv emulsiyali bo'yoq (2 qatlam: 0.28 L/m2, 15 L paqir)
    const paintLiters = totalWorkArea * 0.28;
    const paintBuckets = Math.ceil(paintLiters / 15);
    const paintPrice = Math.round(420000 * tierMultiplier);

    materials.push({
      code: 'emulsion_paint_washable_15l',
      name: 'Yuviladigan matoviy emulsiya bo\'yog\'i (15 L)',
      category: 'paint',
      unit: 'paqir',
      exactAmount: Number(paintLiters.toFixed(1)),
      exactUnitStr: `${paintLiters.toFixed(1)} litr`,
      packagesCount: paintBuckets,
      packageSize: '15 L',
      unitPrice: paintPrice,
      totalPrice: paintBuckets * paintPrice,
      description: 'Namlikka chidamli, hidlanmaydigan sifatli bo\'yoq'
    });
  }

  // KAFEL / KERAMOGRANIT ISHLARI
  if (input.workType === 'tile') {
    // 1. Gruntovka (1 qatlam: 0.15 L/m2)
    const primerLiters = tileArea * 0.15;
    const primerCans = Math.ceil(primerLiters / 10);
    const primerPrice = Math.round(85000 * tierMultiplier);

    materials.push({
      code: 'primer_tile_10l',
      name: 'Betonkontakt / Gruntovka (10 L)',
      category: 'primer',
      unit: 'kanistra',
      exactAmount: Number(primerLiters.toFixed(1)),
      exactUnitStr: `${primerLiters.toFixed(1)} litr`,
      packagesCount: primerCans,
      packageSize: '10 L',
      unitPrice: primerPrice,
      totalPrice: primerCans * primerPrice,
      description: 'Kafel kleyining yopishishini kuchaytiruvchi grunt'
    });

    // 2. Kafel / Keramogranit (1.10 m2 +10% kesishga, 1.44 m2 pachka)
    const tileM2 = tileArea * 1.1;
    const tilePacks = Math.ceil(tileM2 / 1.44);
    const tilePrice = Math.round(165000 * tierMultiplier);

    materials.push({
      code: 'ceramic_tile_standard_pack',
      name: 'Kafel / Keramogranit (+10% kesishga)',
      category: 'tile',
      unit: 'pachka',
      exactAmount: Number(tileM2.toFixed(1)),
      exactUnitStr: `${tileM2.toFixed(1)} m²`,
      packagesCount: tilePacks,
      packageSize: '1.44 m²',
      unitPrice: tilePrice,
      totalPrice: tilePacks * tilePrice,
      description: 'Devor yoki pol qoplamasi uchun plitka'
    });

    // 3. Kafel kleyi (4.5 kg/m2, 25 kg qop)
    const glueKg = tileArea * 4.5;
    const glueBags = Math.ceil(glueKg / 25);
    const gluePrice = Math.round(55000 * tierMultiplier);

    materials.push({
      code: 'tile_glue_c2_25kg',
      name: 'Kuchaytirilgan kafel kleyi C2 (25 kg)',
      category: 'tile',
      unit: 'qop',
      exactAmount: Number(glueKg.toFixed(1)),
      exactUnitStr: `${glueKg.toFixed(1)} kg`,
      packagesCount: glueBags,
      packageSize: '25 kg',
      unitPrice: gluePrice,
      totalPrice: glueBags * gluePrice,
      description: 'Plitkalarni mahkamlash uchun quruq qorishma'
    });

    // 4. Zatirka (Chok to'ldiruvchi: 0.35 kg/m2, 2 kg qadoq)
    const groutKg = tileArea * 0.35;
    const groutPacks = Math.ceil(groutKg / 2);
    const groutPrice = Math.round(35000 * tierMultiplier);

    materials.push({
      code: 'tile_grout_waterproof_2kg',
      name: 'Suv o\'tkazmaydigan chok to\'ldiruvchi (Zatirka 2 kg)',
      category: 'tile',
      unit: 'qadoq',
      exactAmount: Number(groutKg.toFixed(1)),
      exactUnitStr: `${groutKg.toFixed(1)} kg`,
      packagesCount: groutPacks,
      packageSize: '2 kg',
      unitPrice: groutPrice,
      totalPrice: groutPacks * groutPrice,
      description: 'Kafel oralaridagi choklarni himoyalash va bezash'
    });
  }

  // Jami materiallar summasi
  const materialsTotal = materials.reduce((sum, item) => sum + item.totalPrice, 0);

  // USTA ISH HAQI VA BOSQICHLARI
  const laborItems: LaborItem[] = [];
  const rates = input.masterRates || {
    puttyPerM2: 35000,
    pautinkaPerM2: 20000,
    paintPerM2: 25000,
    tilePerM2: 90000,
    plasterPerM2: 30000,
  };

  if (input.includePlaster && totalWorkArea > 0) {
    const pRate = rates.plasterPerM2 || 30000;
    laborItems.push({
      id: 'plaster',
      name: 'Mayoqlarni o\'rnatish va gipsli suvoq tortish',
      area: totalWorkArea,
      ratePerM2: pRate,
      totalPrice: Math.round(totalWorkArea * pRate),
    });
  }

  if (input.workType === 'paint_euro') {
    laborItems.push({
      id: 'putty',
      name: 'Gruntovka va Start/Finish shpaklyovka surtish',
      area: totalWorkArea,
      ratePerM2: rates.puttyPerM2,
      totalPrice: Math.round(totalWorkArea * rates.puttyPerM2),
    });
    laborItems.push({
      id: 'pautinka',
      name: 'Stekloxolst (Pautinka) yopishtirish va silliqlash',
      area: totalWorkArea,
      ratePerM2: rates.pautinkaPerM2,
      totalPrice: Math.round(totalWorkArea * rates.pautinkaPerM2),
    });
    laborItems.push({
      id: 'paint',
      name: 'Emulsiya bo\'yog\'i purkash / bo\'yash (2 qatlam)',
      area: totalWorkArea,
      ratePerM2: rates.paintPerM2,
      totalPrice: Math.round(totalWorkArea * rates.paintPerM2),
    });
  } else if (input.workType === 'paint_standard') {
    laborItems.push({
      id: 'putty',
      name: 'Gruntovka va Start/Finish shpaklyovka surtish',
      area: totalWorkArea,
      ratePerM2: rates.puttyPerM2,
      totalPrice: Math.round(totalWorkArea * rates.puttyPerM2),
    });
    laborItems.push({
      id: 'paint',
      name: 'Emulsiya bo\'yog\'i surtish (2 qatlam)',
      area: totalWorkArea,
      ratePerM2: rates.paintPerM2,
      totalPrice: Math.round(totalWorkArea * rates.paintPerM2),
    });
  } else if (input.workType === 'tile') {
    laborItems.push({
      id: 'tile',
      name: 'Gruntovka, kafel terish va choklarni to\'ldirish (zatirka)',
      area: tileArea,
      ratePerM2: rates.tilePerM2,
      totalPrice: Math.round(tileArea * rates.tilePerM2),
    });
  }

  const laborTotal = laborItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const laborPerM2 = totalWorkArea > 0 ? Math.round(laborTotal / totalWorkArea) : 0;

  return {
    geometry: {
      perimeter,
      rawWallArea,
      netWallArea,
      ceilingArea,
      floorArea,
      plinthLength,
      totalWorkArea,
    },
    materials,
    laborItems,
    materialsTotal,
    laborTotal,
    laborPerM2,
    grandTotal: materialsTotal + laborTotal,
  };
}

export function formatUZS(amount: number): string {
  return amount.toLocaleString('ru-RU') + " so'm";
}
