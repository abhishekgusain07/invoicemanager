import { type InvoiceGenerationData } from "@/lib/validations/invoice-generation";
import dayjs from "dayjs";

export const INITIAL_INVOICE_DATA: InvoiceGenerationData = {
  language: "en",
  dateFormat: "YYYY-MM-DD",
  currency: "EUR",
  template: "default",
  logo: "",
  
  invoiceNumberObject: {
    label: "Invoice Number:",
    value: "INV-001",
  },
  
  dateOfIssue: dayjs().format("YYYY-MM-DD"),
  dateOfService: dayjs().endOf("month").format("YYYY-MM-DD"),
  
  invoiceType: "Invoice",
  invoiceTypeFieldIsVisible: true,
  
  seller: {
    name: "",
    address: "",
    vatNo: "",
    vatNoFieldIsVisible: true,
    email: "",
    accountNumber: "",
    accountNumberFieldIsVisible: true,
    swiftBic: "",
    swiftBicFieldIsVisible: true,
    notes: "",
    notesFieldIsVisible: true,
  },
  
  buyer: {
    name: "",
    address: "",
    vatNo: "",
    vatNoFieldIsVisible: true,
    email: "",
    notes: "",
    notesFieldIsVisible: true,
  },
  
  items: [
    {
      invoiceItemNumberIsVisible: true,
      name: "",
      nameFieldIsVisible: true,
      typeOfGTU: "",
      typeOfGTUFieldIsVisible: true,
      amount: 1,
      amountFieldIsVisible: true,
      unit: "pcs",
      unitFieldIsVisible: true,
      netPrice: 0,
      netPriceFieldIsVisible: true,
      vat: 0,
      vatFieldIsVisible: true,
      netAmount: 0,
      netAmountFieldIsVisible: true,
      vatAmount: 0,
      vatAmountFieldIsVisible: true,
      preTaxAmount: 0,
      preTaxAmountFieldIsVisible: true,
    },
  ],
  
  total: 0,
  vatTableSummaryIsVisible: true,
  
  paymentMethod: "Bank Transfer",
  paymentMethodFieldIsVisible: true,
  
  paymentDue: dayjs().add(14, "days").format("YYYY-MM-DD"),
  
  stripePayOnlineUrl: "",
  
  notes: "",
  notesFieldIsVisible: true,
  
  personAuthorizedToReceiveFieldIsVisible: true,
  personAuthorizedToIssueFieldIsVisible: true,
};

export const DEFAULT_ACCORDION_VALUES = [
  "general",
  "seller", 
  "buyer",
  "invoiceItems",
] as const;

export const LOADING_BUTTON_TIMEOUT = 400;
export const LOADING_BUTTON_TEXT = "Generating Document...";
export const DEBOUNCE_TIMEOUT = 500;