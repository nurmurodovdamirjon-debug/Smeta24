Quyida **"Aqlli Smeta" (Telegram Mini App + Bot)** loyihasini 100% avtomatlashgan holatda ishga tushirish uchun to'liq **Texnik Topshiriq (TZ)**, **aniq qurilish-hisoblash formulalari (TypeScript kodi bilan)** hamda **PostgreSQL ma'lumotlar bazasi arxitekturasi** keltirilgan.

---

## 1. Loyiha Texnik Topshirig'i (TZ)

### 1.1. Foydalanuvchi rollari

Tizim Telegram ID (`tg_id`) orqali foydalanuvchini avtomatik ro'yxatdan o'tkazadi va 3 ta rolda ishlaydi:

1. **Oddiy foydalanuvchi (Uy egasi):** Xona o'lchamlarini kiritadi, taxminiy material sarfi va o'rtacha bozor budjetini ko'radi. "Arzon narxda material buyurtma qilish" yoki "Usta chaqirish" tugmasini bosib, ariza (lid) qoldiradi.
2. **Usta / Prorab (Asosiy to'lovchi B2C/B2B segment):** O'z profilida **Logotip, Ism/Brigada nomi, Telefon raqami** va har bir ish turi uchun o'z stavkasini (masalan, shpaklyovka — $1\text{ m}^2$ uchun $35\ 000\text{ so'm}$, bo'yoq — $25\ 000\text{ so'm}$) saqlab qo'yadi. Mijozning uyida o'lchamlarni kiritib, **5 000 – 10 000 so'm** evaziga o'z brendingi tushirilgan rasmiy PDF-smetani yuklab oladi.
3. **Qurilish do'koni (B2B Hamkor):** O'z depozit balansini to'ldiradi, o'z mahsulotlari narxini yangilaydi va uy egalaridan tushgan tayyor materiallar ro'yxatini (lidlarni) balans hisobidan avtomatik sotib oladi.

---

### 1.2. Foydalanuvchi oqimi (User Flow — 100% Avtomat)

1. **Kirish:** Foydalanuvchi Telegram botga `/start` bosadi va `"📐 Smeta hisoblash"` Web App tugmasi orqali Mini App'ni ochadi.
2. **O'lchamlarni kiritish (1-ekran):**
* Xona nomi (masalan: *Mehmonxona, Yotoqxona, Oshxona, Sanuzel*).
* Geometriya: Uzunligi ($L$), Eni ($W$), Balandligi ($H$).
* Eshik va derazalar: Soni va o'lchamlari (standart o'lchamlar shablon sifatida tayyor turadi: masalan, eshik $0.9 \times 2.1\text{ m}$, deraza $1.5 \times 1.5\text{ m}$).


3. **Ish va material turini tanlash (2-ekran):**
* **Devor:** Suvoq (Rotband), Start + Finish shpaklyovka, Pautinka (stekloxolst), Bo'yoq (emulsiya) yoki Oboy, Kafel.
* **Shift:** Gipsokarton, Shpaklyovka + Bo'yoq.
* **Pol:** Styajka, Laminat yoki Kafel.
* **Segment tanlovi:** *Ekonom*, *Standart (Knauf / Betek / Weber)* yoki *Premium*.


4. **Natija va Preview (3-ekran):**
* Ekranda umumiy yuzalar ($m^2$) va kerakli materiallarning umumiy summasi ko'rinadi.
* Aniq qoplar soni, usta ish haqi jadvali va rasmiy PDF hujjat ustiga **"NAMUNA / TO'LOVDAN SO'NG OCHILADI"** xiralashtirilgan (blur) himoya qatlami qo'yiladi.


5. **Avto-Billing va Yetkazish (4-ekran):**
* Usta `"📄 Rasmiy PDF Smetani olish (5 000 so'm)"` tugmasini bosadi.
* Agar ichki balansida pul bo'lsa — shu zahoti yechiladi; bo'lmasa — Click/Payme to'lov oynasi ochiladi.
* To'lov o'tgan soniyada server PDF generatsiya qiladi va bot orqali foydalanuvchining Telegram chatiga yuboradi.



