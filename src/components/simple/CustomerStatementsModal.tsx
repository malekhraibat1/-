import React, { useState } from 'react';
import { useDairy } from '../../context/DairyContext';
import { CustomerStatement } from '../../types/dairySimple';
import {
  X,
  Printer,
  Download,
  Usb,
  FileSpreadsheet,
  Search,
  Users,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ExternalLink,
  Receipt,
  DollarSign,
} from 'lucide-react';

interface CustomerStatementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomerName?: string;
}

export const CustomerStatementsModal: React.FC<CustomerStatementsModalProps> = ({
  isOpen,
  onClose,
  selectedCustomerName,
}) => {
  const {
    settings,
    getAllCustomerStatements,
    exportCustomerStatementsCSV,
    generateCustomerStatementsUsbHtml,
  } = useDairy();

  const [searchQuery, setSearchQuery] = useState(selectedCustomerName || '');
  const [filterDebt, setFilterDebt] = useState<'all' | 'debt' | 'paid'>('all');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(selectedCustomerName || null);
  const [singlePrintCustomer, setSinglePrintCustomer] = useState<string | null>(null);

  if (!isOpen) return null;

  const statements = getAllCustomerStatements();

  // Aggregate numbers
  const totalSales = statements.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalPaid = statements.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalDebt = statements.reduce((sum, s) => sum + s.remainingBalance, 0);
  const totalKg = statements.reduce((sum, s) => sum + s.totalKg, 0);
  const inDebtCount = statements.filter((s) => s.remainingBalance > 0).length;

  const filteredStatements = statements.filter((s) => {
    if (filterDebt === 'debt' && s.remainingBalance <= 0) return false;
    if (filterDebt === 'paid' && s.remainingBalance > 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.customerName.toLowerCase().includes(q) ||
        (s.customerPhone && s.customerPhone.toLowerCase().includes(q)) ||
        (s.customerAddress && s.customerAddress.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const downloadTextFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadUsbHtml = () => {
    const html = generateCustomerStatementsUsbHtml();
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      html,
      `كشف_حسابات_الزبائن_للفلاشة_${dateStr}.html`,
      'text/html;charset=utf-8;'
    );
  };

  const handleDownloadCsv = () => {
    const csv = exportCustomerStatementsCSV();
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      csv,
      `كشف_حسابات_الزبائن_${dateStr}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  const handlePrintAll = () => {
    setSinglePrintCustomer(null);
    setTimeout(() => window.print(), 100);
  };

  const handlePrintSingle = (customerName: string) => {
    setSinglePrintCustomer(customerName);
    setTimeout(() => {
      window.print();
      setSinglePrintCustomer(null);
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:w-full print:max-w-none print:max-h-none print:m-0">
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-slate-800 gap-3 no-print bg-slate-900/95 sticky top-0 z-20 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">كشف حساب مفصل لكافة الزبائن والذمم المالية</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
                  ₪ {settings.currency || 'شيكل'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold">
                  جاهز للفلاشة USB 💾
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مخصص للمناقشة وتدقيق الحسابات مع الزبائن في محلاتهم وأماكنهم • حفظ على الفلاشة أو طباعة A4
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadUsbHtml}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 cursor-pointer transition"
              title="تنزيل صفحة أوفلاين كاملة قابلة للتشغيل من الفلاشة على أي كمبيوتر"
            >
              <Usb className="w-4 h-4" />
              <span>تنزيل للفلاشة (HTML محمول) 💾</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
              title="تصدير كشف إكسل"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>إكسل (CSV)</span>
            </button>

            <button
              onClick={handlePrintAll}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
              title="طباعة تقرير شامل لجميع الزبائن"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الكل (PDF)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 print:p-0">
          {/* Printable Official Header (Shown during printing) */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black text-slate-900">{settings.workshopName}</h1>
                <p className="text-xs text-slate-600">{settings.address} • هاتف: {settings.phone}</p>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  كشف حسابات الزبائن والذمم المالية المعتمد • العملة: {settings.currency || 'شيكل'} ₪
                </p>
              </div>
              <div className="text-left font-mono text-xs border border-slate-300 p-2 rounded bg-slate-50">
                <div>التاريخ: {new Date().toLocaleDateString('ar-EG')}</div>
                <div>عدد الزبائن: {statements.length}</div>
                <div>إجمالي الديون: {totalDebt.toLocaleString()} ₪</div>
              </div>
            </div>
          </div>

          {/* Quick Metrics KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs no-print">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">إجمالي مبيعات الزبائن:</span>
              <span className="text-lg font-black text-amber-400 font-mono mt-1 block">
                {totalSales.toLocaleString()} <span className="text-xs font-normal text-slate-400">{settings.currency}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">الوزن: {totalKg.toLocaleString()} كغ</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">إجمالي الديون المستحقة (عليها):</span>
              <span className="text-lg font-black text-rose-400 font-mono mt-1 block">
                {totalDebt.toLocaleString()} <span className="text-xs font-normal text-slate-400">{settings.currency}</span>
              </span>
              <span className="text-[10px] text-rose-400 font-bold">
                {inDebtCount} زبائن مدينين
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">إجمالي المقبوضات المسددة:</span>
              <span className="text-lg font-black text-emerald-400 font-mono mt-1 block">
                {totalPaid.toLocaleString()} <span className="text-xs font-normal text-slate-400">{settings.currency}</span>
              </span>
              <span className="text-[10px] text-emerald-400">
                نسبة التحصيل: {totalSales > 0 ? ((totalPaid / totalSales) * 100).toFixed(1) : 0}%
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">إجمالي الزبائن المسجلين:</span>
              <span className="text-lg font-black text-sky-400 font-mono mt-1 block">
                {statements.length} زبائن
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {statements.length - inDebtCount} مسددين بالكامل
              </span>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl flex flex-wrap gap-3 items-center justify-between text-xs no-print">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="بحث باسم الزبون، المحل، الهاتف، أو العنوان..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-white placeholder-slate-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterDebt('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  filterDebt === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                الكل ({statements.length})
              </button>

              <button
                onClick={() => setFilterDebt('debt')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  filterDebt === 'debt'
                    ? 'bg-rose-500 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-rose-400'
                }`}
              >
                المدينين فقط ({inDebtCount})
              </button>

              <button
                onClick={() => setFilterDebt('paid')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  filterDebt === 'paid'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-emerald-400'
                }`}
              >
                المسددين ({statements.length - inDebtCount})
              </button>
            </div>
          </div>

          {/* Customer Statements List */}
          <div className="space-y-4">
            {filteredStatements.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                لا يوجد زبائن مطابقين لمعايير البحث الحالية.
              </div>
            ) : (
              filteredStatements.map((statement) => {
                const isDebt = statement.remainingBalance > 0;
                const isExpanded = expandedCustomer === statement.customerName;
                const isSinglePrinting = singlePrintCustomer === statement.customerName;
                const isHiddenDuringSinglePrint =
                  singlePrintCustomer !== null && !isSinglePrinting;

                if (isHiddenDuringSinglePrint) return null;

                const cleanPhone = (statement.customerPhone || '').replace(/[^0-9]/g, '');
                const waMessage = encodeURIComponent(
                  `مرحباً ${statement.customerName}، مرفق ملخص كشف حسابكم من ${settings.workshopName}:\n• إجمالي المشتريات: ${statement.totalAmount.toLocaleString()} ${settings.currency}\n• المدفوع: ${statement.totalPaid.toLocaleString()} ${settings.currency}\n• الرصيد المتبقي بذمتكم: ${statement.remainingBalance.toLocaleString()} ${settings.currency}\nشاكرين حسن تعاملكم.`
                );

                return (
                  <div
                    key={statement.customerName}
                    className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition print:border print:border-slate-300 print:bg-white print:text-black print:page-break-after-always print:mb-8"
                  >
                    {/* Customer Header Row */}
                    <div
                      onClick={() =>
                        setExpandedCustomer(isExpanded ? null : statement.customerName)
                      }
                      className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 hover:bg-slate-900 cursor-pointer border-b border-slate-800/80 transition print:bg-slate-100 print:border-b-2 print:border-black"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-base font-black text-white print:text-black">
                            {statement.customerName}
                          </h4>
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono ${
                              isDebt
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 print:bg-rose-100 print:text-rose-900'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 print:bg-emerald-100 print:text-emerald-900'
                            }`}
                          >
                            {isDebt
                              ? `مدين: ${statement.remainingBalance.toLocaleString()} ${settings.currency}`
                              : 'خالص ومسدد بالكامل ✔️'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 print:text-slate-600">
                          {statement.customerPhone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <span>{statement.customerPhone}</span>
                            </span>
                          )}
                          {statement.customerAddress && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              <span>{statement.customerAddress}</span>
                            </span>
                          )}
                          <span className="font-mono text-[11px] text-sky-400 print:text-slate-800">
                            • {statement.invoicesCount} فواتير مسجلة
                          </span>
                        </div>
                      </div>

                      {/* Financial Badges & Controls */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 block font-sans">المشتريات:</span>
                          <span className="font-black text-amber-400 print:text-black">
                            {statement.totalAmount.toLocaleString()} {settings.currency}
                          </span>
                        </div>

                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 block font-sans">المدفوع:</span>
                          <span className="font-black text-emerald-400 print:text-black">
                            {statement.totalPaid.toLocaleString()} {settings.currency}
                          </span>
                        </div>

                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 block font-sans">المتبقي:</span>
                          <span
                            className={`font-black text-sm ${
                              isDebt ? 'text-rose-400' : 'text-emerald-400'
                            } print:text-black`}
                          >
                            {statement.remainingBalance.toLocaleString()} {settings.currency}
                          </span>
                        </div>

                        <div className="p-1 text-slate-400 no-print">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Invoices Breakdown Table (Always visible in print or when expanded) */}
                    <div className={`${isExpanded ? 'block' : 'hidden'} print:block p-4 sm:p-5 space-y-4`}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs border border-slate-800 print:border-slate-300">
                          <thead className="bg-slate-900 font-bold text-slate-300 print:bg-slate-200 print:text-black border-b border-slate-800 print:border-slate-400">
                            <tr>
                              <th className="py-2.5 px-3">رقم الفاتورة</th>
                              <th className="py-2.5 px-3">التاريخ</th>
                              <th className="py-2.5 px-3">صنف الجبنة</th>
                              <th className="py-2.5 px-3 font-mono text-center">الوزن (كغ)</th>
                              <th className="py-2.5 px-3 font-mono text-center">سعر الكيلو</th>
                              <th className="py-2.5 px-3 font-mono text-left">الإجمالي</th>
                              <th className="py-2.5 px-3 font-mono text-left">المدفوع</th>
                              <th className="py-2.5 px-3 font-mono text-left">المتبقي</th>
                              <th className="py-2.5 px-3">طريقة الدفع</th>
                              <th className="py-2.5 px-3">ملاحظات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80 print:divide-slate-300 font-mono text-[11px]">
                            {statement.invoices.map((inv) => (
                              <tr
                                key={inv.id}
                                className="hover:bg-slate-900/50 print:hover:bg-transparent"
                              >
                                <td className="py-2.5 px-3 font-bold text-sky-400 print:text-black">
                                  {inv.invoiceNumber}
                                </td>
                                <td className="py-2.5 px-3 text-slate-300 print:text-black">
                                  {inv.date}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-white print:text-black font-sans">
                                  {inv.cheeseType}
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold">
                                  {inv.quantityKg} كغ
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  {inv.pricePerKg} {settings.currency}
                                </td>
                                <td className="py-2.5 px-3 text-left font-bold text-amber-400 print:text-black">
                                  {inv.totalAmount.toLocaleString()} {settings.currency}
                                </td>
                                <td className="py-2.5 px-3 text-left font-bold text-emerald-400 print:text-black">
                                  {inv.paidAmount.toLocaleString()} {settings.currency}
                                </td>
                                <td
                                  className={`py-2.5 px-3 text-left font-bold ${
                                    inv.remainingAmount > 0
                                      ? 'text-rose-400 font-black'
                                      : 'text-slate-500 print:text-black'
                                  }`}
                                >
                                  {inv.remainingAmount.toLocaleString()} {settings.currency}
                                </td>
                                <td className="py-2.5 px-3 font-sans text-slate-300 print:text-black">
                                  {inv.paymentMethod}
                                </td>
                                <td className="py-2.5 px-3 font-sans text-slate-500 print:text-black text-[10px]">
                                  {inv.notes || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-slate-900/90 font-bold border-t-2 border-slate-800 print:border-black print:bg-slate-100 text-[11px]">
                            <tr>
                              <td colSpan={3} className="py-3 px-3 text-right">
                                المجموع الكلي لكشف الحساب ({statement.customerName}):
                              </td>
                              <td className="py-3 px-3 text-center text-amber-400 print:text-black">
                                {statement.totalKg} كغ
                              </td>
                              <td></td>
                              <td className="py-3 px-3 text-left text-amber-400 print:text-black">
                                {statement.totalAmount.toLocaleString()} {settings.currency}
                              </td>
                              <td className="py-3 px-3 text-left text-emerald-400 print:text-black">
                                {statement.totalPaid.toLocaleString()} {settings.currency}
                              </td>
                              <td
                                className={`py-3 px-3 text-left text-sm ${
                                  isDebt ? 'text-rose-400 font-black' : 'text-emerald-400'
                                } print:text-black`}
                              >
                                {statement.remainingBalance.toLocaleString()} {settings.currency}
                              </td>
                              <td colSpan={2}></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Official Stamp & Signature line during Print */}
                      <div className="hidden print:grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-300 text-xs">
                        <div className="text-center space-y-8">
                          <div>المحاسب المسؤول / إدارة المصنع</div>
                          <div className="border-b border-dotted border-black w-48 mx-auto"></div>
                          <div>التوقيع والختم</div>
                        </div>
                        <div className="text-center space-y-8">
                          <div>المستلم / صاحب المحل المقر بصحة الرصيد</div>
                          <div className="border-b border-dotted border-black w-48 mx-auto"></div>
                          <div>الاسم والتوقيع: ({statement.customerName})</div>
                        </div>
                      </div>

                      {/* Customer Actions Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print border-t border-slate-800">
                        <div className="text-[11px] text-slate-400">
                          {isDebt ? (
                            <span className="text-rose-400 font-bold">
                              ⚠️ متبقي بذمة الزبون مبلغ: {statement.remainingBalance.toLocaleString()} {settings.currency}
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-bold">
                              ✔️ الحساب مسدد وخالص بالكامل حتى تاريخه.
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow"
                              title="إرسال ملخص الكشف عبر واتساب لمحل الزبون"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>مراسلة واتساب</span>
                            </a>
                          )}

                          <button
                            onClick={() => handlePrintSingle(statement.customerName)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition shadow"
                            title="طباعة كشف هذا الزبون فقط A4"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>طباعة كشف الزبون (A4)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-400 no-print rounded-b-3xl flex items-center justify-center gap-2">
          <Usb className="w-4 h-4 text-sky-400" />
          <span>
            <b>نسخة الفلاشة المحمولة:</b> يمكنك حفظ هذا الكشف بصيغة HTML المستقلة على الفلاش ميموري وأخذه معك في جولات التوزيع لمناقشة الحسابات مباشرة بدون إنترنت.
          </span>
        </div>
      </div>
    </div>
  );
};
