import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { ProductionBatch, CheeseType } from '../../types/cheeseFactory';
import { PRODUCTION_STAGES } from '../../data/initialData';
import {
  Factory,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  ChevronLeft,
  Flame,
  Sparkles,
  Droplets,
  Layers,
  Waves,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { NewBatchModal } from './NewBatchModal';
import { AdvanceStageModal } from './AdvanceStageModal';
import { BatchSheetModal } from './BatchSheetModal';

interface ProductionViewProps {
  onSelectBatchForTraceability: (batchNumber: string) => void;
  openNewBatchModalTrigger?: boolean;
  onCloseNewBatchTrigger?: () => void;
}

export const ProductionView: React.FC<ProductionViewProps> = ({
  onSelectBatchForTraceability,
}) => {
  const { batches } = useFactory();

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('active');
  const [filterCheeseType, setFilterCheeseType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedBatchForAdvance, setSelectedBatchForAdvance] = useState<ProductionBatch | null>(null);
  const [selectedBatchForSheet, setSelectedBatchForSheet] = useState<ProductionBatch | null>(null);

  // Filter batches
  const filteredBatches = batches.filter((b) => {
    if (filterStatus === 'active' && (b.status === 'completed' || b.status === 'cancelled')) return false;
    if (filterStatus === 'completed' && b.status !== 'completed') return false;
    if (filterCheeseType !== 'all' && b.cheeseType !== filterCheeseType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = b.batchNumber.toLowerCase().includes(q);
      const matchType = b.cheeseType.toLowerCase().includes(q);
      const matchSup = b.supervisor.toLowerCase().includes(q);
      if (!matchNumber && !matchType && !matchSup) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Factory className="w-6 h-6 text-amber-400" />
              <span>تتبع مراحل الإنتاج والتشغيلات (Production Tracking)</span>
            </h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              {filteredBatches.length} تشغيلة
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل ومراقبة البسترة، إضافة المنفحة، التقطيع، فصل الشرش، الكبس، التمليح، والتعتيق بدقة
            عالية
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>بدء تشغيلة / طبخة جديدة</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterStatus === 'active'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الوجبات قيد التشغيل (النشطة)
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterStatus === 'completed'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              المكتملة والجاهزة
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterStatus === 'all'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              كل الوجبات
            </button>
          </div>

          {/* Cheese Type Filter */}
          <select
            value={filterCheeseType}
            onChange={(e) => setFilterCheeseType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="all">كل أصناف الجبن</option>
            <option value="حلوم بلدي">حلوم بلدي</option>
            <option value="موزاريلا قوالب">موزاريلا قوالب</option>
            <option value="عكاوي تشيكي">عكاوي تشيكي</option>
            <option value="فيتا بيضاء أصلية">فيتا بيضاء أصلية</option>
            <option value="شيدر إنجليزي معتق">شيدر إنجليزي معتق</option>
            <option value="نابلسية مغلية بالمستكة">نابلسية مغلية بالمستكة</option>
            <option value="جبنة قريش/ريكوتا">جبنة قريش/ريكوتا</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم التشغيلة، المسؤول..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Production Batches Cards List */}
      <div className="space-y-4">
        {filteredBatches.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-base font-bold text-slate-300">لا توجد تشغيلات تطابق هذا البحث</p>
            <p className="text-xs text-slate-500 mt-1">
              قم بتغيير خيارات الفلترة أو ابدأ تشغيلة إنتاج جديدة الآن.
            </p>
          </div>
        ) : (
          filteredBatches.map((batch) => {
            const currentStageDef = PRODUCTION_STAGES[batch.currentStageIndex];
            const isCompleted = batch.status === 'completed';
            const progressPct = Math.round(
              ((batch.currentStageIndex + 1) / PRODUCTION_STAGES.length) * 100
            );

            return (
              <div
                key={batch.id}
                className={`bg-slate-900/90 border rounded-2xl p-5 shadow-lg transition hover:border-slate-700 ${
                  isCompleted ? 'border-emerald-500/30' : 'border-slate-800'
                }`}
              >
                {/* Batch Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
                      {batch.batchNumber}
                    </span>
                    <div>
                      <h3 className="text-base font-black text-white">{batch.cheeseType}</h3>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>المشرف: {batch.supervisor}</span>
                        <span>•</span>
                        <span>الوردية: {batch.shift}</span>
                        <span>•</span>
                        <span>تاريخ البدء: {batch.startDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {isCompleted
                        ? 'مكتملة ومرحلة للمستودع'
                        : `المرحلة ${batch.currentStageIndex + 1}: ${currentStageDef?.arabicName}`}
                    </span>
                  </div>
                </div>

                {/* Stages Flow Visual Track */}
                <div className="py-4">
                  <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 text-center">
                    {PRODUCTION_STAGES.map((stg, idx) => {
                      const isPast = idx < batch.currentStageIndex;
                      const isCurrent = idx === batch.currentStageIndex;

                      return (
                        <div
                          key={stg.id}
                          className={`p-2 rounded-lg border text-[11px] transition-all ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20 scale-[1.03]'
                              : isPast
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 font-medium'
                              : 'bg-slate-950/40 text-slate-600 border-slate-800'
                          }`}
                        >
                          <div className="text-[9px] opacity-75 font-mono">#{stg.stepNumber}</div>
                          <div className="truncate font-semibold mt-0.5" title={stg.arabicName}>
                            {stg.arabicName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Key Technical Parameters Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 my-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">الحليب المستلم:</span>
                    <span className="font-bold text-slate-200">
                      {batch.milkReception.rawMilkLiters} لتر ({batch.milkReception.milkType})
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      المورد: {batch.milkReception.supplierName}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">فحوصات الجودة المخبرية:</span>
                    <span className="font-bold text-slate-200 font-mono">
                      pH {batch.milkReception.acidityPH} | دسم {batch.milkReception.fatPercentage}%
                    </span>
                    <span className="text-[10px] text-emerald-400 block">
                      فحص المضاد: {batch.milkReception.antibioticTest}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">الكمية ومعدل التصافي:</span>
                    {isCompleted && batch.finalPackaging ? (
                      <>
                        <span className="font-bold text-emerald-400 font-mono">
                          الناتج: {batch.finalPackaging.finalWeightKg} كغ صافي
                        </span>
                        <span className="text-[10px] text-purple-300 block font-mono">
                          التصافي: {batch.finalPackaging.yieldEfficiencyPercent}%
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-amber-300 font-mono">
                          المتوقع: ~{batch.targetWeightKg} كغ
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          قيد مراحل المعالجة
                        </span>
                      </>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">أحدث الإجراءات:</span>
                    <span className="font-bold text-slate-300">
                      {batch.aging
                        ? `تعتيق: ${batch.aging.chamberId} (${batch.aging.targetDurationDays} يوم)`
                        : batch.salting
                        ? `تمليح: ${batch.salting.brineConcentrationPercent}% براين`
                        : batch.coagulation
                        ? `تخثير: ${batch.coagulation.rennetType}`
                        : batch.pasteurization
                        ? `بسترة: ${batch.pasteurization.temperatureC}°C`
                        : 'استلام وفحص مخبري'}
                    </span>
                  </div>
                </div>

                {/* Actions & Next Stage Progression */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBatchForSheet(batch)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>بطاقة التشغيلة للمعمل (A4)</span>
                    </button>

                    <button
                      onClick={() => onSelectBatchForTraceability(batch.batchNumber)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 hover:bg-indigo-900/50 text-indigo-300 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>تتبع سلامة الغذاء (Traceability)</span>
                    </button>
                  </div>

                  {!isCompleted && (
                    <button
                      onClick={() => setSelectedBatchForAdvance(batch)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>
                        تسجيل الانتقال إلى:{' '}
                        {PRODUCTION_STAGES[batch.currentStageIndex + 1]?.arabicName}
                      </span>
                      <ChevronLeft className="w-4 h-4 stroke-[3]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <NewBatchModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />

      <AdvanceStageModal
        batch={selectedBatchForAdvance}
        isOpen={!!selectedBatchForAdvance}
        onClose={() => setSelectedBatchForAdvance(null)}
      />

      <BatchSheetModal
        batch={selectedBatchForSheet}
        isOpen={!!selectedBatchForSheet}
        onClose={() => setSelectedBatchForSheet(null)}
      />
    </div>
  );
};
