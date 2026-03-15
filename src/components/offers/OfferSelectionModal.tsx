"use client";

import { useRef } from 'react';
import { MockOffer } from '@/lib/mock-data';
import { formatCurrency, formatAPR } from '@/lib/format-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface OfferSelectionModalProps {
  offer: MockOffer;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function OfferSelectionModal({
  offer,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: OfferSelectionModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const expirationDate = new Date(offer.expiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useFocusTrap(isOpen, dialogRef, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="offer-selection-title"
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h2 id="offer-selection-title" className="text-2xl font-bold">Confirm Your Selection</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Close offer selection dialog"
                    className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-blue-100 text-sm">
                  You&apos;re about to select this offer from {offer.lenderName}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Offer Summary */}
                <div className="bg-gray-50 rounded-xl p-5 mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Approved Amount</div>
                      <div className="text-xl font-bold text-gray-900">{formatCurrency(offer.approvedAmount)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">APR</div>
                      <div className="text-xl font-bold text-blue-600">{formatAPR(offer.apr)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Monthly Payment</div>
                      <div className="text-lg font-semibold text-gray-900">{formatCurrency(offer.monthlyPayment)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Term</div>
                      <div className="text-lg font-semibold text-gray-900">{offer.termMonths} months</div>
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                {offer.conditions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Conditions to finalize:</h3>
                    <ul className="space-y-1.5">
                      {offer.conditions.map((condition, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <svg className="w-4 h-4 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What Happens Next */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">What happens next?</h3>
                  <ol className="space-y-1.5 text-sm text-blue-800">
                    <li className="flex gap-2">
                      <span className="font-semibold">1.</span>
                      <span>We&apos;ll generate your pre-approval letter</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">2.</span>
                      <span>You can download it and take it to any dealership</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">3.</span>
                      <span>Shop for your vehicle with confidence</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">4.</span>
                      <span>Your offer expires on {expirationDate}</span>
                    </li>
                  </ol>
                </div>

                {/* Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-amber-900 mb-1">Important</div>
                      <p className="text-xs text-amber-700">
                        Selecting this offer will decline all other offers for this application.
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-4 py-3 border border-gray-300 hover:border-gray-400 rounded-xl text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      'Confirm Selection'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
