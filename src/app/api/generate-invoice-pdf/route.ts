import { invoiceGenerationSchema } from "@/lib/validations/invoice-generation";
import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { InvoicePdfTemplate } from "@/app/(dashboard)/generateinvoice/components/pdf-templates/invoice-pdf-template";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // Get the raw text first to debug JSON parsing issues
    const rawBody = await req.text();

    if (!rawBody || rawBody.trim() === "") {
      return NextResponse.json(
        { error: "Request body is empty" },
        { status: 400 }
      );
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw body:", rawBody);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Try to validate the invoice data, but use raw data if validation fails
    const validationResult = invoiceGenerationSchema.safeParse(body);

    // Use validated data if available, otherwise use raw data and let template handle it
    const invoiceData = validationResult.success ? validationResult.data : body;

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoicePdfTemplate, {
        invoiceData: invoiceData,
      }) as any
    );

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoiceData.invoiceNumberObject?.value || "draft"}.pdf"`,
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
