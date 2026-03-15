import Link from "next/link";
import Logo from "./Logo";

const footerColumns = [
  {
    title: "Navigation",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Disclosures", href: "/disclosures" },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "For Lenders", href: "/lender/join" },
      { label: "For Dealers", href: "/dealer/join" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Email Us", href: "mailto:hello@autoloanpro.co" },
      { label: "System Status", href: "/status" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-white before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,#2563EB,transparent)]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-8">
          <div className="max-w-md">
            <Logo size="md" />
            <p className="mt-4 text-sm leading-relaxed text-[#425466]">
              Auto Loan Pro is a marketplace built to help borrowers compare financing options with more clarity before
              they step into the dealership.
            </p>
            <p className="mt-4 text-sm font-medium text-[#0A2540]">hello@autoloanpro.co</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="text-sm font-semibold text-[#0A2540]">{column.title}</h2>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="premium-footer-link inline-flex min-h-[44px] items-center text-sm text-[#6B7C93]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[#E3E8EE] pt-6 text-sm text-[#6B7C93] md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p>&copy; 2026 Auto Loan Pro. Auto Loan Pro is a marketplace, not a lender.</p>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#6B7C93]">
              Built with security in mind.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/terms" className="premium-footer-link inline-flex min-h-[44px] items-center">
              Terms
            </Link>
            <Link href="/privacy" className="premium-footer-link inline-flex min-h-[44px] items-center">
              Privacy Policy
            </Link>
            <Link href="/disclosures" className="premium-footer-link inline-flex min-h-[44px] items-center">
              Disclosures
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
