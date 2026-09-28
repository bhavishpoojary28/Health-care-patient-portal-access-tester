const Billing = require('../models/Billing');

const getInvoices = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'patient') filter.patientId = req.user.patientId;
    else if (req.query.patientId) filter.patientId = req.query.patientId;
    const invoices = await Billing.find(filter).sort({ date: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve billing records' });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Billing.findOne({
      $or: [{ invoiceId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (req.user.role === 'patient' && invoice.patientId !== req.user.patientId) {
      return res.status(403).json({ error: 'Forbidden', code: 'ACCESS_DENIED_OWNERSHIP_MISMATCH' });
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve invoice' });
  }
};

const payInvoice = async (req, res) => {
  try {
    const invoice = await Billing.findOne({ invoiceId: req.params.id });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (req.user.role === 'patient' && invoice.patientId !== req.user.patientId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    invoice.status = 'Paid';
    invoice.patientOwes = 0;
    await invoice.save();
    res.json({ message: 'Invoice paid successfully', invoice });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

module.exports = { getInvoices, getInvoiceById, payInvoice };
