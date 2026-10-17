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

  // Hudud / Tuman bozor material narxlari
  materialPrices?: Record<string, number>;

  // Ro'yxatdan chiqarib tashlangan materiallar kodlari (masalan: usta yoki mijozda allaqachon bor bo'lsa)
  excludedMaterialCodes?: string[];

  // Qo'lda o'zgartirilgan material miqdorlari (masalan: usta 8 dona o'rniga 10 dona qilganda)
  customMaterialQuantities?: Record<string, number>;
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
  isExcluded?: boolean;
  isCustomQuantity?: boolean;
  autoPackagesCount?: number;
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

export interface MaterialConfig {
  code: string;
  aliases?: string[];
  name: string;
  unit: string;
  defaultPrice: number;
  category: 'Shift' | 'Devor' | 'Pol' | 'Umumiy';
}

export interface LaborRateConfig {
  id: string;
  aliases?: string[];
  name: string;
  unit: string;
  defaultRate: number;
  category: 'Shift' | 'Devor' | 'Pol';
}

// 2026-yil O'zbekiston viloyat va tumanlar bozor narxlari standarti
export const CONFIGURABLE_MATERIALS: MaterialConfig[] = [
  // Shift
  // Shift
  { code: 'gips_sheet_9_5', aliases: ['gips_sheet_plain', 'gips_sheet_decor'], name: 'Gipskarton Knauf 9.5 mm (1.2x2.5m)', unit: 'dona', defaultPrice: 52000, category: 'Shift' },
  { code: 'profile_ud_27', aliases: ['profile_decor_set'], name: 'Yo\'naltiruvchi profil UD-27 (3 metr)', unit: 'dona', defaultPrice: 18000, category: 'Shift' },
  { code: 'profile_cd_60', name: 'Shift profili CD-60 (3 metr)', unit: 'dona', defaultPrice: 26000, category: 'Shift' },
  { code: 'podves_tyaga', name: 'Shift ilgichlari (Podves ES)', unit: 'dona', defaultPrice: 2500, category: 'Shift' },
  { code: 'fasteners_gips_set', name: 'Gipskarton samorez va dyubellar to\'plami', unit: 'quti', defaultPrice: 35000, category: 'Shift' },
  { code: 'tape_serpyanka_fugen', name: 'Choklar uchun Serpyanka to\'r + Fugen', unit: 'to\'plam', defaultPrice: 65000, category: 'Shift' },
  { code: 'stretch_ceiling_full', aliases: ['natyajnoy_potolok_m2'], name: 'Natyajnoy potolok (plyonka + montaj)', unit: 'm²', defaultPrice: 65000, category: 'Shift' },
  { code: 'ceiling_paint_white_15l', aliases: ['ceiling_paint_white'], name: 'Shift oq bo\'yog\'i (15 L)', unit: 'paqir', defaultPrice: 380000, category: 'Shift' },

  // Devor
  { code: 'plaster_rotband_30kg', aliases: ['wall_rotband_plaster_30kg'], name: 'Gipsli suvoq Rotband (30 kg)', unit: 'qop', defaultPrice: 52000, category: 'Devor' },
  { code: 'mayak_plaster_6mm', name: 'Devor tekislash metall mayoqlari (6 mm)', unit: 'dona', defaultPrice: 8000, category: 'Devor' },
  { code: 'putty_start_25kg', aliases: ['wall_start_putty_25kg'], name: 'Start gipsli shpaklyovka (25 kg)', unit: 'qop', defaultPrice: 48000, category: 'Devor' },
  { code: 'putty_finish_pasta_28kg', aliases: ['wall_finish_pasta_28kg'], name: 'Super Finish tayyor pasta (28 kg)', unit: 'paqir', defaultPrice: 260000, category: 'Devor' },
  { code: 'putty_finish_dry_20kg', aliases: ['wall_finish_putty_20kg'], name: 'Finish quruq shpaklyovka (20 kg)', unit: 'qop', defaultPrice: 65000, category: 'Devor' },
  { code: 'pautinka_roll_50m2', aliases: ['wall_pautinka_roll_50m2'], name: 'Stekloxolst Pautinka 40g/m² (50 m²)', unit: 'rulon', defaultPrice: 240000, category: 'Devor' },
  { code: 'pautinka_glue_10kg', aliases: ['wall_pautinka_glue_10kg'], name: 'Pautinka uchun tayyor kley (10 kg)', unit: 'paqir', defaultPrice: 110000, category: 'Devor' },
  { code: 'paint_wall_15l', aliases: ['wall_paint_premium_15l'], name: 'Devor uchun mat emulsiya bo\'yog\'i (15 L)', unit: 'paqir', defaultPrice: 420000, category: 'Devor' },
  { code: 'masking_tape_film_set', name: 'Molyarniy skotch va himoya plyonkasi', unit: 'to\'plam', defaultPrice: 35000, category: 'Devor' },
  { code: 'wallpaper_vinil_roll', aliases: ['wallpaper_roll'], name: 'Vinil / Flizelin oboy (1.06m x 10m)', unit: 'rulon', defaultPrice: 180000, category: 'Devor' },
  { code: 'wallpaper_glue_box', aliases: ['wallpaper_glue'], name: 'Flizelin oboy kleyi (quti)', unit: 'quti', defaultPrice: 45000, category: 'Devor' },
  { code: 'tile_wall_pack', aliases: ['wall_tile_pack'], name: 'Devor kafel / plitka (1.44 m² pachka)', unit: 'pachka', defaultPrice: 160000, category: 'Devor' },
  { code: 'tile_glue_c2_25kg', aliases: ['wall_tile_glue_25kg'], name: 'Kafel kleyi C2 kuchaytirilgan (25 kg)', unit: 'qop', defaultPrice: 55000, category: 'Devor' },
  { code: 'tile_grout_fuga_2kg', aliases: ['floor_tile_grout_2kg'], name: 'Kafel choklari uchun Zatirka Fuga (2 kg)', unit: 'quti', defaultPrice: 38000, category: 'Devor' },
  { code: 'tile_svp_cross_set', aliases: ['floor_tile_svp_set'], name: 'Kafel tekislash SVP qisqichlari to\'plami', unit: 'to\'plam', defaultPrice: 45000, category: 'Devor' },

  // Pol
  { code: 'cement_m400_50kg', aliases: ['floor_screed_cement_50kg'], name: 'Sement M400 styajka uchun (50 kg)', unit: 'qop', defaultPrice: 45000, category: 'Pol' },
  { code: 'self_leveling_25kg', aliases: ['floor_self_leveling_25kg'], name: 'Nalivnoy pol samonivelir (25 kg)', unit: 'qop', defaultPrice: 65000, category: 'Pol' },
  { code: 'laminate_33_pack', aliases: ['laminate_pack'], name: 'Laminat 33-klass (2.13 m² pachka)', unit: 'pachka', defaultPrice: 255000, category: 'Pol' },
  { code: 'underlay_roll_10m2', aliases: ['laminate_subfloor_pack'], name: 'Laminat osti podlojkasi 3mm (10 m²)', unit: 'rulon', defaultPrice: 45000, category: 'Pol' },
  { code: 'plinth_pvc_2_5m', aliases: ['plinth_plastic_2_5m'], name: 'PVX rezinali pol plintusi (2.5 metr)', unit: 'dona', defaultPrice: 22000, category: 'Pol' },
  { code: 'parquet_board_m2', name: 'Tabiiy parket / Inzhener doska (1 m²)', unit: 'm²', defaultPrice: 280000, category: 'Pol' },
  { code: 'parquet_glue_14kg', name: 'Poliuretan 2K parket yelimi (14 kg)', unit: 'paqir', defaultPrice: 420000, category: 'Pol' },
  { code: 'plinth_wood_2_4m', name: 'Yog\'och / MDF shponli plintus (2.4 m)', unit: 'dona', defaultPrice: 45000, category: 'Pol' },
  { code: 'tile_floor_pack', aliases: ['floor_tile_pack'], name: 'Pol keramogranit (1.44 m² pachka)', unit: 'pachka', defaultPrice: 195000, category: 'Pol' },

  // Umumiy
  { code: 'primer_deep_10l', aliases: ['primer_10l'], name: 'Chuqur singuvchi gruntovka (10 L)', unit: 'kanistra', defaultPrice: 85000, category: 'Umumiy' },
];

