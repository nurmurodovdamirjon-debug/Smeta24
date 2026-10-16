# 🏗️ Smeta24 — Aqlli Qurilish va Remont Kalkulyatori (@Smeta24Bot)

> **Dastur muallifi:** Nurmurodov Damirjon  
> **Loyiha turi:** Telegram Mini App (TMA) & Avtomatlashtirilgan Bot Tizimi  
> **Texnologiyalar:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, FastAPI, Aiogram 3, SQLAlchemy, PostgreSQL, WeasyPrint

---

## 📌 Loyiha Haqida

**Smeta24** — xonadon, ofis va binolarni ta'mirlashda qurilish materiallari (gruntovka, shpaklyovka, pautinka, emulsiya bo'yog'i, kafel va boshqalar) sarfini Davlat qurilish standartlari (ShNQ) hamda yetakchi ishlab chiqaruvchilar me'yorlari asosida bir zumda aniq hisoblab beruvchi, rasmiy PDF-smeta shakllantiruvchi va B2B lidlarni tarqatuvchi zamonaviy platforma.

---

## ✨ Asosiy Funksiyalar

1. **📐 Aniq Geometriya & Sarf Kalkulyatori:**
   - Xona o'lchamlari ($L, W, H$), eshik/deraza maydonlari va shiftni hisobga olgan holda sof yuzani chiqarish.
   - Materiallarni butun qadoqlarga qarab yaxlitlash (`Math.ceil` bo'yicha kanistra, qop, paqir, rulon, pachka).
2. **👷‍♂️ Usta PRO Rejimi:**
   - Har bir ustaga o'z brend nomi, telefon raqami va har bir $m^2$ ish uchun shaxsiy narx stavkalarini belgilash imkoniyati.
3. **📄 Rasmiy A4 PDF-Smeta:**
   - Mualliflik va usta brendi, QR-kodli verifikatsiya va batafsil xarajatlar jadvali tushirilgan yuklab olinadigan rasmiy hujjat.
4. **🏬 B2B Lid-Birja va Ulgurji Buyurtma:**
   - Mijozlar uchun do'konlardan ulgurji narxda materiallar olish uchun bepul ariza qoldirish.
   - Ustalar va prorablar uchun yangi obyekt buyurtmalarini sotib olish birjasi.

---

## 📁 Loyiha Strukturasi

```
Smeta24/
├── apps/
│   ├── webapp/            # Next.js 16 Telegram Mini App (Frontend)
│   │   ├── src/
│   │   │   ├── app/       # App Router (Sahifalar va layout)
│   │   │   └── lib/       # Kalkulyator va Telegram SDK helperlari
│   │   └── package.json
│   │
│   └── backend/           # FastAPI & Aiogram 3 Bot (Backend)
│       ├── app/
│       │   ├── bot/       # Telegram Bot handlerlari va menyulari
│       │   ├── api/       # REST API endpointlari
│       │   ├── models/    # PostgreSQL ma'lumotlar bazasi modellari
│       │   ├── services/  # Hisoblash va PDF generatsiya xizmatlari
│       │   └── templates/ # Rasmiy A4 PDF HTML shabloni
│       ├── bot_runner.py  # Botni ishga tushirish skripti
│       └── requirements.txt
│
├── docker-compose.yml     # PostgreSQL va servislar uchun Docker sozlamalari
└── README.md
```

---

## ⚡ Tezkor Ishga Tushirish

### 1. Frontend (Telegram Mini App)
```bash
cd apps/webapp
npm install
npm run dev
```

### 2. Backend & Telegram Bot
```bash
cd apps/backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
python bot_runner.py
```

---

## 🌐 Vercel orqali Joylashtirish (Deploy)

1. [Vercel](https://vercel.com) ga kiring va GitHub repozitoriyangizni ulang: `https://github.com/nurmurodovdamirjon-debug/Smeta24.git`.
2. **Root Directory** bo'limida `apps/webapp` papkasini tanlang.
3. **Deploy** tugmasini bosing.
4. Olingan Vercel domenini (masalan: `https://smeta24.vercel.app`) `apps/backend/.env` faylidagi `WEB_APP_URL`ga qo'ying.
5. Botdagi **"📐 Smeta hisoblash"** tugmasi 24/7 uzluksiz dunyoning istalgan nuqtasidan ishlaydi!

---

## 👨‍💻 Muallif

**Nurmurodov Damirjon**  
Telegram: [@Smeta24Bot](https://t.me/Smeta24Bot)
