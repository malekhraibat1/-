import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { ProductionBatch } from '../../types/cheeseFactory';
import { PRODUCTION_STAGES } from '../../data/initialData';
import { X, ArrowLeft, CheckCircle2, Flame, Sparkles, Scissors, Filter, Layers, Waves, Clock, PackageCheck } from 'lucide-react';

interface AdvanceStageModalProps {
  batch: ProductionBatch | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdvanceStageModal: React.FC<AdvanceStageModalProps> = ({
  batch,
  isOpen,
  onClose,
}) => {
  const { advanceBatchStage } = useFactory();

  if (!isOpen || !batch) return null;

  const currentStageIndex = batch.currentStageIndex;
  const currentStageDef = PRODUCTION_STAGES[currentStageIndex];
  const nextStageIndex = currentStageIndex + 1;
  const nextStageDef = PRODUCTION_STAGES[nextStageIndex];

  if (!nextStageDef) {
    return null; // Already completed
  }

  // Stage 1 -> 2: Pasteurization inputs
  const [pastTemp, setPastTemp] = useState<number>(72);
  const [pastDuration, setPastDuration] = useState<number>(1);
  const [coolingTemp, setCoolingTemp] = useState<number>(34);
  const [pastMachine, setPastMachine] = useState<string>('خط البسترة السريعة HTST-01');
  const [pastOperator, setPastOperator] = useState<string>('كريم المنصور');

  // Stage 2 -> 3: Coagulation inputs
  const [cultureName, setCultureName] = useState<string>('بكتيريا CHR Hansen الدنماركية');
  const [cultureGrams, setCultureGrams] = useState<number>(50);
  const [rennetType, setRennetType] = useState<any>('منفحة ميكروبية سائلة');
  const [rennetAmountMl, setRennetAmountMl] = useState<number>(200);
  const [caclAmountGrams, setCaclAmountGrams] = useState<number>(150);
  const [settingTemp, setSettingTemp] = useState<number>(34);
  const [coagulationDuration, setCoagulationDuration] = useState<number>(40);
  const [curdFirmness, setCurdFirmness] = useState<any>('صلبة ممتازة');

  // Stage 3 -> 4: Cutting & Cooking inputs
  const [cutSizeMm, setCutSizeMm] = useState<number>(10);
  const [cookingTemp, setCookingTemp] = useState<number>(39);
  const [stirringMinutes, setStirringMinutes] = useState<number>(25);
  const [scaldingMethod, setScaldingMethod] = useState<any>('تسخين تدريجي');

  // Stage 4 -> 5: Draining inputs
  const [wheyLiters, setWheyLiters] = useState<number>(Math.round(batch.milkReception.rawMilkLiters * 0.85));
  const [wheyPh, setWheyPh] = useState<number>(6.2);
  const [wheyUtilization, setWheyUtilization] = useState<any>('تحويل لجبن ريكوتا/قريش');

  // Stage 5 -> 6: Pressing inputs
  const [moldsCount, setMoldsCount] = useState<number>(20);
  const [moldShape, setMoldShape] = useState<any>('قوالب بلوك مستطيلة');
  const [pressureBar, setPressureBar] = useState<number>(2.5);
  const [pressingHours, setPressingHours] = useState<number>(2);
  const [curdWeightKg, setCurdWeightKg] = useState<number>(Math.round(batch.milkReception.rawMilkLiters * 0.12));

  // Stage 6 -> 7: Salting inputs
  const [saltingMethod, setSaltingMethod] = useState<any>('حوض محلول ملحي (Brine)');
  const [salinityPercent, setSalinityPercent] = useState<number>(19);
  const [brineTemp, setBrineTemp] = useState<number>(12);
  const [brineHours, setBrineHours] = useState<number>(8);

  // Stage 7 -> 8: Aging inputs
  const [chamberId, setChamberId] = useState<string>('غرفة إنضاج وتعتيق A-2');
  const [agingTemp, setAgingTemp] = useState<number>(11);
  const [humidity, setHumidity] = useState<number>(85);
  const [targetDays, setTargetDays] = useState<number>(14);
  const [turningSchedule, setTurningSchedule] = useState<any>('كل يومين');

  // Stage 8 -> 9: Final Packaging & Completion inputs
  const [finalWeightKg, setFinalWeightKg] = useState<number>(batch.targetWeightKg);
  const [unitsCount, setUnitsCount] = useState<number>(Math.round(batch.targetWeightKg));
  const [packageType, setPackageType] = useState<any>('أكياس تفريغ هواء (فاكيوم)');
  const [storageRoom, setStorageRoom] = useState<string>('براد المستودع الرئيسي R-1');
  const [qualityGrade, setQualityGrade] = useState<any>('درجة أولى (نخب أول)');
  const [barcode, setBarcode] = useState<string>(`628100${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [expiryMonths, setExpiryMonths] = useState<number>(6);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let payload: any = {};

    if (batch.status === 'milk_reception') {
      payload = {
        pasteurization: {
          method: pastTemp >= 70 ? 'بسترة سريعة (HTST) 72°C / 15s' : 'بسترة بطيئة (LTLT) 65°C / 30min',
          temperatureC: pastTemp,
          durationMinutes: pastDuration,
          coolingTempC: coolingTemp,
          machineId: pastMachine,
          operatorName: pastOperator,
          completedAt: timestamp,
        },
      };
    } else if (batch.status === 'pasteurization') {
      payload = {
        coagulation: {
          starterCulture: cultureName,
          starterGrams: cultureGrams,
          rennetType,
          rennetAmountMl,
          calciumChlorideGrams: caclAmountGrams,
          settingTempC: settingTemp,
          coagulationDurationMinutes: coagulationDuration,
          curdFirmness,
          completedAt: timestamp,
        },
      };
    } else if (batch.status === 'coagulation') {
      payload = {
        cuttingCooking: {
          curdSizeMm: cutSizeMm,
          cookingTempC: cookingTemp,
          stirringDurationMinutes: stirringMinutes,
          scaldingMethod,
          completedAt: timestamp,
        },
      };
    } else if (batch.status === 'cutting_cooking') {
      payload = {
        draining: {
          wheyExtractedLiters: wheyLiters,
          wheyPH: wheyPh,
          wheyUtilization,
          completedAt: timestamp,
        },
      };
    } else if (batch.status === 'draining') {
      payload = {
        pressing: {
          moldsCount,
          moldShape,
          pressureBar,
          pressingDurationHours: pressingHours,
          finalCurdWeightBeforeBrineKg: curdWeightKg,
          completedAt: timestamp,
        },
      };
    } else if (batch.status === 'pressing') {
      payload = {
        salting: {
          method: saltingMethod,
          brineConcentrationPercent: salinityPercent,
          brineTempC: brineTemp,
          brineDurationHours: brineHours,
          completedAt: timestamp,
        },
      };
    } else if (batch.status === 'salting') {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + targetDays);
      payload = {
        aging: {
          chamberId,
          temperatureC: agingTemp,
          humidityPercent: humidity,
          targetDurationDays: targetDays,
          currentDay: 1,
          turningSchedule,
          startDate: timestamp.split(' ')[0],
          expectedEndDate: expDate.toISOString().slice(0, 10),
          completedAt: timestamp,
        },
      };
    } else if (batch.status === 'aging') {
      const prodDate = new Date();
      const expDate = new Date();
      expDate.setMonth(expDate.getMonth() + expiryMonths);

      const yieldEfficiencyPercent =
        Math.round(((finalWeightKg / (batch.milkReception.rawMilkLiters || 1)) * 100) * 100) / 100;

      payload = {
        finalPackaging: {
          finalWeightKg,
          unitsCount,
          packageType,
          storageRoom,
          productionDate: prodDate.toISOString().slice(0, 10),
          expiryDate: expDate.toISOString().slice(0, 10),
          qualityGrade,
          barcode,
          yieldEfficiencyPercent,
          notes: 'تم فحص الشحنة وتغليفها واعتماد الباركود والمطابقة لترحيلها للمخزن الجاهز.',
          completedAt: timestamp,
        },
      };
    }

    advanceBatchStage(batch.id, payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  تسجيل الانتقال إلى: {nextStageDef.arabicName}
                </h3>
                <span className="font-mono text-xs bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700">
                  {batch.batchNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                نوع الجبنة: {batch.cheeseType} • المرحلة الحالية:{' '}
                {currentStageDef?.arabicName}
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

        {/* Dynamic Form per Stage */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Step 1 -> 2: Pasteurization */}
          {batch.status === 'milk_reception' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                <Flame className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  المرحلة الثانية: المعاملة الحرارية والبسترة لقتل مسببات الأمراض وضمان أمان المنتج
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    درجة حرارة البسترة (°C) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={pastTemp}
                    onChange={(e) => setPastTemp(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500">
                    65°C للبسترة البطيئة أو 72°C للبسترة السريعة
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    مدة المعاملة بالدقائق/الثواني *
                  </label>
                  <input
                    type="number"
                    value={pastDuration}
                    onChange={(e) => setPastDuration(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    درجة التبريد المستهدفة للتلقيح (°C) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={coolingTemp}
                    onChange={(e) => setCoolingTemp(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500">عادة بين 32°C إلى 35°C</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    فني التشغيل المسؤول *
                  </label>
                  <input
                    type="text"
                    value={pastOperator}
                    onChange={(e) => setPastOperator(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 -> 3: Coagulation */}
          {batch.status === 'pasteurization' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-purple-400" />
                <span>
                  المرحلة الثالثة: التلقيح البكتيري وإضافة المنفحة لتخثير بروتين الكازين وتكوين الخثرة
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    اسم ونوع البادئ البكتيري (Culture) *
                  </label>
                  <input
                    type="text"
                    value={cultureName}
                    onChange={(e) => setCultureName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    كمية البادئ (غرام) *
                  </label>
                  <input
                    type="number"
                    value={cultureGrams}
                    onChange={(e) => setCultureGrams(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    نوع المنفحة المستخدمة *
                  </label>
                  <select
                    value={rennetType}
                    onChange={(e) => setRennetType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="منفحة ميكروبية سائلة">منفحة ميكروبية سائلة (نباتية/فطرية)</option>
                    <option value="منفحة عجل طبيعية">منفحة عجل طبيعية أصلية</option>
                    <option value="منفحة حبيبات مركزة">منفحة حبيبات مركزة 100%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    كمية المنفحة (مل / غرام) *
                  </label>
                  <input
                    type="number"
                    value={rennetAmountMl}
                    onChange={(e) => setRennetAmountMl(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    زمن التخثير (بالدقائق) *
                  </label>
                  <input
                    type="number"
                    value={coagulationDuration}
                    onChange={(e) => setCoagulationDuration(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    صلابة وتماسك الخثرة *
                  </label>
                  <select
                    value={curdFirmness}
                    onChange={(e) => setCurdFirmness(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="صلبة ممتازة">صلبة ممتازة (قاطع نظيف Clean Break)</option>
                    <option value="متوسطة">متوسطة</option>
                    <option value="طرية">طرية</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 -> 4: Cutting & Cooking */}
          {batch.status === 'coagulation' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-center gap-2">
                <Scissors className="w-4 h-4 shrink-0 text-blue-400" />
                <span>
                  المرحلة الرابعة: تقطيع الخثرة وطبخها / تحريكها لطرد الرطوبة وضبط نسيج الجبن
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    حجم حبة الخثرة بعد التقطيع (ملم) *
                  </label>
                  <input
                    type="number"
                    value={cutSizeMm}
                    onChange={(e) => setCutSizeMm(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500">
                    6-8 ملم للصلب (شيدر)، 10-15 ملم للطري والحلوم
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    درجة حرارة الطبخ والتقليب (°C) *
                  </label>
                  <input
                    type="number"
                    value={cookingTemp}
                    onChange={(e) => setCookingTemp(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    مدة التحريك والتقليب (دقيقة) *
                  </label>
                  <input
                    type="number"
                    value={stirringMinutes}
                    onChange={(e) => setStirringMinutes(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    طريقة المعاملة الحرارية للخثرة
                  </label>
                  <select
                    value={scaldingMethod}
                    onChange={(e) => setScaldingMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="تسخين تدريجي">تسخين تدريجي في الحوض</option>
                    <option value="غلي مباشر في المصل (حلوم)">غلي مباشر في المصل (حلوم تقليدي)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 -> 5: Draining */}
          {batch.status === 'cutting_cooking' && (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 flex items-center gap-2">
                <Filter className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>المرحلة الخامسة: تصفية وسحب مصل اللبن (الشرش) وعزل الخثرة</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    كمية الشرش المستخرج باللتر *
                  </label>
                  <input
                    type="number"
                    value={wheyLiters}
                    onChange={(e) => setWheyLiters(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    حموضة مصل اللبن (pH)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={wheyPh}
                    onChange={(e) => setWheyPh(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">
                    مسار الاستفادة من الشرش المفصول *
                  </label>
                  <select
                    value={wheyUtilization}
                    onChange={(e) => setWheyUtilization(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="تحويل لجبن ريكوتا/قريش">
                      تحويل لجبن ريكوتا وقريش (استثمار القيمة المضافة)
                    </option>
                    <option value="تصريف للمزارع">توريد كأعلاف لمزارع المواشي</option>
                    <option value="استخلاص مصل مجفف">استخلاص بودرة البروتين WPC</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 5 -> 6: Pressing */}
          {batch.status === 'draining' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                <Layers className="w-4 h-4 shrink-0 text-amber-400" />
                <span>المرحلة السادسة: الكبس الهيدروليكي والتشكيل في القوالب المخصصة</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    عدد القوالب المستخدمة *
                  </label>
                  <input
                    type="number"
                    value={moldsCount}
                    onChange={(e) => setMoldsCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    شكل ونوع القالب *
                  </label>
                  <select
                    value={moldShape}
                    onChange={(e) => setMoldShape(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="قوالب بلوك مستطيلة">قوالب بلوك مستطيلة</option>
                    <option value="أقراص دائرية">أقراص دائرية</option>
                    <option value="قوالب صغيرة">قوالب صغيرة مخصصة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    ضغط الكبس (بار Bar) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={pressureBar}
                    onChange={(e) => setPressureBar(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    مدة الكبس (ساعات) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={pressingHours}
                    onChange={(e) => setPressingHours(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6 -> 7: Salting */}
          {batch.status === 'pressing' && (
            <div className="space-y-4">
              <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs text-teal-300 flex items-center gap-2">
                <Waves className="w-4 h-4 shrink-0 text-teal-400" />
                <span>المرحلة السابعة: التمليح في أحواض المحلول الملحي المعقم (Brine)</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    طريقة التمليح المتبعة *
                  </label>
                  <select
                    value={saltingMethod}
                    onChange={(e) => setSaltingMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="حوض محلول ملحي (Brine)">غمر في حوض محلول ملحي (Brining)</option>
                    <option value="تمليح جاف سطحي (Dry Salting)">تمليح جاف سطحي (Dry Salting)</option>
                    <option value="غلي بماء ملحي مع الحبة السوداء">
                      غلي بماء ملحي مع حبة البركة (نابلسية)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    تركيز الملوحة % (Salinity) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={salinityPercent}
                    onChange={(e) => setSalinityPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500">عادة بين 18% إلى 22%</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    حرارة المحلول الملحي (°C) *
                  </label>
                  <input
                    type="number"
                    value={brineTemp}
                    onChange={(e) => setBrineTemp(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    مدة الغمر في التمليح (ساعات) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={brineHours}
                    onChange={(e) => setBrineHours(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 7 -> 8: Aging */}
          {batch.status === 'salting' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>المرحلة الثامنة: التعتيق والإنضاج وضبط بيئة الغرف المبردة</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    غرفة التعتيق المخصصة *
                  </label>
                  <input
                    type="text"
                    value={chamberId}
                    onChange={(e) => setChamberId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    مدة التعتيق المقررة (بالأيام) *
                  </label>
                  <input
                    type="number"
                    value={targetDays}
                    onChange={(e) => setTargetDays(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    درجة حرارة الغرفة (°C) *
                  </label>
                  <input
                    type="number"
                    value={agingTemp}
                    onChange={(e) => setAgingTemp(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500">10°C - 14°C للإنضاج الطبيعي</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    الرطوبة النسبية RH % *
                  </label>
                  <input
                    type="number"
                    value={humidity}
                    onChange={(e) => setHumidity(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500">80% - 88% لتفادي جفاف القشرة</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 8 -> 9: Final Packaging & Auto-Registering into Stock */}
          {batch.status === 'aging' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <PackageCheck className="w-5 h-5 shrink-0 text-emerald-400" />
                <span>
                  المرحلة الأخيرة: الوزن الفعلي النهائي، التعبئة، وحساب معدل التصافي، وترحيل الكمية
                  تلقائياً إلى مستودع المنتجات الجاهزة!
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    الوزن الفعلي الصافي للجبن الناتج (كغ) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={finalWeightKg}
                    onChange={(e) => setFinalWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                    required
                  />
                  <span className="text-[10px] text-slate-400">
                    كمية الحليب الأصلية كانت: {batch.milkReception.rawMilkLiters} لتر
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    عدد العلب / القوالب المغلفة *
                  </label>
                  <input
                    type="number"
                    value={unitsCount}
                    onChange={(e) => setUnitsCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    نوع التغليف والتعبئة *
                  </label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="أكياس تفريغ هواء (فاكيوم)">أكياس تفريغ هواء (فاكيوم)</option>
                    <option value="أوعية محلول ملحي محكمة">أوعية محلول ملحي محكمة (سطول)</option>
                    <option value="قصدير معدني 5 كغ">قصدير معدني 5 كغ معقم</option>
                    <option value="تغليف شمعي أحمر">تغليف شمعي أحمر للأجبان الصلبة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    مستودع التخزين والبراد *
                  </label>
                  <input
                    type="text"
                    value={storageRoom}
                    onChange={(e) => setStorageRoom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    مدة الصلاحية بالأشهر
                  </label>
                  <input
                    type="number"
                    value={expiryMonths}
                    onChange={(e) => setExpiryMonths(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    الباركود الدولي المقترح
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Yield Calculation Live Box */}
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-purple-300 block">
                    معدل التصافي الفعلي المحسوب:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    نسبة استخراج الجبن = ({finalWeightKg} كغ ÷ {batch.milkReception.rawMilkLiters} لتر) × 100
                  </span>
                </div>
                <div className="text-left font-mono">
                  <span className="text-xl font-black text-purple-300">
                    {(
                      (finalWeightKg / (batch.milkReception.rawMilkLiters || 1)) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>تأكيد تسجيل بيانات المرحلة والانتقال</span>
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
