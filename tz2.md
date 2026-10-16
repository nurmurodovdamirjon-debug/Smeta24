**`Smeta24` (`@Smeta24Bot`)** — ajoyib tanlov! Bu nom qisqa, esda qolarli va foydalanuvchiga tizim **24/7 avtomat rejimda** ishlashini darhol bildiradi.

Quyida loyihani **`Smeta24`** brendi ostida ishga tushirish uchun **3 ta tayyor qism**: `@BotFather` sozlamalari, **Next.js + Tailwind CSS** da Mini App interfeysi va **A4 formatdagi rasmiy PDF-smeta HTML shabloni** keltirilgan.

---

## 1. `@BotFather` uchun tayyor matnlar (Nusxalab qo'yish uchun)

Telegramda `@BotFather` orqali `@Smeta24Bot` ni ochayotganingizda quyidagi ma'lumotlarni kiritasiz (qidiruvda birinchi chiqishi uchun SEO so'zlari qo'shilgan):

* **Bot Name (Ko'rinadigan nomi):**
`Smeta24 | Qurilish va Remont Kalkulyatori`
* **About (Bot profilidagi qisqa yozuv):**
`📐 1 daqiqada xona o'lchamlariga qarab bo'yoq, shpaklyovka, kafel sarfi va rasmiy PDF-smeta hisoblovchi 24/7 avtomat tizim.`
* **Description (Botga birinchi kirganda chiqadigan matn):**
```text
🏠 Smeta24 — Ta'mirlash va qurilish uchun aqlli kalkulyator!

Ushbu ilova orqali 1 daqiqada:
✅ Xona o'lchamiga qarab aniq kvadraturani (m²);
✅ Qancha gruntovka, shpaklyovka, pautinka, bo'yoq yoki kafel ketishini (qop va paqir sonigacha);
✅ O'rtacha bozor narxlari va usta ish haqini hisoblab olasiz.

👷‍♂️ Ustalar uchun: O'z logotipingiz, telefon raqamingiz va stavkalaringiz tushirilgan rasmiy PDF-smeta tayyorlab, mijozga yuboring!

👇 Boshlash uchun pastdagi "📐 Smeta hisoblash" tugmasini bosing:

```


* **Menu Button (Web App tugmasi nomi):**
`📐 Smeta hisoblash`

---

## 2. `Smeta24` Mini App Interfeysi (`Next.js` + `Tailwind CSS`)

Ushbu kodni Next.js loyihangizning `src/app/page.tsx` fayliga joylashtirishingiz bilan **jonli hisoblaydigan (Live Preview)**, usta stavkalarini qo'shadigan va qadoqlar sonini xiralashtirib (Blur), to'lovga yo'naltiradigan to'liq ekran ishga tushadi:

```tsx
"use client";

import React, { useState, useMemo } from "react";

type WorkType = "paint_euro" | "paint_standard" | "tile";

export default function Smeta24App() {
  // 1. Xona geometriyasi
  const [roomName, setRoomName] = useState("Mehmonxona");
  const [length, setLength] = useState<number>(5.5);
  const [width, setWidth] = useState<number>(4.0);
  const [height, setHeight] = useState<number>(3.0);
  const [openingsArea, setOpeningsArea] = useState<number>(4.2);
  const [includeCeiling, setIncludeCeiling] = useState<boolean>(true);
  const [workType, setWorkType] = useState<WorkType>("paint_euro");

  // 2. Usta PRO sozlamalari
  const [isMasterMode, setIsMasterMode] = useState<boolean>(true);
  const [brandName, setBrandName] = useState<string>("ProFinish Uz");
  const [masterPhone, setMasterPhone] = useState<string>("+998 90 123 45 67");
  const [puttyRate, setPuttyRate] = useState<number>(35000);
  const [pautinkaRate, setPautinkaRate] = useState<number>(20000);
  const [paintRate, setPaintRate] = useState<number>(25000);
  const [tileRate, setTileRate] = useState<number>(90000);

  // 3. Jonli hisob-kitob dvijogi
  const calc = useMemo(() => {
    const perimeter = 2 * (length + width);
    const rawWallArea = perimeter * height;
    const netWallArea = Math.max(0, rawWallArea - openingsArea);
    const ceilingArea = includeCeiling ? length * width : 0;
    const totalArea = Number((netWallArea + ceilingArea).toFixed(2));

    const items: {
      name: string;
      exact: string;
      packages: number;
      unit: string;
      price: number;
      total: number;
    }[] = [];

    if (workType === "paint_euro" || workType === "paint_standard") {
      const primerL = totalArea * 0.15 * 3;
      const primerCans = Math.ceil(primerL / 10);
      items.push({
        name: "Chuqur singdiruvchi Gruntovka (10 L)",
        exact: `${primerL.toFixed(1)} litr`,
        packages: primerCans,
        unit: "kanistra",
        price: 85000,
        total: primerCans * 85000,
      });

      const startKg = totalArea * 1.8;
      const startBags = Math.ceil(startKg / 25);
      items.push({
        name: "Start gipsli shpaklyovka (25 kg)",
        exact: `${startKg.toFixed(1)} kg`,
        packages: startBags,
        unit: "qop",
        price: 48000,
        total: startBags * 48000,
      });

      if (workType === "paint_euro") {
        const pautinkaM2 = totalArea * 1.1;
        const pautinkaRolls = Math.ceil(pautinkaM2 / 50);
        items.push({
          name: "Stekloxolst Pautinka 40g/m² (50 m²)",
          exact: `${pautinkaM2.toFixed(1)} m²`,
          packages: pautinkaRolls,
          unit: "rulon",
          price: 240000,
          total: pautinkaRolls * 240000,
        });

        const pastaKg = totalArea * 0.8;
        const pastaBuckets = Math.ceil(pastaKg / 28);
        items.push({
          name: "Super Finish tayyor pasta (28 kg)",
          exact: `${pastaKg.toFixed(1)} kg`,
          packages: pastaBuckets,
          unit: "paqir",
          price: 260000,
          total: pastaBuckets * 260000,
        });
      } else {
        const finishKg = totalArea * 1.0;
        const finishBags = Math.ceil(finishKg / 20);
        items.push({
          name: "Finish quruq shpaklyovka (20 kg)",
          exact: `${finishKg.toFixed(1)} kg`,
          packages: finishBags,
          unit: "qop",
          price: 65000,
          total: finishBags * 65000,
        });
      }

      const paintL = totalArea * 0.28;
      const paintBuckets = Math.ceil(paintL / 15);
      items.push({
        name: "Yuviladigan matoviy emulsiya (15 L)",
        exact: `${paintL.toFixed(1)} litr`,
        packages: paintBuckets,
        unit: "paqir",
        price: 420000,
        total: paintBuckets * 420000,
      });
    } else if (workType === "tile") {
      const tileM2 = totalArea * 1.1;
      const tilePacks = Math.ceil(tileM2 / 1.44);
      items.push({
        name: "Kafel / Keramogranit (1.44 m² pachka)",
        exact: `${tileM2.toFixed(1)} m²`,
        packages: tilePacks,
        unit: "pachka",
        price: 165000,
        total: tilePacks * 165000,
      });

      const glueKg = totalArea * 4.5;
      const glueBags = Math.ceil(glueKg / 25);
      items.push({
        name: "Kafel kleyi (25 kg)",
        exact: `${glueKg.toFixed(1)} kg`,
        packages: glueBags,
        unit: "qop",
        price: 55000,
        total: glueBags * 55000,
      });
    }

    const materialsTotal = items.reduce((acc, i) => acc + i.total, 0);

    let laborPerM2 = 0;
    if (workType === "paint_euro") {
      laborPerM2 = puttyRate + pautinkaRate + paintRate;
    } else if (workType === "paint_standard") {
      laborPerM2 = puttyRate + paintRate;
    } else {
      laborPerM2 = tileRate;
    }

    const laborTotal = isMasterMode ? Math.round(totalArea * laborPerM2) : 0;

    return {
      perimeter: perimeter.toFixed(1),
      netWallArea: netWallArea.toFixed(1),
      ceilingArea: ceilingArea.toFixed(1),
      totalArea,
      items,
      materialsTotal,
      laborPerM2,
      laborTotal,
      grandTotal: materialsTotal + laborTotal,
    };
  }, [
    length,
    width,
    height,
    openingsArea,
    includeCeiling,
    workType,
    isMasterMode,
    puttyRate,
    pautinkaRate,
    paintRate,
    tileRate,
  ]);

  const formatUZS = (num: number) => num.toLocaleString("ru-RU") + " so'm";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 font-sans">
      {/* HEADER: SMETA24 BRANDING */}
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20">
            24
          </div>
          <div>
            <h1 className="font-bold text-base leading-none text-white">
              Smeta<span className="text-amber-400">24</span>
            </h1>
            <p className="text-[11px] text-slate-400">@Smeta24Bot • Aqlli Kalkulyator</p>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1 text-right">
          <span className="text-[10px] text-slate-400 block">Balans</span>
          <span className="text-xs font-bold text-emerald-400">15 000 so&apos;m</span>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* 1-BLOK: XONA O'LCHAMLARI */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
              1. Xona O&apos;lchamlari
            </h2>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="bg-slate-800 text-xs text-right px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500"
              placeholder="Xona nomi"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Uzunligi (m)</label>
              <input
                type="number"
                step="0.1"
                value={length}
                onChange={(e) => setLength( parseFloat(e.target.value) || 0 )}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Eni (m)</label>
              <input
                type="number"
                step="0.1"
                value={width}
                onChange={(e) => setWidth( parseFloat(e.target.value) || 0 )}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Balandligi (m)</label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight( parseFloat(e.target.value) || 0 )}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Eshik/Deraza yuzasi (m²)
              </label>
              <input
                type="number"
                step="0.1"
                value={openingsArea}
                onChange={(e) => setOpeningsArea( parseFloat(e.target.value) || 0 )}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={() => setIncludeCeiling(!includeCeiling)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  includeCeiling
                    ? "bg-amber-500/15 border-amber-500 text-amber-300"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                {includeCeiling ? "✅ Shift qo'shilgan" : "➕ Shiftni ham qo'shish"}
              </button>
            </div>
          </div>

          {/* Kvadratura xulosasi */}
          <div className="bg-slate-950 rounded-xl p-2.5 grid grid-cols-3 text-center border border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 block">Sof devor</span>
              <span className="text-xs font-bold text-white">{calc.netWallArea} m²</span>
            </div>
            <div className="border-x border-slate-800">
              <span className="text-[10px] text-slate-400 block">Shift/Pol</span>
              <span className="text-xs font-bold text-white">{calc.ceilingArea} m²</span>
            </div>
            <div>
              <span className="text-[10px] text-amber-400 block">Jami ish yuzasi</span>
              <span className="text-xs font-black text-amber-400">{calc.totalArea} m²</span>
            </div>
          </div>
        </section>

        {/* 2-BLOK: TA'MIRLASH TURI */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
            2. Ish va Texnologiya Turi
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "paint_euro", label: "Yevro Bo'yoq (Pautinka)" },
              { id: "paint_standard", label: "Standart Bo'yoq" },
              { id: "tile", label: "Kafel / Keramogranit" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setWorkType(tab.id as WorkType)}
                className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition ${
                  workType === tab.id
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow"
                    : "bg-slate-950 text-slate-300 border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* 3-BLOK: USTA PRO BRENDING VA STAVKALAR */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                3. Usta PRO Sozlamalari (PDF uchun)
              </h2>
              <p className="text-[11px] text-slate-400">
                PDF hujjatda sizning nomingiz va ish haqingiz chiqadi
              </p>
            </div>
            <input
              type="checkbox"
              checked={isMasterMode}
              onChange={(e) => setIsMasterMode(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded"
            />
          </div>

          {isMasterMode && (
            <div className="space-y-2.5 pt-1 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    Usta / Brigada nomi
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    Telefon raqamingiz
                  </label>
                  <input
                    type="text"
                    value={masterPhone}
                    onChange={(e) => setMasterPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {workType !== "tile" ? (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Shpaklyovka (1 m²)
                    </label>
                    <input
                      type="number"
                      value={puttyRate}
                      onChange={(e) => setPuttyRate(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-semibold"
                    />
                  </div>
                  {workType === "paint_euro" && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Pautinka (1 m²)
                      </label>
                      <input
                        type="number"
                        value={pautinkaRate}
                        onChange={(e) => setPautinkaRate(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-semibold"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Bo&apos;yash (1 m²)
                    </label>
                    <input
                      type="number"
                      value={paintRate}
                      onChange={(e) => setPaintRate(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-semibold"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    Kafel terish stavkasi (1 m² uchun so&apos;m)
                  </label>
                  <input
                    type="number"
                    value={tileRate}
                    onChange={(e) => setTileRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>
              )}
            </div>
          )}
        </section>

        {/* 4-BLOK: NATIJA VA MONETIZATSIYA OYNA (PREVIEW) */}
        <section className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">
              📊 Smeta24 Hisob Natijasi
            </h2>
            <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-medium">
              {roomName}
            </span>
          </div>

          <div className="space-y-2">
            {calc.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-200">{item.name}</p>
                  <p className="text-[11px] text-slate-400">
                    Sof me&apos;yor: {item.exact}
                  </p>
                </div>
                <div className="text-right">
                  {/* QADOQLAR SONI BLUR QILINGAN (TO'LOVGA UNDOVCHI ELEMENT) */}
                  <span className="inline-block bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded select-none blur-[3px]">
                    {item.packages} {item.unit}
                  </span>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                    {formatUZS(item.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Jami Summalar */}
          <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Materiallar o&apos;rtacha summasi:</span>
              <span className="font-bold">{formatUZS(calc.materialsTotal)}</span>
            </div>
            {isMasterMode && (
              <div className="flex justify-between text-slate-300">
                <span>
                  Usta ish haqi ({calc.totalArea} m² × {formatUZS(calc.laborPerM2)}):
                </span>
                <span className="font-bold text-emerald-400">
                  {formatUZS(calc.laborTotal)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-amber-400 pt-1 border-t border-slate-800/80">
              <span>UMUMIY SMETA BUDJETI:</span>
              <span>{formatUZS(calc.grandTotal)}</span>
            </div>
          </div>

          {/* 2 TA PUL KELADIGAN ASOSIY TUGMA */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
            >
              <span>📄 Brendli PDF-Smetani olish (5 000 so&apos;m)</span>
            </button>

            <button
              type="button"
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-3 px-4 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              <span>🛒 Materiallarni ulgurji narxda buyurtma qilish (Bepul)</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

```

---

## 3. `Smeta24` Rasmiy PDF-Smeta Shabloni (`estimate_pdf.html`)

Usta 5 000 so'm to'lagan soniyada Python (`FastAPI` + `WeasyPrint` yoki `Playwright`) ushbu HTML shablonga ma'lumotlarni qo'yib, 1 soniya ichida **rasmiy A4 PDF** yaratadi va `@Smeta24Bot` orqali ustaning chatiga yuboradi:

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { size: A4; margin: 14mm; }
    body {
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 0;
      font-size: 12px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #f59e0b;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .master-brand h1 {
      margin: 0;
      font-size: 22px;
      color: #0f172a;
      text-transform: uppercase;
    }
    .master-brand p {
      margin: 3px 0 0;
      color: #475569;
      font-size: 12px;
      font-weight: 600;
    }
    .doc-meta {
      text-align: right;
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .doc-meta .badge {
      background: #f59e0b;
      color: #0f172a;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
    }
    .geometry-box {
      display: flex;
      justify-content: space-between;
      background: #f1f5f9;
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    h3 {
      margin: 14px 0 8px;
      font-size: 13px;
      text-transform: uppercase;
      color: #1e293b;
      border-left: 4px solid #f59e0b;
      padding-left: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 8px;
      font-size: 11px;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11.5px;
    }
    tr:nth-child(even) td { background: #f8fafc; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    .summary-card {
      margin-top: 12px;
      border: 2px solid #0f172a;
      border-radius: 10px;
      padding: 12px 16px;
      background: #fffbeb;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 13px;
    }
    .summary-total {
      display: flex;
      justify-content: space-between;
      padding-top: 8px;
      margin-top: 6px;
      border-top: 2px dashed #f59e0b;
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
    }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: #64748b;
    }
  </style>
</head>
<body>

  <!-- 1. USTA BRENDINGI VA HUJJAT RAQAMI -->
  <div class="header">
    <div class="master-brand">
      <h1>{{ master_brand_name }}</h1>
      <p>📞 Mas'ul usta/prorab: {{ master_phone }}</p>
    </div>
    <div class="doc-meta">
      <span class="badge">RASMIY SMETA #{{ estimate_number }}</span>
      <p style="margin: 4px 0 0;">Sana: {{ created_date }}</p>
      <p style="margin: 2px 0 0;">Obyekt: <strong>{{ room_name }}</strong></p>
    </div>
  </div>

  <!-- 2. OBYEKT GEOMETRIYASI -->
  <div class="geometry-box">
    <span>Uzunligi: {{ length }} m</span>
    <span>Eni: {{ width }} m</span>
    <span>Balandligi: {{ height }} m</span>
    <span>Sof devor: {{ net_wall_area }} m²</span>
    <span>Shift: {{ ceiling_area }} m²</span>
    <span style="color:#d97706;">JAMI YUZA: {{ total_area }} m²</span>
  </div>

  <!-- 3. KERAKLI MATERIALLAR JADVALI -->
  <h3>1. Talab etiladigan qurilish materiallari</h3>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Material nomi va qadoq turi</th>
        <th>Sof me'yor</th>
        <th class="text-right">Qadoq soni</th>
        <th class="text-right">O'rtacha narxi</th>
        <th class="text-right">Jami summa</th>
      </tr>
    </thead>
    <tbody>
      <!-- Har bir material qatori -->
      <tr>
        <td>1</td>
        <td class="font-bold">Chuqur singdiruvchi Gruntovka (10 L)</td>
        <td>31.5 litr</td>
        <td class="text-right font-bold">4 kanistra</td>
        <td class="text-right">85 000 so'm</td>
        <td class="text-right font-bold">340 000 so'm</td>
      </tr>
      <tr>
        <td>2</td>
        <td class="font-bold">Start gipsli shpaklyovka (25 kg)</td>
        <td>126.0 kg</td>
        <td class="text-right font-bold">6 qop</td>
        <td class="text-right">48 000 so'm</td>
        <td class="text-right font-bold">288 000 so'm</td>
      </tr>
      <tr>
        <td>3</td>
        <td class="font-bold">Stekloxolst Pautinka 40g/m² (50 m²)</td>
        <td>77.0 m²</td>
        <td class="text-right font-bold">2 rulon</td>
        <td class="text-right">240 000 so'm</td>
        <td class="text-right font-bold">480 000 so'm</td>
      </tr>
      <tr>
        <td>4</td>
        <td class="font-bold">Super Finish tayyor pasta (28 kg)</td>
        <td>56.0 kg</td>
        <td class="text-right font-bold">2 paqir</td>
        <td class="text-right">260 000 so'm</td>
        <td class="text-right font-bold">520 000 so'm</td>
      </tr>
      <tr>
        <td>5</td>
        <td class="font-bold">Yuviladigan matoviy emulsiya (15 L)</td>
        <td>19.6 litr</td>
        <td class="text-right font-bold">2 paqir</td>
        <td class="text-right">420 000 so'm</td>
        <td class="text-right font-bold">840 000 so'm</td>
      </tr>
    </tbody>
  </table>

  <!-- 4. USTA ISH HAQI JADVALI -->
  <h3>2. Bajariladigan ishlar va xizmat haqi</h3>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Ish bosqichi nomi</th>
        <th class="text-right">Hajmi (m²)</th>
        <th class="text-right">1 m² narxi</th>
        <th class="text-right">Jami ish haqi</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Gruntovka va Start/Finish shpaklyovka surtish</td>
        <td class="text-right">70.0 m²</td>
        <td class="text-right">35 000 so'm</td>
        <td class="text-right font-bold">2 450 000 so'm</td>
      </tr>
      <tr>
        <td>2</td>
        <td>Stekloxolst (Pautinka) yopishtirish</td>
        <td class="text-right">70.0 m²</td>
        <td class="text-right">20 000 so'm</td>
        <td class="text-right font-bold">1 400 000 so'm</td>
      </tr>
      <tr>
        <td>3</td>
        <td>Emulsiya bo'yog'i sepish / bo'yash (2 qatlam)</td>
        <td class="text-right">70.0 m²</td>
        <td class="text-right">25 000 so'm</td>
        <td class="text-right font-bold">1 750 000 so'm</td>
      </tr>
    </tbody>
  </table>

  <!-- 5. UMUMIY XULOSA -->
  <div class="summary-card">
    <div class="summary-row">
      <span>Materiallar uchun taxminiy budjet:</span>
      <strong>2 468 000 so'm</strong>
    </div>
    <div class="summary-row">
      <span>Usta xizmat haqi jami:</span>
      <strong>5 600 000 so'm</strong>
    </div>
    <div class="summary-total">
      <span>UMUMIY LOYIHA BUDJETI:</span>
      <span>8 068 000 so'm</span>
    </div>
  </div>

  <!-- 6. VIRUSLI MARKETING FOOTER -->
  <div class="footer">
    <div>
      <strong>Smeta24 (@Smeta24Bot)</strong> — Avtomatlashgan qurilish va ta'mirlash kalkulyatori orqali hisoblandi.<br/>
      Telegram orqali @Smeta24Bot ga kiring va 1 daqiqada o'z uyingiz smetasini bepul hisoblang!
    </div>
    <div style="text-align:right; font-weight:bold; color:#0f172a;">
      t.me/Smeta24Bot
    </div>
  </div>

</body>
</html>

```