---

## 2. Materiallarni Hisoblash Formulalari va Me'yorlari

Qurilishda materiallar kilogramm yoki litrda emas, **butun qadoqlarda (qop, paqir, rulon, pachka)** sotib olinadi. Shu sababli dastur har doim yuqoriga yaxlitlash (`Math.ceil`) qoidasi bilan ishlaydi.

### 2.1. Bazaviy Geometriya Formulalari

* **Xona perimetri ($P$):**

$$P = 2 \times (L + W)$$


* **Devorlarning umumiy yuzasi ($S_{\text{devor\_umumiy}}$):**

$$S_{\text{devor\_umumiy}} = P \times H$$


* **Sof devor yuzasi ($S_{\text{devor}}$):**

$$S_{\text{devor}} = S_{\text{devor\_umumiy}} - \sum (W_{\text{eshik}} \times H_{\text{eshik}}) - \sum (W_{\text{deraza}} \times H_{\text{deraza}})$$


* **Shift va Pol yuzasi ($S_{\text{shift}}$, $S_{\text{pol}}$):**

$$S_{\text{shift}} = S_{\text{pol}} = L \times W$$


* **Plintus va Galtel uzunligi ($L_{\text{plintus}}$):**

$$L_{\text{plintus}} = P - \sum W_{\text{eshik}}$$



---

### 2.2. Materiallar sarfi jadvali ($1\text{ m}^2$ uchun standart me'yorlar)

| Material turi | Sarf me'yori ($1\text{ m}^2$ uchun) | Standart qadoq | Qadoqlar sonini hisoblash formulasi |
| --- | --- | --- | --- |
| **Gruntovka (1 qatlam)** | $0.15\text{ litr}$ | $10\text{ L}$ kanistra | $\lceil (S \times 0.15 \times \text{qatlam}) / 10 \rceil$ |
| **Gipsli suvoq (Rotband, $10\text{ mm}$)** | $8.5\text{ kg}$ | $30\text{ kg}$ qop | $\lceil (S \times 8.5 \times \text{qalinlik\_sm}) / 30 \rceil$ |
| **Start shpaklyovka ($2\text{ mm}$)** | $1.8\text{ kg}$ | $25\text{ kg}$ qop | $\lceil (S \times 1.8) / 25 \rceil$ |
| **Finish shpaklyovka (quruq)** | $1.0\text{ kg}$ (2 qatlam) | $20\text{ kg}$ qop | $\lceil (S \times 1.0) / 20 \rceil$ |
| **Finish pasta (Sheetrock/tayyor)** | $0.8\text{ kg}$ (2 qatlam) | $28\text{ kg}$ paqir | $\lceil (S \times 0.8) / 28 \rceil$ |
| **Stekloxolst (Pautinka)** | $1.10\text{ m}^2$ (+10% zapas) | $50\text{ m}^2$ rulon | $\lceil (S \times 1.10) / 50 \rceil$ |
| **Pautinka kleyi** | $0.25\text{ kg}$ | $10\text{ kg}$ paqir | $\lceil (S \times 0.25) / 10 \rceil$ |
| **Suv emulsiyali bo'yoq (2 qatlam)** | $0.28\text{ litr}$ (yoki $0.4\text{ kg}$) | $15\text{ L}$ (yoki $20\text{ kg}$) paqir | $\lceil (S \times 0.28) / 15 \rceil$ |
| **Kafel / Keramogranit** | $1.10\text{ m}^2$ (+10% kesishga) | Pachka (masalan, $1.44\text{ m}^2$) | $\lceil (S \times 1.10) / 1.44 \rceil$ |
| **Kafel kleyi** | $4.5\text{ kg}$ | $25\text{ kg}$ qop | $\lceil (S \times 4.5) / 25 \rceil$ |

---

### 2.3. Tayyor TypeScript Hisoblash Moduli (Frontend & Backend uchun)

