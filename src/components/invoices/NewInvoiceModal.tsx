import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { InvoiceItem } from '../../types/cheeseFactory';
import { X, Plus, Trash2, Receipt, AlertCircle, CheckCircle2 } from 'lucide-react';

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: (invoiceId: string) => void;
}

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({
  isOpen,
  onClose,
  onInvoiceCreated,
}) => {
  const { clients, finishedProducts, settings, createInvoice } = useFactory();

  if (!isOpen) return null;

  // Selected client
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [clientName, setClientName] = useState<string>(clients[0]?.name || '');
  const [clientPhone, setClientPhone] = useState<string>(clients[0]?.phone || '');
  const [clientAddress, setClientAddress] = useState<string>(clients[0]?.address || '');
  const [clientTaxNumber, setClientTaxNumber] = useState<string>(clients[0]?.taxNumber || '');

  // Payment terms
  const [paymentMethod, setPaymentMethod] = useState<'نقدي (كاش)' | 'آجل (ذمم)' | 'تحويل بنكي' | 'شيك بنكي'>('نقدي (كاش)');
  const [paymentStatus, setPaymentStatus] = useState<'مدفوعة بالكامل' | 'معلقة (آجل)' | 'مدفوعة جزئياً'>('مدفوعة بالكامل');
  const [salesRep, setSalesRep] = useState<string>('خالد المطيري');
  const [taxPercent, setTaxPercent] = useState<number>(settings.defaultTaxPercent || 15);
  const [notes, setNotes] = useState<string>('تسليم مع سيارة تبريد مطابقة لدرجات الحرارة.');

  // Invoice Items
  const defaultProduct = finishedProducts[0];
  const [items, setItems] = useState<
    Array<{
      productId: string;
      productName: string;
      batchNumber: string;
      quantityKg: number;
      unitPrice: number;
      discount: number;
    }>
  >([
    {
      productId: defaultProduct?.id || '',
      productName: defaultProduct?.name || 'جبنة حلوم بلدية',
      batchNumber: defaultProduct?.batchNumber || 'CH-26101',
      quantityKg: 10,
      unitPrice: defaultProduct?.sellingPricePerKg || 38,
      discount: 0,
    },
  ]);

  const [paidAmountManual, setPaidAmountManual] = useState<number | null>(null);

  // Handle client selection change
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const cli = clients.find((c) => c.id === clientId);
    if (cli) {
      setClientName(cli.name);
      setClientPhone(cli.phone);
      setClientAddress(cli.address);
      setClientTaxNumber(cli.taxNumber || '');
    }
  };

  // Add Item Line
  const handleAddItem = () => {
    const prod = finishedProducts[0];
    setItems((prev) => [
      ...prev,
      {
        productId: prod?.id || '',
        productName: prod?.name || '',
        batchNumber: prod?.batchNumber || '',
        quantityKg: 10,
        unitPrice: prod?.sellingPricePerKg || 30,
        discount: 0,
      },
    ]);
  };

  // Remove Item Line
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update item field
  const handleUpdateItem = (index: number, field: string, val: any) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;

        if (field === 'productId') {
          const found = finishedProducts.find((p) => p.id === val);
          if (found) {
            return {
              ...item,
              productId: found.id,
              productName: found.name,
              batchNumber: found.batchNumber,
              unitPrice: found.sellingPricePerKg,
            };
          }
        }

        return { ...item, [field]: val };
      })
    );
  };

  // Financial calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantityKg * item.unitPrice,
    0
  );
  const discountTotal = items.reduce((sum, item) => sum + item.discount, 0);
  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const taxAmount = Math.round((taxableAmount * (taxPercent / 100)) * 100) / 100;
  const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

  const paidAmount =
    paymentStatus === 'مدفوعة بالكامل'
      ? grandTotal
      : paymentStatus === 'معلقة (آجل)'
      ? 0
      : paidAmountManual !== null
      ? paidAmountManual
      : Math.round(grandTotal / 2);

  const remainingAmount = Math.max(0, Math.round((grandTotal - paidAmount) * 100) / 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert('يرجى تحديد اسم العميل');
      return;
    }

    if (items.length === 0) {
      alert('يرجى إضافة صنف جبنة واحد على الأقل للفاتورة');
      return;
    }

    // Verify stock availability
    for (const item of items) {
      const prod = finishedProducts.find((p) => p.id === item.productId);
      if (prod && item.quantityKg > prod.currentStockKg) {
        const confirmExceed = confirm(
          `تحذير: الكمية المطلوبة من (${item.productName}) هي ${item.quantityKg} كغ، بينما الرصيد الحالي المتوفر في البراد هو ${prod.currentStockKg} كغ فقط.\nهل تريد المتابعة وإصدار الفاتورة؟`
        );
        if (!confirmExceed) return;
      }
    }

    const todayDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const dueDate =
      paymentStatus === 'معلقة (آجل)'
        ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        : todayDate.split(' ')[0];

    const finalInvoiceItems: InvoiceItem[] = items.map((item, idx) => ({
      id: `ITEM-${Date.now()}-${idx}`,
      productId: item.productId,
      productName: item.productName,
      batchNumber: item.batchNumber,
      quantityKg: item.quantityKg,
      unitPrice: item.unitPrice,
      discount: item.discount,
      total: Math.max(0, item.quantityKg * item.unitPrice - item.discount),
    }));

    const created = createInvoice({
      clientName,
      clientPhone,
      clientAddress,
      clientTaxNumber,
      issueDate: todayDate,
      dueDate,
      paymentMethod,
      paymentStatus,
      items: finalInvoiceItems,
      subtotal,
      discountTotal,
      taxPercent,
      taxAmount,
      grandTotal,
      paidAmount,
      remainingAmount,
      notes,
      salesRepresentative: salesRep,
    });

    onClose();
    onInvoiceCreated(created.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">إصدار فاتورة بيع جديدة</h3>
              <p className="text-xs text-slate-400">
                تسجيل بنود الأجبان المباعة، ربط أرقام التشغيلات، والخصم التلقائي من المخزون
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Client Setup */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 border-b border-slate-800 pb-2">
              <span>بيانات العميل والمشتري</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-normal">اختيار عميل مسجل:</span>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                  <option value="custom">عميل نقدي جديد</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم العميل *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الهاتف *</label>
                <input
                  type="text"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">العنوان وموقع التسليم</label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الرقم الضريبي للعميل</label>
                <input
                  type="text"
                  value={clientTaxNumber}
                  onChange={(e) => setClientTaxNumber(e.target.value)}
                  placeholder="3000..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Cheese Items Table */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2">
              <span>أصناف الأجبان والكميات المباعة</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 bg-emerald-700/40 hover:bg-emerald-600/60 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة بند جبنة آخر</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => {
                const selectedProd = finishedProducts.find((p) => p.id === item.productId);

                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                  >
                    {/* Cheese Selector */}
                    <div className="sm:col-span-4">
                      <label className="block text-slate-500 text-[10px] mb-0.5">
                        صنف الجبن من المستودع *
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleUpdateItem(idx, 'productId', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs"
                      >
                        {finishedProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (المتاح: {p.currentStockKg} كغ)
                          </option>
                        ))}
                      </select>
                      {selectedProd && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          لوت: <span className="text-amber-400">{selectedProd.batchNumber}</span> •
                          متوفر: <span className="text-emerald-400">{selectedProd.currentStockKg} كغ</span>
                        </div>
                      )}
                    </div>

                    {/* Quantity (kg) */}
                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 text-[10px] mb-0.5">
                        الوزن المباع (كغ) *
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        required
                        value={item.quantityKg}
                        onChange={(e) =>
                          handleUpdateItem(idx, 'quantityKg', parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono font-bold"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 text-[10px] mb-0.5">
                        سعر الكيلو ({settings.currency})
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono"
                      />
                    </div>

                    {/* Discount */}
                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 text-[10px] mb-0.5">الخصم (مبلغ)</label>
                      <input
                        type="number"
                        step="1"
                        value={item.discount}
                        onChange={(e) =>
                          handleUpdateItem(idx, 'discount', parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono"
                      />
                    </div>

                    {/* Total & Delete */}
                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0">
                      <div className="text-left font-mono">
                        <span className="text-slate-500 text-[10px] block">المجموع:</span>
                        <span className="font-bold text-white text-xs">
                          {Math.max(0, item.quantityKg * item.unitPrice - item.discount).toFixed(2)}{' '}
                          {settings.currency}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-30 transition rounded"
                        title="حذف البند"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Terms & Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Options */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 block border-b border-slate-800 pb-2">
                شروط السداد ومندوب المبيعات
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">طريقة الدفع *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="نقدي (كاش)">نقدي (كاش)</option>
                    <option value="آجل (ذمم)">آجل (ذمم فندقية وتجارية)</option>
                    <option value="تحويل بنكي">تحويل بنكي مباشر</option>
                    <option value="شيك بنكي">شيك بنكي مؤجل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">حالة التحصيل *</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="مدفوعة بالكامل">مدفوعة بالكامل</option>
                    <option value="معلقة (آجل)">معلقة (آجل بالكامل)</option>
                    <option value="مدفوعة جزئياً">دفعة أولى جزئية</option>
                  </select>
                </div>

                {paymentStatus === 'مدفوعة جزئياً' && (
                  <div className="col-span-2">
                    <label className="block text-slate-400 mb-1 font-semibold">
                      المبلغ المدفوع مقدماً ({settings.currency})
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={paidAmountManual ?? Math.round(grandTotal / 2)}
                      onChange={(e) => setPaidAmountManual(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">نسبة الضريبة %</label>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">مندوب التسليم</label>
                  <input
                    type="text"
                    value={salesRep}
                    onChange={(e) => setSalesRep(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Calculations Card */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2 font-mono">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>المجموع الإجمالي للبنود:</span>
                  <span className="font-bold text-white">
                    {subtotal.toFixed(2)} {settings.currency}
                  </span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>إجمالي الخصم التجاري:</span>
                    <span className="font-bold">
                      -{discountTotal.toFixed(2)} {settings.currency}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>ضريبة القيمة المضافة ({taxPercent}%):</span>
                  <span className="font-bold text-white">
                    {taxAmount.toFixed(2)} {settings.currency}
                  </span>
                </div>

                <div className="border-t border-slate-800 pt-2 flex justify-between text-base font-black text-emerald-400">
                  <span>صافي الفاتورة الإجمالي:</span>
                  <span>
                    {grandTotal.toFixed(2)} {settings.currency}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-400 pt-1">
                  <span>المسدد: {paidAmount.toFixed(2)}</span>
                  <span className="text-amber-400">
                    المتبقي: {remainingAmount.toFixed(2)} {settings.currency}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 font-sans border-t border-slate-800">
                سيتم خصم الكميات المحددة فورياً من مستودع الأجبان الجاهزة لضمان دقة الرصيد.
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              إصدار الفاتورة وتأكيد الخصم من المستودع
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
