"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MockOffer } from '@/lib/mock-data';
import { formatCurrency, formatAPR } from '@/lib/format-utils';

interface HardPullConsentModalProps {
  offer: MockOffer | null;
  onClose: () => void;
  onConfirm: (offer: MockOffer) => void;
}

export default function HardPullConsentModal({ offer, onClose, onConfirm }: HardPullConsentModalProps) {
  const [consent, setConsent] = useState(false);

  if (!offer) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full"
        >
          <h3 className="text-lg font-semibold mb-2">One More Step -- Authorize Credit Check</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Selecting this offer will authorize <strong className="text-gray-900">{offer.lenderName}</strong> to perform a hard credit inquiry.
            This may affect your credit score by 2-5 points. You are not obligated to accept the loan.
          </p>

          <div className="rounded-xl bg-gray-50 p-5 mb-6 grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500 text-xs">APR</span><div className="font-semibold mt-0.5">{formatAPR(offer.apr)}</div></div>
            <div><span className="text-gray-500 text-xs">Monthly</span><div className="font-semibold mt-0.5">{formatCurrency(offer.monthlyPayment)}</div></div>
            <div><span className="text-gray-500 text-xs">Term</span><div className="font-semibold mt-0.5">{offer.termMonths} months</div></div>
            <div><span className="text-gray-500 text-xs">Amount</span><div className="font-semibold mt-0.5">{formatCurrency(offer.approvedAmount)}</div></div>
          </div>

          <label
            className="flex items-start gap-3 cursor-pointer mb-6"
            onClick={(e) => { e.preventDefault(); setConsent(!consent); }}
          >
            <div className={`mt-0.5 w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${
              consent ? 'bg-blue-600 border-blue-600' : 'border-gray-200'
            }`}>
              {consent && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-xs text-gray-500 leading-relaxed">
              I authorize {offer.lenderName} to obtain my full credit report
            </span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => { if (consent) onConfirm(offer); }}
              disabled={!consent}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer ${
                consent ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirm & Select Offer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
