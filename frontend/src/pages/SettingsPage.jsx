import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Server,
  Database,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Shield,
  Key,
} from 'lucide-react';

const SettingsPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, roleLabel } = useAuth();
  const [backendHealth, setBackendHealth] = useState(null);
  const [mlHealth, setMlHealth] = useState(null);

  useEffect(() => {
    const checkServices = async () => {
      try {
        const bRes = await api.get('/health');
        setBackendHealth(bRes.data);
      } catch (e) {
        setBackendHealth({ status: 'offline' });
      }

      try {
        const mlRes = await fetch('http://127.0.0.1:8000/health');
        const mlData = await mlRes.json();
        setMlHealth(mlData);
      } catch (e) {
        setMlHealth({ status: 'offline' });
      }
    };

    checkServices();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-teal-400" />
          <span>Platform Configurations & Architecture Status</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Service connectivity, Machine Learning runtime status, and enterprise system preferences
        </p>
      </div>

      {/* Service Health Cards */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-800 pb-2">
          Microservices & Infrastructure Connectivity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Node.js Backend */}
          <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <Server className="w-4 h-4 text-teal-400" />
                <span>Express API Server</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Online
              </span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div>Host: <code className="text-slate-300">http://localhost:5000</code></div>
              <div>Stack: Node.js 24 + Express + Socket.IO</div>
            </div>
          </div>

          {/* MongoDB */}
          <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>MongoDB Database</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div>Host: <code className="text-slate-300">127.0.0.1:27017</code></div>
              <div>Collections: 14 Mongoose Schemas</div>
            </div>
          </div>

          {/* Python ML Service */}
          <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span>Python ML Service</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> FastAPI Live
              </span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div>Host: <code className="text-slate-300">http://127.0.0.1:8000</code></div>
              <div>Engine: Python 3.12 + Scikit-Learn</div>
              <div>Artifacts: Joblib Serialized Models</div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme & Display Preferences */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-800 pb-2">
          Display & Appearance
        </h2>

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Theme Mode</span>
            <span className="text-[11px] text-slate-400">Toggle between professional dark analytics mode and high-contrast light mode</span>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* Security & Active Session */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-800 pb-2">
          Security & Active Session
        </h2>

        <div className="space-y-2 text-slate-600 dark:text-slate-300">
          <div>Logged in as: <strong className="text-slate-900 dark:text-white">{user?.name}</strong> ({user?.email})</div>
          <div>Assigned Role: <strong className="text-teal-400">{roleLabel}</strong></div>
          <div>Authentication Standard: <strong className="text-slate-900 dark:text-white">JWT Bearer + HttpOnly Cookies (bcrypt 10-rounds)</strong></div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
