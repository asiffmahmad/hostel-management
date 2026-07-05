# Product Requirement Document (PRD)

## 1. Product Overview

**Purpose:**  
The Hostel Management System is designed to digitize and streamline the end-to-end operations of running and managing multiple hostels. It manages physical infrastructure (hostels, rooms, beds), tenant lifecycle (admissions, mapping, vacating), and financial tracking (rent collection, UTR mapping, bank statement reconciliation, and expense management).

**Problem Statement:**  
Manual management of multiple hostels leads to double bookings, inaccurate vacancy counts, missed rent payments, and tedious manual reconciliation of bank transfers via UTRs. A centralized digital system is required to maintain a single source of truth across all properties.

**Objectives:**  
- Automate bed availability tracking across all properties.
- Securely store and manage highly sensitive student personal data (Aadhaar, contact info) using AES-GCM encryption.
- Streamline monthly fee generation and receipt tracking.
- Automate bank statement parsing to verify UTRs and map them to outstanding student payments.
- Provide a public-facing online admission wizard for prospective students.
- Track operational expenses globally across all hostels.

**Business Goals:**  
- Reduce revenue leakage from uncollected rent.
- Minimize administrative overhead during monthly rent collection.
- Provide a real-time, accurate dashboard of occupancy and revenue for owners.
- Enable a paperless admission process via the public admission wizard.

**Target Users:**  
- **Hostel Owners / Admins:** To view dashboards, revenue, expenses, and manage infrastructure.
- **Managers / Wardens:** To handle student admissions, bed mapping, and manual payment entry.
- **Prospective Students:** To submit admission applications via the public-facing wizard.

**Owner:**  
Sri Sai Ram Ladies Hostel Administration Team.

**Live Hostels:**  
- Sri Sai Ram Ladies Hostel H1 (hostel code: `H1`)  
- Sri Sai Ram Ladies Hostel H2 (hostel code: `H2`)  
- Sri Sai Ram Ladies Hostel H3  
- Sri Sai Ram Ladies Hostel H4 (hostel code: `H4`)

**Future Scope:**  
- Dedicated Student Portal for raising complaints and viewing payment history.
- Automated payment gateway integrations (Razorpay, UPI intent).
- Granular Role-Based Access Control (RBAC) for Warden / Accountant roles.
- Automated monthly invoice generation via scheduled jobs.
- Flyway/Liquibase for production-grade database migrations.

---

## 2. Functional Requirements

### Dashboard
Provides real-time KPIs calculated dynamically from the database. KPIs include Total Hostels, Total Students, Occupied Beds, Vacant Beds, Occupancy Rate, and Monthly Revenue. Supports global filtering by Hostel (or cumulative "All Hostels" view).

### Hostel Management
CRUD operations for physical Hostel buildings. Each hostel has a name, address, hostel code, and status. Soft deletion is enforced. Hostel code is used for public admission routing.

### Room Management
CRUD operations for Rooms within a selected Hostel. Attributes include Room Number, Floor, Type (AC/Non-AC), and Capacity. When a room is created or its capacity is updated, beds are **automatically created or soft-deleted** to match. Soft deletion cascades to associated beds.

### Bed Management
Beds are auto-managed based on room capacity. Each bed has a unique identifier and status (`OCCUPIED` / `VACANT` / `MAINTENANCE` / `BLOCKED`). Total bed count for a hostel is always derived from actual bed records, not a cached field.

### Student Management
End-to-end lifecycle management of students (admissions, editing profiles, assigning to beds, vacating). Captures highly sensitive encrypted data including Aadhaar, phone numbers, parent contact, and emergency contacts. All PII is stored encrypted (AES-GCM) with HMAC hashes for searchability.

### Online Admission (Public Wizard)
A public multi-step admission wizard accessible without login. Prospective students select a hostel, choose a room, and fill personal details. The submission creates a `HostelAdmissionRequest` with `status = PENDING`. Admin can approve or reject with a required reason via a dialog.

### Student Mapping
Allows administrators to quickly view a student's current accommodation and seamlessly transfer them to a new Hostel, Room, and Bed. Transfer history is recorded in `student_transfer_history`.

### Payment Management (Payments & Receipts)
Tracks all financial transactions. Displays a unified grid of PENDING, PAID, and OVERDUE payments filterable by month and text search. Provides KPIs for:
- **Paid count:** Students with PAID payment for the selected month.
- **Need to Pay count:** Total active students − Paid count.