export const CONFIGURABLE_LABOR_RATES: LaborRateConfig[] = [
  // Shift
  { id: 'ceiling_gips_plain', aliases: ['ceiling_gipsokarton_plain'], name: 'Shiftga tekis gipskarton montaji', unit: 'so\'m/m²', defaultRate: 50000, category: 'Shift' },
  { id: 'ceiling_gips_decor', aliases: ['ceiling_gipsokarton_decor'], name: 'Shiftga figurali/naqshli gipskarton', unit: 'so\'m/m²', defaultRate: 85000, category: 'Shift' },
  { id: 'ceiling_paint_spray', aliases: ['ceiling_spray'], name: 'Shift: Shpaklyovka + Kraskapultda purkash', unit: 'so\'m/m²', defaultRate: 35000, category: 'Shift' },
  { id: 'ceiling_paint_roller', aliases: ['ceiling_roller'], name: 'Shift: Shpaklyovka + Valikda bo\'yash', unit: 'so\'m/m²', defaultRate: 25000, category: 'Shift' },
  { id: 'ceiling_stretch', name: 'Natyajnoy potolok o\'rnatish', unit: 'so\'m/m²', defaultRate: 65000, category: 'Shift' },

  // Devor
  { id: 'wall_plaster', name: 'Mayoq bo\'yicha gipsli suvoq (Rotband)', unit: 'so\'m/m²', defaultRate: 35000, category: 'Devor' },
  { id: 'wall_putty', name: 'Devorlarni shpaklyovka qilish (Start + Finish)', unit: 'so\'m/m²', defaultRate: 30000, category: 'Devor' },
  { id: 'wall_pautinka', name: 'Stekloxolst (Pautinka) yopishtirish', unit: 'so\'m/m²', defaultRate: 20000, category: 'Devor' },
  { id: 'wall_paint_spray', aliases: ['wall_spray'], name: 'Devor: Shpaklyovka + Kraskapultda purkash', unit: 'so\'m/m²', defaultRate: 40000, category: 'Devor' },
  { id: 'wall_paint_roller', aliases: ['wall_roller'], name: 'Devor: Shpaklyovka + Valikda bo\'yash', unit: 'so\'m/m²', defaultRate: 30000, category: 'Devor' },
  { id: 'wall_wallpaper', name: 'Vinil / Flizelin oboy yopishtirish', unit: 'so\'m/m²', defaultRate: 30000, category: 'Devor' },
  { id: 'wall_tile', name: 'Devorga kafel terish va zatirka', unit: 'so\'m/m²', defaultRate: 90000, category: 'Devor' },
  { id: 'wall_paint_standard', name: 'Standart shpaklyovka va bo\'yash', unit: 'so\'m/m²', defaultRate: 25000, category: 'Devor' },

  // Pol
  { id: 'floor_screed', name: 'Pol steshkasi (Beton styajka, 5 sm)', unit: 'so\'m/m²', defaultRate: 35000, category: 'Pol' },
  { id: 'floor_self_leveling', name: 'Nalivnoy pol quyish va tekislash', unit: 'so\'m/m²', defaultRate: 20000, category: 'Pol' },
  { id: 'floor_laminate', name: 'Laminat va plintus yotqizish', unit: 'so\'m/m²', defaultRate: 25000, category: 'Pol' },
  { id: 'floor_parquet', name: 'Parket yotqizish, yelimlash va plintus', unit: 'so\'m/m²', defaultRate: 85000, category: 'Pol' },
  { id: 'floor_tile', name: 'Polga keramogranit / kafel yotqizish', unit: 'so\'m/m²', defaultRate: 95000, category: 'Pol' },
];

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
  const floorArea = (input.floorWork !== 'none' || input.includeScreed || input.includeSelfLeveling)
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
  const customMaterialPrices = input.materialPrices || {};

  // Narxni tuman/do'kon kiritilgan narxi yoki bazaviy narxdan aniqlash funksiyasi
  const getMaterialPrice = (code: string, defaultPrice: number): number => {
    if (customMaterialPrices[code] !== undefined && customMaterialPrices[code] > 0) {
      return customMaterialPrices[code];
    }
    const conf = CONFIGURABLE_MATERIALS.find(m => m.code === code || m.aliases?.includes(code));
    if (conf) {
      if (customMaterialPrices[conf.code] !== undefined && customMaterialPrices[conf.code] > 0) {
        return customMaterialPrices[conf.code];
      }
      if (conf.aliases) {
        for (const al of conf.aliases) {
          if (customMaterialPrices[al] !== undefined && customMaterialPrices[al] > 0) {
            return customMaterialPrices[al];
          }
        }
      }
    }
    return Math.round(defaultPrice * tierMultiplier);
  };

  const getLaborRate = (id: string, defaultRate: number): number => {
    if (rates[id] !== undefined && rates[id] > 0) return rates[id];
    const conf = CONFIGURABLE_LABOR_RATES.find(l => l.id === id || l.aliases?.includes(id));
    if (conf) {
      if (rates[conf.id] !== undefined && rates[conf.id] > 0) return rates[conf.id];
      if (conf.aliases) {
        for (const al of conf.aliases) {
          if (rates[al] !== undefined && rates[al] > 0) return rates[al];
        }
      }
    }
    return defaultRate;
  };

  // =========================================================================
  // A. SHIFT ISHLARI (CEILING)
  // =========================================================================
  if (input.ceilingWork !== 'none' && ceilingArea > 0) {
    // 1. Gipskarton tekis (1 qavatli)
    if (input.ceilingWork === 'gipsokarton_plain') {
      const gipsSheets = Math.ceil((ceilingArea * 1.08) / 3.0);
      const sheetPrice = getMaterialPrice('gips_sheet_9_5', 52000);
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

      // Profil UD-27
      const udProfiles = Math.ceil(perimeter / 3.0);
      const udPrice = getMaterialPrice('profile_ud_27', 18000);
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

      // Profil CD-60
      const cdProfiles = Math.ceil(ceilingArea * 0.9);
      const cdPrice = getMaterialPrice('profile_cd_60', 26000);
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

      // Podves
      const podvesCount = Math.ceil(ceilingArea * 2.5);
      const podvesPrice = getMaterialPrice('podves_tyaga', 2500);
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

      // Samorez va dyubellar to'plami
      const fastenerSets = Math.ceil(ceilingArea / 15.0);
      const fastenerPrice = getMaterialPrice('fasteners_gips_set', 35000);
      materials.push({
        code: 'fasteners_gips_set',
        name: 'Gipskarton samorez va dyubellar to\'plami (TN 25/35mm + bloxa + 6x40)',
        category: 'ceiling',
        unit: 'quti',
        exactAmount: fastenerSets,
        exactUnitStr: `${fastenerSets} quti`,
        packagesCount: fastenerSets,
        packageSize: 'to\'plam',
        unitPrice: fastenerPrice,
        totalPrice: fastenerSets * fastenerPrice,
        description: 'Shift profillari va gipskarton listlarini mustahkamlash uchun'
      });

      // Serpyanka to'r va Fugen shpaklyovka
      const chokSets = Math.ceil(ceilingArea / 20.0);
      const chokPrice = getMaterialPrice('tape_serpyanka_fugen', 65000);
      materials.push({
        code: 'tape_serpyanka_fugen',
        name: 'Gipskarton choklari uchun Serpyanka to\'r + Fugenfyuller',
        category: 'ceiling',
        unit: 'to\'plam',
        exactAmount: chokSets,
        exactUnitStr: `${chokSets} to\'plam`,
        packagesCount: chokSets,
        packageSize: 'lenta + 5kg',
        unitPrice: chokPrice,
        totalPrice: chokSets * chokPrice,
        description: 'Gipskarton listlar tutashgan joylarni yoriqdan saqlovchi to\'r va gips'
      });

      const rate = getLaborRate('ceiling_gips_plain', 50000);
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

    // 2. Gipskarton naqshli / figurali (2 qavatli)
    else if (input.ceilingWork === 'gipsokarton_decor') {
      const gipsSheets = Math.ceil((ceilingArea * 1.45) / 3.0);
      const sheetPrice = getMaterialPrice('gips_sheet_9_5', 52000);
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

      const profilesTotal = Math.ceil(ceilingArea * 1.8);
      const profileAvgPrice = getMaterialPrice('profile_cd_60', 26000);
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

      const rate = getLaborRate('ceiling_gips_decor', 85000);
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
      const stretchPrice = getMaterialPrice('stretch_ceiling_full', 65000);
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

      const rate = getLaborRate('ceiling_stretch', 65000);
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
      const isSpray = input.ceilingWork === 'paint_spray';
      const ceilingPaintLiters = ceilingArea * (isSpray ? 0.22 : 0.26);
      const paintPails = Math.ceil(ceilingPaintLiters / 15);
      const paintPrice = getMaterialPrice('ceiling_paint_white_15l', 380000);
      materials.push({
        code: 'ceiling_paint_white_15l',
        name: `Shift uchun super oq matoviy bo'yoq (15 L, ${isSpray ? 'Kraskapult' : 'Valik'})`,
        category: 'ceiling',
        unit: 'paqir',
        exactAmount: Number(ceilingPaintLiters.toFixed(1)),
        exactUnitStr: `${ceilingPaintLiters.toFixed(1)} litr`,
        packagesCount: paintPails,
        packageSize: '15 litr',
        unitPrice: paintPrice,
        totalPrice: paintPails * paintPrice,
      });

      const puttyKg = ceilingArea * 1.5;
      const puttyBags = Math.ceil(puttyKg / 25);
      const puttyPrice = getMaterialPrice('putty_start_25kg', 48000);
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

      const rateKey = isSpray ? 'ceiling_paint_spray' : 'ceiling_paint_roller';
      const rate = getLaborRate(rateKey, isSpray ? 35000 : 25000);
      laborItems.push({
        id: 'labor_ceiling_paint',
        name: isSpray 
          ? 'Shiftni kraskapultda (purkash orqali) dog\'siz bo\'yash' 
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
      const plasterPrice = getMaterialPrice('plaster_rotband_30kg', 52000);

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

      // Mayoqlar (Mayachniy profil 6 mm, 3 metr)
      const mayakPcs = Math.ceil(netWallArea / 2.5);
      const mayakPrice = getMaterialPrice('mayak_plaster_6mm', 8000);
      materials.push({
        code: 'mayak_plaster_6mm',
        name: 'Devor tekislash metall mayoqlari (6 mm, 3 metr)',
        category: 'plaster',
        unit: 'dona',
        exactAmount: Number((netWallArea / 2.5).toFixed(1)),
        exactUnitStr: `${(netWallArea / 2.5).toFixed(1)} dona`,
        packagesCount: mayakPcs,
        packageSize: '3 metr',
        unitPrice: mayakPrice,
        totalPrice: mayakPcs * mayakPrice,
        description: 'Gipsli suvoqni mayoq bo\'yicha tekislash uchun ruxlangan profil'
      });

      const rate = getLaborRate('wall_plaster', 35000);
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
    const primerPrice = getMaterialPrice('primer_deep_10l', 85000);
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
      const isSpray = input.wallWork === 'paint_spray';
      const startKg = netWallArea * 1.8;
      const startBags = Math.ceil(startKg / 25);
      const startPrice = getMaterialPrice('putty_start_25kg', 48000);
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

      if (input.includePautinka) {
        const pautinkaM2 = netWallArea * 1.1;
        const pautinkaRolls = Math.ceil(pautinkaM2 / 50);
        const pautinkaPrice = getMaterialPrice('pautinka_roll_50m2', 240000);
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

        const glueKg = netWallArea * 0.25;
        const gluePails = Math.ceil(glueKg / 10);
        const gluePrice = getMaterialPrice('pautinka_glue_10kg', 110000);
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

        const pautinkaRate = getLaborRate('wall_pautinka', 20000);
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
      const finishPrice = getMaterialPrice('putty_finish_pasta_28kg', 260000);
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
      const paintLiters = netWallArea * (isSpray ? 0.24 : 0.28);
      const paintPails = Math.ceil(paintLiters / 15);
      const paintPrice = getMaterialPrice('paint_wall_15l', 420000);
      materials.push({
        code: 'paint_wall_15l',
        name: `Yuviladigan matoviy akril emulsiya bo'yog'i (15 L, ${isSpray ? 'Kraskapult' : 'Valik'})`,
        category: 'paint',
        unit: 'paqir',
        exactAmount: Number(paintLiters.toFixed(1)),
        exactUnitStr: `${paintLiters.toFixed(1)} litr`,
        packagesCount: paintPails,
        packageSize: '15 litr',
        unitPrice: paintPrice,
        totalPrice: paintPails * paintPrice,
      });

      const puttyRate = getLaborRate('wall_putty', 30000);
      laborItems.push({
        id: 'labor_wall_putty',
        name: 'Devorlarni shpaklyovka qilish va silliqlash (Start + Finish)',
        category: 'wall',
        area: netWallArea,
        unitStr: 'm²',
        ratePerM2: puttyRate,
        totalPrice: Math.round(netWallArea * puttyRate),
      });

      const rateKey = isSpray ? 'wall_paint_spray' : 'wall_paint_roller';
      const paintRate = getLaborRate(rateKey, isSpray ? 40000 : 30000);
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
      const wallpaperRolls = Math.ceil((netWallArea * 1.10) / 10.6);
      const rollPrice = getMaterialPrice('wallpaper_vinil_roll', 180000);
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

      const glueBoxes = Math.ceil(wallpaperRolls / 5);
      const glueBoxPrice = getMaterialPrice('wallpaper_glue_box', 45000);
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

      const puttyKg = netWallArea * 1.2;
      const puttyBags = Math.ceil(puttyKg / 25);
      const puttyPrice = getMaterialPrice('putty_start_25kg', 48000);
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

      const wallpaperRate = getLaborRate('wall_wallpaper', 30000);
      laborItems.push({
        id: 'labor_wall_wallpaper',
        name: 'Oboy yopishtirish (choklarni tekislash bilan)',
        category: 'wall',
        area: netWallArea,
        unitStr: 'm²',
        ratePerM2: wallpaperRate,
        totalPrice: Math.round(netWallArea * wallpaperRate),
      });
    }

    // 5. Devor: Kafel / Keramogranit
    else if (input.wallWork === 'tile') {
      const tileAreaExact = netWallArea * 1.10;
      const tilePacks = Math.ceil(tileAreaExact / 1.44);
      const tilePackPrice = getMaterialPrice('tile_wall_pack', 237600); // ~165 000 so'm/m2
      materials.push({
        code: 'tile_wall_pack',
        name: 'Devor uchun keramogranit / kafel (+10% zapas)',
        category: 'tile',
        unit: 'pachka',
        exactAmount: Number(tileAreaExact.toFixed(1)),
        exactUnitStr: `${tileAreaExact.toFixed(1)} m²`,
        packagesCount: tilePacks,
        packageSize: '1.44 m²',
        unitPrice: tilePackPrice,
        totalPrice: tilePacks * tilePackPrice,
      });

      const glueBags = Math.ceil((netWallArea * 4.5) / 25);
      const gluePrice = getMaterialPrice('tile_glue_c2_25kg', 55000);
      materials.push({
        code: 'tile_glue_c2_25kg',
        name: 'Kafel kleyi C2 kuchaytirilgan elastik (25 kg)',
        category: 'tile',
        unit: 'qop',
        exactAmount: Number((netWallArea * 4.5).toFixed(1)),
        exactUnitStr: `${(netWallArea * 4.5).toFixed(1)} kg`,
        packagesCount: glueBags,
        packageSize: '25 kg',
        unitPrice: gluePrice,
        totalPrice: glueBags * gluePrice,
      });

      // Zatirka (Fuga)
      const groutPacks = Math.ceil((netWallArea * 0.35) / 2.0);
      const groutPrice = getMaterialPrice('tile_grout_fuga_2kg', 38000);
      materials.push({
        code: 'tile_grout_fuga_2kg',
        name: 'Kafel choklari uchun namlikka chidamli Zatirka Fuga (2 kg)',
        category: 'tile',
        unit: 'quti',
        exactAmount: Number((netWallArea * 0.35).toFixed(1)),
        exactUnitStr: `${(netWallArea * 0.35).toFixed(1)} kg`,
        packagesCount: groutPacks,
        packageSize: '2 kg',
        unitPrice: groutPrice,
        totalPrice: groutPacks * groutPrice,
        description: 'Kafel oralaridagi choklarni suv va zamburug\'dan himoyalovchi fuga'
      });

      // SVP tekislagichlar
      const svpSets = Math.ceil(netWallArea / 12.0);
      const svpPrice = getMaterialPrice('tile_svp_cross_set', 45000);
      materials.push({
        code: 'tile_svp_cross_set',
        name: 'Kafel tekislash SVP qisqichlari va krestiklar to\'plami',
        category: 'tile',
        unit: 'to\'plam',
        exactAmount: svpSets,
        exactUnitStr: `${svpSets} to\'plam`,
        packagesCount: svpSets,
        packageSize: '100 dona',
        unitPrice: svpPrice,
        totalPrice: svpSets * svpPrice,
      });

      const tileRate = getLaborRate('wall_tile', 90000);
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
      const cementBags = Math.ceil(floorArea / 1.5);
      const cementPrice = getMaterialPrice('cement_m400_50kg', 45000);
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

      const rate = getLaborRate('floor_screed', 35000);
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
      const selfLevelBags = Math.ceil(floorArea / 5.0);
      const selfLevelPrice = getMaterialPrice('self_leveling_25kg', 65000);
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

      const rate = getLaborRate('floor_self_leveling', 20000);
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
      const laminateAreaExact = floorArea * 1.07;
      const laminatePacks = Math.ceil(laminateAreaExact / 2.13);
      const laminatePackPrice = getMaterialPrice('laminate_33_pack', 255000);
      materials.push({
        code: 'laminate_33_pack',
        name: 'Laminat 33-klass namlikka chidamli (+7% zapas)',
        category: 'floor',
        unit: 'pachka',
        exactAmount: Number(laminateAreaExact.toFixed(1)),
        exactUnitStr: `${laminateAreaExact.toFixed(1)} m²`,
        packagesCount: laminatePacks,
        packageSize: '2.13 m²',
        unitPrice: laminatePackPrice,
        totalPrice: laminatePacks * laminatePackPrice,
      });

      // Podlojka
      const underlayRolls = Math.ceil(floorArea / 10.0);
      const underlayPrice = getMaterialPrice('underlay_roll_10m2', 45000);
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

      // Plintus
      const plinthPcs = Math.ceil(plinthLength / 2.5);
      const plinthPrice = getMaterialPrice('plinth_pvc_2_5m', 22000);
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

      const rate = getLaborRate('floor_laminate', 25000);
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
      const parquetAreaExact = floorArea * 1.10;
      const parquetM2Price = getMaterialPrice('parquet_board_m2', 280000);
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

      const gluePails = Math.ceil(floorArea / 11.0);
      const gluePrice = getMaterialPrice('parquet_glue_14kg', 420000);
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

      const plinthPcs = Math.ceil(plinthLength / 2.4);
      const plinthPrice = getMaterialPrice('plinth_wood_2_4m', 45000);
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

      const rate = getLaborRate('floor_parquet', 85000);
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
      const tilePackPrice = getMaterialPrice('tile_floor_pack', 195000); // ~135 000 so'm/m2

      materials.push({
        code: 'tile_floor_pack',
        name: 'Pol uchun keramogranit / kafel (+10% zapas)',
        category: 'floor',
        unit: 'pachka',
        exactAmount: Number(tileAreaExact.toFixed(1)),
        exactUnitStr: `${tileAreaExact.toFixed(1)} m²`,
        packagesCount: tilePacks,
        packageSize: '1.44 m²',
        unitPrice: tilePackPrice,
        totalPrice: tilePacks * tilePackPrice,
      });

      const glueBags = Math.ceil(floorArea / 4.5);
      const gluePrice = getMaterialPrice('tile_glue_c2_25kg', 55000);
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

      const tileRate = getLaborRate('floor_tile', 95000);
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

  // Excluded materiallarni va Qo'lda belgilangan miqdorlarni inobatga olgan holda hisoblash
  const excludedCodes = input.excludedMaterialCodes || [];
  const customQuantities = input.customMaterialQuantities || {};

  const processedMaterials: MaterialItem[] = materials.map((item) => {
    const isExcluded = excludedCodes.includes(item.code);
    const hasCustomQty = customQuantities[item.code] !== undefined && customQuantities[item.code] > 0;
    const finalPackagesCount = hasCustomQty ? customQuantities[item.code] : item.packagesCount;
    const itemTotal = isExcluded ? 0 : finalPackagesCount * item.unitPrice;

    return {
      ...item,
      isExcluded,
      packagesCount: finalPackagesCount,
      autoPackagesCount: item.packagesCount,
      isCustomQuantity: hasCustomQty,
      totalPrice: itemTotal,
    };
  });

  // Jami summalarni hisoblash
  const materialsTotal = processedMaterials.reduce((sum, item) => sum + item.totalPrice, 0);
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
    materials: processedMaterials,
    laborItems,
    materialsTotal,
    laborTotal,
    grandTotal,
  };
}

// =========================================================================
// KO'P XONALI TIZIM (Multi-Room Support)
// =========================================================================

export interface RoomData {
  id: string;
  input: RoomInput;
  estimate: EstimateResult;
}

export interface ProjectData {
  id: string;
  name: string;
  rooms: RoomData[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  totalRooms: number;
  totalFloorArea: number;
  totalWallArea: number;
  totalCeilingArea: number;
  totalWorkArea: number;
  combinedMaterials: MaterialItem[];
  combinedLabor: LaborItem[];
  materialsGrandTotal: number;
  laborGrandTotal: number;
  projectGrandTotal: number;
  roomBreakdown: {
    roomName: string;
    roomId: string;
    materialsTotal: number;
    laborTotal: number;
    grandTotal: number;
    floorArea: number;
  }[];
}

/** Bir nechta xona estimatini birlashtirib, loyiha miqyosida umumiy hisobotni chiqaradi */
export function calculateProjectSummary(rooms: RoomData[]): ProjectSummary {
  let totalFloorArea = 0;
  let totalWallArea = 0;
  let totalCeilingArea = 0;
  let totalWorkArea = 0;
  let materialsGrandTotal = 0;
  let laborGrandTotal = 0;

  const combinedMaterials: MaterialItem[] = [];
  const combinedLabor: LaborItem[] = [];
  const roomBreakdown: ProjectSummary['roomBreakdown'] = [];

  for (const room of rooms) {
    const est = room.estimate;
    const geo = est.geometry;

    totalFloorArea += geo.floorArea;
    totalWallArea += geo.netWallArea;
    totalCeilingArea += geo.ceilingArea;
    totalWorkArea += geo.totalWorkArea;
    materialsGrandTotal += est.materialsTotal;
    laborGrandTotal += est.laborTotal;

    // Materiallarni ro'yxatga qo'shish (xona nomi bilan belgilash)
    for (const mat of est.materials) {
      combinedMaterials.push({
        ...mat,
        name: `${mat.name}`,
        description: `${room.input.roomName}: ${mat.description || mat.name}`,
      });
    }

    // Mehnat xarajatlarini qo'shish
    for (const lab of est.laborItems) {
      combinedLabor.push({
        ...lab,
        id: `${room.id}_${lab.id}`,
        name: `${room.input.roomName}: ${lab.name}`,
      });
    }

    roomBreakdown.push({
      roomName: room.input.roomName,
      roomId: room.id,
      materialsTotal: est.materialsTotal,
      laborTotal: est.laborTotal,
      grandTotal: est.grandTotal,
      floorArea: geo.floorArea,
    });
  }

  return {
    totalRooms: rooms.length,
    totalFloorArea: Number(totalFloorArea.toFixed(2)),
    totalWallArea: Number(totalWallArea.toFixed(2)),
    totalCeilingArea: Number(totalCeilingArea.toFixed(2)),
    totalWorkArea: Number(totalWorkArea.toFixed(2)),
    combinedMaterials,
    combinedLabor,
    materialsGrandTotal,
    laborGrandTotal,
    projectGrandTotal: materialsGrandTotal + laborGrandTotal,
    roomBreakdown,
  };
}

/** Yangi xona uchun default input qaytaradi */
export function createDefaultRoomInput(roomName: string = 'Xona'): RoomInput {
  return {
    roomName,
    length: 4.0,
    width: 3.5,
    height: 2.8,
    openingsArea: 3.0,
    ceilingWork: 'gipsokarton_plain',
    wallWork: 'paint_spray',
    includePlaster: false,
    includePautinka: true,
    plasterThicknessCm: 1.0,
    floorWork: 'laminate',
    includeScreed: false,
    includeSelfLeveling: false,
    tier: 'standard',
  };
}

/** Unique ID generator */
export function generateRoomId(): string {
  return `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}
