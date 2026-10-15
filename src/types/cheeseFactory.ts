export type CheeseType =
  | 'حلوم بلدي'
  | 'موزاريلا قوالب'
  | 'موزاريلا مبشورة'
  | 'عكاوي تشيكي'
  | 'فيتا بيضاء أصلية'
  | 'شيدر إنجليزي معتق'
  | 'قشقوان بلدي'
  | 'نابلسية مغلية بالمستكة'
  | 'جبنة قريش/ريكوتا'
  | 'دبل كريم غنية'
  | 'براميلي معتقة';

export type ProductionStage =
  | 'milk_reception'
  | 'pasteurization'
  | 'coagulation'
  | 'cutting_cooking'
  | 'draining'
  | 'pressing'
  | 'salting'
  | 'aging'
  | 'completed'
  | 'cancelled';

export interface StageDefinition {
  id: ProductionStage;
  stepNumber: number;
  arabicName: string;
  description: string;
  icon: string;
}

export interface MilkReceptionData {
  milkType: 'بقري كامل الدسم' | 'غنم طازج' | 'ماعز طازج' | 'خليط بقري وغنم';
  rawMilkLiters: number;
  fatPercentage: number; // e.g. 3.8%
  proteinPercentage?: number; // e.g. 3.2%
  acidityPH: number; // e.g. 6.6
  density: number; // e.g. 1.031
  temperatureC: number; // e.g. 4.5°C
  antibioticTest: 'سليم (سلبي)' | 'مشتبه به' | 'مرفوض';
  supplierName: string;
  receptionTime: string;
  notes?: string;
}

export interface PasteurizationData {
  method: 'بسترة بطيئة (LTLT) 65°C / 30min' | 'بسترة سريعة (HTST) 72°C / 15s' | 'حرارة منخفضة مخصصة';
  temperatureC: number;
  durationMinutes: number;
  coolingTempC: number; // Target temperature for renneting, e.g. 33-35°C
  machineId: string;
  operatorName: string;
  completedAt?: string;
}

export interface CoagulationData {
  starterCulture: string; // e.g. بكتيريا ميزوفيليك CHR Hansen
  starterGrams: number;
  rennetType: 'منفحة ميكروبية سائلة' | 'منفحة عجل طبيعية' | 'منفحة حبيبات مركزة';
  rennetAmountMl: number;
  calciumChlorideGrams?: number;
  settingTempC: number;
  coagulationDurationMinutes: number; // e.g. 40 mins
  curdFirmness: 'صلبة ممتازة' | 'متوسطة' | 'طرية';
  completedAt?: string;
}

export interface CuttingCookingData {
  curdSizeMm: number; // e.g. 8mm, 12mm
  cookingTempC: number; // e.g. 38°C
  stirringDurationMinutes: number;
  scaldingMethod: 'تسخين تدريجي' | 'غلي مباشر في المصل (حلوم)';
  completedAt?: string;
}

export interface DrainingData {
  wheyExtractedLiters: number;
  wheyPH: number;
  wheyUtilization: 'تحويل لجبن ريكوتا/قريش' | 'تصريف للمزارع' | 'استخلاص مصل مجفف';
  completedAt?: string;
}

export interface PressingData {
  moldsCount: number;
  moldShape: 'قوالب بلوك مستطيلة' | 'أقراص دائرية' | 'قوالب صغيرة';
  pressureBar: number;
  pressingDurationHours: number;
  finalCurdWeightBeforeBrineKg: number;
  completedAt?: string;
}

export interface SaltingData {
  method: 'حوض محلول ملحي (Brine)' | 'تمليح جاف سطحي (Dry Salting)' | 'غلي بماء ملحي مع الحبة السوداء';
  brineConcentrationPercent: number; // e.g. 18% - 22%
  brineTempC: number; // e.g. 12°C
  brineDurationHours: number;
  completedAt?: string;
}

