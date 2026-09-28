# Healthcare Patient Portal Access Tester

A full-stack healthcare web application and software testing suite demonstrating robust verification of **Authentication**, **Role-Based Access Control (RBAC)**, **Session Security**, and **Patient Data Isolation (Prevention of Insecure Direct Object References / BOLA)**.

---

## 🌟 Key Features

### 1. Healthcare Patient Portal
- **Patient Workspace**: Dedicated portal for patients (`patientA`, `patientB`, `patientC`) to access their own:
  - Personal health profiles and emergency contacts
  - Scheduled appointments with attending doctors
  - Diagnostic medical reports and lab results
  - Active & past prescriptions with dosage instructions
  - Invoices and billing statements
- **Doctor Workspace**: Dedicated view for physicians (`dr_alice`, `dr_bob`) to review assigned patients, clinical notes, lab results, and appointments.
- **Admin Workspace**: Security and system administration portal (`admin`) for user management, system audit trails, and security test execution.
- **Strict Server-Side Authorization**: Zero reliance on client-side security. The backend validates JWT signatures, user roles, patient identity ownership, and doctor-patient assignment on every single request. Attempts by Patient A (`P1001`) to access Patient B (`P1002`) resources result in immediate `HTTP 403 Forbidden` responses.
- **Interactive Persona Quick-Switcher**: Convenient top navigation bar selector allowing instant one-click switching between demo personas (Patient A, Patient B, Dr. Alice, Dr. Bob, and System Admin).

### 2. Software Testing Dashboard (`/testing`)
- **Real-Time Metrics Overview**:
  - Total Test Cases
  - Passed / Failed / Blocked Counts
  - Real-Time Pass Percentage (%)
  - Breakdown by Test Category (Authentication, Authorization, API Access, Session Security)
- **Interactive Test Suite Manager**:
  - Pre-seeded with TC001 through TC010
  - Live execution engine: Run any individual test case or the entire test suite on-demand with live status updates
  - Full CRUD operations: Add new test cases, edit parameters, delete, or add tester comments
  - Dynamic filtering by Category, Status (PASS / FAIL / BLOCKED), and search queries
  - Accessible exclusively to users with the `admin` role (non-admin access redirected to `/access-denied`)

### 3. Dedicated Access Control Tester (`/access-tester`)
- Interactive security demonstration sandbox:
  - **Requester Selection**: Select calling user identity (Patient A, Patient B, Dr. Alice, Dr. Bob, Attacker / Guest)
  - **Target Patient Selection**: Choose target record identifier (`P1001`, `P1002`, `P1003`)
  - **Target Resource Selection**: Select target resource (`Profile`, `Medical Report`, `Appointments`, `Prescriptions`, `Billing`)
- **Live Security Feedback**:
  - Compares **Expected Security Outcome** (`ACCESS GRANTED` vs `ACCESS DENIED`) against **Actual Backend Response** (`HTTP 200` vs `HTTP 403 / 401`)
  - Status indicator: **PASS** (expected matched actual) or **FAIL** (security policy breached)
  - Color-coded and text-labeled status indicators (Green for PASS, Red for FAIL, Amber for BLOCKED)
  - Real-time generation of immutable security audit log entries

### 4. Comprehensive Security Audit Trail (`/audit-logs`)
- Live logging of security-critical actions:
  - Successful logins & logouts
  - Failed authentication attempts (invalid credentials)
  - Successful authorized resource queries
  - **Unauthorized cross-patient access attempts (IDOR violations)**
  - Automated & manual test executions
- Metadata captured: User ID, Role, Client IP Address, User-Agent, HTTP Method, API Endpoint, Status (`SUCCESS` / `DENIED`), and Failure Rationale.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6 |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), JWT (`jsonwebtoken`), `bcryptjs`, Morgan, CORS |
| **API Testing** | Jest, Supertest |
| **E2E Testing** | Cypress v13 |
| **Database** | MongoDB (with embedded fallback support via `mongodb-memory-server`) |

---

## 👥 Demo Personas & Credentials

All test accounts come pre-configured with the following credentials:

| Role | Username | Password | ID | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Patient A** | `patientA` | `Password123!` | `P1001` | Assigned to Dr. Alice Carter |
| **Patient B** | `patientB` | `Password123!` | `P1002` | Assigned to Dr. Bob Vance |
| **Patient C** | `patientC` | `Password123!` | `P1003` | Assigned to Dr. Alice Carter |
| **Doctor** | `dr_alice` | `DoctorPass123!` | `D201` | Authorized for `P1001` & `P1003` |
| **Doctor** | `dr_bob` | `DoctorPass123!` | `D202` | Authorized for `P1002` only |
| **Admin** | `admin` | `AdminPass123!` | `ADMIN` | Full access to Testing Dashboard & Audit Logs |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/healthcare_portal`) or uses embedded in-memory server if local Mongo is unavailable.

### Installation

Clone the repository and install all dependencies:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### Seeding the Database

Seed the database with all demo patients, doctors, appointments, medical reports, prescriptions, billing records, and test cases:

```bash
cd backend
npm run seed
cd ..
```

### Running the Application

You can start both backend and frontend concurrently from the root directory:

```bash
npm run dev
```

Or start each service separately:

```bash
# Terminal 1 - Backend Server (Port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend Client (Port 5173)
cd frontend
npm run dev
```

Once running:
- **Frontend Portal**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Automated Testing

### 1. Backend API & Security Tests (Jest + Supertest)

Runs 20 automated tests validating authentication, RBAC, IDOR cross-patient isolation, session expiration, and tamper prevention:

```bash
npm run test:backend
# or inside backend folder:
cd backend && npm test
```

### 2. End-to-End Tests (Cypress)

Runs automated browser tests covering user authentication workflows, RBAC route guards, the Software Testing Dashboard, and the Access Control Tester:

```bash
# Ensure both backend and frontend servers are running first!
npm run test:cypress

# Or open Cypress Interactive Test Runner:
npm run cypress:open
```

---

## 🛡️ Pre-Configured Test Cases (TC001 - TC010)

| ID | Category | Title | Expected Result |
| :--- | :--- | :--- | :--- |
| `TC001` | Authentication | Valid patient login | 200 OK & JWT returned |
| `TC002` | Authentication | Invalid password rejected | 401 Unauthorized |
| `TC003` | Authorization | Patient accesses own profile (`P1001` -> `P1001`) | 200 OK |
| `TC004` | Authorization | Patient accesses another patient (`P1001` -> `P1002`) | 403 Forbidden |
| `TC005` | Authorization | Doctor accesses assigned patient (`D201` -> `P1001`) | 200 OK |
| `TC006` | Authorization | Doctor accesses unassigned patient (`D201` -> `P1002`) | 403 Forbidden |
| `TC007` | API Security | Unauthenticated API request | 401 Unauthorized |
| `TC008` | Security | Tampered/Invalid JWT | 401 Unauthorized |
| `TC009` | Security | Expired JWT handling | 401 Unauthorized |
| `TC010` | RBAC | Admin accesses testing dashboard | 200 OK |
