// Smeta24 Professional Hisoblash Dvigateli (2026 O'zbekiston standartlari va bozor narxlari)
// Dastur muallifi: Nurmurodov Damirjon

export type CeilingWorkType = 
  | 'none'              // Shiftga tegilmaydi
  | 'paint_roller'      // Shift: Shpaklyovka + Bo'yoq (Valikda)
  | 'paint_spray'       // Shift: Shpaklyovka + Bo'yoq (Kraskapultda purkash)
  | 'gipsokarton_plain' // Shift: Gipskarton tekis (1 qavatli Knauf)
  | 'gipsokarton_decor' // Shift: Gipskarton naqshli / figurali (2 qavatli)
  | 'stretch';          // Shift: Natyajnoy potolok (o'rnatish bilan)

export type WallWorkType = 
  | 'none'              // Devorga tegilmaydi
  | 'paint_roller'      // Devor: Yevro bo'yoq (Valikda)
  | 'paint_spray'       // Devor: Yevro bo'yoq (Kraskapultda purkash)
  | 'wallpaper'         // Devor: Oboy yopishtirish (Vinil / Flizelin)
  | 'tile'              // Devor: Kafel / Plitka / Keramogranit
  | 'paint_standard';   // Devor: Standart bo'yoq (Start + Finish)

export type FloorWorkType = 
  | 'none'              // Polga tegilmaydi
  | 'laminate'          // Pol: Laminat (33-klass + podlojka + plintus)
  | 'parquet'           // Pol: Parket / Inzhenernaya doska (+ kley + lak)
  | 'tile';             // Pol: Kafel / Keramogranit

export type QualityTier = 'econom' | 'standard' | 'premium';

export interface RoomInput {
  roomName: string;
  length: number;        // Uzunligi (m)
  width: number;         // Eni (m)
  height: number;        // Balandligi (m)
  openingsArea: number;  // Eshik va derazalar jami yuzasi (m2)

  // 1. Shift ishlari
  ceilingWork: CeilingWorkType;

  // 2. Devor ishlari
  wallWork: WallWorkType;
  includePlaster?: boolean;     // Gipsli suvoq (Rotband)
  includePautinka?: boolean;    // Pautinka (Stekloxolst)
  plasterThicknessCm?: number;  // Suvoq qalinligi (sm)

  // 3. Pol ishlari
  floorWork: FloorWorkType;
  includeScreed?: boolean;      // Pol steshkasi (Beton styajka, 5 sm)
  includeSelfLeveling?: boolean;// Nalivnoy pol (Samonivelir tekislash, 3 mm)

  tier?: QualityTier;

  // Usta shaxsiy stavkalari (1 m2 yoki 1 m uchun)
  masterRates?: Record<string, number>;
}

export interface MaterialItem {
  code: string;
  name: string;
  category: 'ceiling' | 'wall' | 'floor' | 'primer' | 'plaster' | 'putty' | 'paint' | 'wallpaper' | 'tile' | 'accessory';
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
  category: 'ceiling' | 'wall' | 'floor';
  area: number;
  unitStr: string;
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
  grandTotal: number;
}

export function formatUZS(amount: number): string {
  return `${Math.round(amount).toLocaleString('ru-RU')} so'm`;
}

