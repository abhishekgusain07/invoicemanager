import { type InvoiceGenerationData } from "@/lib/validations/invoice-generation";
import { View } from "@react-pdf/renderer";
import { memo } from "react";
import { InvoiceHeader } from "./invoice-header";
import { InvoiceSellerBuyerInfo } from "./invoice-seller-buyer-info";
import { InvoiceItemsTable } from "./invoice-items-table";
import { InvoicePaymentTotals } from "./invoice-payment-totals";
import { InvoiceFooter } from "./invoice-footer";

interface InvoiceBodyProps {
  invoiceData: InvoiceGenerationData;
}

export const InvoiceBody = memo(function InvoiceBody({
  invoiceData,
}: InvoiceBodyProps) {
  return (
    <View>
      <InvoiceHeader invoiceData={invoiceData} />
      <InvoiceSellerBuyerInfo invoiceData={invoiceData} />
      <InvoiceItemsTable invoiceData={invoiceData} />
      <InvoicePaymentTotals invoiceData={invoiceData} />
      <InvoiceFooter invoiceData={invoiceData} />
    </View>
  );
});