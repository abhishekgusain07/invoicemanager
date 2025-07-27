import { Text, View } from "@react-pdf/renderer";
import { type InvoiceGenerationData } from "@/lib/validations/invoice-generation";
import dayjs from "dayjs";
import { PDF_DEFAULT_TEMPLATE_STYLES } from "./invoice-pdf-template";

interface InvoicePaymentInfoProps {
  invoiceData: InvoiceGenerationData;
}

export function InvoicePaymentInfo({ invoiceData }: InvoicePaymentInfoProps) {
  const paymentDate = dayjs(invoiceData.paymentDue).format("DD/MM/YYYY");

  return (
    <View style={{ maxWidth: "250px" }}>
      {invoiceData.paymentMethod && (
        <Text style={PDF_DEFAULT_TEMPLATE_STYLES.smallText}>
          Payment Method:{" "}
          <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.boldText, PDF_DEFAULT_TEMPLATE_STYLES.smallText]}>
            {invoiceData.paymentMethod}
          </Text>
        </Text>
      )}
      <Text
        style={[
          PDF_DEFAULT_TEMPLATE_STYLES.smallText,
          { marginLeft: invoiceData.paymentMethod ? 9.75 : 0 },
        ]}
      >
        Payment Date:{" "}
        <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.boldText, PDF_DEFAULT_TEMPLATE_STYLES.smallText]}>
          {paymentDate}
        </Text>
      </Text>
    </View>
  );
}