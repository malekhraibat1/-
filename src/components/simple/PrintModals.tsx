import React from 'react';
import { MilkSupplyEntry, CheeseSaleInvoice } from '../../types/dairySimple';
import { SupplierStatement, useDairy } from '../../context/DairyContext';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PrintMilkReceiptProps {
  entry: MilkSupplyEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintMilkReceiptModal: React.FC<PrintMilkReceiptProps> = ({
  entry,
  isOpen,
  onClose,
}) => {
  const { settings } = useDairy();

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 no-print">
          <div className="text-xs font-bold text-sky-400">سند توريد واستلام حليب للمورد</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة السند</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Body */}
        <div className="p-8 space-y-6 overflow-y-auto flex-1 bg-white text-slate-900 rounded-b-2xl print:p-0 print:rounded-none">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-lg font-black text-slate-900">{settings.workshopName}</h1>
              <p className="text-xs text-slate-600">{settings.address} • هاتف: {settings.phone}</p>
            </div>
            <div className="text-left font-mono border border-slate-300 p-2.5 rounded-lg bg-slate-50">
              <div className="text-xs font-bold text-slate-800">سند توريد ودفع حليب</div>
              <div className="text-[11px] text-slate-600 mt-1">التاريخ: {entry.date}</div>
              <div className="text-[10px] text-slate-500">رقم الحركة: {entry.id}</div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div className="flex justify-between items-center">
              <span>اسم المورد: <b className="text-sm">{entry.supplierName}</b></span>
              <span>طريقة الدفع: <b>{entry.paymentType}</b></span>
            </div>
          </div>

          {/* Supply Table */}
          <table className="w-full text-right text-xs border border-slate-300">
            <thead className="bg-slate-100 font-bold">
              <tr className="border-b border-slate-300">
                <th className="py-2.5 px-3">البيان</th>
                <th className="py-2.5 px-3 font-mono text-center">الكمية باللتر</th>
                <th className="py-2.5 px-3 font-mono text-center">سعر اللتر</th>
                <th className="py-2.5 px-3 font-mono text-left">المجموع الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-3 font-bold">حليب خام طازج ومفحوص</td>
                <td className="py-3 px-3 font-mono font-black text-center text-sm">
                  {entry.quantityLiters.toLocaleString()} لتر
                </td>
                <td className="py-3 px-3 font-mono text-center">
                  {entry.pricePerLiter} {settings.currency}
                </td>
                <td className="py-3 px-3 font-mono font-black text-left text-sm text-slate-900">
                  {entry.totalAmount.toLocaleString()} {settings.currency}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Cheque details if any */}
          {entry.chequeDetails && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs space-y-1">
              <div className="font-bold text-amber-900">تفاصيل الشيك المصروف:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-700">
                <div>صاحب الشيك: <b>{entry.chequeDetails.chequeHolderName}</b></div>
                <div>رقم الشيك: <b>{entry.chequeDetails.chequeNumber}</b></div>
                <div>الاستحقاق: <b>{entry.chequeDetails.chequeDate}</b></div>
                <div>البنك: <b>{entry.chequeDetails.bankName}</b></div>
              </div>
            </div>
          )}

          {/* Payment & Balance Breakdown */}
          <div className="border border-slate-300 p-4 rounded-xl bg-slate-50 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span>إجمالي حساب الحليب:</span>
              <span className="font-bold">{entry.totalAmount.toLocaleString()} {settings.currency}</span>
            </div>
            {entry.paidCash > 0 && (
              <div className="flex justify-between">
                <span>المدفوع نقداً:</span>
                <span className="font-bold">{entry.paidCash.toLocaleString()} {settings.currency}</span>
              </div>
            )}
            {entry.paidCheque > 0 && (
              <div className="flex justify-between text-amber-800">
                <span>المدفوع بشيك:</span>
                <span className="font-bold">{entry.paidCheque.toLocaleString()} {settings.currency}</span>
              </div>
            )}
            <div className="border-t border-slate-300 pt-1 flex justify-between font-bold">
              <span>مجموع المدفوع:</span>
              <span>{entry.totalPaid.toLocaleString()} {settings.currency}</span>
            </div>
            <div className="border-t-2 border-slate-900 pt-2 flex justify-between font-black text-sm text-slate-900 font-sans">
              <span>الباقي من هذه الحركة:</span>
              <span className="font-mono">
                {entry.balanceRemaining === 0 ? (
                  'خالص (0)'
                ) : (
                  `${entry.balanceRemaining.toLocaleString()} ${settings.currency} (${entry.balanceType === 'علينا' ? 'علينا للمورد' : 'لنا على المورد'})`
                )}
              </span>
            </div>
          </div>

          {entry.notes && (
            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded">
              ملاحظات: {entry.notes}
            </div>
          )}

          {/* Signatures */}
          <div className="border-t border-slate-300 pt-6 mt-6 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <div className="text-slate-500 mb-6">مسؤول استلام الحليب بالمعمل</div>
              <div className="border-b border-dashed border-slate-400 w-36 mx-auto mb-1"></div>
              <div className="font-bold">التوقيع والاعتماد</div>
            </div>
            <div>
              <div className="text-slate-500 mb-6">المورد / صاحب الحليب</div>
              <div className="border-b border-dashed border-slate-400 w-36 mx-auto mb-1"></div>
              <div className="font-bold">{entry.supplierName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PrintStatementProps {
  statement: SupplierStatement | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintSupplierStatementModal: React.FC<PrintStatementProps> = ({
  statement,
  isOpen,
  onClose,
}) => {
  const { settings } = useDairy();

  if (!isOpen || !statement) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 no-print">
          <div className="text-xs font-bold text-purple-400">
            كشف حساب محاسبي كامل للمورد: {statement.supplier.name}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف الحساب (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Body */}
        <div className="p-8 space-y-6 overflow-y-auto flex-1 bg-white text-slate-900 rounded-b-2xl print:p-0 print:rounded-none">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-lg font-black text-slate-900">{settings.workshopName}</h1>
              <p className="text-xs text-slate-600">{settings.address} • هاتف: {settings.phone}</p>
            </div>
            <div className="text-left font-mono border border-slate-300 p-2.5 rounded-lg bg-slate-50">
              <div className="text-xs font-bold text-purple-900">كشف حساب مالي تفصيلي</div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                تاريخ الاستخراج: {new Date().toISOString().slice(0, 10)}
              </div>
            </div>
          </div>

          {/* Supplier details and Balances Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">اسم المورد:</span>
              <span className="font-bold text-sm text-slate-900">{statement.supplier.name}</span>
              <span className="text-[10px] text-slate-500 block">{statement.supplier.phone}</span>
            </div>

            <div>
              <span className="text-slate-500 block">إجمالي كمية الحليب:</span>
              <span className="font-black text-sm text-sky-700 font-mono">
                {statement.totalLiters.toLocaleString()} لتر
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">مجموع حساب الحليب:</span>
              <span className="font-black text-sm text-slate-900 font-mono">
                {statement.totalCost.toLocaleString()} {settings.currency}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">الرصيد الصافي المتبقي:</span>
              <span
                className={`font-black text-sm font-mono ${
                  statement.balanceStatus === 'علينا'
                    ? 'text-rose-700'
                    : statement.balanceStatus === 'لنا'
                    ? 'text-emerald-700'
                    : 'text-slate-700'
                }`}
              >
                {statement.netBalance.toLocaleString()} {settings.currency} (
                {statement.balanceStatus === 'علينا'
                  ? 'علينا له'
                  : statement.balanceStatus === 'لنا'
                  ? 'لنا عليه'
                  : 'خالص'}
                )
              </span>
            </div>
          </div>

          {/* Transactions History Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800">سجل حركات التوريد والدفعات:</h4>
            <table className="w-full text-right text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700">
                <tr className="border-b border-slate-300">
                  <th className="py-2 px-2.5 font-mono">التاريخ</th>
                  <th className="py-2 px-2.5 font-mono">الكمية (لتر)</th>
                  <th className="py-2 px-2.5 font-mono">سعر اللتر</th>
                  <th className="py-2 px-2.5 font-mono">المجموع</th>
                  <th className="py-2 px-2.5">طريقة الدفع</th>
                  <th className="py-2 px-2.5 font-mono">نقداً</th>
                  <th className="py-2 px-2.5 font-mono">شيكات</th>
                  <th className="py-2 px-2.5 font-mono">الباقي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {statement.transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="py-2 px-2.5 font-bold">{t.date}</td>
                    <td className="py-2 px-2.5 font-bold text-sky-800">
                      {t.quantityLiters.toLocaleString()}
                    </td>
                    <td className="py-2 px-2.5">{t.pricePerLiter}</td>
                    <td className="py-2 px-2.5 font-black text-slate-900">
                      {t.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-2 px-2.5 font-sans">{t.paymentType}</td>
                    <td className="py-2 px-2.5">{t.paidCash.toLocaleString()}</td>
                    <td className="py-2 px-2.5">
                      {t.paidCheque > 0 ? (
                        <span>
                          {t.paidCheque.toLocaleString()}{' '}
                          <span className="text-[9px] text-slate-500 font-sans">
                            ({t.chequeDetails?.chequeNumber})
                          </span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2 px-2.5 font-bold">
                      {t.balanceRemaining === 0 ? (
                        '0'
                      ) : (
                        `${t.balanceRemaining} (${t.balanceType})`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="border-t border-slate-300 pt-6 mt-6 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <div className="text-slate-500 mb-6">المحاسب المعتمد للمعمل</div>
              <div className="border-b border-dashed border-slate-400 w-36 mx-auto mb-1"></div>
              <div className="font-bold">التوقيع والختم</div>
            </div>
            <div>
              <div className="text-slate-500 mb-6">مصادقة المورد على الرصيد</div>
              <div className="border-b border-dashed border-slate-400 w-36 mx-auto mb-1"></div>
              <div className="font-bold">{statement.supplier.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PrintInvoiceProps {
  invoice: CheeseSaleInvoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintSalesInvoiceModal: React.FC<PrintInvoiceProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const { settings } = useDairy();

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-slate-800 no-print gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs font-bold text-emerald-400">
              معاينة وطباعة الفاتورة الضريبية / التجارية رقم ({invoice.invoiceNumber})
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer active:scale-95 transition"
              title="طباعة الفاتورة فورياً أو حفظها كملف PDF"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة أو حفظ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="px-6 py-2 bg-emerald-950/40 border-b border-emerald-500/20 text-[11px] text-emerald-300 no-print flex items-center justify-between">
          <span>💡 تلميح للطباعة: لحفظ الفاتورة كملف PDF، اختر <b>"Save as PDF / حفظ بتنسيق PDF"</b> من وجهة الطابعة في نافذة الطباعة المنبثقة.</span>
          <span className="font-mono text-emerald-400 font-bold">قياس الورق: A4</span>
        </div>

        {/* Printable Body */}
        <div className="p-8 space-y-6 overflow-y-auto flex-1 bg-white text-slate-900 rounded-b-2xl print:p-0 print:rounded-none">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg">
                  🧀
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-900">{settings.workshopName}</h1>
                  <p className="text-xs text-slate-600 font-semibold">{settings.address} • هاتف: {settings.phone}</p>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                سجل تجاري وترخيص صناعات غذائية معتمد • حفظ الأغذية المبردة
              </div>
            </div>
            <div className="text-left font-mono border-2 border-slate-900 p-3 rounded-xl bg-slate-50 min-w-[200px]">
              <div className="text-xs font-bold text-slate-900 uppercase">فاتورة بيع رسمية</div>
              <div className="text-base font-black text-emerald-800 mt-0.5">
                {invoice.invoiceNumber}
              </div>
              <div className="text-[11px] text-slate-600 mt-1">التاريخ: {invoice.date}</div>
              <div className="text-[10px] text-slate-500 font-bold">طريقة السداد: {invoice.paymentMethod}</div>
            </div>
          </div>

          {/* Customer info card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-300 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-500 block text-[10px] mb-0.5">بيانات المشتري / العميل:</span>
              <span className="font-black text-sm text-slate-900">{invoice.customerName}</span>
              {invoice.customerPhone && <span className="font-mono text-slate-600 mr-2 font-bold">({invoice.customerPhone})</span>}
              {invoice.customerAddress && <div className="text-slate-600 text-[11px] mt-0.5">{invoice.customerAddress}</div>}
            </div>
            <div className="text-left text-[11px]">
              <span className="text-slate-500 block text-[10px]">حالة السداد:</span>
              <span className="font-bold text-slate-900">
                {invoice.remainingAmount === 0 ? 'مدفوعة بالكامل (خالص)' : 'متبقي في الذمة (آجل)'}
              </span>
              <div className="text-emerald-700 font-semibold mt-0.5">يُحفظ مبرداً (2°C - 5°C)</div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-right text-xs border border-slate-300 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-800 font-bold">
              <tr className="border-b border-slate-300">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">بيان صنف الجبنة</th>
                <th className="py-2.5 px-3 font-mono text-center">الوزن الصافي (كغ)</th>
                <th className="py-2.5 px-3 font-mono text-center">سعر الكيلو</th>
                <th className="py-2.5 px-3 font-mono text-left">المجموع الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{it.cheeseType}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-center text-amber-800">
                      {it.quantityKg} كغ
                    </td>
                    <td className="py-2.5 px-3 font-mono text-center">
                      {it.pricePerKg} {settings.currency}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-black text-left text-slate-900">
                      {it.total.toLocaleString()} {settings.currency}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 px-3 font-mono text-slate-500">1</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{invoice.cheeseType}</td>
                  <td className="py-3 px-3 font-mono font-black text-center text-sm text-amber-800">
                    {invoice.quantityKg} كغ
                  </td>
                  <td className="py-3 px-3 font-mono text-center">
                    {invoice.pricePerKg} {settings.currency}
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-left text-sm text-slate-900">
                    {invoice.totalAmount.toLocaleString()} {settings.currency}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals & Notes */}
          <div className="grid grid-cols-2 gap-4 items-start">
            <div className="space-y-2 text-xs">
              {invoice.notes && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                  <span className="font-bold block text-slate-900 mb-0.5">ملاحظات الفاتورة:</span>
                  <span>{invoice.notes}</span>
                </div>
              )}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600 space-y-0.5">
                <div>• البضاعة المباعة خاضعة لاشتراطات السلامة الغذائية.</div>
                <div>• يُرجى الاحتفاظ بالجبنة في مكان مبرد نظيف وتفادي التعرض للحرارة.</div>
              </div>
            </div>

            <div className="border border-slate-300 p-4 rounded-xl bg-slate-50 space-y-2 text-xs font-mono">
              <div className="flex justify-between font-bold text-slate-700">
                <span>المجموع الكلي للبنود:</span>
                <span>{invoice.totalAmount.toLocaleString()} {settings.currency}</span>
              </div>
              <div className="flex justify-between text-slate-800 font-semibold">
                <span>المبلغ المسدد:</span>
                <span>{invoice.paidAmount.toLocaleString()} {settings.currency}</span>
              </div>
              {invoice.remainingAmount > 0 ? (
                <div className="border-t-2 border-slate-300 pt-1.5 flex justify-between text-rose-700 font-bold font-sans">
                  <span>المتبقي في الذمة (آجل):</span>
                  <span className="font-mono">{invoice.remainingAmount.toLocaleString()} {settings.currency}</span>
                </div>
              ) : (
                <div className="border-t border-slate-300 pt-1 text-emerald-700 font-sans font-bold flex justify-between">
                  <span>حالة الفاتورة:</span>
                  <span>مدفوعة بالكامل ✓</span>
                </div>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div className="border-t-2 border-slate-800 pt-6 mt-6 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <div className="text-slate-500 mb-6">مسؤول المعمل والمبيعات</div>
              <div className="border-b border-dashed border-slate-400 w-36 mx-auto mb-1"></div>
              <div className="font-bold">التوقيع والختم</div>
            </div>
            <div>
              <div className="text-slate-500 mb-6">استلمت البضاعة بحالة سليمة</div>
              <div className="border-b border-dashed border-slate-400 w-36 mx-auto mb-1"></div>
              <div className="font-bold">{invoice.customerName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
