import React from 'react';
import { ArrowDown, CheckCircle2, Car, ShieldCheck, Zap } from 'lucide-react';

export function Hero({ onExploreClick, onAdminClick }) {
  const features = [
    {
      icon: Car,
      title: 'Automated Entry & Exit',
      desc: 'Sensors detect vehicles arriving at the gate and departing the facility without requiring paper tickets or manual attendants.'
    },
    {
      icon: Zap,
      title: 'Motorized Smart Barrier',
      desc: 'The barrier arm lifts automatically when parking spaces are free, and securely closes after the car has pulled through.'
    },
    {
      icon: CheckCircle2,
      title: 'Real-Time Spot Counter',
      desc: 'Tracks available and filled parking spaces in real-time on both the physical LCD screen and this 3D dashboard.'
    },
    {
      icon: ShieldCheck,
      title: 'Prevents Overcrowding',
      desc: 'When all slots are full, the barrier stays down and immediately alerts drivers, preventing traffic jams and congestion.'
    }
  ];

  return (
    <section className="relative pt-8 pb-10 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-blue-400/10 blur-[130px] pointer-events-none -z-10 rounded-full" />

      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-semibold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>Next-Gen IoT Parking Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          Smart Car Parking{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
            System & Digital Twin
          </span>
        </h1>

        {/* Clear, Simple-Terms Project Description */}
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          An automated parking management system that uses smart sensors and a motorized gate to guide drivers, track empty parking bays, and prevent overcrowding — all synced live to this 3D digital model.
        </p>

        {/* 4 Feature Cards */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onExploreClick}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-lg shadow-blue-500/25 flex items-center gap-2 font-mono"
          >
            <span>Explore 3D Digital Twin</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>
          <button
            onClick={onAdminClick}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm transition font-mono shadow-sm"
          >
            Facility Admin Portal
          </button>
        </div>
      </div>
    </section>
  );
}
