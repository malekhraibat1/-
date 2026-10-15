import React, { useState } from 'react';
import { useDairy } from '../../context/DairyContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Scale,
  Calendar,
  Layers,
  Award,
  ArrowUpRight,
  DollarSign,
} from 'lucide-react';

const VARIETY_COLORS: Record<string, string> = {
  'جبنة بيضاء بلدية': '#f59e0b', // Amber
  'جبنة موزاريلا': '#10b981', // Emerald
  'جبنة حلوم بلدي': '#38bdf8', // Sky
  'جبنة عكاوي': '#a855f7', // Purple
  'جبنة قريش/ريكوتا': '#ec4899', // Pink
  'جبنة فيتا': '#06b6d4', // Cyan
  'أخرى': '#64748b', // Slate
};

const PALETTE = ['#f59e0b', '#10b981', '#38bdf8', '#a855f7', '#ec4899', '#06b6d4', '#eab308'];

export const CheeseSalesChartsView: React.FC = () => {
  const { salesInvoices, productions, settings } = useDairy();

  const [metricView, setMetricView] = useState<'revenue' | 'volume'>('revenue');
  const [chartType, setChartType] = useState<'bar' | 'area'>('area');

  // 1. Group Monthly Sales Data
  const monthlyAgg: Record<
    string,
    {
      monthKey: string;
      monthLabel: string;
      totalRevenue: number;
      totalKg: number;
      invoicesCount: number;
      varieties: Record<string, number>;
    }
  > = {};

  salesInvoices.forEach((inv) => {
    const monthKey = inv.date.substring(0, 7); // YYYY-MM
    const dateObj = new Date(inv.date);
    const monthLabel = dateObj.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

    if (!monthlyAgg[monthKey]) {
      monthlyAgg[monthKey] = {
        monthKey,
        monthLabel: monthLabel || monthKey,
        totalRevenue: 0,
        totalKg: 0,
        invoicesCount: 0,
        varieties: {},
      };
    }

    monthlyAgg[monthKey].totalRevenue += inv.totalAmount;
    monthlyAgg[monthKey].totalKg += inv.quantityKg;
    monthlyAgg[monthKey].invoicesCount += 1;

    const variety = inv.cheeseType || 'جبنة بيضاء بلدية';
    monthlyAgg[monthKey].varieties[variety] =
      (monthlyAgg[monthKey].varieties[variety] || 0) + inv.totalAmount;
  });

  const monthlyChartData = Object.values(monthlyAgg)
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    .map((m) => ({
      name: m.monthLabel,
      monthKey: m.monthKey,
      revenue: Math.round(m.totalRevenue * 10) / 10,
      quantityKg: Math.round(m.totalKg * 10) / 10,
      invoices: m.invoicesCount,
      avgPricePerKg: m.totalKg > 0 ? Math.round((m.totalRevenue / m.totalKg) * 10) / 10 : 0,
    }));

  // 2. Group Performance by Cheese Varieties
  const varietyAgg: Record<
    string,
    {
      name: string;
      totalRevenue: number;
      totalKg: number;
      invoicesCount: number;
      color: string;
    }
  > = {};

  salesInvoices.forEach((inv) => {
    const vName = inv.cheeseType || 'جبنة بيضاء بلدية';
    if (!varietyAgg[vName]) {
      varietyAgg[vName] = {
        name: vName,
        totalRevenue: 0,
        totalKg: 0,
        invoicesCount: 0,
        color: VARIETY_COLORS[vName] || '#f59e0b',
      };
    }
    varietyAgg[vName].totalRevenue += inv.totalAmount;
    varietyAgg[vName].totalKg += inv.quantityKg;
    varietyAgg[vName].invoicesCount += 1;
  });

  const varietyChartData = Object.values(varietyAgg)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .map((v) => ({
      ...v,
      revenue: Math.round(v.totalRevenue * 10) / 10,
      quantityKg: Math.round(v.totalKg * 10) / 10,
      avgPricePerKg: v.totalKg > 0 ? Math.round((v.totalRevenue / v.totalKg) * 100) / 100 : 0,
    }));

  // Totals & KPI summaries
  const totalSalesRevenue = salesInvoices.reduce((s, inv) => s + inv.totalAmount, 0);
  const totalSalesKg = salesInvoices.reduce((s, inv) => s + inv.quantityKg, 0);
  const totalProducedKg = productions.reduce((s, p) => s + p.cheeseProducedKg, 0);

  const topVariety = varietyChartData[0];
  const bestMonth = [...monthlyChartData].sort((a, b) => b.revenue - a.revenue)[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>لوحة التحليلات البيانية الذكية لمبيعات الأجبان (Recharts Analytics)</span>
          </div>
          <h2 className="text-xl font-black text-white">
            تحليل المبيعات الشهرية ومقارنة أداء أصناف الجبن
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            متابعة دقيقة لنمو الإيرادات عبر الأشهر، وحصص الأصناف الأكثر طلباً ومردوداً في السوق لضبط
            خطط الإنتاج والتوزيع.
          </p>
        </div>

        {/* Quick KPI pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-left font-mono">
            <span className="text-[10px] text-slate-400 block font-sans">إجمالي الإيرادات:</span>
            <span className="text-lg font-black text-emerald-400">
              {totalSalesRevenue.toLocaleString()} {settings.currency}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-left font-mono">
            <span className="text-[10px] text-slate-400 block font-sans">الكمية المباعة:</span>
            <span className="text-lg font-black text-amber-400">{totalSalesKg.toLocaleString()} كغ</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[11px] font-sans">الصنف الأكثر مبيعاً:</span>
            <span className="text-base font-black text-amber-300 font-sans mt-0.5 block">
              {topVariety?.name || '—'}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              حقق {topVariety?.revenue.toLocaleString()} {settings.currency} ({topVariety?.quantityKg} كغ)
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[11px] font-sans">الشهر الأكثر مبيعاً:</span>
            <span className="text-base font-black text-emerald-400 font-sans mt-0.5 block">
              {bestMonth?.name || '—'}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              مبيعات قياسية: {bestMonth?.revenue.toLocaleString()} {settings.currency}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[11px] font-sans">متوسط سعر الكيلو العام:</span>
            <span className="text-base font-black text-sky-400 mt-0.5 block">
              {(totalSalesKg > 0 ? totalSalesRevenue / totalSalesKg : 0).toFixed(2)}{' '}
              {settings.currency} / كغ
            </span>
            <span className="text-[10px] text-slate-500 font-sans">عبر جميع الأصناف المباعة</span>
          </div>
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CHART 1: Monthly Sales Revenue & Volume Trend */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>إجمالي مبيعات الجبنة الشهرية (Monthly Cheese Sales)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              تتبع إيرادات المبيعات والكميات بالكيلوغرام شهراً بشهر
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMetricView('revenue')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                metricView === 'revenue'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              القيمة المالية ({settings.currency})
            </button>
            <button
              onClick={() => setMetricView('volume')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                metricView === 'volume'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الوزن بالكيلو (كغ)
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1" />
            <button
              onClick={() => setChartType(chartType === 'area' ? 'bar' : 'area')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
              title="تبديل نوع المخطط"
            >
              {chartType === 'area' ? 'أعمدة' : 'مساحة منحنية'}
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={monthlyChartData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontFamily: 'Cairo',
                    direction: 'rtl',
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'الإيرادات') return [`${value.toLocaleString()} ${settings.currency}`, name];
                    if (name === 'الكمية المباعة') return [`${value.toLocaleString()} كغ`, name];
                    return [value, name];
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontFamily: 'Cairo', fontSize: '12px' }}
                />
                {metricView === 'revenue' ? (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="الإيرادات"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                ) : (
                  <Area
                    type="monotone"
                    dataKey="quantityKg"
                    name="الكمية المباعة"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorKg)"
                  />
                )}
              </AreaChart>
            ) : (
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontFamily: 'Cairo',
                    direction: 'rtl',
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'الإيرادات') return [`${value.toLocaleString()} ${settings.currency}`, name];
                    if (name === 'الكمية المباعة') return [`${value.toLocaleString()} كغ`, name];
                    return [value, name];
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontFamily: 'Cairo', fontSize: '12px' }}
                />
                {metricView === 'revenue' ? (
                  <Bar
                    dataKey="revenue"
                    name="الإيرادات"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                  />
                ) : (
                  <Bar
                    dataKey="quantityKg"
                    name="الكمية المباعة"
                    fill="#f59e0b"
                    radius={[8, 8, 0, 0]}
                  />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: Cheese Varieties Comparison (مقارنة أداء الأنواع المختلفة) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Varieties Comparison Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>مقارنة أداء أنواع الجبن (Varieties Comparison)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                مقارنة كل صنف بحسب إجمالي الإيرادات والكميات المباعة
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={varietyChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94a3b8"
                  tick={{ fill: '#f8fafc', fontSize: 11, fontWeight: 'bold' }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontFamily: 'Cairo',
                    direction: 'rtl',
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'إجمالي الإيرادات') return [`${value.toLocaleString()} ${settings.currency}`, name];
                    if (name === 'الكمية بالكيلو') return [`${value.toLocaleString()} كغ`, name];
                    return [value, name];
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '5px', fontFamily: 'Cairo', fontSize: '11px' }}
                />
                <Bar
                  dataKey="revenue"
                  name="إجمالي الإيرادات"
                  fill="#10b981"
                  radius={[0, 6, 6, 0]}
                />
                <Bar
                  dataKey="quantityKg"
                  name="الكمية بالكيلو"
                  fill="#f59e0b"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Revenue Distribution Pie / Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-sky-400" />
                <span>الحصة السوقية للأصناف (Market Share)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                توزيع نسبة إيرادات كل نوع من إجمالي المبيعات
              </p>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={varietyChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="revenue"
                >
                  {varietyChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || PALETTE[index % PALETTE.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontFamily: 'Cairo',
                    direction: 'rtl',
                  }}
                  formatter={(val: any, name: any, item: any) => {
                    const pct = totalSalesRevenue > 0 ? ((Number(val) / totalSalesRevenue) * 100).toFixed(1) : 0;
                    return [`${Number(val).toLocaleString()} ${settings.currency} (${pct}%)`, item?.payload?.name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Variety Legend Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {varietyChartData.map((v) => {
              const sharePct =
                totalSalesRevenue > 0
                  ? ((v.revenue / totalSalesRevenue) * 100).toFixed(1)
                  : '0';

              return (
                <div
                  key={v.name}
                  className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: v.color }}
                    />
                    <span className="text-slate-300 font-semibold truncate text-[11px]" title={v.name}>
                      {v.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-white text-[11px] shrink-0">
                    {sharePct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Breakdown Table for Varieties */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <h4 className="text-xs font-black text-white border-b border-slate-800 pb-2">
          جدول تفاصيل أداء أصناف الجبنة وأسعارها
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="py-2.5 px-3">صنف الجبنة</th>
                <th className="py-2.5 px-3 font-mono">الكمية المباعة (كغ)</th>
                <th className="py-2.5 px-3 font-mono">إجمالي المبيعات</th>
                <th className="py-2.5 px-3 font-mono">متوسط سعر الكيلو</th>
                <th className="py-2.5 px-3 font-mono">عدد الفواتير</th>
                <th className="py-2.5 px-3 font-mono">نسبة المساهمة في الإيراد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {varietyChartData.map((v) => {
                const sharePct =
                  totalSalesRevenue > 0
                    ? ((v.revenue / totalSalesRevenue) * 100).toFixed(1)
                    : '0';

                return (
                  <tr key={v.name} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: v.color }}
                      />
                      <span>{v.name}</span>
                    </td>
                    <td className="py-3 px-3 text-amber-400 font-bold">
                      {v.quantityKg.toLocaleString()} كغ
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-black">
                      {v.revenue.toLocaleString()} {settings.currency}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {v.avgPricePerKg} {settings.currency} / كغ
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-sans">
                      {v.invoicesCount} فواتير
                    </td>
                    <td className="py-3 px-3 font-bold text-sky-400">
                      {sharePct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
