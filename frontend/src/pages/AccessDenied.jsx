import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Sliders, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccessDenied = () => {
  const { user, role } = useAuth();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-rose-200 shadow-xl max-w-lg w-full p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 uppercase tracking-wide">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Access Control Denied
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Your authenticated session (<strong>{user?.name}</strong> with role{' '}
            <strong className="uppercase">{role}</strong>) does not hold authorization to access this clinical resource or management section.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 font-mono text-slate-600">
          <div className="font-bold text-slate-800">Security Rule Reference:</div>
          <div>• Role-Based Access Control (RBAC): Enforced</div>
          <div>• Cross-Patient Data Boundary: Isolated</div>
          <div>• Security Incident ID: SEC-LOG-{Date.now().toString().slice(-6)}</div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>

          <Link
            to="/access-tester"
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4" />
            <span>Open Access Control Tester</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
