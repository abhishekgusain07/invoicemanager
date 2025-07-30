import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { decompressFromEncodedURIComponent } from 'lz-string';
import {
  invoiceGenerationSchema,
  type InvoiceGenerationData,
  PDF_DATA_LOCAL_STORAGE_KEY,
} from '@/lib/validations/invoice-generation';
import { INITIAL_INVOICE_DATA, EMPTY_INVOICE_DATA } from '../app/(dashboard)/generateinvoice/constants';

interface InvoiceStore {
  // State
  invoiceData: InvoiceGenerationData | null;
  isLoading: boolean;
  canShareInvoice: boolean;
  currentInvoiceId: string | undefined;
  isInitialized: boolean;

  // Actions
  setInvoiceData: (data: InvoiceGenerationData) => void;
  setCanShareInvoice: (canShare: boolean) => void;
  setCurrentInvoiceId: (id: string | undefined) => void;
  loadFromUrlParams: (compressedData: string) => Promise<boolean>;
  loadFromLocalStorage: () => void;
  clearInvoice: () => void;
  initializeStore: (urlParams?: string) => Promise<void>;
  handleInvoiceSaved: (invoiceId: string) => void;
  handleLoadInvoice: (invoiceData: InvoiceGenerationData, invoiceId: string) => void;
}

export const useInvoiceStore = create<InvoiceStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        invoiceData: null,
        isLoading: true,
        canShareInvoice: true,
        currentInvoiceId: undefined,
        isInitialized: false,

        // Actions
        setInvoiceData: (data: InvoiceGenerationData) => {
          set({ invoiceData: data });
          
          // Auto-save to localStorage with validation
          try {
            const validationResult = invoiceGenerationSchema.safeParse(data);
            if (validationResult.success) {
              localStorage.setItem(
                PDF_DATA_LOCAL_STORAGE_KEY,
                JSON.stringify(validationResult.data)
              );
            } else {
              // Save raw data without validation - user might be typing
              // Only log validation errors in development
              if (process.env.NODE_ENV === 'development') {
                console.warn('Saving unvalidated invoice data:', validationResult.error);
              }
              localStorage.setItem(
                PDF_DATA_LOCAL_STORAGE_KEY,
                JSON.stringify(data)
              );
            }
          } catch (error) {
            console.error('Failed to save invoice data to localStorage:', error);
            // Don't show toast here as this would be too noisy during typing
          }
        },

        setCanShareInvoice: (canShare: boolean) => {
          set({ canShareInvoice: canShare });
        },

        setCurrentInvoiceId: (id: string | undefined) => {
          set({ currentInvoiceId: id });
        },

        loadFromUrlParams: async (compressedData: string): Promise<boolean> => {
          try {
            const decompressed = decompressFromEncodedURIComponent(compressedData);
            const parsedJSON: unknown = JSON.parse(decompressed);
            const validated = invoiceGenerationSchema.parse(parsedJSON);
            
            set({ 
              invoiceData: validated, 
              isLoading: false,
              isInitialized: true 
            });

            toast.info('Invoice loaded from shared link!', {
              description: 'You can now edit and customize this invoice',
            });
            
            return true;
          } catch (error) {
            console.error('Failed to parse URL data:', error);
            toast.error('Failed to load shared invoice data', {
              description: 'Loading default invoice instead',
            });
            return false;
          }
        },

        loadFromLocalStorage: () => {
          try {
            const savedData = localStorage.getItem(PDF_DATA_LOCAL_STORAGE_KEY);
            if (savedData) {
              const json: unknown = JSON.parse(savedData);
              
              // Use safeParse to avoid throwing errors
              const validationResult = invoiceGenerationSchema.safeParse(json);
              
              if (validationResult.success) {
                set({ 
                  invoiceData: validationResult.data, 
                  isLoading: false,
                  isInitialized: true 
                });
              } else {
                // Log validation errors for debugging but don't show toast to user
                console.warn('Saved invoice data failed validation, using defaults:', validationResult.error);
                set({ 
                  invoiceData: INITIAL_INVOICE_DATA, 
                  isLoading: false,
                  isInitialized: true 
                });
              }
            } else {
              // No saved data - use initial data (this is normal, no error)
              set({ 
                invoiceData: INITIAL_INVOICE_DATA, 
                isLoading: false,
                isInitialized: true 
              });
            }
          } catch (error) {
            // Only show error toast for actual parsing/loading failures, not validation issues
            console.error('Failed to load saved invoice data:', error);
            set({ 
              invoiceData: INITIAL_INVOICE_DATA, 
              isLoading: false,
              isInitialized: true 
            });
            
            // Only show toast if there was actual saved data that failed to parse
            const savedData = localStorage.getItem(PDF_DATA_LOCAL_STORAGE_KEY);
            if (savedData) {
              toast.error(
                'Unable to load your saved invoice data. Starting with default values.',
                { duration: 5000 }
              );
            }
          }
        },

        clearInvoice: () => {
          set({ 
            invoiceData: EMPTY_INVOICE_DATA, 
            currentInvoiceId: undefined 
          });
          toast.success('Invoice template cleared', {
            description: 'All fields have been reset to empty values',
          });
        },

        initializeStore: async (urlParams?: string) => {
          set({ isLoading: true });
          
          if (urlParams) {
            const success = await get().loadFromUrlParams(urlParams);
            if (!success) {
              get().loadFromLocalStorage();
            }
          } else {
            get().loadFromLocalStorage();
          }
        },

        handleInvoiceSaved: (invoiceId: string) => {
          set({ currentInvoiceId: invoiceId });
        },

        handleLoadInvoice: (invoiceData: InvoiceGenerationData, invoiceId: string) => {
          set({ 
            invoiceData, 
            currentInvoiceId: invoiceId,
            isInitialized: true 
          });
        },

        // Debug helper function to reset localStorage
        resetLocalStorage: () => {
          try {
            localStorage.removeItem(PDF_DATA_LOCAL_STORAGE_KEY);
            set({ 
              invoiceData: INITIAL_INVOICE_DATA, 
              currentInvoiceId: undefined,
              isInitialized: true 
            });
            toast.success('LocalStorage cleared successfully');
          } catch (error) {
            console.error('Failed to clear localStorage:', error);
            toast.error('Failed to clear localStorage');
          }
        },
      }),
      {
        name: 'invoice-store',
        // Only persist specific parts of the state
        partialize: (state) => ({
          currentInvoiceId: state.currentInvoiceId,
        }),
      }
    ),
    {
      name: 'invoice-store',
    }
  )
);

// Utility hook for subscribing to specific parts of the store
export const useInvoiceData = () => useInvoiceStore((state) => state.invoiceData);
export const useIsLoading = () => useInvoiceStore((state) => state.isLoading);
export const useCanShareInvoice = () => useInvoiceStore((state) => state.canShareInvoice);
export const useCurrentInvoiceId = () => useInvoiceStore((state) => state.currentInvoiceId);
export const useIsInitialized = () => useInvoiceStore((state) => state.isInitialized);

// Action hooks for cleaner component usage
export const useInvoiceActions = () => {
  const store = useInvoiceStore();
  return {
    setInvoiceData: store.setInvoiceData,
    setCanShareInvoice: store.setCanShareInvoice,
    setCurrentInvoiceId: store.setCurrentInvoiceId,
    clearInvoice: store.clearInvoice,
    initializeStore: store.initializeStore,
    handleInvoiceSaved: store.handleInvoiceSaved,
    handleLoadInvoice: store.handleLoadInvoice,
  };
};