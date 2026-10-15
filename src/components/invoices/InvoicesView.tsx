import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { Invoice } from '../../types/cheeseFactory';
import {
  Receipt,
  Plus,
  Search,
  Printer,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { NewInvoiceModal } from './NewInvoiceModal';
import { InvoicePrintModal } from './InvoicePrintModal';

interface InvoicesViewProps {
  onOpenNewInvoiceModalTrigger?: boolean;
}

export const InvoicesView: React.FC<InvoicesViewProps> = () => {
  const { invoices, settings, deleteInvoice } = useFactory();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // Financial summary
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalRemaining = invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === 'paid' && inv.paymentStatus !== 'مدفوعة بالكامل') return false;
    if (filterStatus === 'unpaid' && inv.paymentStatus !== 'معلقة (آجل)') return false;
    if (filterStatus === 'partial' && inv.paymentStatus !== 'مدفوعة جزئياً') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchClient = inv.clientName.toLowerCase().includes(q);
      const matchBatch = inv.items.some((i) => i.batchNumber.toLowerCase().includes(q));
      if (!matchNum && !matchClient && !matchBatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Receipt className="w-6 h-6 text-emerald-400" />
              <span>فواتير المبيعات والتوزيع (Sales & Billing Invoices)</span>
            </h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              {invoices.length} فاتورة
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إصدار فواتير بيع معتمدة، ربط أرقام تشغيلات الأجبان لضمان التتبع، وطباعة رسمية A4
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>إصدار فاتورة بيع جديدة</span>
        </button>
      </div>

      {/* KPI Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-slate-400 block font-semibold text-xs font-sans">
              إجمالي قيمة المبيعات
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-0.5 block">
              {totalRevenue.toLocaleString()} {settings.currency}
            </span>
            <span className="text-[11px] text-slate-500 font-sans">
              شاملة ضريبة القيمة المضافة ({settings.defaultTaxPercent}%)
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-slate-400 block font-semibold text-xs font-sans">
              المبالغ المحصلة (نقدي وتحويلات)
            </span>
            <span className="text-2xl font-black text-teal-300 mt-0.5 block">
              {totalPaid.toLocaleString()} {settings.currency}
            </span>
            <span className="text-[11px] text-slate-500 font-sans">داخل الصندوق والحسابات البنكية</span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-slate-400 block font-semibold text-xs font-sans">
              الذمم والآجل المتبقي
            </span>
            <span className="text-2xl font-black text-amber-400 mt-0.5 block">
              {totalRemaining.toLocaleString()} {settings.currency}
            </span>
            <span className="text-[11px] text-slate-500 font-sans">مستحقات على المطاعم والعملاء</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterStatus === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              جميع الفواتير ({invoices.length})
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterStatus === 'paid'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              مدفوعة بالكامل
            </button>
            <button
              onClick={() => setFilterStatus('unpaid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterStatus === 'unpaid'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              معلقة (آجل)
            </button>
            <button
              onClick={() => setFilterStatus('partial')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterStatus === 'partial'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              مدفوعة جزئياً
            </button>
          </div>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالرقم، اسم العميل، رقم اللوت..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="py-3 px-4 font-bold">رقم الفاتورة</th>
                <th className="py-3 px-4 font-bold">العميل والمشتري</th>
                <th className="py-3 px-4 font-bold">تاريخ الإصدار</th>
                <th className="py-3 px-4 font-bold">الأصناف المباعة والتشغيلات</th>
                <th className="py-3 px-4 font-bold">طريقة الدفع</th>
                <th className="py-3 px-4 font-bold">حالة السداد</th>
                <th className="py-3 px-4 font-bold font-mono">الإجمالي الصافي</th>
                <th className="py-3 px-4 font-bold font-mono">المتبقي (الذمة)</th>
                <th className="py-3 px-4 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    لا توجد فواتير تطابق شروط البحث الحالية
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const totalKg = inv.items.reduce((s, i) => s + i.quantityKg, 0);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        <div>{inv.clientName}</div>
                        <div className="text-[10px] text-slate-500 font-mono font-normal">
                          {inv.clientPhone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">
                        <div>{inv.issueDate.split(' ')[0]}</div>
                        <div className="text-[10px] text-slate-500">
                          مندوب: {inv.salesRepresentative}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">
                          {inv.items.length} أصناف ({totalKg} كغ)
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {inv.items.map((i) => `${i.productName} (${i.quantityKg}كغ)`).join('، ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">{inv.paymentMethod}</td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            inv.paymentStatus === 'مدفوعة بالكامل'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : inv.paymentStatus === 'مدفوعة جزئياً'
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-sm text-emerald-400">
                        {inv.grandTotal.toLocaleString()} {settings.currency}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300 font-semibold">
                        {inv.remainingAmount > 0 ? (
                          <span className="text-amber-400">
                            {inv.remainingAmount.toLocaleString()} {settings.currency}
                          </span>
                        ) : (
                          <span className="text-emerald-500">0.00</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedInvoiceForPrint(inv)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px]"
                            title="معاينة وطباعة الفاتورة A4"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>طباعة</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف الفاتورة ${inv.invoiceNumber}؟`)) {
                                deleteInvoice(inv.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <NewInvoiceModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onInvoiceCreated={(newId) => {
          const found = invoices.find((i) => i.id === newId);
          if (found) setSelectedInvoiceForPrint(found);
        }}
      />

      <InvoicePrintModal
        invoice={selectedInvoiceForPrint}
        isOpen={!!selectedInvoiceForPrint}
        onClose={() => setSelectedInvoiceForPrint(null)}
      />
    </div>
  );
};
