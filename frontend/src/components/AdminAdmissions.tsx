import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPending, approve, reject } from '@/services/adminAdmission';
import { toast } from 'react-hot-toast';
import type { AdmissionRequestResponseDTO } from '@/types';

/**
 * Admin UI for managing pending admission requests.
 * Shows a simple table with approve/reject actions.
 */
const AdminAdmissions: React.FC = () => {
  const [pending, setPending] = useState<AdmissionRequestResponseDTO[]>([]);
  const navigate = useNavigate();

  const fetchPending = async () => {
    try {
      const res = await getPending();
      setPending(res.data);
    } catch (e) {
      toast.error('Failed to load pending admissions');
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (p: AdmissionRequestResponseDTO) => {
    try {
      await approve(p.id!);
      toast.success('Approved');
      window.alert(`Admission for ${p.studentName} successfully approved!`);
      fetchPending();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Approve failed. Invalid bed or room.');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Enter rejection reason');
    if (!reason) return;
    try {
      await reject(id, reason);
      toast.success('Rejected');
      window.alert('Admission successfully rejected!');
      fetchPending();
    } catch (e) {
      toast.error('Reject failed');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Admissions</h1>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white bg-opacity-80 backdrop-blur-sm shadow rounded-lg overflow-hidden">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Aadhaar</th>
              <th className="px-4 py-2">Hostel</th>
              <th className="px-4 py-2">Room</th>
              <th className="px-4 py-2">Bed</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(pending) && pending.map(p => (
              <tr key={p.id} className="border-b">
                <td className="px-4 py-2">{p.id}</td>
                <td className="px-4 py-2 whitespace-nowrap">{p.studentName}</td>
                <td className="px-4 py-2">{p.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">{p.phone}</td>
                <td className="px-4 py-2 whitespace-nowrap">{p.aadhaarNumber}</td>
                <td className="px-4 py-2 whitespace-nowrap">{p.hostelCode}</td>
                <td className="px-4 py-2 whitespace-nowrap">{p.roomNumber}</td>
                <td className="px-4 py-2 whitespace-nowrap">{p.bedName}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button className="btn-primary mr-2" onClick={() => handleApprove(p)}>
                    Approve
                  </button>
                  <button className="btn-danger" onClick={() => handleReject(p.id!)}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAdmissions;
