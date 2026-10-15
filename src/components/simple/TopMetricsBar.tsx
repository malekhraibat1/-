import React from 'react';
import { useDairy } from '../../context/DairyContext';
import { Milk, Scale, Calculator, Wallet, TrendingUp, Calendar } from 'lucide-react';

export const TopMetricsBar: React.FC = () => {
  const { milkSupplies, productions, settings, getAllSupplierStatements } = useDairy();

  // Total imported milk
  const totalMilkLiters = milkSupplies.reduce((sum, s) => sum + s.quantityLiters, 0);

  // Total cheese produced
  const totalCheeseKg = productions.reduce((sum, p) => sum + p.cheeseProducedKg, 0);

  // Cumulative Yield %
  const totalMilkUsedForCheese = productions.reduce((sum, p) => sum + p.milkUsedLiters, 0);
  const cumulativeYieldPercent =
    totalMilkUsedForCheese > 0
      ? (totalCheeseKg / totalMilkUsedForCheese) * 100
      : 0;

  const litersPerKgAverage =
    totalCheeseKg > 0 ? totalMilkUsedForCheese / totalCheeseKg : 0;

  // Supplier balances
  const statements = getAllSupplierStatements();
  const totalOwedToSuppliers = statements
    .filter((s) => s.balanceStatus === 'علينا')
    .reduce((sum, s) => sum + s.netBalance, 0);

  const totalOwedBySuppliers = statements
    .filter((s) => s.balanceStatus === 'لنا')
    .reduce((sum, s) => sum + s.netBalance, 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMilk = milkSupplies
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + s.quantityLiters, 0);

  const todayCheese = productions
    .filter((p) => p.date === todayStr)
    .reduce((sum, p) => sum + p.cheeseProducedKg, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs no-print">
      {/* Metric 1: Total Milk */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-slate-400 font-semibold text-[11px] flex items-center gap-1.5">
            <Milk className="w-4 h-4 text-sky-400" />
            <span>إجمالي الحليب المستورد</span>
          </div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {totalMilkLiters.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">لتر</span>
          </div>
          <div className="text-[10px] text-sky-400 mt-0.5">
            توريد اليوم: {todayMilk.toLocaleString()} لتر
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 font-mono text-sm font-bold">
          حليب
        </div>
      </div>

      {/* Metric 2: Total Cheese */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-slate-400 font-semibold text-[11px] flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>مجموع إنتاج الجبنة الكلي</span>
          </div>
          <div className="text-xl font-black text-amber-400 font-mono mt-1">
            {totalCheeseKg.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">كغ</span>
          </div>
          <div className="text-[10px] text-amber-300 mt-0.5">
            إنتاج اليوم: {todayCheese.toLocaleString()} كغ
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 font-mono text-sm font-bold">
          جبنة
        </div>
      </div>

      {/* Metric 3: Cumulative Yield % */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-slate-400 font-semibold text-[11px] flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>نسبة التصافي التراكمية (الجبنة للحليب)</span>
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono mt-1">
            {cumulativeYieldPercent.toFixed(2)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
            المعدل: 1 كغ جبنة لكل {litersPerKgAverage.toFixed(2)} لتر حليب
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-sm font-bold">
          معدل
        </div>
      </div>

      {/* Metric 4: Financial Balances */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-slate-400 font-semibold text-[11px] flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-rose-400" />
            <span>أرصدة حسابات الموردين</span>
          </div>
          <div className="text-base font-black text-rose-400 font-mono mt-1">
            علينا: {totalOwedToSuppliers.toLocaleString()} {settings.currency}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">
            لنا عليهم: {totalOwedBySuppliers.toLocaleString()} {settings.currency}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 font-mono text-sm font-bold">
          حسابات
        </div>
      </div>
    </div>
  );
};
