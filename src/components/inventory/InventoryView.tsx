import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import {
  Boxes,
  Milk,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  ArrowUpDown,
  Barcode,
  Calendar,
  Sparkles,
  ChevronDown,
  Warehouse,
} from 'lucide-react';
import { FinishedProduct, RawMaterial, CheeseType } from '../../types/cheeseFactory';

interface InventoryViewProps {
  onOpenNewBatch?: () => void;
  onSelectBatchForTraceability?: (batchNumber: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenNewBatch,
  onSelectBatchForTraceability,
}) => {
  const {
    finishedProducts,
    rawMaterials,
    settings,
    adjustProductStock,
    adjustRawStock,
    addRawMaterial,
    addFinishedProduct,
    deleteFinishedProduct,
    deleteRawMaterial,
  } = useFactory();

  const [activeTab, setActiveTab] = useState<'finished' | 'raw'>('finished');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals for adding materials/products
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddRawOpen, setIsAddRawOpen] = useState(false);

  // Finished Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdType, setNewProdType] = useState<CheeseType>('حلوم بلدي');
  const [newProdBatch, setNewProdBatch] = useState('');
  const [newProdStock, setNewProdStock] = useState<number>(50);
  const [newProdCost, setNewProdCost] = useState<number>(20);
  const [newProdPrice, setNewProdPrice] = useState<number>(35);
  const [newProdPkg, setNewProdPkg] = useState('قالب 1 كغ فاكيوم');
  const [newProdLocation, setNewProdLocation] = useState('براد المستودع الرئيسي R-1');
  const [newProdMinAlert, setNewProdMinAlert] = useState<number>(20);

  // Raw Material Form State
  const [newRawName, setNewRawName] = useState('');
  const [newRawCategory, setNewRawCategory] = useState<any>('حليب خام');
  const [newRawStock, setNewRawStock] = useState<number>(1000);
  const [newRawUnit, setNewRawUnit] = useState<any>('لتر');
  const [newRawMin, setNewRawMin] = useState<number>(200);
  const [newRawCost, setNewRawCost] = useState<number>(2.5);
  const [newRawSupplier, setNewRawSupplier] = useState('');
  const [newRawLot, setNewRawLot] = useState('');

  // Total metrics
  const totalFinishedKg = finishedProducts.reduce((sum, p) => sum + p.currentStockKg, 0);
  const totalFinishedVal = finishedProducts.reduce(
    (sum, p) => sum + p.currentStockKg * p.sellingPricePerKg,
    0
  );
  const totalRawMilk = rawMaterials
    .filter((r) => r.category === 'حليب خام')
    .reduce((sum, r) => sum + r.currentStock, 0);

  // Filtered Lists
  const filteredProducts = finishedProducts.filter((p) => {
    if (showLowStockOnly && p.currentStockKg > p.minAlertKg) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.batchNumber.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.storageLocation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredRaw = rawMaterials.filter((r) => {
    if (showLowStockOnly && r.currentStock > r.minThreshold) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.supplier.toLowerCase().includes(q) ||
        r.lotNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    addFinishedProduct({
      name: newProdName,
      cheeseType: newProdType,
      batchNumber: newProdBatch || `CH-${Date.now().toString().slice(-6)}`,
      currentStockKg: newProdStock,
      costPricePerKg: newProdCost,
      sellingPricePerKg: newProdPrice,
      packagingUnit: newProdPkg,
      productionDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      storageLocation: newProdLocation,
      minAlertKg: newProdMinAlert,
      barcode: `628100${Math.floor(1000000 + Math.random() * 9000000)}`,
    });

    setIsAddProductOpen(false);
    setNewProdName('');
  };

  const handleCreateRaw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRawName.trim()) return;

    addRawMaterial({
      name: newRawName,
      category: newRawCategory,
      currentStock: newRawStock,
      unit: newRawUnit,
      minThreshold: newRawMin,
      costPerUnit: newRawCost,
      supplier: newRawSupplier || 'المورد الرئيسي',
      lotNumber: newRawLot || `LOT-${Date.now().toString().slice(-4)}`,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });

    setIsAddRawOpen(false);
    setNewRawName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Warehouse className="w-6 h-6 text-amber-400" />
              <span>إدارة المخزون والمستودعات المزدوجة (Inventory System)</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إدارة فورية لمخزون الأجبان الجاهزة في البرادات، وخزانات الحليب الخام، ومستلزمات الإنتاج
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'finished' ? (
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/25 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>إضافة صنف جبن للمستودع</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddRawOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-blue-600/25 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>تسجيل مادة خام / استلام حليب</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-400 block font-semibold">
              إجمالي الجبن الجاهز للبيع
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
              {totalFinishedKg.toLocaleString()} كغ
            </span>
            <span className="text-[11px] text-slate-500">
              القيمة المقدرة: {totalFinishedVal.toLocaleString()} {settings.currency}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-400 block font-semibold">
              خزانات الحليب الخام المتاحة
            </span>
            <span className="text-2xl font-black text-blue-400 font-mono mt-0.5 block">
              {totalRawMilk.toLocaleString()} لتر
            </span>
            <span className="text-[11px] text-slate-500">جاهز للتحويل والإنتاج الفوري</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Milk className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-400 block font-semibold">
              المواد تحت حد التنبيه الأدنى
            </span>
            <span className="text-2xl font-black text-rose-400 font-mono mt-0.5 block">
              {rawMaterials.filter((r) => r.currentStock <= r.minThreshold).length +
                finishedProducts.filter((p) => p.currentStockKg <= p.minAlertKg).length}{' '}
              <span className="text-xs font-normal text-slate-400">نواقص</span>
            </span>
            <span className="text-[11px] text-slate-500">تتطلب إعادة طلب وتوريد</span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-slate-900/60 p-2 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('finished')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition ${
              activeTab === 'finished'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>مخزون الأجبان الجاهزة في البرادات ({finishedProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition ${
              activeTab === 'raw'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <Milk className="w-4 h-4" />
            <span>المواد الأولية والحليب ومستلزمات المعمل ({rawMaterials.length})</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span>النواقص فقط</span>
          </label>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالصنف، الباركود، رقم اللوت..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Tab 1: Finished Products Table */}
      {activeTab === 'finished' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="py-3 px-4 font-bold">صنف الجبنة</th>
                  <th className="py-3 px-4 font-bold">رقم التشغيلة (Batch)</th>
                  <th className="py-3 px-4 font-bold">الرصيد المتاح (كغ)</th>
                  <th className="py-3 px-4 font-bold">سعر البيع / التكلفة</th>
                  <th className="py-3 px-4 font-bold">التعبئة والتخزين</th>
                  <th className="py-3 px-4 font-bold">تاريخ الصلاحية</th>
                  <th className="py-3 px-4 font-bold">الباركود</th>
                  <th className="py-3 px-4 font-bold text-center">تعديل الجرد</th>
                  <th className="py-3 px-4 font-bold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      لا توجد أصناف تطابق معايير البحث
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const isLow = prod.currentStockKg <= prod.minAlertKg;

                    return (
                      <tr
                        key={prod.id}
                        className={`hover:bg-slate-800/40 transition ${
                          isLow ? 'bg-amber-950/15' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{prod.name}</span>
                            {isLow && (
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                title="تحت حد التنبيه الأدنى"
                              >
                                منخفض
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block font-normal">
                            {prod.cheeseType}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                          <button
                            onClick={() =>
                              onSelectBatchForTraceability &&
                              onSelectBatchForTraceability(prod.batchNumber)
                            }
                            className="hover:underline flex items-center gap-1"
                            title="عرض تتبع سلامة الغذاء"
                          >
                            <span>{prod.batchNumber}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <span
                            className={`text-sm font-black ${
                              isLow ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {prod.currentStockKg} كغ
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            حد التنبيه: {prod.minAlertKg} كغ
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <span className="text-slate-200 font-bold block">
                            {prod.sellingPricePerKg} {settings.currency} / كغ
                          </span>
                          <span className="text-[10px] text-slate-500">
                            التكلفة: {prod.costPricePerKg} {settings.currency}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-slate-300 block">{prod.packagingUnit}</span>
                          <span className="text-[10px] text-slate-500 block">
                            {prod.storageLocation}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                          <span>{prod.expiryDate}</span>
                          <span className="text-[10px] text-slate-500 block">
                            إنتاج: {prod.productionDate}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Barcode className="w-3.5 h-3.5 text-slate-500" />
                            {prod.barcode}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 font-mono">
                            <button
                              onClick={() => adjustProductStock(prod.id, -5)}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                              title="خصم 5 كغ (تالف / عينات)"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => adjustProductStock(prod.id, 5)}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                              title="إضافة 5 كغ (تسوية جردية)"
                            >
                              +5
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذا الصنف من المستودع؟')) {
                                deleteFinishedProduct(prod.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Raw Materials Table */}
      {activeTab === 'raw' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="py-3 px-4 font-bold">اسم المادة الخام / المستلزم</th>
                  <th className="py-3 px-4 font-bold">التصنيف</th>
                  <th className="py-3 px-4 font-bold">الكمية المتوفرة</th>
                  <th className="py-3 px-4 font-bold">حد الطلب الأدنى</th>
                  <th className="py-3 px-4 font-bold">سعر وتكلفة الوحدة</th>
                  <th className="py-3 px-4 font-bold">المورد والمزرعة</th>
                  <th className="py-3 px-4 font-bold">رقم الشحنة (Lot #)</th>
                  <th className="py-3 px-4 font-bold">آخر تحديث</th>
                  <th className="py-3 px-4 font-bold text-center">تعديل المخزون</th>
                  <th className="py-3 px-4 font-bold text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRaw.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      لا توجد مواد أولية تطابق هذا البحث
                    </td>
                  </tr>
                ) : (
                  filteredRaw.map((mat) => {
                    const isLow = mat.currentStock <= mat.minThreshold;

                    return (
                      <tr
                        key={mat.id}
                        className={`hover:bg-slate-800/40 transition ${
                          isLow ? 'bg-rose-950/15' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{mat.name}</span>
                            {isLow && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                تنبيه نقص
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px]">
                            {mat.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <span
                            className={`text-sm font-black ${
                              isLow ? 'text-rose-400' : 'text-blue-400'
                            }`}
                          >
                            {mat.currentStock.toLocaleString()} {mat.unit}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {mat.minThreshold} {mat.unit}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                          {mat.costPerUnit} {settings.currency} / {mat.unit}
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">{mat.supplier}</td>

                        <td className="py-3.5 px-4 font-mono text-amber-400 text-[11px]">
                          {mat.lotNumber}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-[10px]">
                          {mat.lastUpdated}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 font-mono">
                            <button
                              onClick={() => adjustRawStock(mat.id, Math.max(0, mat.currentStock - 50))}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                              title="استهلاك 50 وحدة"
                            >
                              -50
                            </button>
                            <button
                              onClick={() => adjustRawStock(mat.id, mat.currentStock + 100)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                              title="توريد 100 وحدة"
                            >
                              +100
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
                                deleteRawMaterial(mat.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Finished Product */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-100">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-emerald-400" />
              <span>إدخال صنف جبن إلى مستودع المنتجات الجاهزة</span>
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم الصنف بالكامل *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="مثال: جبنة عكاوي بلدية فاخرة محلاة"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">نوع الجبن *</label>
                  <select
                    value={newProdType}
                    onChange={(e) => setNewProdType(e.target.value as CheeseType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="حلوم بلدي">حلوم بلدي</option>
                    <option value="موزاريلا قوالب">موزاريلا قوالب</option>
                    <option value="موزاريلا مبشورة">موزاريلا مبشورة</option>
                    <option value="عكاوي تشيكي">عكاوي تشيكي</option>
                    <option value="فيتا بيضاء أصلية">فيتا بيضاء أصلية</option>
                    <option value="شيدر إنجليزي معتق">شيدر إنجليزي معتق</option>
                    <option value="قشقوان بلدي">قشقوان بلدي</option>
                    <option value="نابلسية مغلية بالمستكة">نابلسية مغلية بالمستكة</option>
                    <option value="جبنة قريش/ريكوتا">جبنة قريش/ريكوتا</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">رقم التشغيلة / اللوت</label>
                  <input
                    type="text"
                    value={newProdBatch}
                    onChange={(e) => setNewProdBatch(e.target.value)}
                    placeholder="CH-26105"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الكمية بالكيلو (كغ) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">سعر البيع الافتراضي للكيلو *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تكلفة الكيلو</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">موقع التخزين (البراد)</label>
                  <input
                    type="text"
                    value={newProdLocation}
                    onChange={(e) => setNewProdLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Raw Material */}
      {isAddRawOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-100">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Milk className="w-5 h-5 text-blue-400" />
              <span>تسجيل مادة خام / استلام شحنة حليب</span>
            </h3>

            <form onSubmit={handleCreateRaw} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم المادة الخام *</label>
                <input
                  type="text"
                  required
                  value={newRawName}
                  onChange={(e) => setNewRawName(e.target.value)}
                  placeholder="مثال: حليب أبقار خام مزرعة البركة"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">التصنيف *</label>
                  <select
                    value={newRawCategory}
                    onChange={(e) => setNewRawCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="حليب خام">حليب خام</option>
                    <option value="منفحة ومخثرات">منفحة ومخثرات</option>
                    <option value="بوادئ وبكتيريا">بوادئ وبكتيريا</option>
                    <option value="أملاح ومواد مساعدة">أملاح ومواد مساعدة</option>
                    <option value="مواد تعبئة وتغليف">مواد تعبئة وتغليف</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">وحدة القياس *</label>
                  <select
                    value={newRawUnit}
                    onChange={(e) => setNewRawUnit(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="لتر">لتر</option>
                    <option value="كغ">كغ</option>
                    <option value="غرام">غرام</option>
                    <option value="علبة">علبة</option>
                    <option value="كيس">كيس</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الكمية الحالية *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newRawStock}
                    onChange={(e) => setNewRawStock(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">حد الطلب الأدنى *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newRawMin}
                    onChange={(e) => setNewRawMin(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تكلفة الوحدة *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newRawCost}
                    onChange={(e) => setNewRawCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">المورد / المزرعة</label>
                  <input
                    type="text"
                    value={newRawSupplier}
                    onChange={(e) => setNewRawSupplier(e.target.value)}
                    placeholder="مزرعة الواحة للألبان"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddRawOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black"
                >
                  حفظ المادة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
