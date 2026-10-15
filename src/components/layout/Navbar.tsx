import React, { useState, useEffect } from 'react';
import { useFactory } from '../../context/FactoryContext';
import {
  Factory,
  Clock,
  Calendar,
  AlertTriangle,
  FileText,
  Plus,
  ShieldCheck,
  Package,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewBatch: () => void;
  onOpenNewInvoice: () => void;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewBatch,
  onOpenNewInvoice,
  onSelectTab,
}) => {
  const { settings, batches, rawMaterials, finishedProducts } = useFactory();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeBatchesCount = batches.filter((b) => b.status !== 'completed' && b.status !== 'cancelled').length;

  const lowStockRawCount = rawMaterials.filter((r) => r.currentStock <= r.minThreshold).length;
  const lowStockProdCount = finishedProducts.filter((p) => p.currentStockKg <= p.minAlertKg).length;
  const totalAlerts = lowStockRawCount + lowStockProdCount;

  const currentShift = time.getHours() >= 6 && time.getHours() < 14 ? 'الوردية الصباحية (06:00 - 14:00)' :
    time.getHours() >= 14 && time.getHours() < 22 ? 'الوردية المسائية (14:00 - 22:00)' : 'الوردية الليلية (22:00 - 06:00)';

  return (
    <header className="bg-slate-950/90 backdrop-blur border-b border-slate-800 text-white px-5 py-3 sticky top-0 z-30 no-print">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Factory Brand & Info */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-2 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black">
            <Factory className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-amber-400 tracking-wide">
                {settings.factoryName}
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                نظام إدارة الإنتاج والمخزون ERP
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                معايير سلامة الأغذية ISO 22000
              </span>
              <span className="text-slate-600">•</span>
              <span>{currentShift}</span>
            </div>
          </div>
        </div>

        {/* Live Clock & Shift Status */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>
              {time.toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2 text-amber-300 font-mono text-sm font-semibold tracking-wider">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              {time.toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Quick Actions & Notifications */}
        <div className="flex items-center gap-3">
          {totalAlerts > 0 && (
            <button
              onClick={() => onSelectTab('inventory')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs hover:bg-rose-500/20 transition-colors"
              title={`${totalAlerts} تنبيهات نقص في المخزون`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="font-bold">{totalAlerts}</span>
              <span className="hidden sm:inline">نواقص مخزون</span>
            </button>
          )}

          <div
            onClick={() => onSelectTab('production')}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs hover:bg-amber-500/20 transition"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>{activeBatchesCount} وجبة قيد التصنيع</span>
          </div>

          <button
            onClick={onOpenNewBatch}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-md shadow-amber-500/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>بدء طبخة/تشغيلة جديدة</span>
          </button>

          <button
            onClick={onOpenNewInvoice}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-md shadow-emerald-600/25 transition active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>فاتورة بيع جديدة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
