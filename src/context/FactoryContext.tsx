import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ProductionBatch,
  RawMaterial,
  FinishedProduct,
  Invoice,
  Client,
  Supplier,
  FactorySettings,
  ProductionStage,
} from '../types/cheeseFactory';
import {
  INITIAL_PRODUCTION_BATCHES,
  INITIAL_RAW_MATERIALS,
  INITIAL_FINISHED_PRODUCTS,
  INITIAL_INVOICES,
  INITIAL_CLIENTS,
  INITIAL_SUPPLIERS,
  INITIAL_FACTORY_SETTINGS,
  PRODUCTION_STAGES,
} from '../data/initialData';

interface FactoryContextType {
  batches: ProductionBatch[];
  rawMaterials: RawMaterial[];
  finishedProducts: FinishedProduct[];
  invoices: Invoice[];
  clients: Client[];
  suppliers: Supplier[];
  settings: FactorySettings;

  // Batch actions
  createBatch: (newBatch: Omit<ProductionBatch, 'id' | 'currentStageIndex' | 'status'>) => ProductionBatch;
  advanceBatchStage: (batchId: string, stagePayload: any) => void;
  updateBatch: (batch: ProductionBatch) => void;
  deleteBatch: (batchId: string) => void;

  // Inventory actions
  addRawMaterial: (material: Omit<RawMaterial, 'id' | 'lastUpdated'>) => void;
  updateRawMaterial: (material: RawMaterial) => void;
  deleteRawMaterial: (id: string) => void;
  adjustRawStock: (id: string, newStock: number) => void;

  addFinishedProduct: (product: Omit<FinishedProduct, 'id'>) => void;
  updateFinishedProduct: (product: FinishedProduct) => void;
  deleteFinishedProduct: (id: string) => void;
  adjustProductStock: (id: string, deltaKg: number) => void;

  // Invoicing
  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;