Supports UTR editing, payment deletion, and batch invoice generation.

### Payment Verification (Search Transactions)
A dedicated reconciliation screen to search for specific UTRs in the imported bank transaction table. Unmapped transactions can be linked to a student. Requires phone number validation before mapping. Once mapped, the student's pending payment is marked PAID.

### Bank Statement Upload
Allows uploading of CSV bank statements. The system parses the statement, extracts Reference Numbers (UTRs), Dates, and Amounts, and stores them in `hostel_bank_transaction` for reconciliation.

### Expenses Dashboard
Tracks **global** operational expenses not tied to any individual hostel (shared utilities, maintenance, staff costs, etc.). Expenses dashboard defaults to the current month on load. Supports date range filtering. Fields: Category, Amount, Date, Description, Receipt URL.

### Reports
Unified read-only views (Hostels, Rooms, Students, Payments) with export capabilities for auditing and record-keeping.

### Admin Admissions
Dedicated admin screen to manage pending admission requests. Supports Approve and Reject actions. Rejection requires a mandatory reason entered via a dialog modal.

### Authentication & Authorization
Stateless JWT-based authentication system. Admin role with full access. JWT tokens are valid for 24 hours and stored in `localStorage`.

---

## 3. Screen-wise Functional Documentation

### Dashboard
- **Purpose:** High-level overview of business health.
- **Navigation Path:** `/` or sidebar "Dashboard".
- **Filters:** Global "Hostel" dropdown applies to all KPIs; persisted in localStorage.
- **Calculations:**
  - *Vacant Beds* = Total Beds (non-deleted) − Occupied Beds.
  - *Revenue* = Sum of PAID payment amounts.
  - *Occupancy Rate* = (Occupied Beds / Total Beds) × 100.
- **Success Flow:** Metrics load from backend aggregations; TanStack Query caches results.

### Hostels (Master Data)
- **Purpose:** Manage property portfolios.
- **Navigation Path:** `/hostels`
- **Actions:** Add Hostel, Edit Hostel, Delete Hostel.
- **Business Rules:** Cannot delete a hostel that contains active rooms/students.

### Rooms
- **Purpose:** Manage rooms inside hostels.
- **Navigation Path:** `/rooms`
- **Filters:** By Hostel.
- **Actions:** Create Room (auto-creates beds to match capacity), Edit Room, Delete Room (cascades to beds).
- **Business Rules:** Cannot delete a room with occupied beds.

### Students Directory
- **Purpose:** View and manage all tenant profiles.
- **Navigation Path:** `/students`
- **Columns:** Student ID, Name, Contact, Rent, Room, Status.
- **Actions:** View Details, Edit Profile, Delete (soft).
- **Form Fields:** Name, Phone, Aadhaar, Email, Rent, Deposit, Joining Date, Bed Assignment (Cascading Hostel → Room → Bed dropdowns).
- **Validation:** All PII encrypted on save. Monthly rent must be ≥ 0. Aadhaar is 12 digits.

### Payments & Receipts
- **Purpose:** Manual payment entry and tracking.
- **Navigation Path:** `/payments`
- **Filters:** Text Search (Name/UTR), Month/Year picker.
- **KPIs:** "Paid" and "Need to Pay" calculated for the selected month/hostel (decoupled from text search).
- **Actions:** Record Payment, Edit Payment, Delete Payment, Generate Invoices.
- **Business Rules:** UTR numbers must be unique system-wide (blank/null allowed for cash).

### Bank Statement Upload
- **Purpose:** Bulk import of bank transactions.
- **Navigation Path:** `/import`
- **Actions:** CSV file upload, process, display parsed preview.
- **Business Rules:** Max file size 10MB. Duplicate UTRs in the statement are ignored.

### Search Transactions (Payment Check)
- **Purpose:** Reconcile bank transactions with students.
- **Navigation Path:** `/search-transactions`
- **Actions:** Search by UTR, Map to Student (Cascading Hostel → Room → Student dropdowns).
- **Business Rules:** Phone number required for student mapping. Once mapped, `is_mapped = true` on the bank transaction.

### Expenses Dashboard
- **Purpose:** Track and monitor shared operational costs.
- **Navigation Path:** `/expenses`
- **Filters:** Date range (defaults to current month).
- **Actions:** Add Expense, Delete Expense.
- **Business Rules:** Expenses are global (not hostel-specific).

