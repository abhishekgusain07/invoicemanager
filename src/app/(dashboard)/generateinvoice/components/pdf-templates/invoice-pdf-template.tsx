import { type InvoiceGenerationData } from "@/lib/validations/invoice-generation";
import { Document, Font, Page, StyleSheet } from "@react-pdf/renderer";
import { memo } from "react";
import { InvoiceBody } from "./invoice-body";

// Use system fonts for PDF generation
const fontFamily = "Helvetica";
const fontFamilyBold = "Helvetica-Bold";

// Styles for the PDF
export const PDF_DEFAULT_TEMPLATE_STYLES = StyleSheet.create({
  wFull: {
    width: "100%",
  },
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: fontFamily,
    fontWeight: 400,
  },
  header: {
    fontSize: 16,
    marginBottom: 0,
    fontFamily: fontFamilyBold,
    fontWeight: 600,
  },
  subheader: {
    fontSize: 12,
    marginBottom: 3,
    borderBottom: "1px solid gray",
    paddingBottom: 3,
    fontFamily: fontFamilyBold,
    fontWeight: 600,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#000",
    minHeight: 25,
  },
  tableCell: {
    padding: 6,
    fontSize: 10,
    lineHeight: 1.2,
    overflow: "hidden",
    wordWrap: "break-word",
    textAlign: "left",
  },
  tableCellCentered: {
    padding: 6,
    fontSize: 10,
    lineHeight: 1.2,
    overflow: "hidden",
    wordWrap: "break-word",
    textAlign: "center",
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: "justify",
    fontFamily: fontFamily,
  },
  smallText: {
    fontSize: 10,
    color: "#333",
  },
  mediumText: {
    fontSize: 12,
    color: "#333",
  },
  boldText: {
    fontWeight: 700,
    fontFamily: fontFamilyBold,
  },
  rightAlign: {
    textAlign: "right",
  },
  centerAlign: {
    textAlign: "center",
  },
  leftAlign: {
    textAlign: "left",
  },
  mt1: {
    marginTop: 4,
  },
  mt2: {
    marginTop: 8,
  },
  mt3: {
    marginTop: 12,
  },
  mt4: {
    marginTop: 16,
  },
  mt5: {
    marginTop: 20,
  },
  mb1: {
    marginBottom: 4,
  },
  mb2: {
    marginBottom: 8,
  },
  mb3: {
    marginBottom: 12,
  },
  mb4: {
    marginBottom: 16,
  },
  mb5: {
    marginBottom: 20,
  },
  borderB: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  borderT: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    borderTopStyle: "solid",
  },
  flexRow: {
    flexDirection: "row",
  },
  flex1: {
    flex: 1,
  },
  p1: {
    padding: 4,
  },
  p2: {
    padding: 8,
  },
  px1: {
    paddingLeft: 4,
    paddingRight: 4,
  },
  px2: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  py1: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  py2: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  pt2: {
    paddingTop: 8,
  },
  wrappedText: {
    fontSize: 9,
    lineHeight: 1.2,
    wordWrap: "break-word",
    overflow: "hidden",
  },
  monetaryValue: {
    textAlign: "right",
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 6,
    lineHeight: 1.2,
    overflow: "hidden",
  },
  tableCellRight: {
    padding: 6,
    fontSize: 10,
    lineHeight: 1.2,
    overflow: "hidden",
    wordWrap: "break-word",
    textAlign: "right",
  },
  descriptionCell: {
    padding: 6,
    fontSize: 9,
    lineHeight: 1.3,
    overflow: "hidden",
    wordWrap: "break-word",
    textAlign: "left",
  },
});

interface InvoicePdfTemplateProps {
  invoiceData: InvoiceGenerationData;
}

export const InvoicePdfTemplate = memo(function InvoicePdfTemplate({
  invoiceData,
}: InvoicePdfTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={PDF_DEFAULT_TEMPLATE_STYLES.page}>
        <InvoiceBody invoiceData={invoiceData} />
      </Page>
    </Document>
  );
});
