import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  ShieldAlert,
  Sliders,
  LogOut,
  User,
  Stethoscope,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight text-lg flex items-center gap-1.5">
                  HealthPortal <span className="text-teal-600">Secure</span>
                </span>
                <span className="text-[11px] block font-medium text-slate-500 -mt-1">
                  Access Control & Security Tester
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Action Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/access-tester"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition"
            >
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>Access Control Tester</span>
            </Link>

            <Link
              to="/testing"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
            >
              <ShieldAlert className="w-4 h-4 text-sky-600" />
              <span>Testing Dashboard</span>
            </Link>

            <Link
              to="/audit-logs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition"
            >
              <ClipboardList className="w-4 h-4 text-slate-600" />
              <span>Audit Logs</span>
            </Link>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-800 leading-tight">
                    {user?.name}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : role === 'doctor'
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {role}
                    </span>
                    {user?.patientId && (
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">
                        {user.patientId}
                      </span>
                    )}
                    {user?.doctorId && (
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">
                        {user.doctorId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
                  {role === 'doctor' ? (
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                  ) : role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                  ) : (
                    <User className="w-4 h-4 text-sky-600" />
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
