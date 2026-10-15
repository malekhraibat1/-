import React from 'react';
import { Invoice } from '../../types/cheeseFactory';
import { useFactory } from '../../context/FactoryContext';
import { X, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const { settings } = useFactory();

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:max-w-none print:w-full print:h-auto print:max-h-none">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span>معاينة وطباعة الفاتورة الضريبية الرسمية (Invoice Preview & Print)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة (A4 / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Body */}
        <div className="p-8 space-y-6 overflow-y-auto flex-1 bg-white text-slate-900 rounded-b-2xl print:p-0 print:rounded-none">
          {/* Header Section */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl">
                  ج
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {settings.factoryName}
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold">{settings.subTitle}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                <p>سجل تجاري: {settings.commercialRegistration}</p>
                <p className="font-mono">الرقم الضريبي: {settings.taxNumber}</p>
                <p>{settings.address} • هاتف: {settings.phone}</p>
              </div>
            </div>

            <div className="text-left font-mono border-2 border-slate-900 p-4 rounded-xl bg-slate-50 min-w-[220px]">
              <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                فاتورة مبيعات ضريبية
              </div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {invoice.invoiceNumber}
              </div>
              <div className="text-xs text-slate-600 mt-2 space-y-1">
                <div>التاريخ: {invoice.issueDate}</div>
                <div>استحقاق: {invoice.dueDate || invoice.issueDate}</div>
                <div className="text-emerald-700 font-bold">
                  طريقة الدفع: {invoice.paymentMethod}
                </div>
              </div>
            </div>
          </div>

          {/* Client & Delivery Information */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px] font-semibold mb-1">
                بيانات العميل والمشتري:
              </span>
              <div className="text-sm font-black text-slate-900">{invoice.clientName}</div>
              <div className="text-slate-600 mt-1">الهاتف: {invoice.clientPhone}</div>
              {invoice.clientAddress && (
                <div className="text-slate-600">العنوان: {invoice.clientAddress}</div>
              )}
              {invoice.clientTaxNumber && (
                <div className="text-slate-600 font-mono">
                  الرقم الضريبي للعميل: {invoice.clientTaxNumber}
                </div>
              )}
            </div>

            <div className="text-left">
              <span className="text-slate-500 block text-[11px] font-semibold mb-1">
                بيانات التسليم والمسؤول:
              </span>
              <div className="text-slate-700">
                مندوب المبيعات: <b>{invoice.salesRepresentative}</b>
              </div>
              <div className="text-slate-700 mt-1">
                حالة السداد: <b>{invoice.paymentStatus}</b>
              </div>
              <div className="text-slate-500 text-[11px] mt-1">
                شرط الحفظ: نقل وتخزين مبرد (2°C - 5°C)
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">صنف الجبنة وبيان الصنف</th>
                  <th className="py-2.5 px-3">رقم التشغيلة (Batch)</th>
                  <th className="py-2.5 px-3 text-center">الوزن (كغ)</th>
                  <th className="py-2.5 px-3 font-mono text-center">سعر الكيلو</th>
                  <th className="py-2.5 px-3 font-mono text-center">الخصم</th>
                  <th className="py-2.5 px-3 font-mono text-left">الإجمالي الصافي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.productName}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-700 font-bold text-[11px]">
                      {item.batchNumber}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-center">
                      {item.quantityKg} كغ
                    </td>
                    <td className="py-2.5 px-3 font-mono text-center text-slate-700">
                      {item.unitPrice.toFixed(2)} {settings.currency}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-center text-slate-500">
                      {item.discount > 0 ? `${item.discount.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-black text-left text-slate-900">
                      {item.total.toFixed(2)} {settings.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Breakdown & QR Verification */}
          <div className="grid grid-cols-2 gap-6 items-end pt-2">
            {/* Notes & Security Stamp */}
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                <div className="font-bold text-slate-800 mb-1">شروط وملاحظات الفاتورة:</div>
                <p>{invoice.notes || settings.footerNotes}</p>
                <p className="mt-1 text-slate-500">
                  جميع أصناف الأجبان المنتجة خاضعة لرقابة الجودة وتتبع أرقام التشغيلات الغذائية.
                </p>
              </div>

              <div className="flex items-center gap-3 p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-800 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-[11px] leading-tight">
                  فاتورة نظامية معتمدة قابلة للتتبع ضمن معايير الهيئة العامة للغذاء والدواء
                </span>
              </div>
            </div>

            {/* Financial Summary Box */}
            <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/80 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي الخاضع للضريبة:</span>
                <span className="font-bold">{invoice.subtotal.toFixed(2)} {settings.currency}</span>
              </div>

              {invoice.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>إجمالي الخصم التجاري:</span>
                  <span className="font-bold">-{invoice.discountTotal.toFixed(2)} {settings.currency}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>ضريبة القيمة المضافة ({invoice.taxPercent}%):</span>
                <span className="font-bold">{invoice.taxAmount.toFixed(2)} {settings.currency}</span>
              </div>

              <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-base font-black text-slate-900">
                <span>المجموع الإجمالي النهائي:</span>
                <span>{invoice.grandTotal.toFixed(2)} {settings.currency}</span>
              </div>

              <div className="border-t border-slate-300 pt-2 flex justify-between text-xs text-slate-700">
                <span>المبلغ المسدد:</span>
                <span className="font-bold">{invoice.paidAmount.toFixed(2)} {settings.currency}</span>
              </div>

              {invoice.remainingAmount > 0 && (
                <div className="flex justify-between text-xs text-rose-700 font-bold">
                  <span>المبلغ المتبقي (آجل):</span>
                  <span>{invoice.remainingAmount.toFixed(2)} {settings.currency}</span>
                </div>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div className="border-t border-slate-300 pt-6 mt-4 grid grid-cols-3 gap-6 text-xs text-center">
            <div>
              <div className="text-slate-500 mb-6">مسؤول المستودع والتسليم</div>
              <div className="border-b border-dashed border-slate-400 w-32 mx-auto mb-1"></div>
              <div className="font-bold text-slate-800">{invoice.salesRepresentative}</div>
            </div>

            <div>
              <div className="text-slate-500 mb-6">المحاسب المعتمد</div>
              <div className="border-b border-dashed border-slate-400 w-32 mx-auto mb-1"></div>
              <div className="font-bold text-slate-800">التوقيع والختم</div>
            </div>

            <div>
              <div className="text-slate-500 mb-6">استلمت البضاعة بحالة سليمة ومبردة</div>
              <div className="border-b border-dashed border-slate-400 w-32 mx-auto mb-1"></div>
              <div className="font-bold text-slate-800">توقيع المستلم / العميل</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
