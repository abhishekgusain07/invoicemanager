import { type InvoiceGenerationData, CURRENCY_SYMBOLS } from "@/lib/validations/invoice-generation";
import { Text, View } from "@react-pdf/renderer";
import { memo } from "react";
import { PDF_DEFAULT_TEMPLATE_STYLES } from "./invoice-pdf-template";

interface InvoiceItemsTableProps {
  invoiceData: InvoiceGenerationData;
}

export const InvoiceItemsTable = memo(function InvoiceItemsTable({
  invoiceData,
}: InvoiceItemsTableProps) {
  const currencySymbol = CURRENCY_SYMBOLS[invoiceData.currency] || invoiceData.currency;

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  return (
    <View style={[PDF_DEFAULT_TEMPLATE_STYLES.mb4]}>
      <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.subheader, PDF_DEFAULT_TEMPLATE_STYLES.mb2]}>
        Invoice Items
      </Text>

      {/* Table Header */}
      <View style={[PDF_DEFAULT_TEMPLATE_STYLES.table]}>
        <View style={[PDF_DEFAULT_TEMPLATE_STYLES.tableRow, { backgroundColor: "#f5f5f5" }]}>
          <View style={[{ ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "5%" }]}>
            <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCell, PDF_DEFAULT_TEMPLATE_STYLES.boldText, PDF_DEFAULT_TEMPLATE_STYLES.smallText]}>
              #
            </Text>
          </View>
          <View style={[{ ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "35%" }]}>
            <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCell, PDF_DEFAULT_TEMPLATE_STYLES.boldText, PDF_DEFAULT_TEMPLATE_STYLES.smallText]}>
              Description
            </Text>
          </View>
          <View style={[{ ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "10%" }]}>
            <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCell, PDF_DEFAULT_TEMPLATE_STYLES.boldText, PDF_DEFAULT_TEMPLATE_STYLES.smallText]}>
              Qty
            </Text>
          </View>
          <View style={[{ ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "15%" }]}>
            <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCell, PDF_DEFAULT_TEMPLATE_STYLES.boldText, PDF_DEFAULT_TEMPLATE_STYLES.smallText]}>
              Unit Price
            </Text>
          </View>
          <View style={[{ ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "10%" }]}>
            <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCell, PDF_DEFAULT_TEMPLATE_STYLES.boldText, PDF_DEFAULT_TEMPLATE_STYLES.smallText]}>
              VAT %
            </Text>
          </View>
          <View style={[{ ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "15%" }]}>
            <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCell, PDF_DEFAULT_TEMPLATE_STYLES.boldText, PDF_DEFAULT_TEMPLATE_STYLES.smallText]}>
              Net Amount
            </Text>
          </View>
          <View style={[{ ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "10%" }]}>
            <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCell, PDF_DEFAULT_TEMPLATE_STYLES.boldText, PDF_DEFAULT_TEMPLATE_STYLES.smallText]}>
              Total
            </Text>
          </View>
        </View>

        {/* Table Rows */}
        {invoiceData.items.map((item, index) => (
          <View key={index} style={[PDF_DEFAULT_TEMPLATE_STYLES.tableRow]}>
            <View style={[{ ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "5%" }]}>
              <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCell, PDF_DEFAULT_TEMPLATE_STYLES.smallText]}>
                {index + 1}
              </Text>
            </View>
            <View style={[{ ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "35%" }]}>
              <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCell, PDF_DEFAULT_TEMPLATE_STYLES.smallText]}>
                {item.name}
              </Text>
            </View>
            <View style={[{ ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "10%" }]}>
              <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCell, PDF_DEFAULT_TEMPLATE_STYLES.smallText]}>
                {item.amount} {item.unit || ""}
              </Text>
            </View>
            <View style={[{ ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "15%" }]}>
              <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCell, PDF_DEFAULT_TEMPLATE_STYLES.smallText, PDF_DEFAULT_TEMPLATE_STYLES.rightAlign]}>
                {formatCurrency(item.netPrice)}
              </Text>
            </View>
            <View style={[{ ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "10%" }]}>
              <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCell, PDF_DEFAULT_TEMPLATE_STYLES.smallText, PDF_DEFAULT_TEMPLATE_STYLES.rightAlign]}>
                {typeof item.vat === "number" ? `${item.vat}%` : item.vat}
              </Text>
            </View>
            <View style={[{ ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "15%" }]}>
              <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCell, PDF_DEFAULT_TEMPLATE_STYLES.smallText, PDF_DEFAULT_TEMPLATE_STYLES.rightAlign]}>
                {formatCurrency(item.netAmount)}
              </Text>
            </View>
            <View style={[{ ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "10%" }]}>
              <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCell, PDF_DEFAULT_TEMPLATE_STYLES.smallText, PDF_DEFAULT_TEMPLATE_STYLES.rightAlign]}>
                {formatCurrency(item.preTaxAmount)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});