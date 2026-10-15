export interface Supplier {
  id: string;
  name: string;
  phone: string;
  location?: string;
  pricePerLiterDefault?: number;
  initialBalance: number; // الرصيد الافتتاحي: موجب = علينا له، سالب = لنا عليه
  notes?: string;
}

export interface ChequeDetails {
  chequeHolderName: string; // اسم صاحب الشيك
  chequeNumber: string; // رقم الشيك
  chequeDate: string; // تاريخ استحقاق الشيك
  bankName: string; // اسم البنك المسحوب عليه
  amount: number; // قيمة الشيك
}

export interface MilkSupplyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  supplierId: string;
  supplierName: string;
  quantityLiters: number; // كمية الحليب باللتر
  pricePerLiter: number; // سعر اللتر
  totalAmount: number; // المجموع = الكمية * السعر
  paymentType: 'نقداً' | 'شيك' | 'نقداً وشيك' | 'آجل (ذمة)';
  paidCash: number; // المدفوع نقداً
  paidCheque: number; // المدفوع بشيك
  totalPaid: number; // إجمالي المدفوع
  chequeDetails?: ChequeDetails;
  balanceRemaining: number; // الباقي الصافي للحركة
  balanceType: 'لنا' | 'علينا' | 'خالص'; // هل الباقي لنا أم علينا
  notes?: string;
}

export interface CheeseProductionEntry {
  id: string;
  date: string; // YYYY-MM-DD
  supplierId: string; // مصدر الحليب
  supplierName: string;
  milkUsedLiters: number; // كمية الحليب باللتر
  cheeseProducedKg: number; // مجموع الإنتاج اليومي للجبنة بالكيلو غرام
  yieldPercentage: number; // نسبة الجبنة للحليب = (الجبنة / الحليب) * 100
  litersPerKgCheese: number; // كم لتر حليب يلزم لإنتاج 1 كغ جبنة
  cheeseType: string; // نوع الجبنة (بلدي، حلوم، عكاوي، بيضاء، إلخ)
  notes?: string;
}

export interface InvoiceItemLine {
  cheeseType: string;
  quantityKg: number;
  pricePerKg: number;
  total: number;
}

export interface CheeseSaleInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  cheeseType: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  paymentMethod: 'نقداً' | 'شيك' | 'آجل' | 'تحويل بنكي';
  paidAmount: number;
  remainingAmount: number;
  items?: InvoiceItemLine[];
  notes?: string;
}

export interface DairySettings {
  workshopName: string;
  phone: string;
  address: string;
  currency: string;
  defaultMilkPrice: number;
  defaultCheesePrice: number;
  username?: string;
  password?: string;
  pinCode?: string;
  isPasswordProtected?: boolean;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  label: string;
  suppliersCount: number;
  suppliesCount: number;
  productionsCount: number;
  invoicesCount: number;
  dataJson: string;
}

export interface CustomerStatement {
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  invoicesCount: number;
  totalKg: number;
  totalAmount: number;
  totalPaid: number;
  remainingBalance: number; // الرصيد المتبقي بذمة الزبون بالشيكل
  status: 'مدين' | 'مسدد بالكامل';
  invoices: CheeseSaleInvoice[];
}
