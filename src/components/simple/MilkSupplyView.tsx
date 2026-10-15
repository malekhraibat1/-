import React, { useState } from 'react';
import { useDairy } from '../../context/DairyContext';
import { MilkSupplyEntry } from '../../types/dairySimple';
import {
  Milk,
  Plus,
  Calendar,
  DollarSign,
  CreditCard,
  Printer,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface MilkSupplyViewProps {
  onPrintReceipt: (entry: MilkSupplyEntry) => void;
}

export const MilkSupplyView: React.FC<MilkSupplyViewProps> = ({ onPrintReceipt }) => {
  const { suppliers, milkSupplies, settings, addMilkSupply, deleteMilkSupply } = useDairy();

  // Form State
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [quantityLiters, setQuantityLiters] = useState<string>('800');
  const [pricePerLiter, setPricePerLiter] = useState<string>(
    suppliers[0]?.pricePerLiterDefault?.toString() || settings.defaultMilkPrice.toString()
  );

  const [paymentType, setPaymentType] = useState<'نقداً' | 'شيك' | 'نقداً وشيك' | 'آجل (ذمة)'>('نقداً');
  const [paidCash, setPaidCash] = useState<string>('520');
  const [paidCheque, setPaidCheque] = useState<string>('0');

  // Cheque details
  const [chequeHolderName, setChequeHolderName] = useState<string>('');
  const [chequeNumber, setChequeNumber] = useState<string>('');
  const [chequeDate, setChequeDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [bankName, setBankName] = useState<string>('البنك العربي');

  const [notes, setNotes] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');

  // When supplier changes, auto-fill default price
  const handleSupplierChange = (supId: string) => {
    setSupplierId(supId);
    const sup = suppliers.find((s) => s.id === supId);
    if (sup && sup.pricePerLiterDefault) {
      setPricePerLiter(sup.pricePerLiterDefault.toString());
    }
  };

  // Calculations for live preview
  const qLiters = parseFloat(quantityLiters) || 0;
  const pLiter = parseFloat(pricePerLiter) || 0;
  const totalMilkCost = Math.round(qLiters * pLiter * 100) / 100;

  const cashVal = paymentType === 'شيك' ? 0 : paymentType === 'آجل (ذمة)' ? 0 : parseFloat(paidCash) || 0;
  const chequeVal = paymentType === 'نقداً' ? 0 : paymentType === 'آجل (ذمة)' ? 0 : parseFloat(paidCheque) || 0;
  const totalPaidLive = Math.round((cashVal + chequeVal) * 100) / 100;

  const diffLive = Math.round((totalMilkCost - totalPaidLive) * 100) / 100;
  let balanceStatusLive: 'لنا' | 'علينا' | 'خالص' = 'خالص';
  let balanceAmountLive = 0;

  if (diffLive > 0) {
    balanceStatusLive = 'علينا';
    balanceAmountLive = diffLive;
  } else if (diffLive < 0) {
    balanceStatusLive = 'لنا';
    balanceAmountLive = Math.abs(diffLive);
  }

  // Handle auto-matching total when selecting Cash or Cheque
  const handleAutoFillTotal = () => {
    if (paymentType === 'نقداً') {
      setPaidCash(totalMilkCost.toString());
    } else if (paymentType === 'شيك') {
      setPaidCheque(totalMilkCost.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qLiters <= 0 || pLiter <= 0) {
      alert('يرجى التأكد من إدخال كمية لترات وسعر لتر صحيح.');
      return;
    }

    const sup = suppliers.find((s) => s.id === supplierId);
    const supplierName = sup ? sup.name : 'مورد حليب';

    const hasCheque = paymentType === 'شيك' || paymentType === 'نقداً وشيك';

    const newEntry = addMilkSupply({
      date,
      supplierId,
      supplierName,
      quantityLiters: qLiters,
      pricePerLiter: pLiter,
      paymentType,
      paidCash: cashVal,
      paidCheque: chequeVal,
      chequeDetails: hasCheque
        ? {
            chequeHolderName: chequeHolderName.trim() || supplierName,
            chequeNumber: chequeNumber.trim() || `CHK-${Date.now().toString().slice(-5)}`,
            chequeDate,
            bankName,
            amount: chequeVal,
          }
        : undefined,
      notes,
    });

    setNotes('');
    alert('تم تسجيل توريد الحليب وحساب الدفعة والباقي بنجاح!');
    onPrintReceipt(newEntry);
  };

  const filteredSupplies = milkSupplies.filter((s) => {
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        s.supplierName.toLowerCase().includes(q) ||
        s.date.includes(q) ||
        s.notes?.toLowerCase().includes(q) ||
        s.chequeDetails?.chequeNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* SECTION 1: Milk Supply & Payments Entry Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 font-bold">
              <Milk className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                خانة توريد الحليب والدفعات والشيكات (Milk Supply & Payments Entry)
              </h2>
              <p className="text-xs text-slate-400">
                تسجيل استلام الحليب، سعر اللتر، المجموع، الدفع (نقداً أو شيكات)، وتفاصيل الشيك،
                وحساب الباقي (لنا أو علينا)
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* 1. Supplier Name */}
            <div>
              <label className="block text-slate-300 mb-1 font-bold">اسم المورد *</label>
              <select
                value={supplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-sky-500 focus:outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Date */}
            <div>
              <label className="block text-slate-300 mb-1 font-bold">التاريخ *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* 3. Milk Liters */}
            <div>
              <label className="block text-slate-300 mb-1 font-bold">
                كمية الحليب باللتر *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                placeholder="مثال: 1000"
                value={quantityLiters}
                onChange={(e) => setQuantityLiters(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sky-400 font-mono font-black focus:border-sky-500 focus:outline-none text-sm"
              />
            </div>

            {/* 4. Price per Liter */}
            <div>
              <label className="block text-slate-300 mb-1 font-bold">
                سعر اللتر ({settings.currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={pricePerLiter}
                onChange={(e) => setPricePerLiter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-sky-500 focus:outline-none text-sm"
              />
            </div>

            {/* 5. Total Amount (Auto Calculated) */}
            <div>
              <label className="block text-slate-300 mb-1 font-bold">
                المجموع الإجمالي ({settings.currency})
              </label>
              <div className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-black text-sm flex items-center justify-between">
                <span>{totalMilkCost.toLocaleString()}</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {settings.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method & Cheque Details Grid */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                <span>طريقة الدفع وتفاصيل الشيكات</span>
              </span>

              <button
                type="button"
                onClick={handleAutoFillTotal}
                className="text-[11px] text-sky-400 hover:underline font-bold"
              >
                تعبئة المبلغ بالكامل للدفع الإجمالي ({totalMilkCost} {settings.currency})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">نوع وطريقة الدفع *</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-500 focus:outline-none"
                >
                  <option value="نقداً">نقداً فقط (Cash)</option>
                  <option value="شيك">شيك بنكي فقط (Cheque)</option>
                  <option value="نقداً وشيك">نقداً + شيك معاً (Cash & Cheque)</option>
                  <option value="آجل (ذمة)">آجل بالكامل (على الحساب)</option>
                </select>
              </div>

              {(paymentType === 'نقداً' || paymentType === 'نقداً وشيك') && (
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">
                    المبلغ المدفوع نقداً ({settings.currency})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={paidCash}
                    onChange={(e) => setPaidCash(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              )}

              {(paymentType === 'شيك' || paymentType === 'نقداً وشيك') && (
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">
                    قيمة الشيك ({settings.currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={paidCheque}
                    onChange={(e) => setPaidCheque(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold"
                  />
                </div>
              )}
            </div>

            {/* Cheque Specific Fields */}
            {(paymentType === 'شيك' || paymentType === 'نقداً وشيك') && (
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">اسم صاحب الشيك / المسحوب له</label>
                  <input
                    type="text"
                    placeholder="اسم صاحب الشيك"
                    value={chequeHolderName}
                    onChange={(e) => setChequeHolderName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">رقم الشيك</label>
                  <input
                    type="text"
                    placeholder="مثال: 98124"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">تاريخ استحقاق الشيك</label>
                  <input
                    type="date"
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">اسم البنك</label>
                  <input
                    type="text"
                    placeholder="مثال: البنك العربي"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Balance Remaining & Submit Box */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
              <div>
                <span className="text-slate-400 block font-sans text-[11px]">إجمالي المدفوع:</span>
                <span className="text-base font-bold text-white">
                  {totalPaidLive.toLocaleString()} {settings.currency}
                </span>
              </div>

              <div className="border-r border-slate-800 pr-6">
                <span className="text-slate-400 block font-sans text-[11px]">
                  حساب الباقي (لنا أو علينا):
                </span>
                <span
                  className={`text-lg font-black ${
                    balanceStatusLive === 'علينا'
                      ? 'text-rose-400'
                      : balanceStatusLive === 'لنا'
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {balanceAmountLive.toLocaleString()} {settings.currency}{' '}
                  <span className="text-xs font-sans font-bold">
                    ({balanceStatusLive === 'علينا' ? 'باقي علينا للمورد' : balanceStatusLive === 'لنا' ? 'باقي لنا عليه' : 'خالص'})
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="ملاحظات عن التوريد..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs w-48 sm:w-60"
              />

              <button
                type="submit"
                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-md shadow-sky-500/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>حفظ التوريد وطباعة السند</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* SECTION 2: Imported Milk Ledger (سجل الحليب المستورد) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Milk className="w-5 h-5 text-sky-400" />
              <span>سجل الحليب المستورد والتوريدات (Imported Milk Ledger)</span>
            </h3>
            <span className="text-xs text-slate-400">
              إجمالي السجلات: {milkSupplies.length} شحنة حليب مستلمة
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالمورد، التاريخ، الشيك..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-white text-xs w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="py-2.5 px-3 font-mono">التاريخ</th>
                <th className="py-2.5 px-3">اسم المورد</th>
                <th className="py-2.5 px-3 font-mono">الكمية باللتر</th>
                <th className="py-2.5 px-3 font-mono">سعر اللتر</th>
                <th className="py-2.5 px-3 font-mono">المجموع</th>
                <th className="py-2.5 px-3">طريقة الدفع</th>
                <th className="py-2.5 px-3">تفاصيل الشيك</th>
                <th className="py-2.5 px-3 font-mono">المدفوع</th>
                <th className="py-2.5 px-3 font-mono">الباقي (لنا/علينا)</th>
                <th className="py-2.5 px-3">ملاحظات</th>
                <th className="py-2.5 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredSupplies.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500 font-sans">
                    لا توجد توريدات مطابقة
                  </td>
                </tr>
              ) : (
                filteredSupplies.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-300 font-bold">{s.date}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-white">
                      {s.supplierName}
                    </td>
                    <td className="py-2.5 px-3 text-sky-400 font-black">
                      {s.quantityLiters.toLocaleString()} لتر
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {s.pricePerLiter} {settings.currency}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-black">
                      {s.totalAmount.toLocaleString()} {settings.currency}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px]">
                        {s.paymentType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-[11px] text-slate-400">
                      {s.chequeDetails ? (
                        <div title={`رقم: ${s.chequeDetails.chequeNumber}`}>
                          <span className="text-amber-400 font-mono font-bold block">
                            شيك: {s.chequeDetails.amount} {settings.currency}
                          </span>
                          <span>
                            {s.chequeDetails.chequeHolderName} ({s.chequeDetails.chequeNumber})
                          </span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-white font-bold">
                      {s.totalPaid.toLocaleString()} {settings.currency}
                    </td>
                    <td className="py-2.5 px-3">
                      {s.balanceRemaining === 0 ? (
                        <span className="text-emerald-500 font-sans text-[11px] font-bold">
                          خالص (0)
                        </span>
                      ) : s.balanceType === 'علينا' ? (
                        <span className="text-rose-400 font-bold">
                          {s.balanceRemaining.toLocaleString()} (علينا)
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold">
                          {s.balanceRemaining.toLocaleString()} (لنا)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">
                      {s.notes || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onPrintReceipt(s)}
                          className="p-1 rounded bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white transition"
                          title="طباعة سند الاستلام"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذه الشحنة؟')) {
                              deleteMilkSupply(s.id);
                            }
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
