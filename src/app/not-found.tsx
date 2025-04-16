import React from 'react';

// --- Icon Components ---

const GhostIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    className="lucide lucide-ghost size-12 text-primary" // Applied classes from original SVG
    {...props}
  >
    <path d="M9 10h.01" />
    <path d="M15 10h.01" />
    <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
  </svg>
);

const HouseIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    className="lucide lucide-house size-4" // Applied classes from original SVG
    {...props}
  >
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

const LayersIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    className="lucide lucide-layers size-4" // Applied classes from original SVG
    {...props}
  >
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>
);


// --- Main 404 Page Component ---

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12 lg:px-8">
      <div className="rounded-lg border text-card-foreground relative overflow-hidden border-none bg-gradient-to-br from-background to-muted p-8 shadow-xl">
        {/* Decorative background element */}
        <div className="absolute right-0 top-0 size-32 rotate-45 bg-gradient-to-br from-primary/20 to-primary/10"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="mb-4 flex items-center justify-center rounded-full bg-muted p-3">
            <GhostIcon />
          </div>

          {/* Text Content */}
          <h1 className="mb-2 text-4xl font-bold tracking-tight">404</h1>
          <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
          <p className="mb-8 max-w-md text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. Perhaps it's been moved or no longer exists.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-radial-[at_52%_-52%] **:[text-shadow:0_1px_0_var(--color-primary)] border-primary from-primary/70 to-primary/95 text-primary-foreground inset-shadow-2xs inset-shadow-white/25 dark:inset-shadow-white dark:from-primary dark:to-primary/70 dark:hover:to-primary border text-sm shadow-md shadow-zinc-950/30 ring-0 transition-[filter] duration-200 hover:brightness-125 active:brightness-95 dark:border-0 h-9 px-4 py-2 gap-2"
              // Note: The **:[text-shadow...] class might be custom or non-standard Tailwind. Verify its effect.
              href="/"
            >
              <HouseIcon />
              Back to Home
            </a>
            <a
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 gap-2"
              href="/callback" // Or link appropriately within your app, maybe using React Router's <Link>
            >
              <LayersIcon />
              Back to App
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;