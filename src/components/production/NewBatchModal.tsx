import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { CheeseType } from '../../types/cheeseFactory';
import { X, Sparkles, AlertCircle, Droplets, User, Calendar } from 'lucide-react';

interface NewBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHEESE_TYPES: CheeseType[] = [
  'حلوم بلدي',
  'موزاريلا قوالب',
  'موزاريلا مبشورة',
  'عكاوي تشيكي',
  'فيتا بيضاء أصلية',
  'شيدر إنجليزي معتق',
  'قشقوان بلدي',
  'نابلسية مغلية بالمستكة',
  'جبنة قريش/ريكوتا',
  'دبل كريم غنية',
  'براميلي معتقة',
];

export const NewBatchModal: React.FC<NewBatchModalProps> = ({ isOpen, onClose }) => {
  const { createBatch, suppliers, settings, rawMaterials } = useFactory();

  const [cheeseType, setCheeseType] = useState<CheeseType>('حلوم بلدي');
  const [milkType, setMilkType] = useState<'بقري كامل الدسم' | 'غنم طازج' | 'ماعز طازج' | 'خليط بقري وغنم'>('بقري كامل الدسم');
  const [rawMilkLiters, setRawMilkLiters] = useState<number>(1000);
  const [fatPercentage, setFatPercentage] = useState<number>(3.8);
  const [proteinPercentage, setProteinPercentage] = useState<number>(3.2);
  const [acidityPH, setAcidityPH] = useState<number>(6.65);
  const [density, setDensity] = useState<number>(1.031);
  const [temperatureC, setTemperatureC] = useState<number>(4.2);
  const [antibioticTest, setAntibioticTest] = useState<'سليم (سلبي)' | 'مشتبه به' | 'مرفوض'>('سليم (سلبي)');
  const [supplierName, setSupplierName] = useState<string>(suppliers[0]?.name || 'مزرعة الواحة الحديثة للألبان');
  const [supervisor, setSupervisor] = useState<string>(settings.defaultSupervisor || 'م. سامي العمراني');
  const [shift, setShift] = useState<'صباحية' | 'مسائية' | 'ليلية'>('صباحية');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  // Expected yield multiplier estimate based on milk and cheese type
  const yieldRatio =
    cheeseType.includes('حلوم') ? 0.115 :
    cheeseType.includes('موزاريلا') ? 0.108 :
    cheeseType.includes('عكاوي') ? 0.12 :
    cheeseType.includes('فيتا') ? 0.13 :
    cheeseType.includes('شيدر') ? 0.10 :
    cheeseType.includes('قريش') ? 0.08 : 0.11;

  const targetWeightKg = Math.round(rawMilkLiters * yieldRatio * 10) / 10;

  // Generate batch lot number
  const todayStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const prefix = cheeseType.substring(0, 3);
  const randomSuffix = Math.floor(10 + Math.random() * 89);
  const batchNumber = `CH-${todayStr}-${randomSuffix}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rawMilkLiters <= 0) {
      alert('يرجى تحديد كمية حليب صالحة');
      return;
    }

    createBatch({
      batchNumber,
      cheeseType,
      supervisor,
      shift,
      startDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      targetWeightKg,
      notes: notes.trim(),
      milkReception: {
        milkType,
        rawMilkLiters,
        fatPercentage,
        proteinPercentage,
        acidityPH,
        density,
        temperatureC,
        antibioticTest,
        supplierName,
        receptionTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        notes,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                بدء تشغيلة إنتاج جديدة (New Cheese Batch)
              </h3>
              <p className="text-xs text-slate-400">
                تسجيل بيانات استلام الحليب الخام وفحوصات الجودة للمرحلة الأولى
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: General Batch Setup */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 border-b border-slate-800 pb-2">
              <span>المعلومات الأساسية للوجبة ورقم التشغيلة</span>
              <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-200">
                رقم اللوت المقترح: {batchNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  نوع الجبنة المراد تصنيعها *
                </label>
                <select
                  value={cheeseType}
                  onChange={(e) => setCheeseType(e.target.value as CheeseType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-500 focus:outline-none"
                >
                  {CHEESE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  مهندس الإنتاج / المشرف *
                </label>
                <input
                  type="text"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  الوردية الحالية *
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="صباحية">صباحية (06:00 - 14:00)</option>
                  <option value="مسائية">مسائية (14:00 - 22:00)</option>
                  <option value="ليلية">ليلية (22:00 - 06:00)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Raw Milk Specs & Quality Testing */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 border-b border-slate-800 pb-2">
              <Droplets className="w-4 h-4" />
              <span>المرحلة 1: استلام الحليب الخام والفحوصات المخبرية (Milk Specs & QC)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  مصدر الحليب ومزرعة التوريد *
                </label>
                <select
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.name}>
                      {sup.name} ({sup.location})
                    </option>
                  ))}
                  <option value="خزانات المعمل المجمعة">خزانات المعمل المجمعة</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  صنف ونوع الحليب *
                </label>
                <select
                  value={milkType}
                  onChange={(e) => setMilkType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="بقري كامل الدسم">بقري كامل الدسم</option>
                  <option value="غنم طازج">غنم طازج (نسبة تصافي أعلى)</option>
                  <option value="ماعز طازج">ماعز طازج</option>
                  <option value="خليط بقري وغنم">خليط بقري وغنم (للحلوم والعكاوي)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  الكمية المستلمة للتشغيلة (لتر) *
                </label>
                <input
                  type="number"
                  min="50"
                  step="10"
                  value={rawMilkLiters}
                  onChange={(e) => setRawMilkLiters(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Quality parameters grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">
                  الحموضة (pH) [طبيعي 6.6-6.7]
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={acidityPH}
                  onChange={(e) => setAcidityPH(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">
                  نسبة الدسم Fat % [3.2-4.5%]
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fatPercentage}
                  onChange={(e) => setFatPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">
                  الكثافة [1.028 - 1.033]
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={density}
                  onChange={(e) => setDensity(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">
                  حرارة الاستلام (°C) [&le; 4.5°C]
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temperatureC}
                  onChange={(e) => setTemperatureC(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">
                  فحص المضادات الحيوية
                </label>
                <select
                  value={antibioticTest}
                  onChange={(e) => setAntibioticTest(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="سليم (سلبي)">سليم (سلبي)</option>
                  <option value="مشتبه به">مشتبه به</option>
                  <option value="مرفوض">مرفوض</option>
                </select>
              </div>
            </div>

            {/* Yield Projection Preview Box */}
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-amber-300 font-bold block">
                  تقدير كمية الجبن الناتجة (Yield Forecast):
                </span>
                <span className="text-slate-400 text-[11px]">
                  بناءً على نوع الجبنة وكمية الحليب المقدرة بنسبة استخراج ~{(yieldRatio * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-left font-mono">
                <span className="text-xl font-black text-amber-400">{targetWeightKg}</span>
                <span className="text-xs text-slate-300 mr-1">كغ جبن صافي متوقع</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              ملاحظات إضافية وتوجيهات للوردية:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: التأكيد على نقع القوالب لمدة 10 ساعات في حوض البراين رقم 2..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              بدء الطبخة والترحيل للمرحلة الأولى
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
