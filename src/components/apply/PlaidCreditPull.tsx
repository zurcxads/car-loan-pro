"use client";

import { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';

interface PlaidCreditPullProps {
  onSuccess: (creditData: CreditData) => void;
  onError?: (error: string) => void;
}

interface CreditData {
  ficoScore: number;
  creditReport: {
    accounts: unknown[];
    inquiries: unknown[];
    publicRecords: unknown[];
  };
}

export default function PlaidCreditPull({ onSuccess, onError }: PlaidCreditPullProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch link token on mount
  useEffect(() => {
    async function createLinkToken() {
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
        });
        const data = await response.json();
        if (data.link_token) {
          setLinkToken(data.link_token);
        }
      } catch (err) {
        console.error('Error creating link token:', err);
        onError?.('Failed to initialize credit check');
      }
    }
    createLinkToken();
  }, [onError]);

  const onPlaidSuccess = useCallback(async (publicToken: string) => {
    setLoading(true);
    try {
      // Exchange public token for access token and get credit data
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token: publicToken }),
      });

      const data = await response.json();
      
      if (data.error) {
        onError?.(data.error);
        setLoading(false);
        return;
      }

      // Return mock credit data (Plaid doesn't have real credit API yet in sandbox)
      const creditData: CreditData = {
        ficoScore: data.credit_score || 720,
        creditReport: {
          accounts: data.accounts || [],
          inquiries: data.inquiries || [],
          publicRecords: data.public_records || [],
        }
      };

      onSuccess(creditData);
    } catch (err) {
      console.error('Error exchanging token:', err);
      onError?.('Failed to retrieve credit data');
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: (err) => {
      if (err) {
        console.error('Plaid Link exit:', err);
        onError?.('Credit check cancelled');
      }
    },
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Retrieving your credit profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Verify Your Credit</h3>
          <p className="text-xs text-gray-600 mb-4">
            We&apos;ll do a soft credit check (no impact to your score) to match you with the best lenders.
          </p>
          <button
            onClick={() => open()}
            disabled={!ready}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${
              ready 
                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {ready ? 'Check My Credit' : 'Initializing...'}
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Soft inquiry only • No impact to credit score
          </p>
        </div>
      </div>
    </div>
  );
}
