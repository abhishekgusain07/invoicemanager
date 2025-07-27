import { type InvoiceGenerationData } from "@/lib/validations/invoice-generation";
import { Text, View } from "@react-pdf/renderer";
import { memo } from "react";
import { PDF_DEFAULT_TEMPLATE_STYLES } from "./invoice-pdf-template";
import dayjs from "dayjs";

interface InvoiceHeaderProps {
  invoiceData: InvoiceGenerationData;
}

export const InvoiceHeader = memo(function InvoiceHeader({
  invoiceData,
}: InvoiceHeaderProps) {
  const formatDate = (date: string, format: string) => {
    return dayjs(date).format(format);
  };

  return (
    <View style={[PDF_DEFAULT_TEMPLATE_STYLES.mb4]}>
      {/* Invoice Title */}
      <View
        style={[
          PDF_DEFAULT_TEMPLATE_STYLES.flexRow,
          PDF_DEFAULT_TEMPLATE_STYLES.mb3,
        ]}
      >
        <View style={[PDF_DEFAULT_TEMPLATE_STYLES.flex1]}>
          <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.header, { fontSize: 24 }]}>
            {invoiceData.invoiceType || "Invoice"}
          </Text>
        </View>

        {/* Invoice Number */}
        {invoiceData.invoiceNumberObject && (
          <View style={[{ width: "40%" }]}>
            <Text
              style={[
                PDF_DEFAULT_TEMPLATE_STYLES.mediumText,
                PDF_DEFAULT_TEMPLATE_STYLES.rightAlign,
              ]}
            >
              {invoiceData.invoiceNumberObject.label}
            </Text>
            <Text
              style={[
                PDF_DEFAULT_TEMPLATE_STYLES.mediumText,
                PDF_DEFAULT_TEMPLATE_STYLES.rightAlign,
                PDF_DEFAULT_TEMPLATE_STYLES.boldText,
              ]}
            >
              {invoiceData.invoiceNumberObject.value}
            </Text>
          </View>
        )}
      </View>

      {/* Dates Section */}
      <View
        style={[
          PDF_DEFAULT_TEMPLATE_STYLES.flexRow,
          PDF_DEFAULT_TEMPLATE_STYLES.mb3,
        ]}
      >
        <View style={[PDF_DEFAULT_TEMPLATE_STYLES.flex1]} />

        <View style={[{ width: "40%" }]}>
          <View
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.flexRow,
              PDF_DEFAULT_TEMPLATE_STYLES.mb1,
            ]}
          >
            <Text
              style={[PDF_DEFAULT_TEMPLATE_STYLES.smallText, { width: "50%" }]}
            >
              Date of Issue:
            </Text>
            <Text
              style={[
                PDF_DEFAULT_TEMPLATE_STYLES.smallText,
                PDF_DEFAULT_TEMPLATE_STYLES.rightAlign,
                { width: "50%" },
              ]}
            >
              {formatDate(invoiceData.dateOfIssue, invoiceData.dateFormat)}
            </Text>
          </View>

          <View
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.flexRow,
              PDF_DEFAULT_TEMPLATE_STYLES.mb1,
            ]}
          >
            <Text
              style={[PDF_DEFAULT_TEMPLATE_STYLES.smallText, { width: "50%" }]}
            >
              Date of Service:
            </Text>
            <Text
              style={[
                PDF_DEFAULT_TEMPLATE_STYLES.smallText,
                PDF_DEFAULT_TEMPLATE_STYLES.rightAlign,
                { width: "50%" },
              ]}
            >
              {formatDate(invoiceData.dateOfService, invoiceData.dateFormat)}
            </Text>
          </View>

          <View style={[PDF_DEFAULT_TEMPLATE_STYLES.flexRow]}>
            <Text
              style={[PDF_DEFAULT_TEMPLATE_STYLES.smallText, { width: "50%" }]}
            >
              Payment Due:
            </Text>
            <Text
              style={[
                PDF_DEFAULT_TEMPLATE_STYLES.smallText,
                PDF_DEFAULT_TEMPLATE_STYLES.rightAlign,
                { width: "50%" },
              ]}
            >
              {formatDate(invoiceData.paymentDue, invoiceData.dateFormat)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});
