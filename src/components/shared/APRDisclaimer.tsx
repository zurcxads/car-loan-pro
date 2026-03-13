import { AlertCircle } from 'lucide-react';

interface APRDisclaimerProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function APRDisclaimer({ variant = 'default', className = '' }: APRDisclaimerProps) {
  if (variant === 'compact') {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        <p>
          Example: A $30,000 loan at 4.99% APR for 60 months = $566/mo. Total interest: $3,960.
          Rates vary by creditworthiness.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-900">
            APR Disclosure
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong>Example:</strong> A $30,000 loan at 4.99% APR for 60 months results in a monthly payment of $566.
            Total interest paid over the life of the loan: $3,960.
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Actual rates and payments vary based on creditworthiness, loan amount, term, and lender.
            Rates shown are estimates only. Your final APR will be determined by the lender after a full credit review.
          </p>
          <p className="text-xs text-gray-500 italic">
            Pre-qualification does not guarantee loan approval. Final terms subject to lender approval.
          </p>
        </div>
      </div>
    </div>
  );
}
