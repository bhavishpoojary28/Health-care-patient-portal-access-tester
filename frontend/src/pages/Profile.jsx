import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientAPI } from '../services/api';
import {
  User,
  Heart,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Stethoscope,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Check,
} from 'lucide-react';

export const Profile = () => {
  const { user, role, patientId: authPatientId } = useAuth();
  const [searchParams] = useSearchParams();
  const targetPatientId = searchParams.get('patientId') || authPatientId || 'P1001';

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await patientAPI.getPatientById(targetPatientId);
        setPatient(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error('Error fetching patient profile:', err);
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to load patient record. Access Denied (403 Forbidden).'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [targetPatientId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await patientAPI.updatePatient(targetPatientId, formData);
      setPatient(res.data.patient);
      setEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update patient profile');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-slate-500 font-medium">Retrieving patient record...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 shadow-sm text-center max-w-xl mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Control Violation (403)</h2>
        <p className="text-sm text-rose-700 bg-rose-50 p-3.5 rounded-xl border border-rose-200 mb-4 font-mono text-left">
          {error}
        </p>
        <p className="text-xs text-slate-500 leading-relaxed">
          The backend security filter verified that your current session does not own Patient ID <strong>{targetPatientId}</strong>. Cross-patient access attempts are logged in the security audit trail.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-sky-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-teal-600/20">
            {patient?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{patient?.name}</h1>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                {patient?.patientId}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>DOB: {patient?.dob}</span>
              <span>•</span>
              <span>Blood Group: <strong>{patient?.bloodType}</strong></span>
              <span>•</span>
              <span>Gender: {patient?.gender}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Updated!
            </span>
          )}
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Main Profile Grid */}
      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact & Demographics */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <User className="w-4 h-4 text-teal-600" />
              <span>Contact & Address</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block font-semibold mb-1">Email Address</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 outline-none"
                  />
                ) : (
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient?.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-semibold mb-1">Phone Number</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 outline-none"
                  />
                ) : (
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient?.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-semibold mb-1">Residential Address</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 outline-none"
                  />
                ) : (
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient?.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clinical Assignment & Health Details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Stethoscope className="w-4 h-4 text-sky-600" />
              <span>Assigned Care Team & Clinical Notes</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200">
                <span className="text-[11px] font-bold text-teal-800 uppercase block">
                  Primary Attending Physician
                </span>
                <span className="font-bold text-slate-900 text-sm block mt-0.5">
                  {patient?.assignedDoctorName}
                </span>
                <span className="text-teal-700 font-mono text-[11px]">
                  Staff Code: {patient?.assignedDoctorId}
                </span>
              </div>

              <div>
                <label className="text-slate-400 block font-semibold mb-1">
                  Allergies (Adverse Drug Reactions)
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {patient?.allergies?.map((allergy, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block font-semibold mb-1">
                  Chronic Conditions
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {patient?.chronicConditions?.map((cond, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      {cond}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {editing && (
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition"
            >
              Save Profile Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
