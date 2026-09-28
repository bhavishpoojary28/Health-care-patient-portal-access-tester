import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { prescriptionAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Pill, Plus, Stethoscope, AlertCircle, Calendar } from 'lucide-react';

export const Prescriptions = () => {
  const { role, patientId: authPatientId } = useAuth();
  const [searchParams] = useSearchParams();
  const filterPatientId = searchParams.get('patientId') || (role === 'patient' ? authPatientId : undefined);

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const res = await prescriptionAPI.getPrescriptions({ patientId: filterPatientId });
        setPrescriptions(res.data);
      } catch (err) {
        console.error('Failed to load prescriptions', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [filterPatientId, role, authPatientId]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
              <Pill className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Medication Management
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Prescriptions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Active medication schedules, dosing instructions, and prescriber authorizations.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading prescriptions...</div>
        ) : prescriptions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            No prescriptions on file.
          </div>
        ) : (
          prescriptions.map((rx) => (
            <div
              key={rx.prescriptionId}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                    {rx.prescriptionId}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    Patient: {rx.patientName} ({rx.patientId})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Issued: {rx.date}</span>
                  <StatusBadge status={rx.status} size="sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rx.medications?.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs"
                  >
                    <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                      <span>{med.name}</span>
                      <span className="font-mono text-teal-700 font-semibold">{med.dosage}</span>
                    </div>
                    <div className="text-slate-600 font-medium">Frequency: {med.frequency}</div>
                    <div className="text-slate-500">Duration: {med.duration}</div>
                    <div className="text-teal-800 font-medium mt-1 bg-teal-50 p-1.5 rounded border border-teal-100">
                      Instructions: {med.instructions}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-slate-500 pt-2 flex items-center justify-between">
                <span>Prescribed by: <strong>{rx.doctorName}</strong></span>
                {rx.notes && <span className="italic text-slate-400">Note: {rx.notes}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
