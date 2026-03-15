import Link from "next/link";
import Logo from "./Logo";

const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Calculator", href: "/calculator" },
      { label: "Resources", href: "/resources" },
      { label: "System Status", href: "/status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Disclosures", href: "/disclosures" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Get Pre-Approved", href: "/apply" },
      { label: "Lender Join", href: "/lender/join" },
      { label: "Dealer Join", href: "/dealer/join" },
      { label: "Sign In", href: "/login" },
      { label: "Email Us", href: "mailto:hello@autoloanpro.co" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#E3E8EE] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-2xl border border-[#E3E8EE] bg-[#F6F9FC] p-8">
          <div className="max-w-md">
            <Logo size="md" />
            <p className="mt-4 text-sm leading-relaxed text-[#425466]">
              Auto Loan Pro is a marketplace built to help borrowers compare financing options with more clarity before
              they step into the dealership.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="text-sm font-semibold text-[#0A2540]">{column.title}</h2>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#6B7C93] transition-colors hover:text-[#0A2540]"
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
          <p>&copy; 2026 Auto Loan Pro. Auto Loan Pro is a marketplace, not a lender.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/terms" className="transition-colors hover:text-[#0A2540]">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-[#0A2540]">
              Privacy
            </Link>
            <Link href="/disclosures" className="transition-colors hover:text-[#0A2540]">
              Disclosures
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
