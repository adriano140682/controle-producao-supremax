
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  weightPerBag: number;
}

export interface Employee {
  id: string;
  name: string;
  sector: 'packaging';
}

export interface ProductionEntry {
  id: string;
  date: string;
  time: string;
  caixa: '01' | '02';
  productId: string;
  quantity: number;
  observations?: string;
  timestamp: number;
}

export interface PackagingEntry {
  id: string;
  date: string;
  employeeId: string;
  quantity: number;
  batchNumber: string;
  productId?: string;
  timestamp: number;
}

export interface Stoppage {
  id: string;
  sector: 'Caixa 01' | 'Caixa 02' | 'Embalagem';
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  reason: string;
  duration?: number;
  timestamp: number;
  isActive: boolean;
}

interface ProductionStore {
  // Data
  products: Product[];
  employees: Employee[];
  productionEntries: ProductionEntry[];
  packagingEntries: PackagingEntry[];
  stoppages: Stoppage[];
  
  // Products
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Employees
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  // Production
  addProductionEntry: (entry: Omit<ProductionEntry, 'id' | 'timestamp'>) => void;
  updateProductionEntry: (id: string, entry: Partial<ProductionEntry>) => void;
  deleteProductionEntry: (id: string) => void;
  
  // Packaging
  addPackagingEntry: (entry: Omit<PackagingEntry, 'id' | 'timestamp'>) => void;
  updatePackagingEntry: (id: string, entry: Partial<PackagingEntry>) => void;
  deletePackagingEntry: (id: string) => void;
  
  // Stoppages
  startStoppage: (stoppage: Omit<Stoppage, 'id' | 'timestamp' | 'isActive'>) => void;
  endStoppage: (id: string) => void;
  deleteStoppage: (id: string) => void;
  
  // Analytics
  getProductionByDate: (date: string) => ProductionEntry[];
  getProductionByHour: (date: string) => { hour: string; caixa01: number; caixa02: number }[];
  getTotalProductionByBox: (date: string) => { caixa01: number; caixa02: number };
  getPackagingByDate: (date: string) => PackagingEntry[];
  getStoppagesByDate: (date: string) => Stoppage[];
  getProductionStatus: () => { caixa01: boolean; caixa02: boolean };
  currentStoppages: () => number;
}

