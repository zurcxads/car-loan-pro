"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const navLinks = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Lenders", href: "/lender/join" },
  { label: "Dealers", href: "/dealer/join" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Sign In", href: "/login" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const mobileDialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(mobileMenuOpen, mobileDialogRef, () => setMobileMenuOpen(false));

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const hiddenPrefixes = ["/admin", "/dashboard", "/apply", "/results", "/dev"];
  const hiddenExactRoutes = new Set([
    "/lender",
    "/lender/login",
    "/lender/onboard",
    "/dealer",
    "/dealer/login",
    "/dealer/onboard",
  ]);
  const isPortal = hiddenExactRoutes.has(pathname) || hiddenPrefixes.some((route) => pathname.startsWith(route));

  if (isPortal) return null;

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-200 ${
          scrolled
            ? "border-b border-[#E3E8EE] bg-white/90 backdrop-blur-xl"
            : "bg-white/80 backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Logo size="md" />
          </Link>

          <nav role="navigation" aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-[#0A2540]"
                    : "text-[#425466] hover:text-[#0A2540]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href="/apply"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Get Pre-Approved
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E3E8EE] bg-white text-[#425466] transition-colors hover:text-[#0A2540] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 lg:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-dialog"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div
            role="presentation"
            className="fixed inset-0 z-40 bg-[#0A2540]/10 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div
            id="mobile-navigation-dialog"
            ref={mobileDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
            tabIndex={-1}
            className="fixed inset-x-0 top-0 z-50 border-b border-[#E3E8EE] bg-white lg:hidden"
          >
            <div className="mx-auto max-w-6xl px-6 py-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <Logo size="md" />
                </Link>
                <h2 id="mobile-navigation-title" className="sr-only">
                  Mobile navigation
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E3E8EE] bg-white text-[#425466] transition-colors hover:text-[#0A2540] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav role="navigation" aria-label="Mobile" className="mt-6">
                <div className="space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={`flex min-h-11 items-center rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? "border-[#BFDBFE] bg-[#F6F9FC] text-[#0A2540]"
                          : "border-[#E3E8EE] bg-white text-[#425466] hover:bg-[#F6F9FC] hover:text-[#0A2540]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>

              <Link
                href="/apply"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Get Pre-Approved
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
