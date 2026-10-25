import React from 'react';
import { ArrowRight, CheckCircle2, ShieldAlert, Cpu, Zap, Timer } from 'lucide-react';

export function WorkingMechanism() {
  const steps = [
    {
      step: '01',
      title: 'Ultrasonic Pulse Emission & Reflection',
      sensor: 'HC-SR04 (Trig Pin 6 / Echo Pin 7)',
      detail: 'The Arduino generates a 10µs TTL HIGH pulse on the Trigger pin. 8 sonic bursts (40kHz) propagate forward and reflect off approaching vehicles.'
    },
    {
      step: '02',
      title: 'Bounded Non-Blocking Echo Capture',
      sensor: 'pulseIn(echoPin, HIGH, 25000UL)',
      detail: 'Eliminates standard 1000ms freeze bug with a 25ms cap. Distance is computed via d = (t × 0.034)/2 cm. Readings of 0 or >10cm are safely filtered.'
    },
    {
      step: '03',
      title: 'Capacity Decision & Gate Actuation',
      sensor: 'SG90 Micro Servo (Pin 2 PWM)',
      detail: 'If available slots > 0: slots decrements, servo rotates to 90° (open), and holds for 3000ms. If slots == 0: gate stays closed and Denied Service increments.'
    },
    {
      step: '04',
      title: 'Hardware LCD & Serial Telemetry Sync',
      sensor: '16x2 I2C LCD (A4/A5) & UART 9600',
      detail: 'The PCF8574 I2C display prints "HAVE LOT: X/4". Simultaneously, USB Serial broadcasts DATA:S,O,T,D,G to the Node.js WebSocket cloud bridge.'
    },
    {
      step: '05',
      title: 'Automated Departure & Slot Reclaim',
      sensor: 'Exit HC-SR04 (Trig Pin 8 / Echo Pin 9)',
      detail: 'Departing vehicles trigger the exit sensor. Occupied count decrements, available count increments, and the barrier arm lifts to release the vehicle.'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-200/90">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Architecture & Physics
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">
          Working Mechanism & Detection Logic
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          How the dual ultrasonic sensors, ATmega328P state machine, and servo boom gate collaborate autonomously.
        </p>
      </div>

      {/* Step Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black font-mono text-emerald-600/30">{item.step}</span>
                <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 font-semibold">
                  {item.sensor}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Automated Edge State</span>
            </div>
          </div>
        ))}

        {/* Highlight Card: Bug Fix Showcase */}
        <div className="bg-gradient-to-br from-emerald-50/80 to-white p-6 rounded-2xl border border-emerald-200 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 mb-3">
              <Zap className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Engineering Fix</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Elimination of the pulseIn() Freeze</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Standard Arduino sketches call <code className="text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded font-mono">pulseIn(echoPin, HIGH)</code> with default 1,000,000µs timeout. An unreflected burst freezes the MCU for 1 full second and returns 0, falsely triggering <code className="text-rose-700 font-mono">0cm &lt; 10cm</code>. Our 25ms timeout with sanity threshold safeguards continuous 60Hz loop execution.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-200 text-[11px] font-mono text-emerald-800 font-semibold flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-emerald-600" />
            <span>25ms Timeout Cap Enforced</span>
          </div>
        </div>
      </div>
    </section>
  );
}
