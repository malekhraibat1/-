/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DairyProvider, useDairy, SupplierStatement } from './context/DairyContext';
import { TopMetricsBar } from './components/simple/TopMetricsBar';
import { HomeDashboardView } from './components/simple/HomeDashboardView';
import { MilkSupplyView } from './components/simple/MilkSupplyView';
import { ProductionAndRatesView } from './components/simple/ProductionAndRatesView';
import { SuppliersLedgerView } from './components/simple/SuppliersLedgerView';
import { SalesInvoicesView } from './components/simple/SalesInvoicesView';
import { CheeseSalesChartsView } from './components/simple/CheeseSalesChartsView';
import { BackupAndUsbView } from './components/simple/BackupAndUsbView';
import { WorkshopSettingsView } from './components/simple/WorkshopSettingsView';
import {
  PrintMilkReceiptModal,
  PrintSupplierStatementModal,
  PrintSalesInvoiceModal,
} from './components/simple/PrintModals';
import { CustomerStatementsModal } from './components/simple/CustomerStatementsModal';
import { InstallFilesModal } from './components/simple/InstallFilesModal';
import { AuthLoginModal } from './components/simple/AuthLoginModal';
import { MilkSupplyEntry, CheeseSaleInvoice } from './types/dairySimple';
import {
  Home,
  Milk,
  Scale,
  BarChart3,
  Users,
  Receipt,
  Settings,
  TrendingUp,
  HardDrive,
  Usb,
  Database,
  Lock,
  Package,
} from 'lucide-react';