export interface AgingData {
  chamberId: string; // e.g. "غرفة إنضاج A1"
  temperatureC: number; // e.g. 11°C
  humidityPercent: number; // e.g. 85%
  targetDurationDays: number;
  currentDay: number;
  turningSchedule: 'يومي' | 'كل يومين' | 'أسبوعي';
  startDate: string;
  expectedEndDate: string;
  completedAt?: string;
}

export interface FinalPackagingData {
  finalWeightKg: number;
  unitsCount: number;
  packageType: 'أكياس تفريغ هواء (فاكيوم)' | 'أوعية محلول ملحي محكمة' | 'قصدير معدني 5 كغ' | 'تغليف شمعي أحمر';
  storageRoom: string;
  productionDate: string;
  expiryDate: string;
  qualityGrade: 'درجة أولى (نخب أول)' | 'درجة ثانية' | 'مطابق للمواصفة القياسية';
  barcode: string;
  yieldEfficiencyPercent: number; // (finalWeightKg / rawMilkLiters) * 100
  notes?: string;
  completedAt?: string;
}

export interface ProductionBatch {
  id: string; // e.g. "BATCH-2026-108"
  batchNumber: string;
  cheeseType: CheeseType;
  status: ProductionStage;
  currentStageIndex: number;
  supervisor: string;
  shift: 'صباحية' | 'مسائية' | 'ليلية';
  startDate: string;
  targetWeightKg: number;
  notes?: string;

  // Detailed stage logs
  milkReception: MilkReceptionData;
  pasteurization?: PasteurizationData;
  coagulation?: CoagulationData;
  cuttingCooking?: CuttingCookingData;
  draining?: DrainingData;
  pressing?: PressingData;
  salting?: SaltingData;
  aging?: AgingData;
  finalPackaging?: FinalPackagingData;
}

export interface RawMaterial {
  id: string;
  name: string;
  category: 'حليب خام' | 'منفحة ومخثرات' | 'بوادئ وبكتيريا' | 'أملاح ومواد مساعدة' | 'مواد تعبئة وتغليف';
  currentStock: number;
  unit: 'لتر' | 'كغ' | 'غرام' | 'علبة' | 'كيس';
  minThreshold: number;
  costPerUnit: number;
  supplier: string;
  lotNumber: string;
  expiryDate?: string;
  lastUpdated: string;
}

export interface FinishedProduct {
  id: string;
  name: string;
  cheeseType: CheeseType;
  batchNumber: string;
  currentStockKg: number;
  costPricePerKg: number;
  sellingPricePerKg: number;
  packagingUnit: string; // e.g. "قالب 1 كغ", "سطل 5 كغ", "كيس 500 غ"
  productionDate: string;
  expiryDate: string;
  storageLocation: string; // e.g. "براد الحفظ رقم 2 (حرارة 4°C)"
  minAlertKg: number;
  barcode: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  quantityKg: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-089"
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  clientTaxNumber?: string;
  issueDate: string;
  dueDate: string;
  paymentMethod: 'نقدي (كاش)' | 'آجل (ذمم)' | 'تحويل بنكي' | 'شيك بنكي';
  paymentStatus: 'مدفوعة بالكامل' | 'معلقة (آجل)' | 'مدفوعة جزئياً';
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxPercent: number; // e.g. 5 or 15 or 0
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  salesRepresentative: string;
}

export interface Client {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  address: string;
  taxNumber?: string;
  creditLimit: number;
  outstandingBalance: number;
  totalPurchases: number;
  category: 'سوبرماركت وهايبرماركت' | 'مطاعم وفنادق' | 'موزع جملة' | 'محل تجزئة';
}

export interface Supplier {
  id: string;
  name: string;
  farmName: string;
  phone: string;
  location: string;
  milkTypeSupplied: string;
  dailyCapacityLiters: number;
  pricePerLiter: number;
  qualityRating: number; // 1-5
}

export interface FactorySettings {
  factoryName: string;
  subTitle: string;
  commercialRegistration: string;
  taxNumber: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  defaultTaxPercent: number;
  defaultSupervisor: string;
  logoUrl?: string;
  footerNotes: string;
}
