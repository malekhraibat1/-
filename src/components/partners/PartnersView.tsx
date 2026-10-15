import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { Client, Supplier } from '../../types/cheeseFactory';
import {
  Users2,
  Milk,
  Building2,
  Phone,
  MapPin,
  Plus,
  Search,
  Star,
  DollarSign,
  Trash2,
  TrendingUp,
} from 'lucide-react';

export const PartnersView: React.FC = () => {
  const {
    clients,
    suppliers,
    settings,
    addClient,
    deleteClient,
    addSupplier,
    deleteSupplier,
  } = useFactory();

  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers'>('clients');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);

  // Client form
  const [clientName, setClientName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientTax, setClientTax] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(30000);
  const [clientCategory, setClientCategory] = useState<any>('مطاعم وفنادق');

  // Supplier form
  const [supName, setSupName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supLocation, setSupLocation] = useState('');
  const [milkType, setMilkType] = useState('حليب أبقار طازج دسم 3.8%+');
  const [dailyCapacity, setDailyCapacity] = useState<number>(5000);
  const [pricePerL, setPricePerL] = useState<number>(2.4);

  // Financial calculations
  const totalReceivables = clients.reduce((sum, c) => sum + c.outstandingBalance, 0);

  const filteredClients = clients.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredSuppliers = suppliers.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.farmName.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    addClient({
      name: clientName,
      contactPerson,
      phone: clientPhone,
      address: clientAddress,
      taxNumber: clientTax,
      creditLimit,
      category: clientCategory,
    });

    setIsAddClientOpen(false);
    setClientName('');
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;

    addSupplier({
      name: supName,
      farmName,
      phone: supPhone,
      location: supLocation,
      milkTypeSupplied: milkType,
      dailyCapacityLiters: dailyCapacity,
      pricePerLiter: pricePerL,
      qualityRating: 5,
    });

    setIsAddSupplierOpen(false);
    setSupName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Users2 className="w-6 h-6 text-amber-400" />
              <span>إدارة العملاء وموردي الحليب والمزارع (Partners & Supply Chain)</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            سجلات المزارع المزودة للحليب وسجل مشتريات المطاعم والموزعين والذمم المدينة
          </p>
        </div>

        <div>
          {activeTab === 'clients' ? (
            <button
              onClick={() => setIsAddClientOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>إضافة عميل / مشتري جديد</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddSupplierOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>إضافة مورد حليب ومزرعة</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold transition ${
              activeTab === 'clients'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>عملاء المعمل والموزعين ({clients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold transition ${
              activeTab === 'suppliers'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <Milk className="w-4 h-4" />
            <span>موردي الحليب ومزارع الألبان ({suppliers.length})</span>
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، الهاتف، الموقع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
          />
        </div>
      </div>

      {/* Clients Tab Content */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-white">{c.name}</h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold inline-block mt-1">
                      {c.category}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`حذف العميل ${c.name}؟`)) deleteClient(c.id);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  {c.contactPerson && (
                    <div className="text-slate-400">
                      المسؤول: <b className="text-slate-200">{c.contactPerson}</b>
                    </div>
                  )}
                  <div className="flex items-center gap-2 font-mono text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.address}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 bg-slate-950/60 -mx-5 -mb-5 p-4 rounded-b-2xl font-mono text-xs flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">
                    إجمالي المشتريات:
                  </span>
                  <span className="font-bold text-white">
                    {c.totalPurchases.toLocaleString()} {settings.currency}
                  </span>
                </div>

                <div className="text-left">
                  <span className="text-[10px] text-slate-500 block font-sans">
                    الذمة الحالية (الآجل):
                  </span>
                  <span
                    className={`font-black ${
                      c.outstandingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {c.outstandingBalance.toLocaleString()} {settings.currency}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suppliers Tab Content */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((s) => (
            <div
              key={s.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-white">{s.name}</h3>
                    <div className="text-xs text-blue-400 font-semibold mt-0.5">{s.farmName}</div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`حذف المورد ${s.name}؟`)) deleteSupplier(s.id);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Milk className="w-3.5 h-3.5 text-blue-400" />
                    <span>{s.milkTypeSupplied}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{s.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{s.location}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 bg-slate-950/60 -mx-5 -mb-5 p-4 rounded-b-2xl font-mono text-xs flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">
                    الطاقة اليومية للتوريد:
                  </span>
                  <span className="font-bold text-blue-400">
                    {s.dailyCapacityLiters.toLocaleString()} لتر/يوم
                  </span>
                </div>

                <div className="text-left">
                  <span className="text-[10px] text-slate-500 block font-sans">
                    سعر اللتر المتفق عليه:
                  </span>
                  <span className="font-black text-white">
                    {s.pricePerLiter} {settings.currency}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Client */}
      {isAddClientOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-100">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>إضافة عميل / مشتري جديد</span>
            </h3>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  اسم المنشأة أو العميل *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="مثال: مطعم قصر الشام للوجبات"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تصنيف النشاط *</label>
                  <select
                    value={clientCategory}
                    onChange={(e) => setClientCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="سوبرماركت وهايبرماركت">سوبرماركت وهايبرماركت</option>
                    <option value="مطاعم وفنادق">مطاعم وفنادق</option>
                    <option value="موزع جملة">موزع جملة</option>
                    <option value="محل تجزئة">محل تجزئة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الشخص المسؤول</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    سقف الائتمان ({settings.currency})
                  </label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">
                    العنوان وموقع التسليم
                  </label>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddClientOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Supplier */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-100">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Milk className="w-5 h-5 text-blue-400" />
              <span>إضافة مورد حليب خام ومزرعة</span>
            </h3>

            <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">اسم المورد *</label>
                  <input
                    type="text"
                    required
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">اسم المزرعة *</label>
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الموقع الجغرافي</label>
                  <input
                    type="text"
                    value={supLocation}
                    onChange={(e) => setSupLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">
                    نوع الحليب المورد
                  </label>
                  <input
                    type="text"
                    value={milkType}
                    onChange={(e) => setMilkType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    السعة اليومية (لتر)
                  </label>
                  <input
                    type="number"
                    value={dailyCapacity}
                    onChange={(e) => setDailyCapacity(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">سعر اللتر</label>
                  <input
                    type="number"
                    step="0.1"
                    value={pricePerL}
                    onChange={(e) => setPricePerL(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black"
                >
                  حفظ المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
