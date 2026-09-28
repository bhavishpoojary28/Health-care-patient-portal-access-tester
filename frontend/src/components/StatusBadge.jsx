import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const normalized = (typeof status === 'string' ? status : (status?.toString?.() || '')).toUpperCase();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1',
    md: 'px-2.5 py-1 text-xs font-bold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-bold gap-2',
  }[size] || 'px-2.5 py-1 text-xs font-bold gap-1.5';

  if (normalized === 'PASS' || normalized === 'SUCCESS' || normalized === 'PAID' || normalized === 'COMPLETED' || normalized === 'ACTIVE') {
    return (
      <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 ${sizeClasses}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>{normalized}</span>
      </span>
    );
  }

  if (normalized === 'FAIL' || normalized === 'FAILED' || normalized === 'DENIED' || normalized === 'OVERDUE' || normalized === 'CANCELLED') {
    return (
      <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 ${sizeClasses}`}>
        <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
        <span>{normalized}</span>
      </span>
    );
  }

  if (normalized === 'BLOCKED' || normalized === 'WARNING' || normalized === 'ALERT' || normalized === 'PENDING') {
    return (
      <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 ${sizeClasses}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>{normalized}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${sizeClasses}`}>
      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
      <span>{normalized || 'NOT_RUN'}</span>
    </span>
  );
};

export default StatusBadge;
