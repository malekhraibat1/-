import React from 'react';
import {
  LayoutDashboard,
  Factory,
  Boxes,
  Receipt,
  ScanLine,
  Users2,
  Settings,
  ChevronLeft,
  Milk,
  CheckCircle2,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { batches, finishedProducts, rawMaterials, invoices } = useFactory();

  const activeBatchesCount = batches.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  ).length;

  const totalFinishedStockKg = finishedProducts.reduce(
    (sum, p) => sum + p.currentStockKg,
    0
  );

  const rawMilkTotal = rawMaterials
    .filter((r) => r.category === 'حليب خام')
    .reduce((sum, r) => sum + r.currentStock, 0);

  const navItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم والمؤشرات',
      icon: LayoutDashboard,
      badge: null,
      desc: 'نظرة عامة ومؤشرات الأداء',
    },
    {
      id: 'production',
      label: 'خطوط ومراحل الإنتاج',
      icon: Factory,
      badge: activeBatchesCount > 0 ? `${activeBatchesCount} قيد العمل` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      desc: 'تتبع المراحل من الحليب للتعتيق',
    },
    {
      id: 'inventory',
      label: 'إدارة المخزون والمستودعات',
      icon: Boxes,
      badge: `${totalFinishedStockKg.toFixed(0)} كغ جاهز`,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
      desc: 'المواد الأولية ومنتجات الجبن',
    },
    {
      id: 'invoices',
      label: 'فواتير المبيعات والتوزيع',
      icon: Receipt,
      badge: invoices.length > 0 ? `${invoices.length} فاتورة` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      desc: 'إصدار وطباعة فواتير البيع',
    },
    {
      id: 'traceability',
      label: 'نظام التتبع وسلامة الغذاء',
      icon: ScanLine,
      badge: 'ISO/HACCP',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
      desc: 'تتبع اللوت من الحليب للعميل',
    },
    {
      id: 'partners',
      label: 'العملاء وموردي الحليب',
      icon: Users2,
      badge: null,
      desc: 'سجلات المزارع والزبائن والذمم',
    },
    {
      id: 'settings',
      label: 'إعدادات المصنع والنسخ الاحتياطي',
      icon: Settings,
      badge: null,
      desc: 'بيانات المنشأة وتصدير البيانات',
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-l border-slate-800 flex flex-col justify-between shrink-0 no-print select-none">
      <div className="py-4 px-3 space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          القائمة الرئيسية
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full text-right flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 group-hover:text-amber-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-snug">{item.label}</div>
                  <div className="text-[10px] text-slate-500 group-hover:text-slate-400">
                    {item.desc}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Factory Station Status Card in Sidebar */}
      <div className="p-3 m-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800/80">
          <span className="font-semibold text-slate-300">محطة الاستلام والتخزين</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1.5">
              <Milk className="w-3.5 h-3.5 text-blue-400" />
              مخزون الحليب الخام:
            </span>
            <span className="font-bold text-slate-200 font-mono">
              {rawMilkTotal.toLocaleString()} لتر
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              جبن تام الصنع:
            </span>
            <span className="font-bold text-emerald-300 font-mono">
              {totalFinishedStockKg.toLocaleString()} كغ
            </span>
          </div>
        </div>

        <div className="pt-1">
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((totalFinishedStockKg / 1000) * 100))}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-500 mt-1">
            <span>سعة البرادات</span>
            <span>{Math.round((totalFinishedStockKg / 1000) * 100)}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
