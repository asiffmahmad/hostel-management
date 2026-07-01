import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '@/features/auth/Login';
import Dashboard from '@/features/dashboard/Dashboard';
import Hostels from '@/features/hostels/Hostels';
import HostelExplorer from '@/features/hostels/HostelExplorer';
import Rooms from '@/features/hostels/Rooms';
import Students from '@/features/students/Students';
import Payments from '@/features/payments/Payments';
import Reports from '@/features/reports/Reports';
import SystemSettings from '@/features/maintenance/SystemSettings';
import RoomMgmt from '@/features/maintenance/RoomMgmt';
import BedMgmt from '@/features/maintenance/BedMgmt';
import StudentMapping from '@/features/maintenance/StudentMapping';
import PaymentCheck from '@/features/maintenance/PaymentCheck';
import AppLayout from '@/components/layout/AppLayout';

// Error Pages
const NotFound = () => <div className="flex items-center justify-center h-screen text-2xl font-semibold">404 - Page Not Found</div>;

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hostels-overview" element={<HostelExplorer />} />
          <Route path="/students" element={<Students />} />
          <Route path="/hostels" element={<Hostels />} />
          <Route path="/hostels/:id/rooms" element={<Rooms />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/reports" element={<Reports />} />
          
          {/* Maintenance Routes */}
          <Route path="/maintenance/hostels" element={<Hostels />} />
          <Route path="/maintenance/rooms" element={<RoomMgmt />} />
          <Route path="/maintenance/beds" element={<BedMgmt />} />
          <Route path="/maintenance/mapping" element={<StudentMapping />} />
          <Route path="/maintenance/payment-check" element={<PaymentCheck />} />
          <Route path="/maintenance/settings" element={<SystemSettings />} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

