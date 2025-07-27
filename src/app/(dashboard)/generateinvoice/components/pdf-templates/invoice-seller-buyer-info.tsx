import { type InvoiceGenerationData } from "@/lib/validations/invoice-generation";
import { Text, View } from "@react-pdf/renderer";
import { memo } from "react";
import { PDF_DEFAULT_TEMPLATE_STYLES } from "./invoice-pdf-template";

interface InvoiceSellerBuyerInfoProps {
  invoiceData: InvoiceGenerationData;
}

export const InvoiceSellerBuyerInfo = memo(function InvoiceSellerBuyerInfo({
  invoiceData,
}: InvoiceSellerBuyerInfoProps) {
  return (
    <View
      style={[
        PDF_DEFAULT_TEMPLATE_STYLES.flexRow,
        PDF_DEFAULT_TEMPLATE_STYLES.mb4,
      ]}
    >
      {/* Seller Information */}
      <View style={[{ width: "48%" }]}>
        <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.subheader]}>
          Seller Information
        </Text>

        <Text
          style={[
            PDF_DEFAULT_TEMPLATE_STYLES.mediumText,
            PDF_DEFAULT_TEMPLATE_STYLES.boldText,
            PDF_DEFAULT_TEMPLATE_STYLES.mt2,
          ]}
        >
          {invoiceData.seller.name}
        </Text>

        <Text
          style={[
            PDF_DEFAULT_TEMPLATE_STYLES.smallText,
            PDF_DEFAULT_TEMPLATE_STYLES.mt1,
          ]}
        >
          {invoiceData.seller.address}
        </Text>

        <Text
          style={[
            PDF_DEFAULT_TEMPLATE_STYLES.smallText,
            PDF_DEFAULT_TEMPLATE_STYLES.mt1,
          ]}
        >
          Email: {invoiceData.seller.email}
        </Text>

        {invoiceData.seller.vatNo && invoiceData.seller.vatNoFieldIsVisible && (
          <Text
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.smallText,
              PDF_DEFAULT_TEMPLATE_STYLES.mt1,
            ]}
          >
            VAT No: {invoiceData.seller.vatNo}
          </Text>
        )}

        {invoiceData.seller.accountNumber &&
          invoiceData.seller.accountNumberFieldIsVisible && (
            <Text
              style={[
                PDF_DEFAULT_TEMPLATE_STYLES.smallText,
                PDF_DEFAULT_TEMPLATE_STYLES.mt1,
              ]}
            >
              Account: {invoiceData.seller.accountNumber}
            </Text>
          )}

        {invoiceData.seller.swiftBic &&
          invoiceData.seller.swiftBicFieldIsVisible && (
            <Text
              style={[
                PDF_DEFAULT_TEMPLATE_STYLES.smallText,
                PDF_DEFAULT_TEMPLATE_STYLES.mt1,
              ]}
            >
              SWIFT/BIC: {invoiceData.seller.swiftBic}
            </Text>
          )}
      </View>

      {/* Spacer */}
      <View style={[{ width: "4%" }]} />

      {/* Buyer Information */}
      <View style={[{ width: "48%" }]}>
        <Text style={[PDF_DEFAULT_TEMPLATE_STYLES.subheader]}>
          Buyer Information
        </Text>

        <Text
          style={[
            PDF_DEFAULT_TEMPLATE_STYLES.mediumText,
            PDF_DEFAULT_TEMPLATE_STYLES.boldText,
            PDF_DEFAULT_TEMPLATE_STYLES.mt2,
          ]}
        >
          {invoiceData.buyer.name}
        </Text>

        <Text
          style={[
            PDF_DEFAULT_TEMPLATE_STYLES.smallText,
            PDF_DEFAULT_TEMPLATE_STYLES.mt1,
          ]}
        >
          {invoiceData.buyer.address}
        </Text>

        <Text
          style={[
            PDF_DEFAULT_TEMPLATE_STYLES.smallText,
            PDF_DEFAULT_TEMPLATE_STYLES.mt1,
          ]}
        >
          Email: {invoiceData.buyer.email}
        </Text>

        {invoiceData.buyer.vatNo && invoiceData.buyer.vatNoFieldIsVisible && (
          <Text
            style={[
              PDF_DEFAULT_TEMPLATE_STYLES.smallText,
              PDF_DEFAULT_TEMPLATE_STYLES.mt1,
            ]}
          >
            VAT No: {invoiceData.buyer.vatNo}
          </Text>
        )}
      </View>
    </View>
  );
});