Ushbu funksiya Next.js Mini App ichida ham, FastAPI/Node.js serverida ham bir xil mantiqda ishlaydi:

```typescript
export interface RoomInput {
  length: number;        // Uzunligi (m)
  width: number;         // Eni (m)
  height: number;        // Balandligi (m)
  openingsArea: number;  // Eshik va derazalar jami yuzasi (m2)
  includeCeiling: boolean;
  workType: 'paint_euro' | 'paint_standard' | 'tile';
  masterRates?: {
    puttyPerM2: number;  // Shpaklyovka ish haqi (so'm/m2)
    paintPerM2: number;  // Bo'yoq ish haqi (so'm/m2)
    pautinkaPerM2: number;
    tilePerM2: number;
  };
}

export interface MaterialItem {
  name: string;
  unit: string;
  exactAmount: number;
  packagesCount: number;
  packageSize: string;
  unitPrice: number;
  totalPrice: number;
}

export function calculateSmartEstimate(input: RoomInput) {
  const perimeter = 2 * (input.length + input.width);
  const rawWallArea = perimeter * input.height;
  const netWallArea = Math.max(0, rawWallArea - input.openingsArea);
  const ceilingArea = input.includeCeiling ? input.length * input.width : 0;
  const totalWorkArea = Number((netWallArea + ceilingArea).toFixed(2));

  const materials: MaterialItem[] = [];

  if (input.workType === 'paint_euro' || input.workType === 'paint_standard') {
    // 1. Gruntovka (3 qatlam: startdan oldin, finishdan oldin, bo'yoqdan oldin)
    const primerLiters = totalWorkArea * 0.15 * 3;
    const primerCans = Math.ceil(primerLiters / 10);
    materials.push({
      name: 'Chuqur singdiruvchi Gruntovka (10L)',
      unit: 'kanistra',
      exactAmount: Number(primerLiters.toFixed(1)),
      packagesCount: primerCans,
      packageSize: '10 L',
      unitPrice: 85000,
      totalPrice: primerCans * 85000,
    });

    // 2. Start shpaklyovka (25 kg)
    const startKg = totalWorkArea * 1.8;
    const startBags = Math.ceil(startKg / 25);
    materials.push({
      name: 'Start gipsli shpaklyovka (25 kg)',
      unit: 'qop',
      exactAmount: Number(startKg.toFixed(1)),
      packagesCount: startBags,
      packageSize: '25 kg',
      unitPrice: 48000,
      totalPrice: startBags * 48000,
    });

    // 3. Yevroremont bo'lsa: Pautinka (Stekloxolst) + Kley + Tayyor Pasta
    if (input.workType === 'paint_euro') {
      const pautinkaM2 = totalWorkArea * 1.1;
      const pautinkaRolls = Math.ceil(pautinkaM2 / 50);
      materials.push({
        name: 'Stekloxolst (Pautinka 40g/m2, 50m2)',
        unit: 'rulon',
        exactAmount: Number(pautinkaM2.toFixed(1)),
        packagesCount: pautinkaRolls,
        packageSize: '50 m2',
        unitPrice: 240000,
        totalPrice: pautinkaRolls * 240000,
      });

      const pastaKg = totalWorkArea * 0.8;
      const pastaBuckets = Math.ceil(pastaKg / 28);
      materials.push({
        name: 'Super Finish tayyor shpaklyovka-pasta (28 kg)',
        unit: 'paqir',
        exactAmount: Number(pastaKg.toFixed(1)),
        packagesCount: pastaBuckets,
        packageSize: '28 kg',
        unitPrice: 260000,
        totalPrice: pastaBuckets * 260000,
      });
    } else {
      // Standart: Quruq Finish shpaklyovka (20 kg)
      const finishKg = totalWorkArea * 1.0;
      const finishBags = Math.ceil(finishKg / 20);
      materials.push({
        name: 'Finish shpaklyovka (20 kg)',
        unit: 'qop',
        exactAmount: Number(finishKg.toFixed(1)),
        packagesCount: finishBags,
        packageSize: '20 kg',
        unitPrice: 65000,
        totalPrice: finishBags * 65000,
      });
    }

    // 4. Suv emulsiyali bo'yoq (2 qatlam)
    const paintLiters = totalWorkArea * 0.28;
    const paintBuckets = Math.ceil(paintLiters / 15);
    materials.push({
      name: 'Yuviladigan matoviy emulsiya bo\'yog\'i (15 L)',
      unit: 'paqir',
      exactAmount: Number(paintLiters.toFixed(1)),
      packagesCount: paintBuckets,
      packageSize: '15 L',
      unitPrice: 420000,
      totalPrice: paintBuckets * 420000,
    });
  }

  const materialsTotal = materials.reduce((sum, item) => sum + item.totalPrice, 0);

  // Usta ish haqini hisoblash
  let laborTotal = 0;
  if (input.masterRates) {
    if (input.workType === 'paint_euro') {
      laborTotal = totalWorkArea * (
        input.masterRates.puttyPerM2 +
        input.masterRates.pautinkaPerM2 +
        input.masterRates.paintPerM2
      );
    } else if (input.workType === 'paint_standard') {
      laborTotal = totalWorkArea * (
        input.masterRates.puttyPerM2 +
        input.masterRates.paintPerM2
      );
    }
  }

  return {
    geometry: { perimeter, netWallArea, ceilingArea, totalWorkArea },
    materials,
    materialsTotal,
    laborTotal,
    grandTotal: materialsTotal + laborTotal,
  };
}

```

