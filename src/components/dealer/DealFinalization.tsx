"use client";

import { useState, useEffect } from 'react';
import { MockApplication, MOCK_OFFERS } from '@/lib/mock-data';
import { formatCurrency, formatAPR } from '@/lib/format-utils';
import { computeMonthlyPayment, computeLTV } from '@/lib/underwriting-engine';

interface Props {
  selectedBuyer: MockApplication | null;
}

export default function DealFinalization({ selectedBuyer }: Props) {
  const [vin, setVin] = useState('');
  const [vinDecoded, setVinDecoded] = useState<{ year: string; make: string; model: string } | null>(null);
  const [vinLoading, setVinLoading] = useState(false);
  const [odometer, setOdometer] = useState('');
  const [condition, setCondition] = useState('used');
  const [stockNo, setStockNo] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [docFee, setDocFee] = useState('499');
  const [titleFee, setTitleFee] = useState('150');
  const [salesTax, setSalesTax] = useState('');
  const [addons, setAddons] = useState('');
  const [cashDown, setCashDown] = useState('');
  const [tradeYear, setTradeYear] = useState('');
  const [tradeMake, setTradeMake] = useState('');
  const [tradeModel, setTradeModel] = useState('');
  const [tradeACV, setTradeACV] = useState('');
  const [tradePayoff, setTradePayoff] = useState('');
  const [gapEnabled, setGapEnabled] = useState(false);
  const [gapPrice, setGapPrice] = useState('895');
  const [warrantyEnabled, setWarrantyEnabled] = useState(false);
  const [warrantyPrice, setWarrantyPrice] = useState('1495');
  const [submitted, setSubmitted] = useState(false);

  const offer = selectedBuyer ? MOCK_OFFERS.find(o => o.applicationId === selectedBuyer.id) : null;

  useEffect(() => {
    if (selectedBuyer) {
      setSalePrice(String(selectedBuyer.vehicle.askingPrice));
      setCashDown(String(selectedBuyer.dealStructure.downPayment));
      // Auto-compute sales tax at ~6.25%
      setSalesTax(String(Math.round(selectedBuyer.vehicle.askingPrice * 0.0625)));
    }
  }, [selectedBuyer]);

  const decodeVIN = async () => {
    if (vin.length !== 17) return;
    setVinLoading(true);
    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
      const data = await res.json();
      const results = data.Results as { Variable: string; Value: string | null }[];
      const year = results.find(r => r.Variable === 'Model Year')?.Value || '';
      const make = results.find(r => r.Variable === 'Make')?.Value || '';
      const model = results.find(r => r.Variable === 'Model')?.Value || '';
      setVinDecoded({ year, make, model });
    } catch {
      setVinDecoded(null);
    }
    setVinLoading(false);
  };

  // Compute totals
  const sp = Number(salePrice) || 0;
  const df = Number(docFee) || 0;
  const tf = Number(titleFee) || 0;
  const st = Number(salesTax) || 0;
  const ao = Number(addons) || 0;
  const gap = gapEnabled ? Number(gapPrice) || 0 : 0;
  const warranty = warrantyEnabled ? Number(warrantyPrice) || 0 : 0;
  const totalOut = sp + df + tf + st + ao + gap + warranty;
  const cd = Number(cashDown) || 0;
  const teq = (Number(tradeACV) || 0) - (Number(tradePayoff) || 0);
  const amountFinanced = totalOut - cd - Math.max(teq, 0);
  const ltv = computeLTV(amountFinanced, sp || 1);
  const monthlyPmt = offer ? computeMonthlyPayment(amountFinanced, offer.apr, offer.termMonths) : 0;
  const lenderMaxLtv = offer ? 120 : 120; // Demo
  const ltvExceeds = ltv > lenderMaxLtv;

  if (!selectedBuyer) {
    return (
      <div className="py-16 text-center">
        <svg className="w-10 h-10 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <p className="text-sm text-gray-500">Select a buyer from the inbox to start a deal.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Deal Submitted</h3>
        <p className="text-sm text-gray-500 mb-2">Deal ID: DEAL-{String(Date.now()).slice(-6)}</p>
        <p className="text-xs text-gray-500">Submitted to {offer?.lenderName || 'lender'}. Estimated funding: 2-5 business days.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Finalize Deal</h2>
        <p className="text-xs text-gray-500">{selectedBuyer.borrower.firstName} {selectedBuyer.borrower.lastName.charAt(0)}. -- {selectedBuyer.vehicle.year} {selectedBuyer.vehicle.make} {selectedBuyer.vehicle.model}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Details */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold mb-4">Vehicle Details</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input value={vin} onChange={e => setVin(e.target.value.toUpperCase())} maxLength={17} placeholder="VIN (17 characters)" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-600/50" />
                <button onClick={decodeVIN} disabled={vin.length !== 17 || vinLoading} className={`px-4 py-2.5 text-xs rounded-xl transition-colors cursor-pointer ${vin.length === 17 ? 'bg-blue-600 hover:bg-blue-500 text-gray-900' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
                  {vinLoading ? 'Decoding...' : 'Decode VIN'}
                </button>
              </div>
              {vinDecoded && (
                <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
                  Decoded: {vinDecoded.year} {vinDecoded.make} {vinDecoded.model}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <input value={odometer} onChange={e => setOdometer(e.target.value)} placeholder="Odometer" type="number" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
                <select value={condition} onChange={e => setCondition(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="cpo">Certified Pre-Owned</option>
                </select>
                <input value={stockNo} onChange={e => setStockNo(e.target.value)} placeholder="Stock # (internal)" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold mb-4">Final Pricing</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] text-gray-500 mb-1 block">Sale Price</label><input type="number" value={salePrice} onChange={e => { setSalePrice(e.target.value); setSalesTax(String(Math.round(Number(e.target.value) * 0.0625))); }} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" /></div>
              <div><label className="text-[10px] text-gray-500 mb-1 block">Doc Fee</label><input type="number" value={docFee} onChange={e => setDocFee(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" /></div>
              <div><label className="text-[10px] text-gray-500 mb-1 block">Title/Reg Fee</label><input type="number" value={titleFee} onChange={e => setTitleFee(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" /></div>
              <div><label className="text-[10px] text-gray-500 mb-1 block">Sales Tax</label><input type="number" value={salesTax} onChange={e => setSalesTax(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" /></div>
              <div><label className="text-[10px] text-gray-500 mb-1 block">Dealer Add-ons</label><input type="number" value={addons} onChange={e => setAddons(e.target.value)} placeholder="0" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" /></div>
            </div>
          </div>

          {/* Down Payment & Trade */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold mb-4">Down Payment & Trade-In</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="text-[10px] text-gray-500 mb-1 block">Cash Down</label><input type="number" value={cashDown} onChange={e => setCashDown(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" /></div>
              <input value={tradeYear} onChange={e => setTradeYear(e.target.value)} placeholder="Trade Year" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
              <input value={tradeMake} onChange={e => setTradeMake(e.target.value)} placeholder="Trade Make" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
              <input value={tradeModel} onChange={e => setTradeModel(e.target.value)} placeholder="Trade Model" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
              <input value={tradeACV} onChange={e => setTradeACV(e.target.value)} placeholder="ACV ($)" type="number" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
              <input value={tradePayoff} onChange={e => setTradePayoff(e.target.value)} placeholder="Payoff ($)" type="number" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
              {teq !== 0 && <div className="col-span-2 text-xs text-gray-500">Trade equity: <span className={teq > 0 ? 'text-green-600' : 'text-red-500'}>{formatCurrency(teq)}</span></div>}
            </div>
          </div>

          {/* F&I Products */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold mb-4">F&I Products</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-5 rounded-full cursor-pointer ${gapEnabled ? 'bg-blue-600' : 'bg-gray-200'}`} onClick={() => setGapEnabled(!gapEnabled)}>
                    <div className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform ${gapEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm">GAP Insurance</span>
                </div>
                {gapEnabled && <input type="number" value={gapPrice} onChange={e => setGapPrice(e.target.value)} className="w-24 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-right focus:outline-none" />}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-5 rounded-full cursor-pointer ${warrantyEnabled ? 'bg-blue-600' : 'bg-gray-200'}`} onClick={() => setWarrantyEnabled(!warrantyEnabled)}>
                    <div className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform ${warrantyEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm">Extended Warranty / VSC</span>
                </div>
                {warrantyEnabled && <input type="number" value={warrantyPrice} onChange={e => setWarrantyPrice(e.target.value)} className="w-24 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-right focus:outline-none" />}
              </div>
            </div>
          </div>
        </div>

        {/* Live Computation Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sticky top-20 space-y-4">
            <h3 className="text-sm font-semibold mb-2">Deal Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total Out-the-Door</span><span className="font-semibold">{formatCurrency(totalOut)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Cash Down</span><span>-{formatCurrency(cd)}</span></div>
              {teq > 0 && <div className="flex justify-between"><span className="text-gray-500">Trade Equity</span><span>-{formatCurrency(teq)}</span></div>}
              <div className="border-t border-gray-200 pt-2 flex justify-between"><span className="text-gray-700 font-medium">Amount Financed</span><span className="font-bold text-blue-600">{formatCurrency(amountFinanced)}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="text-center p-3 rounded-xl bg-gray-50">
                <div className={`text-lg font-bold ${ltvExceeds ? 'text-red-500' : 'text-green-600'}`}>{ltv}%</div>
                <div className="text-[10px] text-gray-500">LTV</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50">
                <div className="text-lg font-bold text-blue-600">{formatCurrency(monthlyPmt)}</div>
                <div className="text-[10px] text-gray-500">Est. Monthly</div>
              </div>
            </div>

            {offer && (
              <div className="text-xs text-gray-500 pt-2">
                <div>Lender: {offer.lenderName}</div>
                <div>APR: {formatAPR(offer.apr)} | Term: {offer.termMonths}mo</div>
                <div>Lender Max LTV: {lenderMaxLtv}%</div>
              </div>
            )}

            {ltvExceeds && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-500">
                Deal exceeds lender LTV maximum by {ltv - lenderMaxLtv}%. Reduce sale price or increase down payment.
              </div>
            )}

            <button
              onClick={() => setSubmitted(true)}
              disabled={ltvExceeds || !salePrice}
              className={`w-full py-3 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                ltvExceeds || !salePrice ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-gray-900'
              }`}
            >
              Submit to {offer?.lenderName || 'Lender'} for Funding
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
