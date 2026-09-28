import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  Calendar,
  FileText,
  Pill,
  CreditCard,
  Sliders,
  ShieldAlert,
  ClipboardList,
  Shield,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

export const Sidebar = () => {
  const { role, user } = useAuth();

  const portalNav = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/profile', label: 'Patient Profile', icon: UserCheck },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
    { to: '/reports', label: 'Medical Reports', icon: FileText },
    { to: '/prescriptions', label: 'Prescriptions', icon: Pill },
    { to: '/billing', label: 'Billing & Invoices', icon: CreditCard },
  ];

  const securityNav = [
    { to: '/access-tester', label: 'Access Control Tester', icon: Sliders, highlight: true },
    { to: '/testing', label: 'Testing Dashboard', icon: ShieldAlert },
    { to: '/audit-logs', label: 'Audit Logs & Trail', icon: ClipboardList },
  ];

  const navClass = ({ isActive }) =>
    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition group ${
      isActive
        ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm border border-teal-200/80'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 shrink-0 hidden md:block bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        {/* User Identity Card */}
        <div className="p-3.5 bg-gradient-to-br from-slate-50 to-teal-50/40 rounded-xl border border-slate-200/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Current Session
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              {role === 'doctor' ? 'DR' : role === 'admin' ? 'ADM' : 'PT'}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs text-slate-900 truncate">{user?.name}</div>
              <div className="text-[11px] text-teal-700 font-mono font-medium">
                {role.toUpperCase()} {user?.patientId || user?.doctorId || ''}
              </div>
            </div>
          </div>
        </div>

        {/* Patient Portal Navigation */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Patient Portal
          </div>
          <nav className="space-y-1">
            {portalNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navClass}>
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-teal-600 transition" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-500 opacity-0 group-hover:opacity-100 transition" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Security Testing Center */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-teal-800 uppercase flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            <span>Software Testing</span>
          </div>
          <nav className="space-y-1">
            {securityNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={navClass}>
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        item.highlight ? 'text-teal-600' : 'text-slate-500'
                      } group-hover:text-teal-600 transition`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold uppercase tracking-tight">
                      Demo
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Security Info Card */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px] space-y-1">
        <div className="font-semibold text-slate-700 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
          <span>RBAC & IDOR Guard Active</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Server-side authorization verifies patient ownership and doctor assignment on all requests.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
