import { invoiceGenerationSchema } from "@/lib/validations/invoice-generation";
import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdfTemplate } from "@/app/(dashboard)/generateinvoice/components/pdf-templates/invoice-pdf-template";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the invoice data
    const validatedData = invoiceGenerationSchema.parse(body);
    
    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <InvoicePdfTemplate invoiceData={validatedData} />
    );

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${validatedData.invoiceNumberObject?.value || 'draft'}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to generate PDF", details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to generate PDF." },
    { status: 405 }
  );
}