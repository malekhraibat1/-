import React, { useState } from 'react';
import { useDairy } from '../../context/DairyContext';
import {
  Scale,
  Plus,
  Calendar,
  Milk,
  Calculator,
  TrendingUp,
  Trash2,
  Filter,
  BarChart3,
  Award,
  Sparkles,
} from 'lucide-react';

interface ProductionAndRatesViewProps {
  defaultTab?: 'production' | 'rates';
}

export const ProductionAndRatesView: React.FC<ProductionAndRatesViewProps> = ({
  defaultTab = 'production',
}) => {
  const { suppliers, productions, addProduction, deleteProduction } = useDairy();

  const [activeSection, setActiveSection] = useState<'both' | 'production' | 'rates'>(
    defaultTab === 'rates' ? 'rates' : 'both'
  );

  // Production Form State
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [milkUsedLiters, setMilkUsedLiters] = useState<string>('800');
  const [cheeseProducedKg, setCheeseProducedKg] = useState<string>('96');
  const [cheeseType, setCheeseType] = useState<string>('جبنة بيضاء بلدية');
  const [notes, setNotes] = useState<string>('');

  // Rates sub-tab: 'all' | 'suppliers' | 'daily' | 'monthly'
  const [ratesSubTab, setRatesSubTab] = useState<'suppliers' | 'daily' | 'monthly'>('suppliers');
  const [searchFilter, setSearchFilter] = useState('');

  // Live calculation for preview
  const milkNum = parseFloat(milkUsedLiters) || 0;
  const cheeseNum = parseFloat(cheeseProducedKg) || 0;
  const liveYieldPercent = milkNum > 0 ? (cheeseNum / milkNum) * 100 : 0;
  const liveLitersPerKg = cheeseNum > 0 ? milkNum / cheeseNum : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (milkNum <= 0 || cheeseNum <= 0) {
      alert('يرجى إدخال كمية حليب وكمية جبنة صالحة أكبر من الصفر.');
      return;
    }

    const sup = suppliers.find((s) => s.id === supplierId);
    const supplierName = sup ? sup.name : 'مورد عام';

    addProduction({
      date,
      supplierId,
      supplierName,
      milkUsedLiters: milkNum,
      cheeseProducedKg: cheeseNum,
      cheeseType,
      notes,
    });

    // Reset some fields
    setNotes('');
    alert('تم تسجيل عملية الإنتاج وحساب النسبة بنجاح!');
  };

  // 1. Per-Supplier Rates Calculation
  const supplierRates = suppliers.map((sup) => {
    const entries = productions.filter((p) => p.supplierId === sup.id);
    const totalMilk = entries.reduce((sum, p) => sum + p.milkUsedLiters, 0);
    const totalCheese = entries.reduce((sum, p) => sum + p.cheeseProducedKg, 0);
    const yieldPct = totalMilk > 0 ? (totalCheese / totalMilk) * 100 : 0;
    const litersPerKg = totalCheese > 0 ? totalMilk / totalCheese : 0;

    return {
      supplierId: sup.id,
      supplierName: sup.name,
      entriesCount: entries.length,
      totalMilk,
      totalCheese,
      yieldPct,
      litersPerKg,
    };
  });

  // 2. Daily Rates Calculation
  const dailyMap: Record<string, { date: string; milk: number; cheese: number }> = {};
  productions.forEach((p) => {
    if (!dailyMap[p.date]) {
      dailyMap[p.date] = { date: p.date, milk: 0, cheese: 0 };
    }
    dailyMap[p.date].milk += p.milkUsedLiters;
    dailyMap[p.date].cheese += p.cheeseProducedKg;
  });

  const dailyRates = Object.values(dailyMap)
    .map((d) => ({
      date: d.date,
      totalMilk: d.milk,
      totalCheese: d.cheese,
      yieldPct: d.milk > 0 ? (d.cheese / d.milk) * 100 : 0,
      litersPerKg: d.cheese > 0 ? d.milk / d.cheese : 0,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  // 3. Monthly Rates Calculation
  const monthlyMap: Record<string, { month: string; milk: number; cheese: number }> = {};
  productions.forEach((p) => {
    const month = p.date.substring(0, 7); // YYYY-MM
    if (!monthlyMap[month]) {
      monthlyMap[month] = { month, milk: 0, cheese: 0 };
    }
    monthlyMap[month].milk += p.milkUsedLiters;
    monthlyMap[month].cheese += p.cheeseProducedKg;
  });

  const monthlyRates = Object.values(monthlyMap)
    .map((m) => ({
      month: m.month,
      totalMilk: m.milk,
      totalCheese: m.cheese,
      yieldPct: m.milk > 0 ? (m.cheese / m.milk) * 100 : 0,
      litersPerKg: m.cheese > 0 ? m.milk / m.cheese : 0,
    }))
    .sort((a, b) => b.month.localeCompare(a.month));

  // 4. Cumulative Overall Rate
  const totalCumulativeMilk = productions.reduce((s, p) => s + p.milkUsedLiters, 0);
  const totalCumulativeCheese = productions.reduce((s, p) => s + p.cheeseProducedKg, 0);
  const totalCumulativeYield =
    totalCumulativeMilk > 0 ? (totalCumulativeCheese / totalCumulativeMilk) * 100 : 0;
  const totalCumulativeLitersPerKg =
    totalCumulativeCheese > 0 ? totalCumulativeMilk / totalCumulativeCheese : 0;

  // Filtered productions table
  const filteredProductions = productions.filter((p) => {
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        p.supplierName.toLowerCase().includes(q) ||
        p.cheeseType.toLowerCase().includes(q) ||
        p.date.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* SECTION 1: Daily Production Entry Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                خانة الإدخال اليومي لإنتاج الجبنة (Daily Cheese Entry)
              </h2>
              <p className="text-xs text-slate-400">
                أدخل التاريخ ومصدر الحليب والكمية باللتر وإنتاج الجبنة بالكيلو لحساب نسبة التصافي فورياً
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* 1. Date */}
            <div>
              <label className="block text-slate-300 mb-1 font-bold">التاريخ *</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Milk Source Supplier */}
            <div>
              <label className="block text-slate-300 mb-1 font-bold">
                مصدر الحليب المورد *
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-500 focus:outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Milk Quantity (Liters) */}
            <div>
              <label className="block text-slate-300 mb-1 font-bold">
                كمية الحليب المستخدم (لتر) *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                placeholder="مثال: 800"
                value={milkUsedLiters}
                onChange={(e) => setMilkUsedLiters(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-500 focus:outline-none text-sm"
              />
            </div>

            {/* 4. Cheese Produced (Kg) */}
            <div>
              <label className="block text-slate-300 mb-1 font-bold">
                مجموع إنتاج الجبنة (كغ) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                placeholder="مثال: 96"
                value={cheeseProducedKg}
                onChange={(e) => setCheeseProducedKg(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-black focus:border-amber-500 focus:outline-none text-sm"
              />
            </div>

            {/* 5. Cheese Type */}
            <div>
              <label className="block text-slate-300 mb-1 font-bold">نوع الجبنة</label>
              <select
                value={cheeseType}
                onChange={(e) => setCheeseType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="جبنة بيضاء بلدية">جبنة بيضاء بلدية</option>
                <option value="جبنة حلوم بلدي">جبنة حلوم بلدي</option>
                <option value="جبنة عكاوي">جبنة عكاوي</option>
                <option value="جبنة موزاريلا">جبنة موزاريلا</option>
                <option value="جبنة قريش/ريكوتا">جبنة قريش / ريكوتا</option>
                <option value="جبنة فيتا">جبنة فيتا</option>
              </select>
            </div>
          </div>

          {/* Real-time Yield Calculation Preview */}
          <div className="bg-slate-950 border border-amber-500/30 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">
                  الحساب الفوري لمعدل التصافي (الجبنة للحليب):
                </span>
                <div className="flex items-center gap-4 text-xs mt-0.5">
                  <span className="text-white">
                    نسبة الاستخراج:{' '}
                    <b className="font-mono text-emerald-400 text-sm">
                      {liveYieldPercent.toFixed(2)}%
                    </b>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-white">
                    معدل اللتر للكيلو:{' '}
                    <b className="font-mono text-amber-400 text-sm">
                      {liveLitersPerKg.toFixed(2)} لتر / 1 كغ جبنة
                    </b>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="ملاحظات (اختياري)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs w-48 sm:w-64"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>حفظ عملية الإنتاج</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* SECTION 2: Cumulative & Rates Breakdown (المعدلات لكل مورد وكل يوم وكل شهر وتراكمي) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        {/* Header with Cumulative Big Stat */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>سجل المعدلات ونسب الجبنة للحليب (Yield Rates Ledger)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              مقارنة دقيقة لنسبة التصافي: لكل مورد، ولكل يوم، ولكل شهر، والنسبة التراكمية الشاملة
            </p>
          </div>

          {/* Cumulative Badge */}
          <div className="bg-emerald-950/40 border border-emerald-500/40 px-4 py-2 rounded-xl text-left font-mono">
            <span className="text-[10px] text-emerald-300 block font-sans font-bold">
              معدل التصافي التراكمي الشامل للمعمل:
            </span>
            <div className="text-lg font-black text-emerald-400">
              {totalCumulativeYield.toFixed(2)}%{' '}
              <span className="text-xs text-slate-300 font-normal">
                ({totalCumulativeLitersPerKg.toFixed(2)} لتر / 1 كغ)
              </span>
            </div>
          </div>
        </div>

        {/* Sub-tabs for Rates */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs w-fit">
          <button
            onClick={() => setRatesSubTab('suppliers')}
            className={`px-4 py-1.5 rounded-lg font-bold transition ${
              ratesSubTab === 'suppliers'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            المعدل لكل مورد (Per Supplier)
          </button>
          <button
            onClick={() => setRatesSubTab('daily')}
            className={`px-4 py-1.5 rounded-lg font-bold transition ${
              ratesSubTab === 'daily'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            المعدل لكل يوم (Daily)
          </button>
          <button
            onClick={() => setRatesSubTab('monthly')}
            className={`px-4 py-1.5 rounded-lg font-bold transition ${
              ratesSubTab === 'monthly'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            المعدل لكل شهر (Monthly)
          </button>
        </div>

        {/* Sub-view 1: Per Supplier Rate */}
        {ratesSubTab === 'suppliers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="py-2.5 px-3">اسم مورد الحليب</th>
                  <th className="py-2.5 px-3 font-mono">عدد الطبخات</th>
                  <th className="py-2.5 px-3 font-mono">إجمالي الحليب (لتر)</th>
                  <th className="py-2.5 px-3 font-mono">إجمالي الجبنة الناتجة (كغ)</th>
                  <th className="py-2.5 px-3 font-mono">نسبة التصافي (الجبنة للحليب)</th>
                  <th className="py-2.5 px-3 font-mono">كم لتر يحتاج لكل 1 كغ</th>
                  <th className="py-2.5 px-3">التقييم والمردود</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {supplierRates.map((s) => (
                  <tr key={s.supplierId} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-sans font-bold text-white">
                      {s.supplierName}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{s.entriesCount} طبخات</td>
                    <td className="py-3 px-3 text-sky-400 font-bold">
                      {s.totalMilk.toLocaleString()} لتر
                    </td>
                    <td className="py-3 px-3 text-amber-400 font-bold">
                      {s.totalCheese.toLocaleString()} كغ
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm font-black text-emerald-400">
                        {s.yieldPct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {s.litersPerKg > 0 ? `${s.litersPerKg.toFixed(2)} لتر/كغ` : '—'}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      {s.yieldPct >= 12.5 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          ممتاز جداً ⭐
                        </span>
                      ) : s.yieldPct >= 11.5 ? (
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold">
                          جيد جداً
                        </span>
                      ) : s.yieldPct > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                          عادي
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">لا يوجد إنتاج</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sub-view 2: Daily Rate */}
        {ratesSubTab === 'daily' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="py-2.5 px-3 font-mono">اليوم والتاريخ</th>
                  <th className="py-2.5 px-3 font-mono">إجمالي حليب اليوم (لتر)</th>
                  <th className="py-2.5 px-3 font-mono">إنتاج الجبنة لليوم (كغ)</th>
                  <th className="py-2.5 px-3 font-mono">نسبة التصافي لليوم %</th>
                  <th className="py-2.5 px-3 font-mono">معدل اللتر للكيلو</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {dailyRates.map((d) => (
                  <tr key={d.date} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white">{d.date}</td>
                    <td className="py-3 px-3 text-sky-400 font-bold">
                      {d.totalMilk.toLocaleString()} لتر
                    </td>
                    <td className="py-3 px-3 text-amber-400 font-bold">
                      {d.totalCheese.toLocaleString()} كغ
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm font-black text-emerald-400">
                        {d.yieldPct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {d.litersPerKg.toFixed(2)} لتر / 1 كغ جبنة
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sub-view 3: Monthly Rate */}
        {ratesSubTab === 'monthly' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="py-2.5 px-3 font-mono">الشهر (السنة - الشهر)</th>
                  <th className="py-2.5 px-3 font-mono">مجموع الحليب الشهري (لتر)</th>
                  <th className="py-2.5 px-3 font-mono">مجموع الجبنة الشهرية (كغ)</th>
                  <th className="py-2.5 px-3 font-mono">متوسط نسبة التصافي الشهرية</th>
                  <th className="py-2.5 px-3 font-mono">معدل اللتر للكيلو</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {monthlyRates.map((m) => (
                  <tr key={m.month} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white">{m.month}</td>
                    <td className="py-3 px-3 text-sky-400 font-bold">
                      {m.totalMilk.toLocaleString()} لتر
                    </td>
                    <td className="py-3 px-3 text-amber-400 font-bold">
                      {m.totalCheese.toLocaleString()} كغ
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm font-black text-emerald-400">
                        {m.yieldPct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {m.litersPerKg.toFixed(2)} لتر / 1 كغ جبنة
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 3: Cheese Production Ledger Table (سجل إنتاج الجبنة التفصيلي) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <span>سجل إنتاج الجبنة اليومي (Cheese Production History)</span>
            </h3>
            <span className="text-xs text-slate-400">
              إجمالي السجلات: {productions.length} عملية إنتاج
            </span>
          </div>

          <input
            type="text"
            placeholder="بحث بالمورد، الصنف، التاريخ..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs w-60"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="py-2.5 px-3 font-mono">التاريخ</th>
                <th className="py-2.5 px-3">مصدر الحليب (المورد)</th>
                <th className="py-2.5 px-3">نوع الجبنة</th>
                <th className="py-2.5 px-3 font-mono">حليب مستخدم (لتر)</th>
                <th className="py-2.5 px-3 font-mono">إنتاج الجبنة (كغ)</th>
                <th className="py-2.5 px-3 font-mono">نسبة التصافي %</th>
                <th className="py-2.5 px-3 font-mono">لتر لكل كغ</th>
                <th className="py-2.5 px-3">ملاحظات</th>
                <th className="py-2.5 px-3 text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredProductions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                    لا توجد سجلات إنتاج تطابق البحث
                  </td>
                </tr>
              ) : (
                filteredProductions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-300 font-bold">{p.date}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-white">
                      {p.supplierName}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-amber-300">{p.cheeseType}</td>
                    <td className="py-2.5 px-3 text-sky-400 font-bold">
                      {p.milkUsedLiters} لتر
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-black">
                      {p.cheeseProducedKg} كغ
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-emerald-400">
                        {p.yieldPercentage.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {p.litersPerKgCheese.toFixed(2)} لتر/كغ
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">
                      {p.notes || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
                            deleteProduction(p.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