  // Partners
  addClient: (client: Omit<Client, 'id' | 'totalPurchases' | 'outstandingBalance'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;

  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;

  // Settings & System
  updateSettings: (newSettings: FactorySettings) => void;
  exportDatabase: () => string;
  importDatabase: (jsonStr: string) => boolean;
  resetDatabase: () => void;
}

const LOCAL_STORAGE_KEY = 'cheese_factory_erp_state_v1';

const FactoryContext = createContext<FactoryContextType | undefined>(undefined);

export const FactoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [batches, setBatches] = useState<ProductionBatch[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_batches`);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTION_BATCHES;
    } catch {
      return INITIAL_PRODUCTION_BATCHES;
    }
  });

  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_raw`);
      return saved ? JSON.parse(saved) : INITIAL_RAW_MATERIALS;
    } catch {
      return INITIAL_RAW_MATERIALS;
    }
  });

  const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_products`);
      return saved ? JSON.parse(saved) : INITIAL_FINISHED_PRODUCTS;
    } catch {
      return INITIAL_FINISHED_PRODUCTS;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_invoices`);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_clients`);
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_suppliers`);
      return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [settings, setSettings] = useState<FactorySettings>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_settings`);
      return saved ? JSON.parse(saved) : INITIAL_FACTORY_SETTINGS;
    } catch {
      return INITIAL_FACTORY_SETTINGS;
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_batches`, JSON.stringify(batches));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [batches]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_raw`, JSON.stringify(rawMaterials));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [rawMaterials]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(finishedProducts));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [finishedProducts]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_invoices`, JSON.stringify(invoices));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(clients));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [settings]);

  // Batch actions
  const createBatch = (newBatchData: Omit<ProductionBatch, 'id' | 'currentStageIndex' | 'status'>): ProductionBatch => {
    const id = `BATCH-${new Date().getFullYear()}-${String(batches.length + 105).padStart(3, '0')}`;
    const newBatch: ProductionBatch = {
      ...newBatchData,
      id,
      currentStageIndex: 0,
      status: 'milk_reception',
    };

    // Deduct raw milk from inventory if found
    const milkQty = newBatch.milkReception.rawMilkLiters;
    setRawMaterials((prev) =>
      prev.map((item) => {
        if (item.category === 'حليب خام' && item.currentStock >= milkQty) {
          // Check matching type
          const isMatching =
            (newBatch.milkReception.milkType.includes('بقري') && item.name.includes('أبقار')) ||
            (newBatch.milkReception.milkType.includes('غنم') && item.name.includes('أغنام')) ||
            (newBatch.milkReception.milkType.includes('ماعز') && item.name.includes('ماعز'));
          if (isMatching) {
            return {
              ...item,
              currentStock: Math.max(0, item.currentStock - milkQty),
              lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
            };
          }
        }
        return item;
      })
    );

    setBatches((prev) => [newBatch, ...prev]);
    return newBatch;
  };

  const advanceBatchStage = (batchId: string, stagePayload: any) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;

        const nextIndex = b.currentStageIndex + 1;
        const nextStageDef = PRODUCTION_STAGES[nextIndex];
        const nextStatus = nextStageDef ? nextStageDef.id : 'completed';

        const updated: ProductionBatch = {
          ...b,
          currentStageIndex: Math.min(nextIndex, PRODUCTION_STAGES.length - 1),
          status: nextStatus,
        };

        // Merge stage payload depending on the stage being completed/advanced
        if (b.status === 'milk_reception' && stagePayload.pasteurization) {
          updated.pasteurization = stagePayload.pasteurization;
        } else if (b.status === 'pasteurization' && stagePayload.coagulation) {
          updated.coagulation = stagePayload.coagulation;
        } else if (b.status === 'coagulation' && stagePayload.cuttingCooking) {
          updated.cuttingCooking = stagePayload.cuttingCooking;
        } else if (b.status === 'cutting_cooking' && stagePayload.draining) {
          updated.draining = stagePayload.draining;
        } else if (b.status === 'draining' && stagePayload.pressing) {
          updated.pressing = stagePayload.pressing;
        } else if (b.status === 'pressing' && stagePayload.salting) {
          updated.salting = stagePayload.salting;
        } else if (b.status === 'salting' && stagePayload.aging) {
          updated.aging = stagePayload.aging;
        } else if (b.status === 'aging' && stagePayload.finalPackaging) {
          updated.finalPackaging = stagePayload.finalPackaging;
          updated.status = 'completed';

          // Automatically push to Finished Products Inventory!
          const finalPkg = stagePayload.finalPackaging;
          const newFinishedProd: FinishedProduct = {
            id: `PRD-${Date.now().toString().slice(-4)}`,
            name: `جبنة ${b.cheeseType} - تشغيلة ${b.batchNumber}`,
            cheeseType: b.cheeseType,
            batchNumber: b.batchNumber,
            currentStockKg: finalPkg.finalWeightKg,
            costPricePerKg: Math.round(((b.milkReception.rawMilkLiters * 2.5) / (finalPkg.finalWeightKg || 1)) * 10) / 10,
            sellingPricePerKg: 36.0,
            packagingUnit: finalPkg.packageType || 'قالب فاكيوم 1 كغ',
            productionDate: finalPkg.productionDate || new Date().toISOString().slice(0, 10),
            expiryDate: finalPkg.expiryDate || '2027-04-01',
            storageLocation: finalPkg.storageRoom || 'براد المستودع الرئيسي R-1',
            minAlertKg: 20,
            barcode: finalPkg.barcode || `628100${Math.floor(1000000 + Math.random() * 9000000)}`,
          };

          setFinishedProducts((prodPrev) => [newFinishedProd, ...prodPrev]);
        }

        return updated;
      })
    );
  };

  const updateBatch = (batch: ProductionBatch) => {
    setBatches((prev) => prev.map((b) => (b.id === batch.id ? batch : b)));
  };

  const deleteBatch = (batchId: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
  };

  // Raw Materials
  const addRawMaterial = (material: Omit<RawMaterial, 'id' | 'lastUpdated'>) => {
    const id = `RAW-${String(rawMaterials.length + 10).padStart(3, '0')}`;
    const newMat: RawMaterial = {
      ...material,
      id,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setRawMaterials((prev) => [newMat, ...prev]);
  };

  const updateRawMaterial = (material: RawMaterial) => {
    setRawMaterials((prev) =>
      prev.map((m) =>
        m.id === material.id
          ? { ...material, lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16) }
          : m
      )
    );
  };

  const deleteRawMaterial = (id: string) => {
    setRawMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const adjustRawStock = (id: string, newStock: number) => {
    setRawMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, currentStock: Math.max(0, newStock), lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16) }
          : m
      )
    );
  };

  // Finished Products
  const addFinishedProduct = (product: Omit<FinishedProduct, 'id'>) => {
    const id = `PRD-${String(finishedProducts.length + 10).padStart(3, '0')}`;
    setFinishedProducts((prev) => [{ ...product, id }, ...prev]);
  };

  const updateFinishedProduct = (product: FinishedProduct) => {
    setFinishedProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  };

  const deleteFinishedProduct = (id: string) => {
    setFinishedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustProductStock = (id: string, deltaKg: number) => {
    setFinishedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, currentStockKg: Math.max(0, p.currentStockKg + deltaKg) } : p))
    );
  };

  // Invoicing
  const createInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const num = `INV-${new Date().getFullYear().toString().slice(-2)}${String(invoices.length + 104).padStart(4, '0')}`;
    const id = `INV-${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id,
      invoiceNumber: num,
    };

    // Auto deduct inventory items
    setFinishedProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const itemSold = newInvoice.items.find((item) => item.productId === prod.id);
        if (itemSold) {
          return {
            ...prod,
            currentStockKg: Math.max(0, Math.round((prod.currentStockKg - itemSold.quantityKg) * 100) / 100),
          };
        }
        return prod;
      })
    );

    // Update client balance if client exists
    setClients((prevClients) =>
      prevClients.map((c) => {
        if (c.name.trim().toLowerCase() === newInvoice.clientName.trim().toLowerCase()) {
          return {
            ...c,
            totalPurchases: c.totalPurchases + newInvoice.grandTotal,
            outstandingBalance: c.outstandingBalance + newInvoice.remainingAmount,
          };
        }
        return c;
      })
    );

    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = (invoice: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === invoice.id ? invoice : inv)));
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  // Partners
  const addClient = (client: Omit<Client, 'id' | 'totalPurchases' | 'outstandingBalance'>) => {
    const id = `CLI-${String(clients.length + 10).padStart(3, '0')}`;
    setClients((prev) => [{ ...client, id, totalPurchases: 0, outstandingBalance: 0 }, ...prev]);
  };

  const updateClient = (client: Client) => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const id = `SUP-${String(suppliers.length + 10).padStart(3, '0')}`;
    setSuppliers((prev) => [{ ...supplier, id }, ...prev]);
  };

  const updateSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === supplier.id ? supplier : s)));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  // Settings & System
  const updateSettings = (newSettings: FactorySettings) => {
    setSettings(newSettings);
  };

  const exportDatabase = () => {
    const state = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      batches,
      rawMaterials,
      finishedProducts,
      invoices,
      clients,
      suppliers,
      settings,
    };
    return JSON.stringify(state, null, 2);
  };

  const importDatabase = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.batches && data.rawMaterials && data.finishedProducts && data.invoices) {
        setBatches(data.batches);
        setRawMaterials(data.rawMaterials);
        setFinishedProducts(data.finishedProducts);
        setInvoices(data.invoices);
        if (data.clients) setClients(data.clients);
        if (data.suppliers) setSuppliers(data.suppliers);
        if (data.settings) setSettings(data.settings);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  };

  const resetDatabase = () => {
    setBatches(INITIAL_PRODUCTION_BATCHES);
    setRawMaterials(INITIAL_RAW_MATERIALS);
    setFinishedProducts(INITIAL_FINISHED_PRODUCTS);
    setInvoices(INITIAL_INVOICES);
    setClients(INITIAL_CLIENTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setSettings(INITIAL_FACTORY_SETTINGS);
    localStorage.clear();
  };

  return (
    <FactoryContext.Provider
      value={{
        batches,
        rawMaterials,
        finishedProducts,
        invoices,
        clients,
        suppliers,
        settings,
        createBatch,
        advanceBatchStage,
        updateBatch,
        deleteBatch,
        addRawMaterial,
        updateRawMaterial,
        deleteRawMaterial,
        adjustRawStock,
        addFinishedProduct,
        updateFinishedProduct,
        deleteFinishedProduct,
        adjustProductStock,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        addClient,
        updateClient,
        deleteClient,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        updateSettings,
        exportDatabase,
        importDatabase,
        resetDatabase,
      }}
    >
      {children}
    </FactoryContext.Provider>
  );
};

export const useFactory = () => {
  const context = useContext(FactoryContext);
  if (!context) {
    throw new Error('useFactory must be used within a FactoryProvider');
  }
  return context;
};
