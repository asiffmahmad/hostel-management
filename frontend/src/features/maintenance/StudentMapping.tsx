import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Loader2, ArrowRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHostel } from '@/app/HostelContext';

interface Student {
  id: number;
  studentId: string;
  name: string;
  bedId: number | null;
  roomId?: number;
  hostelId?: number;
}

interface Hostel { id: number; name: string; }
interface Room { id: number; roomNumber: string; }
interface Bed { id: number; bedNumber: string; status: string; }

export default function StudentMapping() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferringId, setTransferringId] = useState<number | null>(null);
  
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');

  const [transferReason, setTransferReason] = useState('Room change requested');
  const { toast } = useToast();
  const { selectedHostelId: globalHostelId } = useHostel();

  useEffect(() => {
    fetchStudents();
  }, [globalHostelId]);

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (selectedHostelId) fetchRooms(selectedHostelId);
    else setRooms([]);
  }, [selectedHostelId]);

  useEffect(() => {
    if (selectedRoomId) fetchBeds(selectedRoomId);
    else setBeds([]);
  }, [selectedRoomId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/students', {
        params: { hostelId: globalHostelId || undefined }
      });
      setStudents(data);
    } catch (error) {
      toast({ title: 'Error fetching students', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchHostels = async () => {
    try {
      const { data } = await api.get('/hostels');
      setHostels(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRooms = async (hostelId: string) => {
    try {
      const { data } = await api.get(`/rooms/hostel/${hostelId}`);
      setRooms(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBeds = async (roomId: string) => {
    try {
      const { data } = await api.get(`/beds/room/${roomId}`);
      // When populating beds for a transfer, we want VACANT beds, PLUS the student's CURRENT bed
      setBeds(data.filter((b: Bed) => b.status === 'VACANT' || transferringId && selectedBedId === b.id.toString()));
    } catch (error) {
      console.error(error);
    }
  };

  // Re-fetch beds if the transferringId or selectedBedId state updates 
  // so the current bed appears in the dropdown.
  useEffect(() => {
    if (selectedRoomId) fetchBeds(selectedRoomId);
  }, [transferringId]);

  const handleTransfer = async (id: number) => {
    if (!selectedBedId) return toast({ title: 'Please select a Bed', variant: 'destructive' });
    try {
      await api.post(`/students/${id}/transfer?newBedId=${selectedBedId}&reason=${encodeURIComponent(transferReason)}`);
      toast({ title: 'Student transferred successfully' });
      setTransferringId(null);
      setSelectedHostelId('');
      fetchStudents();
    } catch (error: any) {
      toast({ title: error.response?.data?.message || 'Transfer failed', variant: 'destructive' });
    }
  };

  const handleVacate = async (id: number) => {
    if (!window.confirm("Are you sure you want to vacate this student?")) return;
    try {
      await api.post(`/students/${id}/vacate?reason=Graduated/Left`);
      toast({ title: 'Student vacated successfully' });
      fetchStudents();
    } catch (error: any) {
      toast({ title: 'Failed to vacate', variant: 'destructive' });
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Student Mapping & Transfer</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Student</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Current Bed ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.studentId}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.bedId || 'Unassigned'}</TableCell>
                    <TableCell>
                      {transferringId === s.id ? (
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full min-w-[200px]">
                          <select className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={selectedHostelId} onChange={e => { setSelectedHostelId(e.target.value); setSelectedRoomId(''); setSelectedBedId(''); }}>
                            <option value="">Select Hostel</option>
                            {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                          </select>
                          <select className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={selectedRoomId} onChange={e => { setSelectedRoomId(e.target.value); setSelectedBedId(''); }} disabled={!selectedHostelId}>
                            <option value="">Select Room</option>
                            {rooms.map(r => <option key={r.id} value={r.id}>{r.roomNumber}</option>)}
                          </select>
                          <select className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={selectedBedId} onChange={e => setSelectedBedId(e.target.value)} disabled={!selectedRoomId}>
                            <option value="">Select Bed</option>
                            {beds.map(b => <option key={b.id} value={b.id}>{b.bedNumber}</option>)}
                          </select>
                          <Input 
                            placeholder="Reason" 
                            className="w-32 h-9"
                            value={transferReason}
                            onChange={e => setTransferReason(e.target.value)}
                          />
                          <Button size="sm" onClick={() => handleTransfer(s.id)}>Confirm</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setTransferringId(null); setSelectedHostelId(''); }}>Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => { 
                            setTransferringId(s.id);
                            setSelectedHostelId(s.hostelId?.toString() || '');
                            setSelectedRoomId(s.roomId?.toString() || '');
                            setSelectedBedId(s.bedId?.toString() || '');
                          }}>
                            Transfer <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                          {s.bedId && (
                            <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleVacate(s.id)}>
                              Vacate
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
