# Product Requirement Document (PRD)

## 1. Product Overview

**Purpose:**  
The Hostel Management System is designed to digitize and streamline the end-to-end operations of running and managing multiple hostels. It manages physical infrastructure (hostels, rooms, beds), tenant lifecycle (admissions, mapping, vacating), and financial tracking (rent collection, UTR mapping, bank statement reconciliation).

**Problem Statement:**  
Manual management of multiple hostels leads to double bookings, inaccurate vacancy counts, missed rent payments, and tedious manual reconciliation of bank transfers via UTRs. A centralized digital system is required to maintain a single source of truth.

**Objectives:**  
- Automate bed availability tracking across all properties.
- Securely store and manage highly sensitive student personal data (Aadhaar, contact info).
- Streamline monthly fee generation and receipt tracking.
- Automate bank statement parsing to verify UTRs and map them to outstanding student payments.

**Business Goals:**  
- Reduce revenue leakage from uncollected rent.
- Minimize administrative overhead during monthly rent collection.
- Provide a real-time, accurate dashboard of occupancy and revenue for owners.

**Target Users:**  
- **Hostel Owners / Admins:** To view dashboards, revenue, and manage infrastructure.
- **Managers / Wardens:** To handle student admissions, bed mapping, and manual payment entry.

**Owner:**  
Hostel Administration Team.

**Future Scope:**  
- Dedicated Student Portal for raising complaints.
- Automated payment gateway integrations (Razorpay, UPI intent).
- Granular Role-Based Access Control (RBAC).

---

## 2. Functional Requirements

### Dashboard
Provides real-time KPIs calculated dynamically from the database. KPIs include Total Hostels, Total Students, Occupied Students, Total Beds, Occupied Beds, Vacant Beds, Occupancy Rate, and Monthly Revenue. Supports global filtering by Hostel.

### Hostel Management
CRUD operations for physical Hostel buildings. Each hostel has a name, address, contact details, and capacity. Soft deletion is enforced.

### Room Management
CRUD operations for Rooms within a selected Hostel. Attributes include Room Number, Floor, Type (AC/Non-AC), and capacity. Soft deletion is enforced.

### Bed Management
CRUD operations for Beds within a Room. Each bed has a unique identifier and status (OCCUPIED/AVAILABLE/MAINTENANCE).

### Student Management
End-to-end lifecycle management of students (admissions, editing profiles, assigning to beds, vacating). Captures highly sensitive encrypted data including Aadhaar, phone numbers, and emergency contacts.

### Student Mapping
Allows administrators to quickly view a student's current accommodation and seamlessly transfer them to a new Hostel, Room, and Bed.

### Payment Management (Payments & Receipts)
Tracks all financial transactions. Displays a unified grid of PENDING, PAID, and OVERDUE payments. Provides KPIs for "Paid" and "Need to Pay" based on the selected month filter. Supports UTR editing and payment deletion.

### Payment Verification (Payment Check)
A dedicated reconciliation screen to view imported bank transactions, search for specific UTRs, and manually map unlinked bank transactions to specific students or existing pending payments.

### Bank Statement Upload
Allows uploading of CSV bank statements. The system parses the statement, extracts Reference Numbers (UTRs), Dates, and Amounts, and prepares them for mapping.

### Reports
Unified read-only views (Hostels, Rooms, Beds, Students, Payments) with export capabilities for auditing and record-keeping.

### System Settings / Maintenance
Allows administrators to manage application configurations, view audit logs of UTR mappings, and configure environment-level constraints.

### Authentication & Authorization
Stateless JWT-based authentication system. Currently assumes an ADMIN role with full access, with infrastructure in place for future RBAC.

---

## 3. Screen-wise Functional Documentation

### Dashboard
- **Purpose:** High-level overview of business health.
- **Navigation Path:** `/` or sidebar "Dashboard".
- **Filters:** Global "Hostel" dropdown context applies to all KPIs.
- **Calculations:** 
  - *Vacant Beds* = Total Beds (not deleted) - Occupied Beds.
  - *Revenue* = Sum of PAID payments.
- **Success Flow:** Metrics load instantly from backend aggregations.

### Hostels (Master Data)
- **Purpose:** Manage property portfolios.
- **Navigation Path:** `/hostels`
- **Actions:** Add Hostel, Edit Hostel, Delete Hostel.
- **Business Rules:** Cannot delete a hostel if it contains active rooms/beds/students.

### Rooms
- **Purpose:** Manage rooms inside hostels.
- **Navigation Path:** `/rooms`
- **Filters:** By Hostel.
- **Actions:** Create Room (requires selecting Hostel), Edit, Delete.
- **Business Rules:** Cannot delete an occupied room.

### Beds
- **Purpose:** Manage individual beds.
- **Navigation Path:** `/beds`
- **Filters:** By Hostel, Room.
- **Actions:** Add Bed, Edit, Delete.
- **Business Rules:** Cannot delete a bed currently assigned to a student.

