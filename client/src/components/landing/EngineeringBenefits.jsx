import React from 'react';
import { Gauge, ShieldCheck, Zap, Leaf, Layers, LineChart } from 'lucide-react';

export function EngineeringBenefits() {
  const benefits = [
    {
      icon: Gauge,
      title: 'Autonomous Throughput',
      tag: '< 3.0s Cycle Time',
      description: 'Fully automated sequential detection and servo lift eliminates manual gatekeepers, ticketing bottlenecks, and vehicle queueing delays.'
    },
    {
      icon: Leaf,
      title: 'Reduced Emissions & Fuel Waste',
      tag: 'Eco-Optimized',
      description: 'Instant external vacancy indicators on the 16x2 LCD and web dashboard prevent vehicles from needlessly circling when the facility is at capacity.'
    },
    {
      icon: Zap,
      title: 'Sub-50ms Telemetry Streaming',
      tag: 'USB CDC UART to WS',
      description: 'Zero polling latency: state transitions propagate from ATmega328P hardware registers to the Node.js bridge and browser clients instantly.'
    },
    {
      icon: ShieldCheck,
      title: 'Brownout-Resistant Power Design',
      tag: 'Decoupled 5V Rail',
      description: 'Integrated 100µF–470µF electrolytic decoupling capacitors eliminate SG90 inrush current dips, preventing ATmega328P MCU resets.'
    },
    {
      icon: Layers,
      title: 'Deterministic Dual Emulation',
      tag: 'Zero-Hardware Mock Mode',
      description: 'Full stack development and QA can proceed without physical microcontrollers attached, utilizing our virtual Poisson arrival generator.'
    },
    {
      icon: LineChart,
      title: 'Predictive Capacity Modeling',
      tag: 'SEVI & Erlang-B Loss',
      description: 'Built-in analytics algorithms calculate turn-away ratios and recommend expansion bays to guarantee service denial remains below 5%.'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-200/90">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Value Propositions
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">
          Engineering Pros & Facility Benefits
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          Measurable advantages of deploying hardware-assisted smart parking architectures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 relative group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {item.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
