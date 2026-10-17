"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  calculateSmartEstimate,
  calculateProjectSummary,
  createDefaultRoomInput,
  generateRoomId,
  formatUZS,
  CeilingWorkType,
  WallWorkType,
  FloorWorkType,
  QualityTier,
  RoomInput,
  RoomData,
  ProjectSummary,
  CONFIGURABLE_MATERIALS,
  CONFIGURABLE_LABOR_RATES,
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
  Info,
  ShoppingBag,
  X,
  CreditCard,
  Plus,
  Loader2,
  Printer,
  Send,
  Settings,
  RotateCcw,
  Store,
  Wrench,
  Check,
  Phone,
  RefreshCw,
  ExternalLink,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Home,
  LayoutGrid,
  FolderArchive,
  FolderOpen,
  Save,
  Calendar,
  Bookmark,
  Pencil,
} from "lucide-react";

// =======================================
// XONA TILI VA RANGLARI
// =======================================
const ROOM_COLORS = [
  { bg: "from-amber-500/15 to-amber-600/5", border: "border-amber-500/40", text: "text-amber-400", activeBg: "bg-amber-500", activeText: "text-slate-950" },
  { bg: "from-sky-500/15 to-sky-600/5", border: "border-sky-500/40", text: "text-sky-400", activeBg: "bg-sky-500", activeText: "text-slate-950" },
  { bg: "from-emerald-500/15 to-emerald-600/5", border: "border-emerald-500/40", text: "text-emerald-400", activeBg: "bg-emerald-500", activeText: "text-slate-950" },
  { bg: "from-violet-500/15 to-violet-600/5", border: "border-violet-500/40", text: "text-violet-400", activeBg: "bg-violet-500", activeText: "text-white" },
  { bg: "from-rose-500/15 to-rose-600/5", border: "border-rose-500/40", text: "text-rose-400", activeBg: "bg-rose-500", activeText: "text-white" },
  { bg: "from-cyan-500/15 to-cyan-600/5", border: "border-cyan-500/40", text: "text-cyan-400", activeBg: "bg-cyan-500", activeText: "text-slate-950" },
  { bg: "from-orange-500/15 to-orange-600/5", border: "border-orange-500/40", text: "text-orange-400", activeBg: "bg-orange-500", activeText: "text-slate-950" },
  { bg: "from-pink-500/15 to-pink-600/5", border: "border-pink-500/40", text: "text-pink-400", activeBg: "bg-pink-500", activeText: "text-white" },
];

const DEFAULT_ROOM_NAMES = [
  "Mehmonxona", "Yotoqxona", "Oshxona", "Sanuzel", "Koridor",
  "Bolalar xonasi", "Kabinet", "Balkon",
];

// =======================================
// PRESETLAR
// =======================================
const ROOM_PRESETS = [
  {
    name: "Mehmonxona (Zal)",
    l: 5.5, w: 4.0, h: 3.0, op: 4.2,
    ceiling: "gipsokarton_decor" as CeilingWorkType,
    wall: "paint_spray" as WallWorkType,
    pautinka: true, plaster: false,
    floor: "laminate" as FloorWorkType,
    screed: false, selfLeveling: false,
  },
  {
    name: "Yotoqxona",
    l: 4.2, w: 3.2, h: 2.8, op: 3.5,
    ceiling: "gipsokarton_plain" as CeilingWorkType,
    wall: "wallpaper" as WallWorkType,
    pautinka: false, plaster: false,
    floor: "laminate" as FloorWorkType,
    screed: false, selfLeveling: false,
  },
  {
    name: "Kottej / Premium",
    l: 6.0, w: 5.0, h: 3.2, op: 5.0,
    ceiling: "gipsokarton_decor" as CeilingWorkType,
    wall: "paint_spray" as WallWorkType,
    pautinka: true, plaster: true,
    floor: "parquet" as FloorWorkType,
    screed: true, selfLeveling: true,
  },
  {
    name: "Oshxona",
    l: 3.8, w: 3.0, h: 2.8, op: 3.2,
    ceiling: "gipsokarton_plain" as CeilingWorkType,
    wall: "paint_roller" as WallWorkType,
    pautinka: true, plaster: false,
    floor: "tile" as FloorWorkType,
    screed: false, selfLeveling: false,
  },
  {
    name: "Sanuzel / Vanna",
    l: 2.5, w: 2.0, h: 2.6, op: 1.8,
    ceiling: "stretch" as CeilingWorkType,
    wall: "tile" as WallWorkType,
    pautinka: false, plaster: false,
    floor: "tile" as FloorWorkType,
    screed: false, selfLeveling: false,
  },
];

// =======================================
// ROOM INPUT COMPONENT
// =======================================
interface RoomInputFormProps {
  input: RoomInput;
  onUpdate: (updates: Partial<RoomInput>) => void;
  estimate: ReturnType<typeof calculateSmartEstimate>;
  isUnlocked: boolean;
  onUnlock: () => void;
  isMasterMode: boolean;
  roomColor: typeof ROOM_COLORS[0];
}

