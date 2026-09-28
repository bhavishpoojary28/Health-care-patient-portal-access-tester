import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('health_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized/forbidden
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 401: Unauthorized (token missing / expired / invalid)
      if (error.response.status === 401 && !error.config.url.includes('/auth/login')) {
        // If not already on login page or testing page
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/access-tester')) {
          // Token expired or invalid
          console.warn('[API 401]: Token invalid or session expired.');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  generateTestToken: (params) => api.post('/auth/test-token', params),
};

// Patient Endpoints
export const patientAPI = {
  getPatients: () => api.get('/patients'),
  getPatientById: (patientId) => api.get(`/patients/${patientId}`),
  updatePatient: (patientId, data) => api.put(`/patients/${patientId}`, data),
};

// Appointment Endpoints
export const appointmentAPI = {
  getAppointments: (params) => api.get('/appointments', { params }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  createAppointment: (data) => api.post('/appointments', data),
};

// Medical Report Endpoints
export const reportAPI = {
  getReports: (params) => api.get('/reports', { params }),
  getReportById: (id) => api.get(`/reports/${id}`),
  createReport: (data) => api.post('/reports', data),
};

// Prescription Endpoints
export const prescriptionAPI = {
  getPrescriptions: (params) => api.get('/prescriptions', { params }),
  getPrescriptionById: (id) => api.get(`/prescriptions/${id}`),
  createPrescription: (data) => api.post('/prescriptions', data),
};

// Billing Endpoints
export const billingAPI = {
  getInvoices: (params) => api.get('/billing', { params }),
  getInvoiceById: (id) => api.get(`/billing/${id}`),
  payInvoice: (id) => api.put(`/billing/${id}/pay`),
};

// Testing Dashboard Endpoints
export const testCaseAPI = {
  getTestCases: (params) => api.get('/testing/cases', { params }),
  getStats: () => api.get('/testing/stats'),
  createTestCase: (data) => api.post('/testing/cases', data),
  updateTestCase: (id, data) => api.put(`/testing/cases/${id}`, data),
  deleteTestCase: (id) => api.delete(`/testing/cases/${id}`),
  runTestCase: (id) => api.post(`/testing/cases/${id}/run`),
  runAllTestCases: () => api.post('/testing/run-all'),
};

// Interactive Access Control Simulation Endpoint
export const accessTestAPI = {
  runSimulation: (data) => api.post('/access-test/simulate', data),
};

// Audit Log Endpoints
export const auditAPI = {
  getLogs: (params) => api.get('/audit-logs', { params }),
  getStats: () => api.get('/audit-logs/stats'),
};

export default api;
