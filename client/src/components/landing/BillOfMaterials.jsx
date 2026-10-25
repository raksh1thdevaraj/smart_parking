import React from 'react';
import { Package, Shield, ExternalLink } from 'lucide-react';

export function BillOfMaterials() {
  const materials = [
    {
      item: 'Arduino UNO R3',
      qty: 1,
      specs: 'ATmega328P MCU, 16MHz Clock, 32KB Flash, 2KB SRAM',
      pins: 'Pin 2, 6, 7, 8, 9, A4, A5, 5V, GND',
      role: 'Main Embedded Controller running real-time non-blocking state machine'
    },
    {
      item: 'SG90 Micro Servo (9g)',
      qty: 1,
      specs: 'Operating Voltage: 4.8V–6V, Stall Torque: 1.8 kg·cm',
      pins: 'Digital Pin 2 (PWM), 5V, GND',
      role: 'Physical Boom Barrier Gate Actuator (rotates 0° to 90°)'
    },
    {
      item: 'HC-SR04 Ultrasonic Sensor (Entry)',
      qty: 1,
      specs: 'Frequency: 40kHz, Range: 2cm–400cm, Accuracy: 3mm',
      pins: 'Trig: Pin 6, Echo: Pin 7, 5V, GND',
      role: 'Vehicle entry proximity detector (<10cm trigger threshold)'
    },
    {
      item: 'HC-SR04 Ultrasonic Sensor (Exit)',
      qty: 1,
      specs: 'Frequency: 40kHz, Range: 2cm–400cm, Accuracy: 3mm',
      pins: 'Trig: Pin 8, Echo: Pin 9, 5V, GND',
      role: 'Vehicle departure detector for slot reclamation'
    },
    {
      item: '16x2 Character LCD w/ I2C Backpack',
      qty: 1,
      specs: 'PCF8574 Expander, Default Address: 0x27 (or 0x3F)',
      pins: 'SDA: A4, SCL: A5, 5V, GND',
      role: 'Hardware driver status display (HAVE LOT: X/4)'
    },
    {
      item: 'Decoupling Capacitor',
      qty: 1,
      specs: '100µF – 470µF 16V Low-ESR Electrolytic',
      pins: 'Across 5V Rail and Common GND',
      role: 'Suppresses SG90 inrush current dips, preventing MCU brownouts'
    },
    {
      item: 'Solderless Breadboard & Jumper Wires',
      qty: 1,
      specs: '400/830 tie-points, 20x Dupont M-M / M-F jumpers',
      pins: 'Power Rails & Interconnects',
      role: 'Prototyping circuit distribution and bus rails'
    },
    {
      item: 'USB Type-A to Type-B Cable',
      qty: 1,
      specs: 'High-speed shielded, 1.5m, 5V power + CDC UART',
      pins: 'USB Interface (9600 Baud, 8N1)',
      role: 'Powers Arduino and transmits structured telemetry to Node.js bridge'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-200/90">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Hardware Requisites
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">
          Bill of Materials (BOM)
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          Complete hardware list matching the reference circuit with exact electrical specifications.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-mono uppercase tracking-wider text-slate-700 font-bold">
                <th className="py-3.5 px-4 sm:px-6">Component</th>
                <th className="py-3.5 px-4 text-center">Qty</th>
                <th className="py-3.5 px-4 sm:px-6">Technical Specs</th>
                <th className="py-3.5 px-4 sm:px-6">Arduino Connections</th>
                <th className="py-3.5 px-4 sm:px-6">Primary Function</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans">
              {materials.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                    {m.item}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700 bg-emerald-50/50">
                    {m.qty}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-600 font-mono text-[11px]">
                    {m.specs}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-mono text-amber-800 font-semibold text-[11px]">
                    {m.pins}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-600 leading-relaxed">
                    {m.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
