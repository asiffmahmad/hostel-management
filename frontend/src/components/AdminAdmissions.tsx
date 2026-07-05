import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPending, approve, reject, updateAdmission } from '@/services/adminAdmission';
import { toast } from 'react-hot-toast';
import type { AdmissionRequestResponseDTO } from '@/types';
import { Check, X, Edit2, Phone, Mail, Building, BedDouble, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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
      toast.success(`Admission for ${p.studentName} successfully approved!`);
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
      toast.success('Admission successfully rejected!');
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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-card rounded-2xl glass-panel border shadow-sm flex flex-col h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight">Pending Admissions</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and manage new student applications.</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 px-3 py-1 text-sm font-medium">
            {pending.length} Pending
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-background/50 rounded-md border">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead>Applicant Details</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Aadhaar</TableHead>
                <TableHead>Hostel & Room</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No pending admissions found.
                  </TableCell>
                </TableRow>
              ) : (
                pending.map(p => (
                  <TableRow key={p.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {p.studentName?.substring(0, 2).toUpperCase() || <User size={16} />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{p.studentName}</div>
                          <div className="text-xs text-muted-foreground">ID: #{p.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-muted-foreground" />
                          <span>{p.phone}</span>
                        </div>
                        {p.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail size={14} />
                            <span className="truncate max-w-[150px]">{p.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm text-slate-600 dark:text-slate-400">
                        {p.aadhaarNumber?.replace(/(\d{4})/g, '$1 ').trim()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Building size={14} className="text-muted-foreground" />
                          <span className="font-medium">{p.hostelCode}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BedDouble size={14} />
                          <span>Room {p.roomNumber}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2 opacity-100 sm:opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleApprove(p)}
                          className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 hover:text-green-700"
                        >
                          <Check size={16} className="mr-1" /> Approve
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(p)}
                          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 size={16} className="mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleReject(p.id!)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X size={16} className="mr-1" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden space-y-4 p-4">
          {pending.length === 0 ? (
             <div className="text-center text-muted-foreground py-8">
               No pending admissions found.
             </div>
          ) : (
            pending.map(p => (
              <div key={p.id} className="bg-card border rounded-lg p-4 space-y-4 shadow-sm relative">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {p.studentName?.substring(0, 2).toUpperCase() || <User size={16} />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base truncate">{p.studentName}</div>
                    <div className="text-xs text-muted-foreground">ID: #{p.id}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={14} />
                    <span className="truncate">{p.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building size={14} />
                    <span className="truncate font-medium">{p.hostelCode}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BedDouble size={14} />
                    <span className="truncate">Room {p.roomNumber}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(p)}
                    className="flex-1 text-slate-600 bg-slate-100"
                  >
                    <Edit2 size={14} className="mr-1.5" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleApprove(p)}
                    className="flex-1 bg-green-500/10 text-green-700 border-green-500/30"
                  >
                    <Check size={14} className="mr-1.5" /> Approve
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleReject(p.id!)}
                    className="flex-1 text-red-600 bg-red-50"
                  >
                    <X size={14} className="mr-1.5" /> Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!editingAdmission} onOpenChange={(open) => !open && setEditingAdmission(null)}>
        <DialogContent className="sm:max-w-[600px] h-[90vh] sm:h-auto overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Admission Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Student Name</label>
                <Input required value={editFormData.studentName || ''} onChange={e => setEditFormData({...editFormData, studentName: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" required value={editFormData.email || ''} onChange={e => setEditFormData({...editFormData, email: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone</label>
                <Input required pattern="^\d{10}$" title="Phone must be exactly 10 digits" value={editFormData.phone || ''} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Parent Phone</label>
                <Input required pattern="^\d{10}$" title="Parent phone must be exactly 10 digits" value={editFormData.parentPhone || ''} onChange={e => setEditFormData({...editFormData, parentPhone: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Father's Name</label>
                <Input required value={editFormData.fatherName || ''} onChange={e => setEditFormData({...editFormData, fatherName: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Aadhaar</label>
                <Input required pattern="^\d{12}$" title="Aadhaar must be exactly 12 digits" value={editFormData.aadhaarNumber || ''} onChange={e => setEditFormData({...editFormData, aadhaarNumber: e.target.value})} />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <label className="text-sm font-medium">Address</label>
                <textarea required value={editFormData.address || ''} onChange={e => setEditFormData({...editFormData, address: e.target.value})} className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" rows={2}></textarea>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditingAdmission(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAdmissions;
