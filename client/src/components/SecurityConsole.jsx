import React, { useState, useEffect } from 'react';
import { logsAPI } from '../utils/api';
import { Shield, Smartphone, Key, History, ToggleLeft, ToggleRight, Laptop, RefreshCw, ShieldAlert } from 'lucide-react';

export default function SecurityConsole({ guestMode }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await logsAPI.getAll(guestMode);
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [guestMode]);

  // Handle MFA toggles
  useEffect(() => {
    let interval = null;
    if (mfaEnabled) {
      // Generate a mock code every 10 seconds
      const generateCode = () => {
        const val = Math.floor(100000 + Math.random() * 900000);
        setOtpCode(String(val));
      };
      generateCode();
      interval = setInterval(generateCode, 10000);
    } else {
      setOtpCode('');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mfaEnabled]);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-slate-800/30 shadow-xl space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-850/50">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
          <Shield className="w-4.5 h-4.5 text-indigo-500" />
          <span>Security & Activity Console</span>
        </h4>
        <button
          onClick={fetchLogs}
          className="p-1 text-slate-450 hover:text-indigo-500 rounded-lg transition-colors cursor-pointer"
          title="Refresh Logs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid: 2FA on left/top, Devices and Logs on right/bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Col: 2FA & Devices */}
        <div className="space-y-6">
          {/* Mock 2FA */}
          <div className="p-4 bg-slate-100/30 dark:bg-slate-900/10 rounded-2xl border border-slate-200/50 dark:border-slate-800/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-250 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Two-Factor Authentication</span>
                </h5>
                <p className="text-[10px] text-slate-450 dark:text-slate-500">
                  Enforce secure one-time verification codes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className="text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                {mfaEnabled ? (
                  <ToggleRight className="w-9 h-9" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-350 dark:text-slate-600" />
                )}
              </button>
            </div>

            {mfaEnabled && (
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/10 flex flex-col items-center text-center space-y-3">
                {/* Mock QR Code */}
                <div className="w-24 h-24 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center relative">
                  {/* Styled SVG QR code representation */}
                  <svg className="w-full h-full text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="10" y="10" width="20" height="20" />
                    <rect x="15" y="15" width="10" height="10" fill="white" />
                    <rect x="70" y="10" width="20" height="20" />
                    <rect x="75" y="15" width="10" height="10" fill="white" />
                    <rect x="10" y="70" width="20" height="20" />
                    <rect x="15" y="75" width="10" height="10" fill="white" />
                    <rect x="40" y="30" width="10" height="20" />
                    <rect x="55" y="45" width="15" height="10" />
                    <rect x="35" y="60" width="20" height="15" />
                    <rect x="65" y="65" width="15" height="15" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Verification Code</span>
                  <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-widest animate-pulse">
                    {otpCode.substring(0,3)} {otpCode.substring(3)}
                  </div>
                  <span className="text-[8px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
                    Codes rotate every 10s
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Connected Devices */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-indigo-500" />
              <span>Active Sessions</span>
            </h5>
            
            <div className="space-y-2">
              {[
                { name: 'Chrome Browser (Windows 11)', type: 'desktop', ip: '192.168.1.45', date: 'Current Device', icon: Laptop },
                { name: 'TaskFlow iOS App (iPhone 15)', type: 'mobile', ip: '10.0.0.122', date: 'Active 2m ago', icon: Smartphone }
              ].map((device, idx) => (
                <div key={idx} className="glass-card p-3 rounded-xl border border-white/45 dark:border-slate-800/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      <device.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h6 className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{device.name}</h6>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">IP: {device.ip}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${
                    idx === 0 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-850 text-slate-400 border-slate-200/50 dark:border-slate-800/10'
                  }`}>
                    {device.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Activity Logs */}
        <div className="space-y-3 flex flex-col h-full">
          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
            <History className="w-4 h-4 text-indigo-500" />
            <span>Account Activity Log</span>
          </h5>

          <div className="glass-card p-3 rounded-2xl border border-white/45 dark:border-slate-800/10 flex-grow max-h-[310px] overflow-y-auto space-y-2.5">
            {loading ? (
              <div className="space-y-3.5 py-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="flex justify-between items-center gap-3 animate-pulse">
                    <div className="h-2.5 bg-slate-250/50 dark:bg-slate-800/30 rounded w-2/3"></div>
                    <div className="h-2 bg-slate-250/40 dark:bg-slate-800/20 rounded w-1/6"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-rose-500 text-[11px] font-semibold flex flex-col items-center justify-center gap-2 animate-fade-in">
                <ShieldAlert className="w-6 h-6 text-rose-550 dark:text-rose-400 animate-bounce" />
                <span className="text-slate-500 dark:text-slate-400 font-bold">{error}</span>
                <button
                  type="button"
                  onClick={fetchLogs}
                  className="mt-1 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-650 dark:text-rose-400 text-[10px] font-bold hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-550 text-xs font-bold animate-fade-in">
                No activity logs recorded.
              </div>
            ) : (
              <div className="space-y-2.5 animate-fade-in">
                {logs.map((log) => (
                  <div key={log.id} className="text-[10px] leading-relaxed pb-2 border-b border-slate-200/30 dark:border-slate-800/5 flex items-start justify-between gap-3">
                    <span className="text-slate-655 dark:text-slate-350 font-semibold">{log.action}</span>
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">
                      {new Date(log.created_at || log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
