"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  calculateSmartEstimate,
  formatUZS,
  WorkType,
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
} from "lucide-react";

export default function Smeta24MiniApp() {
  // Navigation Tabs: 'calc' | 'profile' | 'leads' | 'guide'
  const [activeTab, setActiveTab] = useState<'calc' | 'profile' | 'leads' | 'guide'>('calc');

  // Telegram User
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);

  // 1. Xona Geometriyasi va Tanlovlar
  const [roomName, setRoomName] = useState("Mehmonxona");
  const [length, setLength] = useState<number>(5.5);
  const [width, setWidth] = useState<number>(4.0);
  const [height, setHeight] = useState<number>(3.0);
  const [openingsArea, setOpeningsArea] = useState<number>(4.2);
  const [includeCeiling, setIncludeCeiling] = useState<boolean>(true);
  const [workType, setWorkType] = useState<WorkType>("paint_euro");
  const [tier, setTier] = useState<QualityTier>("standard");
  const [includePlaster, setIncludePlaster] = useState<boolean>(false);
  const [plasterThickness, setPlasterThickness] = useState<number>(1.0);

  // 2. Usta PRO Sozlamalari
  const [isMasterMode, setIsMasterMode] = useState<boolean>(true);
  const [brandName, setBrandName] = useState<string>("ProFinish Uz");
  const [masterPhone, setMasterPhone] = useState<string>("+998 90 123 45 67");
  const [userBalance, setUserBalance] = useState<number>(15000); // 15 000 so'm default balance

  // Stavkalar (1 m2)
  const [puttyRate, setPuttyRate] = useState<number>(35000);
  const [pautinkaRate, setPautinkaRate] = useState<number>(20000);
  const [paintRate, setPaintRate] = useState<number>(25000);
  const [tileRate, setTileRate] = useState<number>(90000);
  const [plasterRate, setPlasterRate] = useState<number>(30000);

  // 3. Modallar va Statuslar
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [showLeadModal, setShowLeadModal] = useState<boolean>(false);
  const [showTopupModal, setShowTopupModal] = useState<boolean>(false);
  const [leadSubmitted, setLeadSubmitted] = useState<boolean>(false);
  const [clientPhone, setClientPhone] = useState<string>("+998 9");
  const [clientRegion, setClientRegion] = useState<string>("Toshkent shahri");

  // Lead-birja holati
  const [leadsList, setLeadsList] = useState([
    {
      id: "LD-9821",
      title: "Yunusobod — 3 xonali kvartira bo'yoq va shpaklyovka",
      area: "78.4 m²",
      budget: "12 400 000 so'm",
      date: "12 daqiqa oldin",
      region: "Toshkent shahri",
      price: 10000,
      isPurchased: false,
      contact: "+998 90 847 32 11 (Farrux)",
    },
    {
      id: "LD-9818",
      title: "Chilonzor — Sanuzel kafel va santexnika",
      area: "24.5 m²",
      budget: "4 850 000 so'm",
      date: "45 daqiqa oldin",
      region: "Toshkent shahri",
      price: 10000,
      isPurchased: false,
      contact: "+998 97 122 89 00 (Sanjar)",
    },
    {
      id: "LD-9804",
      title: "Samarqand — Kottej to'liq yevroremont (140 m²)",
      area: "140.0 m²",
      budget: "36 000 000 so'm",
      date: "2 soat oldin",
      region: "Samarqand",
      price: 15000,
      isPurchased: false,
      contact: "+998 93 456 78 90 (Jamshid)",
    },
  ]);

  // Init Telegram
  // Init Telegram safely post-hydration to avoid DOM mutation errors
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

  // Preset Xonalar
  const presets = [
    { name: "Mehmonxona", l: 5.5, w: 4.0, h: 3.0, op: 4.2, work: "paint_euro" as WorkType },
    { name: "Yotoqxona", l: 4.2, w: 3.2, h: 2.8, op: 3.5, work: "paint_standard" as WorkType },
    { name: "Oshxona", l: 3.8, w: 3.0, h: 2.8, op: 3.2, work: "paint_standard" as WorkType },
    { name: "Sanuzel", l: 2.5, w: 2.0, h: 2.6, op: 1.8, work: "tile" as WorkType },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    triggerHaptic("medium");
    setRoomName(p.name);
    setLength(p.l);
    setWidth(p.w);
    setHeight(p.h);
    setOpeningsArea(p.op);
    setWorkType(p.work);
  };

  // Kalkulyator natijasi
  const estimate = useMemo(() => {
    const input: RoomInput = {
      roomName,
      length,
      width,
      height,
      openingsArea,
      includeCeiling,
      workType,
      tier,
      includePlaster,
      plasterThicknessCm: plasterThickness,
      masterRates: {
        puttyPerM2: puttyRate,
        pautinkaPerM2: pautinkaRate,
        paintPerM2: paintRate,
        tilePerM2: tileRate,
        plasterPerM2: plasterRate,
      },
    };
    return calculateSmartEstimate(input);
  }, [
    roomName,
    length,
    width,
    height,
    openingsArea,
    includeCeiling,
    workType,
    tier,
    includePlaster,
    plasterThickness,
    puttyRate,
    pautinkaRate,
    paintRate,
    tileRate,
    plasterRate,
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

  // Balans to'ldirish
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
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {tgUser?.first_name ? `@${tgUser.username || tgUser.first_name}` : "@Smeta24Bot"} • Aqlli Tizim
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
                Shablonlar:
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

              {/* Eshik/deraza va shift */}
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    Eshik & Derazalar jami
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={openingsArea}
                      onChange={(e) => setOpeningsArea(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-sm font-bold text-white focus:border-amber-500 outline-none pr-8"
                    />
                    <span className="absolute right-2 top-2.5 text-[10px] text-slate-500 font-medium">m²</span>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setIncludeCeiling(!includeCeiling);
                    }}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      includeCeiling
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    {includeCeiling ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        Shift qo&apos;shilgan
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                        Shiftni qo&apos;shish
                      </>
                    )}
                  </button>
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
                  <span className="text-[9px] text-slate-400 block">Shift</span>
                  <span className="text-xs font-bold text-slate-200">{estimate.geometry.ceilingArea} m²</span>
                </div>
                <div>
                  <span className="text-[9px] text-amber-400 block font-semibold">Jami maydon</span>
                  <span className="text-xs font-black text-amber-400">{estimate.geometry.totalWorkArea} m²</span>
                </div>
              </div>
            </section>

            {/* 2-BLOK: ISH VA MATERIALLAR TURI */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Ta&apos;mir Turi va Texnologiyasi
                </h2>
              </div>

              {/* 3 ta asosiy rejim */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: "paint_euro" as WorkType,
                    title: "Yevro Bo'yoq",
                    sub: "Pautinka + Pasta",
                    badge: "Tavsiya",
                  },
                  {
                    id: "paint_standard" as WorkType,
                    title: "Standart",
                    sub: "Start + Finish",
                    badge: null,
                  },
                  {
                    id: "tile" as WorkType,
                    title: "Kafel",
                    sub: "Plitka + Zatirka",
                    badge: null,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      triggerHaptic("medium");
                      setWorkType(item.id);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center relative ${
                      workType === item.id
                        ? "bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {item.badge && (
                      <span className="absolute -top-2 bg-emerald-500 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-xs leading-tight">{item.title}</span>
                    <span
                      className={`text-[9px] mt-0.5 ${
                        workType === item.id ? "text-slate-900 font-medium" : "text-slate-500"
                      }`}
                    >
                      {item.sub}
                    </span>
                  </button>
                ))}
              </div>

              {/* Gipsli suvoq qo'shimcha optsiyasi */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="plasterToggle"
                      checked={includePlaster}
                      onChange={(e) => {
                        triggerHaptic("light");
                        setIncludePlaster(e.target.checked);
                      }}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <label htmlFor="plasterToggle" className="text-xs font-semibold text-slate-200 cursor-pointer">
                      Gipsli suvoq (Rotband) bilan tekislash
                    </label>
                  </div>
                  <span className="text-[10px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded">
                    Mayoq bo&apos;yicha
                  </span>
                </div>

                {includePlaster && (
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-slate-400">Qatlam qalinligi:</span>
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

              {/* Segment (Ekonom / Standart / Premium) */}
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
            </section>

            {/* 3-BLOK: USTA PRO SOZLAMALARI */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Usta PRO Rejimi
                    </h2>
                    <p className="text-[10px] text-slate-400">PDF-smetaga shaxsiy narx va brending</p>
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

              {isMasterMode && (
                <div className="space-y-3 pt-1">
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

                  {/* 1 m2 narxlari */}
                  <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800/80 space-y-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      1 m² uchun usta xizmat haqi:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {workType !== "tile" ? (
                        <>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">Shpaklyovka (1 m²)</label>
                            <input
                              type="number"
                              value={puttyRate}
                              onChange={(e) => setPuttyRate(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-amber-300"
                            />
                          </div>
                          {workType === "paint_euro" && (
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Pautinka (1 m²)</label>
                              <input
                                type="number"
                                value={pautinkaRate}
                                onChange={(e) => setPautinkaRate(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-amber-300"
                              />
                            </div>
                          )}
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">Bo&apos;yash (1 m²)</label>
                            <input
                              type="number"
                              value={paintRate}
                              onChange={(e) => setPaintRate(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-amber-300"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="col-span-2">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Kafel terish (1 m²)</label>
                          <input
                            type="number"
                            value={tileRate}
                            onChange={(e) => setTileRate(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-300"
                          />
                        </div>
                      )}

                      {includePlaster && (
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Suvoq tortish (1 m²)</label>
                          <input
                            type="number"
                            value={plasterRate}
                            onChange={(e) => setPlasterRate(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-amber-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 4-BLOK: SMETA NATIJALARI (JONLI HISOBLASH VA BLUR PREVIEW) */}
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
                {estimate.materials.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs transition hover:border-slate-700"
                  >
                    <div className="pr-2">
                      <p className="font-semibold text-slate-200 leading-snug">{item.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Sof me&apos;yor: <span className="text-slate-300 font-medium">{item.exactUnitStr}</span>
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

              {/* 2 TA ASOSIY MONETIZATSIYA TUGMASI */}
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xl">
                  {brandName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">{brandName}</h2>
                  <p className="text-xs text-slate-400">{masterPhone}</p>
                  <span className="inline-block mt-1 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    Tasdiqlangan Usta / Prorab
                  </span>
                </div>
              </div>

              {/* Hamyon bloki */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Ichki Hamyon Balansi</span>
                  <span className="text-lg font-black text-emerald-400">
                    {userBalance.toLocaleString("ru-RU")} so&apos;m
                  </span>
                </div>
                <button
                  onClick={() => setShowTopupModal(true)}
                  className="bg-amber-500 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  To&apos;ldirish
                </button>
              </div>
            </div>

            {/* Shaxsiy tariflar matritsasi */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Sizning Doimiy Stavkalaringiz (1 m²)
              </h3>
              <p className="text-[11px] text-slate-400">
                Ushbu stavkalar barcha kelgusi PDF-smetalaringizda avtomatik hisoblanadi.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-300">Shpaklyovka surtish:</span>
                  <input
                    type="number"
                    value={puttyRate}
                    onChange={(e) => setPuttyRate(Number(e.target.value))}
                    className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right font-bold text-amber-300"
                  />
                </div>
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-300">Stekloxolst (Pautinka):</span>
                  <input
                    type="number"
                    value={pautinkaRate}
                    onChange={(e) => setPautinkaRate(Number(e.target.value))}
                    className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right font-bold text-amber-300"
                  />
                </div>
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-300">Emulsiya bo&apos;yash:</span>
                  <input
                    type="number"
                    value={paintRate}
                    onChange={(e) => setPaintRate(Number(e.target.value))}
                    className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right font-bold text-amber-300"
                  />
                </div>
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-300">Kafel terish:</span>
                  <input
                    type="number"
                    value={tileRate}
                    onChange={(e) => setTileRate(Number(e.target.value))}
                    className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right font-bold text-amber-300"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  triggerNotificationHaptic("success");
                  alert("Stavkalar muvaffaqiyatli saqlandi!");
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-xl border border-slate-700 transition"
              >
                Stavkalarni saqlash
              </button>
            </div>
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === "leads" && (
          <div className="space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <div>
                  <h2 className="font-bold text-sm text-white">B2B Qurilish va Ta&apos;mir Lid-Birjasi</h2>
                  <p className="text-[11px] text-slate-400">Uy egalaridan tushgan yangi arizalar ro&apos;yxati</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {leadsList.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-amber-500/15 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                        {lead.id}
                      </span>
                      <h4 className="font-bold text-xs text-white mt-1 leading-snug">{lead.title}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {lead.region} • {lead.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Budjet</span>
                      <span className="text-xs font-bold text-emerald-400">{lead.budget}</span>
                    </div>
                  </div>

                  {lead.isPurchased ? (
                    <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-emerald-300 block font-medium">Mijoz kontakti ochiq:</span>
                        <span className="font-bold text-white">{lead.contact}</span>
                      </div>
                      <a
                        href={`tel:${lead.contact.split(" ")[0]}`}
                        className="bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs"
                      >
                        Qo&apos;ng&apos;iroq
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuyLead(lead.id, lead.price)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition"
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
                Materiallar Sarf Me&apos;yorlari (1 m² uchun)
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ushbu jadval Davlat qurilish standartlari (ShNQ) hamda yetakchi ishlab chiqaruvchilar (Knauf, Betek, Weber) me&apos;yorlari asosida tuzilgan:
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 text-xs">
              {[
                { name: "Gruntovka (1 qatlam)", norm: "0.15 litr", pack: "10 L kanistra" },
                { name: "Gipsli suvoq (Rotband, 10 mm)", norm: "8.5 kg", pack: "30 kg qop" },
                { name: "Start shpaklyovka (2 mm)", norm: "1.8 kg", pack: "25 kg qop" },
                { name: "Finish shpaklyovka (quruq, 2 qatlam)", norm: "1.0 kg", pack: "20 kg qop" },
                { name: "Super Finish pasta (Sheetrock)", norm: "0.8 kg", pack: "28 kg paqir" },
                { name: "Stekloxolst Pautinka (+10% zapas)", norm: "1.10 m²", pack: "50 m² rulon" },
                { name: "Pautinka kleyi", norm: "0.25 kg", pack: "10 kg paqir" },
                { name: "Suv emulsiyali bo'yoq (2 qatlam)", norm: "0.28 litr", pack: "15 L paqir" },
                { name: "Kafel / Keramogranit (+10% kesishga)", norm: "1.10 m²", pack: "1.44 m² pachka" },
                { name: "Kafel kleyi", norm: "4.5 kg", pack: "25 kg qop" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <p className="font-bold text-slate-200">{row.name}</p>
                    <p className="text-[10px] text-slate-400">Standart qadoq: {row.pack}</p>
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
              {isMasterMode && (
                <div className="border-t border-slate-200 pt-1">
                  <div className="flex justify-between font-bold text-[10px]">
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

            {/* Tugmalar */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  triggerNotificationHaptic("success");
                  alert("PDF fayli @Smeta24Bot orqali Telegram xabaringizga yuborildi! ✅");
                  setShowPdfModal(false);
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>PDF-ni Telegram Chatga yuborish</span>
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
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-white">Arizangiz qabul qilindi!</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Sizning hisoblangan materiallar ro&apos;yxatingiz eng yaxshi ulgurji do&apos;konlarga yetkazildi. Tez orada siz bilan bog&apos;lanishadi!
                </p>
                <button
                  onClick={() => {
                    setShowLeadModal(false);
                    setLeadSubmitted(false);
                  }}
                  className="bg-slate-800 text-slate-200 font-bold text-xs px-5 py-2.5 rounded-xl"
                >
                  Yopish
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">
                  Hisoblangan <strong>{roomName}</strong> materiallari ro&apos;yxatini do&apos;konlarga yuborish uchun kontaktlaringizni tasdiqlang:
                </p>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Telefon raqamingiz</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-500 outline-none"
                    placeholder="+998 90 123 45 67"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Hudud / Manzil</label>
                  <select
                    value={clientRegion}
                    onChange={(e) => setClientRegion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-amber-500 outline-none"
                  >
                    <option value="Toshkent shahri">Toshkent shahri</option>
                    <option value="Toshkent viloyati">Toshkent viloyati</option>
                    <option value="Samarqand">Samarqand</option>
                    <option value="Buxoro">Buxoro</option>
                    <option value="Farg'ona">Farg&apos;ona</option>
                    <option value="Andijon">Andijon</option>
                    <option value="Namangan">Namangan</option>
                    <option value="Qashqadaryo">Qashqadaryo</option>
                    <option value="Navoiy">Navoiy</option>
                  </select>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">Taxminiy material summasi:</span>
                  <span className="text-amber-400 font-black">{formatUZS(estimate.materialsTotal)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerNotificationHaptic("success");
                    setLeadSubmitted(true);
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/20 mt-1"
                >
                  Ariza qoldirish (Bepul)
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
                <h3 className="font-bold text-sm text-white">Hamyon Balansini To&apos;ldirish</h3>
              </div>
              <button
                onClick={() => setShowTopupModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Qulay paketni tanlang (Click yoki Payme orqali avtomatik to&apos;ldiriladi):
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { amount: 15000, label: "15 000 so'm", bonus: "3 ta PDF" },
                { amount: 35000, label: "35 000 so'm", bonus: "+1 bepul" },
                { amount: 70000, label: "70 000 so'm", bonus: "+3 bepul" },
              ].map((pack) => (
                <button
                  key={pack.amount}
                  onClick={() => handleTopup(pack.amount)}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-center transition group"
                >
                  <span className="text-[10px] text-emerald-400 font-bold block">{pack.bonus}</span>
                  <span className="text-xs font-black text-white block mt-0.5">{pack.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="text-[11px] text-slate-500 font-medium">To&apos;lov tizimlari:</span>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Click</span>
              <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">Payme</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("calc");
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === "calc"
                ? "text-amber-400 bg-amber-500/10 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calculator className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Kalkulyator</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("profile");
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === "profile"
                ? "text-amber-400 bg-amber-500/10 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Usta Profili</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("leads");
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition relative ${
              activeTab === "leads"
                ? "text-amber-400 bg-amber-500/10 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Lid-Birja</span>
            <span className="absolute top-1 right-3 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
          </button>

          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("guide");
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === "guide"
                ? "text-amber-400 bg-amber-500/10 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Me&apos;yorlar</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