### Students Directory
- **Purpose:** View and manage all tenant profiles.
- **Navigation Path:** `/students`
- **Columns:** Student, Contact, Rent, Address, Aadhaar, Status.
- **Actions:** View Details, Edit Profile, Delete.
- **Form Fields:** Name, Phone, Aadhaar, Email, Rent, Deposit, Bed Assignment (Cascading Hostel -> Room -> Bed dropdowns).
- **Validation:** Aadhaar is encrypted on save. Monthly rent must be >= 0.

### Payments & Receipts
- **Purpose:** Manual payment entry and tracking.
- **Navigation Path:** `/payments`
- **Filters:** Text Search (Name/UTR), Month/Year picker.
- **KPIs:** "Paid" and "Need to Pay" calculated based on the selected Month filter (ignoring text search).
- **Actions:** Record Payment, Edit Payment, Delete Payment, Generate Invoices.
- **Business Rules:** UTR numbers must be unique across all payments (unless blank).

### Bank Statement Upload
- **Purpose:** Bulk import of transactions.
- **Navigation Path:** `/import`
- **Actions:** File upload (CSV), process, display preview.
- **Business Rules:** Max file size 10MB. Duplicate UTRs in the statement are flagged/ignored.

### Payment Check
- **Purpose:** Reconcile bank transactions with students.
- **Navigation Path:** `/payment-check`
- **Actions:** Map to Student (Cascading Hostel -> Room -> Student dropdowns), Delete Mapping.
- **Business Rules:** Once mapped, the corresponding student's pending payment for the month is marked as PAID, or a new payment record is created.

---

## 4. Business Rules

1. **Bed Occupancy:** One student can occupy only one bed at any given time.
2. **Deletion Constraints (Infrastructure):**
   - An occupied bed cannot be deleted.
   - A room containing occupied beds cannot be deleted.
   - A hostel containing occupied rooms cannot be deleted.
3. **Deletion Constraints (Students):** Soft-deletion is used. Deleting a student frees up their assigned bed (sets bed status to AVAILABLE).
4. **UTR Uniqueness:** A UTR (Unique Transaction Reference) number cannot be reused across multiple payments. It must be unique system-wide to prevent double-counting. Blank/null UTRs are permitted for manual cash transactions.
5. **Invoice Generation:** The "Generate Invoices" batch job creates exactly ONE pending payment record per active student per month. It skips students who already have a payment record for that specific month/year.
6. **Data Encryption:** Highly sensitive PII (Phone, Parent Phone, Email, Address, Aadhaar) must be encrypted at rest in the database using AES encryption, and decrypted on-the-fly during read operations.
7. **Mapping Rules:** A bank transaction can only be mapped to one student. If mapped, the original bank transaction record is marked as `isMapped = true`.

---

## 5. Reports

- **Purpose:** Generate tabular data for auditing.
- **Navigation Path:** `/reports`
- **Tabs Available:** Hostels, Rooms, Beds, Students, Payments.
- **Filters:** Global Hostel filter.
- **Calculations:** Raw data dump of active (non-deleted) records.
- **Export Options:** Client-side CSV/Excel export functionality.

---

## 6. Dashboard Calculations

- **Total Hostels:** Count of hostels where `is_deleted = false`.
- **Total Students:** Count of students where `is_deleted = false`.
- **Occupied Students:** Count of students with `status = 'ACTIVE'` and a non-null bed assignment.
- **Total Beds:** Count of beds where `is_deleted = false`.
- **Occupied Beds:** Count of beds where `status = 'OCCUPIED'`.
- **Vacant Beds:** `Total Beds - Occupied Beds`.
- **Occupancy Rate:** `(Occupied Beds / Total Beds) * 100`.
- **Monthly Revenue:** Sum of `amount` from all payments where `status = 'PAID'`.

---

## 7. User Roles

- **Current State:** Single generic Admin role utilizing JWT authentication.
- **Permissions:** Full access to all modules, configurations, and financial data.
- **Future Roles:** 
  - *Warden:* Can manage students and beds, but cannot delete hostels or view global revenue.
  - *Accountant:* Can access Payments, Bank Uploads, and Payment Check, but cannot edit physical infrastructure.

---

## 8. Non-Functional Requirements

- **Performance:** Complex dashboard queries must execute in < 500ms. React frontend must utilize TanStack Query for aggressive caching and instant UI feedback.
- **Scalability:** Designed to handle up to 100+ hostels and 10,000+ students on a standard relational database (TiDB/MySQL).
- **Security:** AES Encryption for all PII. JWT tokens for stateless session management. Passwords hashed using Bcrypt.
- **Maintainability:** Strict layered architecture (Controller -> Service -> Repository) in Spring Boot. Reusable Shadcn UI components in React.
- **Usability:** Fully responsive layout. Mobile-first design for grids and forms. Global hostel context persists across page reloads via LocalStorage.
- **Availability & Recovery:** Relies on database-level automated backups. Soft-delete mechanism ensures accidental deletions can be reversed directly from the database by an administrator.
