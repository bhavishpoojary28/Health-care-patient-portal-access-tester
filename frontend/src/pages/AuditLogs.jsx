import React, { useState, useEffect } from 'react';
import { auditAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  ClipboardList,
  RotateCw,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  Lock,
  User,
  Clock,
  Terminal,
} from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const [logsRes, statsRes] = await Promise.all([
        auditAPI.getLogs({
          eventType: eventTypeFilter,
          severity: severityFilter,
          status: statusFilter,
          search: searchTerm,
        }),
        auditAPI.getStats(),
      ]);
      setLogs(logsRes.data.logs || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [eventTypeFilter, severityFilter, statusFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
              <ClipboardList className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Compliance & Security Forensics
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Security Audit Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Immutable system audit trail capturing authentications, access attempts, IDOR security violations, and automated test runs.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-2"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* METRIC SUMMARY CARDS */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Log Entries
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Audit Events</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
              Unauthorized Attempts
            </div>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {stats.unauthorizedAttempts}
            </div>
            <div className="text-[11px] text-rose-700 mt-0.5 font-medium">Blocked with 403</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Failed Logins
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.failedLogins}</div>
            <div className="text-[11px] text-amber-700 mt-0.5 font-medium">Auth Failures</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Authorized Reads
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {stats.successfulAccesses}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Legitimate Access</div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
              Test Executions
            </div>
            <div className="text-2xl font-black text-sky-600 mt-1">{stats.testExecutions}</div>
            <div className="text-[11px] text-sky-700 mt-0.5 font-medium">Simulated Runs</div>
          </div>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, action, resource, details..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-teal-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Event:</span>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium outline-none bg-white"
            >
              <option value="ALL">All Event Types</option>
              <option value="UNAUTHORIZED_ACCESS">UNAUTHORIZED_ACCESS</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGIN_FAILED">LOGIN_FAILED</option>
              <option value="RESOURCE_ACCESS">RESOURCE_ACCESS</option>
              <option value="TEST_EXECUTION">TEST_EXECUTION</option>
              <option value="LOGOUT">LOGOUT</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium outline-none bg-white"
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ALERT">ALERT</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium outline-none bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="DENIED">DENIED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Total Logs: <strong className="text-slate-800">{logs.length}</strong>
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event & Severity</th>
                <th className="py-3 px-4">User Identity</th>
                <th className="py-3 px-4">Action & Resource</th>
                <th className="py-3 px-4">Security Details</th>
                <th className="py-3 px-4">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.logId || log._id}
                    className={`hover:bg-slate-50/80 transition ${
                      log.severity === 'ALERT'
                        ? 'bg-rose-50/30'
                        : log.severity === 'WARNING'
                        ? 'bg-amber-50/20'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{log.eventType}</div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          log.severity === 'ALERT'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : log.severity === 'WARNING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.username}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-tight">
                        Role: {log.role}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800 font-semibold">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 mr-1 text-[10px]">
                          {log.action}
                        </span>
                        <span>{log.resource}</span>
                      </div>
                      {log.targetPatientId && (
                        <div className="text-[10px] text-teal-700 font-mono mt-0.5">
                          Target Patient: {log.targetPatientId}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <div className="text-slate-700 font-medium text-[11px] leading-tight">
                        {log.details}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={log.status} size="sm" />
                      <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                        HTTP {log.statusCode}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
