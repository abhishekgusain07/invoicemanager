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
    name: "Your Company Name",
    address: "123 Business Street, City, State 12345",
    vatNo: "VAT123456789",
    vatNoFieldIsVisible: true,
    email: "billing@yourcompany.com",
    accountNumber: "1234567890",
    accountNumberFieldIsVisible: true,
    swiftBic: "ABCDUS33XXX",
    swiftBicFieldIsVisible: true,
    notes: "Thank you for your business",
    notesFieldIsVisible: true,
  },

  buyer: {
    name: "Client Company Name",
    address: "456 Customer Avenue, City, State 67890",
    vatNo: "VAT987654321",
    vatNoFieldIsVisible: true,
    email: "contact@clientcompany.com",
    notes: "",
    notesFieldIsVisible: true,
  },

  items: [
    {
      invoiceItemNumberIsVisible: true,
      name: "Consulting Services",
      nameFieldIsVisible: true,
      typeOfGTU: "",
      typeOfGTUFieldIsVisible: true,
      amount: 1,
      amountFieldIsVisible: true,
      unit: "hours",
      unitFieldIsVisible: true,
      netPrice: 100,
      netPriceFieldIsVisible: true,
      vat: 20,
      vatFieldIsVisible: true,
      netAmount: 100,
      netAmountFieldIsVisible: true,
      vatAmount: 20,
      vatAmountFieldIsVisible: true,
      preTaxAmount: 120,
      preTaxAmountFieldIsVisible: true,
    },
  ],

  total: 120,
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

export const EMPTY_INVOICE_DATA: InvoiceGenerationData = {
  language: "en",
  dateFormat: "YYYY-MM-DD",
  currency: "EUR",
  template: "default",
  logo: "",

  invoiceNumberObject: {
    label: "Invoice Number:",
    value: "INV-000",
  },

  dateOfIssue: dayjs().format("YYYY-MM-DD"),
  dateOfService: dayjs().endOf("month").format("YYYY-MM-DD"),

  invoiceType: "Invoice",
  invoiceTypeFieldIsVisible: true,

  seller: {
    name: "[Your Company Name]",
    address: "[Your Company Address]",
    vatNo: "",
    vatNoFieldIsVisible: true,
    email: "your-email@company.com",
    accountNumber: "",
    accountNumberFieldIsVisible: true,
    swiftBic: "",
    swiftBicFieldIsVisible: true,
    notes: "",
    notesFieldIsVisible: true,
  },

  buyer: {
    name: "[Client Company Name]",
    address: "[Client Company Address]",
    vatNo: "",
    vatNoFieldIsVisible: true,
    email: "client@company.com",
    notes: "",
    notesFieldIsVisible: true,
  },

  items: [
    {
      invoiceItemNumberIsVisible: true,
      name: "[Service/Product Name]",
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

  paymentMethod: "",
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
