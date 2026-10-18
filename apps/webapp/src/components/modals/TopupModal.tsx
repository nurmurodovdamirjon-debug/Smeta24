import React from "react";
import { CreditCard, X } from "lucide-react";

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopup: (amount: number) => void;
}

export const TopupModal: React.FC<TopupModalProps> = ({ isOpen, onClose, onTopup }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-4 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Hisobni To&apos;ldirish</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
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
              type="button"
              onClick={() => onTopup(item.amount)}
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
  );
};
