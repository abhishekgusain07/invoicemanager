import React from 'react';

// --- Icon Components ---

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    className="size-6" // Apply size class directly
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"
    ></path>
  </svg>
);

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    className="size-6" // Apply size class directly
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
    ></path>
  </svg>
);

// --- Optional: Link Components for better structure ---

const FooterNavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a className="block text-muted-foreground duration-150 hover:text-primary" href={href}>
    {/* The span isn't strictly necessary but kept for fidelity to original HTML structure */}
    <span>{children}</span>
  </a>
);

const SocialLink = ({ href, label, children }: { href: string, label: string, children: React.ReactNode }) => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="block text-muted-foreground hover:text-primary"
    href={href} // Use actual URLs here
  >
    {children} {/* Expects an Icon component */}
  </a>
);


// --- Main Footer Component ---

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Get current year dynamically

  // Data for navigation links
  const navLinks = [
    { href: '#pricing', text: 'Pricing' },
    { href: 'mailto:abhishek.gusain1007fb@gmail.com', text: 'Support' },
    { href: '/comming-soon', text: 'Documentation' },
    { href: '/terms-of-service', text: 'Terms of Service' }, // Corrected typo "Serivce" -> "Service"
    { href: '/privacy-policy', text: 'Privacy Policy' },
    { href: '/license', text: 'Licence' }, // Note: 'License' is the more common spelling in US English 
  ];

  // Data for social links (replace # with actual URLs)
  const socialLinks = [
    { href: 'https://x.com/AgusainBuilds', label: 'X/Twitter', icon: <XIcon /> },
    { href: '#', label: 'LinkedIn', icon: <LinkedInIcon /> },
  ];

  return (
    <footer className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Homepage Link */}
        <a aria-label="go home" className="mx-auto block size-fit font-semibold" href="/">
          PrintMoney Template
        </a>

        {/* Navigation Links */}
        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          {navLinks.map((link) => (
            <FooterNavLink key={link.text} href={link.href}>
              {link.text}
            </FooterNavLink>
          ))}
        </div>

        {/* Social Media Links */}
        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
           {socialLinks.map((link) => (
            <SocialLink key={link.label} href={link.href} label={link.label}>
                {link.icon}
            </SocialLink>
           ))}
        </div>

        {/* Copyright Notice */}
        <span className="block text-center text-sm text-muted-foreground">
          © {currentYear} The Boring template, All rights reserved
        </span>
      </div>
    </footer>
  );
};

export default Footer;