export function calculateSmartEstimate(input: RoomInput): EstimateResult {
  const length = Math.max(0.1, input.length || 0);
  const width = Math.max(0.1, input.width || 0);
  const height = Math.max(0.1, input.height || 0);
  const openingsArea = Math.max(0, input.openingsArea || 0);
  const tier = input.tier || 'standard';

  // 1. Asosiy Geometriya
  const perimeter = Number((2 * (length + width)).toFixed(2));
  const rawWallArea = Number((perimeter * height).toFixed(2));
  const netWallArea = Number(Math.max(0, rawWallArea - openingsArea).toFixed(2));
  const ceilingArea = input.ceilingWork !== 'none' ? Number((length * width).toFixed(2)) : 0;
  const floorArea = input.floorWork !== 'none' || input.includeScreed || input.includeSelfLeveling 
    ? Number((length * width).toFixed(2)) 
    : 0;
  
  // Plintus uzunligi (eshik o'rni ~0.9m chiqariladi)
  const estimatedDoorWidth = openingsArea > 0 ? 0.9 : 0;
  const plinthLength = Number(Math.max(0, perimeter - estimatedDoorWidth).toFixed(2));

  const totalWorkArea = Number((netWallArea + ceilingArea).toFixed(2));

  const materials: MaterialItem[] = [];
  const laborItems: LaborItem[] = [];

  // Narx segmenti koeffitsiyenti (Ekonom 0.85, Standart 1.0, Premium 1.35)
  const tierMultiplier = tier === 'premium' ? 1.35 : tier === 'econom' ? 0.85 : 1.0;
  const rates = input.masterRates || {};

  // =========================================================================
  // A. SHIFT ISHLARI (CEILING)
  // =========================================================================
  if (input.ceilingWork !== 'none' && ceilingArea > 0) {
    // 1. Gipskarton tekis (1 qavatli)
    if (input.ceilingWork === 'gipsokarton_plain') {
      const gipsSheets = Math.ceil((ceilingArea * 1.08) / 3.0); // 1 list = 1.2x2.5 = 3m2, +8% kesish
      const sheetPrice = Math.round(52000 * tierMultiplier);
      materials.push({
        code: 'gips_sheet_9_5',
        name: 'Gipskarton Knauf 9.5 mm (Shift uchun)',
        category: 'ceiling',
        unit: 'dona',
        exactAmount: Number((ceilingArea * 1.08 / 3.0).toFixed(1)),
        exactUnitStr: `${(ceilingArea * 1.08 / 3.0).toFixed(1)} list`,
        packagesCount: gipsSheets,
        packageSize: '1.2x2.5 m (3 m²)',
        unitPrice: sheetPrice,
        totalPrice: gipsSheets * sheetPrice,
        description: 'Shift tekislash va montaj qilish uchun Knauf gipskarton'
      });

      // Profil UD-27 (perimetr bo'yicha)
      const udProfiles = Math.ceil(perimeter / 3.0);
      const udPrice = Math.round(18000 * tierMultiplier);
      materials.push({
        code: 'profile_ud_27',
        name: 'Profil UD-27 yo\'naltiruvchi (3 metrli)',
        category: 'ceiling',
        unit: 'dona',
        exactAmount: Number((perimeter / 3.0).toFixed(1)),
        exactUnitStr: `${(perimeter / 3.0).toFixed(1)} dona`,
        packagesCount: udProfiles,
        packageSize: '3 metr',
        unitPrice: udPrice,
        totalPrice: udProfiles * udPrice,
      });

      // Profil CD-60 (har 40-50 sm da)
      const cdProfiles = Math.ceil(ceilingArea * 0.9);
      const cdPrice = Math.round(26000 * tierMultiplier);
      materials.push({
        code: 'profile_cd_60',
        name: 'Profil CD-60 asosiy tirkagich (3 metrli)',
        category: 'ceiling',
        unit: 'dona',
        exactAmount: Number((ceilingArea * 0.9).toFixed(1)),
        exactUnitStr: `${(ceilingArea * 0.9).toFixed(1)} dona`,
        packagesCount: cdProfiles,
        packageSize: '3 metr',
        unitPrice: cdPrice,
        totalPrice: cdProfiles * cdPrice,
      });

      // Podves (ilgichlar) va samorez to'plami
      const podvesCount = Math.ceil(ceilingArea * 2.5);
      const podvesPrice = 2500;
      materials.push({
        code: 'podves_tyaga',
        name: 'Shift ilgichlari (Podves to\'g\'ridan-to\'g\'ri)',
        category: 'ceiling',
        unit: 'dona',
        exactAmount: podvesCount,
        exactUnitStr: `${podvesCount} dona`,
        packagesCount: podvesCount,
        packageSize: '1 dona',
        unitPrice: podvesPrice,
        totalPrice: podvesCount * podvesPrice,
      });

      const rate = rates['ceiling_gips_plain'] || 50000;
      laborItems.push({
        id: 'labor_ceiling_gips_plain',
        name: 'Shiftga tekis gipskarton montaj qilish',
        category: 'ceiling',
        area: ceilingArea,
        unitStr: 'm²',
        ratePerM2: rate,
        totalPrice: Math.round(ceilingArea * rate),
      });
    }

    // 2. Gipskarton naqshli / figurali (2 qavatli quti + LED)
    else if (input.ceilingWork === 'gipsokarton_decor') {
      const gipsSheets = Math.ceil((ceilingArea * 1.45) / 3.0); // 2-qavat qutilar bilan +45%
      const sheetPrice = Math.round(52000 * tierMultiplier);
      materials.push({
        code: 'gips_sheet_decor',
        name: 'Gipskarton Knauf 9.5 mm (Figurali / 2 qavatli)',
        category: 'ceiling',
        unit: 'dona',
        exactAmount: Number((ceilingArea * 1.45 / 3.0).toFixed(1)),
        exactUnitStr: `${(ceilingArea * 1.45 / 3.0).toFixed(1)} list`,
        packagesCount: gipsSheets,
        packageSize: '1.2x2.5 m (3 m²)',
        unitPrice: sheetPrice,
        totalPrice: gipsSheets * sheetPrice,
        description: 'Shiftda figurali quti va naqshlar yasash uchun gipskarton'
      });

      // Profillar to'plami (UD/CD)
      const profilesTotal = Math.ceil(ceilingArea * 1.8);
      const profileAvgPrice = Math.round(24000 * tierMultiplier);
      materials.push({
        code: 'profile_decor_set',
        name: 'Gipskarton profillari to\'plami (UD va CD)',
        category: 'ceiling',
        unit: 'dona',
        exactAmount: profilesTotal,
        exactUnitStr: `${profilesTotal} dona`,
        packagesCount: profilesTotal,
        packageSize: '3 metr',
        unitPrice: profileAvgPrice,
        totalPrice: profilesTotal * profileAvgPrice,
      });

      const rate = rates['ceiling_gips_decor'] || 85000;
      laborItems.push({
        id: 'labor_ceiling_gips_decor',
        name: 'Shiftda 2 qavatli figurali / naqshli gipskarton yasash',
        category: 'ceiling',
        area: ceilingArea,
        unitStr: 'm²',
        ratePerM2: rate,
        totalPrice: Math.round(ceilingArea * rate),
      });
    }

    // 3. Natyajnoy shift
    else if (input.ceilingWork === 'stretch') {
      const stretchPrice = Math.round(65000 * tierMultiplier);
      materials.push({
        code: 'stretch_ceiling_full',
        name: 'Natyajnoy potolok (Matoviy/Satin, profillar bilan birga)',
        category: 'ceiling',
        unit: 'm²',
        exactAmount: ceilingArea,
        exactUnitStr: `${ceilingArea} m²`,
        packagesCount: Math.ceil(ceilingArea),
        packageSize: '1 m²',
        unitPrice: stretchPrice,
        totalPrice: Math.ceil(ceilingArea) * stretchPrice,
        description: 'Choksiz ekologik natyajnoy shift polotnosi va o\'rnatish profillari'
      });

      const rate = rates['ceiling_stretch'] || 15000; // o'rnatish qo'shimcha xizmati
      laborItems.push({
        id: 'labor_ceiling_stretch',
        name: 'Natyajnoy shift montaji va burchaklarni tekislash',
        category: 'ceiling',
        area: ceilingArea,
        unitStr: 'm²',
        ratePerM2: rate,
        totalPrice: Math.round(ceilingArea * rate),
      });
    }

    // 4. Shiftni bo'yash (Valik yoki Kraskapult)
    if (input.ceilingWork === 'paint_roller' || input.ceilingWork === 'paint_spray') {
      const ceilingPaintLiters = ceilingArea * 0.26; // 2 qatlam
      const paintPails = Math.ceil(ceilingPaintLiters / 15);
      const paintPrice = Math.round(420000 * tierMultiplier);
      materials.push({
        code: 'ceiling_paint_white_15l',
        name: 'Shift uchun super oq matoviy bo\'yoq (15 L)',
        category: 'ceiling',
        unit: 'paqir',
        exactAmount: Number(ceilingPaintLiters.toFixed(1)),
        exactUnitStr: `${ceilingPaintLiters.toFixed(1)} litr`,
        packagesCount: paintPails,
        packageSize: '15 litr',
        unitPrice: paintPrice,
        totalPrice: paintPails * paintPrice,
      });

      // Shpaklyovka va astar
      const puttyKg = ceilingArea * 1.5;
      const puttyBags = Math.ceil(puttyKg / 25);
      const puttyPrice = Math.round(48000 * tierMultiplier);
      materials.push({
        code: 'ceiling_putty_25kg',
        name: 'Shift uchun silliq finish shpaklyovka (25 kg)',
        category: 'ceiling',
        unit: 'qop',
        exactAmount: Number(puttyKg.toFixed(1)),
        exactUnitStr: `${puttyKg.toFixed(1)} kg`,
        packagesCount: puttyBags,
        packageSize: '25 kg',
        unitPrice: puttyPrice,
        totalPrice: puttyBags * puttyPrice,
      });

      const isSpray = input.ceilingWork === 'paint_spray';
      const rate = rates[isSpray ? 'ceiling_spray' : 'ceiling_roller'] || (isSpray ? 35000 : 25000);
      laborItems.push({
        id: 'labor_ceiling_paint',
        name: isSpray 
          ? 'Shiftni kraskapultda (purkash orqali) sifatli bo\'yash' 
          : 'Shiftni shpaklyovka qilish va valikda bo\'yash',
        category: 'ceiling',
        area: ceilingArea,
        unitStr: 'm²',
        ratePerM2: rate,
        totalPrice: Math.round(ceilingArea * rate),
      });
    }
  }

  // =========================================================================
  // B. DEVOR ISHLARI (WALLS)
  // =========================================================================
  if (input.wallWork !== 'none' && netWallArea > 0) {
    // 1. Gipsli suvoq (Rotband tekislash)
    if (input.includePlaster) {
      const thickness = input.plasterThicknessCm || 1.0;
      const plasterKg = netWallArea * 8.5 * thickness;
      const plasterBags = Math.ceil(plasterKg / 30);
      const plasterPrice = Math.round(52000 * tierMultiplier);

      materials.push({
        code: 'plaster_rotband_30kg',
        name: `Gipsli suvoq (Rotband, ${thickness} sm qatlam)`,
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

      const rate = rates['wall_plaster'] || 35000;
      laborItems.push({
        id: 'labor_wall_plaster',
        name: 'Devorlarni mayoq bo\'yicha gipsli suvoq (Rotband) bilan tekislash',
        category: 'wall',
        area: netWallArea,
        unitStr: 'm²',
        ratePerM2: rate,
        totalPrice: Math.round(netWallArea * rate),
      });
    }

    // 2. Gruntovka (Astar)
    const primerLiters = netWallArea * 0.15 * (input.wallWork === 'tile' ? 1 : 2);
    const primerCans = Math.ceil(primerLiters / 10);
    const primerPrice = Math.round(85000 * tierMultiplier);
    materials.push({
      code: 'primer_deep_10l',
      name: 'Chuqur singuvchi astar (Gruntovka, 10 L)',
      category: 'primer',
      unit: 'kanistra',
      exactAmount: Number(primerLiters.toFixed(1)),
      exactUnitStr: `${primerLiters.toFixed(1)} litr`,
      packagesCount: primerCans,
      packageSize: '10 litr',
      unitPrice: primerPrice,
      totalPrice: primerCans * primerPrice,
    });

    // 3. Devor: Bo'yoq (Valik yoki Kraskapultda purkash)
    if (input.wallWork === 'paint_roller' || input.wallWork === 'paint_spray' || input.wallWork === 'paint_standard') {
      // Start shpaklyovka
      const startKg = netWallArea * 1.8;
      const startBags = Math.ceil(startKg / 25);
      const startPrice = Math.round(48000 * tierMultiplier);
      materials.push({
        code: 'putty_start_25kg',
        name: 'Start gipsli shpaklyovka (25 kg qop)',
        category: 'putty',
        unit: 'qop',
        exactAmount: Number(startKg.toFixed(1)),
        exactUnitStr: `${startKg.toFixed(1)} kg`,
        packagesCount: startBags,
        packageSize: '25 kg',
        unitPrice: startPrice,
        totalPrice: startBags * startPrice,
      });

      // Pautinka (agar tanlangan bo'lsa)
      if (input.includePautinka) {
        const pautinkaM2 = netWallArea * 1.1;
        const pautinkaRolls = Math.ceil(pautinkaM2 / 50);
        const pautinkaPrice = Math.round(240000 * tierMultiplier);
        materials.push({
          code: 'pautinka_roll_50m2',
          name: 'Stekloxolst Pautinka 40g/m² (+10% zapas)',
          category: 'wall',
          unit: 'rulon',
          exactAmount: Number(pautinkaM2.toFixed(1)),
          exactUnitStr: `${pautinkaM2.toFixed(1)} m²`,
          packagesCount: pautinkaRolls,
          packageSize: '50 m²',
          unitPrice: pautinkaPrice,
          totalPrice: pautinkaRolls * pautinkaPrice,
        });

        // Pautinka kleyi
        const glueKg = netWallArea * 0.25;
        const gluePails = Math.ceil(glueKg / 10);
        const gluePrice = Math.round(110000 * tierMultiplier);
        materials.push({
          code: 'pautinka_glue_10kg',
          name: 'Pautinka uchun tayyor maxsus kley (Oscar/Bostik, 10 kg)',
          category: 'wall',
          unit: 'paqir',
          exactAmount: Number(glueKg.toFixed(1)),
          exactUnitStr: `${glueKg.toFixed(1)} kg`,
          packagesCount: gluePails,
          packageSize: '10 kg',
          unitPrice: gluePrice,
          totalPrice: gluePails * gluePrice,
        });

        const pautinkaRate = rates['wall_pautinka'] || 20000;
        laborItems.push({
          id: 'labor_wall_pautinka',
          name: 'Stekloxolst (Pautinka) yopishtirish va qirqish',
          category: 'wall',
          area: netWallArea,
          unitStr: 'm²',
          ratePerM2: pautinkaRate,
          totalPrice: Math.round(netWallArea * pautinkaRate),
        });
      }

      // Finish shpaklyovka pasta
      const finishKg = netWallArea * 0.8;
      const finishPails = Math.ceil(finishKg / 28);
      const finishPrice = Math.round(260000 * tierMultiplier);
      materials.push({
        code: 'putty_finish_pasta_28kg',
        name: 'Super Finish tayyor shpaklyovka-pasta (28 kg)',
        category: 'putty',
        unit: 'paqir',
        exactAmount: Number(finishKg.toFixed(1)),
        exactUnitStr: `${finishKg.toFixed(1)} kg`,
        packagesCount: finishPails,
        packageSize: '28 kg',
        unitPrice: finishPrice,
        totalPrice: finishPails * finishPrice,
      });

      // Emulsiya bo'yog'i devorga
      const paintLiters = netWallArea * 0.28;
      const paintPails = Math.ceil(paintLiters / 15);
      const paintPrice = Math.round(420000 * tierMultiplier);
      materials.push({
        code: 'paint_wall_15l',
        name: 'Yuviladigan matoviy akril emulsiya bo\'yog\'i (15 L)',
        category: 'paint',
        unit: 'paqir',
        exactAmount: Number(paintLiters.toFixed(1)),
        exactUnitStr: `${paintLiters.toFixed(1)} litr`,
        packagesCount: paintPails,
        packageSize: '15 litr',
        unitPrice: paintPrice,
        totalPrice: paintPails * paintPrice,
      });

      // Shpaklyovka xizmati
      const puttyRate = rates['wall_putty'] || 35000;
      laborItems.push({
        id: 'labor_wall_putty',
        name: 'Devorlarni shpaklyovka qilish va silliqlash (Start + Finish)',
        category: 'wall',
        area: netWallArea,
        unitStr: 'm²',
        ratePerM2: puttyRate,
        totalPrice: Math.round(netWallArea * puttyRate),
      });

      // Bo'yash xizmati (Valik vs Kraskapult)
      const isSpray = input.wallWork === 'paint_spray';
      const paintRate = rates[isSpray ? 'wall_spray' : 'wall_roller'] || (isSpray ? 35000 : 25000);
      laborItems.push({
        id: 'labor_wall_paint',
        name: isSpray 
          ? 'Devorlarni kraskapultda (purkash orqali) dog\'siz bo\'yash' 
          : 'Devorlarni valikda bo\'yash (2 qatlam)',
        category: 'wall',
        area: netWallArea,
        unitStr: 'm²',
        ratePerM2: paintRate,
        totalPrice: Math.round(netWallArea * paintRate),
      });
    }

    // 4. Devor: Oboy yopishtirish
    else if (input.wallWork === 'wallpaper') {
      // 1 rulon 1.06m x 10m = 10.6 m2, 10% zapas
      const wallpaperRolls = Math.ceil((netWallArea * 1.10) / 10.6);
      const rollPrice = Math.round(180000 * tierMultiplier);
      materials.push({
        code: 'wallpaper_vinil_roll',
        name: 'Vinil / Flizelin oboy (1.06 x 10 m, keng format)',
        category: 'wallpaper',
        unit: 'rulon',
        exactAmount: Number(((netWallArea * 1.10) / 10.6).toFixed(1)),
        exactUnitStr: `${((netWallArea * 1.10) / 10.6).toFixed(1)} rulon`,
        packagesCount: wallpaperRolls,
        packageSize: '1.06 x 10 m (10.6 m²)',
        unitPrice: rollPrice,
        totalPrice: wallpaperRolls * rollPrice,
        description: 'Sifatli yuviladigan relflik devor qog\'ozi'
      });

      // Oboy kleyi (1 quti 5-6 rulonga)
      const glueBoxes = Math.ceil(wallpaperRolls / 5);
      const glueBoxPrice = Math.round(45000 * tierMultiplier);
      materials.push({
        code: 'wallpaper_glue_box',
        name: 'Maxsus flizelin oboy kleyi (Metylan/Kleo)',
        category: 'wallpaper',
        unit: 'quti',
        exactAmount: glueBoxes,
        exactUnitStr: `${glueBoxes} quti`,
        packagesCount: glueBoxes,
        packageSize: '500 g quti',
        unitPrice: glueBoxPrice,
        totalPrice: glueBoxes * glueBoxPrice,
      });

      // Oboy tagiga devorni tekislash shpaklyovkasi
      const puttyKg = netWallArea * 1.2;
      const puttyBags = Math.ceil(puttyKg / 25);
      const puttyPrice = Math.round(48000 * tierMultiplier);
      materials.push({
        code: 'wallpaper_putty_base_25kg',
        name: 'Oboy osti uchun tekislovchi shpaklyovka (25 kg)',
        category: 'putty',
        unit: 'qop',
        exactAmount: Number(puttyKg.toFixed(1)),
        exactUnitStr: `${puttyKg.toFixed(1)} kg`,
        packagesCount: puttyBags,
        packageSize: '25 kg',
        unitPrice: puttyPrice,
        totalPrice: puttyBags * puttyPrice,
      });

      // Usta: Oboy yopishtirish
      const wallpaperRate = rates['wall_wallpaper'] || 30000;
      laborItems.push({
        id: 'labor_wall_wallpaper',
        name: 'Oboy yopishtirish (choklarni tekislash bilan)',
        category: 'wall',
        area: netWallArea,
        unitStr: 'm²',
        ratePerM2: wallpaperRate,
        totalPrice: Math.round(netWallArea * wallpaperRate),
      });

      // Usta: Oboy tagiga devor tayyorlash
      const prepRate = rates['wall_wallpaper_prep'] || 25000;
      laborItems.push({
        id: 'labor_wall_wallpaper_prep',
        name: 'Oboy ostini shpaklyovka va astar bilan tayyorlash',
        category: 'wall',
        area: netWallArea,
        unitStr: 'm²',
        ratePerM2: prepRate,
        totalPrice: Math.round(netWallArea * prepRate),
      });
    }

    // 5. Devor: Kafel / Keramogranit
    else if (input.wallWork === 'tile') {
      const tileAreaExact = netWallArea * 1.10; // +10% kesishga
      const tilePacks = Math.ceil(tileAreaExact / 1.44); // 1 pachka ~1.44m2
      const tilePrice = Math.round(110000 * tierMultiplier);

      materials.push({
        code: 'wall_tile_pack',
        name: 'Devor kafel / plitkasi (+10% zapas)',
        category: 'tile',
        unit: 'pachka',
        exactAmount: Number(tileAreaExact.toFixed(1)),
        exactUnitStr: `${tileAreaExact.toFixed(1)} m²`,
        packagesCount: tilePacks,
        packageSize: '1.44 m²',
        unitPrice: Math.round(tilePrice * 1.44),
        totalPrice: tilePacks * Math.round(tilePrice * 1.44),
      });

      // Kafel kleyi (25kg qop = 5 m2)
      const glueBags = Math.ceil(netWallArea / 5.0);
      const gluePrice = Math.round(48000 * tierMultiplier);
      materials.push({
        code: 'tile_glue_25kg',
        name: 'Plitka va kafel yelimi (Knauf/Weber, 25 kg)',
        category: 'tile',
        unit: 'qop',
        exactAmount: Number((netWallArea / 5.0).toFixed(1)),
        exactUnitStr: `${(netWallArea / 5.0).toFixed(1)} qop`,
        packagesCount: glueBags,
        packageSize: '25 kg',
        unitPrice: gluePrice,
        totalPrice: glueBags * gluePrice,
      });

      // Choklar uchun zatirka (fuga)
      const groutPacks = Math.ceil(netWallArea / 15.0);
      const groutPrice = Math.round(32000 * tierMultiplier);
      materials.push({
        code: 'tile_grout_2kg',
        name: 'Suv o\'tkazmaydigan chok qorishmasi (Zatirka / Fuga, 2 kg)',
        category: 'tile',
        unit: 'dona',
        exactAmount: groutPacks,
        exactUnitStr: `${groutPacks} dona`,
        packagesCount: groutPacks,
        packageSize: '2 kg',
        unitPrice: groutPrice,
        totalPrice: groutPacks * groutPrice,
      });

      const tileRate = rates['wall_tile'] || 90000;
      laborItems.push({
        id: 'labor_wall_tile',
        name: 'Devorga kafel / plitka yotqizish va zatirka qilish',
        category: 'wall',
        area: netWallArea,
        unitStr: 'm²',
        ratePerM2: tileRate,
        totalPrice: Math.round(netWallArea * tileRate),
      });
    }
  }

  // =========================================================================
  // C. POL ISHLARI (FLOOR)
  // =========================================================================
  if ((input.floorWork !== 'none' || input.includeScreed || input.includeSelfLeveling) && floorArea > 0) {
    // 1. Pol steshkasi (Beton styajka, 5 sm)
    if (input.includeScreed) {
      // 5 sm styajka uchun tsement M400 (1 qop 50kg ~1.5 m2 ga)
      const cementBags = Math.ceil(floorArea / 1.5);
      const cementPrice = Math.round(45000 * tierMultiplier);
      materials.push({
        code: 'cement_m400_50kg',
        name: 'Tsement M400 (Pol steshkasi uchun, 50 kg)',
        category: 'floor',
        unit: 'qop',
        exactAmount: Number((floorArea / 1.5).toFixed(1)),
        exactUnitStr: `${(floorArea / 1.5).toFixed(1)} qop`,
        packagesCount: cementBags,
        packageSize: '50 kg',
        unitPrice: cementPrice,
        totalPrice: cementBags * cementPrice,
        description: 'Polni mustahkam tsement-qum qorishmasi bilan tekislash'
      });

      const rate = rates['floor_screed'] || 35000;
      laborItems.push({
        id: 'labor_floor_screed',
        name: 'Pol steshkasi (Beton quyish va mayoq bo\'yicha tekislash, 5 sm)',
        category: 'floor',
        area: floorArea,
        unitStr: 'm²',
        ratePerM2: rate,
        totalPrice: Math.round(floorArea * rate),
      });
    }

    // 2. Nalivnoy pol (Samonivelir tekislash, 3 mm)
    if (input.includeSelfLeveling) {
      const selfLevelBags = Math.ceil(floorArea / 5.0); // 1 qop 25kg = 5 m2
      const selfLevelPrice = Math.round(65000 * tierMultiplier);
      materials.push({
        code: 'self_leveling_25kg',
        name: 'O\'zi tekislanuvchi nalivnoy pol qorishmasi (25 kg)',
        category: 'floor',
        unit: 'qop',
        exactAmount: Number((floorArea / 5.0).toFixed(1)),
        exactUnitStr: `${(floorArea / 5.0).toFixed(1)} qop`,
        packagesCount: selfLevelBags,
        packageSize: '25 kg',
        unitPrice: selfLevelPrice,
        totalPrice: selfLevelBags * selfLevelPrice,
      });

      const rate = rates['floor_self_leveling'] || 20000;
      laborItems.push({
        id: 'labor_floor_self_leveling',
        name: 'Nalivnoy pol quyish (3 mm silliq yakuniy qatlam)',
        category: 'floor',
        area: floorArea,
        unitStr: 'm²',
        ratePerM2: rate,
        totalPrice: Math.round(floorArea * rate),
      });
    }

    // 3. Pol qoplamasi: Laminat
    if (input.floorWork === 'laminate') {
      const laminateAreaExact = floorArea * 1.07; // +7% zapas
      const laminatePacks = Math.ceil(laminateAreaExact / 2.13); // 1 pachka ~2.13 m2
      const laminateM2Price = Math.round(120000 * tierMultiplier);
      materials.push({
        code: 'laminate_33_pack',
        name: 'Laminat 33-klass namlikka chidamli (+7% zapas)',
        category: 'floor',
        unit: 'pachka',
        exactAmount: Number(laminateAreaExact.toFixed(1)),
        exactUnitStr: `${laminateAreaExact.toFixed(1)} m²`,
        packagesCount: laminatePacks,
        packageSize: '2.13 m²',
        unitPrice: Math.round(laminateM2Price * 2.13),
        totalPrice: laminatePacks * Math.round(laminateM2Price * 2.13),
      });

      // Podlojka (3 mm penopolistirol)
      const underlayRolls = Math.ceil(floorArea / 10.0);
      const underlayPrice = Math.round(45000 * tierMultiplier);
      materials.push({
        code: 'underlay_roll_10m2',
        name: 'Laminat osti podlojkasi (3 mm penopolistirol, 10 m²)',
        category: 'floor',
        unit: 'rulon',
        exactAmount: Number((floorArea / 10.0).toFixed(1)),
        exactUnitStr: `${(floorArea / 10.0).toFixed(1)} rulon`,
        packagesCount: underlayRolls,
        packageSize: '10 m²',
        unitPrice: underlayPrice,
        totalPrice: underlayRolls * underlayPrice,
      });

      // Plintus (2.5 metrli PVX)
      const plinthPcs = Math.ceil(plinthLength / 2.5);
      const plinthPrice = Math.round(22000 * tierMultiplier);
      materials.push({
        code: 'plinth_pvc_2_5m',
        name: 'PVX rezinali pol plintusi va burchaklar to\'plami',
        category: 'floor',
        unit: 'dona',
        exactAmount: Number((plinthLength / 2.5).toFixed(1)),
        exactUnitStr: `${(plinthLength / 2.5).toFixed(1)} dona (${plinthLength} m)`,
        packagesCount: plinthPcs,
        packageSize: '2.5 metr',
        unitPrice: plinthPrice,
        totalPrice: plinthPcs * plinthPrice,
      });

      const rate = rates['floor_laminate'] || 25000;
      laborItems.push({
        id: 'labor_floor_laminate',
        name: 'Laminat yotqizish va plintuslarni o\'rnatish',
        category: 'floor',
        area: floorArea,
        unitStr: 'm²',
        ratePerM2: rate,
        totalPrice: Math.round(floorArea * rate),
      });
    }

    // 4. Pol qoplamasi: Parket / Inzhenernaya doska
    else if (input.floorWork === 'parquet') {
      const parquetAreaExact = floorArea * 1.10; // +10% zapas
      const parquetM2Price = Math.round(280000 * tierMultiplier);
      materials.push({
        code: 'parquet_board_m2',
        name: 'Tabiiy parket / Inzhenernaya doska (+10% zapas)',
        category: 'floor',
        unit: 'm²',
        exactAmount: Number(parquetAreaExact.toFixed(1)),
        exactUnitStr: `${parquetAreaExact.toFixed(1)} m²`,
        packagesCount: Math.ceil(parquetAreaExact),
        packageSize: '1 m²',
        unitPrice: parquetM2Price,
        totalPrice: Math.ceil(parquetAreaExact) * parquetM2Price,
        description: 'Sifatli tabiiy eman/yong\'oq qoplamali parket taxtasi'
      });

      // 2-komponentli parket yelimi (14 kg = 10-12 m2)
      const gluePails = Math.ceil(floorArea / 11.0);
      const gluePrice = Math.round(420000 * tierMultiplier);
      materials.push({
        code: 'parquet_glue_14kg',
        name: 'Poliuretan 2-komponentli parket yelimi (14 kg)',
        category: 'floor',
        unit: 'paqir',
        exactAmount: Number((floorArea / 11.0).toFixed(1)),
        exactUnitStr: `${(floorArea / 11.0).toFixed(1)} paqir`,
        packagesCount: gluePails,
        packageSize: '14 kg',
        unitPrice: gluePrice,
        totalPrice: gluePails * gluePrice,
      });

      // Yog'och plintus
      const plinthPcs = Math.ceil(plinthLength / 2.4);
      const plinthPrice = Math.round(45000 * tierMultiplier);
      materials.push({
        code: 'plinth_wood_2_4m',
        name: 'Yog\'och / MDF shponli parket plintusi (2.4 m)',
        category: 'floor',
        unit: 'dona',
        exactAmount: Number((plinthLength / 2.4).toFixed(1)),
        exactUnitStr: `${(plinthLength / 2.4).toFixed(1)} dona`,
        packagesCount: plinthPcs,
        packageSize: '2.4 metr',
        unitPrice: plinthPrice,
        totalPrice: plinthPcs * plinthPrice,
      });

      const rate = rates['floor_parquet'] || 85000;
      laborItems.push({
        id: 'labor_floor_parquet',
        name: 'Parket yotqizish, yelimlash va plintus o\'rnatish',
        category: 'floor',
        area: floorArea,
        unitStr: 'm²',
        ratePerM2: rate,
        totalPrice: Math.round(floorArea * rate),
      });
    }

    // 5. Pol qoplamasi: Kafel / Keramogranit
    else if (input.floorWork === 'tile') {
      const tileAreaExact = floorArea * 1.10;
      const tilePacks = Math.ceil(tileAreaExact / 1.44);
      const tileM2Price = Math.round(135000 * tierMultiplier);

      materials.push({
        code: 'floor_tile_pack',
        name: 'Pol uchun keramogranit / kafel (+10% zapas)',
        category: 'floor',
        unit: 'pachka',
        exactAmount: Number(tileAreaExact.toFixed(1)),
        exactUnitStr: `${tileAreaExact.toFixed(1)} m²`,
        packagesCount: tilePacks,
        packageSize: '1.44 m²',
        unitPrice: Math.round(tileM2Price * 1.44),
        totalPrice: tilePacks * Math.round(tileM2Price * 1.44),
      });

      // Elastik kafel kleyi
      const glueBags = Math.ceil(floorArea / 4.5);
      const gluePrice = Math.round(55000 * tierMultiplier);
      materials.push({
        code: 'floor_tile_glue_25kg',
        name: 'Pol uchun kuchaytirilgan elastik kafel kleyi (25 kg)',
        category: 'floor',
        unit: 'qop',
        exactAmount: Number((floorArea / 4.5).toFixed(1)),
        exactUnitStr: `${(floorArea / 4.5).toFixed(1)} qop`,
        packagesCount: glueBags,
        packageSize: '25 kg',
        unitPrice: gluePrice,
        totalPrice: glueBags * gluePrice,
      });

      const tileRate = rates['floor_tile'] || 95000;
      laborItems.push({
        id: 'labor_floor_tile',
        name: 'Polga keramogranit / kafel yotqizish va zatirka',
        category: 'floor',
        area: floorArea,
        unitStr: 'm²',
        ratePerM2: tileRate,
        totalPrice: Math.round(floorArea * tileRate),
      });
    }
  }

  // Jami summalarni hisoblash
  const materialsTotal = materials.reduce((sum, item) => sum + item.totalPrice, 0);
  const laborTotal = laborItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const grandTotal = materialsTotal + laborTotal;

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
    grandTotal,
  };
}
