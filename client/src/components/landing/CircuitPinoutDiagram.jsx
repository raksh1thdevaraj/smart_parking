import React, { useState } from 'react';
import { Cpu, Check, Layers, Zap, Info } from 'lucide-react';

export function CircuitPinoutDiagram() {
  const [activePinGroup, setActivePinGroup] = useState('ALL');

  const pinMappings = [
    {
      group: 'SERVO',
      component: 'SG90 Micro Servo',
      pin: 'PWM Pin 2',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      voltage: '5V (50Hz PWM)',
      notes: 'Timer-driven pulse width (1.0ms–2.0ms). Controls barrier arm lift angle (0° to 90°).'
    },
    {
      group: 'ENTRY_SENSOR',
      component: 'HC-SR04 #1 (Entry Trig)',
      pin: 'Digital Pin 6',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      voltage: '5V TTL Output',
      notes: 'Transmits 10µs ultrasonic trigger burst to activate entry proximity scan.'
    },
    {
      group: 'ENTRY_SENSOR',
      component: 'HC-SR04 #1 (Entry Echo)',
      pin: 'Digital Pin 7',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      voltage: '5V TTL Input',
      notes: 'Receives echo reflection. pulseIn(..., 25000UL) computes distance in cm without blocking.'
    },
    {
      group: 'EXIT_SENSOR',
      component: 'HC-SR04 #2 (Exit Trig)',
      pin: 'Digital Pin 8',
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      voltage: '5V TTL Output',
      notes: 'Transmits ultrasonic burst to detect vehicle departing from parking bays.'
    },
    {
      group: 'EXIT_SENSOR',
      component: 'HC-SR04 #2 (Exit Echo)',
      pin: 'Digital Pin 9',
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      voltage: '5V TTL Input',
      notes: 'Receives departure echo. Confirms car exit and triggers slot availability increment.'
    },
    {
      group: 'LCD_I2C',
      component: '16x2 LCD (PCF8574 SDA)',
      pin: 'Analog Pin A4 (SDA)',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      voltage: 'I2C Data Bus',
      notes: 'Hardware Two-Wire Interface (TWI) data line. Communicates at address 0x27 or 0x3F.'
    },
    {
      group: 'LCD_I2C',
      component: '16x2 LCD (PCF8574 SCL)',
      pin: 'Analog Pin A5 (SCL)',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      voltage: 'I2C Clock Bus',
      notes: 'Hardware TWI clock line synchronized at 100kHz.'
    },
    {
      group: 'POWER',
      component: 'Power Decoupling',
      pin: '5V Rail & Common GND',
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      voltage: '5.0V DC Regulated',
      notes: '100µF–470µF electrolytic capacitor placed across servo power leads to suppress brown-outs.'
    }
  ];

  const filtered = activePinGroup === 'ALL'
    ? pinMappings
    : pinMappings.filter(p => p.group === activePinGroup);

  return (
    <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-200/90">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Hardware Wiring Specifications
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">
          Interactive Arduino UNO Pinout Diagram
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          Strict wiring integrity matching reference hardware without alteration.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {[
          { id: 'ALL', label: 'All Connections (8)' },
          { id: 'SERVO', label: 'SG90 Servo (Pin 2)' },
          { id: 'ENTRY_SENSOR', label: 'Entry HC-SR04 (Pins 6, 7)' },
          { id: 'EXIT_SENSOR', label: 'Exit HC-SR04 (Pins 8, 9)' },
          { id: 'LCD_I2C', label: '16x2 I2C LCD (A4, A5)' },
          { id: 'POWER', label: '5V Decoupling Rail' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePinGroup(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border shadow-sm ${
              activePinGroup === tab.id
                ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pinout Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-mono uppercase tracking-wider text-slate-700 font-bold">
                <th className="py-3.5 px-4 sm:px-6">Component / Function</th>
                <th className="py-3.5 px-4 sm:px-6">Arduino UNO Pin</th>
                <th className="py-3.5 px-4 sm:px-6">Signal / Voltage</th>
                <th className="py-3.5 px-4 sm:px-6">Circuit Integrity Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans">
              {filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                    {item.component}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-mono">
                    <span className={`px-2.5 py-1 rounded-md border text-xs font-bold ${item.color}`}>
                      {item.pin}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-700 font-medium">
                    {item.voltage}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-600 leading-relaxed max-w-md">
                    {item.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hardware Tip Card */}
      <div className="mt-6 bg-amber-50/80 p-4 rounded-xl border border-amber-200 flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-amber-900 font-semibold">Important Electrical Integrity Notice:</strong> SG90 servo motor inrush currents during rapid movement can drop ATmega328P VCC below Brown-Out Detection threshold (4.3V). Always install a <strong>100µF to 470µF electrolytic capacitor</strong> directly across the 5V and GND rail near the servo leads to prevent brownout resets.
        </div>
      </div>
    </section>
  );
}
