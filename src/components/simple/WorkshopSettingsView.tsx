import React, { useState } from 'react';
import { useDairy } from '../../context/DairyContext';
import { DairySettings } from '../../types/dairySimple';
import {
  Settings,
  Save,
  Download,
  Upload,
  RotateCcw,
  Building,
  DollarSign,
  CheckCircle2,
  Lock,
  KeyRound,
  ShieldCheck,
  User,
  Phone,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

export const WorkshopSettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportBackup,
    importBackup,
    resetToDefaults,
    suppliers,
    milkSupplies,
    productions,
    salesInvoices,
  } = useDairy();

  const [form, setForm] = useState<DairySettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExport = () => {
    const jsonStr = exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dairy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = importBackup(text);
        if (success) {
          alert('تم استعادة النسخة الاحتياطية بنجاح!');
          window.location.reload();
        } else {
          alert('ملف النسخة الاحتياطية غير صالح.');
        }
      } catch {
        alert('تعذر قراءة الملف.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>إعدادات المعمل والنسخ الاحتياطي للكمبيوتر</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تعديل اسم المعمل، العملة، الأسعار الافتراضية، وتنزيل نسخة احتياطية آمنة على جهازك
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم الحفظ!</span>
          </div>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg text-xs">
        <h3 className="font-bold text-amber-300 border-b border-slate-800 pb-2">
          بيانات المعمل والأسعار الافتراضية
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-1 font-bold">اسم المعمل أو المصنع *</label>
            <input
              type="text"
              required
              value={form.workshopName}
              onChange={(e) => setForm({ ...form, workshopName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-bold">رقم الهاتف *</label>
            <input
              type="text"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-bold">العنوان / المنطقة</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-bold">العملة الافتراضية *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="شيكل، ₪، NIS..."
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, currency: 'شيكل' })}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold hover:bg-amber-500/30 transition shrink-0"
              >
                شيكل
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, currency: '₪' })}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold hover:bg-amber-500/30 transition shrink-0"
              >
                ₪
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">العملة الافتراضية المعتمدة لجميع الحسابات والفواتير والشيكات</p>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-bold">سعر لتر الحليب الافتراضي</label>
            <input
              type="number"
              step="0.01"
              value={form.defaultMilkPrice}
              onChange={(e) =>
                setForm({ ...form, defaultMilkPrice: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-bold">سعر كيلو الجبنة الافتراضي</label>
            <input
              type="number"
              step="0.1"
              value={form.defaultCheesePrice}
              onChange={(e) =>
                setForm({ ...form, defaultCheesePrice: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
            />
          </div>
        </div>

        {/* Security & Password Settings Section */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-amber-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>أمان وحماية النظام (اسم المستخدم وكلمة السر)</span>
            </h3>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={form.isPasswordProtected ?? true}
                onChange={(e) => setForm({ ...form, isPasswordProtected: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span className="font-bold">تفعيل شاشة القفل بكلمة مرور</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>اسم المستخدم (Username) *</span>
              </label>
              <input
                type="text"
                required
                value={form.username || 'admin'}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                placeholder="admin"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">الاسم المعتمد لتسجيل الدخول</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>كلمة المرور (Password) *</span>
              </label>
              <input
                type="text"
                required
                value={form.password || '123456'}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold"
                placeholder="123456"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">كلمة السر لحماية بيانات المعمل</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>رمز PIN السريع (اختياري)</span>
              </label>
              <input
                type="text"
                value={form.pinCode || '1234'}
                onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                placeholder="1234"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">للدخول السريع من 4 أرقام</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات وكلمة المرور</span>
          </button>
        </div>
      </form>

      {/* Backup and Restore */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg text-xs">
        <h3 className="font-bold text-sky-300 border-b border-slate-800 pb-2">
          النسخ الاحتياطي وحفظ بيانات المعمل للكمبيوتر
        </h3>
        <p className="text-slate-400">
          بياناتك محفوظة بشكل تلقائي ومستمر على هذا الكمبيوتر. لحفظ نسخة خارجية على فلاش ديسك أو قرص
          صلب:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={handleExport}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-white transition flex flex-col items-center justify-center text-center space-y-1.5 cursor-pointer group"
          >
            <Download className="w-5 h-5 text-sky-400 group-hover:scale-110 transition" />
            <span className="font-bold">تحميل نسخة احتياطية (JSON)</span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({suppliers.length} موردين، {milkSupplies.length} توريدات، {productions.length} طبخات)
            </span>
          </button>

          <label className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-white transition flex flex-col items-center justify-center text-center space-y-1.5 cursor-pointer group">
            <Upload className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
            <span className="font-bold">استرجاع نسخة من ملف</span>
            <span className="text-[10px] text-slate-500">اختر ملف JSON المحفوظ</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('هل تريد بالتأكيد إعادة تعيين البيانات الأولية؟')) {
                resetToDefaults();
                window.location.reload();
              }
            }}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-900 text-rose-400 transition flex flex-col items-center justify-center text-center space-y-1.5 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 text-rose-400" />
            <span className="font-bold">إعادة تعيين البيانات الافتراضية</span>
            <span className="text-[10px] text-slate-500">استعادة أمثلة المعمل الأصلية</span>
          </button>
        </div>
      </div>

      {/* About & Developer Credits */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xl shadow-lg shrink-0">
              👨‍💻
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  تصميم وتطوير النظام
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  المهندس مالك حريبات
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                نظام إدارة معمل ومصنع الأجبان والألبان • الإصدار المكتبي والمحمول بالشيكل ₪
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="tel:0594345464"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition active:scale-95"
              dir="ltr"
            >
              <Phone className="w-4 h-4" />
              <span>0594345464</span>
            </a>

            <a
              href="https://wa.me/972594345464"
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>محادثة واتساب 💬</span>
            </a>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
          هذا البرنامج من تصميم وتطوير <b className="text-white">المهندس مالك حريبات</b> للتواصل <b className="text-amber-400 font-mono">0594345464</b>. تم بناء النظام خصيصاً لمعامل ومصانع الألبان والأجبان بالعملة شيكل ₪ لإدارة التوريد والمعدلات والتصافي والمبيعات أوفلاين 100%.
        </div>
      </div>
    </div>
  );
};
