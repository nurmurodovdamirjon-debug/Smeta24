import React from "react";
import { LucideIcon } from "lucide-react";

export type NavTabId = "calc" | "profile" | "leads" | "guide";

export interface NavTabItem {
  id: NavTabId;
  label: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  tabs: NavTabItem[];
  activeTab: NavTabId;
  onSelectTab: (id: NavTabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ tabs, activeTab, onSelectTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 px-6 py-2.5 max-w-md mx-auto">
      <div className="flex justify-between items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-200 active:scale-95 ${
                isActive ? "text-amber-400" : "text-slate-500 hover:text-slate-400"
              }`}
            >
              <div className={`p-1 rounded-xl transition ${isActive ? "bg-amber-500/15" : "bg-transparent"}`}>
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
  );
};
