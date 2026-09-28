import React, { useState, useEffect } from 'react';
import { testCaseAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  ShieldAlert,
  Play,
  RotateCw,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

export const TestingDashboard = () => {
  const [testCases, setTestCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningAll, setRunningAll] = useState(false);
  const [runningId, setRunningId] = useState(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [formData, setFormData] = useState({
    caseId: '',
    title: '',
    category: 'Authorization',
    description: '',
    targetEndpoint: '/api/patients/P1002',
    httpMethod: 'GET',
    roleUnderUser: 'patient',
    testUser: 'patientA',
    targetPatientId: 'P1002',
    expectedStatus: 403,
    expectedResult: 'ACCESS DENIED',
    comments: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [casesRes, statsRes] = await Promise.all([
        testCaseAPI.getTestCases({
          category: categoryFilter,
          status: statusFilter,
          search: searchTerm,
        }),
        testCaseAPI.getStats(),
      ]);
      setTestCases(casesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load test dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, statusFilter, searchTerm]);

  // Run single test case live
  const handleRunTest = async (caseId) => {
    try {
      setRunningId(caseId);
      await testCaseAPI.runTestCase(caseId);
      await fetchData();
    } catch (err) {
      console.error('Test execution failed:', err);
    } finally {
      setRunningId(null);
    }
  };

  // Run all test cases in batch
  const handleRunAll = async () => {
    try {
      setRunningAll(true);
      await testCaseAPI.runAllTestCases();
      await fetchData();
    } catch (err) {
      console.error('Batch run failed:', err);
    } finally {
      setRunningAll(false);
    }
  };

  // Delete test case
  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete test case ${id}?`)) {
      try {
        await testCaseAPI.deleteTestCase(id);
        await fetchData();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  // Open modal for Create / Edit
  const handleOpenModal = (tc = null) => {
    if (tc) {
      setEditingCase(tc);
      setFormData({
        caseId: tc.caseId,
        title: tc.title,
        category: tc.category,
        description: tc.description,
        targetEndpoint: tc.targetEndpoint,
        httpMethod: tc.httpMethod,
        roleUnderUser: tc.roleUnderUser,
        testUser: tc.testUser,
        targetPatientId: tc.targetPatientId || '',
        expectedStatus: tc.expectedStatus,
        expectedResult: tc.expectedResult,
        comments: tc.comments || '',
      });
    } else {
      setEditingCase(null);
      setFormData({
        caseId: `TC${String(testCases.length + 1).padStart(3, '0')}`,
        title: '',
        category: 'Authorization',
        description: '',
        targetEndpoint: '/api/patients/P1002',
        httpMethod: 'GET',
        roleUnderUser: 'patient',
        testUser: 'patientA',
        targetPatientId: 'P1002',
        expectedStatus: 403,
        expectedResult: 'ACCESS DENIED',
        comments: '',
      });
    }
    setModalOpen(true);
  };

  // Save Test Case
  const handleSaveTestCase = async (e) => {
    e.preventDefault();
    try {
      if (editingCase) {
        await testCaseAPI.updateTestCase(editingCase.caseId, formData);
      } else {
        await testCaseAPI.createTestCase(formData);
      }
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Save test case failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
              Quality Assurance & Verification
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Software Testing Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Live execution, regression metrics, and management of authentication, authorization, and patient data isolation test cases.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleRunAll}
            disabled={runningAll}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${runningAll ? 'animate-spin' : ''}`} />
            <span>{runningAll ? 'Running Test Suite...' : 'Execute All Tests'}</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Test Case</span>
          </button>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Test Cases
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalTestCases}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Automated Matrix</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Passed
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.passed}</div>
            <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Tests Passing</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
              Failed
            </div>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.failed}</div>
            <div className="text-[11px] text-rose-700 mt-0.5 font-medium">Regressions</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Blocked / Pending
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {stats.blocked + stats.notRun}
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5 font-medium">Attention Needed</div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
              Pass Rate
            </div>
            <div className="text-2xl font-black text-teal-600 mt-1">{stats.passPercentage}%</div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all"
                style={{ width: `${stats.passPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY BREAKDOWN VISUAL CHART CARDS */}
      {stats?.categoryStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.categoryStats.map((cat) => (
            <div
              key={cat.category}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {cat.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-teal-700">
                    {cat.passPercentage}%
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {cat.passed} passed of {cat.total} test cases
                </div>
              </div>

              <div className="mt-3">
                <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{ width: `${cat.total ? (cat.passed / cat.total) * 100 : 0}%` }}
                    title={`Passed: ${cat.passed}`}
                  ></div>
                  <div
                    className="bg-rose-500 transition-all"
                    style={{ width: `${cat.total ? (cat.failed / cat.total) * 100 : 0}%` }}
                    title={`Failed: ${cat.failed}`}
                  ></div>
                  <div
                    className="bg-amber-500 transition-all"
                    style={{ width: `${cat.total ? (cat.blocked / cat.total) * 100 : 0}%` }}
                    title={`Blocked: ${cat.blocked}`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FILTERS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search test case ID or description..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-teal-500 outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium outline-none bg-white"
            >
              <option value="ALL">All Categories</option>
              <option value="Authentication">Authentication</option>
              <option value="Authorization">Authorization</option>
              <option value="API">API</option>
              <option value="Security">Security</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium outline-none bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="NOT_RUN">NOT_RUN</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-800">{testCases.length}</strong> test cases
        </div>
      </div>

      {/* TEST CASES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Test Title & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Endpoint & Method</th>
                <th className="py-3 px-4">Expected</th>
                <th className="py-3 px-4">Last Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Loading test matrix...
                  </td>
                </tr>
              ) : testCases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No test cases match filter criteria.
                  </td>
                </tr>
              ) : (
                testCases.map((tc) => (
                  <tr key={tc.caseId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700 whitespace-nowrap">
                      {tc.caseId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs">{tc.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {tc.description}
                      </div>
                      {tc.comments && (
                        <div className="text-[10px] text-teal-600 font-sans italic mt-0.5">
                          Note: {tc.comments}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {tc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 mr-1.5">
                        {tc.httpMethod}
                      </span>
                      <span className="font-mono text-slate-600 text-[11px]">
                        {tc.targetEndpoint}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-700">{tc.expectedResult}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-1">
                        ({tc.expectedStatus})
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={tc.lastExecutionStatus} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRunTest(tc.caseId)}
                          disabled={runningId === tc.caseId}
                          title="Run Test Live"
                          className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition"
                        >
                          <Play className={`w-3.5 h-3.5 ${runningId === tc.caseId ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(tc)}
                          title="Edit Test Case"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tc.caseId)}
                          title="Delete Test Case"
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingCase ? `Edit Test Case ${editingCase.caseId}` : 'Add New Test Case'}
            </h3>

            <form onSubmit={handleSaveTestCase} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Case ID</label>
                  <input
                    type="text"
                    value={formData.caseId}
                    onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white"
                  >
                    <option value="Authentication">Authentication</option>
                    <option value="Authorization">Authorization</option>
                    <option value="API">API</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Patient attempts unauthorized cross-tenant read"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">HTTP Method</label>
                  <select
                    value={formData.httpMethod}
                    onChange={(e) => setFormData({ ...formData, httpMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white"
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Endpoint</label>
                  <input
                    type="text"
                    value={formData.targetEndpoint}
                    onChange={(e) => setFormData({ ...formData, targetEndpoint: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected HTTP Code</label>
                  <input
                    type="number"
                    value={formData.expectedStatus}
                    onChange={(e) => setFormData({ ...formData, expectedStatus: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Result</label>
                  <select
                    value={formData.expectedResult}
                    onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white"
                  >
                    <option value="ACCESS GRANTED">ACCESS GRANTED</option>
                    <option value="ACCESS DENIED">ACCESS DENIED</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="UNAUTHORIZED">UNAUTHORIZED</option>
                    <option value="FORBIDDEN">FORBIDDEN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Comments / Notes</label>
                <input
                  type="text"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Verification note..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Save Test Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestingDashboard;
