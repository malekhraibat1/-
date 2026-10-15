import React, { createContext, useContext, useState, useEffect } from 'react';
import JSZip from 'jszip';
import {
  Supplier,
  MilkSupplyEntry,
  CheeseProductionEntry,
  CheeseSaleInvoice,
  DairySettings,
  BackupSnapshot,
  CustomerStatement,
} from '../types/dairySimple';
import {
  INITIAL_SUPPLIERS,
  INITIAL_MILK_SUPPLIES,
  INITIAL_CHEESE_PRODUCTIONS,
  INITIAL_SALES_INVOICES,
  INITIAL_SETTINGS,
} from '../data/dairyData';

export interface SupplierStatement {
  supplier: Supplier;
  totalLiters: number;
  totalCost: number;
  totalCashPaid: number;
  totalChequePaid: number;
  totalPaid: number;
  netBalance: number; // موجب = علينا له (له دين في ذمتنا)، سالب = لنا عليه (دفعنا له زيادة)
  balanceStatus: 'لنا' | 'علينا' | 'خالص';
  transactions: MilkSupplyEntry[];
}

interface DairyContextType {
  suppliers: Supplier[];
  milkSupplies: MilkSupplyEntry[];
  productions: CheeseProductionEntry[];
  salesInvoices: CheeseSaleInvoice[];
  settings: DairySettings;
  snapshots: BackupSnapshot[];

  // Actions
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;

  addMilkSupply: (entry: Omit<MilkSupplyEntry, 'id' | 'totalAmount' | 'totalPaid' | 'balanceRemaining' | 'balanceType'>) => MilkSupplyEntry;
  deleteMilkSupply: (id: string) => void;

  addProduction: (entry: Omit<CheeseProductionEntry, 'id' | 'yieldPercentage' | 'litersPerKgCheese'>) => CheeseProductionEntry;
  deleteProduction: (id: string) => void;

  addSaleInvoice: (invoice: Omit<CheeseSaleInvoice, 'id' | 'invoiceNumber' | 'remainingAmount'> & { totalAmount?: number }) => CheeseSaleInvoice;
  deleteSaleInvoice: (id: string) => void;

  updateSettings: (settings: DairySettings) => void;

  // Accounting Ledger calculations
  getSupplierStatement: (supplierId: string) => SupplierStatement | null;
  getAllSupplierStatements: () => SupplierStatement[];

  // Data management & Backup
  exportBackup: () => string;
  importBackup: (json: string) => boolean;
  resetToDefaults: () => void;

  // Snapshots (Local Recovery Points)
  createSnapshot: (label?: string) => BackupSnapshot;
  restoreSnapshot: (id: string) => boolean;
  deleteSnapshot: (id: string) => void;

  // Excel / CSV Export
  exportSuppliersCSV: () => string;
  exportMilkSuppliesCSV: () => string;
  exportProductionsCSV: () => string;
  exportSalesInvoicesCSV: () => string;

  // USB Portable Launchers & Setup
  generateUsbBatchFile: () => string;
  generateUsbVbsFile: () => string;
  generateUsbAutorunFile: () => string;
  generatePortableHtmlApp: () => string;
  generateWindowsInstallerScript: () => string;

  // Customer Statements & USB Ledger
  getCustomerStatement: (customerName: string) => CustomerStatement | null;
  getAllCustomerStatements: () => CustomerStatement[];
  exportCustomerStatementsCSV: () => string;
  generateCustomerStatementsUsbHtml: () => string;

  // Authentication & Security (اسم المستخدم وكلمة السر)
  isAuthenticated: boolean;
  login: (user: string, pass: string, remember?: boolean) => boolean;
  logout: () => void;
  lockApp: () => void;
  updateCredentials: (newUsername: string, newPassword: string, oldPassword?: string) => boolean;

  // Complete Folder Package & Executable Apps
  generateReadmeInstructions: () => string;
  downloadCompleteFactoryZip: () => Promise<void>;
  downloadWindowsExeInstaller: () => void;
  downloadCheeseFactoryExe: () => void;
  downloadCustomerStatementsExe: () => void;
}

const STORAGE_PREFIX = 'dairy_simple_app_v3_ils';

const defaultSnapshots: BackupSnapshot[] = [
  {
    id: 'snap-init',
    timestamp: '2026-10-07T14:00:00.000Z',
    label: 'نقطة البداية الأساسية للمعمل (تهيئة الشيكل ₪)',
    suppliersCount: 3,
    suppliesCount: 4,
    productionsCount: 4,
    invoicesCount: 10,
    dataJson: '',
  },
];

const DairyContext = createContext<DairyContextType | undefined>(undefined);

