import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useHostel } from '@/app/HostelContext';

interface Bed {
  id: number;
  roomId: number;
  bedNumber: string;
  bedName: string;
  status: string;
  studentId: number | null;
}

export default function BedMgmt() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [formData, setFormData] = useState({ roomId: '', bedNumber: '', bedName: '', status: 'VACANT' });
  const { selectedHostelId } = useHostel();

  useEffect(() => {
    fetchBeds();
  }, [selectedHostelId]);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/beds', {
        params: { hostelId: selectedHostelId || undefined }
      });
      setBeds(data);
    } catch (error) {
      toast({ title: 'Error fetching beds', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateBedStatus = async (bedId: number, currentBed: Bed, newStatus: string) => {
    try {
      await api.put(`/beds/${bedId}`, { ...currentBed, status: newStatus });
      toast({ title: `Bed status updated to ${newStatus}` });
      fetchBeds();
    } catch(err) {
      toast({ title: 'Error updating bed', variant: 'destructive' });
    }
  }

  const handleSaveBed = async () => {
    try {
      if (selectedBed) {
        await api.put(`/beds/${selectedBed.id}`, { ...selectedBed, ...formData });
        toast({ title: 'Bed updated successfully' });
      } else {
        await api.post('/beds', {
           roomId: parseInt(formData.roomId),
           bedNumber: formData.bedNumber,
           bedName: formData.bedName,
           status: formData.status
        });
        toast({ title: 'Bed created successfully' });
      }
      setIsModalOpen(false);
      fetchBeds();
    } catch (err) {
      toast({ title: 'Error saving bed', variant: 'destructive' });
    }
  };

  const openAddModal = () => {
    setSelectedBed(null);
    setFormData({ roomId: '', bedNumber: '', bedName: '', status: 'VACANT' });
    setIsModalOpen(true);
  };

  const openEditModal = (bed: Bed) => {
    setSelectedBed(bed);
    setFormData({ roomId: bed.roomId.toString(), bedNumber: bed.bedNumber, bedName: bed.bedName, status: bed.status });
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bed Management</h1>
        <Button onClick={openAddModal}>Add New Bed</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Beds</CardTitle>
        </CardHeader>
        <CardContent>
          {beds.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No beds found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room ID</TableHead>
                  <TableHead>Bed Number</TableHead>
                  <TableHead>Bed Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beds.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.roomId}</TableCell>
                    <TableCell className="font-medium">{b.bedNumber}</TableCell>
                    <TableCell>{b.bedName}</TableCell>
                    <TableCell>
                      <Badge variant={
                        b.status === 'OCCUPIED' ? 'default' : 
                        b.status === 'VACANT' ? 'secondary' : 
                        'destructive'
                      }>
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{b.studentId || 'None'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                         {b.status === 'VACANT' && (
                           <Button variant="outline" size="sm" onClick={() => updateBedStatus(b.id, b, 'MAINTENANCE')}>Set Maintenance</Button>
                         )}
                         {b.status === 'MAINTENANCE' && (
                           <Button variant="outline" size="sm" onClick={() => updateBedStatus(b.id, b, 'VACANT')}>Set Vacant</Button>
                         )}
                         <Button variant="outline" size="sm" onClick={() => openEditModal(b)}>Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBed ? 'Edit Bed' : 'Add New Bed'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Room ID</label>
              <Input type="number" value={formData.roomId} onChange={(e) => setFormData({...formData, roomId: e.target.value})} disabled={!!selectedBed} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bed Number</label>
              <Input value={formData.bedNumber} onChange={(e) => setFormData({...formData, bedNumber: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bed Name</label>
              <Input value={formData.bedName} onChange={(e) => setFormData({...formData, bedName: e.target.value})} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBed}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
