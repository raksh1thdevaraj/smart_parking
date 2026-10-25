import React, { useState } from 'react';
import { Lock, User, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export function AdminLogin({ onLoginSuccess, onBackToLanding }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('adminparking2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        localStorage.setItem('smart_parking_admin_token', data.token);
        onLoginSuccess(data.token);
      } else {
        setError(data.message || 'Invalid administrator credentials');
      }
    } catch (err) {
      // In case network fetch fails, allow local demo sign-in if matching default credentials
      if (username === 'admin' && password === 'adminparking2026') {
        const mockToken = 'mock-jwt-admin-token-2026';
        localStorage.setItem('smart_parking_admin_token', mockToken);
        onLoginSuccess(mockToken);
      } else {
        setError('Connection error or invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200/90 shadow-2xl p-8 rounded-3xl relative">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-6 font-mono font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to 3D Showcase</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-3">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Facility Admin Portal</h2>
          <p className="text-xs text-slate-500 mt-1">Authenticate to access hardware overrides and capacity optimization</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono transition"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono transition"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
            </button>
          </div>
        </form>

        {/* Demo Credentials Helper Pill */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] font-mono text-slate-500">
            Default Demo Credentials: <span className="text-blue-600 font-bold">admin</span> / <span className="text-blue-600 font-bold">adminparking2026</span>
          </p>
        </div>
      </div>
    </div>
  );
}
