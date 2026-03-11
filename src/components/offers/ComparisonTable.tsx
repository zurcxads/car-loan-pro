"use client";

import { MockOffer } from '@/lib/mock-data';
import { formatCurrency, formatAPR, formatDate } from '@/lib/format-utils';
import { computeTotalCost } from '@/lib/underwriting-engine';

interface ComparisonTableProps {
  offers: MockOffer[];
}

export default function ComparisonTable({ offers }: ComparisonTableProps) {
  if (offers.length === 0) return null;

  const lowestAPR = Math.min(...offers.map(o => o.apr));
  const lowestPayment = Math.min(...offers.map(o => o.monthlyPayment));
  const lowestTotal = Math.min(...offers.map(o => computeTotalCost(o.monthlyPayment, o.termMonths)));

  const rows = [
    {
      label: 'APR',
      values: offers.map(o => ({
        display: formatAPR(o.apr),
        highlight: o.apr === lowestAPR,
      })),
    },
    {
      label: 'Monthly Payment',
      values: offers.map(o => ({
        display: formatCurrency(o.monthlyPayment),
        highlight: o.monthlyPayment === lowestPayment,
      })),
    },
    {
      label: 'Total Cost of Loan',
      values: offers.map(o => {
        const total = computeTotalCost(o.monthlyPayment, o.termMonths);
        return {
          display: formatCurrency(total),
          highlight: total === lowestTotal,
        };
      }),
    },
    {
      label: 'Term',
      values: offers.map(o => ({
        display: `${o.termMonths} months`,
        highlight: false,
      })),
    },
    {
      label: 'Approved Amount',
      values: offers.map(o => ({
        display: formatCurrency(o.approvedAmount),
        highlight: false,
      })),
    },
    {
      label: 'Conditions',
      values: offers.map(o => ({
        display: o.conditions.length > 0 ? o.conditions.join(', ') : 'None',
        highlight: false,
      })),
    },
    {
      label: 'Expires',
      values: offers.map(o => ({
        display: formatDate(o.expiresAt),
        highlight: false,
      })),
    },
  ];

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold">Side-by-Side Comparison</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-5 text-[10px] text-gray-500 uppercase tracking-widest font-medium w-40"></th>
              {offers.map(o => (
                <th key={o.id} className="text-left py-4 px-5 text-xs font-semibold text-gray-900">
                  {o.lenderName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-3.5 px-5 text-xs text-gray-500 font-medium">{row.label}</td>
                {row.values.map((val, j) => (
                  <td key={j} className={`py-3.5 px-5 text-sm ${val.highlight ? 'text-green-600 font-semibold' : 'text-gray-700'}`}>
                    {val.display}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
