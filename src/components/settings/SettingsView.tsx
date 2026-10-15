import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { FactorySettings } from '../../types/cheeseFactory';
import {
  Settings,
  Save,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Building,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDatabase,
    importDatabase,
    resetDatabase,
    batches,
    invoices,
    rawMaterials,
    finishedProducts,
  } = useFactory();

  const [form, setForm] = useState<FactorySettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExport = () => {
    const jsonStr = exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cheese-factory-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = importDatabase(text);
        if (ok) {
          alert('تم استعادة النسخة الاحتياطية للمصنع بنجاح!');
          window.location.reload();
        } else {
          setImportError('ملف النسخة الاحتياطية غير صالح أو تالف.');
        }
      } catch (err) {
        setImportError('تعذر قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      confirm(
        'تحذير: هل أنت متأكد من رغبتك في إعادة ضبط جميع بيانات المصنع إلى البيانات النموذجية الأولية؟\nسيتم مسح أي تعديلات غير محفوظة في نسخة احتياطية.'
      )
    ) {
      resetDatabase();
      alert('تمت إعادة ضبط بيانات المصنع بنجاح.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-amber-400" />
              <span>إعدادات المصنع والنسخ الاحتياطي (Factory Configuration & Backup)</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            تخصيص بيانات المنشأة الرسمية، نسبة الضريبة، العملة، وحفظ النسخ الاحتياطية على جهاز
            الكمبيوتر
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم حفظ التعديلات بنجاح!</span>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Factory Profile */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Building className="w-4 h-4" />
            <span>البيانات الرسمية للمصنع (تظهر في ترويسة الفواتير وبطاقات التشغيل)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">اسم المصنع الرسمي *</label>
              <input
                type="text"
                required
                value={form.factoryName}
                onChange={(e) => setForm({ ...form, factoryName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">الوصف / الشعار الفرعي</label>
              <input
                type="text"
                value={form.subTitle}
                onChange={(e) => setForm({ ...form, subTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">رقم السجل التجاري *</label>
              <input
                type="text"
                required
                value={form.commercialRegistration}
                onChange={(e) => setForm({ ...form, commercialRegistration: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">الرقم الضريبي (VAT ID) *</label>
              <input
                type="text"
                required
                value={form.taxNumber}
                onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">أرقام الهواتف والتواصل *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">البريد الإلكتروني</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-400 mb-1 font-semibold">العنوان والموقع الجغرافي للمعمل</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Financial & Operational Parameters */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
            <DollarSign className="w-4 h-4" />
            <span>الإعدادات المالية والتشغيلية</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">العملة الافتراضية *</label>
              <input
                type="text"
                required
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                placeholder="ر.س، د.أ، $، د.إ..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">نسبة ضريبة القيمة المضافة %</label>
              <input
                type="number"
                value={form.defaultTaxPercent}
                onChange={(e) =>
                  setForm({ ...form, defaultTaxPercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">كبير مهندسي الإنتاج الافتراضي</label>
              <input
                type="text"
                value={form.defaultSupervisor}
                onChange={(e) => setForm({ ...form, defaultSupervisor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="col-span-3">
              <label className="block text-slate-400 mb-1 font-semibold">تذييل شروط الفاتورة وحفظ الجبن</label>
              <textarea
                rows={2}
                value={form.footerNotes}
                onChange={(e) => setForm({ ...form, footerNotes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الإعدادات المحدثة</span>
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Backup & Restore Engine */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-black text-blue-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>النسخ الاحتياطي وأمان البيانات للكمبيوتر (Data Backup & Safety)</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          تطبيق مصنع الأجبان يعمل مباشرة على الكمبيوتر مع تخزين محلي تلقائي (Offline First). يمكنك في
          أي وقت تنزيل نسخة احتياطية كاملة (JSON) تحتوي على كل الطبخات، المخزون، والفواتير لحفظها على
          فلاش ديسك أو قرص صلب خارجي.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExport}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 transition flex flex-col items-center justify-center text-center space-y-2 group cursor-pointer"
          >
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 group-hover:scale-110 transition">
              <Download className="w-5 h-5" />
            </div>
            <span className="font-bold text-white">تصدير وتحميل نسخة احتياطية</span>
            <span className="text-[11px] text-slate-500">
              ملف JSON كامل ({batches.length} تشغيلات، {invoices.length} فواتير)
            </span>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 transition flex flex-col items-center justify-center text-center space-y-2 group cursor-pointer">
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
              <Upload className="w-5 h-5" />
            </div>
            <span className="font-bold text-white">استعادة نسخة احتياطية من ملف</span>
            <span className="text-[11px] text-slate-500">اختر ملف JSON محفوظ سابقاً</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Reset Factory */}
          <button
            onClick={handleReset}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-900/50 text-slate-200 transition flex flex-col items-center justify-center text-center space-y-2 group cursor-pointer"
          >
            <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 group-hover:scale-110 transition">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="font-bold text-rose-400">إعادة تعيين البيانات الأولية</span>
            <span className="text-[11px] text-slate-500">استرجاع أمثلة المصنع الافتراضية</span>
          </button>
        </div>

        {importError && (
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{importError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
