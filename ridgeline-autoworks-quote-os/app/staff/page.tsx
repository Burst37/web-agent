'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DollarSign, Cpu, BarChart3, ArrowLeft, RefreshCw, Send } from 'lucide-react';

export default function StaffQuotingPortal() {
  const [vinOrModel, setVinOrModel] = useState('2017 Volkswagen Passat TSI R-Line');
  const [symptoms, setSymptoms] = useState('Front brakes grinding, rotor vibration above 45mph');
  const [loading, setLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState<any>(null);

  const calculateStaffQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: symptoms, isStaff: true, vehicleInput: vinOrModel })
      });
      const data = await res.json();
      setQuoteResult(data);
    } catch (e) {
      alert('Failed to connect to backend engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-lg text-slate-950 font-black"><Cpu className="w-5 h-5" /></div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white">INTERNAL REVENUE & QUOTE ADVISOR</h1>
              <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Staff Only</span>
            </div>
          </div>
        </div>
        <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition">
          <ArrowLeft className="w-4 h-4" /> Customer View
        </Link>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Work Order Parameters
            </h2>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Vehicle / VIN:</label>
              <input type="text" value={vinOrModel} onChange={e => setVinOrModel(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs px-3 py-2 rounded text-white focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Scope / Symptoms:</label>
              <textarea rows={4} value={symptoms} onChange={e => setSymptoms(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs p-3 rounded text-white focus:outline-none" />
            </div>
            <button onClick={calculateStaffQuote} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50">
              <Send className="w-4 h-4" /> {loading ? 'Computing...' : 'Calculate Complete Staff Matrix'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-7">
          {quoteResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                  <div className="text-[11px] text-slate-400">Customer Total</div>
                  <div className="text-xl font-black text-white">${quoteResult.totalCustomerPrice.toFixed(2)}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                  <div className="text-[11px] text-slate-400">Internal Cost</div>
                  <div className="text-xl font-black text-rose-400">${quoteResult.internalNetCost.toFixed(2)}</div>
                </div>
                <div className="bg-slate-950 border border-emerald-900/40 p-4 rounded-lg bg-emerald-950/10">
                  <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> Margin</div>
                  <div className="text-xl font-black text-emerald-400">{quoteResult.internalProfitMargin}%</div>
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400"><span>Labor ({quoteResult.laborHours}h @ ${quoteResult.laborRate}/h):</span><span className="text-white">${quoteResult.laborSubtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-400"><span>Parts Subtotal:</span><span className="text-white">${quoteResult.partsSubtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-400"><span>Supplies Fee:</span><span className="text-white">${quoteResult.shopSupplies.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1"><span>Tax (8.25%):</span><span className="text-white">${quoteResult.tax.toFixed(2)}</span></div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-900/40 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-12 text-center text-slate-500 text-xs">
              <DollarSign className="w-8 h-8 mb-2 opacity-50" />
              <span>Enter vehicle and diagnostic symptoms to inspect the staff matrix.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
