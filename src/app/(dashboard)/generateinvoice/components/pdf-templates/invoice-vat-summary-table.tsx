import { Text, View } from "@react-pdf/renderer";
import { type InvoiceGenerationData } from "@/lib/validations/invoice-generation";
import { PDF_DEFAULT_TEMPLATE_STYLES } from "./invoice-pdf-template";

interface InvoiceVATSummaryTableProps {
  invoiceData: InvoiceGenerationData;
  formattedInvoiceTotal: string;
}

export function InvoiceVATSummaryTable({
  invoiceData,
  formattedInvoiceTotal,
}: InvoiceVATSummaryTableProps) {
  // Group items by VAT rate
  const vatGroups = invoiceData.items.reduce(
    (acc, item) => {
      const vatRate = typeof item.vat === "number" ? item.vat : 0;
      const vatKey =
        typeof item.vat === "string" ? item.vat : vatRate.toString();

      if (!acc[vatKey]) {
        acc[vatKey] = {
          vatRate: item.vat,
          netAmount: 0,
          vatAmount: 0,
          totalAmount: 0,
        };
      }
      acc[vatKey].netAmount += item.amount * item.netPrice;
      acc[vatKey].vatAmount += item.amount * item.netPrice * (vatRate / 100);
      acc[vatKey].totalAmount +=
        item.amount * item.netPrice * (1 + vatRate / 100);
      return acc;
    },
    {} as Record<
      string,
      {
        vatRate: string | number;
        netAmount: number;
        vatAmount: number;
        totalAmount: number;
      }
    >
  );

  const sortedVatKeys = Object.keys(vatGroups).sort((a, b) => {
    const aNum = Number(a);
    const bNum = Number(b);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return bNum - aNum; // Numeric sort, descending
    }
    return a.localeCompare(b); // String sort
  });

  const totalNetAmount = Object.values(vatGroups).reduce(
    (acc, group) => acc + group.netAmount,
    0
  );
  const totalVATAmount = Object.values(vatGroups).reduce(
    (acc, group) => acc + group.vatAmount,
    0
  );

  const formatAmount = (amount: number) =>
    amount
      .toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .replaceAll(",", " ");

  return (
    <View style={[PDF_DEFAULT_TEMPLATE_STYLES.table, { width: "100%" }]}>
      {/* Header row */}
      <View style={PDF_DEFAULT_TEMPLATE_STYLES.tableRow}>
        <View style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCol, { width: "25%" }]}>
          <Text
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.tableCellCentered,
              PDF_DEFAULT_TEMPLATE_STYLES.boldText,
              PDF_DEFAULT_TEMPLATE_STYLES.smallText,
            ]}
          >
            VAT Rate
          </Text>
        </View>
        <View style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCol, { width: "25%" }]}>
          <Text
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.tableCellRight,
              PDF_DEFAULT_TEMPLATE_STYLES.boldText,
              PDF_DEFAULT_TEMPLATE_STYLES.smallText,
            ]}
          >
            Net
          </Text>
        </View>
        <View style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCol, { width: "25%" }]}>
          <Text
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.tableCellRight,
              PDF_DEFAULT_TEMPLATE_STYLES.boldText,
              PDF_DEFAULT_TEMPLATE_STYLES.smallText,
            ]}
          >
            VAT
          </Text>
        </View>
        <View style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCol, { width: "25%" }]}>
          <Text
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.tableCellRight,
              PDF_DEFAULT_TEMPLATE_STYLES.boldText,
              PDF_DEFAULT_TEMPLATE_STYLES.smallText,
            ]}
          >
            Total
          </Text>
        </View>
      </View>

      {/* Table body rows */}
      {sortedVatKeys.map((vatKey) => {
        const group = vatGroups[vatKey];
        const displayVat =
          typeof group.vatRate === "number"
            ? `${group.vatRate}%`
            : group.vatRate;

        return (
          <View style={PDF_DEFAULT_TEMPLATE_STYLES.tableRow} key={vatKey}>
            <View
              style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCol, { width: "25%" }]}
            >
              <Text
                style={[
                  PDF_DEFAULT_TEMPLATE_STYLES.tableCellCentered,
                  PDF_DEFAULT_TEMPLATE_STYLES.smallText,
                ]}
              >
                {displayVat}
              </Text>
            </View>
            <View
              style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCol, { width: "25%" }]}
            >
              <Text
                style={[
                  PDF_DEFAULT_TEMPLATE_STYLES.monetaryValue,
                  PDF_DEFAULT_TEMPLATE_STYLES.smallText,
                ]}
              >
                {formatAmount(group.netAmount)}
              </Text>
            </View>
            <View
              style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCol, { width: "25%" }]}
            >
              <Text
                style={[
                  PDF_DEFAULT_TEMPLATE_STYLES.monetaryValue,
                  PDF_DEFAULT_TEMPLATE_STYLES.smallText,
                ]}
              >
                {formatAmount(group.vatAmount)}
              </Text>
            </View>
            <View
              style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCol, { width: "25%" }]}
            >
              <Text
                style={[
                  PDF_DEFAULT_TEMPLATE_STYLES.monetaryValue,
                  PDF_DEFAULT_TEMPLATE_STYLES.smallText,
                ]}
              >
                {formatAmount(group.totalAmount)}
              </Text>
            </View>
          </View>
        );
      })}

      {/* Total row */}
      <View style={PDF_DEFAULT_TEMPLATE_STYLES.tableRow}>
        <View style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCol, { width: "25%" }]}>
          <Text
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.tableCellCentered,
              PDF_DEFAULT_TEMPLATE_STYLES.boldText,
              PDF_DEFAULT_TEMPLATE_STYLES.smallText,
            ]}
          >
            Total
          </Text>
        </View>
        <View style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCol, { width: "25%" }]}>
          <Text
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.monetaryValue,
              PDF_DEFAULT_TEMPLATE_STYLES.boldText,
              PDF_DEFAULT_TEMPLATE_STYLES.smallText,
            ]}
          >
            {formatAmount(totalNetAmount)}
          </Text>
        </View>
        <View style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCol, { width: "25%" }]}>
          <Text
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.monetaryValue,
              PDF_DEFAULT_TEMPLATE_STYLES.boldText,
              PDF_DEFAULT_TEMPLATE_STYLES.smallText,
            ]}
          >
            {formatAmount(totalVATAmount)}
          </Text>
        </View>
        <View style={[PDF_DEFAULT_TEMPLATE_STYLES.tableCol, { width: "25%" }]}>
          <Text
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.monetaryValue,
              PDF_DEFAULT_TEMPLATE_STYLES.boldText,
              PDF_DEFAULT_TEMPLATE_STYLES.smallText,
            ]}
          >
            {formattedInvoiceTotal}
          </Text>
        </View>
      </View>
    </View>
  );
}
