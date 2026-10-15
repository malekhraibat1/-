import React, { useState } from 'react';
import { useDairy } from '../../context/DairyContext';
import { CheeseSaleInvoice, InvoiceItemLine } from '../../types/dairySimple';
import { CustomerStatementsModal } from './CustomerStatementsModal';
import {
  Receipt,
  Plus,
  Printer,
  Trash2,
  Search,
  CheckCircle2,
  TrendingUp,
  FileDown,
  User,
  Layers,
  Usb,
  Users,
  FileSpreadsheet,
} from 'lucide-react';

interface SalesInvoicesViewProps {
  onPrintInvoice: (invoice: CheeseSaleInvoice) => void;
}

export const SalesInvoicesView: React.FC<SalesInvoicesViewProps> = ({
  onPrintInvoice,
}) => {
  const { salesInvoices, settings, addSaleInvoice, deleteSaleInvoice } = useDairy();

  // Customer Statements Modal State
  const [isCustomerStatementsModalOpen, setIsCustomerStatementsModalOpen] = useState(false);
  const [selectedCustomerForStatement, setSelectedCustomerForStatement] = useState<string | undefined>(undefined);

  // Mode: single item vs multi-items
  const [isMultiItem, setIsMultiItem] = useState(false);

  // New Invoice Form State
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');

  // Single Item fields
  const [singleCheeseType, setSingleCheeseType] = useState<string>('جبنة بيضاء بلدية');
  const [singleQuantityKg, setSingleQuantityKg] = useState<string>('30');
  const [singlePricePerKg, setSinglePricePerKg] = useState<string>(
    settings.defaultCheesePrice.toString()
  );

  // Multi Items fields
  const [multiItems, setMultiItems] = useState<InvoiceItemLine[]>([
    { cheeseType: 'جبنة بيضاء بلدية', quantityKg: 20, pricePerKg: settings.defaultCheesePrice, total: 20 * settings.defaultCheesePrice },
    { cheeseType: 'جبنة حلوم بلدي', quantityKg: 15, pricePerKg: 6.5, total: 15 * 6.5 },
  ]);

  const [paymentMethod, setPaymentMethod] = useState<'نقداً' | 'شيك' | 'آجل' | 'تحويل بنكي'>('نقداً');
  const [paidAmount, setPaidAmount] = useState<string>('165');
  const [notes, setNotes] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'credit'>('all');

  // Multi item helpers
  const handleAddMultiLine = () => {
    setMultiItems((prev) => [
      ...prev,
      {
        cheeseType: 'جبنة عكاوي',
        quantityKg: 10,
        pricePerKg: 5.8,
        total: 58,
      },
    ]);
  };

  const handleUpdateMultiLine = (idx: number, field: keyof InvoiceItemLine, val: any) => {
    setMultiItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: val };
        if (field === 'quantityKg' || field === 'pricePerKg') {
          updated.total = Math.round(Number(updated.quantityKg) * Number(updated.pricePerKg) * 100) / 100;
        }
        return updated;
      })
    );
  };

  const handleRemoveMultiLine = (idx: number) => {
    if (multiItems.length <= 1) return;
    setMultiItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Live totals
  const singleKg = parseFloat(singleQuantityKg) || 0;
  const singlePrice = parseFloat(singlePricePerKg) || 0;
  const singleTotal = Math.round(singleKg * singlePrice * 100) / 100;

  const multiTotal = multiItems.reduce((sum, it) => sum + (it.total || 0), 0);
  const multiTotalKg = multiItems.reduce((sum, it) => sum + (Number(it.quantityKg) || 0), 0);

  const totalAmountLive = isMultiItem ? multiTotal : singleTotal;
  const totalKgLive = isMultiItem ? multiTotalKg : singleKg;
  const primaryCheeseTypeLive = isMultiItem
    ? multiItems.map((m) => m.cheeseType).join(' + ')
    : singleCheeseType;

  const paidVal = paymentMethod === 'آجل' ? 0 : parseFloat(paidAmount) || 0;
  const remainingLive = Math.max(0, Math.round((totalAmountLive - paidVal) * 100) / 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || totalKgLive <= 0 || totalAmountLive <= 0) {
      alert('يرجى إدخال اسم الزبون وكمية وأسعار صحيحة.');
      return;
    }

    const newInv = addSaleInvoice({
      date,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      cheeseType: primaryCheeseTypeLive,
      quantityKg: totalKgLive,
      pricePerKg: totalKgLive > 0 ? Math.round((totalAmountLive / totalKgLive) * 100) / 100 : singlePrice,
      totalAmount: totalAmountLive,
      paymentMethod,
      paidAmount: paidVal,
      items: isMultiItem ? multiItems : undefined,
      notes: notes.trim(),
    });

    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setNotes('');
    alert('تم إصدار فاتورة بيع الجبنة بنجاح!');
    onPrintInvoice(newInv);
  };

  const totalSalesRevenue = salesInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalSalesKg = salesInvoices.reduce((sum, inv) => sum + inv.quantityKg, 0);
  const totalRemainingOwed = salesInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);

  const filteredInvoices = salesInvoices.filter((inv) => {
    if (statusFilter === 'paid' && inv.remainingAmount > 0) return false;
    if (statusFilter === 'credit' && inv.remainingAmount === 0) return false;

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        inv.customerName.toLowerCase().includes(q) ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.cheeseType.toLowerCase().includes(q) ||
        inv.date.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
            <Receipt className="w-4 h-4" />
            <span>نظام الفواتير المعتمد (Invoicing & PDF Export)</span>
          </div>
          <h2 className="text-xl font-black text-white">
            إصدار فواتير بيع الجبنة وطباعة PDF الرسمية
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إصدار فواتير بيع للمحلات والمطاعم والزبائن، دعم الأصناف المتعددة، والطباعة المباشرة كملف
            PDF أو ورقي بنقرة واحدة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-left font-mono">
            <span className="text-[10px] text-slate-400 block font-sans">إجمالي المبيعات:</span>
            <span className="text-lg font-black text-emerald-400">
              {totalSalesRevenue.toLocaleString()} {settings.currency}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-left font-mono">
            <span className="text-[10px] text-slate-400 block font-sans">الكمية المباعة:</span>
            <span className="text-lg font-black text-amber-400">{totalSalesKg.toLocaleString()} كغ</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-left font-mono">
            <span className="text-[10px] text-slate-400 block font-sans">ذمم آجلة متبقية:</span>
            <span className="text-lg font-black text-rose-400">
              {totalRemainingOwed.toLocaleString()} {settings.currency}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Statements & USB Export Quick Action Banner */}
      <div className="bg-gradient-to-r from-sky-950/70 via-slate-900 to-amber-950/40 border border-sky-500/40 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold shadow-lg">
            <Usb className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">كشف حساب مفصل لكافة الزبائن والذمم المالية (جاهز للفلاشة USB)</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                نسخة محمولة للمحلات 💼
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              أنشئ كشف حساب تفصيلي لكافة الزبائن مع فواتيرهم المشتراة والديون المتبقية، وقم بتحميله على فلاش ميموري USB لمناقشتهم في أماكنهم ومحلاتهم بدون إنترنت نهائياً.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedCustomerForStatement(undefined);
            setIsCustomerStatementsModalOpen(true);
          }}
          className="bg-gradient-to-r from-sky-500 via-sky-400 to-sky-500 hover:from-sky-400 hover:to-sky-300 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 transition cursor-pointer active:scale-95 shrink-0"
        >
          <Usb className="w-4 h-4 text-slate-950" />
          <span>💼 إنشاء كشف حساب مفصل للزبائن للفلاشة USB 💾</span>
        </button>
      </div>

      {/* Invoice Entry Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <h3 className="text-sm font-black text-white">إصدار فاتورة بيع جديدة</h3>
          </div>

          {/* Toggle Single vs Multi Items */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setIsMultiItem(false)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                !isMultiItem ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              صنف جبن واحد
            </button>
            <button
              type="button"
              onClick={() => setIsMultiItem(true)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                isMultiItem ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              أصناف متعددة في فاتورة واحدة
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer & Date Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div>
              <label className="block text-slate-300 mb-1 font-bold">التاريخ *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">اسم المشتري / الزبون *</label>
              <input
                type="text"
                required
                placeholder="مثال: مطعم القدس / سوبرماركت الأمانة"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">رقم الهاتف</label>
              <input
                type="text"
                placeholder="0599..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">العنوان وموقع التسليم</label>
              <input
                type="text"
                placeholder="الشارع الرئيسي / السوق القديم"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Single Item Mode */}
          {!isMultiItem ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">صنف الجبنة *</label>
                <select
                  value={singleCheeseType}
                  onChange={(e) => setSingleCheeseType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="جبنة بيضاء بلدية">جبنة بيضاء بلدية</option>
                  <option value="جبنة حلوم بلدي">جبنة حلوم بلدي</option>
                  <option value="جبنة عكاوي">جبنة عكاوي</option>
                  <option value="جبنة موزاريلا">جبنة موزاريلا</option>
                  <option value="جبنة قريش/ريكوتا">جبنة قريش / ريكوتا</option>
                  <option value="جبنة فيتا">جبنة فيتا</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">الكمية المباعة (كغ) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={singleQuantityKg}
                  onChange={(e) => setSingleQuantityKg(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-black focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">
                  سعر الكيلو ({settings.currency}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={singlePricePerKg}
                  onChange={(e) => setSinglePricePerKg(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            /* Multi Items Mode */
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-amber-300">قائمة أصناف الجبنة في هذه الفاتورة:</span>
                <button
                  type="button"
                  onClick={handleAddMultiLine}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700/40 hover:bg-emerald-600/60 text-emerald-300 border border-emerald-500/30 font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة صنف آخر</span>
                </button>
              </div>

              {multiItems.map((line, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="sm:col-span-5">
                    <label className="block text-slate-400 text-[10px] mb-0.5">صنف الجبنة</label>
                    <select
                      value={line.cheeseType}
                      onChange={(e) => handleUpdateMultiLine(idx, 'cheeseType', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                    >
                      <option value="جبنة بيضاء بلدية">جبنة بيضاء بلدية</option>
                      <option value="جبنة حلوم بلدي">جبنة حلوم بلدي</option>
                      <option value="جبنة عكاوي">جبنة عكاوي</option>
                      <option value="جبنة موزاريلا">جبنة موزاريلا</option>
                      <option value="جبنة قريش/ريكوتا">جبنة قريش</option>
                      <option value="جبنة فيتا">جبنة فيتا</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 text-[10px] mb-0.5">الوزن (كغ)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={line.quantityKg}
                      onChange={(e) => handleUpdateMultiLine(idx, 'quantityKg', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-amber-400 font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 text-[10px] mb-0.5">سعر الكيلو</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={line.pricePerKg}
                      onChange={(e) => handleUpdateMultiLine(idx, 'pricePerKg', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2 font-mono text-left">
                    <span className="block text-slate-400 text-[10px]">المجموع</span>
                    <span className="font-bold text-emerald-400">{line.total.toLocaleString()} {settings.currency}</span>
                  </div>

                  <div className="sm:col-span-1 text-center">
                    <button
                      type="button"
                      disabled={multiItems.length <= 1}
                      onClick={() => handleRemoveMultiLine(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment and Total row */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-5">
              <div>
                <label className="block text-slate-400 text-[10px] mb-1 font-semibold">طريقة السداد</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    const m = e.target.value as any;
                    setPaymentMethod(m);
                    if (m === 'نقداً') setPaidAmount(totalAmountLive.toString());
                    if (m === 'آجل') setPaidAmount('0');
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-bold"
                >
                  <option value="نقداً">نقداً (كاش)</option>
                  <option value="آجل">آجل (ذمة)</option>
                  <option value="شيك">شيك بنكي</option>
                  <option value="تحويل بنكي">تحويل بنكي</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] mb-1 font-semibold">المبلغ المسدد</label>
                <input
                  type="number"
                  step="0.5"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold w-28"
                />
              </div>

              <div className="font-mono border-r border-slate-800 pr-4">
                <span className="text-[10px] text-slate-500 block font-sans">المجموع الإجمالي:</span>
                <span className="text-base font-black text-emerald-400">
                  {totalAmountLive.toLocaleString()} {settings.currency}
                </span>
              </div>

              <div className="font-mono border-r border-slate-800 pr-4">
                <span className="text-[10px] text-slate-500 block font-sans">المتبقي (آجل):</span>
                <span className={`text-base font-bold ${remainingLive > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {remainingLive.toLocaleString()} {settings.currency}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="ملاحظات (شروط الحفظ / شاحنة التبريد)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs w-48 sm:w-60"
              />

              <button
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/25 transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                <span>إصدار الفاتورة وعرض PDF</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Invoices List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <span>سجل فواتير مبيعات الجبنة (Invoices Ledger)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({filteredInvoices.length} فاتورة)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  statusFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  statusFilter === 'paid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                مدفوعة بالكامل
              </button>
              <button
                onClick={() => setStatusFilter('credit')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  statusFilter === 'credit' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                متبقي ذمة (آجل)
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث بالرقم، اسم المشتري..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-white text-xs w-56"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="py-2.5 px-3 font-mono">رقم الفاتورة</th>
                <th className="py-2.5 px-3 font-mono">التاريخ</th>
                <th className="py-2.5 px-3">اسم الزبون / المشتري</th>
                <th className="py-2.5 px-3">بيان صنف الجبنة</th>
                <th className="py-2.5 px-3 font-mono">الوزن (كغ)</th>
                <th className="py-2.5 px-3 font-mono">سعر الكيلو</th>
                <th className="py-2.5 px-3 font-mono">الإجمالي</th>
                <th className="py-2.5 px-3">طريقة الدفع</th>
                <th className="py-2.5 px-3 font-mono">المسدد</th>
                <th className="py-2.5 px-3 font-mono">المتبقي (آجل)</th>
                <th className="py-2.5 px-3 text-center">طباعة / PDF</th>
                <th className="py-2.5 px-3 text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500 font-sans">
                    لا توجد فواتير بيع مطابقة
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-amber-400 font-bold">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-3 text-slate-300">{inv.date}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-white">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomerForStatement(inv.customerName);
                          setIsCustomerStatementsModalOpen(true);
                        }}
                        className="text-right hover:text-amber-400 transition cursor-pointer group"
                        title="عرض كشف حساب هذا الزبون"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="group-hover:underline">{inv.customerName}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700 font-normal">
                            كشف حساب 📋
                          </span>
                        </div>
                      </button>
                      {inv.customerPhone && (
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">{inv.customerPhone}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-amber-300 truncate max-w-xs" title={inv.cheeseType}>
                      {inv.cheeseType}
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-black">{inv.quantityKg} كغ</td>
                    <td className="py-2.5 px-3 text-slate-300">{inv.pricePerKg} {settings.currency}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-black text-sm">
                      {inv.totalAmount.toLocaleString()} {settings.currency}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px]">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-white font-bold">
                      {inv.paidAmount.toLocaleString()} {settings.currency}
                    </td>
                    <td className="py-2.5 px-3">
                      {inv.remainingAmount > 0 ? (
                        <span className="text-rose-400 font-bold">
                          {inv.remainingAmount.toLocaleString()} {settings.currency}
                        </span>
                      ) : (
                        <span className="text-emerald-500 font-sans text-[10px] font-bold">خالص ✓</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onPrintInvoice(inv)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition text-xs font-sans font-bold flex items-center gap-1 mx-auto"
                        title="طباعة الفاتورة أو حفظها كـ PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة PDF</span>
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`حذف الفاتورة رقم ${inv.invoiceNumber}؟`)) {
                            deleteSaleInvoice(inv.id);
                          }
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
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

      {/* Customer Statements Modal */}
      <CustomerStatementsModal
        isOpen={isCustomerStatementsModalOpen}
        onClose={() => {
          setIsCustomerStatementsModalOpen(false);
          setSelectedCustomerForStatement(undefined);
        }}
        selectedCustomerName={selectedCustomerForStatement}
      />
    </div>
  );
};
