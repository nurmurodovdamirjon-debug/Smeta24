"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  calculateSmartEstimate,
  formatUZS,
  CeilingWorkType,
  WallWorkType,
  FloorWorkType,
  QualityTier,
  RoomInput,
} from "@/lib/calculator";
import {
  initTelegramApp,
  triggerHaptic,
  triggerNotificationHaptic,
  getTelegramUser,
  TelegramUser,
} from "@/lib/telegram";
import {
  Calculator,
  UserCheck,
  Building2,
  FileText,
  Lock,
  Unlock,
  Sparkles,
  CheckCircle2,
  Download,
  Info,
  MapPin,
  ShoppingBag,
  X,
  CreditCard,
  Plus,
  Loader2,
  Printer,
  Send,
  Paintbrush,
  Hammer,
  Layers,
  ChevronDown,
  Settings,
} from "lucide-react";

export default function Smeta24MiniApp() {
  // Navigation Tabs: 'calc' | 'profile' | 'leads' | 'guide'
  const [activeTab, setActiveTab] = useState<'calc' | 'profile' | 'leads' | 'guide'>('calc');

  // Telegram User
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);

  // 1. Xona Geometriyasi
  const [roomName, setRoomName] = useState("Mehmonxona");
  const [length, setLength] = useState<number>(5.5);
  const [width, setWidth] = useState<number>(4.0);
  const [height, setHeight] = useState<number>(3.0);
  const [openingsArea, setOpeningsArea] = useState<number>(4.2);

  // 2. Modulli Ta'mir Tanlovlari (Shift, Devor, Pol)
  // Shift (Ceiling)
  const [ceilingWork, setCeilingWork] = useState<CeilingWorkType>("gipsokarton_plain");

  // Devor (Wall)
  const [wallWork, setWallWork] = useState<WallWorkType>("paint_spray");
  const [includePlaster, setIncludePlaster] = useState<boolean>(false);
  const [includePautinka, setIncludePautinka] = useState<boolean>(true);
  const [plasterThickness, setPlasterThickness] = useState<number>(1.0);

  // Pol (Floor)
  const [floorWork, setFloorWork] = useState<FloorWorkType>("laminate");
  const [includeScreed, setIncludeScreed] = useState<boolean>(false);
  const [includeSelfLeveling, setIncludeSelfLeveling] = useState<boolean>(false);

  // Segment
  const [tier, setTier] = useState<QualityTier>("standard");

  // 3. Usta PRO Sozlamalari
  const [isMasterMode, setIsMasterMode] = useState<boolean>(true);
  const [brandName, setBrandName] = useState<string>("ProFinish Uz");
  const [masterPhone, setMasterPhone] = useState<string>("+998 90 123 45 67");
  const [userBalance, setUserBalance] = useState<number>(15000); // 15 000 so'm default balance
  const [showRateSettings, setShowRateSettings] = useState<boolean>(false);

  // Usta shaxsiy stavkalari (1 m2)
  const [masterRates, setMasterRates] = useState<Record<string, number>>({
    // Shift
    ceiling_paint_roller: 25000,
    ceiling_paint_spray: 35000,
    ceiling_gipsokarton_plain: 50000,
    ceiling_gipsokarton_decor: 85000,
    ceiling_stretch: 65000,

    // Devor
    wall_paint_roller: 30000,
    wall_paint_spray: 40000,
    wall_wallpaper: 30000,
    wall_tile: 90000,
    wall_paint_standard: 25000,
    wall_plaster: 35000,
    wall_pautinka: 20000,

    // Pol
    floor_screed: 35000,
    floor_self_leveling: 20000,
    floor_laminate: 25000,
    floor_parquet: 85000,
    floor_tile: 95000,
  });

  const updateMasterRate = (key: string, val: number) => {
    setMasterRates((prev) => ({ ...prev, [key]: val }));
  };

  // 4. Modallar va Statuslar
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [showLeadModal, setShowLeadModal] = useState<boolean>(false);
  const [showTopupModal, setShowTopupModal] = useState<boolean>(false);
  const [leadSubmitted, setLeadSubmitted] = useState<boolean>(false);
  const [clientPhone, setClientPhone] = useState<string>("+998 9");
  const [clientRegion, setClientRegion] = useState<string>("Toshkent shahri");
  const [isSendingPdf, setIsSendingPdf] = useState<boolean>(false);
  const [pdfStatusMsg, setPdfStatusMsg] = useState<string>("");

  // Lead-birja holati
  const [leadsList, setLeadsList] = useState([
    {
      id: "LD-9821",
      title: "Yunusobod — 3 xonali gipskarton va kraskapult bo'yoq",
      area: "78.4 m²",
      budget: "16 400 000 so'm",
      date: "10 daqiqa oldin",
      region: "Toshkent shahri",
      price: 10000,
      isPurchased: false,
      contact: "+998 90 847 32 11 (Farrux)",
    },
    {
      id: "LD-9818",
      title: "Chilonzor — Polga parket yotqizish va plintus",
      area: "42.5 m²",
      budget: "7 250 000 so'm",
      date: "35 daqiqa oldin",
      region: "Toshkent shahri",
      price: 10000,
      isPurchased: false,
      contact: "+998 97 122 89 00 (Sanjar)",
    },
    {
      id: "LD-9804",
      title: "Samarqand — Kottej pol steshkasi, oboy va figurali shift",
      area: "140.0 m²",
      budget: "38 000 000 so'm",
      date: "2 soat oldin",
      region: "Samarqand",
      price: 15000,
      isPurchased: false,
      contact: "+998 93 456 78 90 (Jamshid)",
    },
  ]);

  // Init Telegram safely post-hydration
  useEffect(() => {
    const handleInit = () => {
      try {
        initTelegramApp();
        const user = getTelegramUser();
        if (user) {
          setTgUser(user);
          if (user.first_name) {
            setBrandName(`Usta ${user.first_name}`);
          }
        }
      } catch (err) {
        console.warn("Telegram init warning:", err);
      }
    };

    if (typeof window !== "undefined") {
      if (window.Telegram?.WebApp) {
        handleInit();
      } else {
        const existingScript = document.getElementById("telegram-webapp-sdk");
        if (!existingScript) {
          const script = document.createElement("script");
          script.id = "telegram-webapp-sdk";
          script.src = "https://telegram.org/js/telegram-web-app.js";
          script.async = true;
          script.onload = handleInit;
          document.body.appendChild(script);
        }
      }
    }
  }, []);

  // Preset Xonalar (Tezkor Shablonlar)
  const presets = [
    {
      name: "Mehmonxona (Zal)",
      l: 5.5,
      w: 4.0,
      h: 3.0,
      op: 4.2,
      ceiling: "gipsokarton_decor" as CeilingWorkType,
      wall: "paint_spray" as WallWorkType,
      pautinka: true,
      plaster: false,
      floor: "laminate" as FloorWorkType,
      screed: false,
      selfLeveling: false,
    },
    {
      name: "Yotoqxona",
      l: 4.2,
      w: 3.2,
      h: 2.8,
      op: 3.5,
      ceiling: "gipsokarton_plain" as CeilingWorkType,
      wall: "wallpaper" as WallWorkType,
      pautinka: false,
      plaster: false,
      floor: "laminate" as FloorWorkType,
      screed: false,
      selfLeveling: false,
    },
    {
      name: "Kottej / Premium",
      l: 6.0,
      w: 5.0,
      h: 3.2,
      op: 5.0,
      ceiling: "gipsokarton_decor" as CeilingWorkType,
      wall: "paint_spray" as WallWorkType,
      pautinka: true,
      plaster: true,
      floor: "parquet" as FloorWorkType,
      screed: true,
      selfLeveling: true,
    },
    {
      name: "Oshxona",
      l: 3.8,
      w: 3.0,
      h: 2.8,
      op: 3.2,
      ceiling: "gipsokarton_plain" as CeilingWorkType,
      wall: "paint_roller" as WallWorkType,
      pautinka: true,
      plaster: false,
      floor: "tile" as FloorWorkType,
      screed: false,
      selfLeveling: false,
    },
    {
      name: "Sanuzel / Vanna",
      l: 2.5,
      w: 2.0,
      h: 2.6,
      op: 1.8,
      ceiling: "stretch" as CeilingWorkType,
      wall: "tile" as WallWorkType,
      pautinka: false,
      plaster: false,
      floor: "tile" as FloorWorkType,
      screed: false,
      selfLeveling: false,
    },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    triggerHaptic("medium");
    setRoomName(p.name);
    setLength(p.l);
    setWidth(p.w);
    setHeight(p.h);
    setOpeningsArea(p.op);
    setCeilingWork(p.ceiling);
    setWallWork(p.wall);
    setIncludePautinka(p.pautinka);
    setIncludePlaster(p.plaster);
    setFloorWork(p.floor);
    setIncludeScreed(p.screed);
    setIncludeSelfLeveling(p.selfLeveling);
  };

  // Kalkulyator natijasi (Jonli hisob-kitob)
  const estimate = useMemo(() => {
    const input: RoomInput = {
      roomName,
      length,
      width,
      height,
      openingsArea,
      ceilingWork,
      wallWork,
      includePlaster,
      includePautinka,
      plasterThicknessCm: plasterThickness,
      floorWork,
      includeScreed,
      includeSelfLeveling,
      tier,
      masterRates,
    };
    return calculateSmartEstimate(input);
  }, [
    roomName,
    length,
    width,
    height,
    openingsArea,
    ceilingWork,
    wallWork,
    includePlaster,
    includePautinka,
    plasterThickness,
    floorWork,
    includeScreed,
    includeSelfLeveling,
    tier,
    masterRates,
  ]);

  // PDF sotib olish (Unlock)
  const handleUnlockPdf = () => {
    if (userBalance >= 5000) {
      triggerNotificationHaptic("success");
      setUserBalance((prev) => prev - 5000);
      setIsUnlocked(true);
      setShowPdfModal(true);
    } else {
      triggerNotificationHaptic("warning");
      setShowTopupModal(true);
    }
  };

  // Lid sotib olish
  const handleBuyLead = (leadId: string, price: number) => {
    if (userBalance >= price) {
      triggerNotificationHaptic("success");
      setUserBalance((prev) => prev - price);
      setLeadsList((prev) =>
        prev.map((ld) => (ld.id === leadId ? { ...ld, isPurchased: true } : ld))
      );
    } else {
      triggerNotificationHaptic("warning");
      setShowTopupModal(true);
    }
  };

  // PDF faylni Telegram bot orqali chatga yuborish
  const handleSendPdfToTelegram = async () => {
    setIsSendingPdf(true);
    setPdfStatusMsg("");
    triggerHaptic("medium");

    const chatId =
      tgUser?.id ||
      (typeof window !== "undefined" && window.Telegram?.WebApp?.initDataUnsafe?.user?.id);

    if (!chatId) {
      triggerNotificationHaptic("warning");
      setPdfStatusMsg(
        "⚠️ Telegram ID aniqlanmadi. Iltimos, ushbu ilovani @Smeta24Bot orqali oching."
      );
      setIsSendingPdf(false);
      return;
    }

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://smeta24-backend.onrender.com";

      const materialsPayload = estimate.materials.map((m) => ({
        name: m.name,
        exact: m.exactUnitStr,
        packages: `${m.packagesCount} ${m.unit}`,
        price_formatted: formatUZS(m.unitPrice),
        total_formatted: formatUZS(m.totalPrice),
      }));

      const laborPayload = estimate.laborItems.map((l) => ({
        name: l.name,
        area: `${l.area} ${l.unitStr}`,
        rate_formatted: formatUZS(l.ratePerM2),
        total_formatted: formatUZS(l.totalPrice),
      }));

      const res = await fetch(`${backendUrl}/api/v1/estimates/send-telegram-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          room_name: roomName,
          length,
          width,
          height,
          total_area: estimate.geometry.totalWorkArea,
          brand_name: brandName,
          master_phone: masterPhone,
          materials: materialsPayload,
          labor_items: laborPayload,
          materials_total: formatUZS(estimate.materialsTotal),
          labor_total: formatUZS(estimate.laborTotal),
          grand_total: formatUZS(estimate.grandTotal),
        }),
      });

      const data = await res.json();
      if (res.ok && (data.ok || data.success)) {
        triggerNotificationHaptic("success");
        setPdfStatusMsg("✅ PDF-smeta Telegram xabaringizga yuborildi! Chatga o'tib ko'rishingiz mumkin.");
        setTimeout(() => {
          setShowPdfModal(false);
          setPdfStatusMsg("");
        }, 3000);
      } else {
        throw new Error(data.detail || data.message || "Serverdan xatolik qaytdi");
      }
    } catch (err: any) {
      console.error("PDF yuborishda xato:", err);
      triggerNotificationHaptic("error");
      setPdfStatusMsg(`❌ ${err?.message || "Yuborishda xatolik yuz berdi. Qayta urinib ko'ring."}`);
    } finally {
      setIsSendingPdf(false);
    }
  };

  const handlePrintPdf = () => {
    triggerHaptic("light");
    window.print();
  };

  const handleTopup = (amount: number) => {
    triggerNotificationHaptic("success");
    setUserBalance((prev) => prev + amount);
    setShowTopupModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. STICKY TOP APP HEADER */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/25">
            24
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base leading-none text-white tracking-tight">
                Smeta<span className="text-amber-400">24</span>
              </h1>
              <span className="bg-amber-500/15 text-amber-400 text-[9px] px-1.5 py-0.2 rounded font-semibold border border-amber-500/30">
                PRO 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {tgUser?.first_name ? `@${tgUser.username || tgUser.first_name}` : "@Smeta24Bot"} • O&apos;zbekiston
            </p>
          </div>
        </div>

        {/* User Balance Chip */}
        <button
          onClick={() => {
            triggerHaptic("light");
            setShowTopupModal(true);
          }}
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 transition active:scale-95 text-right"
        >
          <div>
            <span className="text-[9px] text-slate-400 block font-medium">Hamyon</span>
            <span className="text-xs font-bold text-emerald-400">
              {userBalance.toLocaleString("ru-RU")} so&apos;m
            </span>
          </div>
          <Plus className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </header>

      {/* 2. MAIN CONTENT BY ACTIVE TAB */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {activeTab === "calc" && (
          <>
            {/* Tezkor Shablonlar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap pl-0.5">
                Shablon:
              </span>
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                    roomName === p.name
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/20"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* 1-BLOK: XONA GEOMETRIYASI */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Xona O&apos;lchamlari
                  </h2>
                </div>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="bg-slate-950 text-xs text-right px-2.5 py-1 rounded-lg border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500 w-36"
                  placeholder="Xona nomi"
                />
              </div>

              {/* 3 ta o'lcham */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Uzunligi (L)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={length}
                      onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-sm font-bold text-white focus:border-amber-500 outline-none pr-6"
                    />
                    <span className="absolute right-2 top-2.5 text-[10px] text-slate-500 font-medium">m</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Eni (W)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={width}
                      onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-sm font-bold text-white focus:border-amber-500 outline-none pr-6"
                    />
                    <span className="absolute right-2 top-2.5 text-[10px] text-slate-500 font-medium">m</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Balandligi (H)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-sm font-bold text-white focus:border-amber-500 outline-none pr-6"
                    />
                    <span className="absolute right-2 top-2.5 text-[10px] text-slate-500 font-medium">m</span>
                  </div>
                </div>
              </div>

              {/* Eshik va deraza o'lchamlari */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Eshik va Derazalar jami yuzasi (ayirib tashlanadi)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={openingsArea}
                    onChange={(e) => setOpeningsArea(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-sm font-bold text-white focus:border-amber-500 outline-none pr-8"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-medium">m²</span>
                </div>
              </div>

              {/* Live Kvadratura ko'rsatkichlari */}
              <div className="bg-slate-950 rounded-xl p-2.5 grid grid-cols-4 text-center border border-slate-800/80">
                <div>
                  <span className="text-[9px] text-slate-400 block">Perimetr</span>
                  <span className="text-xs font-bold text-slate-200">{estimate.geometry.perimeter} m</span>
                </div>
                <div className="border-x border-slate-800">
                  <span className="text-[9px] text-slate-400 block">Sof devor</span>
                  <span className="text-xs font-bold text-slate-200">{estimate.geometry.netWallArea} m²</span>
                </div>
                <div className="border-r border-slate-800">
                  <span className="text-[9px] text-slate-400 block">Shift / Pol</span>
                  <span className="text-xs font-bold text-slate-200">{estimate.geometry.ceilingArea} m²</span>
                </div>
                <div>
                  <span className="text-[9px] text-amber-400 block font-semibold">Plintus</span>
                  <span className="text-xs font-black text-amber-400">{estimate.geometry.plinthLength} m</span>
                </div>
              </div>
            </section>

            {/* 2-BLOK: ☁️ SHIFT (POTOLOK) ISHLARI */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                    ☁️
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                      Shift (Potolok) Ishlari
                    </h2>
                    <p className="text-[10px] text-slate-400">Maydon: {estimate.geometry.ceilingArea} m²</p>
                  </div>
                </div>
                {ceilingWork !== "none" && (
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    Faol
                  </span>
                )}
              </div>

              {/* Shift variantlari */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: "gipsokarton_plain" as CeilingWorkType,
                    title: "Gipskarton Tekis",
                    sub: "Knauf 1-qavat karkas",
                    badge: "Ko'p tanlangan",
                  },
                  {
                    id: "gipsokarton_decor" as CeilingWorkType,
                    title: "Gipskarton Figurali",
                    sub: "2-qavat naqshli dizayn",
                    badge: "Dizayn",
                  },
                  {
                    id: "paint_spray" as CeilingWorkType,
                    title: "Bo'yoq (Kraskapult)",
                    sub: "Shpaklyovka + Sepish",
                    badge: null,
                  },
                  {
                    id: "paint_roller" as CeilingWorkType,
                    title: "Bo'yoq (Valikda)",
                    sub: "Shpaklyovka + Valik",
                    badge: null,
                  },
                  {
                    id: "stretch" as CeilingWorkType,
                    title: "Natyajnoy potolok",
                    sub: "Fransuz plyonka + montaj",
                    badge: null,
                  },
                  {
                    id: "none" as CeilingWorkType,
                    title: "Shiftga tegilmaydi",
                    sub: "Hisobdan chiqarish",
                    badge: null,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      triggerHaptic("medium");
                      setCeilingWork(item.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between relative ${
                      ceilingWork === item.id
                        ? "bg-gradient-to-br from-sky-950 to-slate-900 border-sky-400 text-white shadow-md shadow-sky-500/10 ring-1 ring-sky-500/30"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {item.badge && (
                      <span className="absolute -top-1.5 right-2 bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-xs font-bold leading-tight">{item.title}</span>
                    <span className="text-[9.5px] text-slate-400 mt-1">{item.sub}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 3-BLOK: 🧱 DEVOR ISHLARI */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                    🧱
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Devor Ishlari & Qoplamalar
                    </h2>
                    <p className="text-[10px] text-slate-400">Sof maydon: {estimate.geometry.netWallArea} m²</p>
                  </div>
                </div>
              </div>

              {/* Asosiy devor qoplamasi */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: "paint_spray" as WallWorkType,
                    title: "Bo'yoq (Kraskapult)",
                    sub: "Sepish",
                    badge: "Hit",
                  },
                  {
                    id: "paint_roller" as WallWorkType,
                    title: "Bo'yoq (Valik)",
                    sub: "Klassik",
                    badge: null,
                  },
                  {
                    id: "wallpaper" as WallWorkType,
                    title: "Oboy",
                    sub: "Vinil/Flizelin",
                    badge: null,
                  },
                  {
                    id: "tile" as WallWorkType,
                    title: "Kafel / Plitka",
                    sub: "Keramogranit",
                    badge: null,
                  },
                  {
                    id: "paint_standard" as WallWorkType,
                    title: "Standart emulsiya",
                    sub: "Start+Finish",
                    badge: null,
                  },
                  {
                    id: "none" as WallWorkType,
                    title: "Tegilmaydi",
                    sub: "Hisobdan chiqarish",
                    badge: null,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      triggerHaptic("medium");
                      setWallWork(item.id);
                    }}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center relative ${
                      wallWork === item.id
                        ? "bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {item.badge && (
                      <span className="absolute -top-1.5 right-1.5 bg-emerald-500 text-slate-950 text-[7.5px] font-black px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-xs leading-tight">{item.title}</span>
                    <span
                      className={`text-[8.5px] mt-0.5 ${
                        wallWork === item.id ? "text-slate-950 font-medium" : "text-slate-500"
                      }`}
                    >
                      {item.sub}
                    </span>
                  </button>
                ))}
              </div>

              {/* Devor uchun qo'shimcha qatlamlar */}
              <div className="space-y-2 pt-1">
                {/* 1. Suvoq (Rotband) */}
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePlaster}
                        onChange={(e) => {
                          triggerHaptic("light");
                          setIncludePlaster(e.target.checked);
                        }}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        Mayoq bo&apos;yicha gipsli suvoq (Rotband)
                      </span>
                    </label>
                    <span className="text-[10px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded">
                      Gips
                    </span>
                  </div>

                  {includePlaster && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                      <span className="text-[10px] text-slate-400">Qatlam qalinligi:</span>
                      <div className="flex items-center gap-1.5">
                        {[0.5, 1.0, 1.5, 2.0].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setPlasterThickness(val)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              plasterThickness === val
                                ? "bg-amber-500 text-slate-950 border-amber-400"
                                : "bg-slate-900 text-slate-400 border-slate-800"
                            }`}
                          >
                            {val} sm
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Pautinka (Stekloxolst) */}
                {(wallWork === "paint_spray" || wallWork === "paint_roller") && (
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePautinka}
                        onChange={(e) => {
                          triggerHaptic("light");
                          setIncludePautinka(e.target.checked);
                        }}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">
                          Stekloxolst (Pautinka) yopishtirish
                        </span>
                        <span className="text-[9.5px] text-slate-500">
                          Devor yorilishiga qarshi + maxsus tayyor kley
                        </span>
                      </div>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Tavsiya
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* 4-BLOK: 🪵 POL ISHLARI */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    🪵
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Pol (Floor) Ishlari
                    </h2>
                    <p className="text-[10px] text-slate-400">Maydon: {estimate.geometry.floorArea} m²</p>
                  </div>
                </div>
              </div>

              {/* Pol qoplamasi variantlari */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: "laminate" as FloorWorkType,
                    title: "Laminat (33-klass)",
                    sub: "Podlojka + Plintus",
                    badge: "Mashhur",
                  },
                  {
                    id: "parquet" as FloorWorkType,
                    title: "Parket / Inzhener",
                    sub: "Tabiiy yog'och + 2K yelim",
                    badge: "Premium",
                  },
                  {
                    id: "tile" as FloorWorkType,
                    title: "Polga Kafel / Plitka",
                    sub: "Keramogranit + kley",
                    badge: null,
                  },
                  {
                    id: "none" as FloorWorkType,
                    title: "Polga tegilmaydi",
                    sub: "Hisobdan chiqarish",
                    badge: null,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      triggerHaptic("medium");
                      setFloorWork(item.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between relative ${
                      floorWork === item.id
                        ? "bg-gradient-to-br from-emerald-950 to-slate-900 border-emerald-400 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {item.badge && (
                      <span className="absolute -top-1.5 right-2 bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-xs font-bold leading-tight">{item.title}</span>
                    <span className="text-[9.5px] text-slate-400 mt-1">{item.sub}</span>
                  </button>
                ))}
              </div>

              {/* Pol tayyorgarligi optsiyalari */}
              <div className="space-y-2 pt-1">
                {/* 1. Styajka */}
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeScreed}
                      onChange={(e) => {
                        triggerHaptic("light");
                        setIncludeScreed(e.target.checked);
                      }}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        Pol steshkasi (Beton styajka, ~5 sm)
                      </span>
                      <span className="text-[9.5px] text-slate-500">
                        Tsement M400 + daryo qumi + mustahkamlovchi to&apos;r
                      </span>
                    </div>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    5 sm
                  </span>
                </div>

                {/* 2. Nalivnoy pol */}
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSelfLeveling}
                      onChange={(e) => {
                        triggerHaptic("light");
                        setIncludeSelfLeveling(e.target.checked);
                      }}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        Nalivnoy pol (Samonivelir tekislash)
                      </span>
                      <span className="text-[9.5px] text-slate-500">
                        Laminat yoki parket ostiga yupqa oyna tekislik
                      </span>
                    </div>
                  </label>
                  <span className="text-[10px] text-sky-400 font-medium bg-sky-500/10 px-1.5 py-0.5 rounded">
                    3 mm
                  </span>
                </div>
              </div>
            </section>

            {/* 5-BLOK: 🏷️ MATERIALLAR TARIFA & USTA PRO REJIMI */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                    ⚙️
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Material Segmenti & Usta PRO
                    </h2>
                    <p className="text-[10px] text-slate-400">Smeta brendi va usta narxlarini boshqarish</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isMasterMode}
                  onChange={(e) => {
                    triggerHaptic("light");
                    setIsMasterMode(e.target.checked);
                  }}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {/* Segment */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Materiallar segmenti:</span>
                <div className="flex items-center gap-1">
                  {(["econom", "standard", "premium"] as QualityTier[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        triggerHaptic("light");
                        setTier(t);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition border ${
                        tier === t
                          ? "bg-slate-800 text-amber-400 border-amber-500/50 shadow-sm"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      {t === "econom" ? "Ekonom" : t === "standard" ? "Standart" : "Premium"}
                    </button>
                  ))}
                </div>
              </div>

              {isMasterMode && (
                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Brigada / Usta nomi</label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-500 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Telefon raqamingiz</label>
                      <input
                        type="text"
                        value={masterPhone}
                        onChange={(e) => setMasterPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-500 outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Stavkalarni sozlash tugmasi */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowRateSettings(!showRateSettings)}
                      className="w-full bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-300 flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5 text-amber-400" />
                        <span>1 m² uchun usta narxlarini tahrirlash</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${showRateSettings ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showRateSettings && (
                      <div className="mt-2 bg-slate-950 rounded-xl p-3 border border-slate-800/80 space-y-2.5 text-xs">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                          Tanlangan ishlar bo&apos;yicha stavkalar:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Shift narxi */}
                          {ceilingWork !== "none" && (
                            <div>
                              <label className="text-[9.5px] text-slate-400 block mb-0.5 truncate">
                                Shift ({ceilingWork}):
                              </label>
                              <input
                                type="number"
                                value={masterRates[`ceiling_${ceilingWork}`] || 0}
                                onChange={(e) =>
                                  updateMasterRate(`ceiling_${ceilingWork}`, Number(e.target.value))
                                }
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-amber-300"
                              />
                            </div>
                          )}

                          {/* Devor narxi */}
                          {wallWork !== "none" && (
                            <div>
                              <label className="text-[9.5px] text-slate-400 block mb-0.5 truncate">
                                Devor ({wallWork}):
                              </label>
                              <input
                                type="number"
                                value={masterRates[`wall_${wallWork}`] || 0}
                                onChange={(e) =>
                                  updateMasterRate(`wall_${wallWork}`, Number(e.target.value))
                                }
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-amber-300"
                              />
                            </div>
                          )}

                          {/* Pol narxi */}
                          {floorWork !== "none" && (
                            <div>
                              <label className="text-[9.5px] text-slate-400 block mb-0.5 truncate">
                                Pol ({floorWork}):
                              </label>
                              <input
                                type="number"
                                value={masterRates[`floor_${floorWork}`] || 0}
                                onChange={(e) =>
                                  updateMasterRate(`floor_${floorWork}`, Number(e.target.value))
                                }
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-amber-300"
                              />
                            </div>
                          )}

                          {/* Suvoq narxi */}
                          {includePlaster && (
                            <div>
                              <label className="text-[9.5px] text-slate-400 block mb-0.5 truncate">
                                Suvoq (1 m²):
                              </label>
                              <input
                                type="number"
                                value={masterRates.wall_plaster || 35000}
                                onChange={(e) => updateMasterRate("wall_plaster", Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-amber-300"
                              />
                            </div>
                          )}

                          {/* Styajka narxi */}
                          {includeScreed && (
                            <div>
                              <label className="text-[9.5px] text-slate-400 block mb-0.5 truncate">
                                Styajka (1 m²):
                              </label>
                              <input
                                type="number"
                                value={masterRates.floor_screed || 35000}
                                onChange={(e) => updateMasterRate("floor_screed", Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-amber-300"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* 6-BLOK: SMETA NATIJALARI (HISOBLASH VA PREVIEW) */}
            <section className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 space-y-3.5 shadow-xl shadow-amber-500/5 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Smeta24 Hisob Natijasi
                  </h2>
                </div>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  {roomName} ({estimate.geometry.totalWorkArea} m²)
                </span>
              </div>

              {/* Materiallar jadvali */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Talab qilinadigan materiallar ro&apos;yxati ({estimate.materials.length} ta pozitsiya):
                </span>
                {estimate.materials.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs transition hover:border-slate-700"
                  >
                    <div className="pr-2">
                      <p className="font-semibold text-slate-200 leading-snug">{item.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Sof sarf: <span className="text-slate-300 font-medium">{item.exactUnitStr}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {/* QADOQLAR SONI BLUR ELEMENTI */}
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.packagesCount} {item.unit}
                        </span>
                      ) : (
                        <div
                          onClick={handleUnlockPdf}
                          className="cursor-pointer group relative inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-2 py-0.5 rounded transition"
                        >
                          <Lock className="w-2.5 h-2.5 text-amber-400" />
                          <span className="blur-[3.5px] select-none text-[11px]">
                            {item.packagesCount} {item.unit}
                          </span>
                        </div>
                      )}
                      <p className="text-[11px] text-slate-300 font-bold mt-0.5">
                        {formatUZS(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Usta xizmati detallari */}
              {isMasterMode && estimate.laborItems.length > 0 && (
                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 space-y-1.5 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    Bajariladigan ishlar va xizmat haqi:
                  </span>
                  {estimate.laborItems.map((lab) => (
                    <div key={lab.id} className="flex justify-between text-slate-300 text-[11px]">
                      <span>{lab.name}:</span>
                      <span className="font-medium text-emerald-400">{formatUZS(lab.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Jami Summalar */}
              <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Materiallar umumiy summasi:</span>
                  <span className="font-bold text-white">{formatUZS(estimate.materialsTotal)}</span>
                </div>
                {isMasterMode && (
                  <div className="flex justify-between text-slate-300">
                    <span>Usta ish haqi jami:</span>
                    <span className="font-bold text-emerald-400">{formatUZS(estimate.laborTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-amber-400 pt-2 border-t border-slate-800/80">
                  <span>UMUMIY SMETA BUDJETI:</span>
                  <span className="text-base">{formatUZS(estimate.grandTotal)}</span>
                </div>
              </div>

              {/* 2 TA ASOSIY TUGMA */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={isUnlocked ? () => setShowPdfModal(true) : handleUnlockPdf}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                >
                  {isUnlocked ? (
                    <>
                      <FileText className="w-4 h-4 text-slate-950" />
                      <span>Tayyor Brendli PDF-Smetani ko&apos;rish</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-slate-950" />
                      <span>📄 Brendli PDF-Smetani olish (5 000 so&apos;m)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setShowLeadModal(true);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-3 px-4 rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <span>🛒 Materiallarni ulgurji narxda buyurtma qilish (Bepul)</span>
                </button>
              </div>
            </section>

            {/* DASTUR MUALLIFI */}
            <div className="text-center py-1 text-[10.5px] text-slate-500">
              Smeta24 © 2026 • Dastur muallifi:{" "}
              <span className="text-amber-400 font-bold">Nurmurodov Damirjon</span>
            </div>
          </>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 mx-auto flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20">
                {tgUser?.first_name ? tgUser.first_name[0] : "U"}
              </div>
              <h2 className="font-bold text-base text-white">
                {brandName}
              </h2>
              <p className="text-xs text-slate-400">
                {tgUser?.first_name ? `@${tgUser.username || tgUser.first_name}` : "@Smeta24Bot"}
              </p>
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-xs px-3 py-1 rounded-full font-bold border border-amber-500/30">
                ⭐ Professional Usta
              </div>
            </div>

            {/* Balans Kartasi */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Sizning balansingiz:</span>
                <span className="text-lg font-black text-emerald-400">
                  {userBalance.toLocaleString("ru-RU")} so&apos;m
                </span>
              </div>
              <button
                onClick={() => {
                  triggerHaptic("medium");
                  setShowTopupModal(true);
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Balansni to&apos;ldirish</span>
              </button>
            </div>

            {/* Mualliflik ma'lumotnomasi */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5">
              <p className="font-bold text-slate-200">Smeta24 Tizimi Haqida:</p>
              <p>O&apos;zbekiston bo&apos;ylab qurilish va ta&apos;mir smetalarini avtomatlashtirilgan hisoblash platformasi.</p>
              <p className="pt-2 text-[11px] text-slate-500">
                Dastur arxitekturasi va dizayni: <span className="text-amber-400 font-bold">Nurmurodov Damirjon</span>
              </p>
            </div>
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-sm text-white">Buyurtmalar Birjasi (Lidlar)</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mijozlarimiz tomonidan to&apos;g&apos;ridan-to&apos;g&apos;ri qoldirilgan tekshirilgan ta&apos;mir buyurtmalari.
              </p>
            </div>

            <div className="space-y-3">
              {leadsList.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {lead.region}
                    </span>
                    <span className="text-[10px] text-slate-500">{lead.date}</span>
                  </div>

                  <h3 className="font-bold text-xs text-white leading-snug">{lead.title}</h3>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                    <div>
                      <span className="text-slate-400 block text-[9.5px]">Maydon:</span>
                      <span className="font-bold text-slate-200">{lead.area}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9.5px]">Mo&apos;ljal budjet:</span>
                      <span className="font-bold text-emerald-400">{lead.budget}</span>
                    </div>
                  </div>

                  {lead.isPurchased ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{lead.contact}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuyLead(lead.id, lead.price)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs py-2 rounded-xl border border-amber-500/30 flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>🔓 Kontaktni ochish ({lead.price.toLocaleString("ru-RU")} so&apos;m)</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GUIDE TAB */}
        {activeTab === "guide" && (
          <div className="space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                Materiallar Sarf Me&apos;yorlari (2026 ShNQ)
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ushbu me&apos;yorlar O&apos;zbekiston qurilish standartlari hamda Knauf, Betek, Ceresit tavsiyalari bo&apos;yicha kiritilgan:
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 text-xs">
              {[
                { name: "Gipskarton Knauf 9.5mm (2.4x1.2m)", norm: "1 list = 2.88 m²", pack: "Dona (52 000 so'm)" },
                { name: "Profil UD 28/27 & CD 60/27", norm: "1 m² shiftga ~2.6-3.8 m", pack: "3 metrli rezon (18-26 ming)" },
                { name: "Laminat 33-klass (faskali)", norm: "+8% kesishga zapas", pack: "2.13 m² pachka (~255 ming)" },
                { name: "Parket / Inzhenernaya doska", norm: "+8% burchaklarga zapas", pack: "1 m² (~280 000 so'm)" },
                { name: "2-komponentli parket yelimi", norm: "1 kg = ~0.8 m² pol", pack: "14 kg paqir (~420 000 so'm)" },
                { name: "Pol steshkasi (5 sm styajka)", norm: "0.4 qop tsement / m²", pack: "50 kg qop M400 (~45 000)" },
                { name: "Nalivnoy pol samonivelir", norm: "1.5 kg / mm / m²", pack: "25 kg qop (~65 000 so'm)" },
                { name: "Vinil / Flizelin oboy", norm: "1 rulon = ~5 m² devor", pack: "1.06m x 10m (~180 000)" },
                { name: "Pautinka stekloxolst (40g)", norm: "1.1 m² / m² devor", pack: "50 m² rulon (~240 000)" },
                { name: "Kraskapultda purkash", norm: "0.22-0.24 litr / m²", pack: "15 L paqir (~420 000 so'm)" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <p className="font-bold text-slate-200">{row.name}</p>
                    <p className="text-[10px] text-slate-400">Bozor standarti: {row.pack}</p>
                  </div>
                  <span className="text-amber-400 font-bold">{row.norm}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 3. MODAL: RASMIY PDF-SMETA PREVIEW & DOWNLOAD */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Rasmiy A4 PDF-Smeta</h3>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* A4 Formatdagi hujjat namunasi */}
            <div className="bg-white text-slate-950 p-4 rounded-xl shadow-inner font-sans text-[11px] space-y-3 border border-slate-300">
              <div className="border-b-2 border-amber-500 pb-2 flex justify-between items-start">
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wide text-slate-900">{brandName}</h4>
                  <p className="text-[10px] text-slate-600 font-semibold">📞 Mas&apos;ul: {masterPhone}</p>
                </div>
                <div className="text-right text-[10px]">
                  <span className="bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded text-[9px]">
                    RASMIY SMETA #2026-901
                  </span>
                  <p className="text-slate-500 mt-1">Obyekt: {roomName}</p>
                </div>
              </div>

              {/* Geometriya */}
              <div className="bg-slate-100 p-2 rounded flex justify-between font-semibold text-[10px]">
                <span>Uzunlik: {length}m</span>
                <span>Eni: {width}m</span>
                <span>Balandlik: {height}m</span>
                <span className="text-amber-600 font-bold">JAMI: {estimate.geometry.totalWorkArea} m²</span>
              </div>

              {/* Materiallar jadvali */}
              <div>
                <p className="font-bold text-[10px] uppercase text-slate-800 mb-1">Talab etiladigan materiallar:</p>
                <table className="w-full border-collapse text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="p-1 text-left">Nomi</th>
                      <th className="p-1 text-right">Qadoq</th>
                      <th className="p-1 text-right">Summa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimate.materials.map((m, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-1 font-medium">{m.name}</td>
                        <td className="p-1 text-right font-bold text-amber-700">
                          {m.packagesCount} {m.unit}
                        </td>
                        <td className="p-1 text-right">{formatUZS(m.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Usta xizmati */}
              {isMasterMode && estimate.laborItems.length > 0 && (
                <div className="border-t border-slate-200 pt-1 space-y-0.5">
                  <p className="font-bold text-[10px] uppercase text-slate-800">Usta ish haqi:</p>
                  {estimate.laborItems.map((lab) => (
                    <div key={lab.id} className="flex justify-between text-[9px] text-slate-700">
                      <span>{lab.name}:</span>
                      <span className="font-bold">{formatUZS(lab.totalPrice)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-[10px] pt-1 border-t border-slate-200">
                    <span>Usta xizmat haqi jami:</span>
                    <span className="text-emerald-700">{formatUZS(estimate.laborTotal)}</span>
                  </div>
                </div>
              )}

              {/* Jami */}
              <div className="bg-amber-50 p-2 rounded border border-amber-300 flex justify-between items-center font-black text-xs text-slate-900">
                <span>UMUMIY LOYIHA BUDJETI:</span>
                <span>{formatUZS(estimate.grandTotal)}</span>
              </div>

              <div className="text-center text-[8.5px] text-slate-500 pt-1">
                Smeta24 (@Smeta24Bot) • Dastur muallifi: <strong>Nurmurodov Damirjon</strong> • QR-kod bilan tasdiqlangan
              </div>
            </div>

            {/* Status Xabari */}
            {pdfStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold text-center leading-snug animate-in fade-in ${
                  pdfStatusMsg.startsWith("✅")
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/40"
                }`}
              >
                {pdfStatusMsg}
              </div>
            )}

            {/* Tugmalar */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={isSendingPdf}
                onClick={handleSendPdfToTelegram}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-[0.98]"
              >
                {isSendingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>PDF tayyorlanib, chatga yuborilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>📨 PDF-ni Telegram Chatga yuborish</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrintPdf}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition active:scale-[0.98]"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>🖨️ Chop etish / Qurilmaga saqlash</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: MATERIAL BUYURTMA (LID QOLDIRISH) */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Ulgurji Narxda Buyurtma</h3>
              </div>
              <button
                onClick={() => {
                  setShowLeadModal(false);
                  setLeadSubmitted(false);
                }}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {leadSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-white">Buyurtmangiz qabul qilindi!</h4>
                <p className="text-xs text-slate-400">
                  Hamkor qurilish do&apos;konlari tez orada siz bilan bog&apos;lanadi va materiallarni eng arzon ulgurji narxda yetkazib beradi.
                </p>
                <button
                  onClick={() => {
                    setShowLeadModal(false);
                    setLeadSubmitted(false);
                  }}
                  className="bg-slate-800 text-white text-xs font-bold py-2 px-6 rounded-xl"
                >
                  Yopish
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Smeta24 hamkor ulgurji omborlaridan materiallarni do&apos;kon narxidan 10-15% arzonroq va bepul yetkazib berish bilan oling:
                </p>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Telefon raqamingiz</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Yetkazib berish manzili / Viloyat</label>
                  <select
                    value={clientRegion}
                    onChange={(e) => setClientRegion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                  >
                    <option value="Toshkent shahri">Toshkent shahri</option>
                    <option value="Toshkent viloyati">Toshkent viloyati</option>
                    <option value="Samarqand">Samarqand viloyati</option>
                    <option value="Farg'ona">Farg&apos;ona viloyati</option>
                    <option value="Andijon">Andijon viloyati</option>
                    <option value="Namangan">Namangan viloyati</option>
                    <option value="Buxoro">Buxoro viloyati</option>
                  </select>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px]">Taxminiy mahsulotlar summasi:</span>
                  <span className="font-bold text-amber-400">{formatUZS(estimate.materialsTotal)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerNotificationHaptic("success");
                    setLeadSubmitted(true);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95"
                >
                  🚀 Buyurtmani yuborish
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. MODAL: BALANS TO'LDIRISH */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Hisobni To&apos;ldirish</h3>
              </div>
              <button
                onClick={() => setShowTopupModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              PDF-smetalar yuklab olish yoki buyurtmalar birjasidan mijoz kontaktlarini sotib olish uchun balansingizni to&apos;ldiring:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { amount: 10000, label: "10 000 so'm" },
                { amount: 25000, label: "25 000 so'm" },
                { amount: 50000, label: "50 000 so'm" },
              ].map((item) => (
                <button
                  key={item.amount}
                  onClick={() => handleTopup(item.amount)}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-center transition active:scale-95"
                >
                  <span className="font-bold text-xs text-amber-400 block">{item.label}</span>
                  <span className="text-[9px] text-slate-500">Payme / Click</span>
                </button>
              ))}
            </div>

            <div className="text-[10px] text-center text-slate-500">
              * Sinov rejimida summa bir zumda hamyoningizga qo&apos;shiladi.
            </div>
          </div>
        </div>
      )}

      {/* 6. BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 px-6 py-2.5 max-w-md mx-auto">
        <div className="flex justify-between items-center">
          {[
            { id: "calc" as const, label: "Kalkulyator", icon: Calculator },
            { id: "leads" as const, label: "Lid-Birja", icon: Building2 },
            { id: "guide" as const, label: "Me'yorlar", icon: Info },
            { id: "profile" as const, label: "Profilim", icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic("light");
                  setActiveTab(tab.id);
                }}
                className={`flex flex-col items-center gap-1 transition-all duration-200 active:scale-95 ${
                  isActive ? "text-amber-400" : "text-slate-500 hover:text-slate-400"
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition ${
                    isActive ? "bg-amber-500/15" : "bg-transparent"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] ${isActive ? "font-bold text-amber-400" : "font-medium"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
