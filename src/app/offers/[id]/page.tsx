/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/shared/Footer';

// Mock offer data (in production, this would come from API/database)
interface OfferDetails {
  id: string;
  label: string;
  lenderName: string;
  lenderLogo?: string;
  apr: number;
  termMonths: number;
  monthlyPayment: number;
  totalCost: number;
  approvedAmount: number;
  fees: {
    originationFee: number;
    documentFee: number;
    total: number;
  };
  expiresAt: string;
}

export default function OfferDetailPage() {
  const params = useParams();
  const [offer, setOffer] = useState<OfferDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    // Mock data load (replace with actual API call)
    setTimeout(() => {
      setOffer({
        id: params.id as string,
        label: 'Offer A',
        lenderName: 'Capital One Auto Finance',
        apr: 4.2,
        termMonths: 60,
        monthlyPayment: 465,
        totalCost: 27900,
        approvedAmount: 25000,
        fees: {
          originationFee: 0,
          documentFee: 150,
          total: 150
        },
        expiresAt: '2026-04-15T00:00:00Z'
      });
      setLoading(false);
    }, 800);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Offer Not Found</h1>
          <p className="text-gray-600 mb-6">This pre-approval offer may have expired or is invalid.</p>
          <Link href="/dashboard" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const paymentSchedule = Array.from({ length: 6 }, (_, i) => {
    const month = i + 1;
    const principal = offer.approvedAmount / offer.termMonths;
    const interest = (offer.approvedAmount - (principal * month)) * (offer.apr / 100 / 12);
    return {
      month,
      payment: offer.monthlyPayment,
      principal: principal.toFixed(2),
      interest: interest.toFixed(2),
      balance: (offer.approvedAmount - (principal * month)).toFixed(2)
    };
  });

  const handleDownloadLetter = () => {
    // Placeholder for download functionality
    alert('Pre-approval letter download would trigger here');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`My Auto Loan Pre-Approval - ${offer.lenderName}`);
    const body = encodeURIComponent(`I've been pre-approved for an auto loan!\n\nLender: ${offer.lenderName}\nApproved Amount: $${offer.approvedAmount.toLocaleString()}\nAPR: ${offer.apr}%\nMonthly Payment: $${offer.monthlyPayment}\n\nPre-qualified through Auto Loan Pro.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav role="navigation" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm' : 'bg-white border-b border-gray-100'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors duration-200">Dashboard</Link>
            <Link href="/results" className="hover:text-gray-900 transition-colors duration-200">View All Offers</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden md:inline-flex px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-lg transition-colors duration-200">
              Dashboard
            </Link>
            <button onClick={() => setMobileMenu(!mobileMenu)} aria-label={mobileMenu ? 'Close menu' : 'Open menu'} className="md:hidden p-2 text-gray-500 cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 flex flex-col gap-4 text-sm">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>Dashboard</Link>
            <Link href="/results" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>View All Offers</Link>
          </div>
        )}
      </nav>

      <section className="pt-24 pb-10 px-6 md:pt-32 md:pb-14">
        <div className="max-w-4xl mx-auto">
          {/* Success Banner */}
          <div className="animate-fadeIn rounded-2xl bg-green-50 border border-green-200 p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Congratulations! You're Pre-Approved</h1>
            <p className="text-gray-600">Your pre-approval is ready. Here are the full details of your selected offer.</p>
          </div>

          {/* Lender Info */}
          <div style={{ animationDelay: '0.1s' }} className="animate-fadeIn opacity-0 rounded-2xl border border-gray-200 bg-white shadow-sm p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Your Lender</div>
                <h2 className="text-2xl font-bold text-gray-900">{offer.lenderName}</h2>
              </div>
              <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Approved Amount</div>
                <div className="text-2xl font-bold text-gray-900">${offer.approvedAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Valid Until</div>
                <div className="text-lg font-semibold text-gray-900">{new Date(offer.expiresAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Full Terms */}
          <div style={{ animationDelay: '0.2s' }} className="animate-fadeIn opacity-0 rounded-2xl border border-gray-200 bg-white shadow-sm p-8 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Full Loan Terms</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">APR</div>
                <div className="text-2xl font-bold text-blue-600">{offer.apr}%</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Loan Term</div>
                <div className="text-2xl font-bold text-gray-900">{offer.termMonths} months</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Monthly Payment</div>
                <div className="text-2xl font-bold text-gray-900">${offer.monthlyPayment}</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Total Cost</div>
                <div className="text-2xl font-bold text-gray-900">${offer.totalCost.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Fees</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Origination Fee</span>
                  <span className="font-medium text-gray-900">${offer.fees.originationFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Document Fee</span>
                  <span className="font-medium text-gray-900">${offer.fees.documentFee}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-300">
                  <span className="font-semibold text-gray-900">Total Fees</span>
                  <span className="font-bold text-gray-900">${offer.fees.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Schedule */}
          <div style={{ animationDelay: '0.3s' }} className="animate-fadeIn opacity-0 rounded-2xl border border-gray-200 bg-white shadow-sm p-8 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Schedule Preview (First 6 Months)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Month</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Payment</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Principal</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Interest</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paymentSchedule.map((payment) => (
                    <tr key={payment.month}>
                      <td className="py-3 px-4 text-gray-900 font-medium">{payment.month}</td>
                      <td className="py-3 px-4 text-right text-gray-900">${payment.payment}</td>
                      <td className="py-3 px-4 text-right text-gray-600">${payment.principal}</td>
                      <td className="py-3 px-4 text-right text-gray-600">${payment.interest}</td>
                      <td className="py-3 px-4 text-right text-gray-900 font-medium">${payment.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* What Happens Next */}
          <div style={{ animationDelay: '0.4s' }} className="animate-fadeIn opacity-0 rounded-2xl border border-gray-200 bg-white shadow-sm p-8 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">What Happens Next</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 font-bold text-blue-600">1</div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Download Your Pre-Approval Letter</h4>
                  <p className="text-sm text-gray-600">Use this letter when shopping for your vehicle. It shows dealers you're a serious buyer with secured financing.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 font-bold text-blue-600">2</div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Shop for Your Vehicle</h4>
                  <p className="text-sm text-gray-600">Visit dealerships or private sellers with confidence. You have {offer.termMonths} days to find your car.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 font-bold text-blue-600">3</div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Finalize Your Loan</h4>
                  <p className="text-sm text-gray-600">Once you've chosen a vehicle, {offer.lenderName} will finalize your loan and coordinate with the dealer to complete the purchase.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ animationDelay: '0.5s' }} className="animate-fadeIn opacity-0 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownloadLetter}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-xl transition-colors duration-200 cursor-pointer"
            >
              Download Pre-Approval Letter
            </button>
            <button
              onClick={handleShareEmail}
              className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 text-base font-medium rounded-xl transition-colors duration-200 cursor-pointer"
            >
              Share via Email
            </button>
          </div>

          <div style={{ animationDelay: '0.6s' }} className="animate-fadeIn opacity-0 mt-6 text-center">
            <Link href="/results" className="text-sm text-blue-600 hover:text-blue-500 underline">
              Change My Selection
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