export const useProductionStore = create<ProductionStore>()(
  persist(
    (set, get) => ({
      // Initial data
      products: [
        { id: '1', name: 'Ração Premium', weightPerBag: 30 },
        { id: '2', name: 'Proteinado Bovino', weightPerBag: 25 },
      ],
      employees: [
        { id: '1', name: 'Jeiza Vieira', sector: 'packaging' },
        { id: '2', name: 'Cristina Vargas', sector: 'packaging' },
      ],
      productionEntries: [],
      packagingEntries: [],
      stoppages: [],

      // Products
      addProduct: (product) => {
        const newProduct = { ...product, id: Date.now().toString() };
        set((state) => ({ products: [...state.products, newProduct] }));
      },
      
      updateProduct: (id, product) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...product } : p)),
        }));
      },
      
      deleteProduct: (id) => {
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
      },

      // Employees
      addEmployee: (employee) => {
        const newEmployee = { ...employee, id: Date.now().toString() };
        set((state) => ({ employees: [...state.employees, newEmployee] }));
      },
      
      updateEmployee: (id, employee) => {
        set((state) => ({
          employees: state.employees.map((e) => (e.id === id ? { ...e, ...employee } : e)),
        }));
      },
      
      deleteEmployee: (id) => {
        set((state) => ({ employees: state.employees.filter((e) => e.id !== id) }));
      },

      // Production
      addProductionEntry: (entry) => {
        const newEntry = { 
          ...entry, 
          id: Date.now().toString(),
          timestamp: Date.now()
        };
        set((state) => ({ 
          productionEntries: [...state.productionEntries, newEntry] 
        }));
      },
      
      updateProductionEntry: (id, entry) => {
        set((state) => ({
          productionEntries: state.productionEntries.map((e) => 
            e.id === id ? { ...e, ...entry } : e
          ),
        }));
      },
      
      deleteProductionEntry: (id) => {
        set((state) => ({ 
          productionEntries: state.productionEntries.filter((e) => e.id !== id) 
        }));
      },

      // Packaging
      addPackagingEntry: (entry) => {
        const newEntry = { 
          ...entry, 
          id: Date.now().toString(),
          timestamp: Date.now()
        };
        set((state) => ({ 
          packagingEntries: [...state.packagingEntries, newEntry] 
        }));
      },
      
      updatePackagingEntry: (id, entry) => {
        set((state) => ({
          packagingEntries: state.packagingEntries.map((e) => 
            e.id === id ? { ...e, ...entry } : e
          ),
        }));
      },
      
      deletePackagingEntry: (id) => {
        set((state) => ({ 
          packagingEntries: state.packagingEntries.filter((e) => e.id !== id) 
        }));
      },

      // Stoppages
      startStoppage: (stoppage) => {
        const newStoppage = { 
          ...stoppage, 
          id: Date.now().toString(),
          timestamp: Date.now(),
          isActive: true
        };
        set((state) => ({ 
          stoppages: [...state.stoppages, newStoppage] 
        }));
      },
      
      endStoppage: (id) => {
        const now = new Date();
        set((state) => ({
          stoppages: state.stoppages.map((s) => {
            if (s.id === id && s.isActive) {
              const startDateTime = new Date(`${s.startDate} ${s.startTime}`);
              const duration = now.getTime() - startDateTime.getTime();
              return {
                ...s,
                endDate: now.toISOString().split('T')[0],
                endTime: now.toTimeString().split(' ')[0].slice(0, 5),
                duration,
                isActive: false
              };
            }
            return s;
          }),
        }));
      },
      
      deleteStoppage: (id) => {
        set((state) => ({ 
          stoppages: state.stoppages.filter((s) => s.id !== id) 
        }));
      },

      // Analytics
      getProductionByDate: (date) => {
        return get().productionEntries.filter((entry) => entry.date === date);
      },
      
      getProductionByHour: (date) => {
        const entries = get().getProductionByDate(date);
        const hourlyData: { [key: string]: { caixa01: number; caixa02: number } } = {};
        
        entries.forEach((entry) => {
          const hour = entry.time.split(':')[0] + ':00';
          if (!hourlyData[hour]) {
            hourlyData[hour] = { caixa01: 0, caixa02: 0 };
          }
          
          if (entry.caixa === '01') {
            hourlyData[hour].caixa01 += entry.quantity;
          } else {
            hourlyData[hour].caixa02 += entry.quantity;
          }
        });
        
        return Object.entries(hourlyData).map(([hour, data]) => ({
          hour,
          ...data,
        }));
      },
      
      getTotalProductionByBox: (date) => {
        const entries = get().getProductionByDate(date);
        return entries.reduce(
          (acc, entry) => {
            if (entry.caixa === '01') {
              acc.caixa01 += entry.quantity;
            } else {
              acc.caixa02 += entry.quantity;
            }
            return acc;
          },
          { caixa01: 0, caixa02: 0 }
        );
      },
      
      getPackagingByDate: (date) => {
        return get().packagingEntries.filter((entry) => entry.date === date);
      },
      
      getStoppagesByDate: (date) => {
        return get().stoppages.filter((stoppage) => stoppage.startDate === date);
      },
      
      getProductionStatus: () => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentHour = now.getHours();
        
        // Check if there are recent entries (within last 2 hours)
        const recentEntries = get().productionEntries.filter((entry) => {
          const entryTime = new Date(`${entry.date} ${entry.time}`);
          const diffHours = (now.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
          return diffHours <= 2;
        });
        
        const caixa01Active = recentEntries.some((entry) => entry.caixa === '01');
        const caixa02Active = recentEntries.some((entry) => entry.caixa === '02');
        
        return { caixa01: caixa01Active, caixa02: caixa02Active };
      },
      
      currentStoppages: () => {
        return get().stoppages.filter((stoppage) => stoppage.isActive).length;
      },
    }),
    {
      name: 'production-storage',
    }
  )
);