### Admin Admissions
- **Purpose:** Review and act on online admission requests.
- **Navigation Path:** `/admin/admissions`
- **Actions:** Approve, Reject (with mandatory reason via dialog).
- **Status Flow:** PENDING → APPROVED / REJECTED.

### Public Admission Wizard
- **Purpose:** Allow prospective students to apply online without login.
- **Navigation Path:** `/apply` (public, no auth required)
- **Steps:** Select Hostel → Select Room → Fill Details → Submit.
- **Result:** Creates `HostelAdmissionRequest` with `status = PENDING`.

---

## 4. Business Rules

1. **Bed Occupancy:** One student can occupy only one bed at any given time.
2. **Bed Sync:** When a room's capacity changes, beds are automatically created (new) or soft-deleted (excess) to match.
3. **Deletion Constraints (Infrastructure):** Cannot hard-delete occupied beds, rooms, or hostels. Soft-deletion cascades through room → beds.
4. **Deletion Constraints (Students):** Soft-deletion frees the assigned bed (sets bed status back to `VACANT`).
5. **UTR Uniqueness:** A UTR cannot be reused across payments. Blank/null UTRs are permitted for cash transactions.
6. **Invoice Generation:** "Generate Invoices" creates exactly ONE PENDING payment per active student per month. Duplicates for the same month/year are skipped.
7. **Data Encryption:** All PII (Phone, Parent Phone, Email, Address, Aadhaar) encrypted at rest using AES-GCM (256-bit). HMAC-SHA256 hashes stored for searchable lookup.
8. **Admission Status:** New admission requests always default to `PENDING` (enforced via `@Builder.Default` in the entity). `PENDING_VERIFICATION` status is not used.
9. **Expenses Global:** Expense records are not linked to any individual hostel. They represent whole-organization costs.
10. **Mapping Rules:** A bank transaction can only be mapped to one student. Once mapped, `is_mapped = true`.

---

## 5. Reports

- **Purpose:** Generate tabular data for auditing.
- **Navigation Path:** `/reports`
- **Tabs Available:** Hostels, Rooms, Students, Payments.
- **Filters:** Global Hostel filter.
- **Export Options:** Client-side CSV export (no server round-trip).

---

## 6. Dashboard Calculations

- **Total Hostels:** Count of hostels where `is_deleted = false`.
- **Total Students:** Count of students where `is_deleted = false` for selected hostel.
- **Occupied Beds:** Count of beds where `status = 'OCCUPIED'` in selected hostel.
- **Total Beds:** Count of beds where `is_deleted = false` in selected hostel.
- **Vacant Beds:** `Total Beds − Occupied Beds`.
- **Occupancy Rate:** `(Occupied Beds / Total Beds) × 100`.
- **Monthly Revenue:** Sum of `amount` from payments where `status = 'PAID'` for selected hostel.
- **Need to Pay:** Total active students − count of students with PAID payment for selected month.

---

## 7. User Roles

- **Current State:** Single Admin role with full access via JWT authentication.
- **Permissions:** Full access to all modules, configurations, and financial data.
- **Future Roles:**
  - *Warden:* Can manage students and beds, but cannot delete hostels or view global revenue.
  - *Accountant:* Can access Payments, Bank Uploads, and Search Transactions, but cannot edit physical infrastructure.

---

## 8. Non-Functional Requirements

- **Performance:** Complex dashboard queries must execute in < 500ms. TanStack Query provides aggressive caching and instant UI feedback.
- **Scalability:** Designed to handle 100+ hostels and 10,000+ students on TiDB/MySQL.
- **Security:** AES-GCM (256-bit) for all PII. JWT tokens for stateless session management. Passwords hashed using BCrypt. CORS configured per environment.
- **Maintainability:** Strict layered architecture (Controller → Service → Repository) in Spring Boot. Feature-modular frontend with reusable Shadcn UI components.
- **Usability:** Fully responsive layout. Mobile-first design for grids and forms. Global hostel context persists via localStorage. Public admission wizard is fully scrollable on mobile.
- **Availability & Recovery:** Soft-delete mechanism ensures accidental deletions are reversible from the database. Render keep-alive scheduler pings `/api/health` every 3 minutes to prevent cold starts.
