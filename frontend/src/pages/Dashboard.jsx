import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  appointmentAPI,
  reportAPI,
  prescriptionAPI,
  billingAPI,
  patientAPI,
  testCaseAPI,
} from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Calendar,
  FileText,
  Pill,
  CreditCard,
  UserCheck,
  ShieldAlert,
  Sliders,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Stethoscope,
  Users,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, role, patientId, doctorId } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [testStats, setTestStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (role === 'patient') {
          const [aptsRes, repRes, rxRes, billRes] = await Promise.all([
            appointmentAPI.getAppointments({ patientId }),
            reportAPI.getReports({ patientId }),
            prescriptionAPI.getPrescriptions({ patientId }),
            billingAPI.getInvoices({ patientId }),
          ]);
          setAppointments(aptsRes.data);
          setReports(repRes.data);
          setPrescriptions(rxRes.data);
          setInvoices(billRes.data);
        } else if (role === 'doctor') {
          const [ptsRes, aptsRes, repRes] = await Promise.all([
            patientAPI.getPatients(),
            appointmentAPI.getAppointments(),
            reportAPI.getReports(),
          ]);
          setAssignedPatients(ptsRes.data);
          setAppointments(aptsRes.data);
          setReports(repRes.data);
        } else if (role === 'admin') {
          const [statsRes, ptsRes] = await Promise.all([
            testCaseAPI.getStats(),
            patientAPI.getPatients(),
          ]);
          setTestStats(statsRes.data);
          setAssignedPatients(ptsRes.data);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role, patientId, doctorId]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-slate-500 font-medium">Loading clinical portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-sky-800 to-indigo-900 rounded-2xl p-6 text-white shadow-lg shadow-teal-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-400/30 uppercase tracking-wide">
              {role.toUpperCase()} PORTAL
            </span>
            {patientId && (
              <span className="text-xs font-mono text-teal-300">ID: {patientId}</span>
            )}
            {doctorId && (
              <span className="text-xs font-mono text-teal-300">Staff ID: {doctorId}</span>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-sm text-teal-100/90 mt-1 max-w-xl">
            {role === 'patient' &&
              'Manage your appointments, diagnostic reports, medications, and hospital invoices under strict patient data isolation.'}
            {role === 'doctor' &&
              'Clinical physician workbench. You are authorized to review records strictly for your assigned patients.'}
            {role === 'admin' &&
              'Administrative and security operations console. Monitor audit violations and execute automated access control test suites.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/access-tester"
            className="px-4 py-2 bg-white text-teal-800 hover:bg-teal-50 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4 text-teal-600" />
            <span>Launch Access Tester</span>
          </Link>
          <Link
            to="/testing"
            className="px-4 py-2 bg-teal-600/40 hover:bg-teal-600/60 text-white border border-teal-300/30 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Testing Dashboard</span>
          </Link>
        </div>
      </div>

      {/* PATIENT VIEW */}
      {role === 'patient' && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Appointments
                </div>
                <div className="text-2xl font-black text-slate-800 mt-1">
                  {appointments.length}
                </div>
                <div className="text-xs text-teal-600 mt-0.5 font-medium">Scheduled & History</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Medical Reports
                </div>
                <div className="text-2xl font-black text-slate-800 mt-1">{reports.length}</div>
                <div className="text-xs text-sky-600 mt-0.5 font-medium">Lab & Diagnostic</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Prescriptions
                </div>
                <div className="text-2xl font-black text-slate-800 mt-1">
                  {prescriptions.length}
                </div>
                <div className="text-xs text-indigo-600 mt-0.5 font-medium">Active Medications</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Invoices Due
                </div>
                <div className="text-2xl font-black text-slate-800 mt-1">
                  ${invoices.filter((i) => i.status === 'Pending').reduce((acc, cur) => acc + cur.patientOwes, 0)}
                </div>
                <div className="text-xs text-amber-600 mt-0.5 font-medium">Patient Copay Total</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Reports & Appointments Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Medical Reports */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <h2 className="font-bold text-slate-800 text-base">Recent Medical Reports</h2>
                </div>
                <Link to="/reports" className="text-xs font-bold text-teal-600 hover:text-teal-700">
                  View All ({reports.length})
                </Link>
              </div>

              {reports.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">No reports recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {reports.slice(0, 3).map((rep) => (
                    <div
                      key={rep.reportId}
                      className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between transition"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{rep.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {rep.category} • Date: {rep.date} • Doctor: {rep.doctorName}
                        </div>
                      </div>
                      <StatusBadge status="COMPLETED" size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <h2 className="font-bold text-slate-800 text-base">Appointments</h2>
                </div>
                <Link to="/appointments" className="text-xs font-bold text-teal-600 hover:text-teal-700">
                  Schedule New
                </Link>
              </div>

              {appointments.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">No appointments found.</p>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt.appointmentId}
                      className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between transition"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{apt.reason}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {apt.date} at {apt.time} • {apt.doctorName}
                        </div>
                      </div>
                      <StatusBadge status={apt.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* DOCTOR VIEW */}
      {role === 'doctor' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <h2 className="font-bold text-slate-800 text-lg">My Assigned Patients</h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                {assignedPatients.length} Active Patients
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              According to healthcare compliance policies, physicians can only inspect clinical records for patients assigned under their medical supervision.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {assignedPatients.map((p) => (
                <div
                  key={p.patientId}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-teal-300 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">
                      {p.patientId}
                    </span>
                    <span className="text-xs text-slate-500">{p.gender}, {p.bloodType}</span>
                  </div>
                  <div className="font-bold text-slate-800 text-base">{p.name}</div>
                  <div className="text-xs text-slate-500 mt-1">DOB: {p.dob}</div>
                  <div className="text-xs text-slate-600 mt-2 font-medium">
                    Allergies: {p.allergies.join(', ') || 'None'}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                    <Link
                      to={`/reports?patientId=${p.patientId}`}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <span>Medical Chart</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN VIEW */}
      {role === 'admin' && testStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Test Cases
              </div>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {testStats.totalTestCases}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Automated RBAC Matrix</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Passed Tests
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {testStats.passed}
              </div>
              <div className="text-xs text-emerald-700 mt-0.5 font-medium">
                {testStats.passPercentage}% Pass Rate
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Failed Tests
              </div>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {testStats.failed}
              </div>
              <div className="text-xs text-rose-700 mt-0.5 font-medium">Security Regressions</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Blocked / Pending
              </div>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {testStats.blocked + testStats.notRun}
              </div>
              <div className="text-xs text-amber-700 mt-0.5 font-medium">Pending Execution</div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Test Matrix Health by Category</h3>
                <p className="text-xs text-slate-500">Security and API boundary test coverage</p>
              </div>
              <Link
                to="/testing"
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition"
              >
                Go to Testing Dashboard
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {testStats.categoryStats?.map((cat) => (
                <div key={cat.category} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {cat.category}
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-slate-900">{cat.passed}/{cat.total}</span>
                    <span className="text-xs font-bold text-teal-600">({cat.passPercentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${cat.passPercentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
