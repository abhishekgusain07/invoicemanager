import {
  type InvoiceGenerationData,
  CURRENCY_SYMBOLS,
} from "@/lib/validations/invoice-generation";
import { Text, View } from "@react-pdf/renderer";
import { memo } from "react";
import { PDF_DEFAULT_TEMPLATE_STYLES } from "./invoice-pdf-template";

interface InvoicePaymentTotalsProps {
  invoiceData: InvoiceGenerationData;
}

export const InvoicePaymentTotals = memo(function InvoicePaymentTotals({
  invoiceData,
}: InvoicePaymentTotalsProps) {
  const currencySymbol =
    CURRENCY_SYMBOLS[invoiceData.currency] || invoiceData.currency;

  const formatCurrency = (amount: number) => {
    return `${currencySymbol} ${amount.toFixed(2)}`;
  };

  // Calculate VAT summary
  const vatSummary = invoiceData.items.reduce(
    (acc, item) => {
      const vatRate = typeof item.vat === "number" ? item.vat : 0;
      const vatKey = vatRate.toString();

      if (!acc[vatKey]) {
        acc[vatKey] = {
          rate: vatRate,
          netAmount: 0,
          vatAmount: 0,
        };
      }

      acc[vatKey].netAmount += item.netAmount;
      acc[vatKey].vatAmount += item.vatAmount;

      return acc;
    },
    {} as Record<string, { rate: number; netAmount: number; vatAmount: number }>
  );

  const totalNetAmount = invoiceData.items.reduce(
    (sum, item) => sum + item.netAmount,
    0
  );
  const totalVatAmount = invoiceData.items.reduce(
    (sum, item) => sum + item.vatAmount,
    0
  );

  return (
    <View style={[PDF_DEFAULT_TEMPLATE_STYLES.mb4]}>
      <View style={[PDF_DEFAULT_TEMPLATE_STYLES.flexRow]}>
        {/* VAT Summary Table (if visible) */}
        {invoiceData.vatTableSummaryIsVisible &&
          Object.keys(vatSummary).length > 0 && (
            <View style={[{ width: "48%" }]}>
              <Text
                style={[
                  PDF_DEFAULT_TEMPLATE_STYLES.subheader,
                  PDF_DEFAULT_TEMPLATE_STYLES.mb2,
                ]}
              >
                VAT Summary
              </Text>

              <View style={[PDF_DEFAULT_TEMPLATE_STYLES.table]}>
                <View
                  style={[
                    PDF_DEFAULT_TEMPLATE_STYLES.tableRow,
                    { backgroundColor: "#f5f5f5" },
                  ]}
                >
                  <View
                    style={[
                      { ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "25%" },
                    ]}
                  >
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
                  <View
                    style={[
                      { ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "35%" },
                    ]}
                  >
                    <Text
                      style={[
                        PDF_DEFAULT_TEMPLATE_STYLES.tableCellRight,
                        PDF_DEFAULT_TEMPLATE_STYLES.boldText,
                        PDF_DEFAULT_TEMPLATE_STYLES.smallText,
                      ]}
                    >
                      Net Amount
                    </Text>
                  </View>
                  <View
                    style={[
                      { ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol, width: "40%" },
                    ]}
                  >
                    <Text
                      style={[
                        PDF_DEFAULT_TEMPLATE_STYLES.tableCellRight,
                        PDF_DEFAULT_TEMPLATE_STYLES.boldText,
                        PDF_DEFAULT_TEMPLATE_STYLES.smallText,
                      ]}
                    >
                      VAT Amount
                    </Text>
                  </View>
                </View>

                {Object.entries(vatSummary).map(([key, summary]) => (
                  <View
                    key={key}
                    style={[PDF_DEFAULT_TEMPLATE_STYLES.tableRow]}
                  >
                    <View
                      style={[
                        {
                          ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol,
                          width: "25%",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          PDF_DEFAULT_TEMPLATE_STYLES.tableCellCentered,
                          PDF_DEFAULT_TEMPLATE_STYLES.smallText,
                        ]}
                      >
                        {summary.rate}%
                      </Text>
                    </View>
                    <View
                      style={[
                        {
                          ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol,
                          width: "35%",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          PDF_DEFAULT_TEMPLATE_STYLES.monetaryValue,
                          PDF_DEFAULT_TEMPLATE_STYLES.smallText,
                        ]}
                      >
                        {formatCurrency(summary.netAmount)}
                      </Text>
                    </View>
                    <View
                      style={[
                        {
                          ...PDF_DEFAULT_TEMPLATE_STYLES.tableCol,
                          width: "40%",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          PDF_DEFAULT_TEMPLATE_STYLES.monetaryValue,
                          PDF_DEFAULT_TEMPLATE_STYLES.smallText,
                        ]}
                      >
                        {formatCurrency(summary.vatAmount)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Spacer */}
        <View style={[{ width: "4%" }]} />

        {/* Totals */}
        <View style={[{ width: "48%" }]}>
          <Text
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.subheader,
              PDF_DEFAULT_TEMPLATE_STYLES.mb2,
            ]}
          >
            Payment Summary
          </Text>

          <View
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.flexRow,
              PDF_DEFAULT_TEMPLATE_STYLES.mb1,
            ]}
          >
            <Text
              style={[PDF_DEFAULT_TEMPLATE_STYLES.mediumText, { width: "60%" }]}
            >
              Net Total:
            </Text>
            <Text
              style={[
                PDF_DEFAULT_TEMPLATE_STYLES.mediumText,
                PDF_DEFAULT_TEMPLATE_STYLES.rightAlign,
                { width: "40%" },
              ]}
            >
              {formatCurrency(totalNetAmount)}
            </Text>
          </View>

          <View
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.flexRow,
              PDF_DEFAULT_TEMPLATE_STYLES.mb1,
            ]}
          >
            <Text
              style={[PDF_DEFAULT_TEMPLATE_STYLES.mediumText, { width: "60%" }]}
            >
              VAT Total:
            </Text>
            <Text
              style={[
                PDF_DEFAULT_TEMPLATE_STYLES.mediumText,
                PDF_DEFAULT_TEMPLATE_STYLES.rightAlign,
                { width: "40%" },
              ]}
            >
              {formatCurrency(totalVatAmount)}
            </Text>
          </View>

          <View
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.flexRow,
              PDF_DEFAULT_TEMPLATE_STYLES.borderT,
              PDF_DEFAULT_TEMPLATE_STYLES.py1,
            ]}
          >
            <Text
              style={[
                PDF_DEFAULT_TEMPLATE_STYLES.mediumText,
                PDF_DEFAULT_TEMPLATE_STYLES.boldText,
                { width: "60%" },
              ]}
            >
              Total Amount:
            </Text>
            <Text
              style={[
                PDF_DEFAULT_TEMPLATE_STYLES.mediumText,
                PDF_DEFAULT_TEMPLATE_STYLES.boldText,
                PDF_DEFAULT_TEMPLATE_STYLES.rightAlign,
                { width: "40%" },
              ]}
            >
              {formatCurrency(invoiceData.total)}
            </Text>
          </View>

          {/* Payment Method */}
          {invoiceData.paymentMethod &&
            invoiceData.paymentMethodFieldIsVisible && (
              <View style={[PDF_DEFAULT_TEMPLATE_STYLES.mt3]}>
                <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.smallText]}>
                  Payment Method: {invoiceData.paymentMethod}
                </Text>
              </View>
            )}
        </View>
      </View>
    </View>
  );
});
