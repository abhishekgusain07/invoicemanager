import React from 'react';

// --- Icon Components ---

const RocketIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rocket h-5 w-5 text-green-600 dark:text-green-400" {...props}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock h-5 w-5 text-green-600 dark:text-green-400" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code h-5 w-5 text-green-600 dark:text-green-400" {...props}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield h-5 w-5 text-green-600 dark:text-green-400" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const DatabaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-database h-5 w-5 text-green-600 dark:text-green-400" {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const BarChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart h-5 w-5 text-green-600 dark:text-green-400" {...props}>
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock h-5 w-5 text-green-600 dark:text-green-400" {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card h-5 w-5 text-green-600 dark:text-green-400" {...props}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

// --- Comparison Item Component ---
const ComparisonItem = ({ icon, label, value, comparison }: { icon: React.ReactNode, label: string, value: React.ReactNode, comparison: string }) => {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex-shrink-0">
        <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-2 dark:bg-green-900/30">
          {icon} {/* Render the icon component */}
        </div>
      </div>
      <div className="flex-1">
        {label}
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-green-600 md:text-4xl dark:text-green-400">
            {/* Value can be a string or JSX */}
            {typeof value === 'string' ? value : <div className="flex items-center">{value}</div>}
          </span>
        </div>
        <span className="text-muted-foreground text-xs">{comparison}</span>
      </div>
    </div>
  );
};

// --- Solution Badge Component ---
const SolutionBadge = ({ icon, text }: { icon: React.ReactNode, text: string }  ) => {
  return (
    <span
      data-slot="badge"
      className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&]:hover:bg-accent [a&]:hover:text-accent-foreground border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
    >
      {icon} {/* Render the icon component */}
      {text}
    </span>
  );
};


// --- Main Solution Section Component ---
const SolutionSection = () => {
  // Data for the comparison items
  const comparisonData = [
    { icon: <RocketIcon />, label: 'Payment Time', value: '62% faster', comparison: 'Get paid in days, not weeks or months' },
    { icon: <ClockIcon />, label: 'Admin Hours', value: '15+ hrs saved', comparison: 'Per week on invoice management tasks' },
    { icon: <CodeIcon />, label: 'Follow-up Emails', value: 'Automated', comparison: 'No more manual reminder emails' },
    { icon: <ShieldIcon />, label: 'Payment Visibility', value: '100%', comparison: 'Complete overview of all invoice statuses' },
    { icon: <DatabaseIcon />, label: 'Client Records', value: 'Centralized', comparison: 'All payment history in one place' },
    { icon: <BarChartIcon />, label: 'Cash Flow', value: 'Improved', comparison: 'More predictable revenue streams' },
  ];

  // Data for the badges
  const badgeData = [
    { icon: <LockIcon className="mr-1 h-3.5 w-3.5" />, text: 'Dashboard Overview' },
    { icon: <CreditCardIcon className="mr-1 h-3.5 w-3.5" />, text: 'Automated Reminders' },
    { icon: <DatabaseIcon className="mr-1 h-3.5 w-3.5" />, text: 'Client Profiles' },
    { icon: <BarChartIcon className="mr-1 h-3.5 w-3.5" />, text: 'Payment Analytics' },
  ];


  return (
    <section id="solution" className="relative flex min-h-[70vh] items-center py-16 md:py-24 bg-gradient-to-b from-white to-green-100 dark:from-gray-950 dark:to-green-950/20">
      {/* Background element - often handled via CSS but kept here for fidelity */}
      <div className="pointer-events-none absolute -z-10 overflow-hidden opacity-10 inset-0">
        <div className="size-full">{/* Potential background content/image */}</div>
      </div>

      <div className="mx-auto max-w-screen-md px-4 md:px-6">
        {/* Heading Section */}
        <div className="mb-8 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="mb-2 text-sm font-medium tracking-wider uppercase">SOLUTION</div>
          <h2 className="text-3xl font-bold tracking-tighter text-green-600 sm:text-4xl md:text-5xl">
            Transform Your Invoice Collections
          </h2>
          <p className="text-muted-foreground max-w-[800px] md:text-xl/relaxed">
            InvoiceManager streamlines payment tracking, automates follow-ups, and gives you complete visibility into your accounts receivable.
          </p>
        </div>

        {/* Comparison Card Section */}
        <div className="mx-auto max-w-3xl">
          <div data-slot="card" className="bg-card text-card-foreground flex flex-col rounded-xl border gap-0 p-0">
            {/* Grid for Comparison Items */}
            <div className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x-0 md:divide-y-0 md:[&>*:nth-child(n+3)]:border-t">
              {comparisonData.map((item, index) => (
                <ComparisonItem
                  key={`comp-${index}`} // Use a unique key
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  comparison={item.comparison}
                />
              ))}
            </div>

            {/* Badges Footer */}
            <div className="border-t p-6">
              <div className="flex flex-wrap justify-center gap-2">
                {badgeData.map((badge, index) => (
                  <SolutionBadge
                    key={`badge-${index}`} // Use a unique key
                    icon={badge.icon}
                    text={badge.text}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;