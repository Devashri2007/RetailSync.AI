import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { BrainCircuit, Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('admin@retailsync.ai');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/auth/forgotpassword', { email });
      if (res.data.success) {
        setMessage(res.data.message);
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 mb-3 border border-teal-500/30">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Reset Account Password</h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your corporate email address to generate an authorized reset token.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-navy-900 border border-navy-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-3">
              <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>{message}</span>
              </div>
              {resetToken && (
                <div className="p-3 bg-navy-950 rounded-lg border border-navy-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Generated Reset Token:</span>
                  <code className="text-xs text-amber-300 font-mono break-all">{resetToken}</code>
                  <button
                    onClick={() => navigate(`/reset-password/${resetToken}`)}
                    className="w-full mt-3 py-1.5 px-3 rounded-lg text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 transition-colors"
                  >
                    Proceed to Reset Form
                  </button>
                </div>
              )}
            </div>
          )}

          {!resetToken && (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@retailsync.ai"
                    className="w-full pl-9 pr-4 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 transition-all disabled:opacity-50"
              >
                {loading ? 'Generating Token...' : 'Generate Password Reset Token'}
              </button>
            </form>
          )}

          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
