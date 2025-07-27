"use client";

import { Suspense } from "react";
import { InvoiceClientPage } from "./components/invoice-client-page";

export const dynamic = "force-dynamic";

export default function GenerateInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">Loading...</div>
      }
    >
      <InvoiceClientPage />
    </Suspense>
  );
}
