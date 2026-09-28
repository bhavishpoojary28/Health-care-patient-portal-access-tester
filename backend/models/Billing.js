const mongoose = require('mongoose');

const billingItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  cost: { type: Number, required: true },
});

const billingSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, index: true },
  patientName: { type: String, required: true },
  date: { type: String, required: true },
  dueDate: { type: String, required: true },
  items: [billingItemSchema],
  totalAmount: { type: Number, required: true },
  insuranceCovered: { type: Number, default: 0 },
  patientOwes: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  paymentMethod: { type: String, default: 'Health Insurance & Copay' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Billing', billingSchema);
