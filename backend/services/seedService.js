const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalReport = require('../models/MedicalReport');
const Prescription = require('../models/Prescription');
const Billing = require('../models/Billing');
const TestCase = require('../models/TestCase');
const AuditLog = require('../models/AuditLog');

const seedInitialData = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('[Seed] Database already seeded. Skipping initial seeding.');
      return;
    }

    console.log('[Seed] Seeding initial database records...');

    const usersData = [
      { username: 'patientA', email: 'patientA@healthportal.test', password: 'Password123!', name: 'John Doe', role: 'patient', patientId: 'P1001' },
      { username: 'patientB', email: 'patientB@healthportal.test', password: 'Password123!', name: 'Jane Smith', role: 'patient', patientId: 'P1002' },
      { username: 'patientC', email: 'patientC@healthportal.test', password: 'Password123!', name: 'Robert Brown', role: 'patient', patientId: 'P1003' },
      { username: 'dr_alice', email: 'alice@healthportal.test', password: 'DoctorPass123!', name: 'Dr. Alice Carter', role: 'doctor', doctorId: 'D201' },
      { username: 'dr_bob', email: 'bob@healthportal.test', password: 'DoctorPass123!', name: 'Dr. Bob Vance', role: 'doctor', doctorId: 'D202' },
      { username: 'admin', email: 'admin@healthportal.test', password: 'AdminPass123!', name: 'System Admin Sarah', role: 'admin' },
    ];

    const createdUsers = [];
    for (const u of usersData) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`[Seed] Created ${createdUsers.length} users.`);

    const findUser = (uname) => createdUsers.find(u => u.username.toLowerCase() === uname.toLowerCase());

    const doctorsData = [
      {
        doctorId: 'D201',
        userId: findUser('dr_alice')?._id,
        name: 'Dr. Alice Carter',
        specialization: 'Cardiology & General Medicine',
        department: 'Cardiovascular Care',
        email: 'alice@healthportal.test',
        phone: '+1-555-0201',
        licenseNumber: 'MD-74892-CA',
        assignedPatientIds: ['P1001', 'P1003'],
      },
      {
        doctorId: 'D202',
        userId: findUser('dr_bob')?._id,
        name: 'Dr. Bob Vance',
        specialization: 'Neurology & Family Practice',
        department: 'Neurological Sciences',
        email: 'bob@healthportal.test',
        phone: '+1-555-0202',
        licenseNumber: 'MD-83210-NY',
        assignedPatientIds: ['P1002'],
      },
    ];
    await Doctor.insertMany(doctorsData);

    const patientsData = [
      {
        patientId: 'P1001',
        userId: findUser('patientA')?._id,
        name: 'John Doe',
        dob: '1988-04-12',
        gender: 'Male',
        bloodType: 'A+',
        phone: '+1-555-0101',
        email: 'patientA@healthportal.test',
        address: '742 Evergreen Terrace, Springfield',
        emergencyContact: { name: 'Mary Doe', relation: 'Spouse', phone: '+1-555-0102' },
        assignedDoctorId: 'D201',
        assignedDoctorName: 'Dr. Alice Carter',
        allergies: ['Penicillin', 'Sulfa drugs'],
        chronicConditions: ['Mild Asthma'],
      },
      {
        patientId: 'P1002',
        userId: findUser('patientB')?._id,
        name: 'Jane Smith',
        dob: '1992-09-24',
        gender: 'Female',
        bloodType: 'O-',
        phone: '+1-555-0103',
        email: 'patientB@healthportal.test',
        address: '456 Elm St, Metropolia',
        emergencyContact: { name: 'Thomas Smith', relation: 'Brother', phone: '+1-555-0104' },
        assignedDoctorId: 'D202',
        assignedDoctorName: 'Dr. Bob Vance',
        allergies: ['Latex'],
        chronicConditions: ['Type 2 Diabetes'],
      },
      {
        patientId: 'P1003',
        userId: findUser('patientC')?._id,
        name: 'Robert Brown',
        dob: '1975-11-03',
        gender: 'Male',
        bloodType: 'B+',
        phone: '+1-555-0105',
        email: 'patientC@healthportal.test',
        address: '789 Oak Ave, Riverside',
        emergencyContact: { name: 'Sarah Brown', relation: 'Daughter', phone: '+1-555-0106' },
        assignedDoctorId: 'D201',
        assignedDoctorName: 'Dr. Alice Carter',
        allergies: ['Aspirin'],
        chronicConditions: ['Hypertension'],
      },
    ];
    await Patient.insertMany(patientsData);

    const appointmentsData = [
      {
        appointmentId: 'APT-1001',
        patientId: 'P1001',
        patientName: 'John Doe',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        date: '2026-10-05',
        time: '09:30 AM',
        department: 'Cardiovascular Care',
        status: 'Scheduled',
        reason: 'Routine quarterly cardiac evaluation and ECG review',
      },
      {
        appointmentId: 'APT-1002',
        patientId: 'P1001',
        patientName: 'John Doe',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        date: '2026-08-15',
        time: '11:00 AM',
        department: 'General Clinic',
        status: 'Completed',
        reason: 'Annual comprehensive physical wellness examination',
      },
      {
        appointmentId: 'APT-1003',
        patientId: 'P1002',
        patientName: 'Jane Smith',
        doctorId: 'D202',
        doctorName: 'Dr. Bob Vance',
        date: '2026-10-12',
        time: '02:15 PM',
        department: 'Endocrinology',
        status: 'Scheduled',
        reason: 'HbA1c test follow-up and dietary counseling',
      },
      {
        appointmentId: 'APT-1004',
        patientId: 'P1003',
        patientName: 'Robert Brown',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        date: '2026-10-18',
        time: '10:00 AM',
        department: 'Internal Medicine',
        status: 'Scheduled',
        reason: 'Blood pressure monitoring follow-up',
      },
    ];
    await Appointment.insertMany(appointmentsData);

    const reportsData = [
      {
        reportId: 'REP-1001',
        patientId: 'P1001',
        patientName: 'John Doe',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        title: 'Comprehensive Metabolic Panel & Lipid Profile',
        category: 'Laboratory',
        date: '2026-08-15',
        summary: 'Total cholesterol within normal limits. Glucose levels normal.',
        findings: 'Total Cholesterol: 185 mg/dL, HDL: 52 mg/dL, LDL: 105 mg/dL, Triglycerides: 140 mg/dL.',
        recommendations: 'Continue Mediterranean diet and moderate cardiovascular exercise.',
        isConfidential: true,
      },
      {
        reportId: 'REP-1002',
        patientId: 'P1001',
        patientName: 'John Doe',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        title: '12-Lead Electrocardiogram (ECG)',
        category: 'Cardiology',
        date: '2026-08-15',
        summary: 'Normal sinus rhythm, heart rate 68 bpm. No acute ST changes.',
        findings: 'PR interval 150ms, QRS duration 86ms, QTc 410ms. No signs of ischemia.',
        recommendations: 'Routine 1-year follow-up.',
        isConfidential: true,
      },
      {
        reportId: 'REP-2001',
        patientId: 'P1002',
        patientName: 'Jane Smith',
        doctorId: 'D202',
        doctorName: 'Dr. Bob Vance',
        title: 'Glycated Hemoglobin (HbA1c) Analysis',
        category: 'Laboratory',
        date: '2026-09-10',
        summary: 'Elevated HbA1c indicative of moderate glycemic control.',
        findings: 'HbA1c: 7.2% (Target < 7.0%). Estimated average glucose 160 mg/dL.',
        recommendations: 'Adjust Metformin dosage from 500mg to 850mg twice daily with meals.',
        isConfidential: true,
      },
      {
        reportId: 'REP-2002',
        patientId: 'P1002',
        patientName: 'Jane Smith',
        doctorId: 'D202',
        doctorName: 'Dr. Bob Vance',
        title: 'Bilateral Renal Ultrasound',
        category: 'Radiology',
        date: '2026-09-12',
        summary: 'Normal kidney size and parenchyma. No hydronephrosis or calculi detected.',
        findings: 'Right kidney 10.4 cm, Left kidney 10.7 cm. Cortical thickness preserved.',
        recommendations: 'Repeat in 12 months as part of diabetic surveillance.',
        isConfidential: true,
      },
      {
        reportId: 'REP-3001',
        patientId: 'P1003',
        patientName: 'Robert Brown',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        title: '24-Hour Ambulatory Blood Pressure Report',
        category: 'Cardiology',
        date: '2026-09-02',
        summary: 'Diurnal BP variation preserved with mild daytime systolic elevation.',
        findings: 'Average daytime BP 138/88 mmHg. Average nighttime BP 118/72 mmHg.',
        recommendations: 'Maintain low-sodium diet and Lisinopril 10mg daily.',
        isConfidential: true,
      },
    ];
    await MedicalReport.insertMany(reportsData);

    const prescriptionsData = [
      {
        prescriptionId: 'RX-1001',
        patientId: 'P1001',
        patientName: 'John Doe',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        date: '2026-08-15',
        status: 'Active',
        notes: 'Use inhaler 15 minutes before vigorous exercise.',
        medications: [
          { name: 'Albuterol Sulfate Inhaler', dosage: '90 mcg/actuation', frequency: '2 puffs every 4-6 hours as needed', duration: '90 days' },
          { name: 'Multivitamin Formula', dosage: '1 tablet', frequency: 'Once daily', duration: '180 days' },
        ],
      },
      {
        prescriptionId: 'RX-2001',
        patientId: 'P1002',
        patientName: 'Jane Smith',
        doctorId: 'D202',
        doctorName: 'Dr. Bob Vance',
        date: '2026-09-10',
        status: 'Active',
        notes: 'Monitor blood glucose daily before breakfast.',
        medications: [
          { name: 'Metformin HCl ER', dosage: '850 mg', frequency: 'Twice daily', duration: '90 days' },
        ],
      },
      {
        prescriptionId: 'RX-3001',
        patientId: 'P1003',
        patientName: 'Robert Brown',
        doctorId: 'D201',
        doctorName: 'Dr. Alice Carter',
        date: '2026-09-02',
        status: 'Active',
        notes: 'Check blood pressure weekly.',
        medications: [
          { name: 'Lisinopril', dosage: '10 mg', frequency: 'Once daily', duration: '90 days' },
        ],
      },
    ];
    await Prescription.insertMany(prescriptionsData);

    const billingsData = [
      {
        invoiceId: 'INV-1001',
        patientId: 'P1001',
        patientName: 'John Doe',
        date: '2026-08-15',
        dueDate: '2026-09-15',
        items: [
          { description: 'Annual Wellness Exam (CPT 99395)', cost: 250 },
          { description: 'Comprehensive Metabolic Panel (CPT 80053)', cost: 95 },
          { description: '12-Lead Electrocardiogram (CPT 93000)', cost: 120 },
        ],
        totalAmount: 465,
        insuranceCovered: 415,
        patientOwes: 50,
        status: 'Paid',
      },
      {
        invoiceId: 'INV-1002',
        patientId: 'P1001',
        patientName: 'John Doe',
        date: '2026-10-01',
        dueDate: '2026-11-01',
        items: [{ description: 'Prescription Refill Consultation', cost: 75 }],
        totalAmount: 75,
        insuranceCovered: 55,
        patientOwes: 20,
        status: 'Pending',
      },
      {
        invoiceId: 'INV-2001',
        patientId: 'P1002',
        patientName: 'Jane Smith',
        date: '2026-09-10',
        dueDate: '2026-10-10',
        items: [
          { description: 'Endocrinology Specialist Consult (CPT 99214)', cost: 320 },
          { description: 'HbA1c Blood Test (CPT 83036)', cost: 65 },
          { description: 'Renal Ultrasound (CPT 76770)', cost: 380 },
        ],
        totalAmount: 765,
        insuranceCovered: 650,
        patientOwes: 115,
        status: 'Pending',
      },
      {
        invoiceId: 'INV-3001',
        patientId: 'P1003',
        patientName: 'Robert Brown',
        date: '2026-09-02',
        dueDate: '2026-10-02',
        items: [{ description: 'Cardiology Ambulatory BP Monitor (CPT 93784)', cost: 210 }],
        totalAmount: 210,
        insuranceCovered: 180,
        patientOwes: 30,
        status: 'Paid',
      },
    ];
    await Billing.insertMany(billingsData);

    const testCasesData = [
      {
        caseId: 'TC001',
        title: 'Valid patient login',
        category: 'Authentication',
        description: 'Verify that a patient with valid credentials successfully authenticates and receives a valid JWT token.',
        targetEndpoint: '/api/auth/login',
        httpMethod: 'POST',
        roleUnderUser: 'patient',
        testUser: 'patientA',
        expectedStatus: 200,
        expectedResult: 'SUCCESS',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Returns signed JWT with patientId and role claims.',
      },
      {
        caseId: 'TC002',
        title: 'Invalid password',
        category: 'Authentication',
        description: 'Verify that login fails with 401 Unauthorized when an incorrect password is provided.',
        targetEndpoint: '/api/auth/login',
        httpMethod: 'POST',
        roleUnderUser: 'patient',
        testUser: 'patientA_wrongpw',
        expectedStatus: 401,
        expectedResult: 'UNAUTHORIZED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Returns 401 Unauthorized and logs LOGIN_FAILED audit event.',
      },
      {
        caseId: 'TC003',
        title: 'Patient accesses own profile',
        category: 'Authorization',
        description: 'Verify that Patient A (P1001) can access their own profile at /api/patients/P1001.',
        targetEndpoint: '/api/patients/P1001',
        httpMethod: 'GET',
        roleUnderUser: 'patient',
        testUser: 'patientA',
        targetPatientId: 'P1001',
        expectedStatus: 200,
        expectedResult: 'ACCESS GRANTED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Patient has full read rights to own profile.',
      },
      {
        caseId: 'TC004',
        title: 'Patient attempts to access another patient',
        category: 'Security',
        description: 'Verify that Patient A (P1001) is strictly forbidden (403) from accessing Patient B (P1002) records (IDOR/BOLA prevention).',
        targetEndpoint: '/api/patients/P1002',
        httpMethod: 'GET',
        roleUnderUser: 'patient',
        testUser: 'patientA',
        targetPatientId: 'P1002',
        expectedStatus: 403,
        expectedResult: 'ACCESS DENIED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Backend ownership check blocks access with 403 Forbidden and alerts in Audit Log.',
      },
      {
        caseId: 'TC005',
        title: 'Doctor accesses assigned patient',
        category: 'Authorization',
        description: 'Verify that Dr. Alice (D201) can view clinical records for assigned Patient A (P1001).',
        targetEndpoint: '/api/patients/P1001',
        httpMethod: 'GET',
        roleUnderUser: 'doctor',
        testUser: 'dr_alice',
        targetPatientId: 'P1001',
        expectedStatus: 200,
        expectedResult: 'ACCESS GRANTED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Doctor-patient assignment table authorizes clinical access.',
      },
      {
        caseId: 'TC006',
        title: 'Doctor accesses unassigned patient',
        category: 'Security',
        description: 'Verify that Dr. Alice (D201) is blocked with 403 Forbidden when attempting to access unassigned Patient B (P1002).',
        targetEndpoint: '/api/patients/P1002',
        httpMethod: 'GET',
        roleUnderUser: 'doctor',
        testUser: 'dr_alice',
        targetPatientId: 'P1002',
        expectedStatus: 403,
        expectedResult: 'ACCESS DENIED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Unassigned doctor cannot view patient chart.',
      },
      {
        caseId: 'TC007',
        title: 'Unauthenticated API request',
        category: 'API',
        description: 'Verify that requesting protected medical records without an Authorization header returns 401 Unauthorized.',
        targetEndpoint: '/api/reports?patientId=P1001',
        httpMethod: 'GET',
        roleUnderUser: 'unauthenticated',
        testUser: 'anonymous',
        expectedStatus: 401,
        expectedResult: 'UNAUTHORIZED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Rejected by authenticateToken middleware.',
      },
      {
        caseId: 'TC008',
        title: 'Invalid JWT',
        category: 'Security',
        description: 'Verify that a forged, malformed, or tampered JWT token is rejected with 401 Unauthorized.',
        targetEndpoint: '/api/patients/P1001',
        httpMethod: 'GET',
        roleUnderUser: 'attacker',
        testUser: 'tampered_token',
        expectedStatus: 401,
        expectedResult: 'UNAUTHORIZED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Signature verification failure triggers 401 TOKEN_INVALID.',
      },
      {
        caseId: 'TC009',
        title: 'Expired JWT',
        category: 'Authentication',
        description: 'Verify that an expired JWT token returns 401 Unauthorized with TOKEN_EXPIRED code.',
        targetEndpoint: '/api/patients/P1001',
        httpMethod: 'GET',
        roleUnderUser: 'attacker',
        testUser: 'expired_token',
        expectedStatus: 401,
        expectedResult: 'UNAUTHORIZED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: TokenExpiredError handled cleanly with 401.',
      },
      {
        caseId: 'TC010',
        title: 'Admin accesses testing dashboard',
        category: 'Authorization',
        description: 'Verify that an administrator can access test management and view complete audit records.',
        targetEndpoint: '/api/testing/cases',
        httpMethod: 'GET',
        roleUnderUser: 'admin',
        testUser: 'admin',
        expectedStatus: 200,
        expectedResult: 'ACCESS GRANTED',
        lastExecutionStatus: 'PASS',
        lastRunDate: new Date(),
        comments: 'Verified: Admin role permission granted.',
      },
    ];
    await TestCase.insertMany(testCasesData);

    const initialLogs = [
      {
        logId: 'LOG-INIT-101',
        timestamp: new Date(Date.now() - 3600000 * 2),
        eventType: 'LOGIN',
        severity: 'INFO',
        userId: 'P1001',
        username: 'patientA',
        role: 'patient',
        action: 'POST',
        resource: '/api/auth/login',
        statusCode: 200,
        status: 'SUCCESS',
        ipAddress: '192.168.1.45',
        details: 'User patientA successfully authenticated',
      },
      {
        logId: 'LOG-INIT-102',
        timestamp: new Date(Date.now() - 3600000 * 1.8),
        eventType: 'RESOURCE_ACCESS',
        severity: 'INFO',
        userId: 'P1001',
        username: 'patientA',
        role: 'patient',
        action: 'GET',
        resource: '/api/patients/P1001',
        targetPatientId: 'P1001',
        statusCode: 200,
        status: 'SUCCESS',
        ipAddress: '192.168.1.45',
        details: 'Patient P1001 accessed own medical profile',
      },
      {
        logId: 'LOG-INIT-103',
        timestamp: new Date(Date.now() - 3600000 * 1.5),
        eventType: 'UNAUTHORIZED_ACCESS',
        severity: 'ALERT',
        userId: 'P1001',
        username: 'patientA',
        role: 'patient',
        action: 'GET',
        resource: '/api/patients/P1002/reports',
        targetPatientId: 'P1002',
        statusCode: 403,
        status: 'DENIED',
        ipAddress: '192.168.1.45',
        details: 'Patient P1001 attempted to access Patient P1002 medical report → DENIED (403)',
      },
    ];
    await AuditLog.insertMany(initialLogs);

    console.log('[Seed] Database initialization completed successfully!');
  } catch (err) {
    console.error('[Seed Error]:', err);
    throw err;
  }
};

module.exports = { seedInitialData };
