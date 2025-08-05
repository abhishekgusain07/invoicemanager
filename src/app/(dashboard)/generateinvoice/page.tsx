"use client";

import { Suspense } from "react";
import { InvoiceClientPage } from "./components/invoice-client-page";
import LogoLoader from "@/components/logoloader";

export const dynamic = "force-dynamic";

export default function GenerateInvoicePage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
          <LogoLoader />
          <div style={{ marginTop: 16, color: '#334155' }}>Loading...</div>
        </div>
      }
    >
      <InvoiceClientPage />
    </Suspense>
  );
}
