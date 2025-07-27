// components/InvoiceReminder.tsx
"use client";

import { GmailConnect } from "@/components/GmailConnect";
import { Button } from "@/components/ui/button";
import { useSendEmail } from "@/hooks/sendEmail";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface InvoiceReminderProps {
  invoice: {
    id: string;
    clientEmail: string;
    clientName: string;
    dueDate: string;
    amount: number;
    invoiceNumber: string;
  };
}

function InvoiceReminder({ invoice }: InvoiceReminderProps) {
  const { sendEmail, isLoading, error } = useSendEmail();
  const [isSent, setIsSent] = useState(false);

  const handleSendReminder = async () => {
    try {
      await sendEmail({
        to: { email: invoice.clientEmail, name: invoice.clientName },
        subject: `Reminder: Invoice #${invoice.invoiceNumber} Payment Due`,
        html: `
          <div>
            <h2>Invoice Payment Reminder</h2>
            <p>Dear ${invoice.clientName},</p>
            <p>This is a friendly reminder that payment for invoice #${invoice.invoiceNumber} in the amount of $${invoice.amount.toFixed(2)} was due on ${new Date(invoice.dueDate).toLocaleDateString()}.</p>
            <p>Please make your payment at your earliest convenience.</p>
            <p>Thank you for your business!</p>
          </div>
        `,
      });

      setIsSent(true);
      // Update your invoice status in database
    } catch (err) {
      console.error("Failed to send reminder", err);
    }
  };

  return (
    <div>
      <h3>Invoice #{invoice.invoiceNumber}</h3>
      <p>Client: {invoice.clientName}</p>
      <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
      <p>Amount: ${invoice.amount.toFixed(2)}</p>

      {error && <p className="text-red-500">{error}</p>}

      <Button onClick={handleSendReminder} disabled={isLoading || isSent}>
        {isLoading ? "Sending..." : isSent ? "Reminder Sent" : "Send Reminder"}
      </Button>
    </div>
  );
}

export default function TestGmailApiPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const { data: session, error } = await authClient.getSession();
        if (session?.user?.id) {
          setUserId(session.user.id);
          toast.success(
            `User fetched successfully with ID: ${session.user.id}`
          );
        } else {
          throw new Error("Failed to get user ID from session");
        }
      } catch (error) {
        toast.error("Failed to fetch user");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);
  // Dummy invoice data
  const dummyInvoices = [
    {
      id: "inv-001",
      clientEmail: "valorantgusain@gmail.com",
      clientName: "Acme Corporation",
      dueDate: "2023-12-15",
      amount: 1250.0,
      invoiceNumber: "INV-2023-001",
    },
    {
      id: "inv-002",
      clientEmail: "john.doe@example.com",
      clientName: "John Doe Consulting",
      dueDate: "2023-12-20",
      amount: 850.5,
      invoiceNumber: "INV-2023-002",
    },
    {
      id: "inv-003",
      clientEmail: "tech@innovate.io",
      clientName: "Innovate Technologies",
      dueDate: "2023-12-25",
      amount: 3400.75,
      invoiceNumber: "INV-2023-003",
    },
  ];

  return (
    <div className="container mx-auto p-6" suppressHydrationWarning>
      <h1 className="text-2xl font-bold mb-6">Gmail API Test Page</h1>
      <GmailConnect userId={userId!} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dummyInvoices.map((invoice) => (
          <div key={invoice.id} className="border p-4 rounded-lg shadow">
            <InvoiceReminder invoice={invoice} />
          </div>
        ))}
      </div>
    </div>
  );
}
