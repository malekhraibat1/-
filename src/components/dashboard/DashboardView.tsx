import React from 'react';
import { useFactory } from '../../context/FactoryContext';
import {
  Droplets,
  Factory,
  Boxes,
  Receipt,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  Percent,
  Plus,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { PRODUCTION_STAGES } from '../../data/initialData';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewBatch: () => void;
  onOpenNewInvoice: () => void;
  onSelectBatchForTraceability: (batchNumber: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenNewBatch,
  onOpenNewInvoice,
  onSelectBatchForTraceability,
}) => {
  const { batches, rawMaterials, finishedProducts, invoices, settings } = useFactory();

  // Metrics
  const rawMilkTotal = rawMaterials
    .filter((r) => r.category === 'حليب خام')
    .reduce((sum, r) => sum + r.currentStock, 0);

  const activeBatches = batches.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  );

  const completedBatches = batches.filter((b) => b.status === 'completed');

  const totalFinishedStockKg = finishedProducts.reduce(
    (sum, p) => sum + p.currentStockKg,
    0
  );

  const totalInventoryValue = finishedProducts.reduce(
    (sum, p) => sum + p.currentStockKg * p.sellingPricePerKg,
    0
  );

  const totalSalesRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  // Calculate Average Cheese Yield Efficiency %
  const batchesWithYield = batches.filter((b) => b.finalPackaging?.yieldEfficiencyPercent);
  const avgYieldPercent =
    batchesWithYield.length > 0
      ? (
          batchesWithYield.reduce(
            (sum, b) => sum + (b.finalPackaging?.yieldEfficiencyPercent || 0),
            0
          ) / batchesWithYield.length
        ).toFixed(1)
      : '11.4';

  // Low stock alerts
  const lowMaterials = rawMaterials.filter((r) => r.currentStock <= r.minThreshold);
  const lowProducts = finishedProducts.filter((p) => p.currentStockKg <= p.minAlertKg);

  // Group active batches by stage
  const stageCounts: Record<string, number> = {};
  batches.forEach((b) => {
    stageCounts[b.status] = (stageCounts[b.status] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Factory Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>نظام التشغيل ومراقبة الجودة المركزية</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            مرحباً بك في مركز إدارة عمليات التصنيع والمخازن
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            متابعة حية لكل مرحلة من مراحل تصنيع الأجبان: ضبط درجات الحرارة والبسترة، توازن الأحماض pH،
            فصل مصل اللبن، التحكم في غرف التعتيق، ومطابقة معايير الفواتير وسلامة الغذاء.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewBatch}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>تشغيلة إنتاج جديدة</span>
          </button>
          <button
            onClick={onOpenNewInvoice}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>إصدار فاتورة بيع</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Raw Milk Stock */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">مخزون الحليب الخام</span>
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              {rawMilkTotal.toLocaleString()}{' '}
              <span className="text-sm font-normal text-slate-400">لتر</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>أبقار، أغنام، وماعز</span>
              <span className="text-blue-400 font-semibold cursor-pointer" onClick={() => onNavigateTab('inventory')}>
                عرض الصوامع ←
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Active Production Batches */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">طبخات قيد التصنيع</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Factory className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400 font-mono">
              {activeBatches.length}{' '}
              <span className="text-sm font-normal text-slate-400">تشغيلة نشطة</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{completedBatches.length} تشغيلات مكتملة</span>
              <span className="text-amber-400 font-semibold cursor-pointer" onClick={() => onNavigateTab('production')}>
                خط الإنتاج ←
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Finished Cheese Ready */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">الجبن الجاهز في البرادات</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {totalFinishedStockKg.toLocaleString()}{' '}
              <span className="text-sm font-normal text-slate-400">كغ</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>القيمة: {Math.round(totalInventoryValue).toLocaleString()} {settings.currency}</span>
              <span className="text-emerald-400 font-semibold cursor-pointer" onClick={() => onNavigateTab('inventory')}>
                المخزن ←
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Average Yield % */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">معدل التصافي واستخراج الجبن</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-300 font-mono">
              {avgYieldPercent}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>يعادل 1 كغ جبن لكل ~{(100 / parseFloat(avgYieldPercent)).toFixed(1)} لتر حليب</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Total Sales Invoices */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">إجمالي المبيعات</span>
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-teal-300 font-mono">
              {Math.round(totalSalesRevenue).toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">{settings.currency}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{invoices.length} فواتير مسجلة</span>
              <span className="text-teal-400 font-semibold cursor-pointer" onClick={() => onNavigateTab('invoices')}>
                الفواتير ←
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Production Pipeline Status Board */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Factory className="w-5 h-5 text-amber-400" />
              <span>مسار مراحل الإنتاج المباشر (Production Stages Flow)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              توزيع وجبات الإنتاج الحالية بحسب مرحلة التصنيع
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('production')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
          >
            <span>فتح لوحة الخطوط الكاملة</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-2">
          {PRODUCTION_STAGES.map((stg) => {
            const count = stageCounts[stg.id] || 0;
            const isCompleted = stg.id === 'completed';

            return (
              <div
                key={stg.id}
                onClick={() => onNavigateTab('production')}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all hover:scale-[1.02] ${
                  count > 0
                    ? isCompleted
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="text-[10px] text-slate-400 mb-1 font-mono">
                  خطوة {stg.stepNumber}
                </div>
                <div className="text-xs font-bold truncate mb-2" title={stg.arabicName}>
                  {stg.arabicName}
                </div>
                <div
                  className={`text-xl font-mono font-black ${
                    count > 0 ? (isCompleted ? 'text-emerald-400' : 'text-amber-400') : 'text-slate-600'
                  }`}
                >
                  {count}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">وجبة</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Active Batches vs Alerts & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Batches Tracker (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>الوجبات قيد المعالجة حالياً في المعمل</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {activeBatches.length} قيد التشغيل
              </span>
            </div>

            <div className="space-y-3">
              {activeBatches.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p>لا توجد وجبات إنتاج قيد المعالجة حالياً. يمكنك بدء طبخة جديدة الآن.</p>
                </div>
              ) : (
                activeBatches.map((batch) => {
                  const stageDef = PRODUCTION_STAGES.find((s) => s.id === batch.status);
                  const progressPct = Math.round(
                    ((batch.currentStageIndex + 1) / PRODUCTION_STAGES.length) * 100
                  );

                  return (
                    <div
                      key={batch.id}
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {batch.batchNumber}
                          </span>
                          <span className="font-extrabold text-white text-sm">
                            {batch.cheeseType}
                          </span>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                          المرحلة {batch.currentStageIndex + 1}: {stageDef?.arabicName}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-400 my-2.5 bg-slate-900/60 p-2.5 rounded-lg">
                        <div>
                          <span className="text-slate-500 block text-[10px]">كمية الحليب المستخدم:</span>
                          <span className="font-bold text-slate-200">
                            {batch.milkReception.rawMilkLiters} لتر ({batch.milkReception.milkType})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">الحموضة / الدسم:</span>
                          <span className="font-bold text-slate-200">
                            pH {batch.milkReception.acidityPH} | {batch.milkReception.fatPercentage}% دسم
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">الكمية المتوقعة:</span>
                          <span className="font-bold text-slate-200">
                            ~{batch.targetWeightKg} كغ جبن
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">المسؤول / الوردية:</span>
                          <span className="font-bold text-slate-200">
                            {batch.supervisor} ({batch.shift})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 mt-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                            <span>نسبة إنجاز المعالجة</span>
                            <span className="font-mono font-bold text-amber-400">{progressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => onSelectBatchForTraceability(batch.batchNumber)}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition"
                            title="تتبع مسار الأمان الغذائي"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>تتبع</span>
                          </button>
                          <button
                            onClick={() => onNavigateTab('production')}
                            className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-1"
                          >
                            <span>تسجيل المرحلة ←</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-right">
            <button
              onClick={() => onNavigateTab('production')}
              className="text-xs font-bold text-amber-400 hover:underline"
            >
              عرض سجل كامل الوجبات المكتملة والأرشيف ←
            </button>
          </div>
        </div>

        {/* Right Column: Inventory Alerts & Quick Operations */}
        <div className="space-y-6">
          {/* Inventory Alerts Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>تنبيهات المخزون والنواقص</span>
              </h3>
              {(lowMaterials.length > 0 || lowProducts.length > 0) && (
                <span className="text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                  {lowMaterials.length + lowProducts.length} مواد
                </span>
              )}
            </div>

            {lowMaterials.length === 0 && lowProducts.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-emerald-300 font-semibold">المخزون في الحدود الآمنة والمثالية</p>
                <p className="mt-0.5">لا توجد مواد أولية أو أجبان تحت حد الطلب الأدنى.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {lowMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-rose-200">{mat.name}</div>
                      <div className="text-[10px] text-slate-400">
                        متبقي: {mat.currentStock} {mat.unit} (الحد الأدنى: {mat.minThreshold} {mat.unit})
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateTab('inventory')}
                      className="px-2 py-1 rounded bg-rose-500 text-white font-bold text-[10px] hover:bg-rose-400 transition"
                    >
                      طلب توريد
                    </button>
                  </div>
                ))}
                {lowProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-amber-200">{prod.name}</div>
                      <div className="text-[10px] text-slate-400">
                        متبقي: {prod.currentStockKg} كغ (حد التنبيه: {prod.minAlertKg} كغ)
                      </div>
                    </div>
                    <button
                      onClick={onOpenNewBatch}
                      className="px-2 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px] hover:bg-amber-400 transition"
                    >
                      جدولة طبخة
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Invoices Mini Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <span>آخر فواتير المبيعات الصادرة</span>
              </h3>
              <button
                onClick={() => onNavigateTab('invoices')}
                className="text-xs text-emerald-400 hover:underline font-bold"
              >
                الكل ←
              </button>
            </div>

            <div className="space-y-2">
              {invoices.slice(0, 3).map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => onNavigateTab('invoices')}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex justify-between items-center hover:border-slate-700 transition cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-slate-200">{inv.clientName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {inv.invoiceNumber} • {inv.issueDate.split(' ')[0]}
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <div className="font-bold text-emerald-400">
                      {inv.grandTotal.toLocaleString()} {settings.currency}
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                        inv.paymentStatus === 'مدفوعة بالكامل'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {inv.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
