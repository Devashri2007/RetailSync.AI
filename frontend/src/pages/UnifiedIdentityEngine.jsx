import React, { useEffect, useState } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import {
  Fingerprint,
  RefreshCw,
  GitMerge,
  CheckCircle2,
  AlertCircle,
  Globe,
  Smartphone,
  Store,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

const UnifiedIdentityEngine = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/identity/candidates');
      if (res.data.success) {
        setCandidates(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      await api.post('/identity/scan');
      await fetchCandidates();
      setNotification('Cross-channel identity scan completed successfully.');
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert('Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const handleOpenPreview = async (cand) => {
    setPreviewLoading(true);
    try {
      const res = await api.post('/identity/preview-merge', {
        primaryId: cand.customerA.id,
        secondaryId: cand.customerB.id,
      });
      if (res.data.success) {
        setPreviewData(res.data.data);
      }
    } catch (err) {
      alert('Failed to load merge preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExecuteMerge = async () => {
    if (!previewData) return;
    setMerging(true);
    try {
      const res = await api.post('/identity/merge', {
        primaryId: previewData.primary._id,
        secondaryId: previewData.secondary._id,
        reason: 'Authorized manual verification of cross-channel identity match',
      });
      if (res.data.success) {
        setNotification(`Successfully unified profiles under ${res.data.data.unifiedCustomerId}!`);
        setPreviewData(null);
        fetchCandidates();
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Merge failed');
    } finally {
      setMerging(false);
    }
  };

  const ChannelBadge = ({ channel }) => {
    const isWeb = channel === 'web';
    const isMobile = channel === 'mobile';
    const Icon = isWeb ? Globe : isMobile ? Smartphone : Store;
    const color = isWeb
      ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
      : isMobile
      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
      : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${color}`}>
        <Icon className="w-3 h-3" />
        <span>{channel}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-teal-400" />
            <span>Unified Customer Identity Engine</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-Channel Identity Resolution: Unifying disparate Web, Mobile App, and In-Store customer profiles
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Analyzing Cross-Channel Hashes...' : 'Run Identity Match Scan'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>Deterministic & Fuzzy Matching Algorithm:</strong> Evaluates exact phone matches, identical email addresses, string similarity distance on customer names, and postal matching across separate channel databases. Uncertain matches require human verification before consolidation.
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Potential Cross-Channel Duplicate Profiles ({candidates.length})
            </h2>
            <p className="text-[11px] text-slate-400">
              Profiles with matching attributes detected across disparate touchpoints
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-navy-800">
              <tr>
                <th className="px-5 py-3">Profile A (Channel 1)</th>
                <th className="px-4 py-3">Profile B (Channel 2)</th>
                <th className="px-4 py-3">Match Confidence</th>
                <th className="px-4 py-3">Matching Attributes</th>
                <th className="px-4 py-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No duplicate profiles detected. Identity graph is currently synchronized.
                  </td>
                </tr>
              ) : (
                candidates.map((cand) => (
                  <tr key={cand.pairId} className="hover:bg-slate-50 dark:hover:bg-navy-850 transition-colors">
                    {/* Customer A */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <ChannelBadge channel={cand.customerA.channel} />
                        <span className="font-mono text-[10px] text-slate-400">{cand.customerA.unifiedCustomerId}</span>
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">{cand.customerA.name}</div>
                      <div className="text-[11px] text-slate-400">{cand.customerA.email}</div>
                      <div className="text-[11px] text-slate-500">{cand.customerA.phone}</div>
                    </td>

                    {/* Customer B */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <ChannelBadge channel={cand.customerB.channel} />
                        <span className="font-mono text-[10px] text-slate-400">{cand.customerB.unifiedCustomerId}</span>
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">{cand.customerB.name}</div>
                      <div className="text-[11px] text-slate-400">{cand.customerB.email}</div>
                      <div className="text-[11px] text-slate-500">{cand.customerB.phone}</div>
                    </td>

                    {/* Confidence Score */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-200 dark:bg-navy-950 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${cand.confidenceScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${cand.confidenceScore}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                          {cand.confidenceScore}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{cand.status}</span>
                    </td>

                    {/* Matching Attributes */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cand.matchingAttributes.map((attr, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 dark:bg-navy-950 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-mono"
                          >
                            {attr}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenPreview(cand)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 shadow-sm transition-colors inline-flex items-center gap-1.5"
                      >
                        <GitMerge className="w-3.5 h-3.5" />
                        <span>Review & Merge</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Merge Review Modal */}
      <Modal
        isOpen={!!previewData}
        onClose={() => setPreviewData(null)}
        title="Cross-Channel Profile Merge Review"
        subtitle="Review side-by-side data consolidation before committing to the unified customer identity graph."
        maxWidth="max-w-4xl"
      >
        {previewData && (
          <div className="space-y-6">
            {/* Top Match Bar */}
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-400">Match Confidence Score: {previewData.confidenceScore}%</span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Attributes: {previewData.matchingAttributes.join(' • ')}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-teal-400 text-navy-950">
                Verified Candidate
              </span>
            </div>

            {/* Side by side comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Profile A (Primary Target) */}
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-teal-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase text-teal-400 tracking-wider">
                    Target Primary Identity (Master)
                  </span>
                  <ChannelBadge channel={previewData.primary.channel} />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {previewData.primary.firstName} {previewData.primary.lastName}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{previewData.primary.unifiedCustomerId}</div>
                <div className="mt-3 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <div>Email: <strong>{previewData.primary.email}</strong></div>
                  <div>Phone: <strong>{previewData.primary.phone || 'None'}</strong></div>
                  <div>City: <strong>{previewData.primary.address?.city || 'N/A'}</strong></div>
                  <div>Historical Spend: <strong className="text-emerald-500">${previewData.primary.totalSpent}</strong> ({previewData.primary.orderCount} orders)</div>
                </div>
              </div>

              {/* Profile B (Secondary to merge) */}
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Fragmented Identity to Consolidate
                  </span>
                  <ChannelBadge channel={previewData.secondary.channel} />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {previewData.secondary.firstName} {previewData.secondary.lastName}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{previewData.secondary.unifiedCustomerId}</div>
                <div className="mt-3 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <div>Email: <strong>{previewData.secondary.email}</strong></div>
                  <div>Phone: <strong>{previewData.secondary.phone || 'None'}</strong></div>
                  <div>City: <strong>{previewData.secondary.address?.city || 'N/A'}</strong></div>
                  <div>Historical Spend: <strong className="text-emerald-500">${previewData.secondary.totalSpent}</strong> ({previewData.secondary.orderCount} orders)</div>
                </div>
              </div>
            </div>

            {/* Projected Consolidated Result */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                Projected Unified Profile Post-Merge:
              </h4>
              <div className="grid grid-cols-4 gap-3 text-center text-xs">
                <div className="p-2 bg-navy-950 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Unified Customer ID</span>
                  <span className="font-mono font-bold text-white">{previewData.primary.unifiedCustomerId}</span>
                </div>
                <div className="p-2 bg-navy-950 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Combined Lifetime Spend</span>
                  <span className="font-bold text-emerald-400">${previewData.projectedTotals.totalSpent}</span>
                </div>
                <div className="p-2 bg-navy-950 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Total Combined Orders</span>
                  <span className="font-bold text-white">{previewData.projectedTotals.orderCount} Orders</span>
                </div>
                <div className="p-2 bg-navy-950 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Support Tickets</span>
                  <span className="font-bold text-white">{previewData.projectedTotals.ticketCount} Tickets</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setPreviewData(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteMerge}
                disabled={merging}
                className="px-5 py-2 rounded-lg text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <GitMerge className="w-3.5 h-3.5" />
                <span>{merging ? 'Unifying Profiles...' : 'Confirm & Unify Profiles'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UnifiedIdentityEngine;
