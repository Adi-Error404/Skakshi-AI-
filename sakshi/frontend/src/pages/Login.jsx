import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth, SEED_USERS } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('spdysp@demo.in');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (demoUser) => {
    setEmail(demoUser.email);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Background visual accents */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* Header */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-800 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-teal-900/50">
            सा
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-slate-100 flex items-center gap-2">
              SAKSHI
              <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 font-mono font-medium">
                PROTOTYPE
              </span>
            </h1>
            <p className="text-xs text-slate-400">Evidence-Defensible Criminal Network Intelligence Workbench</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xs font-mono text-slate-400">STATE POLICE CYBER CELL</div>
          <div className="text-[10px] text-teal-400">SECURE INVESTIGATIVE VAULT</div>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto z-10 my-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-100">Investigator Access</h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in with institutional credentials to access case dossiers and analytical graphs.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/80 rounded-lg flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Official Email ID</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investigator@demo.in"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Security Passcode</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500 transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-teal-950/60 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : (
                <>
                  <span>Initialize Workbench</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Chips */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Demo Accounts (Click to Autofill)
              </span>
              <span className="text-[10px] font-mono text-amber-400/90">pwd: demo123</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {SEED_USERS.map((u) => {
                const isSelected = email === u.email;
                return (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => autofill(u)}
                    className={`text-left px-3 py-2 rounded-lg border text-xs transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-950/50 border-teal-500/50 text-teal-200'
                        : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{u.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{u.email}</div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-teal-300">
                      {u.role.replace('_', ' ')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Persistent Footer Banner */}
      <div className="text-center z-10 py-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-amber-300/90 font-medium shadow-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Synthetic data. Patterns for investigator review. Not an accusation.</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
