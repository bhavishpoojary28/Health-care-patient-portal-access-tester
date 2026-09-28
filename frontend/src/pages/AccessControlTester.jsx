import React, { useState } from 'react';
import { accessTestAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Sliders,
  Play,
  ShieldAlert,
  ShieldCheck,
  User,
  Stethoscope,
  Shield,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  FileCode,
  Sparkles,
} from 'lucide-react';

export const AccessControlTester = () => {
  const [userRole, setUserRole] = useState('patient');
  const [userId, setUserId] = useState('patientA');
  const [targetPatientId, setTargetPatientId] = useState('P1002');
  const [resourceType, setResourceType] = useState('Medical Report');
  const [action, setAction] = useState('GET');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Quick Preset Scenarios
  const presetScenarios = [
    {
      name: 'TC004 - Cross-Patient Medical Record Access (IDOR Prevention)',
      userRole: 'patient',
      userId: 'patientA',
      targetPatientId: 'P1002',
      resourceType: 'Medical Report',
      action: 'GET',
      expected: 'ACCESS DENIED (403)',
      desc: 'Patient A (P1001) attempts to inspect Patient B (P1002) confidential lab report.',
    },
    {
      name: 'TC003 - Patient Accesses Own Profile (Legitimate)',
      userRole: 'patient',
      userId: 'patientA',
      targetPatientId: 'P1001',
      resourceType: 'Profile',
      action: 'GET',
      expected: 'ACCESS GRANTED (200)',
      desc: 'Patient A (P1001) accesses their own profile data.',
    },
    {
      name: 'TC005 - Doctor Accesses Assigned Patient (Legitimate Care)',
      userRole: 'doctor',
      userId: 'dr_alice',
      targetPatientId: 'P1001',
      resourceType: 'Medical Report',
      action: 'GET',
      expected: 'ACCESS GRANTED (200)',
      desc: 'Dr. Alice (D201) accesses assigned Patient A (P1001) medical records.',
    },
    {
      name: 'TC006 - Doctor Accesses Unassigned Patient (HIPAA Violation Prevention)',
      userRole: 'doctor',
      userId: 'dr_alice',
      targetPatientId: 'P1002',
      resourceType: 'Medical Report',
      action: 'GET',
      expected: 'ACCESS DENIED (403)',
      desc: 'Dr. Alice attempts to access records for Patient B (P1002) who is assigned to Dr. Bob.',
    },
    {
      name: 'TC007 - Unauthenticated Anonymous API Access',
      userRole: 'unauthenticated',
      userId: 'unauthenticated',
      targetPatientId: 'P1001',
      resourceType: 'Medical Report',
      action: 'GET',
      expected: 'ACCESS DENIED (401)',
      desc: 'API request made without Authorization header.',
    },
    {
      name: 'TC008 - Malicious Attacker with Tampered/Forged JWT',
      userRole: 'attacker',
      userId: 'tampered_token',
      targetPatientId: 'P1001',
      resourceType: 'Medical Report',
      action: 'GET',
      expected: 'ACCESS DENIED (401)',
      desc: 'Request carrying an invalid cryptographic signature.',
    },
  ];

  const handleApplyPreset = (scenario) => {
    setUserRole(scenario.userRole);
    setUserId(scenario.userId);
    setTargetPatientId(scenario.targetPatientId);
    setResourceType(scenario.resourceType);
    setAction(scenario.action);
  };

  const handleRunTest = async () => {
    try {
      setLoading(true);
      const res = await accessTestAPI.runSimulation({
        userRole,
        userId,
        targetPatientId,
        resourceType,
        action,
      });
      setTestResult(res.data);
    } catch (err) {
      console.error('Test run failed', err);
      setTestResult({
        error: err.response?.data?.error || err.message,
        status: 'FAIL',
        actualResult: 'EXECUTION ERROR',
        actualStatus: err.response?.status || 500,
        expectedResult: 'ACCESS DENIED',
        expectedStatus: 403,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
              <Sliders className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Core Security Demonstration
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Access Control Tester
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Simulate authorization boundary checks across roles, patient ownership, doctor-patient assignments, and token security to verify that unauthorized patient data access is blocked by the backend.
          </p>
        </div>

        <button
          onClick={handleRunTest}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{loading ? 'Executing Test...' : 'Run Access Test'}</span>
        </button>
      </div>

      {/* Preset Test Scenarios */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Quick Preset Test Scenarios
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {presetScenarios.map((sc, i) => (
            <button
              key={i}
              onClick={() => handleApplyPreset(sc)}
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-sm text-left transition flex flex-col justify-between group"
            >
              <div>
                <div className="font-bold text-slate-900 text-xs group-hover:text-teal-700 transition">
                  {sc.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {sc.desc}
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400 font-semibold">{sc.expected}</span>
                <span className="text-teal-600 font-bold group-hover:underline">Load & Test</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Parameter Selection Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-4">
          Configure Access Control Simulation
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* User / Requester */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              1. Simulated User (Requester)
            </label>
            <select
              value={userId}
              onChange={(e) => {
                const val = e.target.value;
                setUserId(val);
                if (val.startsWith('patient')) setUserRole('patient');
                else if (val.startsWith('dr_')) setUserRole('doctor');
                else if (val === 'admin') setUserRole('admin');
                else if (val === 'unauthenticated') setUserRole('unauthenticated');
                else setUserRole('attacker');
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-teal-500 outline-none bg-white"
            >
              <optgroup label="Patients">
                <option value="patientA">Patient A (John Doe - P1001)</option>
                <option value="patientB">Patient B (Jane Smith - P1002)</option>
                <option value="patientC">Patient C (Robert Brown - P1003)</option>
              </optgroup>
              <optgroup label="Doctors">
                <option value="dr_alice">Dr. Alice Carter (Assigned: P1001, P1003)</option>
                <option value="dr_bob">Dr. Bob Vance (Assigned: P1002)</option>
              </optgroup>
              <optgroup label="Administrative">
                <option value="admin">System Admin (Full System Oversight)</option>
              </optgroup>
              <optgroup label="Security Attack Simulations">
                <option value="unauthenticated">Unauthenticated (No JWT Token)</option>
                <option value="tampered_token">Attacker (Forged / Tampered JWT)</option>
                <option value="expired_token">Expired Session (Token Expired)</option>
              </optgroup>
            </select>
          </div>

          {/* Target Patient */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              2. Target Patient (Resource Owner)
            </label>
            <select
              value={targetPatientId}
              onChange={(e) => setTargetPatientId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-teal-500 outline-none bg-white"
            >
              <option value="P1001">Patient A (John Doe - P1001)</option>
              <option value="P1002">Patient B (Jane Smith - P1002)</option>
              <option value="P1003">Patient C (Robert Brown - P1003)</option>
            </select>
          </div>

          {/* Resource Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              3. Protected Resource
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-teal-500 outline-none bg-white"
            >
              <option value="Medical Report">Medical Report (Lab / Diagnostic)</option>
              <option value="Profile">Patient Profile Demographics</option>
              <option value="Prescriptions">Prescriptions & Active Meds</option>
              <option value="Appointments">Clinical Appointments</option>
              <option value="Billing">Invoices & Financial Data</option>
            </select>
          </div>

          {/* Action */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              4. HTTP Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-teal-500 outline-none bg-white"
            >
              <option value="GET">GET (Read Resource)</option>
              <option value="PUT">PUT (Update Resource)</option>
              <option value="POST">POST (Create Entry)</option>
              <option value="DELETE">DELETE (Remove Record)</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleRunTest}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{loading ? 'Running Test...' : 'Run Access Test'}</span>
          </button>
        </div>
      </div>

      {/* RESULTS DISPLAY PANEL */}
      {testResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          {/* Status Header */}
          <div
            className={`p-6 border-b flex flex-wrap items-center justify-between gap-4 ${
              testResult.status === 'PASS'
                ? 'bg-emerald-50/50 border-emerald-200'
                : testResult.status === 'FAIL'
                ? 'bg-rose-50/50 border-rose-200'
                : 'bg-amber-50/50 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
                  testResult.status === 'PASS'
                    ? 'bg-emerald-600'
                    : testResult.status === 'FAIL'
                    ? 'bg-rose-600'
                    : 'bg-amber-600'
                }`}
              >
                {testResult.status === 'PASS' ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <XCircle className="w-7 h-7" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Test Verdict
                  </span>
                  <StatusBadge status={testResult.status} size="lg" />
                </div>
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  {testResult.status === 'PASS'
                    ? 'Authorization Rule Successfully Enforced'
                    : 'Security Assertion Failure Detected'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-slate-400 block font-semibold">Execution Time</span>
                <span className="font-mono font-bold text-slate-700">
                  {testResult.durationMs || 12} ms
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-semibold">HTTP Code</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {testResult.actualStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Expected vs Actual Comparison Cards */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/60 border-b border-slate-200">
            {/* Expected Result */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Expected Security Outcome
              </div>
              <div className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span>{testResult.expectedResult}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  HTTP {testResult.expectedStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {testResult.expectedResult === 'ACCESS DENIED'
                  ? 'Request violates ownership/RBAC rules and must be strictly blocked with 401/403.'
                  : 'Authorized persona possesses valid credentials and verified relation.'}
              </p>
            </div>

            {/* Actual Result */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Actual Backend Response
              </div>
              <div className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span
                  className={
                    testResult.actualResult === 'ACCESS DENIED'
                      ? 'text-rose-600'
                      : 'text-emerald-600'
                  }
                >
                  {testResult.actualResult}
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    testResult.actualStatus === 403 || testResult.actualStatus === 401
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  HTTP {testResult.actualStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Enforced by: Server-side RBAC & Patient Ownership middleware.
              </p>
            </div>
          </div>

          {/* Audit Log Verification */}
          {testResult.auditLog && (
            <div className="p-6 bg-slate-900 text-slate-200 border-b border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Real-time Audit Log Entry Generated</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(testResult.auditLog.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl font-mono text-xs text-teal-300 border border-teal-500/20">
                {testResult.auditLog.details}
              </div>
            </div>
          )}

          {/* Response Payload Inspector */}
          <div className="p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              <Terminal className="w-4 h-4 text-slate-600" />
              <span>Backend Response JSON Body</span>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
              {JSON.stringify(testResult.responseBody, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControlTester;