export const DairyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const s = localStorage.getItem(`${STORAGE_PREFIX}_suppliers`);
      if (s) return JSON.parse(s);
      // Migrate from v2 if available
      const old = localStorage.getItem('dairy_simple_app_v2_suppliers');
      return old ? JSON.parse(old) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [milkSupplies, setMilkSupplies] = useState<MilkSupplyEntry[]>(() => {
    try {
      const s = localStorage.getItem(`${STORAGE_PREFIX}_supplies`);
      if (s) return JSON.parse(s);
      const old = localStorage.getItem('dairy_simple_app_v2_supplies');
      return old ? JSON.parse(old) : INITIAL_MILK_SUPPLIES;
    } catch {
      return INITIAL_MILK_SUPPLIES;
    }
  });

  const [productions, setProductions] = useState<CheeseProductionEntry[]>(() => {
    try {
      const s = localStorage.getItem(`${STORAGE_PREFIX}_productions`);
      if (s) return JSON.parse(s);
      const old = localStorage.getItem('dairy_simple_app_v2_productions');
      return old ? JSON.parse(old) : INITIAL_CHEESE_PRODUCTIONS;
    } catch {
      return INITIAL_CHEESE_PRODUCTIONS;
    }
  });

  const [salesInvoices, setSalesInvoices] = useState<CheeseSaleInvoice[]>(() => {
    try {
      const s = localStorage.getItem(`${STORAGE_PREFIX}_invoices`);
      if (s) return JSON.parse(s);
      const old = localStorage.getItem('dairy_simple_app_v2_invoices');
      return old ? JSON.parse(old) : INITIAL_SALES_INVOICES;
    } catch {
      return INITIAL_SALES_INVOICES;
    }
  });

  const [settings, setSettings] = useState<DairySettings>(() => {
    try {
      const s = localStorage.getItem(`${STORAGE_PREFIX}_settings`);
      if (s) {
        const parsed = JSON.parse(s);
        // Force currency to Shekel if previously set to Jordanian Dinar or anything else
        if (!parsed.currency || parsed.currency === 'د.أ' || parsed.currency === 'دينار') {
          parsed.currency = 'شيكل';
          parsed.defaultMilkPrice = 3.20;
          parsed.defaultCheesePrice = 28.0;
        }
        if (!parsed.username) parsed.username = 'admin';
        if (!parsed.password) parsed.password = '123456';
        if (parsed.isPasswordProtected === undefined) parsed.isPasswordProtected = true;
        if (!parsed.pinCode) parsed.pinCode = '1234';
        return parsed;
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const sess = sessionStorage.getItem(`${STORAGE_PREFIX}_auth_session`);
      if (sess === 'true') return true;
      const rem = localStorage.getItem(`${STORAGE_PREFIX}_remember_me`);
      if (rem === 'true') return true;
      const s = localStorage.getItem(`${STORAGE_PREFIX}_settings`);
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed.isPasswordProtected === false) return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(() => {
    try {
      const s = localStorage.getItem(`${STORAGE_PREFIX}_snapshots`);
      return s ? JSON.parse(s) : defaultSnapshots;
    } catch {
      return defaultSnapshots;
    }
  });

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_supplies`, JSON.stringify(milkSupplies));
  }, [milkSupplies]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_productions`, JSON.stringify(productions));
  }, [productions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_invoices`, JSON.stringify(salesInvoices));
  }, [salesInvoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_snapshots`, JSON.stringify(snapshots));
  }, [snapshots]);

  // Suppliers Actions
  const addSupplier = (supData: Omit<Supplier, 'id'>): Supplier => {
    const id = `SUP-${Date.now()}`;
    const newSup: Supplier = { ...supData, id };
    setSuppliers((prev) => [...prev, newSup]);
    return newSup;
  };

  const updateSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === supplier.id ? supplier : s)));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  // Milk Supply Actions (With automatic financial calculation)
  const addMilkSupply = (
    entryData: Omit<MilkSupplyEntry, 'id' | 'totalAmount' | 'totalPaid' | 'balanceRemaining' | 'balanceType'>
  ): MilkSupplyEntry => {
    const id = `SUPPLY-${Date.now()}`;
    const totalAmount = Math.round(entryData.quantityLiters * entryData.pricePerLiter * 100) / 100;
    const paidCash = entryData.paidCash || 0;
    const paidCheque = entryData.paidCheque || 0;
    const totalPaid = Math.round((paidCash + paidCheque) * 100) / 100;

    const diff = Math.round((totalAmount - totalPaid) * 100) / 100;
    let balanceType: 'لنا' | 'علينا' | 'خالص' = 'خالص';
    let balanceRemaining = 0;

    if (diff > 0) {
      balanceType = 'علينا';
      balanceRemaining = diff;
    } else if (diff < 0) {
      balanceType = 'لنا';
      balanceRemaining = Math.abs(diff);
    }

    const newEntry: MilkSupplyEntry = {
      ...entryData,
      id,
      totalAmount,
      totalPaid,
      balanceRemaining,
      balanceType,
    };

    setMilkSupplies((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const deleteMilkSupply = (id: string) => {
    setMilkSupplies((prev) => prev.filter((item) => item.id !== id));
  };

  // Production Actions
  const addProduction = (
    entryData: Omit<CheeseProductionEntry, 'id' | 'yieldPercentage' | 'litersPerKgCheese'>
  ): CheeseProductionEntry => {
    const id = `PROD-${Date.now()}`;
    const yieldPercentage =
      entryData.milkUsedLiters > 0
        ? Math.round((entryData.cheeseProducedKg / entryData.milkUsedLiters) * 10000) / 100
        : 0;
    const litersPerKgCheese =
      entryData.cheeseProducedKg > 0
        ? Math.round((entryData.milkUsedLiters / entryData.cheeseProducedKg) * 100) / 100
        : 0;

    const newProd: CheeseProductionEntry = {
      ...entryData,
      id,
      yieldPercentage,
      litersPerKgCheese,
    };

    setProductions((prev) => [newProd, ...prev]);
    return newProd;
  };

  const deleteProduction = (id: string) => {
    setProductions((prev) => prev.filter((item) => item.id !== id));
  };

  // Sales Invoices Actions
  const addSaleInvoice = (
    invData: Omit<CheeseSaleInvoice, 'id' | 'invoiceNumber' | 'remainingAmount'> & { totalAmount?: number }
  ): CheeseSaleInvoice => {
    const id = `INV-${Date.now()}`;
    const num = `INV-${String(salesInvoices.length + 1).padStart(3, '0')}`;
    const totalAmount =
      invData.totalAmount !== undefined
        ? invData.totalAmount
        : Math.round(invData.quantityKg * invData.pricePerKg * 100) / 100;
    const remainingAmount = Math.max(0, Math.round((totalAmount - invData.paidAmount) * 100) / 100);

    const newInvoice: CheeseSaleInvoice = {
      ...invData,
      id,
      invoiceNumber: num,
      totalAmount,
      remainingAmount,
    };

    setSalesInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const deleteSaleInvoice = (id: string) => {
    setSalesInvoices((prev) => prev.filter((item) => item.id !== id));
  };

  const updateSettings = (newSettings: DairySettings) => {
    setSettings(newSettings);
  };

  // Accounting & Statement Calculations
  const getSupplierStatement = (supplierId: string): SupplierStatement | null => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return null;

    const transactions = milkSupplies.filter((item) => item.supplierId === supplierId);

    const totalLiters = transactions.reduce((sum, item) => sum + item.quantityLiters, 0);
    const totalCost = transactions.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalCashPaid = transactions.reduce((sum, item) => sum + item.paidCash, 0);
    const totalChequePaid = transactions.reduce((sum, item) => sum + item.paidCheque, 0);
    const totalPaid = totalCashPaid + totalChequePaid;

    const net = Math.round((supplier.initialBalance + totalCost - totalPaid) * 100) / 100;

    let balanceStatus: 'لنا' | 'علينا' | 'خالص' = 'خالص';
    if (net > 0) {
      balanceStatus = 'علينا';
    } else if (net < 0) {
      balanceStatus = 'لنا';
    }

    return {
      supplier,
      totalLiters,
      totalCost,
      totalCashPaid,
      totalChequePaid,
      totalPaid,
      netBalance: Math.abs(net),
      balanceStatus,
      transactions,
    };
  };

  const getAllSupplierStatements = (): SupplierStatement[] => {
    return suppliers.map((s) => getSupplierStatement(s.id)!).filter(Boolean);
  };

  // Customer Accounting Statements (كشوفات حسابات الزبائن والذمم)
  const getAllCustomerStatements = (): CustomerStatement[] => {
    const map: Record<string, CheeseSaleInvoice[]> = {};
    salesInvoices.forEach((inv) => {
      const name = inv.customerName?.trim();
      if (!name) return;
      if (!map[name]) map[name] = [];
      map[name].push(inv);
    });

    const statements: CustomerStatement[] = Object.keys(map).map((custName) => {
      const invoices = [...map[custName]].sort((a, b) => b.date.localeCompare(a.date));
      const totalKg = Math.round(invoices.reduce((sum, i) => sum + (Number(i.quantityKg) || 0), 0) * 100) / 100;
      const totalAmount = Math.round(invoices.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0) * 100) / 100;
      const totalPaid = Math.round(invoices.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0) * 100) / 100;
      const remainingBalance = Math.round(invoices.reduce((sum, i) => sum + (Number(i.remainingAmount) || 0), 0) * 100) / 100;
      const latestPhone = invoices.find((i) => i.customerPhone)?.customerPhone || '';
      const latestAddress = invoices.find((i) => i.customerAddress)?.customerAddress || '';

      return {
        customerName: custName,
        customerPhone: latestPhone,
        customerAddress: latestAddress,
        invoicesCount: invoices.length,
        totalKg,
        totalAmount,
        totalPaid,
        remainingBalance,
        status: remainingBalance > 0 ? 'مدين' : 'مسدد بالكامل',
        invoices,
      };
    });

    // Sort: highest outstanding debt first, then total sales descending
    return statements.sort((a, b) => {
      if (b.remainingBalance !== a.remainingBalance) {
        return b.remainingBalance - a.remainingBalance;
      }
      return b.totalAmount - a.totalAmount;
    });
  };

  const getCustomerStatement = (customerName: string): CustomerStatement | null => {
    const all = getAllCustomerStatements();
    return all.find((c) => c.customerName.toLowerCase() === customerName.trim().toLowerCase()) || null;
  };

  // Backup & Reset
  const exportBackup = (): string => {
    const data = {
      version: 'dairy_shekel_v3',
      exportDate: new Date().toISOString(),
      currency: settings.currency || 'شيكل',
      suppliers,
      milkSupplies,
      productions,
      salesInvoices,
      settings,
    };
    return JSON.stringify(data, null, 2);
  };

  const importBackup = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.suppliers && data.milkSupplies && data.productions) {
        setSuppliers(data.suppliers);
        setMilkSupplies(data.milkSupplies);
        setProductions(data.productions);
        if (data.salesInvoices) setSalesInvoices(data.salesInvoices);
        if (data.settings) {
          const loaded = { ...data.settings };
          if (!loaded.currency || loaded.currency === 'د.أ') loaded.currency = 'شيكل';
          setSettings(loaded);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetToDefaults = () => {
    setSuppliers(INITIAL_SUPPLIERS);
    setMilkSupplies(INITIAL_MILK_SUPPLIES);
    setProductions(INITIAL_CHEESE_PRODUCTIONS);
    setSalesInvoices(INITIAL_SALES_INVOICES);
    setSettings(INITIAL_SETTINGS);
    localStorage.removeItem(`${STORAGE_PREFIX}_suppliers`);
    localStorage.removeItem(`${STORAGE_PREFIX}_supplies`);
    localStorage.removeItem(`${STORAGE_PREFIX}_productions`);
    localStorage.removeItem(`${STORAGE_PREFIX}_invoices`);
    localStorage.removeItem(`${STORAGE_PREFIX}_settings`);
  };

  // Local Snapshots
  const createSnapshot = (label?: string): BackupSnapshot => {
    const backupJson = exportBackup();
    const newSnap: BackupSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toISOString(),
      label: label || `نسخة احتياطية بتاريخ ${new Date().toLocaleDateString('ar-EG')}`,
      suppliersCount: suppliers.length,
      suppliesCount: milkSupplies.length,
      productionsCount: productions.length,
      invoicesCount: salesInvoices.length,
      dataJson: backupJson,
    };
    setSnapshots((prev) => [newSnap, ...prev.slice(0, 15)]);
    return newSnap;
  };

  const restoreSnapshot = (id: string): boolean => {
    const found = snapshots.find((s) => s.id === id);
    if (!found || !found.dataJson) return false;
    return importBackup(found.dataJson);
  };

  const deleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  // CSV Helpers with UTF-8 BOM
  const toCsv = (headers: string[], rows: (string | number)[][]): string => {
    const escapeCol = (val: string | number) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };
    const content = [
      headers.map(escapeCol).join(','),
      ...rows.map((row) => row.map(escapeCol).join(',')),
    ].join('\r\n');
    return '\uFEFF' + content; // Prepend UTF-8 BOM so Excel opens Arabic correctly
  };

  const exportSuppliersCSV = (): string => {
    const headers = [
      'معرف المورد',
      'اسم المورد',
      'رقم الجوال',
      'العنوان / المنطقة',
      `سعر اللتر المتفق عليه (${settings.currency})`,
      `الرصيد الافتتاحي (${settings.currency})`,
      'ملاحظات',
    ];
    const rows = suppliers.map((s) => [
      s.id,
      s.name,
      s.phone,
      s.location || '-',
      s.pricePerLiterDefault || 0,
      s.initialBalance,
      s.notes || '-',
    ]);
    return toCsv(headers, rows);
  };

  const exportMilkSuppliesCSV = (): string => {
    const headers = [
      'رقم الحركة',
      'التاريخ',
      'اسم المورد',
      'الكمية باللتر',
      `سعر اللتر (${settings.currency})`,
      `المجموع (${settings.currency})`,
      'طريقة الدفع',
      `المدفوع نقداً (${settings.currency})`,
      `المدفوع بشيك (${settings.currency})`,
      `إجمالي المدفوع (${settings.currency})`,
      `الباقي (${settings.currency})`,
      'حالة الباقي (لنا/علينا)',
      'رقم الشيك',
      'صاحب الشيك',
      'تاريخ الشيك',
      'البنك',
      'ملاحظات',
    ];
    const rows = milkSupplies.map((s) => [
      s.id,
      s.date,
      s.supplierName,
      s.quantityLiters,
      s.pricePerLiter,
      s.totalAmount,
      s.paymentType,
      s.paidCash,
      s.paidCheque,
      s.totalPaid,
      s.balanceRemaining,
      s.balanceType,
      s.chequeDetails?.chequeNumber || '-',
      s.chequeDetails?.chequeHolderName || '-',
      s.chequeDetails?.chequeDate || '-',
      s.chequeDetails?.bankName || '-',
      s.notes || '-',
    ]);
    return toCsv(headers, rows);
  };

  const exportProductionsCSV = (): string => {
    const headers = [
      'رقم الطبخة',
      'التاريخ',
      'مصدر الحليب (المورد)',
      'كمية الحليب المستخدم باللتر',
      'إنتاج الجبنة بالكيلوغرام',
      'نسبة التصافي (الجبنة للحليب %)',
      'لتر حليب لكل 1 كغ جبنة',
      'صنف ونوع الجبنة',
      'ملاحظات',
    ];
    const rows = productions.map((p) => [
      p.id,
      p.date,
      p.supplierName,
      p.milkUsedLiters,
      p.cheeseProducedKg,
      `${p.yieldPercentage}%`,
      p.litersPerKgCheese,
      p.cheeseType,
      p.notes || '-',
    ]);
    return toCsv(headers, rows);
  };

  const exportSalesInvoicesCSV = (): string => {
    const headers = [
      'رقم الفاتورة',
      'التاريخ',
      'اسم العميل / المحل',
      'رقم الهاتف',
      'العنوان',
      'صنف الجبنة',
      'الكمية بالكيلوغرام',
      `سعر الكيلو (${settings.currency})`,
      `إجمالي الفاتورة (${settings.currency})`,
      'طريقة الدفع',
      `المدفوع (${settings.currency})`,
      `المتبقي (${settings.currency})`,
      'ملاحظات',
    ];
    const rows = salesInvoices.map((inv) => [
      inv.invoiceNumber,
      inv.date,
      inv.customerName,
      inv.customerPhone || '-',
      inv.customerAddress || '-',
      inv.cheeseType,
      inv.quantityKg,
      inv.pricePerKg,
      inv.totalAmount,
      inv.paymentMethod,
      inv.paidAmount,
      inv.remainingAmount,
      inv.notes || '-',
    ]);
    return toCsv(headers, rows);
  };

  const exportCustomerStatementsCSV = (): string => {
    const statements = getAllCustomerStatements();
    const headers = [
      'اسم الزبون / المحل',
      'رقم الهاتف',
      'العنوان',
      'عدد الفواتير',
      'إجمالي الكمية (كغ)',
      `إجمالي المبيعات (${settings.currency || 'شيكل'})`,
      `إجمالي المقبوض (${settings.currency || 'شيكل'})`,
      `الرصيد المتبقي بذمته (${settings.currency || 'شيكل'})`,
      'حالة الحساب',
      'تاريخ آخر فاتورة',
    ];
    const rows = statements.map((st) => [
      st.customerName,
      st.customerPhone || '-',
      st.customerAddress || '-',
      st.invoicesCount,
      st.totalKg,
      st.totalAmount,
      st.totalPaid,
      st.remainingBalance,
      st.status,
      st.invoices[0]?.date || '-',
    ]);
    return toCsv(headers, rows);
  };

  const generateCustomerStatementsUsbHtml = (): string => {
    const statements = getAllCustomerStatements();
    const totalSales = statements.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalPaid = statements.reduce((sum, s) => sum + s.totalPaid, 0);
    const totalDebt = statements.reduce((sum, s) => sum + s.remainingBalance, 0);
    const totalKg = statements.reduce((sum, s) => sum + s.totalKg, 0);
    const inDebtCount = statements.filter((s) => s.remainingBalance > 0).length;
    const statementsJson = JSON.stringify(statements);
    const currency = settings.currency || 'شيكل';
    const workshopName = settings.workshopName || 'مصنع ومعمل الأجبان';
    const username = settings.username || 'admin';
    const password = settings.password || '123456';
    const pinCode = settings.pinCode || '1234';
    const dateStr = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>كشف حسابات كافة الزبائن - ${workshopName} (نسخة الفلاشة USB) • محمي بكلمة مرور</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0b1120; color: #f1f5f9; padding: 20px; line-height: 1.5; }
    .container { max-width: 1100px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid #334155; border-radius: 18px; padding: 24px; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; }
    .header h1 { font-size: 22px; font-weight: 900; color: #f8fafc; }
    .header .subtitle { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; }
    .badge-usb { background: #0284c722; color: #38bdf8; border: 1px solid #0284c755; }
    .badge-ils { background: #10b98122; color: #34d399; border: 1px solid #10b98155; }
    .badge-debt { background: #e11d4822; color: #fb7185; border: 1px solid #e11d4855; }
    .badge-paid { background: #10b98122; color: #34d399; border: 1px solid #10b98155; }
    .badge-auth { background: #f59e0b22; color: #fbbf24; border: 1px solid #f59e0b55; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 20px; }
    .stat-card { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 16px; }
    .stat-title { font-size: 12px; color: #94a3b8; font-weight: bold; }
    .stat-val { font-size: 22px; font-weight: 900; font-family: monospace; margin-top: 4px; }
    .stat-val.red { color: #f43f5e; }
    .stat-val.green { color: #10b981; }
    .stat-val.amber { color: #f59e0b; }
    .stat-val.sky { color: #38bdf8; }
    .controls { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 14px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; align-items: center; }
    .search-input { flex: 1; min-width: 250px; background: #0f172a; border: 1px solid #475569; border-radius: 10px; padding: 10px 14px; color: white; font-size: 13px; outline: none; }
    .search-input:focus { border-color: #f59e0b; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: bold; cursor: pointer; border: none; text-decoration: none; transition: all 0.2s; }
    .btn-amber { background: #f59e0b; color: #0f172a; }
    .btn-amber:hover { background: #fbbf24; }
    .btn-sky { background: #0284c7; color: white; }
    .btn-sky:hover { background: #0369a1; }
    .btn-slate { background: #334155; color: white; }
    .btn-slate:hover { background: #475569; }
    .btn-outline { background: transparent; border: 1px solid #475569; color: #cbd5e1; }
    .btn-outline.active { background: #f59e0b; color: #0f172a; border-color: #f59e0b; }
    .customer-card { background: #131b2e; border: 1px solid #334155; border-radius: 16px; margin-bottom: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
    .customer-header { padding: 18px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; background: #1e293b; border-bottom: 1px solid #334155; cursor: pointer; }
    .customer-name { font-size: 16px; font-weight: 900; color: #ffffff; }
    .customer-meta { font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .customer-summary { display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; font-family: monospace; align-items: center; }
    .customer-body { padding: 18px; }
    table { width: 100%; border-collapse: collapse; text-align: right; font-size: 12px; margin-top: 8px; }
    th { background: #0f172a; color: #94a3b8; padding: 10px; font-weight: bold; border-bottom: 1px solid #334155; }
    td { padding: 10px; border-bottom: 1px solid #1e293b; font-family: monospace; }
    tr:hover td { background: #1a233a; }
    .actions-bar { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
    .notice { background: #0f172a; border: 1px solid #1e293b; padding: 14px; border-radius: 12px; font-size: 12px; color: #94a3b8; margin-top: 24px; text-align: center; }

    /* Auth Overlay Styles */
    .auth-overlay {
      position: fixed;
      inset: 0;
      background: rgba(11, 17, 32, 0.96);
      backdrop-filter: blur(10px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .auth-box {
      background: #131b2e;
      border: 1px solid #334155;
      border-radius: 24px;
      width: 100%;
      max-width: 440px;
      padding: 30px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.7);
      text-align: right;
      color: #f1f5f9;
    }
    .auth-title { font-size: 18px; font-weight: 900; color: #fff; margin-bottom: 4px; text-align: center; }
    .auth-desc { font-size: 12px; color: #94a3b8; margin-bottom: 16px; text-align: center; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 12px; font-weight: bold; color: #cbd5e1; margin-bottom: 5px; }
    .form-group input { width: 100%; background: #0f172a; border: 1px solid #475569; border-radius: 10px; padding: 10px 14px; color: #fff; font-size: 13px; outline: none; }
    .form-group input:focus { border-color: #f59e0b; }
    .auth-error { display: none; background: #e11d4822; color: #fb7185; border: 1px solid #e11d4855; padding: 10px; border-radius: 10px; font-size: 12px; font-weight: bold; margin-bottom: 14px; text-align: center; }
    .auth-tip { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 12px; margin-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
    .auth-tip b { color: #f59e0b; font-family: monospace; }

    @media print {
      body { background: white !important; color: black !important; padding: 0 !important; }
      .controls, .header button, .actions-bar, .notice, .auth-overlay { display: none !important; }
      .customer-card { page-break-after: always; border: 1px solid #ccc !important; background: white !important; color: black !important; margin-bottom: 30px !important; box-shadow: none !important; }
      .customer-header { background: #f1f5f9 !important; color: black !important; border-bottom: 2px solid #000 !important; }
      .customer-name { color: black !important; font-size: 18px !important; }
      .customer-meta { color: #475569 !important; }
      table { border: 1px solid #94a3b8 !important; }
      th { background: #e2e8f0 !important; color: black !important; border-bottom: 2px solid #000 !important; }
      td { border-bottom: 1px solid #cbd5e1 !important; color: black !important; }
      .stat-card { border: 1px solid #ccc !important; background: #f8fafc !important; color: black !important; }
      .stat-val { color: black !important; }
    }
  </style>
</head>
<body>
  <!-- Security & Password Authentication Modal Gate -->
  <div id="authGate" class="auth-overlay">
    <div class="auth-box">
      <div style="text-align:center; margin-bottom:12px;">
        <div style="font-size:46px; margin-bottom:6px;">🔐</div>
        <h2 class="auth-title">كشف حسابات الزبائن المحمي</h2>
        <p class="auth-desc">${workshopName} • نسخة الفلاشة USB</p>
        <div style="display:flex; justify-content:center; gap:6px; margin-bottom:14px;">
          <span class="badge badge-ils">₪ ${currency}</span>
          <span class="badge badge-auth">محمي بكلمة سر 🔒</span>
        </div>
      </div>

      <div id="authErr" class="auth-error">اسم المستخدم أو كلمة المرور غير صحيحة!</div>

      <form onsubmit="handleAuthSubmit(event)">
        <div class="form-group">
          <label>اسم المستخدم (Username):</label>
          <input type="text" id="authUserInput" value="${username}" required>
        </div>
        <div class="form-group">
          <label>كلمة المرور أو رمز PIN:</label>
          <input type="password" id="authPassInput" placeholder="أدخل كلمة المرور" required autofocus>
        </div>
        <button type="submit" class="btn btn-amber" style="width:100%; justify-content:center; padding:12px; font-weight:900;">
          فتح كشف الحسابات 🔓
        </button>
        <button type="button" class="btn btn-slate" onclick="quickFillAuth()" style="width:100%; justify-content:center; margin-top:8px; font-size:12px;">
          دخول سريع كمدير (${username} / ${password}) ⚡
        </button>
      </form>

      <div class="auth-tip">
        🔑 <b>البيانات الافتراضية:</b> المستخدم: <b>${username}</b> • كلمة المرور: <b>${password}</b>
      </div>
    </div>
  </div>

  <div class="container">
    <div class="header">
      <div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:24px;">🧀</span>
          <h1>${workshopName}</h1>
          <span class="badge badge-usb">نسخة الفلاشة المحمولة USB 💾</span>
          <span class="badge badge-ils">العملة: ${currency} ₪</span>
          <span class="badge badge-auth">محمي 🔒</span>
        </div>
        <div class="subtitle">
          كشف حسابات الذمم والمبيعات الشامل لكافة الزبائن والمحلات • تاريخ الإصدار: ${dateStr} • هاتف: ${settings.phone || '-'}
        </div>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        <button class="btn btn-amber" onclick="window.print()">🖨️ طباعة كشوفات الحساب (A4/PDF)</button>
        <button class="btn btn-slate" onclick="exportCsv()">📊 تصدير Excel (CSV)</button>
        <button class="btn btn-slate" onclick="lockStatements()" title="قفل الكشف وحماية البيانات">🔒 قفل الكشف</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">إجمالي المبيعات لكافة الزبائن</div>
        <div class="stat-val amber">${totalSales.toLocaleString()} ${currency}</div>
        <div style="font-size:11px; color:#94a3b8; margin-top:4px;">إجمالي الكمية: ${totalKg.toLocaleString()} كغ</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">إجمالي الديون المتبقية بذمم الزبائن</div>
        <div class="stat-val red">${totalDebt.toLocaleString()} ${currency}</div>
        <div style="font-size:11px; color:#f43f5e; margin-top:4px;">عدد الزبائن المدينين: ${inDebtCount} من ${statements.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">إجمالي المبالغ المحصلة والمسددة</div>
        <div class="stat-val green">${totalPaid.toLocaleString()} ${currency}</div>
        <div style="font-size:11px; color:#10b981; margin-top:4px;">نسبة التحصيل: ${totalSales > 0 ? ((totalPaid / totalSales) * 100).toFixed(1) : 0}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">إجمالي الزبائن المسجلين</div>
        <div class="stat-val sky">${statements.length} زبائن</div>
        <div style="font-size:11px; color:#38bdf8; margin-top:4px;">المسددين بالكامل: ${statements.length - inDebtCount}</div>
      </div>
    </div>

    <div class="controls">
      <input type="text" id="searchInput" class="search-input" placeholder="🔍 بحث باسم الزبون، رقم الهاتف، أو العنوان..." oninput="filterCustomers()">
      <div style="display:flex; gap:6px;">
        <button class="btn btn-outline active" id="filterAll" onclick="setFilter('all')">الكل (${statements.length})</button>
        <button class="btn btn-outline" id="filterDebt" onclick="setFilter('debt')">المدينين فقط (${inDebtCount})</button>
        <button class="btn btn-outline" id="filterPaid" onclick="setFilter('paid')">المسددين (${statements.length - inDebtCount})</button>
      </div>
    </div>

    <div id="customersList"></div>

    <div class="notice">
      💼 <b>ملاحظة لمندوب المبيعات / إدارة المصنع:</b> هذا الملف يعمل ذاتياً ومباشرة من الفلاشة USB بدون إنترنت على أي كمبيوتر أو لابتوب لمراجعة وتدقيق الحسابات ومناقشة الذمم مع الزبائن وأصحاب المحلات في أماكنهم.
    </div>

    <div style="background:#0f172a; border:1px solid #1e293b; padding:12px; border-radius:12px; font-size:11px; color:#94a3b8; margin-top:12px; text-align:center;">
      👨‍💻 هذا البرنامج وكشف الحسابات من تصميم وتطوير <b style="color:#fff;">المهندس مالك حريبات</b> للتواصل <a href="tel:0594345464" style="color:#f59e0b; text-decoration:none; font-family:monospace; font-weight:bold;">0594345464</a>
    </div>
  </div>

  <script>
    const statements = ${statementsJson};
    const currency = "${currency}";
    let currentFilter = 'all';

    function renderCustomers() {
      const container = document.getElementById('customersList');
      const q = document.getElementById('searchInput').value.trim().toLowerCase();

      const filtered = statements.filter(c => {
        if (currentFilter === 'debt' && c.remainingBalance <= 0) return false;
        if (currentFilter === 'paid' && c.remainingBalance > 0) return false;
        if (q) {
          const matchName = c.customerName.toLowerCase().includes(q);
          const matchPhone = (c.customerPhone || '').toLowerCase().includes(q);
          const matchAddr = (c.customerAddress || '').toLowerCase().includes(q);
          return matchName || matchPhone || matchAddr;
        }
        return true;
      });

      if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#64748b; background:#1e293b; border-radius:14px;">لا يوجد زبائن مطابقين للبحث.</div>';
        return;
      }

      container.innerHTML = filtered.map(c => {
        const isDebt = c.remainingBalance > 0;
        const cleanPhone = (c.customerPhone || '').replace(/[^0-9]/g, '');
        const waText = encodeURIComponent(\`مرحباً \${c.customerName}، مرفق ملخص كشف حسابك من \${"${workshopName}"}: إجمالي المشتريات: \${c.totalAmount} \${currency}، المدفوع: \${c.totalPaid} \${currency}، الرصيد المتبقي بذمتكم: \${c.remainingBalance} \${currency}. شكراً لتعاملكم معنا.\`);

        return \`
          <div class="customer-card" id="card-\${encodeURIComponent(c.customerName)}">
            <div class="customer-header">
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="customer-name">\${c.customerName}</span>
                  <span class="badge \${isDebt ? 'badge-debt' : 'badge-paid'}">\${isDebt ? 'مدين: ' + c.remainingBalance.toLocaleString() + ' ' + currency : 'خالص ومسدد ✔️'}</span>
                </div>
                <div class="customer-meta">
                  📞 هاتف: <b>\${c.customerPhone || 'غير مسجل'}</b> • 📍 العنوان: \${c.customerAddress || 'غير محدد'} • \${c.invoicesCount} فواتير
                </div>
              </div>
              <div class="customer-summary">
                <div>المشتريات: <b style="color:#f59e0b;">\${c.totalAmount.toLocaleString()} \${currency}</b></div>
                <div>المدفوع: <b style="color:#10b981;">\${c.totalPaid.toLocaleString()} \${currency}</b></div>
                <div>المتبقي: <b style="\${isDebt ? 'color:#f43f5e; font-size:14px;' : 'color:#10b981;'}">\${c.remainingBalance.toLocaleString()} \${currency}</b></div>
              </div>
            </div>

            <div class="customer-body">
              <table>
                <thead>
                  <tr>
                    <th>رقم الفاتورة</th>
                    <th>التاريخ</th>
                    <th>صنف الجبنة</th>
                    <th>الوزن (كغ)</th>
                    <th>سعر الكيلو</th>
                    <th>الإجمالي</th>
                    <th>المدفوع</th>
                    <th>المتبقي</th>
                    <th>طريقة الدفع</th>
                    <th>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  \${c.invoices.map(inv => \`
                    <tr>
                      <td style="font-weight:bold; color:#38bdf8;">\${inv.invoiceNumber}</td>
                      <td>\${inv.date}</td>
                      <td style="color:#f8fafc; font-weight:bold;">\${inv.cheeseType}</td>
                      <td>\${inv.quantityKg} كغ</td>
                      <td>\${inv.pricePerKg} \${currency}</td>
                      <td style="font-weight:bold;">\${inv.totalAmount.toLocaleString()} \${currency}</td>
                      <td style="color:#10b981;">\${inv.paidAmount.toLocaleString()} \${currency}</td>
                      <td style="\${inv.remainingAmount > 0 ? 'color:#f43f5e; font-weight:bold;' : 'color:#94a3b8;'}">\${inv.remainingAmount.toLocaleString()} \${currency}</td>
                      <td>\${inv.paymentMethod}</td>
                      <td style="color:#94a3b8; font-size:11px;">\${inv.notes || '-'}</td>
                    </tr>
                  \`).join('')}
                </tbody>
              </table>

              <div class="actions-bar">
                \${cleanPhone ? \`
                  <a href="https://wa.me/\${cleanPhone}?text=\${waText}" target="_blank" class="btn btn-slate" style="background:#059669;">
                    💬 إرسال الكشف واتساب
                  </a>
                \` : ''}
                <button class="btn btn-amber" onclick="printSingleCustomer('\${encodeURIComponent(c.customerName)}')">
                  🖨️ طباعة كشف هذا الزبون (A4)
                </button>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function setFilter(f) {
      currentFilter = f;
      document.getElementById('filterAll').className = 'btn btn-outline ' + (f === 'all' ? 'active' : '');
      document.getElementById('filterDebt').className = 'btn btn-outline ' + (f === 'debt' ? 'active' : '');
      document.getElementById('filterPaid').className = 'btn btn-outline ' + (f === 'paid' ? 'active' : '');
      renderCustomers();
    }

    function filterCustomers() {
      renderCustomers();
    }

    function printSingleCustomer(custEnc) {
      const allCards = document.querySelectorAll('.customer-card');
      const targetId = 'card-' + custEnc;
      allCards.forEach(c => {
        if (c.id !== targetId) c.style.display = 'none';
      });
      window.print();
      allCards.forEach(c => {
        c.style.display = '';
      });
    }

    function exportCsv() {
      let csv = "\\uFEFFاسم الزبون,رقم الهاتف,العنوان,عدد الفواتير,إجمالي الكمية كغ,إجمالي المبيعات,إجمالي المدفوع,الرصيد المتبقي,الحالة\\r\\n";
      statements.forEach(s => {
        csv += \`"\${s.customerName}","\${s.customerPhone || ''}","\${s.customerAddress || ''}",\${s.invoicesCount},\${s.totalKg},\${s.totalAmount},\${s.totalPaid},\${s.remainingBalance},"\${s.status}"\\r\\n\`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'كشف_حسابات_الزبائن.csv';
      a.click();
    }

    const expectedUser = "${(settings.username || 'admin').toLowerCase()}";
    const expectedPass = "${settings.password || '123456'}";
    const expectedPin = "${settings.pinCode || '1234'}";

    function checkAuthStatus() {
      const gate = document.getElementById('authGate');
      if (sessionStorage.getItem('dairy_customer_stmt_unlocked') === 'true') {
        gate.style.display = 'none';
      } else {
        gate.style.display = 'flex';
      }
    }

    function handleAuthSubmit(e) {
      e.preventDefault();
      const u = document.getElementById('authUserInput').value.trim().toLowerCase();
      const p = document.getElementById('authPassInput').value.trim();
      const err = document.getElementById('authErr');

      if ((u === expectedUser && (p === expectedPass || p === expectedPin)) || p === expectedPass || p === expectedPin) {
        err.style.display = 'none';
        sessionStorage.setItem('dairy_customer_stmt_unlocked', 'true');
        document.getElementById('authGate').style.display = 'none';
      } else {
        err.style.display = 'block';
      }
    }

    function quickFillAuth() {
      document.getElementById('authUserInput').value = expectedUser;
      document.getElementById('authPassInput').value = expectedPass;
      sessionStorage.setItem('dairy_customer_stmt_unlocked', 'true');
      document.getElementById('authGate').style.display = 'none';
    }

    function lockStatements() {
      sessionStorage.removeItem('dairy_customer_stmt_unlocked');
      document.getElementById('authGate').style.display = 'flex';
    }

    checkAuthStatus();
    renderCustomers();
  </script>
</body>
</html>`;
  };

  // USB Launchers Generation
  const generateUsbBatchFile = (): string => {
    return `@echo off
chcp 65001 >nul
title نظام إدارة معمل ومصنع الأجبان - تشغيل محمول من الفلاشة USB (العملة: شيكل ₪)
color 0E
echo ==============================================================================
echo       نظام إدارة معمل ومصنع الأجبان - النسخة المحمولة (USB Portable)
echo                        العملة المعتمدة: شيكل ₪
echo           تصميم وتطوير: المهندس مالك حريبات - للتواصل: 0594345464
echo ==============================================================================
echo.
echo جاري تشغيل البرنامج من الفلاشة على هذا الكمبيوتر دون الحاجة للإنترنت...
echo.

:: محاولة الفتح عبر متصفح Chrome أولاً ثم Edge ثم المتصفح الافتراضي
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%~dp0index.html"
    goto END
)

if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" --app="%~dp0index.html"
    goto END
)

if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%~dp0index.html"
    goto END
)

:: فتح المتصفح الافتراضي
start "" "%~dp0index.html"

:END
echo تم تشغيل البرنامج بنجاح. يمكنك إغلاق هذه النافذة.
timeout /t 3 >nul
exit
`;
  };

  const generateUsbVbsFile = (): string => {
    return `' تشغيل صامت لبرنامج مصنع الأجبان من الفلاشة بدون ظهور الشاشة السوداء
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "تشغيل_برنامج_الجبنة_من_الفلاشة.bat" & Chr(34), 0
Set WshShell = Nothing
`;
  };

  const generateUsbAutorunFile = (): string => {
    return `[AutoRun]
open=تشغيل_برنامج_الجبنة_من_الفلاشة.bat
action=تشغيل نظام إدارة مصنع ومعمل الأجبان
icon=icon.ico
label=مصنع الأجبان (USB Portable)
`;
  };

  const generatePortableHtmlApp = (): string => {
    const stateJson = exportBackup();
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>نظام مصنع الأجبان المحمول (تشغيل الفلاشة USB - شيكل ₪)</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #090d16; color: #f8fafc; padding: 30px; text-align: center; }
    .card { max-width: 700px; margin: 40px auto; background: #131b2e; border: 1px solid #334155; border-radius: 20px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    h1 { color: #f59e0b; margin-bottom: 8px; }
    .badge { display: inline-block; background: #10b98122; color: #34d399; border: 1px solid #059669; padding: 4px 12px; border-radius: 999px; font-weight: bold; font-size: 13px; }
    .btn { display: inline-block; background: #f59e0b; color: #0f172a; font-weight: bold; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 16px; margin: 15px 5px; cursor: pointer; border: none; }
    .btn:hover { background: #fbbf24; }
    .btn-outline { background: transparent; border: 1px solid #475569; color: #94a3b8; }
    .btn-outline:hover { background: #1e293b; color: white; }
    .info { text-align: right; background: #0b1120; border-radius: 12px; padding: 15px; margin-top: 20px; font-size: 14px; line-height: 1.8; color: #94a3b8; }
    .stat { display: inline-block; margin: 10px; background: #1e293b; padding: 10px 18px; border-radius: 10px; font-weight: bold; }
    .stat span { color: #f59e0b; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 48px;">🧀</div>
    <h1>نظام مصنع ومعمل الأجبان</h1>
    <div class="badge">النسخة المحمولة للفلاشة USB • العملة: شيكل ₪</div>
    <p style="color: #94a3b8; font-size: 14px; margin-top: 15px;">
      تم تجهيز هذه النسخة للعمل مباشرة وبشكل مستقل من الفلاشة على أي جهاز كمبيوتر أو لابتوب بدون الحاجة لاتصال بالإنترنت.
    </p>

    <div style="margin: 20px 0;">
      <div class="stat">الموردين: <span>${suppliers.length}</span></div>
      <div class="stat">التوريدات: <span>${milkSupplies.length}</span></div>
      <div class="stat">الطبخات: <span>${productions.length}</span></div>
      <div class="stat">الفواتير: <span>${salesInvoices.length}</span></div>
    </div>

    <div>
      <button class="btn" onclick="openWebApp()">تشغيل النظام الكامل 🚀</button>
      <button class="btn btn-outline" onclick="downloadBackup()">تصدير بيانات الفلاشة 💾</button>
    </div>

    <div class="info">
      <b style="color: white;">تعليمات التشغيل من الفلاشة:</b><br>
      1. انسخ هذا الملف مع ملف <code style="color: #38bdf8;">تشغيل_برنامج_الجبنة_من_الفلاشة.bat</code> على أي فلاش ميموري.<br>
      2. عند إدخال الفلاشة في أي كمبيوتر، انقر نقراً مزدوجاً على الملف لتشغيل النظام.<br>
      3. جميع التعديلات والحسابات محفوظة محلياً وتعمل بدون إنترنت 100%.<br>
      4. العملة المعتمدة في النظام هي <b>الشيكل ₪</b>.
    </div>
  </div>

  <script>
    const embeddedData = ${stateJson};
    function openWebApp() {
      // Load into local storage if not loaded
      try {
        localStorage.setItem('${STORAGE_PREFIX}_suppliers', JSON.stringify(embeddedData.suppliers));
        localStorage.setItem('${STORAGE_PREFIX}_supplies', JSON.stringify(embeddedData.milkSupplies));
        localStorage.setItem('${STORAGE_PREFIX}_productions', JSON.stringify(embeddedData.productions));
        localStorage.setItem('${STORAGE_PREFIX}_invoices', JSON.stringify(embeddedData.salesInvoices));
        localStorage.setItem('${STORAGE_PREFIX}_settings', JSON.stringify(embeddedData.settings));
      } catch (e) {}
      window.location.href = window.location.href.replace(/[^/]*$/, '') || '/';
    }
    function downloadBackup() {
      const blob = new Blob([JSON.stringify(embeddedData, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'بيانات_المعمل_من_الفلاشة.json';
      a.click();
    }
  </script>
</body>
</html>`;
  };

  const generateWindowsInstallerScript = (): string => {
    return `@echo off
chcp 65001 >nul
title مثبت برنامج مصنع ومعمل الأجبان (Setup & Installation)
color 0B
cls
echo ==============================================================================
echo           برنامج تثبيت نظام مصنع ومعمل الأجبان - الإصدار المكتبي
echo                        العملة المعتمدة: شيكل ₪
echo           تصميم وتطوير: المهندس مالك حريبات - للتواصل: 0594345464
echo ==============================================================================
echo.
:: إذا كان برنامج التثبيت التنفيذي المباشر EXE متوفراً نقوم بتشغيله فوراً
if exist "%~dp0Setup_CheeseFactory.exe" (
    echo [تنبيه] تم العثور على برنامج التثبيت الذاتي المباشر Setup_CheeseFactory.exe...
    echo جاري تشغيل برنامج التثبيت التنفيذي الآن...
    start "" "%~dp0Setup_CheeseFactory.exe"
    exit
)
if exist "%~dp0تثبيت_مصنع_الأجبان.exe" (
    echo [تنبيه] تم العثور على برنامج التثبيت الذاتي المباشر تثبيت_مصنع_الأجبان.exe...
    echo جاري تشغيل برنامج التثبيت التنفيذي الآن...
    start "" "%~dp0تثبيت_مصنع_الأجبان.exe"
    exit
)

echo [1/4] جاري تجهيز مجلدات التثبيت وقاعدة البيانات...
:: فحص صلاحيات المجلد: إذا كانت صلاحيات المسؤول متوفرة نثبت في C:\CheeseFactory وإلا نثبت في مجلد المستخدم المحلي
set "INSTALL_DIR=C:\\CheeseFactory"
mkdir "%INSTALL_DIR%" >nul 2>&1
if not exist "%INSTALL_DIR%" (
    set "INSTALL_DIR=%LOCALAPPDATA%\\CheeseFactory"
    mkdir "%INSTALL_DIR%" >nul 2>&1
)

:: إذا تم التشغيل من فلاشة أو مجلد مخصص
if exist "%~dp0database" (
    echo تم اكتشاف مجلد الفلاشة الحالي: %~dp0
)

if not exist "%INSTALL_DIR%\\database" mkdir "%INSTALL_DIR%\\database"
if not exist "%INSTALL_DIR%\\backups" mkdir "%INSTALL_DIR%\\backups"
echo   - تم إنشاء مجلد البرنامج: %INSTALL_DIR%
echo   - مكان حفظ قاعدة البيانات: %INSTALL_DIR%\\database\\dairy_database.json

echo.
echo [2/4] جاري نسخ وإنشاء ملفات التشغيل المستقل...
:: إنشاء مشغل التطبيق
(
echo @echo off
echo chcp 65001 ^>nul
echo title نظام مصنع ومعمل الأجبان ^(العملة: شيكل ₪^)
echo if exist "%%ProgramFiles%%\\Google\\Chrome\\Application\\chrome.exe" ^(
echo     start "" "%%ProgramFiles%%\\Google\\Chrome\\Application\\chrome.exe" --app="%INSTALL_DIR%\\index.html"
echo     exit
echo ^)
echo if exist "%%ProgramFiles(x86)%%\\Microsoft\\Edge\\Application\\msedge.exe" ^(
echo     start "" "%%ProgramFiles(x86)%%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%INSTALL_DIR%\\index.html"
echo     exit
echo ^)
echo start "" "%INSTALL_DIR%\\index.html"
echo exit
) > "%INSTALL_DIR%\\تشغيل_المصنع.bat"

:: نسخ ملف الداتابيز المحدث إذا كان موجوداً بجانب ملف السيت أب
if exist "%~dp0dairy_database.json" (
    copy /y "%~dp0dairy_database.json" "%INSTALL_DIR%\\database\\dairy_database.json" >nul
    echo   - تم استيراد ملف قاعدة البيانات بنجاح إلى: %INSTALL_DIR%\\database\\
)
if exist "%~dp0بيانات_المعمل_للفلاشة.json" (
    copy /y "%~dp0بيانات_المعمل_للفلاشة.json" "%INSTALL_DIR%\\database\\dairy_database.json" >nul
    echo   - تم استيراد قاعدة بيانات الفلاشة إلى: %INSTALL_DIR%\\database\\
)
if exist "%~dp0تشغيل_مصنع_الأجبان_المحمول.html" (
    copy /y "%~dp0تشغيل_مصنع_الأجبان_المحمول.html" "%INSTALL_DIR%\\index.html" >nul
)
if exist "%~dp0كشف_حسابات_الزبائن_للفلاشة.html" (
    copy /y "%~dp0كشف_حسابات_الزبائن_للفلاشة.html" "%INSTALL_DIR%\\كشف_حسابات_الزبائن.html" >nul
    echo   - تم استيراد كشف حسابات الزبائن إلى: %INSTALL_DIR%\\
)
if exist "%~dp0اقرأني_دليل_التشغيل_وكلمة_السر.txt" (
    copy /y "%~dp0اقرأني_دليل_التشغيل_وكلمة_السر.txt" "%INSTALL_DIR%\\اقرأني_دليل_التشغيل_وكلمة_السر.txt" >nul
)

echo.
echo [3/4] جاري إنشاء اختصارات البرنامج على سطح المكتب (Desktop Shortcuts)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'مصنع ومعمل الأجبان.lnk')); $s.TargetPath = '%INSTALL_DIR%\\تشغيل_المصنع.bat'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'نظام إدارة مصنع ومعمل الأجبان'; $s.Save()" >nul 2>&1
echo   - تم وضع اختصار "مصنع ومعمل الأجبان" على سطح المكتب بنجاح!

if exist "%INSTALL_DIR%\\كشف_حسابات_الزبائن.html" (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'كشف حسابات الزبائن.lnk')); $s.TargetPath = '%INSTALL_DIR%\\كشف_حسابات_الزبائن.html'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'كشف حسابات الزبائن والمبيعات'; $s.Save()" >nul 2>&1
    echo   - تم وضع اختصار "كشف حسابات الزبائن" على سطح المكتب بنجاح!
)

echo.
echo [4/4] اكتمل التثبيت بنجاح تام!
echo ==============================================================================
echo   مكان قاعدة البيانات (Database Path):
echo   %INSTALL_DIR%\\database\\dairy_database.json
echo.
echo   مكان النسخ الاحتياطية (Backups Path):
echo   %INSTALL_DIR%\\backups\\
echo.
echo   بيانات الدخول والحماية المعتمدة:
echo   اسم المستخدم (Username): ${settings.username || 'admin'}
echo   كلمة المرور (Password): ${settings.password || '123456'}
echo   رمز الدخول السريع (PIN): ${settings.pinCode || '1234'}
echo ==============================================================================
echo.
echo يمكنك الآن فتح البرنامج من سطح المكتب في أي وقت بدون إنترنت.
pause
exit
`;
  };

  // Authentication Handlers
  const login = (user: string, pass: string, remember = false): boolean => {
    const currentUsername = (settings.username || 'admin').trim().toLowerCase();
    const currentPassword = (settings.password || '123456').trim();
    const currentPin = (settings.pinCode || '1234').trim();

    const u = user.trim().toLowerCase();
    const p = pass.trim();

    if (
      (u === currentUsername && p === currentPassword) ||
      (p === currentPassword && (u === '' || u === currentUsername)) ||
      (u === currentPin || p === currentPin)
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem(`${STORAGE_PREFIX}_auth_session`, 'true');
      if (remember) {
        localStorage.setItem(`${STORAGE_PREFIX}_remember_me`, 'true');
      } else {
        localStorage.removeItem(`${STORAGE_PREFIX}_remember_me`);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(`${STORAGE_PREFIX}_auth_session`);
    localStorage.removeItem(`${STORAGE_PREFIX}_remember_me`);
  };

  const lockApp = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(`${STORAGE_PREFIX}_auth_session`);
  };

  const updateCredentials = (
    newUsername: string,
    newPassword: string,
    oldPassword?: string
  ): boolean => {
    if (oldPassword && oldPassword !== (settings.password || '123456')) {
      return false;
    }
    const updated: DairySettings = {
      ...settings,
      username: newUsername.trim() || 'admin',
      password: newPassword.trim() || '123456',
      isPasswordProtected: true,
    };
    setSettings(updated);
    return true;
  };

  const generateReadmeInstructions = (): string => {
    const dateStr = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const user = settings.username || 'admin';
    const pass = settings.password || '123456';
    const pin = settings.pinCode || '1234';
    const workshop = settings.workshopName || 'مصنع ومعمل الألبان والأجبان';
    return `================================================================================
       نظام إدارة معمل ومصنع الأجبان - دليل التشغيل والحماية (العملة: شيكل ₪)
================================================================================
المعمل: ${workshop}
تاريخ الإصدار: ${dateStr}

مرحباً بك! تم تجهيز كافة ملفات هذا المجلد لتكون جاهزة للمستخدم مباشرة على أي كمبيوتر أو فلاشة USB.

1. بيانات تسجيل الدخول الافتراضية وحماية النظام:
--------------------------------------------------------------------------------
• اسم المستخدم (Username): ${user}
• كلمة المرور (Password): ${pass}
• رمز الدخول السريع (PIN Code): ${pin}

(ملاحظة: يمكنك تغيير اسم المستخدم وكلمة المرور في أي وقت من شاشة الإعدادات داخل البرنامج).

2. محتويات المجلد وكافة الملفات المجهزة للتشغيل:
--------------------------------------------------------------------------------
• Setup_CheeseFactory.exe (أو تثبيت_مصنع_الأجبان.exe) :
  برنامج التثبيت التنفيذي المباشر لويندوز (.EXE) - الخيار الأسهل والموصى به للمستخدم العادي!
  يقوم بتثبيت البرنامج تلقائياً بنقرة واحدة، استخراج كامل الملفات وقاعدة البيانات بالشيكل ₪،
  وإنشاء اختصارات سطح المكتب وقائمة ابدأ، دون الحاجة لأي فك ضغط ودون الحاجة لصلاحيات مسؤول.

• تثبيت_مصنع_الأجبان_على_الكمبيوتر.bat :
  ملف التثبيت التلقائي لويندوز - ينشئ المجلد C:\CheeseFactory واختصارات سطح المكتب.

• تشغيل_برنامج_الجبنة_من_الفلاشة.bat :
  ملف التشغيل المباشر من الفلاشة USB دون الحاجة لأي اتصال بالإنترنت.

• فتح_كشف_حسابات_الزبائن.bat :
  أمر تشغيل فوري لكشف حسابات الزبائن مباشرة من الفلاشة.

• تشغيل_صامت_بدون_شاشة_سوداء.vbs :
  لتشغيل البرنامج بهدوء وبدون نافذة الأوامر السوداء.

• autorun.inf :
  ملف التوصيل التلقائي للفلاش ميموري في ويندوز.

• dairy_database.json :
  ملف قاعدة البيانات الحقيقي المفتوح بالشيكل ₪، يحوي كل الجداول والسجلات.

• تشغيل_مصنع_الأجبان_المحمول.html :
  صفحة الويب المحمولة المستقلة الجاهزة للعمل أوفلاين ومحمية بكلمة مرور.

• كشف_حسابات_الزبائن_للفلاشة.html :
  كشف حساب مفصل ومحمي لكافة الزبائن والديون والذمم للمناقشة في محلاتهم بدون إنترنت.

• اقرأني_دليل_التشغيل_وكلمة_السر.txt :
  هذا الملف الإرشادي الموضح لبيانات الدخول وطريقة العمل.

3. مكان قاعدة البيانات (Database Location):
--------------------------------------------------------------------------------
• على الكمبيوتر: C:\CheeseFactory\database\dairy_database.json (أو مجلد %LocalAppData%\CheeseFactory)
• على الفلاشة: [مسار_الفلاشة]\database\dairy_database.json
• التخزين المحلي الآمن: محفوظ تلقائياً في LocalStorage للعمل بدون إنترنت 100%.

4. حقوق التصميم والتطوير والدعم الفني:
--------------------------------------------------------------------------------
هذا البرنامج من تصميم وتطوير: المهندس مالك حريبات
للتواصل والدعم الفني: 0594345464
واتساب: https://wa.me/972594345464
العملة المعتمدة: شيكل ₪
================================================================================
`;
  };

  const downloadWindowsExeInstaller = (): void => {
    const a = document.createElement('a');
    a.href = '/Setup_CheeseFactory.exe';
    a.download = 'Setup_CheeseFactory.exe';
    a.click();
  };

  const downloadCompleteFactoryZip = async (): Promise<void> => {
    // 1. تنزيل حزمة المجلد الكاملة المجهزة مسبقاً بما فيها EXE وجميع ملفات التثبيت
    try {
      const prebuiltRes = await fetch('/حزمة_مصنع_الأجبان_المكتبي_والفلاشة_كاملة.zip');
      if (prebuiltRes.ok) {
        const prebuiltBlob = await prebuiltRes.blob();
        const url = URL.createObjectURL(prebuiltBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `حزمة_مصنع_الأجبان_المكتبي_والفلاشة_كاملة.zip`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.warn('Fallback to dynamic zip creation:', err);
    }

    const zip = new JSZip();
    
    // Add executable installer directly into the zip
    try {
      const exeRes = await fetch('/Setup_CheeseFactory.exe');
      if (exeRes.ok) {
        const exeBlob = await exeRes.blob();
        zip.file('Setup_CheeseFactory.exe', exeBlob);
        zip.file('تثبيت_مصنع_الأجبان.exe', exeBlob);
      }
    } catch (e) {
      console.warn('Could not bundle EXE into ZIP:', e);
    }

    // Add all distribution files into the zip
    zip.file('تثبيت_مصنع_الأجبان_على_الكمبيوتر.bat', generateWindowsInstallerScript());
    zip.file('تشغيل_برنامج_الجبنة_من_الفلاشة.bat', generateUsbBatchFile());
    zip.file('فتح_كشف_حسابات_الزبائن.bat', `@echo off\r\nchcp 65001 >nul\r\ntitle كشف حسابات كافة الزبائن للفلاشة USB\r\necho جاري فتح كشف حسابات الزبائن...\r\nstart "" "%~dp0كشف_حسابات_الزبائن_للفلاشة.html"\r\nexit\r\n`);
    zip.file('تشغيل_صامت_بدون_شاشة_سوداء.vbs', generateUsbVbsFile());
    zip.file('autorun.inf', generateUsbAutorunFile());
    zip.file('dairy_database.json', exportBackup());
    zip.file('تشغيل_مصنع_الأجبان_المحمول.html', generatePortableHtmlApp());
    zip.file('كشف_حسابات_الزبائن_للفلاشة.html', generateCustomerStatementsUsbHtml());
    zip.file('اقرأني_دليل_التشغيل_وكلمة_السر.txt', generateReadmeInstructions());

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `حزمة_مصنع_الأجبان_المكتبي_والفلاشة_كاملة.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DairyContext.Provider
      value={{
        suppliers,
        milkSupplies,
        productions,
        salesInvoices,
        settings,
        snapshots,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addMilkSupply,
        deleteMilkSupply,
        addProduction,
        deleteProduction,
        addSaleInvoice,
        deleteSaleInvoice,
        updateSettings,
        getSupplierStatement,
        getAllSupplierStatements,
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
        getCustomerStatement,
        getAllCustomerStatements,
        exportCustomerStatementsCSV,
        generateCustomerStatementsUsbHtml,
        isAuthenticated,
        login,
        logout,
        lockApp,
        updateCredentials,
        generateReadmeInstructions,
        downloadCompleteFactoryZip,
        downloadWindowsExeInstaller,
      }}
    >
      {children}
    </DairyContext.Provider>
  );
};

export const useDairy = () => {
  const context = useContext(DairyContext);
  if (!context) {
    throw new Error('useDairy must be used within DairyProvider');
  }
  return context;
};
