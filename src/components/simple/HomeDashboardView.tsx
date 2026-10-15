import React from 'react';
import { useDairy } from '../../context/DairyContext';
import {
  Users,
  Milk,
  Scale,
  Wallet,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Receipt,
  ArrowRight,
  ArrowLeft,
  Plus,
  Printer,
  Calendar,
  Sparkles,
  Award,
  Layers,
  ChevronLeft,
  HardDrive,
  Usb,
  Database,
  Package,
} from 'lucide-react';

interface HomeDashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenSupplyModal?: () => void;
  onOpenProductionModal?: () => void;
  onOpenInvoiceModal?: () => void;
  onOpenCustomerStatements?: () => void;
  onOpenInstallFilesModal?: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  onNavigateTab,
  onOpenCustomerStatements,
  onOpenInstallFilesModal,
}) => {
  const {
    suppliers,
    milkSupplies,
    productions,
    salesInvoices,
    settings,
    getAllSupplierStatements,
    generateCustomerStatementsUsbHtml,
    getAllCustomerStatements,
  } = useDairy();

  const handleDownloadUsbCustomersHtml = () => {
    const html = generateCustomerStatementsUsbHtml();
    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `كشف_حسابات_الزبائن_للفلاشة_${dateStr}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Aggregate metrics
  const totalMilkLiters = milkSupplies.reduce((sum, s) => sum + s.quantityLiters, 0);
  const totalCheeseKg = productions.reduce((sum, p) => sum + p.cheeseProducedKg, 0);
  const totalSalesRevenue = salesInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalMilkForCheese = productions.reduce((sum, p) => sum + p.milkUsedLiters, 0);
  const cumulativeYieldPct =
    totalMilkForCheese > 0 ? (totalCheeseKg / totalMilkForCheese) * 100 : 0;
  const avgLitersPerKg = totalCheeseKg > 0 ? totalMilkForCheese / totalCheeseKg : 0;

  const statements = getAllSupplierStatements();
  const totalOwedToSuppliers = statements
    .filter((s) => s.balanceStatus === 'علينا')
    .reduce((sum, s) => sum + s.netBalance, 0);

  const totalOwedBySuppliers = statements
    .filter((s) => s.balanceStatus === 'لنا')
    .reduce((sum, s) => sum + s.netBalance, 0);

  // Portal cards requested by the user + Backup & USB
  const portalCards = [
    {
      id: 'suppliers',
      targetTab: 'suppliers_ledger',
      title: 'الموردين',
      subtitle: 'دليل موردي الحليب',
      desc: 'إدخال الموردين الجدد، أرقام الجوال، المزارع، وسعر اللتر المتفق عليه بالشيكل ₪.',
      icon: Users,
      badge: `${suppliers.length} موردين مسجلين`,
      color: 'from-purple-600/30 to-purple-800/10 border-purple-500/30 text-purple-400',
      btnText: 'فتح قائمة الموردين',
    },
    {
      id: 'supply',
      targetTab: 'supply',
      title: 'التوريد',
      subtitle: 'توريد الحليب والدفعات',
      desc: 'تسجيل كميات الحليب باللتر، الدفع كاش وشيكات، وتحديد الباقي لنا أو علينا بالشيكل.',
      icon: Milk,
      badge: `${totalMilkLiters.toLocaleString()} لتر مستورد`,
      color: 'from-sky-600/30 to-sky-800/10 border-sky-500/30 text-sky-400',
      btnText: 'تسجيل توريد جديد',
    },
    {
      id: 'cheese',
      targetTab: 'production',
      title: 'الجبنة',
      subtitle: 'الإنتاج اليومي والأصناف',
      desc: 'تسجيل طبخات الجبنة اليومية، الوزن بالكيلو، وحساب نسبة الاستخراج الفورية.',
      icon: Scale,
      badge: `${totalCheeseKg.toLocaleString()} كغ منتج`,
      color: 'from-amber-600/30 to-amber-800/10 border-amber-500/30 text-amber-400',
      btnText: 'إدخال إنتاج جبنة',
    },
    {
      id: 'accounts',
      targetTab: 'suppliers_ledger',
      title: 'الحسابات',
      subtitle: 'المحاسبة والديون والشيكات',
      desc: 'متابعة الدفعات النقدية والشيكات البنكية المستحقة والأرصدة الدائنة والمدينة بالشيكل.',
      icon: Wallet,
      badge: `علينا ${totalOwedToSuppliers.toLocaleString()} ${settings.currency || 'شيكل'}`,
      color: 'from-rose-600/30 to-rose-800/10 border-rose-500/30 text-rose-400',
      btnText: 'عرض جدول المحاسبة',
    },
    {
      id: 'rates',
      targetTab: 'rates_view',
      title: 'المعدلات',
      subtitle: 'نسب الجبنة للحليب (التصافي)',
      desc: 'نسبة الاستخراج لكل مورد، ولكل يوم، ولكل شهر، والمعدل التراكمي العام للمعمل.',
      icon: BarChart3,
      badge: `${cumulativeYieldPct.toFixed(2)}% تصافي تراكمي`,
      color: 'from-emerald-600/30 to-emerald-800/10 border-emerald-500/30 text-emerald-400',
      btnText: 'استعراض المعدلات',
    },
    {
      id: 'reports',
      targetTab: 'analytics',
      title: 'التقارير',
      subtitle: 'الرسوم البيانية والمبيعات',
      desc: 'مخططات Recharts الذكية للمبيعات الشهرية ومقارنة أداء وحصص أصناف الجبن بالشيكل.',
      icon: TrendingUp,
      badge: `${totalSalesRevenue.toLocaleString()} ${settings.currency || 'شيكل'} مبيعات`,
      color: 'from-teal-600/30 to-teal-800/10 border-teal-500/30 text-teal-400',
      btnText: 'فتح تقارير المبيعات',
    },
    {
      id: 'statements',
      targetTab: 'suppliers_ledger',
      title: 'كشف حسابات الموردين',
      subtitle: 'كشوفات الحساب وطباعة PDF',
      desc: 'كشف حساب مالي تفصيلي لكل مورد مع تفاصيل الشيكات والرصيد والطباعة الرسمية.',
      icon: FileSpreadsheet,
      badge: 'طباعة A4 معتمدة 🖨️',
      color: 'from-indigo-600/30 to-indigo-800/10 border-indigo-500/30 text-indigo-400',
      btnText: 'كشوفات الحساب والطباعة',
    },
    {
      id: 'customer_statements_usb',
      targetTab: 'sales',
      title: 'كشف حساب الزبائن للفلاشة USB',
      subtitle: 'لمناقشتهم في أماكنهم ومحلاتهم',
      desc: 'زر مباشر لإنشاء كشف حساب مالي تفصيلي لكافة الزبائن والذمم بالشيكل، وتحميله بصيغة HTML تعمل من الفلاشة أوفلاين لمناقشتهم في أماكنهم.',
      icon: Usb,
      badge: 'نسخة الفلاشة 💼',
      color: 'from-sky-600/30 to-amber-700/10 border-sky-500/40 text-sky-300',
      btnText: 'إنشاء وتنزيل للفلاشة 💾',
    },
    {
      id: 'setup_db_opt',
      targetTab: 'backup',
      title: 'برنامج التثبيت لويندوز (.EXE) والداتابيز',
      subtitle: 'تثبيت بنقرة واحدة للمستخدم العادي ومسار الداتابيز',
      desc: 'تحميل برنامج التثبيت التنفيذي المباشر (Setup_CheeseFactory.exe) لتنصيب النظام بنقرة واحدة، استعراض مسار حفظ قاعدة البيانات بدقة، وتنزيل ملفات الداتابيز المحدثة بالشيكل ₪.',
      icon: Database,
      badge: 'برنامج EXE 🚀',
      color: 'from-emerald-600/30 to-emerald-800/10 border-emerald-500/30 text-emerald-400',
      btnText: 'تنزيل برنامج التثبيت والداتابيز',
    },
    {
      id: 'backup_opt',
      targetTab: 'backup',
      title: 'النسخة الاحتياطية',
      subtitle: 'حفظ واستعادة وتصدير إكسل',
      desc: 'تنزيل نسخة احتياطية كاملة JSON، استعادة البيانات وفحصها، وتصدير السجلات إلى Excel.',
      icon: HardDrive,
      badge: 'أمان البيانات 💾',
      color: 'from-amber-600/30 to-amber-800/10 border-amber-500/30 text-amber-400',
      btnText: 'النسخ والاسترجاع',
    },
    {
      id: 'usb_opt',
      targetTab: 'backup',
      title: 'التثبيت على فلاشة',
      subtitle: 'تشغيل محمول USB بدون إنترنت',
      desc: 'تحميل حزمة الفلاشة وملفات التشغيل التلقائي Bat وتشغيل البرنامج من أي فلاشة على أي كمبيوتر.',
      icon: Usb,
      badge: 'USB محمول 🔌',
      color: 'from-cyan-600/30 to-cyan-800/10 border-cyan-500/30 text-cyan-400',
      btnText: 'دليل وحزمة الفلاشة',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>لوحة الإدارة الشاملة لمصنع ومعمل الأجبان • العملة المعتمدة: ₪ شيكل</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">
              مرحباً بك في نظام إدارة وتصنيع الأجبان
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              تتبع دقيق لتوريد الحليب والدفعات والشيكات، تسجيل طبخات الجبنة ونسب التصافي، كشوفات حسابات الموردين،
              إصدار الفواتير، وحفظ النسخ الاحتياطية مع إمكانية التشغيل من فلاشة USB بدون إنترنت.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('production')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>تسجيل إنتاج جبنة</span>
            </button>
            <button
              onClick={() => onNavigateTab('supply')}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md shadow-sky-500/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Milk className="w-4 h-4" />
              <span>تسجيل توريد حليب</span>
            </button>
            <button
              onClick={() => onNavigateTab('sales')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4" />
              <span>إصدار فاتورة بيع</span>
            </button>
            <button
              onClick={() => {
                if (onOpenCustomerStatements) onOpenCustomerStatements();
                else onNavigateTab('sales');
              }}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md shadow-sky-500/25 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              title="كشف حساب مفصل لكافة الزبائن لمناقشتهم في أماكنهم"
            >
              <Usb className="w-4 h-4" />
              <span>كشف الزبائن للفلاشة 💼</span>
            </button>
            <button
              onClick={() => {
                if (onOpenInstallFilesModal) onOpenInstallFilesModal();
                else onNavigateTab('backup');
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              title="ملفات التثبيت المكتبي وحزمة الفلاشة USB"
            >
              <Package className="w-4 h-4" />
              <span>ملفات التثبيت 📦</span>
            </button>
            <button
              onClick={() => onNavigateTab('backup')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3.5 py-2.5 rounded-xl text-xs border border-slate-700 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <HardDrive className="w-4 h-4" />
              <span>نسخ احتياطي وداتابيز</span>
            </button>
          </div>
        </div>
      </div>

      {/* Special Highlight Banner: كشف حساب مفصل لكافة الزبائن للفلاشة USB لمناقشتهم في أماكنهم */}
      <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-amber-950/40 border border-sky-500/50 p-5 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center font-bold shadow-lg shrink-0">
            <Usb className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">
                زر كشف حساب مفصل لكافة الزبائن ووضعه على فلاش USB (لمناقشتهم في أماكنهم)
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                نسخة محمولة للمحلات 💼
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              أنشئ كشف حساب تفصيلي لكافة الزبائن مع فواتيرهم ومسحوباتهم والديون المتبقية بالشيكل، وقم بتنزيله بملف واحد على فلاش ميموري USB لمناقشتهم في محلاتهم وأماكنهم بدون إنترنت، أو طباعة تقارير ورقية.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadUsbCustomersHtml}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95"
            title="تنزيل صفحة أوفلاين HTML مباشرة لحفظها على الفلاشة"
          >
            <Usb className="w-4 h-4" />
            <span>تنزيل للفلاشة مباشرة (.html) 💾</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenCustomerStatements) onOpenCustomerStatements();
              else onNavigateTab('sales');
            }}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 transition cursor-pointer active:scale-95"
          >
            <Users className="w-4 h-4" />
            <span>معاينة وتدقيق كشوفات الزبائن والطباعة 💼</span>
          </button>
        </div>
      </div>

      {/* Main Options Grid (الموردين، التوريد، الجبنة، الحسابات، المعدلات، التقارير، كشف الحسابات، النسخة الاحتياطية، الفلاشة) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>خيارات وأقسام البرنامج الرئيسية (جميع الخيارات بالشيكل ₪)</span>
          </h3>
          <span className="text-xs text-slate-400">انقر على أي خيار للدخول المباشر إليه</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portalCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                onClick={() => {
                  if (card.id === 'customer_statements_usb') {
                    if (onOpenCustomerStatements) onOpenCustomerStatements();
                    else onNavigateTab('sales');
                  } else if (card.id === 'setup_db_opt' && onOpenInstallFilesModal) {
                    onOpenInstallFilesModal();
                  } else {
                    onNavigateTab(card.targetTab);
                  }
                }}
                className={`bg-gradient-to-b ${card.color} bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-slate-600 cursor-pointer flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white group-hover:scale-110 transition shadow">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 font-mono font-bold">
                      {card.badge}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-white group-hover:text-amber-400 transition">
                    {card.title}
                  </h4>
                  <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                    {card.subtitle}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-white group-hover:text-amber-300">
                  <span>{card.btnText}</span>
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Summary Tables Row (آخر التوريدات وآخر الطبخات) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Recent Milk Supplies */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Milk className="w-4 h-4 text-sky-400" />
              <span>آخر حركات توريد الحليب</span>
            </h4>
            <button
              onClick={() => onNavigateTab('supply')}
              className="text-sky-400 hover:underline font-bold text-[11px]"
            >
              عرض سجل التوريد بالكامل ←
            </button>
          </div>

          <div className="space-y-2">
            {milkSupplies.slice(0, 4).map((s) => (
              <div
                key={s.id}
                onClick={() => onNavigateTab('supply')}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition cursor-pointer"
              >
                <div>
                  <div className="font-bold text-white">{s.supplierName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {s.date} • {s.paymentType} {s.chequeDetails ? `(شيك ${s.chequeDetails.amount.toLocaleString()} ₪)` : ''}
                  </div>
                </div>

                <div className="text-left font-mono">
                  <div className="font-black text-sky-400">{s.quantityLiters.toLocaleString()} لتر</div>
                  <div className="text-[10px] text-slate-400">
                    {s.totalAmount.toLocaleString()} {settings.currency || 'شيكل'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Cheese Production */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>آخر طبخات الجبنة ونسب التصافي</span>
            </h4>
            <button
              onClick={() => onNavigateTab('production')}
              className="text-amber-400 hover:underline font-bold text-[11px]"
            >
              عرض سجل الإنتاج والمعدلات ←
            </button>
          </div>

          <div className="space-y-2">
            {productions.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigateTab('production')}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition cursor-pointer"
              >
                <div>
                  <div className="font-bold text-white">{p.cheeseType}</div>
                  <div className="text-[10px] text-slate-500">
                    المورد: {p.supplierName} • {p.date}
                  </div>
                </div>

                <div className="text-left font-mono">
                  <div className="font-black text-amber-400">{p.cheeseProducedKg} كغ جبنة</div>
                  <div className="text-[10px] text-emerald-400 font-bold">
                    تصافي: {p.yieldPercentage.toFixed(2)}% ({p.litersPerKgCheese.toFixed(2)} لتر/كغ)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Developer Credit Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-lg">
            👨‍💻
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">هذا البرنامج من تصميم وتطوير:</span>
              <span className="font-black text-white text-sm">المهندس مالك حريبات</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              نظام مصنع ومعمل الأجبان والألبان النموذجية • العملة المعتمدة: ₪ شيكل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-slate-400 text-[11px]">للتواصل:</span>
          <a
            href="tel:0594345464"
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono font-bold text-xs border border-amber-500/30 transition flex items-center gap-1.5"
            dir="ltr"
          >
            📞 0594345464
          </a>
          <a
            href="https://wa.me/972594345464"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition"
          >
            واتساب 💬
          </a>
        </div>
      </div>
    </div>
  );
};
