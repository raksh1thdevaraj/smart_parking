import React from 'react';
import { useTelemetry } from '../../context/WebSocketContext';
import { ShieldCheck, LogOut, LayoutDashboard, Compass, UserCheck, Eye } from 'lucide-react';
import { CarLogo } from '../common/CarLogo';

export function Navbar({
  isAuthenticated = false,
  activeView = 'showcase',
  onNavigateToAdmin,
  onNavigateToShowcase,
  onLogout
}) {
  const { telemetry, connectionStatus, toggleMode } = useTelemetry();

  const isHardware = telemetry.mode === 'HARDWARE';

  return (
    <header className="sticky top-0 left-0 right-0 z-50 frosted-nav px-4 sm:px-8 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div
          onClick={onNavigateToShowcase}
          className="flex items-center gap-3 cursor-pointer select-none group"
          title="Return to Live Showcase"
        >
          <CarLogo className="w-10 h-10 group-hover:scale-105 transition-transform" animated={true} />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              SmartPark <span className="text-blue-600">IoT</span>
            </h1>
          </div>
        </div>

        {/* Public Visitor Anchor Navigation Links (Visible when NOT logged in or in Showcase View) */}
        {!isAuthenticated && activeView === 'showcase' && (
          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-semibold text-slate-600">
            <a
              href="#digital-twin"
              className="hover:text-blue-600 transition flex items-center gap-1.5"
            >
              <span>3D Twin</span>
            </a>
            <a
              href="#mechanism"
              className="hover:text-blue-600 transition"
            >
              Mechanism
            </a>
            <a
              href="#component-explorer"
              className="hover:text-blue-600 transition"
            >
              Sensors
            </a>
            <a
              href="#circuit-diagram"
              className="hover:text-blue-600 transition"
            >
              Circuit
            </a>
            <a
              href="#bom"
              className="hover:text-blue-600 transition"
            >
              BOM
            </a>
          </nav>
        )}

        {/* Live Hardware Telemetry Pill */}
        <div className="hidden md:flex items-center gap-3">
          <div className="bg-white/95 px-3 py-1.5 rounded-xl flex items-center gap-2.5 text-xs font-mono border border-slate-200 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                connectionStatus === 'CONNECTED' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}></span>
            </span>
            <span className="text-slate-600">
              STATUS:{' '}
              <strong className={isHardware ? 'text-emerald-600' : 'text-slate-700 font-mono font-semibold'}>
                {isHardware ? `ONLINE (${telemetry.port || 'USB'})` : 'STANDBY'}
              </strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">{isHardware ? `${telemetry.packetsPerSec} pkt/s` : 'WAITING'}</span>
          </div>

          {/* Mode Switch Toggle Button */}
          <button
            onClick={() => toggleMode(isHardware ? 'SIMULATION' : 'HARDWARE')}
            className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition font-medium shadow-sm"
            title="Toggle between Physical Arduino USB and Virtual Software Simulation"
          >
            {isHardware ? 'Switch to Simulation' : 'Scan for Hardware'}
          </button>
        </div>

        {/* Right Action Buttons: Conditionally Rendered by Auth State */}
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            /* 1. PUBLIC / VISITOR VIEW: Render "Admin Portal" Login Button */
            <button
              onClick={onNavigateToAdmin}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm ${
                activeView === 'admin'
                  ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-400 font-bold'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Admin Portal</span>
            </button>
          ) : (
            /* 2. AUTHENTICATED VIEW: Admin Chip + View Switcher + Logout Button */
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Admin Profile Chip */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold">Admin Active</span>
              </div>

              {/* View Switcher Button */}
              {activeView === 'admin' ? (
                <button
                  onClick={onNavigateToShowcase}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 shadow-sm transition"
                  title="View 3D Digital Twin & Public Landing Page"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Showcase</span>
                </button>
              ) : (
                <button
                  onClick={onNavigateToAdmin}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs sm:text-sm font-semibold transition shadow-sm"
                  title="Return to Facility Admin Portal"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-600" />
                  <span>Dashboard</span>
                </button>
              )}

              {/* Distinct Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-semibold transition shadow-sm"
                title="End Admin Session"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
