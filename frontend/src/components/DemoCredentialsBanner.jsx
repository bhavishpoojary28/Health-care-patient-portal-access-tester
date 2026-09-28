import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, UserCheck, Stethoscope, Key, ChevronDown, ChevronUp, User } from 'lucide-react';

export const DemoCredentialsBanner = () => {
  const { demoAccounts, quickSwitch, user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async (account) => {
    try {
      setSwitching(true);
      await quickSwitch(account);
    } catch (err) {
      console.error('Quick switch failed', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-teal-900 via-sky-900 to-indigo-950 text-white text-xs border-b border-teal-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
          </span>
          <span className="font-semibold text-teal-200">Security Test Environment</span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">
            Active Identity:
            <strong className="text-white ml-1 font-mono">
              {isAuthenticated ? `${user?.name || 'User'} (${user?.role ? user.role.toUpperCase() : 'USER'}${user?.patientId ? ` - ${user.patientId}` : ''}${user?.doctorId ? ` - ${user.doctorId}` : ''})` : 'Not Logged In'}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 rounded border border-teal-500/40 transition font-medium"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Switch Demo Persona</span>
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded Persona Switcher Bar */}
      {isOpen && (
        <div className="bg-slate-900/90 border-t border-teal-800/40 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-slate-300 text-xs mb-2">
              Click any demo account to instantly switch session and test role-based access restrictions & patient data isolation:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {demoAccounts.map((account) => {
                const isActive = user?.username === account.username;
                return (
                  <button
                    key={account.username}
                    onClick={() => handleSwitch(account)}
                    disabled={switching}
                    className={`p-2 rounded text-left border transition flex flex-col justify-between ${
                      isActive
                        ? 'bg-teal-600/30 border-teal-400 text-white shadow-inner ring-1 ring-teal-400'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-xs truncate">{account.label}</span>
                      {account.role === 'patient' && <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                      {account.role === 'doctor' && <Stethoscope className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                      {account.role === 'admin' && <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {account.username} / {account.password}
                    </div>
                    <div className="mt-1 text-[10px] text-teal-300 font-sans">
                      {account.tag}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoCredentialsBanner;
