import React from 'react';

// --- Icon Components (for better reusability and readability) ---

const CodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-code h-5 w-5 text-red-600 dark:text-red-400"
    {...props}
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-clock h-5 w-5 text-red-600 dark:text-red-400"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-shield h-5 w-5 text-red-600 dark:text-red-400"
    {...props}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BugIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-bug h-5 w-5 text-red-600 dark:text-red-400"
    {...props}
  >
    <path d="M8 2l1.88 1.88" />
    <path d="M14.12 3.88 16 2" />
    <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
    <path d="M12 20v-9" />
    <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
    <path d="M6 13H2" />
    <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
    <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
    <path d="M22 13h-4" />
    <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
  </svg>
);

const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-credit-card h-5 w-5 text-red-600 dark:text-red-400"
    {...props}
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const BarChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-bar-chart h-5 w-5 text-red-600 dark:text-red-400"
    {...props}
  >
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

const ProblemCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div
      data-slot="card"
      className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-0"
    >
      <div data-slot="card-content" className="p-5">
        <div className="mb-3 flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-red-100 p-2 dark:bg-red-900/30">
            {icon} {/* Render the icon component passed as a prop */}
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-600">{title}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Section Component ---
const ProblemSection = () => {
  // Data for the problem cards
  const problems = [
    {
      icon: <ClockIcon />,
      title: 'Late Payments',
      description:
        'Businesses suffer from cash flow issues when clients consistently pay invoices weeks or months after due dates.',
    },
    {
      icon: <BugIcon />,
      title: 'Manual Tracking',
      description:
        'Tracking payment status across dozens or hundreds of invoices manually leads to errors and missed follow-ups.',
    },
    {
      icon: <CreditCardIcon />,
      title: 'Inconsistent Follow-ups',
      description:
        'Without a system, payment reminders are often forgotten, inconsistent, or too aggressive, damaging client relationships.',
    },
    {
      icon: <BarChartIcon />,
      title: 'No Payment Visibility',
      description:
        'Lack of clear metrics on payment patterns makes it impossible to identify and address problematic accounts.',
    },
    {
      icon: <ShieldIcon />,
      title: 'Disorganized Records',
      description:
        'Scattered invoice records across emails, spreadsheets, and paper files create confusion and compliance risks.',
    },
    {
      icon: <CodeIcon />,
      title: 'Time-Consuming Admin',
      description:
        'Administrative staff waste hours each week manually creating reminders and updating payment statuses.',
    },
  ];

  return (
    <section
      id="problem"
      className="w-full bg-gradient-to-b from-white to-red-100 py-16 md:py-24 mx-auto dark:from-gray-950 dark:to-red-950/20"
    >
      <div className="container px-4 md:px-5 mx-auto">
        <div className="mb-8 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="mb-2 text-sm font-medium tracking-wider uppercase">
            CHALLENGES
          </div>
          <h2 className="text-3xl font-bold tracking-tighter text-red-400 sm:text-4xl md:text-5xl">
            Late Payments Shouldn't Hurt Your Business
          </h2>
          <p className="text-muted-foreground max-w-[800px] md:text-xl/relaxed">
            Many businesses struggle with inconsistent cash flow due to delayed invoice payments and inefficient collection processes.
          </p>
        </div>
        <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl py-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Map over the problems array to render cards dynamically */}
            {problems.map((problem, index) => (
              <ProblemCard
                key={index} // It's better to use a unique ID if available, but index is okay for static lists
                icon={problem.icon}
                title={problem.title}
                description={problem.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection; // Export the main component