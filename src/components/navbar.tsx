"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { isWaitlistMode } from "@/lib/feature-flags";
import { useWaitlistAnalytics } from "@/lib/analytics/waitlist";

export function NavbarDemo({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const isLoggedIn = !!user;

  // Prefetch session data after component mount
  useEffect(() => {
    // Only prefetch if not already loading or loaded
    if (!isLoading && !user) {
      // Background session refresh with a small delay
      const timer = setTimeout(() => {
        authClient.getSession().catch(() => {
          // Silently ignore errors - this is just for prefetching
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading, user]);
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { trackWaitlistCTAClick } = useWaitlistAnalytics();

  const navItems = [
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "Pricing",
      link: "#pricing",
    },
    {
      name: "Contact",
      link: "#contact",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get user initial for avatar
  const getUserInitial = () => {
    if (!user || !user.email) return "?";
    return user.email.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authClient.signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  const handleLogin = () => {
    // In waitlist mode, scroll to waitlist form instead of redirecting to sign-in
    if (isWaitlistMode()) {
      trackWaitlistCTAClick("navbar");
      const waitlistSection = document.getElementById("waitlist");
      if (waitlistSection) {
        waitlistSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Using window.location for immediate navigation
      window.location.href = "/sign-in";
    }
  };

  // Render avatar skeleton during loading
  const renderAuthUI = () => {
    if (isLoading) {
      return (
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="h-5 w-5 rounded-full bg-gray-300"></div>
        </div>
      );
    }

    // In waitlist mode, show Join Waitlist button instead of auth
    if (isWaitlistMode()) {
      return (
        <NavbarButton variant="primary" onClick={handleLogin}>
          Join Waitlist
        </NavbarButton>
      );
    }

    if (isLoggedIn) {
      return (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium cursor-pointer hover:opacity-90 transition-opacity"
          >
            {getUserInitial()}
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:cursor-pointer"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`block w-full text-left px-4 py-2 text-sm ${isLoggingOut ? "text-gray-400 bg-gray-50" : "text-red-600 hover:bg-gray-100 hover:cursor-pointer"} relative`}
                >
                  {isLoggingOut ? (
                    <>
                      <span className="opacity-50">Logging out...</span>
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 border-2 border-t-transparent border-red-300 rounded-full animate-spin"></span>
                    </>
                  ) : (
                    "Log out"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <NavbarButton variant="secondary" onClick={handleLogin}>
        Login
      </NavbarButton>
    );
  };

  // Render auth UI for mobile menu
  const renderMobileAuthUI = () => {
    if (isLoading) {
      return (
        <div className="w-full h-10 bg-gray-200 rounded-md animate-pulse"></div>
      );
    }

    // In waitlist mode, show Join Waitlist button
    if (isWaitlistMode()) {
      return (
        <NavbarButton
          onClick={() => {
            trackWaitlistCTAClick("mobile-nav");
            handleLogin();
            setIsMobileMenuOpen(false);
          }}
          variant="primary"
          className="w-full"
        >
          Join Waitlist
        </NavbarButton>
      );
    }

    if (isLoggedIn) {
      return (
        <>
          <NavbarButton
            onClick={() => {
              router.push("/dashboard");
              setIsMobileMenuOpen(false);
            }}
            variant="primary"
            className="w-full"
          >
            Dashboard
          </NavbarButton>
          <NavbarButton
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="secondary"
            className={`w-full relative ${isLoggingOut ? "opacity-70" : ""}`}
          >
            {isLoggingOut ? (
              <>
                <span>Logging out...</span>
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin"></span>
              </>
            ) : (
              "Log out"
            )}
          </NavbarButton>
        </>
      );
    }

    return (
      <NavbarButton
        onClick={() => {
          router.push("/sign-in");
          setIsMobileMenuOpen(false);
        }}
        variant="primary"
        className="w-full"
      >
        Login
      </NavbarButton>
    );
  };

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody className="">
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">{renderAuthUI()}</div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              {renderMobileAuthUI()}
              {!isWaitlistMode() && (
                <NavbarButton
                  onClick={() => {
                    router.push("/book-a-call");
                    setIsMobileMenuOpen(false);
                  }}
                  variant="primary"
                  className="w-full"
                >
                  Book a call
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      <div className="pt-20">{children}</div>
    </div>
  );
}