function RoomInputForm({
  input,
  onUpdate,
  estimate,
  isUnlocked,
  onUnlock,
  isMasterMode,
  roomColor,
}: RoomInputFormProps) {
  const handleDecimalChange = (
    val: string,
    field: keyof RoomInput
  ) => {
    const cleaned = val.replace(",", ".");
    if (cleaned === "" || /^\d*\.?\d*$/.test(cleaned)) {
      onUpdate({ [field]: cleaned === "" ? 0 : parseFloat(cleaned) || 0 });
    }
  };

  return (
    <div className="space-y-4">
      {/* Tezkor Shablonlar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap pl-0.5">
          Shablon:
        </span>
        {ROOM_PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => {
              triggerHaptic("medium");
              onUpdate({
                roomName: p.name,
                length: p.l,
                width: p.w,
                height: p.h,
                openingsArea: p.op,
                ceilingWork: p.ceiling,
                wallWork: p.wall,
                includePautinka: p.pautinka,
                includePlaster: p.plaster,
                floorWork: p.floor,
                includeScreed: p.screed,
                includeSelfLeveling: p.selfLeveling,
              });
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
              input.roomName === p.name
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
            value={input.roomName}
            onChange={(e) => onUpdate({ roomName: e.target.value })}
            className="bg-slate-950 text-xs text-right px-2.5 py-1 rounded-lg border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500 w-36"
            placeholder="Xona nomi"
          />
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Uzunligi (L)", field: "length" as const, val: input.length },
            { label: "Eni (W)", field: "width" as const, val: input.width },
            { label: "Balandligi (H)", field: "height" as const, val: input.height },
          ].map((item) => (
            <div key={item.field}>
              <label className="text-[10px] text-slate-400 block mb-1">{item.label}</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={item.val || ""}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleDecimalChange(e.target.value, item.field)}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-sm font-bold text-white focus:border-amber-500 outline-none pr-6"
                />
                <span className="absolute right-2 top-2.5 text-[10px] text-slate-500 font-medium">m</span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">
            Eshik va Derazalar jami yuzasi (devor maydonidan chegiriladi)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={input.openingsArea || ""}
              onFocus={(e) => e.target.select()}
              onChange={(e) => handleDecimalChange(e.target.value, "openingsArea")}
              placeholder="0"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-sm font-bold text-white focus:border-amber-500 outline-none pr-8"
            />
            <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-medium">m²</span>
          </div>
        </div>

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

      {/* 2-BLOK: SHIFT (POTOLOK) ISHLARI */}
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
          {input.ceilingWork !== "none" && (
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Faol
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "gipsokarton_plain" as CeilingWorkType, title: "Gipskarton Tekis", sub: "Knauf 1-qavat karkas", badge: "Ko'p tanlangan" },
            { id: "gipsokarton_decor" as CeilingWorkType, title: "Gipskarton Figurali", sub: "2-qavat naqshli dizayn", badge: "Dizayn" },
            { id: "paint_spray" as CeilingWorkType, title: "Bo'yoq (Kraskapult)", sub: "Shpaklyovka + Sepish", badge: null },
            { id: "paint_roller" as CeilingWorkType, title: "Bo'yoq (Valikda)", sub: "Shpaklyovka + Valik", badge: null },
            { id: "stretch" as CeilingWorkType, title: "Natyajnoy potolok", sub: "Fransuz plyonka + montaj", badge: null },
            { id: "none" as CeilingWorkType, title: "Shiftga tegilmaydi", sub: "Hisobdan chiqarish", badge: null },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                triggerHaptic("medium");
                onUpdate({ ceilingWork: item.id });
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between relative ${
                input.ceilingWork === item.id
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

      {/* 3-BLOK: DEVOR ISHLARI */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
              🧱
            </div>
            <div>
              <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Devor Ishlari &amp; Qoplamalar
              </h2>
              <p className="text-[10px] text-slate-400">Sof maydon: {estimate.geometry.netWallArea} m²</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "paint_spray" as WallWorkType, title: "Bo'yoq (Kraskapult)", sub: "Sepish", badge: "Hit" },
            { id: "paint_roller" as WallWorkType, title: "Bo'yoq (Valik)", sub: "Klassik", badge: null },
            { id: "wallpaper" as WallWorkType, title: "Oboy", sub: "Vinil/Flizelin", badge: null },
            { id: "tile" as WallWorkType, title: "Kafel / Plitka", sub: "Keramogranit", badge: null },
            { id: "paint_standard" as WallWorkType, title: "Standart emulsiya", sub: "Start+Finish", badge: null },
            { id: "none" as WallWorkType, title: "Tegilmaydi", sub: "Hisobdan chiqarish", badge: null },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                triggerHaptic("medium");
                onUpdate({ wallWork: item.id });
              }}
              className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center relative ${
                input.wallWork === item.id
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
              <span className={`text-[8.5px] mt-0.5 ${input.wallWork === item.id ? "text-slate-950 font-medium" : "text-slate-500"}`}>
                {item.sub}
              </span>
            </button>
          ))}
        </div>

        {/* Qo'shimcha qatlamlar */}
        <div className="space-y-2 pt-1">
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={input.includePlaster || false}
                  onChange={(e) => {
                    triggerHaptic("light");
                    onUpdate({ includePlaster: e.target.checked });
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
            {input.includePlaster && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                <span className="text-[10px] text-slate-400">Qatlam qalinligi:</span>
                <div className="flex items-center gap-1.5">
                  {[0.5, 1.0, 1.5, 2.0].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onUpdate({ plasterThicknessCm: val })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        (input.plasterThicknessCm || 1.0) === val
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

          {(input.wallWork === "paint_spray" || input.wallWork === "paint_roller") && (
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={input.includePautinka || false}
                  onChange={(e) => {
                    triggerHaptic("light");
                    onUpdate({ includePautinka: e.target.checked });
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

      {/* 4-BLOK: POL ISHLARI */}
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

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "laminate" as FloorWorkType, title: "Laminat (33-klass)", sub: "Podlojka + Plintus", badge: "Mashhur" },
            { id: "parquet" as FloorWorkType, title: "Parket / Inzhener", sub: "Tabiiy yog'och + 2K yelim", badge: "Premium" },
            { id: "tile" as FloorWorkType, title: "Polga Kafel / Plitka", sub: "Keramogranit + kley", badge: null },
            { id: "none" as FloorWorkType, title: "Polga tegilmaydi", sub: "Hisobdan chiqarish", badge: null },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                triggerHaptic("medium");
                onUpdate({ floorWork: item.id });
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between relative ${
                input.floorWork === item.id
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

        <div className="space-y-2 pt-1">
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={input.includeScreed || false}
                onChange={(e) => {
                  triggerHaptic("light");
                  onUpdate({ includeScreed: e.target.checked });
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

          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={input.includeSelfLeveling || false}
                onChange={(e) => {
                  triggerHaptic("light");
                  onUpdate({ includeSelfLeveling: e.target.checked });
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
    </div>
  );
}

// =======================================
// MAIN APP
// =======================================
export default function Smeta24MiniApp() {
  const [activeTab, setActiveTab] = useState<'calc' | 'profile' | 'leads' | 'guide'>('calc');
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);

  // ===== KO'P XONALI TIZIM =====
  const [rooms, setRooms] = useState<{ id: string; input: RoomInput }[]>(() => {
    const defaultId = generateRoomId();
    return [{
      id: defaultId,
      input: {
        ...createDefaultRoomInput("Mehmonxona"),
        length: 5.5,
        width: 4.0,
        height: 3.0,
        openingsArea: 4.2,
        ceilingWork: "gipsokarton_plain",
        wallWork: "paint_spray",
        includePautinka: true,
        floorWork: "laminate",
      },
    }];
  });

  const [activeRoomId, setActiveRoomId] = useState<string>(() => rooms[0]?.id || "");
  const [showSummary, setShowSummary] = useState(false);

  // Usta PRO
  const [isMasterMode, setIsMasterMode] = useState(true);
  const [brandName, setBrandName] = useState("ProFinish Uz");
  const [masterPhone, setMasterPhone] = useState("+998 90 123 45 67");
  const [userBalance, setUserBalance] = useState(15000);
  const [tier, setTier] = useState<QualityTier>("standard");

  // Profile sub-tab
  const [profileSubTab, setProfileSubTab] = useState<'rates' | 'materials'>('rates');
  const [profileCategoryFilter, setProfileCategoryFilter] = useState('Barchasi');

  const initialLaborRates: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    CONFIGURABLE_LABOR_RATES.forEach((r) => { map[r.id] = r.defaultRate; });
    return map;
  }, []);

  const [masterRates, setMasterRates] = useState<Record<string, number>>(initialLaborRates);

  const initialMaterialPrices: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    CONFIGURABLE_MATERIALS.forEach((m) => { map[m.code] = m.defaultPrice; });
    return map;
  }, []);

  const [materialPrices, setMaterialPrices] = useState<Record<string, number>>(initialMaterialPrices);

  // Modals
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [clientPhone, setClientPhone] = useState("+998 9");
  const [clientRegion, setClientRegion] = useState("Toshkent shahri");
  const [isSendingPdf, setIsSendingPdf] = useState(false);
  const [pdfStatusMsg, setPdfStatusMsg] = useState("");
  const [saveToast, setSaveToast] = useState("");

  // ===== MENING SMETALARIM (LOYIHALAR TARIXI) =====
  const [savedProjects, setSavedProjects] = useState<{
    id: string;
    name: string;
    createdAt: string;
    rooms: { id: string; input: RoomInput }[];
    tier: QualityTier;
    grandTotal: number;
    totalWorkArea: number;
    totalRooms: number;
  }[]>([]);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showSaveProjectModal, setShowSaveProjectModal] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState("");
  const [currentProjectName, setCurrentProjectName] = useState("Yangi Obyekt");

  // Inline material narxini tahrirlash
  const [editingMaterial, setEditingMaterial] = useState<{
    code: string;
    name: string;
    currentPrice: number;
    unit: string;
  } | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<number>(0);

  // Lid-birja
  const [leadsList, setLeadsList] = useState<any[]>([
    { id: "LD-9821", title: "Yunusobod — 3 xonali gipskarton va kraskapult bo'yoq", area: "78.4 m²", budget: "16 400 000 so'm", date: "10 daqiqa oldin", region: "Toshkent shahri", price: 10000, lead_type: "materials_order", isPurchased: false, contact: "+998 90 ••• •• 11 (Farrux)" },
    { id: "LD-9818", title: "Chilonzor — Polga parket yotqizish va plintus", area: "42.5 m²", budget: "7 250 000 so'm", date: "35 daqiqa oldin", region: "Toshkent shahri", price: 10000, lead_type: "need_master", isPurchased: false, contact: "+998 97 ••• •• 00 (Sanjar)" },
    { id: "LD-9804", title: "Samarqand — Kottej pol steshkasi, oboy va figurali shift", area: "140.0 m²", budget: "38 000 000 so'm", date: "2 soat oldin", region: "Samarqand", price: 15000, lead_type: "materials_order", isPurchased: false, contact: "+998 93 ••• •• 90 (Jamshid)" },
  ]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [selectedLeadRegion, setSelectedLeadRegion] = useState("Barchasi");
  const [selectedLeadType, setSelectedLeadType] = useState("Barchasi");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadClientName, setLeadClientName] = useState("");
  const [leadOrderType, setLeadOrderType] = useState("materials_order");

  // ===== INIT =====
  useEffect(() => {
    try {
      const savedRates = localStorage.getItem("smeta24_master_rates");
      if (savedRates) setMasterRates(JSON.parse(savedRates));
      const savedMaterials = localStorage.getItem("smeta24_material_prices");
      if (savedMaterials) setMaterialPrices(JSON.parse(savedMaterials));
      const savedBrand = localStorage.getItem("smeta24_brand_name");
      if (savedBrand) setBrandName(savedBrand);
      const savedPhone = localStorage.getItem("smeta24_master_phone");
      if (savedPhone) setMasterPhone(savedPhone);
      // Saqlangan xonalar
      const savedRooms = localStorage.getItem("smeta24_rooms");
      if (savedRooms) {
        const parsed = JSON.parse(savedRooms);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRooms(parsed);
          setActiveRoomId(parsed[0].id);
        }
      }
      // Saqlangan loyihalar tarixi
      const savedProjRaw = localStorage.getItem("smeta24_saved_projects");
      if (savedProjRaw) {
        try {
          const parsedProj = JSON.parse(savedProjRaw);
          if (Array.isArray(parsedProj)) setSavedProjects(parsedProj);
        } catch (e) {}
      }
      const savedCurrentName = localStorage.getItem("smeta24_current_project_name");
      if (savedCurrentName) setCurrentProjectName(savedCurrentName);
    } catch (e) {
      console.warn("Storage load error:", e);
    }

    const handleInit = () => {
      try {
        initTelegramApp();
        const user = getTelegramUser();
        if (user) {
          setTgUser(user);
          if (user.first_name && !localStorage.getItem("smeta24_brand_name")) {
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

  // ===== AUTO-SAVE ROOMS =====
  useEffect(() => {
    try {
      localStorage.setItem("smeta24_rooms", JSON.stringify(rooms));
    } catch (e) {}
  }, [rooms]);

  // ===== CALCULATIONS (memoized) =====
  const roomEstimates: RoomData[] = useMemo(() => {
    return rooms.map((room) => {
      const input: RoomInput = {
        ...room.input,
        tier,
        masterRates,
        materialPrices,
      };
      return {
        id: room.id,
        input,
        estimate: calculateSmartEstimate(input),
      };
    });
  }, [rooms, tier, masterRates, materialPrices]);

  const projectSummary: ProjectSummary = useMemo(() => {
    return calculateProjectSummary(roomEstimates);
  }, [roomEstimates]);

  const activeRoom = rooms.find((r) => r.id === activeRoomId);
  const activeRoomEstimate = roomEstimates.find((r) => r.id === activeRoomId);
  const activeRoomIndex = rooms.findIndex((r) => r.id === activeRoomId);

  // ===== ROOM CRUD =====
  const addRoom = useCallback(() => {
    triggerHaptic("medium");
    const usedNames = rooms.map((r) => r.input.roomName);
    const nextName = DEFAULT_ROOM_NAMES.find((n) => !usedNames.includes(n)) || `Xona ${rooms.length + 1}`;
    const newId = generateRoomId();
    const newRoom = { id: newId, input: createDefaultRoomInput(nextName) };
    setRooms((prev) => [...prev, newRoom]);
    setActiveRoomId(newId);
    setShowSummary(false);
  }, [rooms]);

  const removeRoom = useCallback((roomId: string) => {
    if (rooms.length <= 1) return;
    triggerHaptic("medium");
    setRooms((prev) => {
      const updated = prev.filter((r) => r.id !== roomId);
      if (activeRoomId === roomId) {
        setActiveRoomId(updated[0]?.id || "");
      }
      return updated;
    });
  }, [rooms, activeRoomId]);

  const duplicateRoom = useCallback((roomId: string) => {
    triggerHaptic("medium");
    const source = rooms.find((r) => r.id === roomId);
    if (!source) return;
    const newId = generateRoomId();
    const newRoom = {
      id: newId,
      input: { ...source.input, roomName: `${source.input.roomName} (nusxa)` },
    };
    setRooms((prev) => [...prev, newRoom]);
    setActiveRoomId(newId);
  }, [rooms]);

  const updateRoomInput = useCallback((roomId: string, updates: Partial<RoomInput>) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId ? { ...r, input: { ...r.input, ...updates } } : r
      )
    );
  }, []);

  // ===== LOYIHA BOSHQARUVI (MENING SMETALARIM) =====
  const handleSaveCurrentProject = (customName?: string) => {
    const nameToSave = (customName || projectNameInput || currentProjectName || "Obyekt").trim();
    if (!nameToSave) return;
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}.${(now.getMonth() + 1).toString().padStart(2, "0")}.${now.getFullYear()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    
    const newProject = {
      id: "proj_" + Date.now(),
      name: nameToSave,
      createdAt: formattedDate,
      rooms: JSON.parse(JSON.stringify(rooms)),
      tier,
      grandTotal: projectSummary.projectGrandTotal,
      totalWorkArea: projectSummary.totalWorkArea,
      totalRooms: rooms.length,
    };
    
    const updated = [newProject, ...savedProjects.filter((p) => p.name !== nameToSave)];
    setSavedProjects(updated);
    setCurrentProjectName(nameToSave);
    try {
      localStorage.setItem("smeta24_saved_projects", JSON.stringify(updated));
      localStorage.setItem("smeta24_current_project_name", nameToSave);
    } catch (e) {}
    setShowSaveProjectModal(false);
    setProjectNameInput("");
    showQuickToast(`✅ "${nameToSave}" saqlandi!`);
    triggerNotificationHaptic("success");
  };

  const handleLoadProject = (proj: typeof savedProjects[0]) => {
    triggerHaptic("medium");
    if (proj.rooms && proj.rooms.length > 0) {
      setRooms(proj.rooms);
      setActiveRoomId(proj.rooms[0].id);
      if (proj.tier) setTier(proj.tier);
      setCurrentProjectName(proj.name);
      try {
        localStorage.setItem("smeta24_current_project_name", proj.name);
        localStorage.setItem("smeta24_rooms", JSON.stringify(proj.rooms));
      } catch (e) {}
      setShowProjectsModal(false);
      showQuickToast(`📂 "${proj.name}" yuklandi!`);
      triggerNotificationHaptic("success");
    }
  };

  const handleDeleteProject = (projId: string, projName: string) => {
    triggerHaptic("medium");
    const updated = savedProjects.filter((p) => p.id !== projId);
    setSavedProjects(updated);
    try {
      localStorage.setItem("smeta24_saved_projects", JSON.stringify(updated));
    } catch (e) {}
    showQuickToast(`🗑️ "${projName}" o'chirildi`);
  };

  const handleDuplicateProject = (proj: typeof savedProjects[0]) => {
    triggerHaptic("light");
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}.${(now.getMonth() + 1).toString().padStart(2, "0")}.${now.getFullYear()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const duplicated = {
      ...proj,
      id: "proj_" + Date.now(),
      name: `${proj.name} (nusxa)`,
      createdAt: formattedDate,
    };
    const updated = [duplicated, ...savedProjects];
    setSavedProjects(updated);
    try {
      localStorage.setItem("smeta24_saved_projects", JSON.stringify(updated));
    } catch (e) {}
    showQuickToast(`📋 Nusxa olindi: "${duplicated.name}"`);
  };

  const handleNewProject = () => {
    triggerHaptic("medium");
    const defaultId = generateRoomId();
    const newRooms = [{
      id: defaultId,
      input: {
        ...createDefaultRoomInput("Mehmonxona"),
        length: 5.5,
        width: 4.0,
        height: 3.0,
        openingsArea: 4.2,
      },
    }];
    setRooms(newRooms);
    setActiveRoomId(defaultId);
    setCurrentProjectName("Yangi Obyekt");
    setShowSummary(false);
    try {
      localStorage.setItem("smeta24_current_project_name", "Yangi Obyekt");
      localStorage.setItem("smeta24_rooms", JSON.stringify(newRooms));
    } catch (e) {}
    setShowProjectsModal(false);
    showQuickToast("✨ Yangi loyiha boshlandi!");
  };

  // ===== NUSXALASH VA TOZALASH (TELEGRAM / WHATSAPP UCHUN) =====
  const handleCopyTextEstimate = (mode: 'project' | 'room' = 'project') => {
    triggerHaptic("medium");
    let text = "";
    
    if (mode === 'project' || showSummary) {
      text += `📋 SMETA24 — ${currentProjectName}\n`;
      text += `🏠 Xonalar soni: ${rooms.length} ta\n`;
      text += `📐 Jami maydon: ${projectSummary.totalWorkArea.toFixed(1)} m² (Pol: ${projectSummary.totalFloorArea} m², Devor: ${projectSummary.totalWallArea} m², Shift: ${projectSummary.totalCeilingArea} m²)\n\n`;
      
      text += `🚪 XONALAR RO'YXATI:\n`;
      projectSummary.roomBreakdown.forEach((rb, idx) => {
        text += `${idx + 1}. ${rb.roomName}: ${rb.floorArea} m² — ${formatUZS(rb.grandTotal)}\n`;
      });
      
      text += `\n🧱 TALAB QILINADIGAN MATERIALLAR:\n`;
      projectSummary.combinedMaterials.forEach((m) => {
        if (!m.isExcluded) {
          text += `• ${m.name}: ${m.packagesCount} ${m.unit} — ${formatUZS(m.totalPrice)}\n`;
        }
      });
      
      text += `\n💵 Materiallar jami: ${formatUZS(projectSummary.materialsGrandTotal)}\n`;
      if (isMasterMode && projectSummary.laborGrandTotal > 0) {
        text += `👷‍♂️ Usta xizmati jami: ${formatUZS(projectSummary.laborGrandTotal)}\n`;
      }
      text += `═══════════════════════\n`;
      text += `💰 JAMI BUDJET: ${formatUZS(projectSummary.projectGrandTotal)}\n\n`;
      text += `👤 Usta / Brend: ${brandName} (${masterPhone})\n`;
      text += `🤖 @Smeta24Bot orqali avtomatik shakllantirildi`;
    } else if (activeRoom && activeRoomEstimate) {
      const est = activeRoomEstimate.estimate;
      const geo = est.geometry;
      text += `📋 SMETA24 — ${activeRoom.input.roomName}\n`;
      text += `📐 O'lchamlari: ${activeRoom.input.length}m × ${activeRoom.input.width}m (h: ${activeRoom.input.height}m)\n`;
      text += `📊 Maydon: Pol: ${geo.floorArea} m² | Devor: ${geo.netWallArea} m² | Shift: ${geo.ceilingArea} m²\n\n`;
      
      text += `🧱 MATERIALLAR:\n`;
      est.materials.forEach((m) => {
        if (!m.isExcluded) {
          text += `• ${m.name}: ${m.packagesCount} ${m.unit} (${formatUZS(m.totalPrice)})\n`;
        }
      });
      
      text += `\n💵 Materiallar: ${formatUZS(est.materialsTotal)}\n`;
      if (isMasterMode && est.laborTotal > 0) {
        text += `👷‍♂️ Usta xizmati: ${formatUZS(est.laborTotal)}\n`;
      }
      text += `═══════════════════════\n`;
      text += `💰 JAMI XONA SMETASI: ${formatUZS(est.grandTotal)}\n\n`;
      text += `👤 Usta / Brend: ${brandName} (${masterPhone})\n`;
      text += `🤖 @Smeta24Bot orqali hisoblandi`;
    }

    const copyFallback = (t: string) => {
      try {
        const el = document.createElement("textarea");
        el.value = t;
        el.style.position = "fixed";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        triggerNotificationHaptic("success");
        showQuickToast("📋 Smeta nusxalandi! Chatga tashlashingiz mumkin.");
      } catch (err) {
        showQuickToast("❌ Nusxalashda xatolik yuz berdi");
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        triggerNotificationHaptic("success");
        showQuickToast("📋 Smeta nusxalandi! Telegram/WhatsApp ga tashlashingiz mumkin.");
      }).catch(() => {
        copyFallback(text);
      });
    } else {
      copyFallback(text);
    }
  };

  const handleResetActiveRoom = () => {
    if (confirm(`"${activeRoom?.input.roomName}" o'lchamlarini tozalaysizmi?`)) {
      triggerHaptic("medium");
      updateRoomInput(activeRoomId, {
        length: 0,
        width: 0,
        height: 2.8,
        openingsArea: 0,
      });
      showQuickToast("🧹 Xona o'lchamlari tozalandi");
    }
  };

  const toggleMaterialExclusion = (roomId: string, materialCode: string) => {
    triggerHaptic("light");
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const currentExcluded = r.input.excludedMaterialCodes || [];
        const isAlreadyExcluded = currentExcluded.includes(materialCode);
        const updatedExcluded = isAlreadyExcluded
          ? currentExcluded.filter((c) => c !== materialCode)
          : [...currentExcluded, materialCode];
        
        showQuickToast(isAlreadyExcluded ? "Material qo'shildi ✅" : "Material olib tashlandi ❌");
        return {
          ...r,
          input: {
            ...r.input,
            excludedMaterialCodes: updatedExcluded,
          },
        };
      })
    );
  };

  // ===== HELPERS =====
  const showQuickToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(""), 2000);
  };

  const updateMasterRate = (key: string, val: number) => {
    setMasterRates((prev) => {
      const updated = { ...prev, [key]: val };
      try { localStorage.setItem("smeta24_master_rates", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    showQuickToast("Usta narxi saqlandi ✅");
  };

  const updateMaterialPrice = (key: string, val: number) => {
    setMaterialPrices((prev) => {
      const updated = { ...prev, [key]: val };
      try { localStorage.setItem("smeta24_material_prices", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    showQuickToast("Material narxi saqlandi ✅");
  };

  const resetRatesToDefault = () => {
    triggerHaptic("medium");
    setMasterRates(initialLaborRates);
    try { localStorage.removeItem("smeta24_master_rates"); } catch (e) {}
    showQuickToast("Standart narxlar tiklandi 🔄");
  };

  const resetMaterialsToDefault = () => {
    triggerHaptic("medium");
    setMaterialPrices(initialMaterialPrices);
    try { localStorage.removeItem("smeta24_material_prices"); } catch (e) {}
    showQuickToast("Standart narxlar tiklandi 🔄");
  };

  // ===== UNLOCK / PDF =====
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

  // ===== LID-BIRJA =====
  const filteredLeads = useMemo(() => {
    return leadsList.filter((ld) => {
      const matchRegion = selectedLeadRegion === "Barchasi" || ld.region === selectedLeadRegion;
      const matchType = selectedLeadType === "Barchasi" ||
        (selectedLeadType === "materials_order" && ld.lead_type === "materials_order") ||
        (selectedLeadType === "need_master" && ld.lead_type === "need_master");
      return matchRegion && matchType;
    });
  }, [leadsList, selectedLeadRegion, selectedLeadType]);

  const fetchLeads = async () => {
    try {
      setIsLoadingLeads(true);
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://smeta24-backend.onrender.com";
      const uid = tgUser?.id || (typeof window !== "undefined" && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) || 0;
      const res = await fetch(`${backendUrl}/api/v1/leads?user_id=${uid}`);
      if (res.ok) {
        const data = await res.json();
        if (data.leads && Array.isArray(data.leads)) setLeadsList(data.leads);
      }
    } catch (err) {
      console.warn("Lidlarni serverdan yuklashda ogohlantirish:", err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  useEffect(() => { if (activeTab === "leads") fetchLeads(); }, [activeTab]);

  const handleBuyLead = async (leadId: string, price: number) => {
    if (userBalance < price) {
      triggerNotificationHaptic("warning");
      setShowTopupModal(true);
      return;
    }
    try {
      triggerHaptic("medium");
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://smeta24-backend.onrender.com";
      const uid = tgUser?.id || (typeof window !== "undefined" && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) || 12345678;
      const res = await fetch(`${backendUrl}/api/v1/leads/${leadId}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: uid }),
      });
      const data = await res.json();
      if (res.ok && data.status === "purchased") {
        triggerNotificationHaptic("success");
        setUserBalance((prev) => Math.max(0, prev - price));
        setLeadsList((prev) => prev.map((ld) =>
          ld.id === leadId ? { ...ld, isPurchased: true, contact: `${data.client_phone} (${data.client_name || "Mijoz"})`, phone_raw: data.client_phone, client_name: data.client_name } : ld
        ));
        setSaveToast(`✅ Lid ochildi! Mijoz telefoni: ${data.client_phone}`);
        setTimeout(() => setSaveToast(""), 4000);
      } else {
        throw new Error(data.detail || "Lidni sotib olishda xatolik yuz berdi");
      }
    } catch (err: any) {
      console.error("Lid sotib olishda xato:", err);
      triggerNotificationHaptic("error");
      setSaveToast(`❌ ${err?.message || "Xatolik yuz berdi"}`);
      setTimeout(() => setSaveToast(""), 4000);
    }
  };

  const handleCreateLead = async () => {
    const rawDigits = clientPhone.replace(/\D/g, "");
    if (rawDigits.length < 9) {
      triggerNotificationHaptic("warning");
      alert("Iltimos, to'liq telefon raqamingizni kiriting!");
      return;
    }
    try {
      setIsSubmittingLead(true);
      triggerHaptic("medium");
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://smeta24-backend.onrender.com";
      const estimate = activeRoomEstimate?.estimate;
      const res = await fetch(`${backendUrl}/api/v1/leads/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_phone: clientPhone,
          client_name: leadClientName || tgUser?.first_name || "Mijoz",
          region: clientRegion,
          room_name: activeRoom?.input.roomName || "Xona",
          area: estimate?.geometry.totalWorkArea || 0,
          materials_total: estimate?.materialsTotal || 0,
          labor_total: estimate?.laborTotal || 0,
          grand_total: projectSummary.projectGrandTotal,
          lead_type: leadOrderType,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === "published") {
        triggerNotificationHaptic("success");
        setLeadSubmitted(true);
        fetchLeads();
      } else {
        throw new Error(data.detail || "Buyurtmani yuborishda xatolik yuz berdi");
      }
    } catch (err: any) {
      console.error("Lid yaratishda xato:", err);
      triggerNotificationHaptic("error");
      alert(err?.message || "Server bilan bog'lanishda xatolik");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // PDF
  const handleSendPdfToTelegram = async () => {
    setIsSendingPdf(true);
    setPdfStatusMsg("");
    triggerHaptic("medium");
    const chatId = tgUser?.id || (typeof window !== "undefined" && window.Telegram?.WebApp?.initDataUnsafe?.user?.id);
    if (!chatId) {
      triggerNotificationHaptic("warning");
      setPdfStatusMsg("⚠️ Telegram ID aniqlanmadi. Iltimos, ushbu ilovani @Smeta24Bot orqali oching.");
      setIsSendingPdf(false);
      return;
    }
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://smeta24-backend.onrender.com";
      // Barcha xonalar materiallarini birlashtirish (olib tashlangan materiallarsiz)
      const materialsPayload = projectSummary.combinedMaterials
        .filter((m) => !m.isExcluded)
        .map((m) => ({
          name: m.name,
          exact: m.exactUnitStr,
          packages: `${m.packagesCount} ${m.unit}`,
          price_formatted: formatUZS(m.unitPrice),
          total_formatted: formatUZS(m.totalPrice),
        }));
      const laborPayload = projectSummary.combinedLabor.map((l) => ({
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
          room_name: rooms.length > 1
            ? `${rooms.length} ta xona (${rooms.map(r => r.input.roomName).join(', ')})`
            : rooms[0]?.input.roomName || "Xona",
          length: activeRoom?.input.length || 0,
          width: activeRoom?.input.width || 0,
          height: activeRoom?.input.height || 0,
          total_area: projectSummary.totalWorkArea,
          brand_name: brandName,
          master_phone: masterPhone,
          materials: materialsPayload,
          labor_items: laborPayload,
          materials_total: formatUZS(projectSummary.materialsGrandTotal),
          labor_total: formatUZS(projectSummary.laborGrandTotal),
          grand_total: formatUZS(projectSummary.projectGrandTotal),
        }),
      });
      const data = await res.json();
      if (res.ok && (data.ok || data.success)) {
        triggerNotificationHaptic("success");
        setPdfStatusMsg("✅ PDF-smeta Telegram xabaringizga yuborildi! Chatga o'tib ko'rishingiz mumkin.");
        setTimeout(() => { setShowPdfModal(false); setPdfStatusMsg(""); }, 3000);
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

  const handlePrintPdf = () => { triggerHaptic("light"); window.print(); };

  const handleTopup = (amount: number) => {
    triggerNotificationHaptic("success");
    setUserBalance((prev) => prev + amount);
    setShowTopupModal(false);
  };

  const roomColor = ROOM_COLORS[activeRoomIndex % ROOM_COLORS.length] || ROOM_COLORS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* STICKY TOP APP HEADER */}
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
        <button
          onClick={() => { triggerHaptic("light"); setShowTopupModal(true); }}
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

      {/* Toast */}
      {saveToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-full shadow-lg animate-in fade-in slide-in-from-top-2">
          {saveToast}
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {activeTab === "calc" && (
          <>
            {/* ===== LOYIHA BOSHQARUVI BAR ===== */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-md flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                    <span>Loyiha:</span>
                    <span className="text-amber-400 font-semibold">{rooms.length} ta xona</span>
                  </div>
                  <h3 className="text-xs font-bold text-white truncate max-w-[130px]" title={currentProjectName}>
                    {currentProjectName}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => { triggerHaptic("light"); setShowProjectsModal(true); }}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition active:scale-95"
                >
                  <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Smetalarim</span>
                  {savedProjects.length > 0 && (
                    <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full ml-0.5">
                      {savedProjects.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    triggerHaptic("medium");
                    setProjectNameInput(currentProjectName);
                    setShowSaveProjectModal(true);
                  }}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-xl shadow-sm shadow-emerald-600/20 transition active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Saqlash</span>
                </button>
              </div>
            </div>

            {/* ===== KO'P XONALI TABLAR ===== */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-md space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-amber-400" />
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Xonalar ({rooms.length})
                  </h2>
                </div>
                <button
                  onClick={addRoom}
                  disabled={rooms.length >= 8}
                  className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-[11px] px-3 py-1.5 rounded-xl shadow-sm transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Xona qo&apos;shish</span>
                </button>
              </div>

              {/* Horizontal scrollable room tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {rooms.map((room, idx) => {
                  const color = ROOM_COLORS[idx % ROOM_COLORS.length];
                  const isActive = room.id === activeRoomId && !showSummary;
                  const roomEst = roomEstimates.find((r) => r.id === room.id);
                  return (
                    <button
                      key={room.id}
                      onClick={() => {
                        triggerHaptic("light");
                        setActiveRoomId(room.id);
                        setShowSummary(false);
                      }}
                      className={`flex-shrink-0 px-3 py-2 rounded-xl border transition-all duration-200 min-w-[120px] text-left relative group ${
                        isActive
                          ? `bg-gradient-to-br ${color.bg} ${color.border} shadow-md ring-1 ring-white/10`
                          : "bg-slate-950 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {/* X tugma */}
                      {rooms.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeRoom(room.id); }}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-800 hover:bg-rose-500 border border-slate-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      )}
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${isActive ? color.activeBg : "bg-slate-700"}`} />
                        <span className={`text-xs font-bold truncate max-w-[80px] ${isActive ? color.text : "text-slate-300"}`}>
                          {room.input.roomName}
                        </span>
                      </div>
                      <p className={`text-[9.5px] mt-0.5 ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                        {roomEst ? formatUZS(roomEst.estimate.grandTotal) : "—"}
                      </p>
                    </button>
                  );
                })}

                {/* UMUMIY SMETA TAB */}
                {rooms.length > 1 && (
                  <button
                    onClick={() => {
                      triggerHaptic("medium");
                      setShowSummary(true);
                    }}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl border transition-all duration-200 min-w-[120px] text-left ${
                      showSummary
                        ? "bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/50 shadow-md ring-1 ring-amber-500/20"
                        : "bg-slate-950 border-slate-800 hover:border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className={`w-3 h-3 ${showSummary ? "text-amber-400" : "text-slate-500"}`} />
                      <span className={`text-xs font-bold ${showSummary ? "text-amber-400" : "text-slate-400"}`}>
                        Umumiy
                      </span>
                    </div>
                    <p className={`text-[9.5px] mt-0.5 font-bold ${showSummary ? "text-amber-300" : "text-slate-500"}`}>
                      {formatUZS(projectSummary.projectGrandTotal)}
                    </p>
                  </button>
                )}
              </div>

              {/* Xona uchun tezkor amallar */}
              {!showSummary && activeRoom && (
                <div className="flex items-center gap-3 border-t border-slate-800/60 pt-2">
                  <button
                    onClick={() => handleCopyTextEstimate('room')}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-amber-400 transition"
                    title="Xona smetasini Telegram/WhatsApp uchun nusxalash"
                  >
                    <Copy className="w-3 h-3 text-amber-400" />
                    <span>Matn nusxa</span>
                  </button>
                  <button
                    onClick={() => duplicateRoom(activeRoomId)}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-sky-400 transition"
                  >
                    <Copy className="w-3 h-3 text-sky-400" />
                    <span>Nusxalash</span>
                  </button>
                  <button
                    onClick={handleResetActiveRoom}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-orange-400 transition"
                    title="O'lchamlarni tozalash"
                  >
                    <RotateCcw className="w-3 h-3 text-orange-400" />
                    <span>Tozalash</span>
                  </button>
                  {rooms.length > 1 && (
                    <button
                      onClick={() => removeRoom(activeRoomId)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3 h-3 text-rose-400" />
                      <span>O&apos;chirish</span>
                    </button>
                  )}
                  <div className="ml-auto text-[10px] text-slate-500">
                    {activeRoomIndex + 1}/{rooms.length}
                  </div>
                </div>
              )}
            </div>

            {/* ===== UMUMIY SMETA KO'RINISHI ===== */}
            {showSummary ? (
              <section className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 space-y-4 shadow-xl shadow-amber-500/5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      Umumiy Loyiha Smetasi
                    </h2>
                  </div>
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                    {rooms.length} xona • {projectSummary.totalWorkArea} m²
                  </span>
                </div>

                {/* Xonalar bo'yicha statistika */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    Xonalar bo&apos;yicha taqsimot:
                  </span>
                  {projectSummary.roomBreakdown.map((rb, idx) => {
                    const color = ROOM_COLORS[idx % ROOM_COLORS.length];
                    return (
                      <div
                        key={rb.roomId}
                        className={`bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${color.activeBg}`} />
                          <div>
                            <p className="text-xs font-bold text-white">{rb.roomName}</p>
                            <p className="text-[10px] text-slate-400">{rb.floorArea} m² pol maydoni</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-amber-400">{formatUZS(rb.grandTotal)}</p>
                          <p className="text-[9px] text-slate-500">
                            Mat: {formatUZS(rb.materialsTotal)} • Ish: {formatUZS(rb.laborTotal)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Umumiy geometrik ko'rsatkichlar */}
                <div className="bg-slate-950 rounded-xl p-3 grid grid-cols-3 text-center border border-slate-800/80 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-400 block">Umumiy pol</span>
                    <span className="text-xs font-bold text-emerald-400">{projectSummary.totalFloorArea} m²</span>
                  </div>
                  <div className="border-x border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Umumiy devor</span>
                    <span className="text-xs font-bold text-sky-400">{projectSummary.totalWallArea} m²</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Umumiy shift</span>
                    <span className="text-xs font-bold text-violet-400">{projectSummary.totalCeilingArea} m²</span>
                  </div>
                </div>

                {/* Umumiy summalar */}
                <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Materiallar umumiy summasi ({rooms.length} xona):</span>
                    <span className="font-bold text-white">{formatUZS(projectSummary.materialsGrandTotal)}</span>
                  </div>
                  {isMasterMode && (
                    <div className="flex justify-between text-slate-300">
                      <span>Usta ish haqi jami:</span>
                      <span className="font-bold text-emerald-400">{formatUZS(projectSummary.laborGrandTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-amber-400 pt-2 border-t border-slate-800/80">
                    <span>LOYIHA BUDJETI:</span>
                    <span className="text-base">{formatUZS(projectSummary.projectGrandTotal)}</span>
                  </div>
                </div>

                {/* PDF va Buyurtma tugmalari */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCopyTextEstimate('project')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs py-3 px-4 rounded-xl border border-amber-500/40 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                  >
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>📋 Telegram / WhatsApp uchun smetani nusxalash</span>
                  </button>
                  <button
                    type="button"
                    onClick={isUnlocked ? () => setShowPdfModal(true) : handleUnlockPdf}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                  >
                    <FileText className="w-4 h-4 text-slate-950" />
                    <span>{isUnlocked ? "Tayyor Brendli PDF-Smetani ko'rish" : "📄 Brendli PDF-Smetani olish (5 000 so'm)"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { triggerHaptic("light"); setShowLeadModal(true); }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-3 px-4 rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                    <span>🛒 Materiallarni ulgurji narxda buyurtma qilish (Bepul)</span>
                  </button>
                </div>
              </section>
            ) : (
              <>
                {/* ===== TANLANGAN XONA FORMI ===== */}
                {activeRoom && activeRoomEstimate && (
                  <RoomInputForm
                    input={activeRoom.input}
                    onUpdate={(updates) => updateRoomInput(activeRoomId, updates)}
                    estimate={activeRoomEstimate.estimate}
                    isUnlocked={isUnlocked}
                    onUnlock={handleUnlockPdf}
                    isMasterMode={isMasterMode}
                    roomColor={roomColor}
                  />
                )}

                {/* MATERIAL SEGMENTI & USTA PRO */}
                <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                        ⚙️
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          Material Segmenti &amp; Usta PRO
                        </h2>
                        <p className="text-[10px] text-slate-400">Brending va shaxsiy narxlar boshqaruvi</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isMasterMode}
                      onChange={(e) => { triggerHaptic("light"); setIsMasterMode(e.target.checked); }}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">Materiallar segmenti:</span>
                    <div className="flex items-center gap-1">
                      {(["econom", "standard", "premium"] as QualityTier[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => { triggerHaptic("light"); setTier(t); }}
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
                            onChange={(e) => { setBrandName(e.target.value); localStorage.setItem("smeta24_brand_name", e.target.value); }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-500 outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Telefon raqamingiz</label>
                          <input
                            type="text"
                            value={masterPhone}
                            onChange={(e) => { setMasterPhone(e.target.value); localStorage.setItem("smeta24_master_phone", e.target.value); }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-500 outline-none font-medium"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { triggerHaptic("light"); setActiveTab("profile"); }}
                        className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl p-2.5 text-xs font-semibold text-amber-400 flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-amber-400" />
                          <span>Usta va Tuman material narxlarini sozlash</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Profilga o&apos;tish →</span>
                      </button>
                    </div>
                  )}
                </section>

                {/* SMETA NATIJALARI (Joriy xona) */}
                {activeRoomEstimate && (
                  <section className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 space-y-3.5 shadow-xl shadow-amber-500/5 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <h2 className="text-sm font-bold text-white tracking-tight">
                          {activeRoom?.input.roomName || "Xona"} — Smeta
                        </h2>
                      </div>
                      <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                        {activeRoomEstimate.estimate.geometry.totalWorkArea} m²
                      </span>
                    </div>

                    {/* Materiallar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                          Talab qilinadigan materiallar ({activeRoomEstimate.estimate.materials.length} ta):
                        </span>
                        <span className="text-[9.5px] text-slate-500 font-medium">
                          (O&apos;chirish uchun bosing)
                        </span>
                      </div>
                      {activeRoomEstimate.estimate.materials.map((item, idx) => {
                        const isExcluded = item.isExcluded;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition duration-150 ${
                              isExcluded
                                ? "bg-slate-950/40 border-slate-800/50 opacity-60"
                                : "bg-slate-950 border-slate-800/80 hover:border-slate-700"
                            }`}
                          >
                            {/* Toggle tugmasi */}
                            <button
                              type="button"
                              onClick={() => toggleMaterialExclusion(activeRoomId, item.code)}
                              className="mr-2.5 flex-shrink-0 text-slate-400 hover:text-white transition active:scale-90"
                              title={isExcluded ? "Smetaga qayta qo'shish" : "Smetadan chiqarib tashlash (Menda bor)"}
                            >
                              {isExcluded ? (
                                <div className="w-5 h-5 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-600">
                                  <X className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-lg border border-emerald-500/50 bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </div>
                              )}
                            </button>

                            <div className="pr-2 min-w-0 flex-1">
                              <p className={`font-semibold leading-snug truncate ${isExcluded ? "line-through text-slate-500" : "text-slate-200"}`}>
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-[10px] text-slate-400">
                                  Sof sarf: <span className="text-slate-300 font-medium">{item.exactUnitStr}</span>
                                </span>
                                {/* Inline narxni tahrirlash tugmasi */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerHaptic("light");
                                    setEditingMaterial({
                                      code: item.code,
                                      name: item.name,
                                      currentPrice: item.unitPrice,
                                      unit: item.unit,
                                    });
                                    setEditPriceInput(item.unitPrice);
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 transition active:scale-95"
                                  title="Bozor narxini o'zgartirish"
                                >
                                  <Pencil className="w-2.5 h-2.5" />
                                  <span>{formatUZS(item.unitPrice)}</span>
                                </button>
                                {isExcluded && (
                                  <span className="text-[9px] bg-rose-500/15 text-rose-400 px-1.5 py-0.2 rounded font-medium border border-rose-500/30">
                                    Uyda bor / Kerak emas
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              {isUnlocked ? (
                                <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                                  isExcluded
                                    ? "bg-slate-900 text-slate-500 border border-slate-800 line-through"
                                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                }`}>
                                  {!isExcluded && <CheckCircle2 className="w-3 h-3" />}
                                  {item.packagesCount} {item.unit}
                                </span>
                              ) : (
                                <div onClick={handleUnlockPdf} className="cursor-pointer group relative inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-2 py-0.5 rounded transition">
                                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                                  <span className="blur-[3.5px] select-none text-[11px]">{item.packagesCount} {item.unit}</span>
                                </div>
                              )}
                              <p className={`text-[11px] font-bold mt-0.5 ${isExcluded ? "text-slate-500 line-through" : "text-slate-300"}`}>
                                {isExcluded ? "0 so'm" : formatUZS(item.totalPrice)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Usta xizmati */}
                    {isMasterMode && activeRoomEstimate.estimate.laborItems.length > 0 && (
                      <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 space-y-1.5 text-xs">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                          Bajariladigan ishlar:
                        </span>
                        {activeRoomEstimate.estimate.laborItems.map((lab) => (
                          <div key={lab.id} className="flex justify-between text-slate-300 text-[11px]">
                            <span>{lab.name}:</span>
                            <span className="font-medium text-emerald-400">{formatUZS(lab.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Jami (joriy xona) */}
                    <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Materiallar summasi:</span>
                        <span className="font-bold text-white">{formatUZS(activeRoomEstimate.estimate.materialsTotal)}</span>
                      </div>
                      {isMasterMode && (
                        <div className="flex justify-between text-slate-300">
                          <span>Usta ish haqi:</span>
                          <span className="font-bold text-emerald-400">{formatUZS(activeRoomEstimate.estimate.laborTotal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-black text-amber-400 pt-2 border-t border-slate-800/80">
                        <span>{activeRoom?.input.roomName} JAMI:</span>
                        <span className="text-base">{formatUZS(activeRoomEstimate.estimate.grandTotal)}</span>
                      </div>
                    </div>

                    {/* Umumiy loyiha summasi (multi-room) */}
                    {rooms.length > 1 && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-1 text-xs">
                        <div className="flex justify-between text-amber-300 font-bold">
                          <span>📊 BUTUN LOYIHA ({rooms.length} xona):</span>
                          <span className="text-sm">{formatUZS(projectSummary.projectGrandTotal)}</span>
                        </div>
                        <button
                          onClick={() => { triggerHaptic("light"); setShowSummary(true); }}
                          className="text-[10px] text-amber-400 underline hover:text-amber-300"
                        >
                          Batafsil ko&apos;rish →
                        </button>
                      </div>
                    )}

                    {/* Tugmalar */}
                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={isUnlocked ? () => setShowPdfModal(true) : handleUnlockPdf}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                      >
                        <FileText className="w-4 h-4 text-slate-950" />
                        <span>{isUnlocked ? "Tayyor Brendli PDF-Smetani ko'rish" : "📄 PDF-Smeta (5 000 so'm)"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { triggerHaptic("light"); setShowLeadModal(true); }}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-3 px-4 rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                        <span>🛒 Materiallarni ulgurji narxda buyurtma qilish</span>
                      </button>
                    </div>
                  </section>
                )}

                {/* Dastur muallifi */}
                <div className="text-center py-1 text-[10.5px] text-slate-500">
                  Smeta24 © 2026 • Dastur muallifi:{" "}
                  <span className="text-amber-400 font-bold">Nurmurodov Damirjon</span>
                </div>
              </>
            )}
          </>
        )}

        {/* ===== PROFIL TAB ===== */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 mx-auto flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20">
                {brandName ? brandName[0] : "U"}
              </div>
              <h2 className="font-bold text-base text-white">{brandName}</h2>
              <p className="text-xs text-slate-400">📞 {masterPhone} • {tgUser?.username ? `@${tgUser.username}` : "@Smeta24Bot"}</p>
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-xs px-3 py-1 rounded-full font-bold border border-amber-500/30">
                ⭐ Professional Usta &amp; Narxlar Paneli
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-3.5 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Hamyon balansi:</span>
                <span className="text-base font-black text-emerald-400">{userBalance.toLocaleString("ru-RU")} so&apos;m</span>
              </div>
              <button
                onClick={() => { triggerHaptic("medium"); setShowTopupModal(true); }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3 py-2 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-slate-950" />
                <span>To&apos;ldirish</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => { triggerHaptic("light"); setProfileSubTab("rates"); }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    profileSubTab === "rates" ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Usta xizmat haqi</span>
                </button>
                <button
                  onClick={() => { triggerHaptic("light"); setProfileSubTab("materials"); }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    profileSubTab === "materials" ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Tuman material narxi</span>
                </button>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                {["Barchasi", "Shift", "Devor", "Pol"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProfileCategoryFilter(cat)}
                    className={`px-2.5 py-0.8 rounded-lg text-[10px] font-bold whitespace-nowrap transition border ${
                      profileCategoryFilter === cat
                        ? "bg-slate-800 text-amber-400 border-amber-500/40"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {profileSubTab === "rates" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                    <span>1 m² uchun usta mehnat haqi:</span>
                    <button onClick={resetRatesToDefault} className="text-amber-400 hover:text-amber-300 text-[10px] flex items-center gap-1 font-semibold">
                      <RotateCcw className="w-3 h-3" /><span>Standartga qaytarish</span>
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-0.5">
                    {CONFIGURABLE_LABOR_RATES.filter((r) => profileCategoryFilter === "Barchasi" || r.category === profileCategoryFilter).map((rateItem) => (
                      <div key={rateItem.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                        <div className="min-w-0 pr-1">
                          <p className="text-xs font-semibold text-slate-200 truncate">{rateItem.name}</p>
                          <span className="text-[9px] text-amber-400/80 font-medium">{rateItem.category} • {rateItem.unit}</span>
                        </div>
                        <div className="w-28 shrink-0 relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={masterRates[rateItem.id] ?? rateItem.defaultRate}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => { const val = parseInt(e.target.value.replace(/\D/g, "")) || 0; updateMasterRate(rateItem.id, val); }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-right font-black text-amber-300 focus:border-amber-400 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profileSubTab === "materials" && (
                <div className="space-y-2">
                  <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-[10.5px] text-slate-300 leading-snug">
                    💡 <strong>Eslatma:</strong> Har bir tuman va viloyat bozorida materiallar narxi har xil. Bu yerga o&apos;zingiz xarid qiladigan narxlarni kiritsangiz, kalkulyator aynan shu narxlar bilan hisoblab beradi.
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                    <span>Do&apos;kon / Bozor narxlari:</span>
                    <button onClick={resetMaterialsToDefault} className="text-amber-400 hover:text-amber-300 text-[10px] flex items-center gap-1 font-semibold">
                      <RotateCcw className="w-3 h-3" /><span>Standartga qaytarish</span>
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-0.5">
                    {CONFIGURABLE_MATERIALS.filter((m) => profileCategoryFilter === "Barchasi" || m.category === profileCategoryFilter).map((matItem) => (
                      <div key={matItem.code} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                        <div className="min-w-0 pr-1">
                          <p className="text-xs font-semibold text-slate-200 truncate">{matItem.name}</p>
                          <span className="text-[9px] text-sky-400/80 font-medium">{matItem.category} • 1 {matItem.unit} narxi</span>
                        </div>
                        <div className="w-28 shrink-0 relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={materialPrices[matItem.code] ?? matItem.defaultPrice}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => { const val = parseInt(e.target.value.replace(/\D/g, "")) || 0; updateMaterialPrice(matItem.code, val); }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-right font-black text-emerald-300 focus:border-amber-400 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5">
              <p className="font-bold text-slate-200">Smeta24 Tizimi Haqida:</p>
              <p>O&apos;zbekiston bo&apos;ylab qurilish va ta&apos;mir smetalarini avtomatlashtirilgan hisoblash platformasi.</p>
              <p className="pt-2 text-[11px] text-slate-500">
                Dastur arxitekturasi va dizayni: <span className="text-amber-400 font-bold">Nurmurodov Damirjon</span>
              </p>
            </div>
          </div>
        )}

        {/* ===== LEADS TAB ===== */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <h2 className="font-bold text-sm text-white">Buyurtmalar Birjasi (Lidlar)</h2>
                  <span className="bg-amber-500/15 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    {filteredLeads.length} ta faol
                  </span>
                </div>
                <button type="button" onClick={fetchLeads} disabled={isLoadingLeads} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 border border-slate-700/60" title="Yangilash">
                  <RefreshCw className={`w-4 h-4 ${isLoadingLeads ? "animate-spin text-amber-400" : ""}`} />
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mijozlar tomonidan qoldirilgan tekshirilgan ta&apos;mir va material buyurtmalari.
              </p>
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {["Barchasi", "Toshkent shahri", "Samarqand", "Farg'ona"].map((reg) => (
                    <button key={reg} type="button" onClick={() => { triggerHaptic("light"); setSelectedLeadRegion(reg); }}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition whitespace-nowrap ${selectedLeadRegion === reg ? "bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30" : "bg-slate-800/80 text-slate-400 hover:text-white"}`}
                    >{reg}</button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => { triggerHaptic("light"); setSelectedLeadType("Barchasi"); }}
                    className={`text-[9.5px] font-semibold px-2 py-0.5 rounded transition ${selectedLeadType === "Barchasi" ? "bg-slate-700 text-white border border-slate-600" : "text-slate-400 hover:text-slate-200"}`}
                  >Barcha turlar</button>
                  <button type="button" onClick={() => { triggerHaptic("light"); setSelectedLeadType("materials_order"); }}
                    className={`text-[9.5px] font-semibold px-2 py-0.5 rounded transition ${selectedLeadType === "materials_order" ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" : "text-slate-400 hover:text-slate-200"}`}
                  >📦 Materiallar</button>
                  <button type="button" onClick={() => { triggerHaptic("light"); setSelectedLeadType("need_master"); }}
                    className={`text-[9.5px] font-semibold px-2 py-0.5 rounded transition ${selectedLeadType === "need_master" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "text-slate-400 hover:text-slate-200"}`}
                  >🔨 Usta kerak</button>
                </div>
              </div>
            </div>

            {isLoadingLeads && leadsList.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto" />
                <p className="text-xs text-slate-400">Birjadagi yangi buyurtmalar yuklanmoqda...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
                <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">Ushbu filtr bo&apos;yicha buyurtmalar topilmadi</p>
                <p className="text-[11px] text-slate-500">Boshqa viloyatni tanlang yoki yuqoridagi yangilash tugmasini bosing</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{lead.region}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${lead.lead_type === "materials_order" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                          {lead.lead_type === "materials_order" ? "📦 Ulgurji material" : "🔨 Usta kerak"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">{lead.date}</span>
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
                      <div className="space-y-2">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-400 font-bold flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{lead.contact}</span>
                          </div>
                          <span className="text-[9.5px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold">Ochilgan</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <a href={`tel:${lead.phone_raw || lead.contact.replace(/[^\d+]/g, "")}`}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 text-center">
                            <Phone className="w-3.5 h-3.5 text-slate-950" /><span>Qo&apos;ng&apos;iroq qilish</span>
                          </a>
                          <a href={`https://t.me/${lead.phone_raw ? lead.phone_raw.replace(/[^\d]/g, "") : ""}`} target="_blank" rel="noreferrer"
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition active:scale-95 text-center">
                            <ExternalLink className="w-3.5 h-3.5 text-amber-400" /><span>Telegram</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => handleBuyLead(lead.id, lead.price)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs py-2.5 rounded-xl border border-amber-500/30 flex items-center justify-center gap-1.5 transition active:scale-95">
                        <Unlock className="w-3.5 h-3.5" />
                        <span>🔓 Kontaktni ochish ({lead.price.toLocaleString("ru-RU")} so&apos;m)</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== GUIDE TAB ===== */}
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
                { name: "Gipskarton Knauf 9.5mm (1.2x2.5m)", norm: "1 list = 3.0 m²", pack: "Dona (52 000 so'm)" },
                { name: "Profil UD 28/27 & CD 60/27", norm: "1 m² shiftga ~2.6-3.8 m", pack: "3 metrli rezon (18-26 ming)" },
                { name: "Laminat 33-klass (faskali)", norm: "+7% kesishga zapas", pack: "2.13 m² pachka (~255 ming)" },
                { name: "Parket / Inzhenernaya doska", norm: "+10% burchaklarga zapas", pack: "1 m² (~280 000 so'm)" },
                { name: "2-komponentli parket yelimi", norm: "1 kg = ~0.8 m² pol", pack: "14 kg paqir (~420 000 so'm)" },
                { name: "Pol steshkasi (5 sm styajka)", norm: "0.4 qop tsement / m²", pack: "50 kg qop M400 (~45 000)" },
                { name: "Nalivnoy pol samonivelir", norm: "1.5 kg / mm / m²", pack: "25 kg qop (~65 000 so'm)" },
                { name: "Vinil / Flizelin oboy", norm: "1 rulon = ~10 m² devor", pack: "1.06m x 10m (~180 000)" },
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

      {/* ===== MODAL: PDF ===== */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Rasmiy A4 PDF-Smeta</h3>
              </div>
              <button onClick={() => setShowPdfModal(false)} className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white text-slate-950 p-4 rounded-xl shadow-inner font-sans text-[11px] space-y-3 border border-slate-300">
              <div className="border-b-2 border-amber-500 pb-2 flex justify-between items-start">
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wide text-slate-900">{brandName}</h4>
                  <p className="text-[10px] text-slate-600 font-semibold">📞 Mas&apos;ul: {masterPhone}</p>
                </div>
                <div className="text-right text-[10px]">
                  <span className="bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded text-[9px]">
                    RASMIY SMETA #{rooms.length} XONA
                  </span>
                  <p className="text-slate-500 mt-1">
                    {rooms.map(r => r.input.roomName).join(', ')}
                  </p>
                </div>
              </div>

              {/* Xonalar bo'yicha */}
              {projectSummary.roomBreakdown.map((rb, idx) => (
                <div key={rb.roomId} className="bg-slate-50 p-2 rounded border border-slate-200">
                  <p className="font-bold text-[10px] text-slate-800">{rb.roomName} — {rb.floorArea} m²</p>
                  <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
                    <span>Materiallar: {formatUZS(rb.materialsTotal)}</span>
                    <span>Ish haqi: {formatUZS(rb.laborTotal)}</span>
                    <span className="font-bold text-amber-700">Jami: {formatUZS(rb.grandTotal)}</span>
                  </div>
                </div>
              ))}

              {/* Jami */}
              <div className="bg-amber-50 p-2 rounded border border-amber-300 flex justify-between items-center font-black text-xs text-slate-900">
                <span>UMUMIY LOYIHA BUDJETI:</span>
                <span>{formatUZS(projectSummary.projectGrandTotal)}</span>
              </div>

              <div className="text-center text-[8.5px] text-slate-500 pt-1">
                Smeta24 (@Smeta24Bot) • Dastur muallifi: <strong>Nurmurodov Damirjon</strong> • QR-kod bilan tasdiqlangan
              </div>
            </div>

            {pdfStatusMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold text-center leading-snug animate-in fade-in ${pdfStatusMsg.startsWith("✅") ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40" : "bg-rose-500/15 text-rose-400 border border-rose-500/40"}`}>
                {pdfStatusMsg}
              </div>
            )}

            <div className="space-y-2">
              <button type="button" disabled={isSendingPdf} onClick={handleSendPdfToTelegram}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-[0.98]">
                {isSendingPdf ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-slate-950" /><span>PDF tayyorlanib, chatga yuborilmoqda...</span></>
                ) : (
                  <><Send className="w-4 h-4 text-slate-950" /><span>📨 PDF-ni Telegram Chatga yuborish</span></>
                )}
              </button>
              <button type="button" onClick={() => handleCopyTextEstimate(showSummary ? 'project' : 'room')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-amber-500/30 transition active:scale-[0.98]">
                <Copy className="w-3.5 h-3.5 text-amber-400" /><span>📋 Matn ko&apos;rinishida nusxalash (Chat uchun)</span>
              </button>
              <button type="button" onClick={handlePrintPdf}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition active:scale-[0.98]">
                <Printer className="w-3.5 h-3.5 text-amber-400" /><span>🖨️ Chop etish / Qurilmaga saqlash</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: LEAD ===== */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Ulgurji Narxda Buyurtma</h3>
              </div>
              <button onClick={() => { setShowLeadModal(false); setLeadSubmitted(false); }} className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            {leadSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-white">Buyurtmangiz qabul qilindi!</h4>
                <p className="text-xs text-slate-400">Hamkor qurilish do&apos;konlari tez orada siz bilan bog&apos;lanadi.</p>
                <button onClick={() => { setShowLeadModal(false); setLeadSubmitted(false); }} className="bg-slate-800 text-white text-xs font-bold py-2 px-6 rounded-xl">Yopish</button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Ushbu buyurtmani birjaga e&apos;lon qiling:</p>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Buyurtma turi</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: "materials_order", label: "📦 Materiallar" },
                      { val: "need_master", label: "🔨 Usta chaqirish" },
                    ].map((opt) => (
                      <button key={opt.val} type="button" onClick={() => { triggerHaptic("light"); setLeadOrderType(opt.val); }}
                        className={`text-xs font-bold py-2 px-3 rounded-xl border transition ${leadOrderType === opt.val ? "bg-amber-500 text-slate-950 border-amber-400" : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Ismingiz (ixtiyoriy)</label>
                  <input type="text" placeholder="Masalan: Sardor" value={leadClientName} onChange={(e) => setLeadClientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Telefon raqamingiz *</label>
                  <input type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+998 90 123 45 67"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-bold" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Viloyat</label>
                  <select value={clientRegion} onChange={(e) => setClientRegion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none">
                    <option value="Toshkent shahri">Toshkent shahri</option>
                    <option value="Toshkent viloyati">Toshkent viloyati</option>
                    <option value="Samarqand">Samarqand viloyati</option>
                    <option value="Farg'ona">Farg&apos;ona viloyati</option>
                    <option value="Andijon">Andijon viloyati</option>
                    <option value="Namangan">Namangan viloyati</option>
                    <option value="Buxoro">Buxoro viloyati</option>
                  </select>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-400 text-[10px]">Mo&apos;ljal smeta budjeti:</span>
                  <span className="font-bold text-amber-400">{formatUZS(projectSummary.projectGrandTotal)}</span>
                </div>
                <button type="button" disabled={isSubmittingLead} onClick={handleCreateLead}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center justify-center gap-2">
                  {isSubmittingLead ? (
                    <><Loader2 className="w-4 h-4 animate-spin text-slate-950" /><span>Birjaga e&apos;lon qilinmoqda...</span></>
                  ) : (
                    <span>🚀 Buyurtmani birjaga yuborish</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== MODAL: MENING SMETALARIM (LOYIHALAR TARIXI) ===== */}
      {showProjectsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-4 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Mening Smetalarim</h3>
                <span className="bg-amber-500/15 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  {savedProjects.length}
                </span>
              </div>
              <button
                onClick={() => setShowProjectsModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 flex-shrink-0">
              <button
                onClick={handleNewProject}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold py-2 px-3 rounded-xl transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Yangi loyiha</span>
              </button>
              <button
                onClick={() => {
                  setProjectNameInput(currentProjectName);
                  setShowProjectsModal(false);
                  setShowSaveProjectModal(true);
                }}
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-sm shadow-emerald-600/20 transition active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Joriy smetani saqlash</span>
              </button>
            </div>

            {/* Projects List */}
            <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 no-scrollbar">
              {savedProjects.length === 0 ? (
                <div className="text-center py-8 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Hozircha saqlangan smetalar yo&apos;q</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Kalkulyatorda hisoblagan loyihangizni saqlang va keyinchalik istalgan vaqtda qayta oching.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setProjectNameInput(currentProjectName);
                      setShowProjectsModal(false);
                      setShowSaveProjectModal(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-2 px-4 rounded-xl transition active:scale-95 inline-flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Joriy hisobni saqlash</span>
                  </button>
                </div>
              ) : (
                savedProjects.map((proj) => {
                  const isCurrent = proj.name === currentProjectName;
                  return (
                    <div
                      key={proj.id}
                      className={`p-3 rounded-2xl border transition-all duration-200 ${
                        isCurrent
                          ? "bg-slate-900 border-amber-500/50 shadow-md ring-1 ring-amber-500/20"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-white truncate max-w-[180px]">
                              {proj.name}
                            </h4>
                            {isCurrent && (
                              <span className="bg-amber-500/20 text-amber-400 text-[8.5px] font-bold px-1.5 py-0.2 rounded border border-amber-500/30 whitespace-nowrap">
                                Faol
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {proj.createdAt}
                            </span>
                            <span>•</span>
                            <span className="text-amber-400/80 font-semibold">{proj.totalRooms || proj.rooms.length} xona</span>
                            {proj.totalWorkArea > 0 && (
                              <>
                                <span>•</span>
                                <span>{proj.totalWorkArea.toFixed(1)} m²</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-bold text-xs text-amber-400 block">
                            {formatUZS(proj.grandTotal)}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handleLoadProject(proj)}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10.5px] py-1.5 px-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                        >
                          <FolderOpen className="w-3 h-3" />
                          <span>Ochish</span>
                        </button>
                        <button
                          onClick={() => handleDuplicateProject(proj)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-1.5 rounded-xl border border-slate-700 transition active:scale-95"
                          title="Nusxasini yaratish"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id, proj.name)}
                          className="bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 p-1.5 rounded-xl border border-slate-700 hover:border-rose-500/30 transition active:scale-95"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: SMETANI SAQLASH ===== */}
      {showSaveProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Loyihani Saqlash</h3>
              </div>
              <button
                onClick={() => setShowSaveProjectModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Loyiha / Obyekt nomi *
                </label>
                <input
                  type="text"
                  autoFocus
                  value={projectNameInput}
                  onChange={(e) => setProjectNameInput(e.target.value)}
                  placeholder="Masalan: Yunusobod 3-xonali kvartira"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-semibold"
                />
              </div>

              {/* Tezkor takliflar */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Tezkor nomlar:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    "Yunusobod kvartira",
                    "Chilonzor dom",
                    "Kottej 1-qavat",
                    "Sanuzel + Oshxona",
                    "Toshkent City",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setProjectNameInput(preset);
                      }}
                      className="text-[10px] font-medium bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg px-2 py-1 transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary box */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Xonalar soni:</span>
                  <span className="font-bold text-white">{rooms.length} ta xona</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Jami maydon:</span>
                  <span className="font-bold text-white">{projectSummary.totalWorkArea.toFixed(1)} m²</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800/80 pt-1.5">
                  <span className="text-slate-300 font-semibold text-[11px]">Jami smeta:</span>
                  <span className="font-black text-amber-400">{formatUZS(projectSummary.projectGrandTotal)}</span>
                </div>
              </div>

              {/* Save button */}
              <button
                type="button"
                onClick={() => handleSaveCurrentProject()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Loyihani Xotiraga Saqlash</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: MATERIAL NARXINI TAHRIRLASH (INLINE EDIT) ===== */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Bozor Narxini O&apos;zgartirish</h3>
              </div>
              <button
                onClick={() => setEditingMaterial(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Material:</span>
                <p className="font-bold text-xs text-white">{editingMaterial.name}</p>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Yangi narxi (1 {editingMaterial.unit} uchun so&apos;mda):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    autoFocus
                    value={editPriceInput || ""}
                    onChange={(e) => setEditPriceInput(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-base font-black text-amber-400 focus:border-amber-500 outline-none pr-14"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-3 text-xs text-slate-500 font-bold">so&apos;m</span>
                </div>
              </div>

              {/* Tezkor +/- tugmalar */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Tezkor o&apos;zgartirish:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[-10000, -5000, +5000, +10000, +25000].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setEditPriceInput((prev) => Math.max(0, prev + diff));
                      }}
                      className="text-[10px] font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1 transition active:scale-95"
                    >
                      {diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Saqlash tugmasi */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editPriceInput > 0) {
                      updateMaterialPrice(editingMaterial.code, editPriceInput);
                      setEditingMaterial(null);
                      triggerNotificationHaptic("success");
                      showQuickToast(`✅ ${editingMaterial.name} narxi yangilandi!`);
                    }
                  }}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Narxni Saqlash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMaterial(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 px-4 rounded-xl transition"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: TOPUP ===== */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Hisobni To&apos;ldirish</h3>
              </div>
              <button onClick={() => setShowTopupModal(false)} className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">PDF-smetalar yuklab olish yoki buyurtmalar birjasidan mijoz kontaktlarini sotib olish uchun balansingizni to&apos;ldiring:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { amount: 10000, label: "10 000 so'm" },
                { amount: 25000, label: "25 000 so'm" },
                { amount: 50000, label: "50 000 so'm" },
              ].map((item) => (
                <button key={item.amount} onClick={() => handleTopup(item.amount)}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-center transition active:scale-95">
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

      {/* ===== BOTTOM NAVIGATION ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 px-6 py-2.5 max-w-md mx-auto">
        <div className="flex justify-between items-center">
          {[
            { id: "calc" as const, label: "Kalkulyator", icon: Calculator },
            { id: "profile" as const, label: "Narxlar & Profil", icon: UserCheck },
            { id: "leads" as const, label: "Lid-Birja", icon: Building2 },
            { id: "guide" as const, label: "Me'yorlar", icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { triggerHaptic("light"); setActiveTab(tab.id); }}
                className={`flex flex-col items-center gap-1 transition-all duration-200 active:scale-95 ${isActive ? "text-amber-400" : "text-slate-500 hover:text-slate-400"}`}
              >
                <div className={`p-1 rounded-xl transition ${isActive ? "bg-amber-500/15" : "bg-transparent"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] ${isActive ? "font-bold text-amber-400" : "font-medium"}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
