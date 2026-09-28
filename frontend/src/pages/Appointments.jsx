import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Calendar, Plus, Clock, Stethoscope, User, MapPin, CheckCircle2 } from 'lucide-react';

export const Appointments = () => {
  const { user, role, patientId } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: 'D201',
    date: '2026-10-25',
    time: '10:30 AM',
    department: 'General Clinic',
    reason: 'Routine quarterly check-up',
    notes: '',
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentAPI.getAppointments({
        patientId: role === 'patient' ? patientId : undefined,
      });
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [role, patientId]);

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await appointmentAPI.createAppointment({
        ...formData,
        patientId: role === 'patient' ? patientId : 'P1001',
      });
      setModalOpen(false);
      await fetchAppointments();
    } catch (err) {
      console.error('Failed to schedule appointment', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Schedule & History
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">
            {role === 'patient'
              ? 'View your upcoming clinical visits and past consultation history.'
              : 'Review patient appointments under clinical oversight.'}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Appointment ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Physician & Dept</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Clinical Reason</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No appointments scheduled.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.appointmentId} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">
                      {apt.appointmentId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{apt.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{apt.patientId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{apt.doctorName}</div>
                      <div className="text-[11px] text-teal-700">{apt.department}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{apt.date}</div>
                      <div className="text-[11px] text-slate-500">{apt.time}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700 font-medium">{apt.reason}</div>
                      {apt.notes && (
                        <div className="text-[11px] text-slate-400 italic">{apt.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={apt.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Book New Appointment</h3>
            <form onSubmit={handleBook} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Physician</label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white"
                >
                  <option value="D201">Dr. Alice Carter (Cardiovascular & Internal)</option>
                  <option value="D202">Dr. Bob Vance (Neurology & Family Medicine)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Visit</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  placeholder="e.g. Follow-up on lab results"
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
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
