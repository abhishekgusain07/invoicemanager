// Import types from the validation schema
import type {
  SupportedCurrencies,
  CurrencySymbols,
  CurrencyLabels,
  SupportedTemplates,
  TemplateLabels,
  SupportedLanguages,
  SupportedDateFormat,
  InvoiceGenerationItemData,
  InvoiceGenerationSellerData,
  InvoiceGenerationBuyerData,
  InvoiceGenerationData,
  AccordionGenerationState,
} from "@/lib/validations/invoice-generation";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type NonReadonly<T> = {
  -readonly [P in keyof T]: T[P] extends object ? NonReadonly<T[P]> : T[P];
};

// Re-export types from the validation schema
export type {
  SupportedCurrencies,
  CurrencySymbols,
  CurrencyLabels,
  SupportedTemplates,
  TemplateLabels,
  SupportedLanguages,
  SupportedDateFormat,
  InvoiceGenerationItemData,
  InvoiceGenerationSellerData,
  InvoiceGenerationBuyerData,
  InvoiceGenerationData,
  AccordionGenerationState,
};

// Additional utility types for the invoice generation
export interface InvoiceGenerationFormProps {
  invoiceData: InvoiceGenerationData;
  onInvoiceDataChange: (updatedData: InvoiceGenerationData) => void;
  setCanShareInvoice: (canShareInvoice: boolean) => void;
}

export interface PDFTemplateProps {
  invoiceData: InvoiceGenerationData;
}

export interface InvoiceGenerationConstants {
  INITIAL_INVOICE_DATA: InvoiceGenerationData;
  DEFAULT_ACCORDION_VALUES: readonly string[];
}

// Form section component props
export interface GeneralInformationProps {
  control: any;
  errors: any;
  setValue: any;
  dateOfIssue: string;
}

export interface SellerInformationProps {
  control: any;
  errors: any;
  setValue: any;
  invoiceData: InvoiceGenerationData;
}

export interface BuyerInformationProps {
  control: any;
  errors: any;
  setValue: any;
  invoiceData: InvoiceGenerationData;
}

export interface InvoiceItemsProps {
  control: any;
  fields: any[];
  handleRemoveItem: (index: number) => void;
  errors: any;
  currency: string;
  language: string;
  append: (item: Partial<InvoiceGenerationItemData>) => void;
}

// PDF-related types
export interface PDFDownloadLinkProps {
  invoiceData: InvoiceGenerationData;
  errorWhileGeneratingPdfIsShown: boolean;
  setErrorWhileGeneratingPdfIsShown: (show: boolean) => void;
}

export interface PDFViewerProps {
  invoiceData: InvoiceGenerationData;
  onError: (error: Error) => void;
}

// Seller/Buyer management types
export interface SavedSellerBuyer {
  id: string;
  name: string;
  address: string;
  email: string;
  vatNo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerBuyerDialogProps {
  type: "seller" | "buyer";
  isOpen: boolean;
  onClose: () => void;
  onSelect: (data: InvoiceGenerationSellerData | InvoiceGenerationBuyerData) => void;
  currentData?: InvoiceGenerationSellerData | InvoiceGenerationBuyerData;
}

