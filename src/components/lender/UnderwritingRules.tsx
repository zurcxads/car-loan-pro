"use client";

import { useEffect, useState } from 'react';
import { MOCK_LENDERS, type MockLender } from '@/lib/mock-data';

interface RateTier {
  ficoMin: number;
  ficoMax: number;
  rateMin: number;
  rateMax: number;
}

export default function UnderwritingRules() {
  const [lenders, setLenders] = useState<MockLender[]>(MOCK_LENDERS);
  const fallbackLender = lenders[0] ?? MOCK_LENDERS[0];
  const [minFico, setMinFico] = useState(MOCK_LENDERS[0].minFico);
  const [maxLtv, setMaxLtv] = useState(MOCK_LENDERS[0].maxLtv);
  const [maxDti, setMaxDti] = useState(MOCK_LENDERS[0].maxDti);
  const [maxPti, setMaxPti] = useState(MOCK_LENDERS[0].maxPti);
  const [minLoan, setMinLoan] = useState(MOCK_LENDERS[0].minLoanAmount);
  const [maxLoan, setMaxLoan] = useState(MOCK_LENDERS[0].maxLoanAmount);
  const [maxAge, setMaxAge] = useState(MOCK_LENDERS[0].maxVehicleAge);
  const [maxMileage, setMaxMileage] = useState(MOCK_LENDERS[0].maxMileage);
  const [acceptCPO, setAcceptCPO] = useState(MOCK_LENDERS[0].acceptsCPO);
  const [acceptPP, setAcceptPP] = useState(MOCK_LENDERS[0].acceptsPrivateParty);
  const [acceptITIN, setAcceptITIN] = useState(MOCK_LENDERS[0].acceptsITIN);
  const [rateTiers, setRateTiers] = useState<RateTier[]>(MOCK_LENDERS[0].rateTiers);
  const [saved, setSaved] = useState(false);

  const [changeHistory] = useState([
    { by: 'System', date: '2026-03-01', field: 'Min FICO', oldVal: '600', newVal: '620' },
    { by: 'Admin', date: '2026-02-15', field: 'Max LTV', oldVal: '125%', newVal: '120%' },
  ]);

  useEffect(() => {
    let mounted = true;

    async function loadLenders() {
      try {
        const response = await fetch('/api/admin/lenders');
        const json = (await response.json()) as { success?: boolean; data?: { lenders?: MockLender[] } };

        if (mounted && json.success && json.data?.lenders) {
          setLenders(json.data.lenders);
        }
      } catch {}
    }

    void loadLenders();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setMinFico(fallbackLender.minFico);
    setMaxLtv(fallbackLender.maxLtv);
    setMaxDti(fallbackLender.maxDti);
    setMaxPti(fallbackLender.maxPti);
    setMinLoan(fallbackLender.minLoanAmount);
    setMaxLoan(fallbackLender.maxLoanAmount);
    setMaxAge(fallbackLender.maxVehicleAge);
    setMaxMileage(fallbackLender.maxMileage);
    setAcceptCPO(fallbackLender.acceptsCPO);
    setAcceptPP(fallbackLender.acceptsPrivateParty);
    setAcceptITIN(fallbackLender.acceptsITIN);
    setRateTiers(fallbackLender.rateTiers);
  }, [fallbackLender]);

  const save = () => {
    localStorage.setItem('clp_lender_rules', JSON.stringify({
      minFico, maxLtv, maxDti, maxPti, minLoan, maxLoan, maxAge, maxMileage, acceptCPO, acceptPP, acceptITIN, rateTiers,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const SliderField = ({ label, value, min, max, suffix, onChange }: { label: string; value: number; min: number; max: number; suffix?: string; onChange: (v: number) => void }) => (
    <div>
      <div className="flex justify-between text-sm mb-3">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-blue-600">{value}{suffix || ''}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full cursor-pointer" aria-label={label} />
      <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>{min}</span><span>{max}</span></div>
    </div>
  );

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <div
        className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${value ? 'bg-blue-600' : 'bg-gray-200'}`}
        onClick={() => onChange(!value)}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-[22px]' : 'translate-x-1'}`} />
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Your Underwriting Parameters</h2>
        <p className="text-xs text-gray-500">Changes take effect on the next routing cycle</p>
      </div>

      <div className="space-y-8">
        {/* Score & Ratios */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
          <h3 className="text-sm font-semibold mb-6">Score & Ratios</h3>
          <div className="space-y-8">
            <SliderField label="Min FICO Score" value={minFico} min={300} max={850} onChange={setMinFico} />
            <SliderField label="Max LTV" value={maxLtv} min={100} max={140} suffix="%" onChange={setMaxLtv} />
            <SliderField label="Max DTI" value={maxDti} min={30} max={60} suffix="%" onChange={setMaxDti} />
            <SliderField label="Max PTI" value={maxPti} min={10} max={30} suffix="%" onChange={setMaxPti} />
          </div>
        </div>

        {/* Loan Amounts */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
          <h3 className="text-sm font-semibold mb-6">Loan Amounts</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="min-loan-amount" className="block text-xs text-gray-500 mb-1.5">Min Loan Amount ($)</label>
              <input id="min-loan-amount" type="number" value={minLoan} onChange={e => setMinLoan(Number(e.target.value))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
            </div>
            <div>
              <label htmlFor="max-loan-amount" className="block text-xs text-gray-500 mb-1.5">Max Loan Amount ($)</label>
              <input id="max-loan-amount" type="number" value={maxLoan} onChange={e => setMaxLoan(Number(e.target.value))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
            </div>
          </div>
        </div>

        {/* Vehicle Rules */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
          <h3 className="text-sm font-semibold mb-6">Vehicle Rules</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Max Vehicle Age (years)</label>
              <input type="number" value={maxAge} onChange={e => setMaxAge(Number(e.target.value))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Max Mileage</label>
              <input type="number" value={maxMileage} onChange={e => setMaxMileage(Number(e.target.value))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
            </div>
          </div>
          <Toggle label="Accept Certified Pre-Owned" value={acceptCPO} onChange={setAcceptCPO} />
          <Toggle label="Accept Private Party" value={acceptPP} onChange={setAcceptPP} />
          <Toggle label="Accept ITIN Borrowers" value={acceptITIN} onChange={setAcceptITIN} />
        </div>

        {/* Rate Tiers */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
          <h3 className="text-sm font-semibold mb-6">Rate Tiers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 text-[10px] text-gray-500 uppercase tracking-wider">FICO Range</th>
                  <th className="text-left py-3 px-3 text-[10px] text-gray-500 uppercase tracking-wider">Rate Range</th>
                </tr>
              </thead>
              <tbody>
                {rateTiers.map((tier, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-3 px-3 text-gray-700">{tier.ficoMin} - {tier.ficoMax}</td>
                    <td className="py-3 px-3 text-gray-700">{tier.rateMin}% - {tier.rateMax}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save */}
        <button onClick={save} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-xl transition-colors cursor-pointer text-gray-900">
          {saved ? 'Saved' : 'Save Changes'}
        </button>

        {/* Change History */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
          <h3 className="text-sm font-semibold mb-4">Change History</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Changed By', 'Date', 'Field', 'Old', 'New'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-[10px] text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {changeHistory.map((ch, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-3 px-3 text-gray-500">{ch.by}</td>
                  <td className="py-3 px-3 text-gray-500">{ch.date}</td>
                  <td className="py-3 px-3">{ch.field}</td>
                  <td className="py-3 px-3 text-red-500">{ch.oldVal}</td>
                  <td className="py-3 px-3 text-green-600">{ch.newVal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
