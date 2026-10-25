import React, { useState, useEffect, useRef } from 'react';
import { WebSocketProvider, useTelemetry } from './context/WebSocketContext';
import { Navbar } from './components/landing/Navbar';
import { Hero } from './components/landing/Hero';
import { ParkingScene } from './components/3d/ParkingScene';
import { ComponentExplorer3D } from './components/3d/ComponentExplorer3D';
import { CircuitVisualizer3D } from './components/3d/CircuitVisualizer3D';
import { WorkingMechanism } from './components/landing/WorkingMechanism';
import { EngineeringBenefits } from './components/landing/EngineeringBenefits';
import { BillOfMaterials } from './components/landing/BillOfMaterials';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Cpu, Terminal, Sparkles, Layers } from 'lucide-react';

function MainContent() {
  const [currentView, setCurrentView] = useState('showcase'); // 'showcase' | 'admin'
  const [adminToken, setAdminToken] = useState(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('smart_parking_admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
    }
  }, []);

  const handleLoginSuccess = (token) => {
    setAdminToken(token);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('smart_parking_admin_token');
    setAdminToken(null);
    setCurrentView('showcase');
  };

  const scrollToScene = () => {
    if (sceneRef.current) {
      sceneRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFCFF] text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative">
      {/* Subtle modern background aura for high-end feel */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl opacity-50" />
      </div>

      <div>
        <Navbar
          isAuthenticated={!!adminToken}
          activeView={currentView}
          onNavigateToAdmin={() => setCurrentView('admin')}
          onNavigateToShowcase={() => setCurrentView('showcase')}
          onLogout={handleLogout}
        />

        {currentView === 'showcase' ? (
          <main className="space-y-12 pt-2">
            <Hero
              onExploreClick={scrollToScene}
              onAdminClick={() => setCurrentView('admin')}
            />

            {/* 3D Interactive Hero Digital Twin Section */}
            <section id="digital-twin" ref={sceneRef} className="py-4 px-4 sm:px-8 max-w-7xl mx-auto scroll-mt-20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Real-Time Simulation
                    </span>
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    Interactive 3D Digital Twin & Simulation
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Real-time procedural 3D model driven by ATmega328P serial telemetry. Trigger vehicle entry/exit simulations or toggle live hardware sync.
                  </p>
                </div>
              </div>

              <ParkingScene />
            </section>

            {/* Educational Working Mechanism & Sensor Physics */}
            <div id="mechanism" className="scroll-mt-20">
              <WorkingMechanism />
            </div>

            {/* High-Detail 3D Component Explorer (HC-SR04, SG90, Arduino LCD) */}
            <div id="component-explorer" className="scroll-mt-20">
              <ComponentExplorer3D />
            </div>

            {/* Interactive 3D Breadboard Circuit Visualizer */}
            <div id="circuit-diagram" className="scroll-mt-20">
              <CircuitVisualizer3D />
            </div>

            {/* Operational Pros & Engineering Benefits */}
            <EngineeringBenefits />

            {/* Hardware Bill of Materials */}
            <div id="bom" className="scroll-mt-20">
              <BillOfMaterials />
            </div>
          </main>
        ) : (
          <main className="pt-2">
            {adminToken ? (
              <AdminDashboard onLogout={handleLogout} />
            ) : (
              <AdminLogin
                onLoginSuccess={handleLoginSuccess}
                onBackToLanding={() => setCurrentView('showcase')}
              />
            )}
          </main>
        )}
      </div>

      {/* Technical Highlights & Engineering Architecture Bottom Bar */}
      <footer className="mt-20 border-t border-slate-200/90 bg-white py-12 px-4 sm:px-8 text-xs text-slate-600 shadow-sm">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Technical Unique Points Grid */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-800 font-bold">
                Project Technical Innovations & Engineering Highlights
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Point 1 */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-blue-300 hover:shadow-md transition">
                <div className="flex items-center gap-2 text-blue-700 font-bold mb-1.5 text-[13px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Non-Blocking FSM Architecture</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Asynchronous <code className="text-blue-700 font-mono font-medium">millis()</code> state machine with bounded 25ms ultrasonic timeouts eliminates pulseIn hanging and sensor freezes.
                </p>
              </div>

              {/* Point 2 */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1.5 text-[13px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Real-Time 3D Digital Twin</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Sub-100ms hardware-to-virtual telemetry bridge streaming ATmega328P state packets via low-overhead WebSockets.
                </p>
              </div>

              {/* Point 3 */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-teal-300 hover:shadow-md transition">
                <div className="flex items-center gap-2 text-teal-700 font-bold mb-1.5 text-[13px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                  <span>Sequential Sonar Handshake</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Dual ultrasonic echo distance verification detects vehicle approach, passage, and departure directionality with zero false counts.
                </p>
              </div>

              {/* Point 4 */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-amber-300 hover:shadow-md transition">
                <div className="flex items-center gap-2 text-amber-700 font-bold mb-1.5 text-[13px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span>Autonomous Closed-Loop Gating</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Servo-actuated boom barrier with automatic anti-crush hold intervals, slot-exhaustion refusal logic, and I2C LCD broadcast.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Summary Bar */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-slate-900 font-bold">SmartPark IoT</span>
              <span>•</span>
              <span>Autonomous Embedded Parking Infrastructure & Simulation</span>
            </div>
            <div>
              Deterministic Hardware Integration • Edge-to-Cloud Telemetry
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WebSocketProvider>
      <MainContent />
    </WebSocketProvider>
  );
}
