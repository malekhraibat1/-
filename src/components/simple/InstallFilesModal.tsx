import React, { useState } from 'react';
import { useDairy } from '../../context/DairyContext';
import {
  X,
  Download,
  Package,
  Terminal,
  Usb,
  Database,
  FileCode,
  FileText,
  FolderArchive,
  Check,
  Copy,
  Laptop,
  HardDrive,
  ShieldCheck,
  Lock,
  KeyRound,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Phone,
  MessageCircle,
} from 'lucide-react';

interface InstallFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallFilesModal: React.FC<InstallFilesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    settings,
    generateWindowsInstallerScript,
    generateUsbBatchFile,
    generateUsbVbsFile,
    generateUsbAutorunFile,
    exportBackup,
    generatePortableHtmlApp,
    generateCustomerStatementsUsbHtml,
    generateReadmeInstructions,
    downloadCompleteFactoryZip,
    downloadWindowsExeInstaller,
  } = useDairy();

  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ name: string; content: string } | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  const handleDownloadExe = () => {
    downloadWindowsExeInstaller();
    showNotice('جاري تحميل برنامج التثبيت التنفيذي المباشر (Setup_CheeseFactory.exe)!');
  };

  if (!isOpen) return null;

  const downloadTextFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showNotice(`تم تنزيل الملف: ${filename}`);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(id);
    setTimeout(() => setCopiedFile(null), 2000);
    showNotice('تم نسخ المحتوى بنجاح إلى الحافظة!');
  };

  const showNotice = (msg: string) => {
    setDownloadSuccessMsg(msg);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadCompleteFactoryZip();
      showNotice('تم تنزيل حزمة التثبيت الكاملة (.zip) بنجاح! جاهزة للمستخدم بالكامل.');
    } catch {
      showNotice('حدث خطأ أثناء تنزيل الحزمة المضغوطة.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Open statement batch launcher content
  const openStatementsBatContent = `@echo off
chcp 65001 >nul
title كشف حسابات كافة الزبائن للفلاشة USB (العملة: شيكل ₪)
color 0B
echo ==============================================================================
echo       نظام إدارة معمل ومصنع الأجبان - كشف حسابات الزبائن والذمم
echo                        العملة المعتمدة: شيكل ₪
echo           تصميم وتطوير: المهندس مالك حريبات - للتواصل: 0594345464
echo ==============================================================================
echo.
echo بيانات الحماية والدخول:
echo   اسم المستخدم (Username): ${settings.username || 'admin'}
echo   كلمة المرور (Password): ${settings.password || '123456'}
echo   رمز الدخول السريع (PIN): ${settings.pinCode || '1234'}
echo.
echo جاري فتح كشف حسابات الزبائن بدون إنترنت لمناقشتهم في أماكنهم...
echo.

if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%~dp0كشف_حسابات_الزبائن_للفلاشة.html"
    goto END
)

if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" --app="%~dp0كشف_حسابات_الزبائن_للفلاشة.html"
    goto END
)

if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%~dp0كشف_حسابات_الزبائن_للفلاشة.html"
    goto END
)

start "" "%~dp0كشف_حسابات_الزبائن_للفلاشة.html"

:END
echo تم فتح كشف الحساب بنجاح.
timeout /t 3 >nul
exit
`;

  const filesList = [
    {
      id: 'installer_exe',
      name: 'Setup_CheeseFactory.exe (تثبيت_مصنع_الأجبان.exe)',
      badge: 'برنامج التثبيت الذاتي لويندوز (.EXE) 🚀 (الموصى به للمستخدم العادي)',
      badgeColor: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 font-black',
      type: 'برنامج تنفيذي ذاتي التثبيت لويندوز (PE32 Executable)',
      desc: 'ملف التثبيت التنفيذي المباشر المتكامل لويندوز (.exe): مدمج بداخله كافة الملفات وقاعدة البيانات بالشيكل ₪ والمشغلات. ينصب البرنامج بنقرة واحدة للمستخدم العادي دون الحاجة لأي صلاحيات مسؤول وبدون فك ضغط، ويضع الاختصارات فوراً على سطح المكتب وقائمة ابدأ.',
      getContent: () => '',
      mime: 'application/octet-stream',
      isExecutable: true,
      isBinaryExe: true,
      downloadUrl: '/Setup_CheeseFactory.exe',
      icon: Package,
    },
    {
      id: 'full_folder_zip',
      name: 'مجلد_تثبيت_مصنع_الأجبان (حزمة_كاملة.zip)',
      badge: 'المجلد الكامل مع كافة الملفات 📁 (كل الملفات في مجلد واحد)',
      badgeColor: 'bg-sky-500/25 text-sky-300 border-sky-500/50 font-black',
      type: 'حزمة المجلد الكاملة الشاملة (.zip)',
      desc: 'مجلد كامل يضم كافة ملفات التثبيت الـ 15: برنامج التثبيت EXE، سكريبتات الباتش، قاعدة البيانات، مشغلات الفلاشة، كشف حسابات الزبائن، والأيقونة والدليل في مجلد واحد منظم وجاهز.',
      getContent: () => '',
      mime: 'application/zip',
      isExecutable: false,
      isBinaryExe: false,
      isZipPackage: true,
      downloadUrl: '/حزمة_مصنع_الأجبان_المكتبي_والفلاشة_كاملة.zip',
      icon: FolderArchive,
    },
    {
      id: 'installer_bat',
      name: 'تثبيت_مصنع_الأجبان_على_الكمبيوتر.bat',
      badge: 'ملف سكريبت ويندوز (.bat) ⚡',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      type: 'Windows Batch (.bat)',
      desc: 'ملف التثبيت عبر موجه الأوامر: ينشئ مجلد المصنع، ينشئ مجلد قاعدة البيانات والنسخ، ويضع اختصارين على سطح المكتب باسم "مصنع ومعمل الأجبان" و"كشف حسابات الزبائن".',
      getContent: () => generateWindowsInstallerScript(),
      mime: 'application/x-bat;charset=utf-8;',
      isExecutable: true,
      isBinaryExe: false,
      downloadUrl: '',
      icon: Terminal,
    },
    {
      id: 'usb_run_bat',
      name: 'تشغيل_برنامج_الجبنة_من_الفلاشة.bat',
      badge: 'مشغل الفلاشة USB 🔌',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      type: 'Windows Batch (.bat)',
      desc: 'ملف التشغيل المحمول المباشر من الفلاش ميموري: يشغل البرنامج أوفلاين على أي كمبيوتر أو لابتوب بدون أي اتصال بالإنترنت ودون الحاجة لتثبيت برامج.',
      getContent: () => generateUsbBatchFile(),
      mime: 'application/x-bat;charset=utf-8;',
      isExecutable: true,
      icon: Usb,
    },
    {
      id: 'customer_stmt_bat',
      name: 'فتح_كشف_حسابات_الزبائن.bat',
      badge: 'مشغل كشوفات الزبائن 💼',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      type: 'Windows Batch (.bat)',
      desc: 'أمر تشغيل سريع ومباشر بنقرة واحدة لفتح كشف حسابات الزبائن والذمم من الفلاشة فوراً لمناقشتهم في محلاتهم بدون إنترنت.',
      getContent: () => openStatementsBatContent,
      mime: 'application/x-bat;charset=utf-8;',
      isExecutable: true,
      icon: Terminal,
    },
    {
      id: 'silent_vbs',
      name: 'تشغيل_صامت_بدون_شاشة_سوداء.vbs',
      badge: 'تشغيل صامت 🔕',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      type: 'VBScript (.vbs)',
      desc: 'سكريبت تشغيل صامت يخفي نافذة موجه الأوامر السوداء (CMD) ويفتح البرنامج بهدوء كشاشة تطبيق مكتبي أنيقة.',
      getContent: () => generateUsbVbsFile(),
      mime: 'text/vbscript;charset=utf-8;',
      isExecutable: true,
      icon: FileCode,
    },
    {
      id: 'autorun_inf',
      name: 'autorun.inf',
      badge: 'توصيل تلقائي ⚙️',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      type: 'Windows AutoRun (.inf)',
      desc: 'ملف التوصيل التلقائي الخاص بالفلاشة USB ليظهر اسم وأيقونة المصنع في مستكشف ملفات ويندوز عند إدخال الفلاشة.',
      getContent: () => generateUsbAutorunFile(),
      mime: 'text/plain;charset=utf-8;',
      isExecutable: false,
      icon: Package,
    },
    {
      id: 'db_json',
      name: 'dairy_database.json',
      badge: 'ملف الداتابيز الحقيقي 🗄️',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      type: 'قاعدة بيانات JSON مفتوحة (₪ شيكل)',
      desc: 'ملف قاعدة البيانات الحقيقي المفتوح بالشيكل ₪، يحوي كل الجداول: الموردين، توريدات الحليب، الطبخات، والمبيعات والديون.',
      getContent: () => exportBackup(),
      mime: 'application/json;charset=utf-8;',
      isExecutable: false,
      icon: Database,
    },
    {
      id: 'customer_statements_html',
      name: 'كشف_حسابات_الزبائن_للفلاشة.html',
      badge: 'كشف حساب محمي 💼',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      type: 'صفحة ويب أوفلاين محمية (.html)',
      desc: 'كشف حساب تفصيلي ومحمي بكلمة سر لكافة الزبائن والمسحوبات والديون والذمم بالشيكل ₪، مع خيارات البحث والطباعة وواتساب أوفلاين.',
      getContent: () => generateCustomerStatementsUsbHtml(),
      mime: 'text/html;charset=utf-8;',
      isExecutable: true,
      icon: FileText,
    },
    {
      id: 'portable_html',
      name: 'تشغيل_مصنع_الأجبان_المحمول.html',
      badge: 'النسخة المحمولة المستقلة 💻',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      type: 'صفحة ويب أوفلاين محمية (.html)',
      desc: 'صفحة التطبيق المكتبي المحمول المستقلة الجاهزة للعمل أوفلاين، مع شاشة تسجيل الدخول وحماية الحسابات.',
      getContent: () => generatePortableHtmlApp(),
      mime: 'text/html;charset=utf-8;',
      isExecutable: true,
      icon: Laptop,
    },
    {
      id: 'readme_txt',
      name: 'اقرأني_دليل_التشغيل_وكلمة_السر.txt',
      badge: 'الدليل وبيانات السر 📄',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      type: 'دليل نصي إرشادي (.txt)',
      desc: 'الدليل الإرشادي الشامل الموضح لبيانات تسجيل الدخول الافتراضية، مسارات قاعدة البيانات على القرص والفلاشة، وطريقة العمل.',
      getContent: () => generateReadmeInstructions(),
      mime: 'text/plain;charset=utf-8;',
      isExecutable: false,
      icon: FileText,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden relative">
        {/* Top Accent Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-sky-500 to-amber-500 w-full" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950/60">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-2xl shadow-lg shrink-0">
              📦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  مركز ملفات التثبيت وحزمة المصنع المكتبي
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                  ₪ شيكل
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-bold">
                  مجلد متكامل 15 ملفاً (.ZIP + .EXE) ✔️
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                جميع ملفات التثبيت المكتبي لويندوز، برنامج EXE، مشغلات الفلاشة USB، وقاعدة البيانات مجموعة في مجلد واحد جاهز
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer active:scale-95"
              title="تحميل المجلد كاملاً بجميع ملفاته في حزمة ZIP واحدة"
            >
              <FolderArchive className="w-4 h-4" />
              <span>{isDownloadingZip ? 'جاري تجهيز المجلد...' : 'تحميل المجلد كاملاً (.zip) 📁'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Alert */}
        {downloadSuccessMsg && (
          <div className="bg-emerald-950/80 border-y border-emerald-500/40 px-6 py-2.5 flex items-center gap-2 text-emerald-300 text-xs font-bold animate-fadeIn">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccessMsg}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Main Recommended EXE Installer Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/70 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-5 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/30 shrink-0">
                ⚡
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-white">
                    برنامج التثبيت التنفيذي المباشر لويندوز (Setup_CheeseFactory.exe)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[11px] animate-pulse">
                    الموصى به للمستخدم العادي ✔️
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 font-mono text-[10px]">
                    178 KB • NSIS Native EXE
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  الحل المتكامل والنهائي للمستخدم العادي! ملف تنفيذي واحد مدمج به كامل صفحات النظام، قاعدة البيانات المفتوحة بالشيكل ₪، مشغلات كروم وإيدج أوفلاين، واختصارات سطح المكتب.
                  لا يحتاج لأي صلاحيات مسؤول، ولا يتطلب أي برامج فك ضغط؛ فقط اضغط عليه مرتين لتنصيب المصنع بالكامل.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-emerald-400 font-bold pt-1">
                  <span>✔️ تثبيت بنقرة واحدة</span>
                  <span>•</span>
                  <span>✔️ لا يحتاج صلاحيات مسؤول (User Level)</span>
                  <span>•</span>
                  <span>✔️ ينشئ اختصارات سطح المكتب وقائمة ابدأ</span>
                  <span>•</span>
                  <span>✔️ يعمل بدون إنترنت 100%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleDownloadExe}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-xl text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/30 transition cursor-pointer active:scale-95"
              >
                <Download className="w-5 h-5" />
                <span>تحميل برنامج التثبيت (.EXE) 🚀</span>
              </button>
            </div>
          </div>

          {/* Quick Manager Credentials & Installation Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Credentials Card */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <KeyRound className="w-4 h-4" />
                  <span>بيانات تسجيل الدخول وحماية النظام المعتمدة:</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  محمي بكلمة سر 🔒
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-400 block text-[10px]">المستخدم:</span>
                  <b className="text-white font-bold">{settings.username || 'admin'}</b>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">كلمة المرور:</span>
                  <b className="text-amber-400 font-bold">{settings.password || '123456'}</b>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">رمز PIN:</span>
                  <b className="text-sky-400 font-bold">{settings.pinCode || '1234'}</b>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                ملاحظة: يمكنك تعديل اسم المستخدم وكلمة المرور في أي وقت من شاشة الإعدادات.
              </p>
            </div>

            {/* Database Location Summary */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <Database className="w-4 h-4" />
                  <span>مكان حفظ قاعدة البيانات (Database Path):</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono">
                  JSON / Local
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-slate-400 text-[10px]">مسار الكمبيوتر:</div>
                <div className="text-emerald-400 flex items-center justify-between gap-1">
                  <span className="break-all select-all">C:\CheeseFactory\database\dairy_database.json</span>
                  <button
                    onClick={() => copyText('C:\\CheeseFactory\\database\\dairy_database.json', 'path_db')}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0"
                    title="نسخ المسار"
                  >
                    {copiedFile === 'path_db' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>مسار الفلاشة: <code className="text-sky-300 font-mono">E:\CheeseFactory\database\dairy_database.json</code></span>
                <span className="text-emerald-400 font-mono">العملة: ₪ شيكل</span>
              </div>
            </div>
          </div>

          {/* Visual Folder Tree Structure Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-bold text-white text-sm">
                    محتويات مجلد التثبيت الكامل (مجلد_ملفات_التثبيت/):
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    تم جمع وحفظ كامل الملفات في مجلد رئيسي موحد مع مجلدات فرعية مخصصة + ملفات تشغيل مباشرة
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition cursor-pointer active:scale-95"
                >
                  <FolderArchive className="w-4 h-4" />
                  <span>تحميل المجلد كاملاً (.zip) 📁</span>
                </button>
              </div>
            </div>

            {/* Folder Grid Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-2">
                  <span>📁 01_برنامج_التثبيت_المباشر_EXE</span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 space-y-1">
                  <div>⚡ Setup_CheeseFactory.exe (178 KB)</div>
                  <div>⚡ تثبيت_مصنع_الأجبان.exe (178 KB)</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-2">
                  <span>📁 02_ملفات_الباتش_للتشغيل_المكتبي_BAT</span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 space-y-1">
                  <div>⚙️ تثبيت_مصنع_الأجبان_على_الكمبيوتر.bat</div>
                  <div>💻 تشغيل_المصنع.bat</div>
                  <div>🔌 تشغيل_برنامج_الجبنة_من_الفلاشة.bat</div>
                  <div>💼 فتح_كشف_الزبائن.bat</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="font-bold text-purple-400 flex items-center gap-2">
                  <span>📁 03_التشغيل_الصامت_والفلاشة</span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 space-y-1">
                  <div>🔕 تشغيل_صامت.vbs</div>
                  <div>🔕 تشغيل_صامت_بدون_شاشة_سوداء.vbs</div>
                  <div>⚙️ autorun.inf (توصيل تلقائي)</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="font-bold text-teal-400 flex items-center gap-2">
                  <span>📁 04_قاعدة_البيانات_والأيقونة_والدليل</span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 space-y-1">
                  <div>💾 dairy_database.json (شيكل ₪)</div>
                  <div>🧀 app_icon.ico (أيقونة ويندوز)</div>
                  <div>📄 اقرأني_دليل_التشغيل_وكلمة_السر.txt</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="font-bold text-sky-400 flex items-center gap-2">
                  <span>📁 05_صفحات_الويب_المستقلة_HTML</span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 space-y-1">
                  <div>🌐 تشغيل_مصنع_الأجبان_المحمول.html</div>
                  <div>💼 كشف_حسابات_الزبائن_للفلاشة.html</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-emerald-300">💡 جاهزية المجلد:</div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    تم تضمين جميع الملفات في جذر المجلد أيضاً لتشغيلها مباشرة دون الحاجة للدخول للمجلدات الفرعية.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  className="mt-2 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] transition cursor-pointer"
                >
                  تحميل الحزمة (.zip)
                </button>
              </div>
            </div>
          </div>

          {/* All Installation Files Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>قائمة ملفات التثبيت الجاهزة للتحميل والمعاينة الفردية:</span>
              </h3>
              <span className="text-slate-400 text-[11px]">انقر على تحميل لأي ملف أو اضغط معاينة للاطلاع على الكود</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filesList.map((file) => {
                const Icon = file.icon;
                return (
                  <div
                    key={file.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition shadow-md group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${file.badgeColor}`}>
                          {file.badge}
                        </span>
                        <div className="p-1.5 rounded-lg bg-slate-900 text-slate-400 group-hover:text-emerald-400 transition">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="font-mono text-white font-bold text-xs break-all mb-1">
                        {file.name}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {file.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (file.isBinaryExe) {
                            handleDownloadExe();
                          } else if (file.isZipPackage) {
                            handleDownloadZip();
                          } else {
                            downloadTextFile(file.getContent(), file.name, file.mime);
                          }
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                          file.isBinaryExe
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25'
                            : file.isZipPackage
                            ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/25'
                            : 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>
                          {file.isBinaryExe
                            ? 'تحميل مباشر (.EXE) 🚀'
                            : file.isZipPackage
                            ? 'تحميل المجلد كاملاً (.ZIP) 📁'
                            : 'تحميل الملف'}
                        </span>
                      </button>

                      {file.isBinaryExe ? (
                        <button
                          type="button"
                          onClick={handleDownloadExe}
                          className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 text-xs transition cursor-pointer"
                          title="تحميل نسخة تثبيت ثانية (تثبيت_مصنع_الأجبان.exe)"
                        >
                          <HardDrive className="w-3.5 h-3.5" />
                        </button>
                      ) : file.isZipPackage ? (
                        <button
                          type="button"
                          onClick={handleDownloadZip}
                          className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-sky-950/50 text-sky-300 border border-sky-500/30 text-xs transition cursor-pointer"
                          title="تحميل الحزمة المضغوطة كاملة"
                        >
                          <FolderArchive className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPreviewFile({ name: file.name, content: file.getContent() })}
                          className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition cursor-pointer"
                          title="معاينة ونسخ الكود"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step-by-Step Installation Guide */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>طريقة تثبيت البرنامج على الكمبيوتر خطوة بخطوة (ويندوز):</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
                <div className="font-bold text-amber-400">1. تنزيل برنامج التثبيت (.EXE)</div>
                <p className="text-slate-400 leading-relaxed">
                  اضغط على زر <b className="text-emerald-400">تحميل برنامج التثبيت (.EXE)</b> بالأعلى لتحميل الملف التنفيذي المباشر <code className="text-white font-mono">Setup_CheeseFactory.exe</code>.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
                <div className="font-bold text-sky-400">2. التشغيل بنقرة واحدة</div>
                <p className="text-slate-400 leading-relaxed">
                  انقر نقراً مزدوجاً على الملف (Double Click). سيفتح معالج التثبيت العربي ويقوم باستخراج كافة الملفات وقاعدة البيانات وتجهيز النظام بدون صلاحيات مسؤول.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
                <div className="font-bold text-emerald-400">3. التشغيل الفوري من سطح المكتب</div>
                <p className="text-slate-400 leading-relaxed">
                  ستجد اختصار <b className="text-white">"مصنع ومعمل الأجبان"</b> و<b className="text-white">"كشف حسابات الزبائن"</b> على سطح المكتب وقائمة ابدأ، جاهزين للعمل بدون إنترنت فوراً.
                </p>
              </div>
            </div>
          </div>

          {/* Developer Credit Footer Card */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
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
                  معمل ومصنع الألبان والأجبان النموذجية • العملة المعتمدة: ₪ شيكل
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href="tel:0594345464"
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5"
                dir="ltr"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>0594345464</span>
              </a>

              <a
                href="https://wa.me/972594345464"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>واتساب 💬</span>
              </a>
            </div>
          </div>
        </div>

        {/* Preview Code Sub-Modal / Drawer */}
        {previewFile && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-20 p-6 flex flex-col justify-between animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                <h4 className="font-mono font-bold text-white text-sm">{previewFile.name}</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyText(previewFile.content, 'preview_copy')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedFile === 'preview_copy' ? 'تم النسخ ✔️' : 'نسخ الكود بالكامل'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <pre className="my-4 flex-1 overflow-auto bg-slate-900 border border-slate-800 p-4 rounded-2xl text-[11px] font-mono text-emerald-400 leading-relaxed text-left dir-ltr select-all">
              {previewFile.content}
            </pre>

            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-3">
              <span>يمكنك نسخ هذا الكود ولصقه في ملف نصي وحفظه بالاسم: <b className="text-white font-mono">{previewFile.name}</b></span>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
