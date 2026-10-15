import React, { useState } from 'react';
import { useDairy, SupplierStatement } from '../../context/DairyContext';
import { Supplier } from '../../types/dairySimple';
import {
  Users,
  Plus,
  Phone,
  Printer,
  Trash2,
  Edit2,
  Wallet,
  Milk,
  Receipt,
  CreditCard,
  Building,
  Calendar,
} from 'lucide-react';

interface SuppliersLedgerViewProps {
  onPrintStatement: (statement: SupplierStatement) => void;
}

export const SuppliersLedgerView: React.FC<SuppliersLedgerViewProps> = ({
  onPrintStatement,
}) => {
  const {
    suppliers,
    settings,
    addSupplier,
    deleteSupplier,
    getAllSupplierStatements,
    getSupplierStatement,
  } = useDairy();

  // Add Supplier Form State
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [priceDefault, setPriceDefault] = useState<string>(settings.defaultMilkPrice.toString());
  const [initialBalance, setInitialBalance] = useState<string>('0');
  const [notes, setNotes] = useState('');

  // Selected supplier for detail drawer/modal
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  const statements = getAllSupplierStatements();

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('يرجى إدخال اسم المورد ورقم هاتفه.');
      return;
    }

    addSupplier({
      name: name.trim(),
      phone: phone.trim(),
      location: location.trim(),
      pricePerLiterDefault: parseFloat(priceDefault) || settings.defaultMilkPrice,
      initialBalance: parseFloat(initialBalance) || 0,
      notes: notes.trim(),
    });

    setName('');
    setPhone('');
    setLocation('');
    setNotes('');
    setIsAdding(false);
    alert('تمت إضافة المورد الجديد بنجاح!');
  };

  const selectedStatement = selectedSupplierId
    ? getSupplierStatement(selectedSupplierId)
    : null;

  return (
    <div className="space-y-6">
      {/* Top Header & Add Supplier Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                سجل ودليل موردي الحليب والمحاسبة بالكامل (Suppliers Accounting Ledger)
              </h2>
              <p className="text-xs text-slate-400">
                بيانات الموردين، إجمالي كميات الحليب المستورد، المبالغ والمسدد (نقداً وشيكات)،
                والرصيد الصافي المتبقي (لنا أو علينا)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-purple-600/25 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{isAdding ? 'إغلاق النموذج' : 'إدخال مورد حليب جديد'}</span>
        </button>
      </div>

      {/* SECTION 1: Add Supplier Form (Collapsible) */}
      {isAdding && (
        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 shadow-lg animate-in fade-in duration-200">
          <h3 className="text-xs font-black text-purple-300 mb-3 pb-2 border-b border-slate-800 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>بيانات المورد الجديد</span>
          </h3>

          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">اسم المورد *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أبو محمد الزعبي"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">رقم الجوال *</label>
                <input
                  type="text"
                  required
                  placeholder="0599..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">الموقع / المزرعة</label>
                <input
                  type="text"
                  placeholder="السهول الشرقية"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">سعر اللتر الافتراضي</label>
                <input
                  type="number"
                  step="0.01"
                  value={priceDefault}
                  onChange={(e) => setPriceDefault(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">
                  الرصيد الافتتاحي (لنا/علينا)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0 (موجب=علينا له، سالب=لنا)"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <input
                type="text"
                placeholder="ملاحظات إضافية عن المورد..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs flex-1"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow"
                >
                  حفظ المورد
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: Full Accounting Ledger Table for All Suppliers */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-400" />
              <span>جدول المحاسبة الشامل للموردين (Suppliers Balances Ledger)</span>
            </h3>
            <span className="text-xs text-slate-400">
              إجمالي الموردين المسجلين: {suppliers.length} موردين
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="py-2.5 px-3">اسم المورد</th>
                <th className="py-2.5 px-3 font-mono">رقم الجوال</th>
                <th className="py-2.5 px-3 font-mono">كمية الحليب المستورد</th>
                <th className="py-2.5 px-3 font-mono">إجمالي حساب الحليب</th>
                <th className="py-2.5 px-3 font-mono">المدفوع نقداً</th>
                <th className="py-2.5 px-3 font-mono">المدفوع بشيكات</th>
                <th className="py-2.5 px-3 font-mono">مجموع المسدد له</th>
                <th className="py-2.5 px-3 font-mono text-center">الرصيد الصافي المتبقي</th>
                <th className="py-2.5 px-3 text-center">كشف الحساب</th>
                <th className="py-2.5 px-3 text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {statements.map((st) => (
                <tr key={st.supplier.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-sans font-bold text-white">
                    <div>{st.supplier.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {st.supplier.location || 'مورد حليب'}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-300 font-bold">{st.supplier.phone}</td>

                  <td className="py-3 px-3 text-sky-400 font-black">
                    {st.totalLiters.toLocaleString()} لتر
                  </td>

                  <td className="py-3 px-3 text-slate-200 font-bold">
                    {st.totalCost.toLocaleString()} {settings.currency}
                  </td>

                  <td className="py-3 px-3 text-slate-300">
                    {st.totalCashPaid.toLocaleString()} {settings.currency}
                  </td>

                  <td className="py-3 px-3 text-amber-400 font-bold">
                    {st.totalChequePaid.toLocaleString()} {settings.currency}
                  </td>

                  <td className="py-3 px-3 text-white font-black">
                    {st.totalPaid.toLocaleString()} {settings.currency}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {st.balanceStatus === 'خالص' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold font-sans">
                        خالص (0)
                      </span>
                    ) : st.balanceStatus === 'علينا' ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">
                        {st.netBalance.toLocaleString()} {settings.currency} (علينا له)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                        {st.netBalance.toLocaleString()} {settings.currency} (لنا عليه)
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onPrintStatement(st)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white transition font-sans text-xs flex items-center gap-1 mx-auto"
                      title="طباعة كشف الحساب المالي للمورد"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>كشف حساب</span>
                    </button>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `هل أنت متأكد من حذف المورد (${st.supplier.name}) وجميع سجلاته؟`
                          )
                        ) {
                          deleteSupplier(st.supplier.id);
                        }
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                      title="حذف المورد"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
