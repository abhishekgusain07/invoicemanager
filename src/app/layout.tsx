import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { PostHogProvider } from "../components/PostHogProvider";
import { TRPCReactProvider } from "@/lib/trpc";

export const metadata: Metadata = {
  title: {
    default:
      "InvoiceManager - Professional Invoice Management for Freelancers & Agencies",
    template: "%s | InvoiceManager",
  },
  description:
    "Stop chasing payments and focus on what matters. InvoiceManager's intelligent system handles follow-ups, tracks payments, and gets you paid 75% faster. Professional invoice management for freelancers and agencies.",
  keywords: [
    "invoice management",
    "freelancer invoicing",
    "payment tracking",
    "automated reminders",
    "invoice software",
    "freelance tools",
    "payment collection",
    "business invoicing",
  ],
  authors: [{ name: "InvoiceManager" }],
  creator: "InvoiceManager",
  publisher: "InvoiceManager",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://invoicemanager.abhishekgusain.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "InvoiceManager - Professional Invoice Management for Freelancers & Agencies",
    description:
      "Stop chasing payments and focus on what matters. Get paid 75% faster with automated follow-ups and intelligent payment tracking.",
    url: "https://invoicemanager.abhishekgusain.com",
    siteName: "InvoiceManager",
    images: [
      {
        url: "/sshot/ss.png",
        width: 1200,
        height: 630,
        alt: "InvoiceManager - Professional Invoice Management Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "InvoiceManager - Professional Invoice Management for Freelancers & Agencies",
    description:
      "Stop chasing payments and focus on what matters. Get paid 75% faster with automated follow-ups and intelligent payment tracking.",
    images: ["/sshot/ss.png"],
    creator: "@invoicemanager",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "InvoiceManager",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "Professional invoice management for freelancers and agencies. Stop chasing payments and focus on what matters. Get paid 75% faster with automated follow-ups and intelligent payment tracking.",
              url: "https://invoicemanager.abhishekgusain.com",
              author: {
                "@type": "Organization",
                name: "InvoiceManager",
              },
              offers: {
                "@type": "Offer",
                category: "SaaS",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
              featureList: [
                "Automated invoice generation",
                "Payment tracking and reminders",
                "Client management",
                "Dashboard analytics",
                "Professional invoice templates",
                "Automated follow-ups",
              ],
              screenshot:
                "https://invoicemanager.abhishekgusain.com/sshot/ss.png",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "120",
              },
            }),
          }}
        />
      </head>
      <body className={`antialiased`}>
        <TRPCReactProvider>
          <PostHogProvider>
            <Toaster />
            {children}
          </PostHogProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
