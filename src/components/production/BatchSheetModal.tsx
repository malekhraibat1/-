import React from 'react';
import { ProductionBatch } from '../../types/cheeseFactory';
import { useFactory } from '../../context/FactoryContext';
import { X, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PRODUCTION_STAGES } from '../../data/initialData';

interface BatchSheetModalProps {
  batch: ProductionBatch | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BatchSheetModal: React.FC<BatchSheetModalProps> = ({
  batch,
  isOpen,
  onClose,
}) => {
  const { settings } = useFactory();

  if (!isOpen || !batch) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:max-w-none print:w-full print:h-auto print:max-h-none">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <ShieldCheck className="w-5 h-5" />
            <span>بطاقة تصنيع وضبط جودة الوجبة الغذائية (Batch Traveler & Quality Record)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs shadow transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة السجل (A4 / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Content */}
        <div className="p-8 space-y-6 overflow-y-auto flex-1 bg-white text-slate-900 rounded-b-2xl print:p-0 print:rounded-none">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {settings.factoryName}
              </h1>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                {settings.subTitle}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                س.ت: {settings.commercialRegistration} • الرقم الضريبي: {settings.taxNumber}
              </p>
            </div>
            <div className="text-left font-mono border border-slate-300 p-3 rounded-lg bg-slate-50">
              <div className="text-xs text-slate-500">رقم التشغيلة (Batch Lot #):</div>
              <div className="text-lg font-black text-amber-700">{batch.batchNumber}</div>
              <div className="text-[11px] text-slate-600 mt-1">
                تاريخ البدء: {batch.startDate}
              </div>
            </div>
          </div>

          <div className="text-center py-1 bg-slate-100 rounded border border-slate-300">
            <h2 className="text-base font-extrabold text-slate-800">
              استمارة متابعة وتتبع مراحل تصنيع: {batch.cheeseType}
            </h2>
          </div>

          {/* General Information Table */}
          <div className="grid grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block">المشرف المسؤول:</span>
              <span className="font-bold text-slate-800">{batch.supervisor}</span>
            </div>
            <div>
              <span className="text-slate-500 block">الوردية:</span>
              <span className="font-bold text-slate-800">{batch.shift}</span>
            </div>
            <div>
              <span className="text-slate-500 block">كمية الحليب المستلم:</span>
              <span className="font-bold text-slate-800 font-mono">
                {batch.milkReception.rawMilkLiters} لتر ({batch.milkReception.milkType})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">الوزن المستهدف / الفعلي:</span>
              <span className="font-bold text-slate-800 font-mono">
                {batch.finalPackaging?.finalWeightKg || batch.targetWeightKg} كغ
              </span>
            </div>
          </div>

          {/* Detailed Stages Quality Log */}
          <div className="space-y-4 text-xs">
            {/* 1. Milk Reception */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-200/80 px-3 py-1.5 font-bold flex justify-between items-center text-slate-800">
                <span>1. فحص استلام الحليب الخام (Milk Reception & Laboratory QC)</span>
                <span className="text-[11px] font-mono text-emerald-700 font-bold">
                  فحص المضاد: {batch.milkReception.antibioticTest}
                </span>
              </div>
              <div className="p-3 grid grid-cols-4 gap-2 bg-white">
                <div>
                  <span className="text-slate-500 block">المورد / المزرعة:</span>
                  <span className="font-semibold">{batch.milkReception.supplierName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">الحموضة (pH):</span>
                  <span className="font-mono font-bold">{batch.milkReception.acidityPH}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">نسبة الدسم Fat %:</span>
                  <span className="font-mono font-bold">{batch.milkReception.fatPercentage}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block">الكثافة والحرارة:</span>
                  <span className="font-mono font-bold">
                    {batch.milkReception.density} | {batch.milkReception.temperatureC}°C
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Pasteurization */}
            {batch.pasteurization && (
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-slate-200/80 px-3 py-1.5 font-bold text-slate-800">
                  2. المعاملة الحرارية والبسترة (Thermal Treatment & Pasteurization)
                </div>
                <div className="p-3 grid grid-cols-4 gap-2 bg-white">
                  <div>
                    <span className="text-slate-500 block">طريقة البسترة:</span>
                    <span className="font-semibold">{batch.pasteurization.method}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">درجة الحرارة والمدة:</span>
                    <span className="font-mono font-bold">
                      {batch.pasteurization.temperatureC}°C / {batch.pasteurization.durationMinutes} دقيقة
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">حرارة التبريد للتلقيح:</span>
                    <span className="font-mono font-bold">{batch.pasteurization.coolingTempC}°C</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">الجهاز والفني:</span>
                    <span className="font-semibold">{batch.pasteurization.operatorName}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Coagulation */}
            {batch.coagulation && (
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-slate-200/80 px-3 py-1.5 font-bold text-slate-800">
                  3. التلقيح والتخثير (Inoculation & Curdling)
                </div>
                <div className="p-3 grid grid-cols-4 gap-2 bg-white">
                  <div>
                    <span className="text-slate-500 block">البادئ البكتيري:</span>
                    <span className="font-semibold">
                      {batch.coagulation.starterCulture} ({batch.coagulation.starterGrams}غ)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">المنفحة المستخدمة:</span>
                    <span className="font-semibold">
                      {batch.coagulation.rennetType} ({batch.coagulation.rennetAmountMl}مل)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">حرارة وزمن التخثير:</span>
                    <span className="font-mono font-bold">
                      {batch.coagulation.settingTempC}°C / {batch.coagulation.coagulationDurationMinutes} دقيقة
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">قوام الخثرة:</span>
                    <span className="font-bold text-emerald-700">{batch.coagulation.curdFirmness}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Cutting & Pressing & Salting */}
            <div className="grid grid-cols-3 gap-3">
              {batch.cuttingCooking && (
                <div className="border border-slate-300 rounded-lg p-2.5 bg-white">
                  <div className="font-bold text-slate-800 mb-1 border-b pb-1">
                    4. التقطيع والطبخ
                  </div>
                  <div className="space-y-1">
                    <div>حجم الحبة: <b className="font-mono">{batch.cuttingCooking.curdSizeMm} ملم</b></div>
                    <div>حرارة الطبخ: <b className="font-mono">{batch.cuttingCooking.cookingTempC}°C</b></div>
                    <div>مدة التقليب: <b className="font-mono">{batch.cuttingCooking.stirringDurationMinutes} د</b></div>
                  </div>
                </div>
              )}

              {batch.pressing && (
                <div className="border border-slate-300 rounded-lg p-2.5 bg-white">
                  <div className="font-bold text-slate-800 mb-1 border-b pb-1">
                    5. الكبس والتشكيل
                  </div>
                  <div className="space-y-1">
                    <div>عدد القوالب: <b className="font-mono">{batch.pressing.moldsCount} قالب</b></div>
                    <div>ضغط الكبس: <b className="font-mono">{batch.pressing.pressureBar} بار</b></div>
                    <div>مدة الكبس: <b className="font-mono">{batch.pressing.pressingDurationHours} س</b></div>
                  </div>
                </div>
              )}

              {batch.salting && (
                <div className="border border-slate-300 rounded-lg p-2.5 bg-white">
                  <div className="font-bold text-slate-800 mb-1 border-b pb-1">
                    6. التمليح والبراين
                  </div>
                  <div className="space-y-1">
                    <div>الطريقة: <b>{batch.salting.method}</b></div>
                    <div>تركيز الملوحة: <b className="font-mono">{batch.salting.brineConcentrationPercent}%</b></div>
                    <div>ساعات النقع: <b className="font-mono">{batch.salting.brineDurationHours} س</b></div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Aging & Packaging Final */}
            {batch.finalPackaging && (
              <div className="border-2 border-emerald-600 rounded-lg overflow-hidden bg-emerald-50/50">
                <div className="bg-emerald-600 text-white px-3 py-1.5 font-bold flex justify-between items-center">
                  <span>النتيجة النهائية والوزن الصافي ومعدل التصافي (Final Packaging & Yield)</span>
                  <span className="font-mono">
                    كفاءة التصافي: {batch.finalPackaging.yieldEfficiencyPercent}%
                  </span>
                </div>
                <div className="p-3 grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">الوزن النهائي الصافي:</span>
                    <span className="font-mono font-black text-sm text-emerald-800">
                      {batch.finalPackaging.finalWeightKg} كغ
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">عدد العلب / القوالب:</span>
                    <span className="font-mono font-bold">{batch.finalPackaging.unitsCount} وحدة</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">تاريخ الإنتاج / الانتهاء:</span>
                    <span className="font-mono font-bold">
                      {batch.finalPackaging.productionDate} إلى {batch.finalPackaging.expiryDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">الباركود والموقع:</span>
                    <span className="font-mono font-bold">
                      {batch.finalPackaging.barcode} • {batch.finalPackaging.storageRoom}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Signatures & Certification Area */}
          <div className="border-t-2 border-slate-800 pt-6 mt-6 grid grid-cols-3 gap-6 text-xs text-center">
            <div>
              <div className="text-slate-500 mb-6">مسؤول ضبط وتوكيد الجودة (QA)</div>
              <div className="border-b border-dashed border-slate-400 w-36 mx-auto mb-1"></div>
              <div className="font-bold text-slate-800">التوقيع والاعتماد</div>
            </div>

            <div>
              <div className="text-slate-500 mb-6">مهندس الإنتاج / مشرف الوردية</div>
              <div className="border-b border-dashed border-slate-400 w-36 mx-auto mb-1"></div>
              <div className="font-bold text-slate-800">{batch.supervisor}</div>
            </div>

            <div>
              <div className="text-slate-500 mb-6">أمين مستودع المنتجات الجاهزة</div>
              <div className="border-b border-dashed border-slate-400 w-36 mx-auto mb-1"></div>
              <div className="font-bold text-slate-800">الاستلام والمطابقة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
