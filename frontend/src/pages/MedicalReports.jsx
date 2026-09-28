import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { FileText, Eye, Plus, Shield, Stethoscope, Lock, AlertCircle, X } from 'lucide-react';

export const MedicalReports = () => {
  const { role, patientId: authPatientId } = useAuth();
  const [searchParams] = useSearchParams();
  const filterPatientId = searchParams.get('patientId') || (role === 'patient' ? authPatientId : undefined);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    patientId: 'P1001',
    title: '',
    category: 'Laboratory',
    summary: '',
    findings: '',
    recommendations: '',
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getReports({ patientId: filterPatientId });
      setReports(res.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterPatientId, role, authPatientId]);

  const handleOpenDetail = (rep) => {
    setSelectedReport(rep);
    setDetailModalOpen(true);
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      await reportAPI.createReport(newReport);
      setCreateModalOpen(false);
      await fetchReports();
    } catch (err) {
      console.error('Failed to create report', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
              <FileText className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Diagnostic & Clinical Records
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Medical Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Confidential laboratory analyses, imaging results, and physician evaluations.
          </p>
        </div>

        {(role === 'doctor' || role === 'admin') && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Medical Report</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Title & Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">Confidentiality</th>
                <th className="py-3 px-4 text-right">View Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Loading medical reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No medical reports available.
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr key={rep.reportId} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">
                      {rep.reportId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{rep.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rep.patientId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs">{rep.title}</div>
                      <div className="text-[10px] text-teal-700 font-semibold">{rep.category}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700">{rep.date}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{rep.doctorName}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        <Lock className="w-3 h-3 text-teal-600" />
                        <span>Restricted</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(rep)}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold transition inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                  {selectedReport.reportId}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedReport.title}</h3>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 block font-semibold">Patient</span>
                  <span className="font-bold text-slate-800">{selectedReport.patientName}</span>{' '}
                  <span className="font-mono text-slate-500">({selectedReport.patientId})</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Reporting Physician</span>
                  <span className="font-bold text-slate-800">{selectedReport.doctorName}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Clinical Summary</span>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-800 leading-relaxed">
                  {selectedReport.summary}
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Detailed Findings</span>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-800 leading-relaxed font-mono text-[11px]">
                  {selectedReport.findings}
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Physician Recommendations</span>
                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-teal-900 leading-relaxed">
                  {selectedReport.recommendations}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Generate Medical Report</h3>
            <form onSubmit={handleCreateReport} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Patient ID</label>
                <select
                  value={newReport.patientId}
                  onChange={(e) => setNewReport({ ...newReport, patientId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white"
                >
                  <option value="P1001">John Doe (P1001)</option>
                  <option value="P1002">Jane Smith (P1002)</option>
                  <option value="P1003">Robert Brown (P1003)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Report Title</label>
                <input
                  type="text"
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  required
                  placeholder="e.g. Echocardiogram Report"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newReport.category}
                  onChange={(e) => setNewReport({ ...newReport, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white"
                >
                  <option>Laboratory</option>
                  <option>Radiology</option>
                  <option>Cardiology</option>
                  <option>Pathology</option>
                  <option>General Health</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Summary</label>
                <textarea
                  rows="2"
                  value={newReport.summary}
                  onChange={(e) => setNewReport({ ...newReport, summary: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Save & Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalReports;
