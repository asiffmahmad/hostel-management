import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPending, approve, reject, updateAdmission } from '@/services/adminAdmission';
import { toast } from 'react-hot-toast';
import type { AdmissionRequestResponseDTO } from '@/types';

/**
 * Admin UI for managing pending admission requests.
 * Shows a simple table with approve/reject actions.
 */
const AdminAdmissions: React.FC = () => {
  const [pending, setPending] = useState<AdmissionRequestResponseDTO[]>([]);
  const [editingAdmission, setEditingAdmission] = useState<AdmissionRequestResponseDTO | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
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

  const handleEdit = (p: AdmissionRequestResponseDTO) => {
    setEditingAdmission(p);
    setEditFormData({ ...p });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmission?.id) return;
    try {
      await updateAdmission(editingAdmission.id, editFormData);
      toast.success('Admission updated successfully');
      setEditingAdmission(null);
      fetchPending();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update admission');
    }
  };

  return (
    <div className="p-3 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Pending Admissions</h1>
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
                  <button className="btn-secondary mr-2" onClick={() => handleEdit(p)} style={{ backgroundColor: '#6b7280', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                    Edit
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

      {editingAdmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4 sm:pt-20 sm:pb-20">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-4 sm:p-6 my-auto">
            <h2 className="text-xl font-bold mb-4">Edit Admission Request</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student Name</label>
                  <input type="text" required value={editFormData.studentName || ''} onChange={e => setEditFormData({...editFormData, studentName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" required value={editFormData.email || ''} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="text" required pattern="^\d{10}$" title="Phone must be exactly 10 digits" value={editFormData.phone || ''} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Parent Phone</label>
                  <input type="text" required pattern="^\d{10}$" title="Parent phone must be exactly 10 digits" value={editFormData.parentPhone || ''} onChange={e => setEditFormData({...editFormData, parentPhone: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                  <input type="text" required value={editFormData.fatherName || ''} onChange={e => setEditFormData({...editFormData, fatherName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aadhaar</label>
                  <input type="text" required pattern="^\d{12}$" title="Aadhaar must be exactly 12 digits" value={editFormData.aadhaarNumber || ''} onChange={e => setEditFormData({...editFormData, aadhaarNumber: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea required value={editFormData.address || ''} onChange={e => setEditFormData({...editFormData, address: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" rows={2}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hostel Code</label>
                  <input type="text" required value={editFormData.hostelCode || ''} onChange={e => setEditFormData({...editFormData, hostelCode: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Number</label>
                  <input type="text" required value={editFormData.roomNumber || ''} onChange={e => setEditFormData({...editFormData, roomNumber: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bed Name</label>
                  <input type="text" value={editFormData.bedName || ''} onChange={e => setEditFormData({...editFormData, bedName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" placeholder="Pending Assignment" />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setEditingAdmission(null)} className="btn-secondary" style={{ backgroundColor: '#e5e7eb', color: 'black', padding: '0.5rem 1rem', borderRadius: '0.25rem' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdmissions;
