import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { billingAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { CreditCard, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react';

export const Billing = () => {
  const { role, patientId: authPatientId } = useAuth();
  const [searchParams] = useSearchParams();
  const filterPatientId = searchParams.get('patientId') || (role === 'patient' ? authPatientId : undefined);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await billingAPI.getInvoices({ patientId: filterPatientId });
      setInvoices(res.data);
    } catch (err) {
      console.error('Failed to load billing', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filterPatientId, role, authPatientId]);

  const handlePay = async (invoiceId) => {
    try {
      setPayingId(invoiceId);
      await billingAPI.payInvoice(invoiceId);
      await fetchInvoices();
    } catch (err) {
      console.error('Payment failed', err);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
              <CreditCard className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Financial & Insurance
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review itemized clinic charges, insurance payments, and patient copay responsibilities.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            No billing records found.
          </div>
        ) : (
          invoices.map((inv) => (
            <div
              key={inv.invoiceId}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                    {inv.invoiceId}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    Patient: {inv.patientName} ({inv.patientId})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Due: {inv.dueDate}</span>
                  <StatusBadge status={inv.status} size="sm" />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {inv.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs py-1 px-3 bg-slate-50 rounded-lg"
                  >
                    <span className="text-slate-700 font-medium">{item.description}</span>
                    <span className="font-mono font-bold text-slate-900">${item.cost}</span>
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex gap-4">
                  <div>
                    <span className="text-slate-400 block font-semibold">Total Charged</span>
                    <span className="font-bold text-slate-800 font-mono text-sm">
                      ${inv.totalAmount}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Insurance Covered</span>
                    <span className="font-bold text-emerald-600 font-mono text-sm">
                      -${inv.insuranceCovered}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Patient Balance</span>
                    <span className="font-black text-rose-600 font-mono text-base">
                      ${inv.patientOwes}
                    </span>
                  </div>
                </div>

                {inv.status !== 'Paid' && (
                  <button
                    onClick={() => handlePay(inv.invoiceId)}
                    disabled={payingId === inv.invoiceId}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <span>{payingId === inv.invoiceId ? 'Processing...' : 'Pay Copay Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Billing;
