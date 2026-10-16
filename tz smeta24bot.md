# TEXNIK TOPSHIRIQ (TZ): "AQLLI SMETA" — Telegram Mini App va Bot Tizimi

**Loyiha nomi:** Aqlli Smeta (Smart Construction Estimator)  
**Platforma:** Telegram Mini App (Web App) + Telegram Bot  
**Avtomatlashuv darajasi:** 100% Avtomat (Inson omilisiz 24/7 ishlovchi B2C/B2B SaaS va Lid-birja)  
**Hujjat versiyasi:** 1.0 (MVP & Production Ready)

---

## 1. Loyiha Maqsadi va Biznes Modeli

**Maqsad:** Uyini ta'mirlayotgan mijozlar hamda ta'mirlash ustalari (bo'yoqchi, suvoqchi, kafelchi, prorablar) uchun xona o'lchamlariga qarab qurilish materiallari sarfini, qadoqlar (qop, paqir, rulon) sonini va usta ish haqini avtomatik hisoblab, rasmiy PDF-smeta tayyorlab beruvchi tizim yaratish.

### 1.1. Kunlik Daromad Oqimlari (Monetizatsiya)
1. **PRO PDF-Smeta generatsiyasi (Pay-per-document):**
   - Usta o'z logotipi, brigada nomi, telefon raqami va $1\text{ m}^2$ uchun shaxsiy ish haqi stavkalarini kiritadi.
   - Mijozga topshirish uchun tayyor, muhr va QR-kodli rasmiy PDF hujjatni yuklab olish narxi: **5 000 – 10 000 so'm**.
2. **B2B Lid-birja (Qurilish do'konlari va ustalar uchun):**
   - Uy egasi materiallarni bepul hisoblagach, *"Ulgurji narxda yetkazib berish"* yoki *"Tasdiqlangan usta chaqirish"* tugmasini bosadi.
   - Hamkor qurilish do'konlari va ustalar ushbu tayyor buyurtma va mijoz raqamini o'zlarining oldindan to'ldirilgan **depozit balansidan 5 000 – 15 000 so'm** evaziga avtomatik sotib oladilar.
3. **Ichki Hamyon (Prepaid paketlar):**
   - Ustalar va do'konlar har safar to'lov qilmaslik uchun balansini oldindan to'ldiradi (masalan: 50 000 so'mga 10 ta emas, +2 ta bonus smeta beriladi).

---

## 2. Texnologik Stek (Tech Stack)

* **Frontend (Telegram Mini App):** Next.js 14+ (App Router), TypeScript, Tailwind CSS, `@twa-dev/sdk` (Telegram WebApp integratsiyasi), Zustand (state management).
* **Backend API:** Python (FastAPI) yoki Node.js (NestJS / Next.js API Routes).
* **Telegram Bot:** Python (`aiogram 3.x`) — bildirishnomalar, PDF fayllarni chatga yuborish va lidlarni guruhlarga tarqatish uchun.
* **Ma'lumotlar bazasi:** PostgreSQL (Supabase / Railway) + Redis (kesh va tezkor sessiyalar uchun).
* **PDF Generatsiya Dvijogi:** `Playwright` / `Puppeteer` yoki `WeasyPrint` (HTML/CSS shablondan 1 soniyada yuqori sifatli A4 PDF yaratish).
* **To'lov Tizimlari (Avto-Billing):** Click Merchant API, Payme Merchant API (Webhook orqali) hamda ichki balans tizimi.

---

## 3. Foydalanuvchi Rollari va Funksional Talablar

### 3.1. Oddiy Foydalanuvchi (Uy egasi / Mijoz)
- Telegram orqali ro'yxatdan o'tmasdan (`initData` orqali) Mini App'ga kirish.
- Xona parametrlarini (uzunlik, eni, balandlik, eshik/derazalar) kiritish.
- Ta'mirlash turini (*Ekonom, Standart, Yevroremont*) tanlash va taxminiy material budjetini ko'rish.
- *"Materiallarni buyurtma qilish"* yoki *"Usta chaqirish"* tugmasi orqali 1 bosishda ariza (lid) qoldirish.

### 3.2. Usta / Prorab (PRO Foydalanuvchi)
- **Shaxsiy Brending Sozlamalari:** Ism/Brigada nomi, telefon raqami, logotip yuklash.
- **Shaxsiy Tariflar Matritsasi:** Har bir ish turi ($1\text{ m}^2$ gruntovka, shpaklyovka, pautinka, bo'yoq, kafel, laminat) uchun o'z ish haqi stavkasini belgilash.
- **Ko'p xonali Smeta:** Bitta obyekt ichiga bir nechta xonalarni (Mehmonxona, Yotoqxona, Oshxona, Sanuzel) qo'shish va umumiy yig'ma smeta olish.
- **PDF Eksport:** To'lov qilingan zahoti Telegram bot orqali tayyor PDF faylni qabul qilish.

### 3.3. Qurilish Do'koni (B2B Hamkor)
- O'z mahsulotlari (Knauf, Weber, Betek va h.k.) narxlarini yangilab borish.
- Hudud bo'yicha tushgan lidlarni ko'rish va depozit balansidan avtomatik xarid qilish.
- Smeta pastida *"Ushbu materiallar [Do'kon nomi]da mavjud"* reklama blokini chiqarish.

---

## 4. Loyiha Fayllar Tuzilmasi (Monorepo Architecture)

```text
aqlli-smeta/
├── apps/
│   ├── webapp/                     # Next.js + Tailwind (Telegram Mini App)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx        # Asosiy Kalkulyator ekrani
│   │   │   │   ├── profile/        # Usta brendingi va narx stavkalari
│   │   │   │   ├── preview/[id]/   # Smeta Preview (Blur) va To'lov oynasi
│   │   │   │   └── leads/          # Do'konlar va ustalar uchun Lid-birja
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   │   ├── calculator.ts   # Qurilish hisob-kitob formulalari
│   │   │   │   └── telegram.ts     # Telegram WebApp SDK helperlari
│   │   └── package.json
│   │
│   └── backend/                    # FastAPI + Aiogram 3 + PDF Engine
│       ├── app/
│       │   ├── api/
│       │   │   ├── auth.py         # Telegram initData validatsiyasi
│       │   │   ├── estimates.py    # Smeta saqlash va hisoblash API
│       │   │   ├── billing.py      # Click / Payme Webhook va Ichki balans
│       │   │   └── leads.py        # Lid yaratish va sotish
│       │   ├── bot/
│       │   │   ├── handlers.py     # /start, PDF yuborish, Lid xabarlari
│       │   │   └── keyboards.py    # WebApp va Inline to'lov tugmalari
│       │   ├── services/
│       │   │   └── pdf_service.py  # HTML -> PDF generatsiya
│       │   ├── templates/
│       │   │   └── estimate_pdf.html # Rasmiy PDF-smeta dizayn shabloni
│       │   └── models/             # SQLAlchemy / Tortoise ORM modellari
│       └── requirements.txt
├── docker-compose.yml
└── TZ.md
```

---

## 5. Matematik Model va Hisoblash Formulalari

Barcha qurilish materiallari do'konda **butun qadoqlarda** sotilgani sababli, hisoblangan sof miqdor har doim yuqoriga (`Math.ceil`) yaxlitlanadi.

### 5.1. Geometriya Formulalari
- **Xona perimetri ($P$):** $P = 2 \times (L + W)$
- **Devorlarning umumiy yuzasi ($S_{\text{raw}}$):** $S_{\text{raw}} = P \times H$
- **Sof devor yuzasi ($S_{\text{devor}}$):** $S_{\text{devor}} = \max(0, S_{\text{raw}} - S_{\text{eshik/deraza}})$
- **Shift va Pol yuzasi ($S_{\text{shift}}, S_{\text{pol}}$):** $S_{\text{shift}} = S_{\text{pol}} = L \times W$
- **Plintus / Galtel uzunligi ($L_{\text{plintus}}$):** $L_{\text{plintus}} = P - \sum W_{\text{eshik}}$

### 5.2. Materiallar Sarf Me'yorlari ($1\text{ m}^2$ uchun)

| Material nomi | $1\text{ m}^2$ uchun me'yor | Standart qadoq | Qadoq soni formulasi |
| :--- | :--- | :--- | :--- |
| **Gruntovka (1 qatlam)** | $0.15\text{ L}$ | $10\text{ L}$ kanistra | `ceil((S * 0.15 * qatlam) / 10)` |
| **Gipsli suvoq (Rotband, $1\text{ sm}$)** | $8.5\text{ kg}$ | $30\text{ kg}$ qop | `ceil((S * 8.5 * qalinlik_sm) / 30)` |
| **Start shpaklyovka ($2\text{ mm}$)** | $1.8\text{ kg}$ | $25\text{ kg}$ qop | `ceil((S * 1.8) / 25)` |
| **Finish shpaklyovka (quruq)** | $1.0\text{ kg}$ (2 qatlam) | $20\text{ kg}$ qop | `ceil((S * 1.0) / 20)` |
| **Super Finish pasta (Sheetrock)** | $0.8\text{ kg}$ (2 qatlam) | $28\text{ kg}$ paqir | `ceil((S * 0.8) / 28)` |
| **Stekloxolst (Pautinka)** | $1.10\text{ m}^2$ (+10% zapas) | $50\text{ m}^2$ rulon | `ceil((S * 1.10) / 50)` |
| **Pautinka kleyi** | $0.25\text{ kg}$ | $10\text{ kg}$ paqir | `ceil((S * 0.25) / 10)` |
| **Suv emulsiyali bo'yoq (2 qatlam)** | $0.28\text{ L}$ | $15\text{ L}$ paqir | `ceil((S * 0.28) / 15)` |
| **Kafel / Keramogranit** | $1.10\text{ m}^2$ (+10% kesishga) | $1.44\text{ m}^2$ pachka | `ceil((S * 1.10) / 1.44)` |
| **Kafel kleyi** | $4.5\text{ kg}$ | $25\text{ kg}$ qop | `ceil((S * 4.5) / 25)` |

### 5.3. Hisoblash Dvijogi Kodi (`calculator.ts`)

```typescript
export interface RoomInput {
  length: number;
  width: number;
  height: number;
  openingsArea: number;
  includeCeiling: boolean;
  workType: 'paint_euro' | 'paint_standard' | 'tile';
  masterRates?: {
    puttyPerM2: number;
    paintPerM2: number;
    pautinkaPerM2: number;
    tilePerM2: number;
  };
}

export interface MaterialItem {
  code: string;
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
    const primerLiters = totalWorkArea * 0.15 * 3;
    const primerCans = Math.ceil(primerLiters / 10);
    materials.push({
      code: 'primer_10l',
      name: 'Chuqur singdiruvchi Gruntovka (10L)',
      unit: 'kanistra',
      exactAmount: Number(primerLiters.toFixed(1)),
      packagesCount: primerCans,
      packageSize: '10 L',
      unitPrice: 85000,
      totalPrice: primerCans * 85000,
    });

    const startKg = totalWorkArea * 1.8;
    const startBags = Math.ceil(startKg / 25);
    materials.push({
      code: 'start_putty_25kg',
      name: 'Start gipsli shpaklyovka (25 kg)',
      unit: 'qop',
      exactAmount: Number(startKg.toFixed(1)),
      packagesCount: startBags,
      packageSize: '25 kg',
      unitPrice: 48000,
      totalPrice: startBags * 48000,
    });

    if (input.workType === 'paint_euro') {
      const pautinkaM2 = totalWorkArea * 1.1;
      const pautinkaRolls = Math.ceil(pautinkaM2 / 50);
      materials.push({
        code: 'pautinka_50m2',
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
        code: 'super_finish_28kg',
        name: 'Super Finish tayyor pasta (28 kg)',
        unit: 'paqir',
        exactAmount: Number(pastaKg.toFixed(1)),
        packagesCount: pastaBuckets,
        packageSize: '28 kg',
        unitPrice: 260000,
        totalPrice: pastaBuckets * 260000,
      });
    } else {
      const finishKg = totalWorkArea * 1.0;
      const finishBags = Math.ceil(finishKg / 20);
      materials.push({
        code: 'finish_putty_20kg',
        name: 'Finish shpaklyovka (20 kg)',
        unit: 'qop',
        exactAmount: Number(finishKg.toFixed(1)),
        packagesCount: finishBags,
        packageSize: '20 kg',
        unitPrice: 65000,
        totalPrice: finishBags * 65000,
      });
    }

    const paintLiters = totalWorkArea * 0.28;
    const paintBuckets = Math.ceil(paintLiters / 15);
    materials.push({
      code: 'emulsion_paint_15l',
      name: 'Yuviladigan matoviy emulsiya (15 L)',
      unit: 'paqir',
      exactAmount: Number(paintLiters.toFixed(1)),
      packagesCount: paintBuckets,
      packageSize: '15 L',
      unitPrice: 420000,
      totalPrice: paintBuckets * 420000,
    });
  }

  const materialsTotal = materials.reduce((sum, item) => sum + item.totalPrice, 0);

  let laborTotal = 0;
  if (input.masterRates) {
    if (input.workType === 'paint_euro') {
      laborTotal =
        totalWorkArea *
        (input.masterRates.puttyPerM2 +
          input.masterRates.pautinkaPerM2 +
          input.masterRates.paintPerM2);
    } else if (input.workType === 'paint_standard') {
      laborTotal =
        totalWorkArea *
        (input.masterRates.puttyPerM2 + input.masterRates.paintPerM2);
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

## 6. Ma'lumotlar Bazasi Sxemasi (PostgreSQL)

```sql
-- 1. Foydalanuvchilar, Ustalar va Do'konlar
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    tg_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(150),
    phone VARCHAR(25),
    role VARCHAR(20) DEFAULT 'client', -- 'client', 'master', 'shop', 'admin'
    balance BIGINT DEFAULT 0,          -- Ichki hamyon balansi (so'mda)
    brand_name VARCHAR(150),           -- Ustaning PDF da chiqadigan nomi
    brand_logo_url TEXT,               -- Ustaning logotipi URL manzili
    master_rates JSONB DEFAULT '{}',   -- Ustaning 1 m2 uchun stavkalari
    region VARCHAR(80),                -- Hudud (masalan: Toshkent, Navoiy, Qarshi)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Materiallar Katalogi
CREATE TABLE materials_catalog (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_uz VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    tier VARCHAR(20) DEFAULT 'standard',
    consumption_per_m2 NUMERIC(6,3) NOT NULL,
    package_volume NUMERIC(8,2) NOT NULL,
    package_unit VARCHAR(30) NOT NULL,
    avg_price BIGINT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Smetalar (Estimates)
CREATE TABLE estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES users(id),
    project_title VARCHAR(150) NOT NULL,
    rooms_data JSONB NOT NULL,
    materials_total BIGINT NOT NULL,
    labor_total BIGINT DEFAULT 0,
    grand_total BIGINT NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    pdf_file_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Lid-Birja (Buyurtmalar)
CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    estimate_id UUID REFERENCES estimates(id),
    client_phone VARCHAR(25) NOT NULL,
    region VARCHAR(80) NOT NULL,
    lead_type VARCHAR(30) NOT NULL, -- 'materials_order' | 'need_master'
    lead_price BIGINT DEFAULT 10000,
    purchased_by BIGINT REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'open', -- 'open' | 'sold' | 'expired'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Moliyaviy Tranzaksiyalar
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    amount BIGINT NOT NULL,
    tx_type VARCHAR(30) NOT NULL, -- 'topup' | 'pdf_unlock' | 'lead_buy'
    provider VARCHAR(30),         -- 'click' | 'payme' | 'internal_balance'
    external_tx_id VARCHAR(120),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_tg_id ON users(tg_id);
CREATE INDEX idx_estimates_user_id ON estimates(user_id);
CREATE INDEX idx_leads_region_status ON leads(region, status);
```

---

## 7. Backend REST API Spetsifikatsiyasi

### 7.1. Autentifikatsiya va Profil
* `POST /api/v1/auth/telegram`
  - **Vazifasi:** Telegram WebApp `initData` satrini HMAC-SHA256 orqali tekshiradi va JWT token qaytaradi.
* `PUT /api/v1/users/profile`
  - **Vazifasi:** Ustaning logotipi, brigada nomi, telefon raqami va `master_rates` stavkalarini saqlaydi.

### 7.2. Smeta Hisoblash va PDF Ochish
* `POST /api/v1/estimates/calculate`
  - **Vazifasi:** Kiritilgan xona o'lchamlaridan smeta yaratadi (`is_paid = false`). Qadoqlar sonini yashirilgan (`locked`) holatda qaytaradi.
* `POST /api/v1/estimates/{estimate_id}/unlock`
  - **Vazifasi:** Foydalanuvchi balansidan 5 000 so'm yechadi (yoki to'lov havolasini qaytaradi). Muvaffaqiyatli bo'lsa, PDF generatsiya qilib Telegram chatga yuboradi.

### 7.3. To'lov va Lid-Birja
* `POST /api/v1/billing/webhook/{provider}`
  - **Vazifasi:** Click va Payme tizimlaridan kelgan to'lovlarni avto-tasdiqlash va balansni to'ldirish.
* `POST /api/v1/leads/create`
  - **Vazifasi:** Uy egasining arizasini hududiy do'konlar va ustalar kanaliga yuborish.
* `POST /api/v1/leads/{lead_id}/buy`
  - **Vazifasi:** Do'kon yoki usta balansidan lid narxini yechib, mijozning telefon raqami va to'liq smetasini shaxsiy chatga yuborish.

---

## 8. Rasmiy PDF-Smeta Hujjati Tuzilmasi

Generatsiya qilinadigan A4 PDF hujjati quyidagi 5 ta blokdan iborat bo'ladi:
1. **Header (Brending):** Ustaning logotipi, brigada nomi, telefon raqami, mijoz ismi, obyekt manzili va sana.
2. **Obyekt Geometriyasi:** Xonalar ro'yxati, devor/shift/pol kvadraturasi ($m^2$), chegirilgan eshik va derazalar maydoni.
3. **Kerakli Materiallar Jadvali:** T/r, Material nomi, Me'yoriy sarfi, Qadoq turi (qop/paqir/rulon), Qadoqlar soni, O'rtacha narxi, Jami summasi.
4. **Bajariladigan Ishlar (Usta haqi) Jadvali:** Ish bosqichi (Gruntovka, Start/Finish shpaklyovka, Pautinka, Bo'yash), O'lchov birligi ($m^2$), Miqdori, $1\text{ m}^2$ narxi va Jami ish haqi.
5. **Footer (Xulosa va Virusli Marketing):**
   - `Materiallar uchun jami: XXX XXX so'm`
   - `Usta xizmati uchun jami: XXX XXX so'm`
   - `UMUMIY BUDJET: X XXX XXX so'm`
   - Pastki burchakda: *"Aqlli Smeta (@bot_username) orqali hisoblandi"* yozuvi va **QR-kod** (yangi mijozlar va ustalarni bepul jalb qilish uchun).

---

## 9. MVP Ishga Tushirish Rejasi (4 Haftalik Roadmap)

- **1-hafta (Core & UI):** Next.js Mini App interfeysi, kalkulyator formulalari (`calculator.ts`) va Usta profili sozlamalarini yaratish.
- **2-hafta (Backend & Bot):** FastAPI, PostgreSQL jadvallari, Aiogram 3 bot va HTML-dan PDF generatsiya qilish modulini ulash.
- **3-hafta (Billing & Lid-birja):** Ichki hamyon, Click/Payme to'lov integratsiyasi va lidlarni avtomatik sotish mexanizmini ishga tushirish.
- **4-hafta (Test va Reliz):** Ustalar va qurilish guruhlarida test qilish, dastlabki 3 ta bepul smeta bonusi bilan organik trafik yig'ish.