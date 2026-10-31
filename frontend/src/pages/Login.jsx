import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@retailsync.ai');
  const [password, setPassword] = useState('Password@123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const demoAccounts = [
    { role: 'Admin', email: 'admin@retailsync.ai', desc: 'Full system & ML configuration' },
    { role: 'Inventory Mgr', email: 'inventory@retailsync.ai', desc: 'Stockouts & demand forecasts' },
    { role: 'Sales Mgr', email: 'sales@retailsync.ai', desc: 'Omnichannel revenue & returns' },
    { role: 'Support Staff', email: 'support@retailsync.ai', desc: 'Customer churn signals & tickets' },
    { role: 'Business Analyst', email: 'analyst@retailsync.ai', desc: 'Predictive intelligence & simulator' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate(getDashboardPath(res.user.role));
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleSelectDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white shadow-xl shadow-teal-500/20 mb-4 ring-4 ring-teal-500/20">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          RetailSync <span className="text-teal-400">AI</span>
        </h2>
        <p className="mt-1 text-xs text-slate-400 font-medium">
          Unified Customer, Channel & Demand Intelligence Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-navy-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-navy-800 sm:px-10">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@retailsync.ai"
                  className="w-full pl-9 pr-4 py-2.5 bg-navy-950 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-navy-950 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-navy-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 shadow-lg shadow-teal-500/25 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Selector */}
          <div className="mt-6 pt-6 border-t border-navy-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Select Evaluation Role (Demo Auto-Fill)</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectDemo(acc.email)}
                  className={`text-left p-2 rounded-lg text-xs flex items-center justify-between border transition-all ${
                    email === acc.email
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                      : 'bg-navy-950/60 border-navy-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-slate-200">{acc.role}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{acc.desc}</span>
                  </div>
                  {email === acc.email && <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