const DairyAppShell: React.FC = () => {
  const {
    settings,
    suppliers,
    milkSupplies,
    productions,
    salesInvoices,
    isAuthenticated,
    lockApp,
  } = useDairy();

  // Active Main Tab - Default is 'home' (الصفحة الرئيسية)
  const [activeTab, setActiveTab] = useState<
    'home' | 'supply' | 'production' | 'rates' | 'analytics' | 'suppliers_ledger' | 'sales' | 'backup' | 'settings'
  >('home');

  // Print Modals State
  const [receiptToPrint, setReceiptToPrint] = useState<MilkSupplyEntry | null>(null);
  const [statementToPrint, setStatementToPrint] = useState<SupplierStatement | null>(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState<CheeseSaleInvoice | null>(null);
  const [isCustomerStatementsModalOpen, setIsCustomerStatementsModalOpen] = useState(false);
  const [isInstallFilesModalOpen, setIsInstallFilesModalOpen] = useState(false);

  const navTabs = [
    {
      id: 'home',
      label: 'الصفحة الرئيسية',
      sublabel: 'خيارات الموردين والتوريد والجبنة والحسابات والمعدلات',
      icon: Home,
      badge: 'الرئيسية 🏠',
    },
    {
      id: 'supply',
      label: 'التوريد',
      sublabel: 'توريد الحليب • الدفع كاش وشيكات • الباقي لنا وعلينا',
      icon: Milk,
      badge: `${milkSupplies.length} شحنة`,
    },
    {
      id: 'production',
      label: 'الجبنة',
      sublabel: 'إدخال الإنتاج اليومي • الوزن بالكيلو • سجل الجبنة',
      icon: Scale,
      badge: `${productions.length} طبخات`,
    },
    {
      id: 'rates',
      label: 'المعدلات',
      sublabel: 'نسب الجبنة للحليب لكل مورد ويوم وشهر وتراكمي',
      icon: BarChart3,
      badge: 'التصافي 📈',
    },
    {
      id: 'analytics',
      label: 'التقارير',
      sublabel: 'المبيعات الشهرية • مقارنة أداء أصناف الجبن (Recharts)',
      icon: TrendingUp,
      badge: 'بيانات 📊',
    },
    {
      id: 'suppliers_ledger',
      label: 'الموردين والحسابات',
      icon: Users,
      sublabel: 'دليل الموردين • كشوفات الحسابات • الديون والشيكات',
      badge: `${suppliers.length} موردين`,
    },
    {
      id: 'sales',
      label: 'فواتير البيع وPDF',
      sublabel: 'إصدار الفواتير • زبائن ومحلات • طباعة أو حفظ PDF',
      icon: Receipt,
      badge: `${salesInvoices.length} فواتير`,
    },
    {
      id: 'backup',
      label: 'التثبيت والداتابيز',
      sublabel: 'ملف التثبيت • مكان قاعدة البيانات • الفلاشة',
      icon: Database,
      badge: 'داتابيز 🗄️',
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      sublabel: 'الأسعار والعملة • حفظ البيانات للكمبيوتر',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 px-5 py-3 sticky top-0 z-30 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div
              onClick={() => setActiveTab('home')}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/25 cursor-pointer hover:scale-105 transition"
              title="العودة للصفحة الرئيسية"
            >
              🧀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  onClick={() => setActiveTab('home')}
                  className="text-base font-black text-white tracking-wide cursor-pointer hover:text-amber-400 transition"
                >
                  {settings.workshopName}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
                  ₪ شيكل
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold font-mono">
                  Database & Setup
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                الصفحة الرئيسية • الموردين • التوريد • الجبنة • الحسابات • المعدلات •
                التقارير • الفواتير • ملف التثبيت والداتابيز
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInstallFilesModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-black transition cursor-pointer shadow-sm"
              title="مركز ملفات التثبيت للكمبيوتر وحزمة الفلاشة USB"
            >
              <Package className="w-3.5 h-3.5" />
              <span>ملفات التثبيت 📦</span>
            </button>

            <button
              onClick={() => setIsCustomerStatementsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black transition cursor-pointer shadow-sm"
              title="إنشاء كشف حساب مفصل لكافة الزبائن ووضعه على فلاش USB لمناقشتهم في أماكنهم"
            >
              <Usb className="w-3.5 h-3.5" />
              <span>كشف الزبائن للفلاشة 💼</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
              title="ملف التثبيت ومكان قاعدة البيانات"
            >
              <Database className="w-3.5 h-3.5" />
              <span>التثبيت والداتابيز 🗄️</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-bold transition cursor-pointer"
              title="دليل وحزمة الفلاشة USB"
            >
              <Usb className="w-3.5 h-3.5" />
              <span>فلاشة USB 🔌</span>
            </button>

            {/* Lock App Button */}
            <button
              onClick={lockApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/70 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 text-xs font-bold transition cursor-pointer"
              title="قفل النظام وحماية البيانات بكلمة المرور"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>قفل 🔒</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-mono bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="المستخدم متصل" />
              <span>
                المستخدم: <b className="text-white font-mono">{settings.username || 'admin'}</b>
              </span>
              <span className="text-slate-600">|</span>
              <span>
                <b className="text-amber-400">₪ {settings.currency || 'شيكل'}</b>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Summary Metrics */}
        <TopMetricsBar />

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 no-print shadow-xl">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-right p-2.5 rounded-xl transition-all flex flex-col justify-between cursor-pointer border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/25 font-black scale-[1.02]'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800/80 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-start justify-between gap-1 w-full mb-1">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {tab.badge && (
                    <span
                      className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                        isActive
                          ? 'bg-slate-950/25 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-[11px] font-black truncate">{tab.label}</div>
                  <div
                    className={`text-[8px] truncate mt-0.5 ${
                      isActive ? 'text-slate-950 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {tab.sublabel.split('•')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Active View */}
        <main className="space-y-6">
          {/* 1. الصفحة الرئيسية المطلوبة بالخيارات */}
          {activeTab === 'home' && (
            <HomeDashboardView
              onNavigateTab={(tab) => {
                if (tab === 'rates_view') setActiveTab('rates');
                else setActiveTab(tab as any);
              }}
              onOpenCustomerStatements={() => setIsCustomerStatementsModalOpen(true)}
              onOpenInstallFilesModal={() => setIsInstallFilesModalOpen(true)}
            />
          )}

          {/* 2. خانة التوريد وسجل الحليب والدفعات والشيكات */}
          {activeTab === 'supply' && (
            <MilkSupplyView onPrintReceipt={(entry) => setReceiptToPrint(entry)} />
          )}

          {/* 3. خانة الجبنة والإنتاج اليومي */}
          {activeTab === 'production' && <ProductionAndRatesView defaultTab="production" />}

          {/* 4. خانة المعدلات ونسب التصافي */}
          {activeTab === 'rates' && <ProductionAndRatesView defaultTab="rates" />}

          {/* 5. التقارير والرسوم البيانية لمبيعات الجبنة */}
          {activeTab === 'analytics' && <CheeseSalesChartsView />}

          {/* 6. الموردين وسجل المحاسبة وكشف حسابات الموردين */}
          {activeTab === 'suppliers_ledger' && (
            <SuppliersLedgerView onPrintStatement={(st) => setStatementToPrint(st)} />
          )}

          {/* 7. فواتير بيع الجبنة وطباعة PDF */}
          {activeTab === 'sales' && (
            <SalesInvoicesView onPrintInvoice={(inv) => setInvoiceToPrint(inv)} />
          )}

          {/* 8. النسخة الاحتياطية والتثبيت على فلاشة USB وتصدير إكسل */}
          {activeTab === 'backup' && (
            <BackupAndUsbView
              onOpenCustomerStatements={() => setIsCustomerStatementsModalOpen(true)}
              onOpenInstallModal={() => setIsInstallFilesModalOpen(true)}
            />
          )}

          {/* 9. إعدادات المعمل */}
          {activeTab === 'settings' && <WorkshopSettingsView />}
        </main>
      </div>

      {/* Developer Credit Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-900/60 backdrop-blur py-4 px-6 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>نظام إدارة معمل ومصنع الألبان والأجبان النموذجية</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-mono font-bold">العملة: ₪ شيكل</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-2xl shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-amber-400 font-bold">تصميم وتطوير:</span>
              <span className="font-black text-white">المهندس مالك حريبات</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">للتواصل:</span>
              <a
                href="tel:0594345464"
                className="font-mono font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
                dir="ltr"
              >
                📞 0594345464
              </a>
              <a
                href="https://wa.me/972594345464"
                target="_blank"
                rel="noreferrer"
                className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-bold transition flex items-center gap-1"
                title="مراسلة عبر واتساب"
              >
                <span>واتساب</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Print & PDF Modals */}
      <PrintMilkReceiptModal
        entry={receiptToPrint}
        isOpen={!!receiptToPrint}
        onClose={() => setReceiptToPrint(null)}
      />

      <PrintSupplierStatementModal
        statement={statementToPrint}
        isOpen={!!statementToPrint}
        onClose={() => setStatementToPrint(null)}
      />

      <PrintSalesInvoiceModal
        invoice={invoiceToPrint}
        isOpen={!!invoiceToPrint}
        onClose={() => setInvoiceToPrint(null)}
      />

      <CustomerStatementsModal
        isOpen={isCustomerStatementsModalOpen}
        onClose={() => setIsCustomerStatementsModalOpen(false)}
      />

      <InstallFilesModal
        isOpen={isInstallFilesModalOpen}
        onClose={() => setIsInstallFilesModalOpen(false)}
      />

      {/* Security & Authentication Login Screen */}
      <AuthLoginModal isOpen={!isAuthenticated} />
    </div>
  );
};

export default function App() {
  return (
    <DairyProvider>
      <DairyAppShell />
    </DairyProvider>
  );
}
