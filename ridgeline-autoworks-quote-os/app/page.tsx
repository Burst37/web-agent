'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Wrench, ShieldCheck, Clock, MessageSquare, Send, X, CheckCircle, ChevronRight } from 'lucide-react';

export default function ExternalLandingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [vehicle, setVehicle] = useState('');
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'ai' | 'user'; text?: string; quote?: any }>>([
    {
      role: 'ai',
      text: 'Welcome to Ridgeline Autoworks. Enter your vehicle Year/Make/Model (or VIN) and what issues you are experiencing to receive an instant verified quote.'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, loading]);

  const handleSendMessage = async () => {
    if (!inputMsg.trim()) return;
    const userText = inputMsg;
    setInputMsg('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, isStaff: false, vehicleInput: vehicle || '2017 Honda Civic EX' })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'ai', quote: data }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Service connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500 p-2 rounded-lg text-slate-950">
            <Wrench className="w-5 h-5 font-bold" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white">RIDGELINE AUTOWORKS</h1>
            <p className="text-xs text-sky-400 font-medium">PRECISION MECHANICAL & DIAGNOSTICS</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/staff" className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md border border-slate-700 transition">
            Staff Portal
          </Link>
          <button onClick={() => setIsOpen(true)} className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-md shadow-lg transition">
            Get Instant Quote
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col justify-center">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              Autonomous Quoting Engine v2.0
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Honest Auto Repair. <br /><span className="text-sky-400">Guaranteed Instant Pricing.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              No guesswork. Our OEM-integrated AI engine cross-references exact parts catalogs and repair times to provide binding estimates in under 20 seconds.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-sky-400" /> 24-Mo / 24k-Mi Warranty
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <Clock className="w-4 h-4 text-sky-400" /> 20-Second Quotes
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <CheckCircle className="w-4 h-4 text-sky-400" /> Certified Techs
              </div>
            </div>
            <div>
              <button onClick={() => setIsOpen(true)} className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-6 py-3 rounded-lg text-sm transition">
                Start Free Quote <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 bg-sky-500 hover:bg-sky-400 text-slate-950 p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold z-50 transition transform hover:scale-105">
          <MessageSquare className="w-6 h-6" />
          <span className="text-sm">Get Free Quote</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-md h-[600px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              <span className="font-bold text-sm text-white">Ridgeline Instant Quoting Agent</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {chatHistory.map((item, i) => (
              <div key={i} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {item.role === 'user' ? (
                  <div className="bg-sky-600 text-white px-4 py-2.5 rounded-2xl max-w-[80%] rounded-tr-none">{item.text}</div>
                ) : item.quote ? (
                  <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 max-w-[90%] space-y-3">
                    <div className="border-b border-slate-700 pb-2">
                      <div className="text-[10px] text-sky-400 font-bold uppercase">OFFICIAL QUOTE ESTIMATE</div>
                      <div className="text-sm font-bold text-white">{item.quote.vehicle}</div>
                    </div>
                    <div className="space-y-1 text-slate-300">
                      {item.quote.parts.map((p: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-[11px] text-slate-400">
                          <span>• {p.name}</span>
                          <span>${p.retailPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-700 pt-2 space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-400"><span>Parts:</span><span>${item.quote.partsSubtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between text-slate-400"><span>Labor ({item.quote.laborHours}h):</span><span>${item.quote.laborSubtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between text-slate-400"><span>Supplies:</span><span>${item.quote.shopSupplies.toFixed(2)}</span></div>
                      <div className="flex justify-between text-slate-400"><span>Tax:</span><span>${item.quote.tax.toFixed(2)}</span></div>
                      <div className="flex justify-between font-bold text-sm text-sky-400 border-t border-slate-700/60 pt-1.5">
                        <span>Total:</span><span>${item.quote.totalCustomerPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800 text-slate-200 px-4 py-2.5 rounded-2xl max-w-[85%] rounded-tl-none border border-slate-700">{item.text}</div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-400 dot-1"></div>
                  <div className="w-2 h-2 rounded-full bg-sky-400 dot-2"></div>
                  <div className="w-2 h-2 rounded-full bg-sky-400 dot-3"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-slate-800 bg-slate-900/90 space-y-2">
            <input
              type="text"
              placeholder="Vehicle (e.g. 2017 VW Passat TSI)"
              value={vehicle}
              onChange={e => setVehicle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs px-3 py-1.5 rounded-md text-white placeholder-slate-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Describe issue (e.g. grinding front brakes)..."
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-950 border border-slate-700 text-xs px-3 py-2 rounded-md text-white placeholder-slate-500 focus:outline-none"
              />
              <button onClick={handleSendMessage} disabled={loading} className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 rounded-md font-bold text-xs flex items-center justify-center">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
