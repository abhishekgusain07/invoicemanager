import { type InvoiceGenerationData } from "@/lib/validations/invoice-generation";
import { Text, View } from "@react-pdf/renderer";
import { memo } from "react";
import { InvoiceHeader } from "./invoice-header";
import { InvoiceSellerBuyerInfo } from "./invoice-seller-buyer-info";
import { InvoiceItemsTable } from "./invoice-items-table";
import { InvoicePaymentTotals } from "./invoice-payment-totals";
import { InvoiceFooter } from "./invoice-footer";
import { InvoicePaymentInfo } from "./invoice-payment-info";
import { InvoiceVATSummaryTable } from "./invoice-vat-summary-table";
import { PDF_DEFAULT_TEMPLATE_STYLES } from "./invoice-pdf-template";

interface InvoiceBodyProps {
  invoiceData: InvoiceGenerationData;
}

export const InvoiceBody = memo(function InvoiceBody({
  invoiceData,
}: InvoiceBodyProps) {
  // Calculate total
  const invoiceTotal = invoiceData.items.reduce((total, item) => {
    const vatRate = typeof item.vat === "number" ? item.vat : 0;
    const itemTotal = item.amount * item.netPrice * (1 + vatRate / 100);
    return total + itemTotal;
  }, 0);

  const formattedInvoiceTotal = invoiceTotal
    .toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replaceAll(",", " ");

  // Check if VAT summary should be visible (when there are items with different tax rates)
  const uniqueVatRates = [
    ...new Set(
      invoiceData.items.map((item) =>
        typeof item.vat === "number" ? item.vat : 0
      )
    ),
  ];
  const vatTableSummaryIsVisible =
    uniqueVatRates.length > 1 || (uniqueVatRates[0] && uniqueVatRates[0] > 0);

  return (
    <View>
      <InvoiceHeader invoiceData={invoiceData} />
      <InvoiceSellerBuyerInfo invoiceData={invoiceData} />
      <InvoiceItemsTable invoiceData={invoiceData} />

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <View style={{ width: "50%" }}>
          <InvoicePaymentInfo invoiceData={invoiceData} />
        </View>

        {vatTableSummaryIsVisible && (
          <View style={{ width: "50%" }}>
            <InvoiceVATSummaryTable
              invoiceData={invoiceData}
              formattedInvoiceTotal={formattedInvoiceTotal}
            />
          </View>
        )}
      </View>

      <View style={{ marginTop: vatTableSummaryIsVisible ? 10 : 15 }}>
        <InvoicePaymentTotals invoiceData={invoiceData} />
      </View>

      {/* Notes */}
      {invoiceData.notes && (
        <View style={{ marginTop: 10 }}>
          <Text style={PDF_DEFAULT_TEMPLATE_STYLES.smallText}>
            Notes: {invoiceData.notes}
          </Text>
        </View>
      )}

      <InvoiceFooter invoiceData={invoiceData} />
    </View>
  );
});
