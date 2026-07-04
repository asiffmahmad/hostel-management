import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
const AdminAdmissions = lazy(() => import('@/components/AdminAdmissions'));


import AppLayout from '@/components/layout/AppLayout';
const AdmissionWizard = lazy(() => import('@/features/public/AdmissionWizard'));
const AdmissionSuccess = lazy(() => import('@/components/AdmissionSuccess'));

// Lazy load feature components
const Login = lazy(() => import('@/features/auth/Login'));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const Hostels = lazy(() => import('@/features/hostels/Hostels'));
const HostelExplorer = lazy(() => import('@/features/hostels/HostelExplorer'));
const Rooms = lazy(() => import('@/features/hostels/Rooms'));
const Students = lazy(() => import('@/features/students/Students'));
const Payments = lazy(() => import('@/features/payments/Payments'));
const Reports = lazy(() => import('@/features/reports/Reports'));
const Complaints = lazy(() => import('@/features/complaints/Complaints'));
const SystemSettings = lazy(() => import('@/features/maintenance/SystemSettings'));
const RoomMgmt = lazy(() => import('@/features/maintenance/RoomMgmt'));
const BedMgmt = lazy(() => import('@/features/maintenance/BedMgmt'));
const StudentMapping = lazy(() => import('@/features/maintenance/StudentMapping'));
const PaymentCheck = lazy(() => import('@/features/maintenance/PaymentCheck'));
const ExpensesDashboard = lazy(() => import('@/features/expenses/ExpensesDashboard'));

// Error Pages
const NotFound = () => <div className="flex items-center justify-center h-screen text-2xl font-semibold">404 - Page Not Found</div>;

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-[calc(100vh-100px)] w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
          <Route path="/admission" element={<AdmissionWizard />} />
          <Route path="/admission/success" element={<AdmissionSuccess />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hostels-overview" element={<HostelExplorer />} />
            <Route path="/students" element={<Students />} />
            <Route path="/hostels" element={<Hostels />} />
            <Route path="/hostels/:id/rooms" element={<Rooms />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/expenses" element={<ExpensesDashboard />} />
            
            {/* Maintenance Routes */}
            <Route path="/maintenance/hostels" element={<Hostels />} />
            <Route path="/maintenance/rooms" element={<RoomMgmt />} />
            <Route path="/maintenance/beds" element={<BedMgmt />} />
            <Route path="/maintenance/mapping" element={<StudentMapping />} />
            <Route path="/maintenance/payment-check" element={<PaymentCheck />} />
            <Route path="/maintenance/settings" element={<SystemSettings />} />
            
            {/* Admin Admissions Route */}
            <Route path="/admin/admissions" element={<AdminAdmissions />} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

