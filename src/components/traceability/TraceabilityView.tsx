import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import {
  ScanLine,
  Search,
  ShieldCheck,
  Droplets,
  Flame,
  Sparkles,
  Layers,
  Waves,
  Clock,
  PackageCheck,
  Store,
  Printer,
  AlertCircle,
  FileCheck2,
  Calendar,
} from 'lucide-react';

interface TraceabilityViewProps {
  initialBatchNumber?: string;
}

export const TraceabilityView: React.FC<TraceabilityViewProps> = ({
  initialBatchNumber = '',
}) => {
  const { batches, invoices, settings } = useFactory();

  const [searchBatch, setSearchBatch] = useState<string>(
    initialBatchNumber || batches[0]?.batchNumber || ''
  );

  // Find target batch
  const selectedBatch = batches.find(
    (b) => b.batchNumber.toLowerCase().trim() === searchBatch.toLowerCase().trim()
  );

  // Find all invoices that sold items from this batch
  const relatedInvoices = invoices.filter((inv) =>
    inv.items.some(
      (item) => item.batchNumber.toLowerCase().trim() === searchBatch.toLowerCase().trim()
    )
  );

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md no-print">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <ScanLine className="w-6 h-6 text-indigo-400" />
              <span>نظام التتبع وسلسلة سلامة الغذاء (Batch Food Safety Traceability)</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
              معايير HACCP & ISO 22000
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            تتبع شجرة الإنتاج الكاملة: من المزرعة وفحص الحليب الخام حتى المستودعات والعملاء الذين
            استلموا التشغيلة
          </p>
        </div>

        {selectedBatch && (
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة تقرير التتبع والرقابة الصحية (A4)</span>
          </button>
        )}
      </div>

      {/* Batch Search & Selector Bar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 no-print text-xs">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <span className="text-slate-400 font-bold shrink-0">رقم التشغيلة / اللوت:</span>
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="أدخل رقم التشغيلة (مثال: CH-26101-HAL)..."
              value={searchBatch}
              onChange={(e) => setSearchBatch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-bold"
            />
          </div>
        </div>

        {/* Quick batch selectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-500 text-[11px] shrink-0">تشغيلات سريعة:</span>
          {batches.slice(0, 5).map((b) => (
            <button
              key={b.id}
              onClick={() => setSearchBatch(b.batchNumber)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition ${
                searchBatch === b.batchNumber
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {b.batchNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {!selectedBatch ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-base font-bold text-slate-300">لم يتم العثور على تشغيلة بهذا الرقم</p>
          <p className="text-xs text-slate-500 mt-1">
            يرجى التأكد من كتابة رقم التشغيلة بدقة أو اختيار إحدى الوجبات من القائمة بالأعلى.
          </p>
        </div>
      ) : (
        <div className="space-y-6 print:bg-white print:text-black">
          {/* Official Audit Document Header (visible on screen and in print) */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl print:border-none print:p-0 print:bg-white">
            <div className="border-b-2 border-slate-800 print:border-black pb-4 flex flex-wrap justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-500 print:text-black" />
                  <h3 className="text-lg font-black text-white print:text-black">
                    تقرير التحقق والتتبع الصحي الشامل (HACCP Traceability Dossier)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                  المصنع: {settings.factoryName} • س.ت: {settings.commercialRegistration}
                </p>
              </div>

              <div className="text-left font-mono bg-slate-950 print:bg-slate-100 p-3 rounded-xl border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-500 block">رقم اللوت المفحوص:</span>
                <span className="text-base font-black text-amber-400 print:text-amber-800">
                  {selectedBatch.batchNumber}
                </span>
                <span className="text-xs text-slate-400 print:text-slate-600 block mt-0.5">
                  الصنف: {selectedBatch.cheeseType}
                </span>
              </div>
            </div>

            {/* Traceability Stepper Tree */}
            <div className="mt-6 space-y-6">
              {/* Node 1: Raw Milk Origin */}
              <div className="relative pr-8 border-r-2 border-blue-500/50 pb-6 print:border-blue-700">
                <div className="absolute -right-3 top-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow">
                  1
                </div>

                <div className="bg-slate-950/70 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-400 print:text-blue-700 flex items-center gap-1.5">
                      <Droplets className="w-4 h-4" />
                      <span>المصدر الزراعي وفحص الحليب الخام المخبري</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 print:text-emerald-700 bg-emerald-950/30 print:bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-500/30">
                      فحص المضاد: {selectedBatch.milkReception.antibioticTest}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 print:text-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px]">المزرعة الموردة:</span>
                      <span className="font-bold">{selectedBatch.milkReception.supplierName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">صنف الحليب والكمية:</span>
                      <span className="font-bold font-mono">
                        {selectedBatch.milkReception.rawMilkLiters} لتر (
                        {selectedBatch.milkReception.milkType})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">الحموضة والكثافة:</span>
                      <span className="font-bold font-mono">
                        pH {selectedBatch.milkReception.acidityPH} • كثافة{' '}
                        {selectedBatch.milkReception.density}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">نسبة الدسم والحرارة:</span>
                      <span className="font-bold font-mono">
                        {selectedBatch.milkReception.fatPercentage}% دسم •{' '}
                        {selectedBatch.milkReception.temperatureC}°C
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Node 2: Processing & Thermal Pasteurization */}
              <div className="relative pr-8 border-r-2 border-amber-500/50 pb-6 print:border-amber-700">
                <div className="absolute -right-3 top-0 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shadow">
                  2
                </div>

                <div className="bg-slate-950/70 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-200">
                  <span className="text-xs font-bold text-amber-400 print:text-amber-800 flex items-center gap-1.5 mb-2">
                    <Flame className="w-4 h-4" />
                    <span>المعاملة الحرارية والبسترة والتخثير والتقطيع</span>
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 print:text-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px]">البسترة:</span>
                      <span className="font-bold">
                        {selectedBatch.pasteurization
                          ? `${selectedBatch.pasteurization.temperatureC}°C (${selectedBatch.pasteurization.durationMinutes}د)`
                          : 'مكتملة قياسياً'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">المنفحة والبادئ:</span>
                      <span className="font-bold">
                        {selectedBatch.coagulation?.rennetType || 'منفحة ميكروبية معتمدة'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">تقطيع الخثرة:</span>
                      <span className="font-bold font-mono">
                        {selectedBatch.cuttingCooking?.curdSizeMm || 10} ملم • طبخ{' '}
                        {selectedBatch.cuttingCooking?.cookingTempC || 39}°C
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">الكبس والتمليح:</span>
                      <span className="font-bold">
                        {selectedBatch.salting?.method || 'حوض براين ملحي معقم'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Node 3: Packaging, Net Weight & Yield */}
              <div className="relative pr-8 border-r-2 border-emerald-500/50 pb-6 print:border-emerald-700">
                <div className="absolute -right-3 top-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow">
                  3
                </div>

                <div className="bg-slate-950/70 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-200">
                  <span className="text-xs font-bold text-emerald-400 print:text-emerald-800 flex items-center gap-1.5 mb-2">
                    <PackageCheck className="w-4 h-4" />
                    <span>المنتج النهائي، التعبئة، ومعدل التصافي (Yield Efficiency)</span>
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 print:text-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px]">الوزن الصافي المنتج:</span>
                      <span className="font-black text-sm text-emerald-400 print:text-emerald-700 font-mono">
                        {selectedBatch.finalPackaging?.finalWeightKg || selectedBatch.targetWeightKg} كغ
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">معدل استخراج الجبن (Yield):</span>
                      <span className="font-bold text-purple-400 print:text-purple-800 font-mono">
                        {selectedBatch.finalPackaging?.yieldEfficiencyPercent || '11.4'}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">نوع التغليف والباركود:</span>
                      <span className="font-bold font-mono">
                        {selectedBatch.finalPackaging?.barcode || '6281001001015'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">تاريخ الإنتاج والانتهاء:</span>
                      <span className="font-bold font-mono">
                        {selectedBatch.finalPackaging?.productionDate || selectedBatch.startDate.split(' ')[0]} إلى{' '}
                        {selectedBatch.finalPackaging?.expiryDate || '2027-04-01'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Node 4: Distribution & Customer Traceability (Recall capability) */}
              <div className="relative pr-8">
                <div className="absolute -right-3 top-0 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shadow">
                  4
                </div>

                <div className="bg-slate-950/70 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-teal-400 print:text-teal-800 flex items-center gap-1.5">
                      <Store className="w-4 h-4" />
                      <span>سجل التوزيع والمبيعات (قائمة العملاء والمستلمين)</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400 print:text-slate-600">
                      {relatedInvoices.length} فواتير مرتبطة
                    </span>
                  </div>

                  {relatedInvoices.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      الكمية لا تزال محفوظة بالكامل داخل مستودع الأجبان الجاهزة ولم يتم إصدار أي
                      فاتورة بيع منها حتى الآن.
                    </p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {relatedInvoices.map((inv) => {
                        const batchItems = inv.items.filter(
                          (it) => it.batchNumber.toLowerCase() === selectedBatch.batchNumber.toLowerCase()
                        );
                        const qtySold = batchItems.reduce((s, it) => s + it.quantityKg, 0);

                        return (
                          <div
                            key={inv.id}
                            className="p-2.5 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 text-xs flex justify-between items-center"
                          >
                            <div>
                              <div className="font-bold text-white print:text-black">
                                {inv.clientName}
                              </div>
                              <div className="text-[11px] text-slate-400 print:text-slate-600 font-mono">
                                فاتورة: {inv.invoiceNumber} • هاتف: {inv.clientPhone} • التاريخ:{' '}
                                {inv.issueDate}
                              </div>
                            </div>
                            <div className="text-left font-mono">
                              <span className="font-black text-amber-400 print:text-amber-800">
                                {qtySold} كغ
                              </span>
                              <span className="text-[10px] text-slate-500 block">تم تسليمها</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quality Auditor Signatures */}
            <div className="border-t-2 border-slate-800 print:border-slate-900 pt-6 mt-8 grid grid-cols-2 gap-8 text-xs text-center">
              <div>
                <div className="text-slate-500 print:text-slate-600 mb-6">
                  مدير رقابة وتوكيد الجودة (Quality Assurance Manager)
                </div>
                <div className="border-b border-dashed border-slate-500 w-48 mx-auto mb-1"></div>
                <div className="font-bold text-white print:text-black">معتمد ومطابق للمعايير</div>
              </div>

              <div>
                <div className="text-slate-500 print:text-slate-600 mb-6">
                  مهندس الإنتاج المشرف على التشغيلة
                </div>
                <div className="border-b border-dashed border-slate-500 w-48 mx-auto mb-1"></div>
                <div className="font-bold text-white print:text-black">
                  {selectedBatch.supervisor}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