---

## 3. Ma'lumotlar Bazasi Strukturasi (PostgreSQL Schema)

Tizim 5 ta asosiy jadval ustida ishlaydi:

```sql
-- 1. Foydalanuvchilar va Ustalar jadvali
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    tg_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(150),
    phone VARCHAR(25),
    role VARCHAR(20) DEFAULT 'client', -- 'client', 'master', 'shop', 'admin'
    balance BIGINT DEFAULT 0,          -- Ichki hamyon balansi (so'mda)
    brand_name VARCHAR(150),           -- Ustaning PDF da chiqadigan nomi (masalan: "ProFinish Uz")
    brand_logo_url TEXT,               -- Ustaning logotipi manzili
    master_rates JSONB DEFAULT '{}',   -- Ustaning 1 m2 uchun shaxsiy narxlari
    region VARCHAR(80),                -- Hudud (lid tarqatish uchun)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Materiallar va o'rtacha bozor narxlari katalogi
CREATE TABLE materials_catalog (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,  -- 'primer_10l', 'start_putty_25kg', 'paint_15l'
    name_uz VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,     -- 'putty', 'paint', 'tile', 'primer'
    tier VARCHAR(20) DEFAULT 'standard', -- 'econom', 'standard', 'premium'
    consumption_per_m2 NUMERIC(6,3) NOT NULL,
    package_volume NUMERIC(8,2) NOT NULL,
    package_unit VARCHAR(30) NOT NULL, -- 'qop', 'paqir', 'rulon', 'pachka'
    avg_price BIGINT NOT NULL,         -- Bozor o'rtacha narxi (so'mda)
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Yaratilgan Smetalar (Estimates)
CREATE TABLE estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES users(id),
    project_title VARCHAR(150) NOT NULL, -- Masalan: "3 xonali kvartira - Mehmonxona"
    rooms_data JSONB NOT NULL,           -- Kiritilgan xonalar o'lchamlari va hisob natijalari
    materials_total BIGINT NOT NULL,
    labor_total BIGINT DEFAULT 0,
    grand_total BIGINT NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,       -- 5 000 - 10 000 so'm to'langanmi?
    pdf_file_id TEXT,                    -- Telegram serveridagi file_id (qayta yuklamaslik uchun)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Lid-Birja (Uy egalaridan do'kon va ustalarga tushgan buyurtmalar)
CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    estimate_id UUID REFERENCES estimates(id),
    client_phone VARCHAR(25) NOT NULL,
    region VARCHAR(80) NOT NULL,
    lead_type VARCHAR(30) NOT NULL,      -- 'materials_order' yoki 'need_master'
    lead_price BIGINT DEFAULT 10000,     -- Lidni ochish narxi (masalan: 10 000 so'm)
    purchased_by BIGINT REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'open',   -- 'open', 'sold', 'expired'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. To'lovlar va Tranzaksiyalar tarixi (Click / Payme / Ichki balans)
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    amount BIGINT NOT NULL,              -- Musbat (kirim) yoki manfiy (yechilish)
    tx_type VARCHAR(30) NOT NULL,        -- 'topup', 'pdf_unlock', 'lead_buy'
    provider VARCHAR(30),                -- 'click', 'payme', 'internal_balance'
    external_tx_id VARCHAR(120),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

```

