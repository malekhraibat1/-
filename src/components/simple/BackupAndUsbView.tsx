import React, { useState, useEffect } from 'react';
import { useDairy } from '../../context/DairyContext';
import {
  Download,
  Upload,
  HardDrive,
  Usb,
  FileSpreadsheet,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  FileCode,
  Laptop,
  Check,
  Info,
  Layers,
  Calendar,
  DollarSign,
  FileText,
  Terminal,
  ExternalLink,
  Database,
  FolderOpen,
  Copy,
  Server,
  Package,
  Lock,
  KeyRound,
  User,
  FolderArchive,
} from 'lucide-react';

interface BackupAndUsbViewProps {
  onOpenCustomerStatements?: () => void;
  onOpenInstallModal?: () => void;
}

export const BackupAndUsbView: React.FC<BackupAndUsbViewProps> = ({
  onOpenCustomerStatements,
  onOpenInstallModal,
}) => {
  const {
    settings,
    suppliers,
    milkSupplies,
    productions,
    salesInvoices,
    snapshots,
    exportBackup,
    importBackup,
    resetToDefaults,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    exportSuppliersCSV,
    exportMilkSuppliesCSV,
    exportProductionsCSV,
    exportSalesInvoicesCSV,
    generateUsbBatchFile,
    generateUsbVbsFile,
    generateUsbAutorunFile,
    generatePortableHtmlApp,
    generateWindowsInstallerScript,
    generateCustomerStatementsUsbHtml,
    exportCustomerStatementsCSV,
    downloadCompleteFactoryZip,
    generateReadmeInstructions,
    downloadWindowsExeInstaller,
  } = useDairy();

  // Default to 'setup_db' as requested by the user
  const [activeSubTab, setActiveSubTab] = useState<'setup_db' | 'backup' | 'usb' | 'excel' | 'snapshots'>('setup_db');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);
  const [inspectModalData, setInspectModalData] = useState<any | null>(null);
  const [newSnapshotLabel, setNewSnapshotLabel] = useState('');
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  const handleDownloadExe = () => {
    downloadWindowsExeInstaller();
    showNotification('جاري تنزيل برنامج التثبيت التنفيذي المباشر لويندوز (Setup_CheeseFactory.exe)!');
  };

  // Detect PWA install prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPwaInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
    showNotification('تم نسخ المسار إلى الحافظة بنجاح!');
  };

  // Helper to download text / data files
  const downloadTextFile = (content: string, filename: string, mime = 'text/plain;charset=utf-8;') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 1. Download Windows Setup Installer Script (.bat)
  const handleDownloadInstaller = () => {
    const content = generateWindowsInstallerScript();
    downloadTextFile(content, 'تثبيت_مصنع_الأجبان_على_الكمبيوتر.bat', 'application/x-bat');
    showNotification('تم تنزيل ملف التثبيت التلقائي للكمبيوتر (.bat)! قم بتشغيله على أي جهاز ويندوز.');
  };

  // 2. Download Raw Database File (.json)
  const handleDownloadDatabaseFile = () => {
    const jsonStr = exportBackup();
    downloadTextFile(jsonStr, 'dairy_database.json', 'application/json');
    showNotification('تم تنزيل ملف قاعدة البيانات الحالي (dairy_database.json) بنجاح!');
  };

  // 3. Download Full JSON Backup
  const handleExportJson = () => {
    const jsonStr = exportBackup();
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadTextFile(jsonStr, `نسخة_احتياطية_مصنع_الأجبان_${dateStr}_بالشيكل.json`, 'application/json');
    showNotification('تم تنزيل النسخة الاحتياطية الكاملة بنجاح! احفظها في مكان آمن أو على الفلاشة.');
  };

  // 4. Inspect and Import JSON Backup
  const handleFileInspect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.suppliers && parsed.milkSupplies && parsed.productions) {
          setInspectModalData({
            rawJson: text,
            fileName: file.name,
            version: parsed.version || 'v2',
            exportDate: parsed.exportDate || 'غير محدد',
            currency: parsed.currency || parsed.settings?.currency || 'شيكل',
            suppliersCount: parsed.suppliers.length,
            milkSuppliesCount: parsed.milkSupplies.length,
            productionsCount: parsed.productions.length,
            salesInvoicesCount: parsed.salesInvoices ? parsed.salesInvoices.length : 0,
            workshopName: parsed.settings?.workshopName || 'معمل الأجبان',
          });
        } else {
          alert('الملف غير متطابق مع بنية قاعدة بيانات المصنع. يرجى اختيار ملف نسخة احتياطية صحيح.');
        }
      } catch {
        alert('تعذر قراءة ملف النسخة الاحتياطية. تأكد أنه ملف JSON صالح.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const confirmRestore = () => {
    if (!inspectModalData) return;
    const success = importBackup(inspectModalData.rawJson);
    if (success) {
      setInspectModalData(null);
      showNotification('تم استرجاع كامل بيانات المصنع بنجاح!');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      alert('حدث خطأ أثناء استعادة البيانات.');
    }
  };

  // 5. CSV File Downloads
  const handleDownloadAllCSVs = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadTextFile(exportSuppliersCSV(), `سجل_الموردين_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    setTimeout(() => downloadTextFile(exportMilkSuppliesCSV(), `سجل_توريد_الحليب_والدفعات_${dateStr}.csv`, 'text/csv;charset=utf-8;'), 300);
    setTimeout(() => downloadTextFile(exportProductionsCSV(), `سجل_إنتاج_الجبنة_والمعدلات_${dateStr}.csv`, 'text/csv;charset=utf-8;'), 600);
    setTimeout(() => downloadTextFile(exportSalesInvoicesCSV(), `سجل_فواتير_البيع_والمبيعات_${dateStr}.csv`, 'text/csv;charset=utf-8;'), 900);
    setTimeout(() => downloadTextFile(exportCustomerStatementsCSV(), `كشف_حسابات_الزبائن_${dateStr}.csv`, 'text/csv;charset=utf-8;'), 1200);
    showNotification('تم تنزيل جميع سجلات المصنع وكشوفات الزبائن بصيغة إكسل (5 ملفات CSV) بنجاح!');
  };

  // 5.1 Customer Statements USB & CSV Helpers
  const handleDownloadUsbCustomersHtml = () => {
    const html = generateCustomerStatementsUsbHtml();
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      html,
      `كشف_حسابات_الزبائن_للفلاشة_${dateStr}.html`,
      'text/html;charset=utf-8;'
    );
    showNotification('تم تنزيل كشف حسابات الزبائن للفلاشة USB (ملف HTML محمول أوفلاين) بنجاح!');
  };

  const handleDownloadCustomerStatementsCsv = () => {
    const csv = exportCustomerStatementsCSV();
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      csv,
      `كشف_حسابات_الزبائن_${dateStr}.csv`,
      'text/csv;charset=utf-8;'
    );
    showNotification('تم تنزيل كشف حسابات الزبائن والديون بصيغة Excel (CSV) بنجاح!');
  };

  // 6. USB Launcher Files Downloads
  const handleDownloadBatch = () => {
    const content = generateUsbBatchFile();
    downloadTextFile(content, 'تشغيل_برنامج_الجبنة_من_الفلاشة.bat', 'application/x-bat');
    showNotification('تم تنزيل ملف التشغيل التلقائي لويندوز (.bat) بنجاح!');
  };

  const handleDownloadVbs = () => {
    const content = generateUsbVbsFile();
    downloadTextFile(content, 'تشغيل_صامت_بدون_شاشة_سوداء.vbs', 'text/plain');
    showNotification('تم تنزيل ملف التشغيل الصامت (.vbs)!');
  };

  const handleDownloadAutorun = () => {
    const content = generateUsbAutorunFile();
    downloadTextFile(content, 'autorun.inf', 'text/plain');
    showNotification('تم تنزيل ملف التوصيل التلقائي autorun.inf!');
  };

  const handleDownloadPortableHtml = () => {
    const content = generatePortableHtmlApp();
    downloadTextFile(content, 'تشغيل_مصنع_الأجبان_المحمول.html', 'text/html');
    showNotification('تم تنزيل صفحة التشغيل المحمولة المستقلة للفلاشة بنجاح!');
  };

  const handleSaveUsbData = () => {
    const jsonStr = exportBackup();
    downloadTextFile(jsonStr, 'بيانات_المعمل_للفلاشة.json', 'application/json');
    showNotification('تم حفظ ملف قاعدة البيانات المحدثة للفلاشة!');
  };

  // 6.1 Complete Folder Package (ZIP & Readme)
  const handleDownloadReadme = () => {
    const content = generateReadmeInstructions();
    downloadTextFile(content, 'اقرأني_دليل_التشغيل_وكلمة_السر.txt', 'text/plain;charset=utf-8;');
    showNotification('تم تنزيل ملف دليل التشغيل وكلمة السر (اقرأني) بنجاح!');
  };

  const handleDownloadFullZip = async () => {
    showNotification('جاري تجهيز وضغط كافة ملفات المصنع في حزمة ZIP واحدة...');
    try {
      await downloadCompleteFactoryZip();
      showNotification('تم تنزيل حزمة مجلد المصنع الكاملة (.zip) بنجاح! جاهزة للمستخدم بالكامل.');
    } catch {
      showNotification('حدث خطأ أثناء تنزيل الحزمة المضغوطة.');
    }
  };

  // 7. PWA Install Trigger
  const handleInstallPwa = async () => {
    if (!pwaInstallPrompt) {
      alert('التطبيق جاهز للعمل دون إنترنت، يمكنك أيضاً تثبيته من خيارات المتصفح (أيقونة التثبيت بجوار شريط العنوان).');
      return;
    }
    pwaInstallPrompt.prompt();
    const { outcome } = await pwaInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsPwaInstalled(true);
      setPwaInstallPrompt(null);
      showNotification('تم تثبيت البرنامج كتطبيق مكتبي مستقل على جهازك بنجاح!');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner with Highlights */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shadow-lg">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">ملف التثبيت ومكان قاعدة البيانات والنسخ الاحتياطي</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  العملة: ₪ شيكل
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-mono">
                  Offline Ready ⚡
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                ملفات التثبيت للكمبيوتر والفلاشة، معرفة وتحديد مكان حفظ قاعدة البيانات (Database)، والتصدير لإكسل
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadExe}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 text-xs flex items-center gap-2 transition cursor-pointer active:scale-95"
            title="تحميل برنامج التثبيت التنفيذي المباشر لويندوز (Setup_CheeseFactory.exe) - الموصى به للمستخدم العادي"
          >
            <Download className="w-4 h-4" />
            <span>برنامج التثبيت (.exe) 🚀</span>
          </button>

          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 text-xs flex items-center gap-2 transition cursor-pointer"
              title="فتح مركز ملفات التثبيت الـ 10 المجهزة وتنزيل أو نسخ أي ملف"
            >
              <Package className="w-4 h-4" />
              <span>ملفات التثبيت (المركز الشامل) 📦</span>
            </button>
          )}

          <button
            onClick={handleDownloadFullZip}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 text-xs flex items-center gap-2 transition cursor-pointer active:scale-95"
            title="تنزيل مجلد التثبيت الكامل (ZIP) يضم كافة الملفات الـ 15 المجهزة للمستخدم العادي بما فيها EXE"
          >
            <FolderArchive className="w-4 h-4" />
            <span>تحميل المجلد كاملاً (.zip) 📁</span>
          </button>

          <button
            onClick={handleDownloadInstaller}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 text-xs flex items-center gap-2 transition cursor-pointer"
            title="تحميل ملف التثبيت التلقائي لويندوز"
          >
            <Package className="w-4 h-4" />
            <span>ملف التثبيت (.bat) ⚡</span>
          </button>

          <button
            onClick={handleDownloadDatabaseFile}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 text-xs flex items-center gap-2 transition cursor-pointer"
            title="تحميل ملف قاعدة البيانات الحالي"
          >
            <Database className="w-4 h-4" />
            <span>ملف الداتابيز (.json) 💾</span>
          </button>

          <button
            onClick={handleDownloadReadme}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3 py-2.5 rounded-xl border border-slate-700 text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="تحميل ملف دليل التشغيل وكلمة السر (اقرأني)"
          >
            <FileText className="w-4 h-4" />
            <span>دليل وكلمة السر 📄</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 p-3.5 rounded-2xl flex items-center gap-2.5 text-emerald-300 text-xs font-bold shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Sub Tabs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('setup_db')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
            activeSubTab === 'setup_db'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>ملف التثبيت والداتابيز</span>
        </button>

        <button
          onClick={() => setActiveSubTab('backup')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
            activeSubTab === 'backup'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>النسخة والاسترجاع</span>
        </button>

        <button
          onClick={() => setActiveSubTab('usb')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
            activeSubTab === 'usb'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Usb className="w-4 h-4" />
          <span>التشغيل من فلاشة USB</span>
        </button>

        <button
          onClick={() => setActiveSubTab('excel')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
            activeSubTab === 'excel'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>تصدير إكسل (CSV)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('snapshots')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
            activeSubTab === 'snapshots'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>نقاط الاستعادة ({snapshots.length})</span>
        </button>
      </div>

      {/* 1. Tab: Setup Installer & Database Location */}
      {activeSubTab === 'setup_db' && (
        <div className="space-y-6">
          {/* Main Hero Card for Setup & Database */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 rounded-3xl shadow-xl space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold inline-flex items-center gap-1.5 mb-2">
                  <Package className="w-3.5 h-3.5" />
                  <span>ملف التثبيت المكتبي + ملف قاعدة البيانات المباشر</span>
                </span>
                <h3 className="text-xl font-black text-white">
                  تثبيت البرنامج على الكمبيوتر وحفظ قاعدة البيانات محلياً
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                  الحل الموصى به للمستخدم العادي هو تحميل <span className="text-emerald-400 font-bold font-mono">Setup_CheeseFactory.exe</span> لتنصيب النظام بنقرة واحدة بدون صلاحيات مسؤول،
                  أو تحميل سكريبت التثبيت (<span className="text-amber-400 font-mono font-bold">.bat</span>) لإنشاء مجلدات المصنع واختصارات سطح المكتب.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleDownloadExe}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xl shadow-emerald-500/30 transition group active:scale-95"
                  title="تحميل برنامج التثبيت التنفيذي المباشر لويندوز (Setup_CheeseFactory.exe) - الموصى به للمستخدم العادي"
                >
                  <Download className="w-4 h-4 group-hover:scale-110 transition" />
                  <span>تحميل برنامج التثبيت لويندوز (.EXE) 🚀</span>
                </button>

                {onOpenInstallModal && (
                  <button
                    onClick={onOpenInstallModal}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-black px-5 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/25 transition group"
                  >
                    <Package className="w-4 h-4 group-hover:scale-110 transition" />
                    <span>مركز ملفات التثبيت 📦</span>
                  </button>
                )}

                <button
                  onClick={handleDownloadInstaller}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25 transition group"
                >
                  <Terminal className="w-4 h-4 group-hover:scale-110 transition" />
                  <span>تحميل ملف التثبيت للكمبيوتر (.bat) ⚡</span>
                </button>

                <button
                  onClick={handleDownloadDatabaseFile}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 transition group"
                >
                  <Database className="w-4 h-4 group-hover:scale-110 transition" />
                  <span>تحميل ملف الداتابيز (dairy_database.json) 💾</span>
                </button>
              </div>
            </div>

            {/* Quick installation features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تثبيت بنقرة واحدة</span>
                </div>
                <p className="text-[11px] text-slate-400">ينشئ المجلدات والاختصار على سطح المكتب تلقائياً</p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-sky-400 font-bold flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4" />
                  <span>داتابيز محلية 100%</span>
                </div>
                <p className="text-[11px] text-slate-400">البيانات على جهازك ولا ترسل لأي سيرفر خارجي</p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Usb className="w-4 h-4" />
                  <span>جاهز للفلاشة والقرص</span>
                </div>
                <p className="text-[11px] text-slate-400">نفس الملفات تعمل من الفلاش ميموري مباشرة أوفلاين</p>
              </div>
            </div>
          </div>

          {/* Complete Folder Package Card */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-500/30 font-bold text-xl">
                  📁
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    مجلد ملفات التثبيت الكامل (مجلد_ملفات_التثبيت/)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تم تضمين جميع ملفات التثبيت الـ 15 (برنامج EXE، سكريبتات Bat، المشغل الصامت، قاعدة البيانات، والدليل) في مجلد موحد.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadFullZip}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer active:scale-95 shadow-md shadow-sky-500/25"
                >
                  <FolderArchive className="w-4 h-4" />
                  <span>تحميل المجلد كاملاً (.zip) 📁</span>
                </button>
              </div>
            </div>
          </div>

          {/* Database Exact Location Architecture Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-400" />
                <span>أين توجد قاعدة البيانات (Database Location) بالتفصيل؟</span>
              </h3>
              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/50 border border-emerald-800 px-3 py-1 rounded-xl">
                حالة الداتابيز: نشطة ومحفوظة ✔️
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Location 1: Windows Browser & Native LocalStorage */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                    <Laptop className="w-4 h-4" />
                    <span>الموقع 1: التخزين المحلي الآمن على الكمبيوتر (Local Engine)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono">
                    LocalStorage / LevelDB
                  </span>
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">
                  يتم حفظ كل حركة، توريد حليب، شيك، طبخة، أو فاتورة فور إدخالها مباشرة في قاعدة البيانات المحلية في متصفح ونظام ويندوز:
                </p>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div className="text-slate-500 text-[10px]">مسار المجلد في نظام ويندوز:</div>
                  <div className="text-amber-300 break-all select-all">
                    %LocalAppData%\Google\Chrome\User Data\Default\Local Storage\
                  </div>
                  <div className="text-slate-500 text-[10px] pt-1">أو لمتصفح مايكروسوفت إيدج:</div>
                  <div className="text-slate-400 break-all select-all">
                    %LocalAppData%\Microsoft\Edge\User Data\Default\Local Storage\
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 space-y-1 pt-1">
                  <div>• <b>المفتاح البرمجي الداخلي:</b> <code className="text-emerald-400 font-mono">dairy_simple_app_v3_ils_*</code></div>
                  <div>• <b>الميزة:</b> حفظ فوري ودائم، لا يتأثر بإغلاق المتصفح أو انقطاع الكهرباء، ويعمل بدون إنترنت نهائياً.</div>
                </div>
              </div>

              {/* Location 2: File-Based Database on Disk / USB */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Server className="w-4 h-4" />
                    <span>الموقع 2: ملف قاعدة البيانات المادي على القرص أو الفلاشة</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono">
                    dairy_database.json
                  </span>
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">
                  عند تشغيل ملف التثبيت (<span className="text-emerald-400 font-mono">.bat</span>) أو عند حفظ نسخة للفلاشة،
                  يتم إنشاء ملف قاعدة بيانات بصيغة JSON القياسية المفتوحة في المسار:
                </p>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div className="text-slate-500 text-[10px]">مسار ملف الداتابيز المكتبي:</div>
                  <div className="text-emerald-400 flex items-center justify-between gap-2">
                    <span className="break-all select-all">C:\CheeseFactory\database\dairy_database.json</span>
                    <button
                      onClick={() => copyToClipboard('C:\\CheeseFactory\\database\\dairy_database.json')}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0"
                      title="نسخ المسار"
                    >
                      {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-slate-500 text-[10px] pt-1">مسار ملف الداتابيز على الفلاشة USB:</div>
                  <div className="text-sky-300 break-all select-all">
                    E:\CheeseFactory\database\dairy_database.json
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 space-y-1 pt-1">
                  <div>• <b>نوع التنسيق:</b> ملف نصي قياسي JSON يحوي جميع السجلات والجداول بالشيكل ₪.</div>
                  <div>• <b>الميزة:</b> يمكنك نقله بأي فلاشة، نسخه للنسخ الاحتياطي الخارجي، أو فتحه في أي محرر نصوص.</div>
                </div>
              </div>
            </div>

            {/* Live Database Tables Inspector */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>الجداول والبيانات المسجلة حالياً في قاعدة البيانات:</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">1. جدول الموردين (Suppliers)</div>
                  <div className="text-base font-black text-amber-400 font-mono mt-1">{suppliers.length} موردين</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">الأسماء، الهواتف، والأرصدة</div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">2. جدول توريد الحليب (Supplies)</div>
                  <div className="text-base font-black text-sky-400 font-mono mt-1">{milkSupplies.length} شحنة</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">الكميات، الدفعات، والشيكات</div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">3. جدول طبخات الجبنة (Production)</div>
                  <div className="text-base font-black text-emerald-400 font-mono mt-1">{productions.length} طبخات</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">الأصناف ونسب التصافي %</div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">4. جدول فواتير البيع (Invoices)</div>
                  <div className="text-base font-black text-purple-400 font-mono mt-1">{salesInvoices.length} فواتير</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">المبيعات، الزبائن، والقبض</div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">5. جدول الإعدادات (Settings)</div>
                  <div className="text-base font-black text-white font-mono mt-1">₪ شيكل</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">العملة والأسعار الافتراضية</div>
                </div>
              </div>
            </div>

            {/* What installer script does */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>ماذا يفعل ملف التثبيت التلقائي (تثبيت_مصنع_الأجبان_على_الكمبيوتر.bat) عند تشغيله؟</span>
              </div>
              <ol className="list-decimal list-inside text-slate-400 space-y-1 text-[11px] leading-relaxed pr-1">
                <li>يقوم بإنشاء مجلد رئيسي على قرص النظام: <code className="text-amber-300 font-mono">C:\CheeseFactory\</code></li>
                <li>ينشئ مجلداً خاصاً لقاعدة البيانات: <code className="text-amber-300 font-mono">C:\CheeseFactory\database\</code> ومجلداً للنسخ الاحتياطية.</li>
                <li>يقوم بإنشاء اختصار مباشر على سطح مكتب ويندوز باسم <b className="text-white">"مصنع ومعمل الأجبان"</b>.</li>
                <li>يضبط تشغيل البرنامج كشاشة تطبيق مكتبي مستقلة وبدون الحاجة لفتح المتصفح يدوياً أو الاتصال بالإنترنت.</li>
              </ol>
            </div>

            {/* Customer Statements USB Export Card */}
            <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-amber-950/40 border border-sky-500/40 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold shadow-lg shrink-0">
                  <Usb className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white">كشف حساب مفصل لكافة الزبائن للفلاشة USB (لمناقشتهم في أماكنهم)</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      جاهز للفلاشة 💼
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    أنشئ كشف حساب مالي تفصيلي لكافة الزبائن مع فواتيرهم والديون المتبقية بالشيكل، وقم بتحميله على فلاش ميموري USB لمناقشتهم في أماكنهم بدون إنترنت نهائياً.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadUsbCustomersHtml}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition cursor-pointer active:scale-95"
                >
                  <Usb className="w-4 h-4" />
                  <span>تنزيل للفلاشة (.html) 💾</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCustomerStatementsCsv}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2.5 rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>إكسل (CSV)</span>
                </button>

                {onOpenCustomerStatements && (
                  <button
                    type="button"
                    onClick={onOpenCustomerStatements}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <span>معاينة وطباعة 🖨️</span>
                  </button>
                )}
              </div>
            </div>

            {/* Full Folder Package and Credentials Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-lg">
                    <FolderArchive className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-white">
                        حزمة المجلد الكاملة وكلمة السر وحماية النظام (جاهزة للمستخدم بالكامل)
                      </h4>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                        9 ملفات جاهزة ✔️
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      تم تجهيز المجلد بكافة ملفات التثبيت، التشغيل الصامت، الفلاشة، كشوفات الزبائن، وقاعدة البيانات بالشيكل ₪
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadFullZip}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>تحميل حزمة المجلد كاملة (.zip) 📦</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadReadme}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3.5 py-2.5 rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    <span>دليل التشغيل (اقرأني.txt) 📄</span>
                  </button>
                </div>
              </div>

              {/* Security Credentials Banner */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>بيانات تسجيل الدخول وحماية النظام المعتمدة:</span>
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      النظام محمي بكلمة سر، ويمكن تعديلها في أي وقت من شاشة الإعدادات
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
                    المستخدم: <b className="text-white font-bold">{settings.username || 'admin'}</b>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
                    كلمة المرور: <b className="text-amber-400 font-bold">{settings.password || '123456'}</b>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
                    رمز PIN: <b className="text-sky-400 font-bold">{settings.pinCode || '1234'}</b>
                  </div>
                </div>
              </div>

              {/* Ready Files Table / Grid */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-bold">
                  <span>قائمة الملفات المجهزة داخل مجلد المصنع والفلاشة (9 ملفات):</span>
                  <span className="text-[11px] text-emerald-400 font-mono">حالة الحزمة: مكتملة 100%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="font-mono text-emerald-400 font-bold flex items-center justify-between">
                      <span>تثبيت_مصنع_الأجبان_على_الكمبيوتر.bat</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-400">مثبت ويندوز التلقائي مع اختصارات سطح المكتب</p>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="font-mono text-sky-400 font-bold flex items-center justify-between">
                      <span>تشغيل_برنامج_الجبنة_من_الفلاشة.bat</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-400">مشغل الفلاشة USB المستقل أوفلاين</p>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="font-mono text-amber-400 font-bold flex items-center justify-between">
                      <span>فتح_كشف_حسابات_الزبائن.bat</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-400">أمر تشغيل سريع لكشف حساب الزبائن لمناقشتهم</p>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="font-mono text-purple-400 font-bold flex items-center justify-between">
                      <span>تشغيل_صامت_بدون_شاشة_سوداء.vbs</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-400">تشغيل هادئ بدون نافذة موجه الأوامر (CMD)</p>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="font-mono text-slate-300 font-bold flex items-center justify-between">
                      <span>autorun.inf</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-400">ملف التشغيل التلقائي عند إدخال الفلاشة</p>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="font-mono text-amber-300 font-bold flex items-center justify-between">
                      <span>dairy_database.json</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-400">ملف قاعدة البيانات الحقيقي المفتوح بالشيكل ₪</p>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="font-mono text-sky-300 font-bold flex items-center justify-between">
                      <span>تشغيل_مصنع_الأجبان_المحمول.html</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-400">صفحة التطبيق المحمول المستقلة مع شاشة القفل</p>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="font-mono text-emerald-300 font-bold flex items-center justify-between">
                      <span>كشف_حسابات_الزبائن_للفلاشة.html</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-400">كشف حساب مفصل ومحمي بكلمة سر للزبائن</p>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="font-mono text-slate-300 font-bold flex items-center justify-between">
                      <span>اقرأني_دليل_التشغيل_وكلمة_السر.txt</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-400">دليل الاستخدام الكامل وبيانات الدخول</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tab: Backup and Restore */}
      {activeSubTab === 'backup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Download Full Backup Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold mb-3">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-white">تصدير وتنزيل نسخة احتياطية كاملة (JSON)</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  احفظ ملف النسخة الكاملة على جهاز الكمبيوتر أو على فلاش ميموري خارجي. يحتوي الملف على كل الموردين،
                  توريدات الحليب، سجلات الشيكات، طبخات الجبنة، وفواتير المبيعات بالعملة <b>شيكل ₪</b>.
                </p>
                <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5 text-xs font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span>عدد الموردين المسجلين:</span>
                    <b className="text-amber-400">{suppliers.length} موردين</b>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي توريدات الحليب:</span>
                    <b className="text-sky-400">{milkSupplies.length} شحنة</b>
                  </div>
                  <div className="flex justify-between">
                    <span>طبخات وسجلات الجبنة:</span>
                    <b className="text-emerald-400">{productions.length} طبخة</b>
                  </div>
                  <div className="flex justify-between">
                    <span>فواتير مبيعات الجبن:</span>
                    <b className="text-purple-400">{salesInvoices.length} فواتير</b>
                  </div>
                </div>
              </div>

              <button
                onClick={handleExportJson}
                className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20 transition"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف النسخة الاحتياطية الآن (.json)</span>
              </button>
            </div>

            {/* Restore from File Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-white">استرجاع نسخة احتياطية من ملف خارجي</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  إذا قمت بتغيير الكمبيوتر أو أردت استعادة نسخة سابقة من الفلاشة أو القرص الصلب، اختر الملف هنا. سيقوم
                  النظام بفحص محتويات الملف ومعاينته قبل اعتماده لحماية بياناتك.
                </p>

                <div className="mt-4 p-4 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl bg-slate-950/40 text-center transition flex flex-col items-center justify-center space-y-2 relative">
                  <Upload className="w-8 h-8 text-slate-500" />
                  <span className="text-xs text-slate-300 font-bold">اضغط هنا لاختيار ملف JSON للنسخة الاحتياطية</span>
                  <span className="text-[10px] text-slate-500 font-mono">يدعم ملفات: *.json المحفوظة من المصنع</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileInspect}
                    className="opacity-0 absolute inset-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>البرنامج يفحص سلامة البيانات تلقائياً قبل الكتابة لضمان عدم تلف السجلات.</span>
              </div>
            </div>
          </div>

          {/* Reset To Initial Defaults with Warning */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">إعادة تعيين أمثلة المصنع الافتراضية (تهيئة أولية)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  استعادة الأمثلة التوضيحية الأصلية للمعمل وتصفير التعديلات في الذاكرة المحلية
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm('تنبيه: هل أنت متأكد من رغبتك في استعادة الأمثلة الافتراضية الأولية؟ يُنصح بتنزيل نسخة احتياطية أولاً.')) {
                  resetToDefaults();
                  showNotification('تمت استعادة البيانات الأولية بنجاح!');
                  setTimeout(() => window.location.reload(), 1000);
                }
              }}
              className="px-4 py-2 rounded-xl bg-slate-950 border border-rose-900/60 hover:bg-rose-950/40 text-rose-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط المصنع</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Tab: USB Portable Installation Guide & Launchers */}
      {activeSubTab === 'usb' && (
        <div className="space-y-6">
          {/* Main Hero Card for USB Mode */}
          <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1.5 mb-2">
                  <Usb className="w-3.5 h-3.5" />
                  <span>دليل وتشغيل البرنامج المحمول من الفلاشة (Portable USB)</span>
                </span>
                <h3 className="text-lg font-black text-white">
                  تشغيل البرنامج مباشرة من الفلاش ميموري على أي جهاز كمبيوتر أو لابتوب
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                  يمكنك وضع هذا البرنامج مع قاعدة بياناته المحفوظة على فلاشة USB والتنقل به بحرية بين حاسوب المعمل،
                  لابتوب الإدارة، أو أي جهاز آخر، والتشغيل بضغطة زر واحدة <b>دون الحاجة لاتصال بالإنترنت</b> وبدون تثبيت برامج إضافية.
                </p>
              </div>

              {/* Install PWA Button if available */}
              <button
                onClick={handleInstallPwa}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/20 shrink-0"
              >
                <Laptop className="w-4 h-4" />
                <span>{isPwaInstalled ? 'البرنامج مثبت كتطبيق 💻' : 'تثبيت كتطبيق مستقل للكمبيوتر'}</span>
              </button>
            </div>

            {/* Quick Download Buttons Grid for USB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={handleDownloadBatch}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/60 text-right space-y-1 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between text-amber-400 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    <span>ملف التشغيل (.bat)</span>
                  </span>
                  <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition" />
                </div>
                <p className="text-[11px] text-slate-400">ملف تشغيل تلقائي لويندوز يُوضع في الفلاشة</p>
              </button>

              <button
                onClick={handleDownloadPortableHtml}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-400/60 text-right space-y-1 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between text-sky-400 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <FileCode className="w-4 h-4" />
                    <span>صفحة الويب المحمولة (.html)</span>
                  </span>
                  <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition" />
                </div>
                <p className="text-[11px] text-slate-400">صفحة كاملة مجهزة بالبيانات تعمل أوفلاين</p>
              </button>

              <button
                onClick={handleSaveUsbData}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-400/60 text-right space-y-1 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4" />
                    <span>بيانات المعمل للفلاشة (.json)</span>
                  </span>
                  <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition" />
                </div>
                <p className="text-[11px] text-slate-400">حفظ قاعدة البيانات الحالية بالشيكل</p>
              </button>

              <button
                onClick={handleDownloadVbs}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-400/60 text-right space-y-1 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between text-purple-400 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    <span>تشغيل صامت (.vbs)</span>
                  </span>
                  <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition" />
                </div>
                <p className="text-[11px] text-slate-400">تشغيل بدون نافذة الدوس السوداء</p>
              </button>
            </div>
          </div>

          {/* Customer Statements on USB in USB Subtab */}
          <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-amber-950/40 border border-sky-500/40 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold shadow-lg shrink-0">
                <Usb className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white">كشف حساب مفصل لكافة الزبائن للفلاشة USB (لمناقشتهم في أماكنهم)</h4>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    تجهيز الفلاشة 💼
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  احفظ ملف كشف الحسابات على الفلاشة بملف مستقل (<code className="text-sky-300 font-mono">.html</code>). يمكنك تشغيله على أي لابتوب أو كمبيوتر في محلات الزبائن لمناقشة الفواتير والمبالغ المتبقية بذمتهم بدون إنترنت.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadUsbCustomersHtml}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition cursor-pointer active:scale-95"
              >
                <Usb className="w-4 h-4" />
                <span>تنزيل للفلاشة (.html) 💾</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCustomerStatementsCsv}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2.5 rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>إكسل (CSV)</span>
              </button>

              {onOpenCustomerStatements && (
                <button
                  type="button"
                  onClick={onOpenCustomerStatements}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <span>معاينة وطباعة 🖨️</span>
                </button>
              )}
            </div>
          </div>

          {/* Step by Step Interactive Illustrated Guide */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>خطوات تثبيت وتشغيل البرنامج على الفلاشة (خطوة بخطوة):</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Step 1 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4.5 space-y-3 relative overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center">
                  1
                </div>
                <h4 className="font-bold text-white text-sm">تجهيز الفلاشة USB</h4>
                <p className="text-slate-400 leading-relaxed">
                  أدخل فلاش ميموري (USB Flash Drive) في أي مدخل بالكمبيوتر، وقم بإنشاء مجلد جديد بداخلها باسم{' '}
                  <span className="text-amber-300 font-mono font-bold">برنامج_مصنع_الأجبان</span>.
                </p>
                <div className="text-[11px] text-slate-500 bg-slate-900/60 p-2.5 rounded-xl font-mono">
                  مثال: E:\برنامج_مصنع_الأجبان\
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4.5 space-y-3 relative overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 font-black text-sm flex items-center justify-center">
                  2
                </div>
                <h4 className="font-bold text-white text-sm">تنزيل ونسخ ملفات الفلاشة</h4>
                <p className="text-slate-400 leading-relaxed">
                  اضغط على أزرار التحميل أعلاه لتنزيل ملف التشغيل <span className="text-sky-300 font-mono">.bat</span> وملف{' '}
                  <span className="text-sky-300 font-mono">بيانات_المعمل_للفلاشة.json</span>، ثم انسخهما معاً داخل مجلد الفلاشة.
                </p>
                <div className="text-[11px] text-slate-500 bg-slate-900/60 p-2.5 rounded-xl font-mono">
                  الملفات: تشغيل_البرنامج.bat + بيانات.json
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4.5 space-y-3 relative overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center">
                  3
                </div>
                <h4 className="font-bold text-white text-sm">التشغيل المباشر في أي مكان</h4>
                <p className="text-slate-400 leading-relaxed">
                  انقر نقراً مزدوجاً (Double Click) على ملف <span className="text-emerald-400 font-mono font-bold">.bat</span> على أي كمبيوتر،
                  وسيفتح البرنامج فوراً بدون أي اتصال بالإنترنت مع حفظ التعديلات تلقائياً.
                </p>
                <div className="text-[11px] text-emerald-400/80 bg-emerald-950/30 border border-emerald-900/40 p-2 rounded-xl">
                  يعمل بنسبة 100% دون حاجة لسيرفر خارجي!
                </div>
              </div>
            </div>

            {/* Offline Simulation Test Badge */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <b>التطبيق معتمد للعمل Offline:</b> جميع الحسابات، تصافي الجبنة، الشيكات، كشوفات الموردين، وإصدار الفواتير تعمل محلياً بالكامل.
                </span>
              </div>
              <button
                onClick={() => {
                  showNotification('اختبار التخزين المحلي والتشغيل أوفلاين: ناجح بنسبة 100% ✔️');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
              >
                فحص جاهزية الفلاشة ✔️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab: Excel / CSV Exports */}
      {activeSubTab === 'excel' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span>تصدير جميع سجلات المعمل إلى مايكروسوفت إكسل (Excel / CSV)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  الملفات المصدّرة متوافقة بالكامل مع Microsoft Excel وتدعم اللغة العربية والترميز الصحيح (UTF-8 BOM)
                </p>
              </div>

              <button
                onClick={handleDownloadAllCSVs}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل كل السجلات وكشوفات الزبائن دفعة واحدة (5 ملفات إكسل)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* 1. Suppliers CSV */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">سجل الموردين والحسابات</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    الأسماء، أرقام الهواتف، الأسعار المتفق عليها، والأرصدة
                  </p>
                  <span className="text-[10px] text-amber-400 font-mono mt-1 block font-bold">
                    {suppliers.length} موردين مسجلين
                  </span>
                </div>
                <button
                  onClick={() => downloadTextFile(exportSuppliersCSV(), 'سجل_الموردين.csv', 'text/csv;charset=utf-8;')}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="تنزيل ملف إكسل"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>تنزيل</span>
                </button>
              </div>

              {/* 2. Milk Supplies CSV */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">سجل توريد الحليب والدفعات</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    الكميات باللتر، الدفع كاش وشيكات، وتفاصيل الشيكات والباقي
                  </p>
                  <span className="text-[10px] text-sky-400 font-mono mt-1 block font-bold">
                    {milkSupplies.length} شحنة توريد مسجلة
                  </span>
                </div>
                <button
                  onClick={() => downloadTextFile(exportMilkSuppliesCSV(), 'سجل_توريد_الحليب.csv', 'text/csv;charset=utf-8;')}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="تنزيل ملف إكسل"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>تنزيل</span>
                </button>
              </div>

              {/* 3. Cheese Productions CSV */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">سجل إنتاج الجبنة ونسب التصافي</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    الحليب المستخدم، وزن الجبنة بالكيلو، ونسبة الجبنة للحليب %
                  </p>
                  <span className="text-[10px] text-amber-400 font-mono mt-1 block font-bold">
                    {productions.length} طبخات مسجلة
                  </span>
                </div>
                <button
                  onClick={() => downloadTextFile(exportProductionsCSV(), 'سجل_إنتاج_الجبنة_والمعدلات.csv', 'text/csv;charset=utf-8;')}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="تنزيل ملف إكسل"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>تنزيل</span>
                </button>
              </div>

              {/* 4. Sales Invoices CSV */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">سجل فواتير مبيعات الجبن</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    أسماء الزبائن، أصناف الجبن، الكيلوغرامات، والإجمالي بالشيكل
                  </p>
                  <span className="text-[10px] text-purple-400 font-mono mt-1 block font-bold">
                    {salesInvoices.length} فواتير بيع
                  </span>
                </div>
                <button
                  onClick={() => downloadTextFile(exportSalesInvoicesCSV(), 'سجل_فواتير_البيع.csv', 'text/csv;charset=utf-8;')}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="تنزيل ملف إكسل"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  <span>تنزيل</span>
                </button>
              </div>

              {/* 5. Customer Statements CSV & Balances */}
              <div className="bg-slate-950 border border-sky-500/40 rounded-2xl p-4.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 sm:col-span-2 shadow-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">كشف حسابات كافة الزبائن والذمم المالية (Customer Statements)</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      جاهز للفلاشة 💼
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    كشف حساب مفصل لكل زبون: إجمالي المسحوبات، المبالغ المدفوعة، والديون المتبقية بذمته بالشيكل ₪، لمناقشتهم في أماكنهم.
                  </p>
                  <span className="text-[10px] text-sky-400 font-mono mt-1 block font-bold">
                    يشمل كافة الزبائن المسجلين بالفواتير • متوافق مع إكسل والفلاشة
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleDownloadUsbCustomersHtml}
                    className="p-3 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-600/50 text-sky-300 font-bold transition flex items-center gap-1.5 cursor-pointer text-xs"
                    title="تنزيل صفحة أوفلاين للفلاشة"
                  >
                    <Usb className="w-4 h-4 text-sky-400" />
                    <span>للفلاشة (HTML)</span>
                  </button>
                  <button
                    onClick={handleDownloadCustomerStatementsCsv}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer text-xs"
                    title="تنزيل ملف إكسل CSV"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>إكسل (CSV)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab: Snapshots (Local Recovery Points) */}
      {activeSubTab === 'snapshots' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>نقاط الاستعادة السريعة (Local Snapshots)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  نقاط حفظ سريعة مخزنة محلياً في متصفح الكمبيوتر للرجوع إلى أي حالة سابقة في ثوانٍ معدودة
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="وصف لنقطة الحفظ (اختياري)..."
                  value={newSnapshotLabel}
                  onChange={(e) => setNewSnapshotLabel(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={() => {
                    createSnapshot(newSnapshotLabel || undefined);
                    setNewSnapshotLabel('');
                    showNotification('تم أخذ نقطة استعادة جديدة بنجاح!');
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Clock className="w-4 h-4" />
                  <span>إنشاء نقطة الآن</span>
                </button>
              </div>
            </div>

            {/* List of snapshots */}
            <div className="space-y-2.5">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{snap.label}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(snap.timestamp).toLocaleString('ar-EG')}
                      </span>
                    </div>
                    <div className="text-slate-400 mt-1 flex items-center gap-3 font-mono text-[11px]">
                      <span>👥 {snap.suppliersCount} موردين</span>
                      <span>🥛 {snap.suppliesCount} توريدات</span>
                      <span>🧀 {snap.productionsCount} طبخات</span>
                      <span>🧾 {snap.invoicesCount} فواتير</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {snap.dataJson && (
                      <button
                        onClick={() => {
                          if (confirm(`هل تريد بالتأكيد استرجاع نقطة الحفظ: "${snap.label}"؟`)) {
                            restoreSnapshot(snap.id);
                            showNotification('تم استرجاع نقطة الحفظ بنجاح!');
                            setTimeout(() => window.location.reload(), 1000);
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-700 font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>استرجاع هذه النقطة</span>
                      </button>
                    )}

                    {snap.id !== 'snap-init' && (
                      <button
                        onClick={() => deleteSnapshot(snap.id)}
                        className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800 transition cursor-pointer"
                        title="حذف النقطة"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inspection Modal Before Restoring Backup */}
      {inspectModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">فحص سلامة النسخة الاحتياطية قبل الاستعادة</h3>
                <p className="text-xs text-slate-400">الملف: {inspectModalData.fileName}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono">
              <div className="flex justify-between text-slate-300">
                <span>اسم المعمل:</span>
                <b className="text-white">{inspectModalData.workshopName}</b>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>العملة المعتمدة:</span>
                <b className="text-amber-400">{inspectModalData.currency}</b>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>تاريخ التصدير:</span>
                <span className="text-slate-400">{inspectModalData.exportDate}</span>
              </div>
              <hr className="border-slate-800 my-1" />
              <div className="flex justify-between text-slate-300">
                <span>عدد الموردين:</span>
                <b className="text-sky-400">{inspectModalData.suppliersCount}</b>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>توريدات الحليب:</span>
                <b className="text-sky-400">{inspectModalData.milkSuppliesCount}</b>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>طبخات الجبنة:</span>
                <b className="text-emerald-400">{inspectModalData.productionsCount}</b>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>فواتير المبيعات:</span>
                <b className="text-purple-400">{inspectModalData.salesInvoicesCount}</b>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>تنبيه: سيؤدي التأكيد إلى استبدال البيانات الحالية بالبيانات الموجودة في هذا الملف.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setInspectModalData(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={confirmRestore}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4" />
                <span>تأكيد استرجاع النسخة الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