---

## 4. Backend API va Avtomatlashuv Mexanizmi

Loyiha **FastAPI (Python)** + **Aiogram 3** hamda **Next.js (Mini App)** o'rtasida quyidagi 5 ta asosiy API endpoint orqali ishlaydi:

| Endpoint | Vazifasi | Avtomatlashuv mantig'i |
| --- | --- | --- |
| `POST /api/auth/telegram` | Mini App'dan kelgan `initData` xeshini tekshiradi. | Foydalanuvchi hech qanday login-parolsiz 1 soniyada tizimga kiradi. |
| `POST /api/estimates/calculate` | Xona o'lchamlarini qabul qilib, smetani hisoblaydi va bazaga `is_paid = false` qilib saqlaydi. | Frontendga faqat umumiy summani to'liq, qadoqlar sonini esa yashirilgan (`locked`) holatda qaytaradi. |
| `POST /api/estimates/{id}/unlock` | Usta balansidan 5 000 so'm yechadi yoki Click/Payme to'lov havolasini yaratadi. | To'lov tasdiqlanishi bilan `is_paid = true` bo'ladi va PDF generator ishga tushadi. |
| `POST /api/pdf/send-to-chat` | HTML shablondan PDF yaratib, Bot orqali ustaning Telegramiga yuboradi. | Yuborilgan PDF'ning Telegram `file_id` kodi bazada saqlanadi — keyingi safar serverni qiynamasdan 0.1 soniyada qayta yuboraveradi. |
| `POST /api/leads/publish` | Uy egasi "Material sotib olish" tugmasini bossa, hamkor do'konlarning yopiq guruhiga xabar tashlaydi. | Do'kon xabardagi `"🔓 Kontaktni ochish (10 000 so'm)"` inline tugmasini bosishi bilan balansidan pul yechilib, mijoz raqami va ro'yxat botning shaxsiy xabariga boradi. |

---

## 5. PDF Smeta Shablonining Tuzilishi (Ustalar nega pul to'laydi?)

Usta 5 000 so'mni shunchaki kalkulyator uchun emas, **mijozning ko'z oldida obro'sini oshiradigan rasmiy hujjat** uchun to'laydi. PDF hujjat quyidagi bloklardan iborat bo'ladi:

1. **Yuqori qism (Header):** Ustaning logotipi, brigada nomi, telefon raqami, obyekt manzili va smeta tuzilgan sana.
2. **1-bo'lim (Obyekt o'lchamlari):** Xonalar yuzasi, chegirilgan eshik-derazalar va sof ishchi kvadratura ($m^2$).
3. **2-bo'lim (Kerakli materiallar ro'yxati):** Material nomi, aniq me'yori, yaxlitlangan qadoqlar (qop/paqir) soni, o'rtacha narxi va jami summasi.
4. **3-bo'lim (Bajariladigan ishlar va usta haqi):** Har bir bosqich (gruntovka, shpaklyovka, pautinka, bo'yash) kvadraturasi va summasi.
5. **Pastki qism (Footer):** Jami budjet, ustaning kafolat shartlari va Mini App'ga olib boruvchi QR-kod (bu QR-kod orqali mijozning tanishlari ham botga kiradi — **bepul virusli reklama**).