import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useHostel } from '@/app/HostelContext';
import api from '@/services/api';
import {
  MessageSquareWarning,
  Building,
  BedDouble,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Hostel { id: number; name: string; }
interface Room { id: number; roomNumber: string; }

const COMPLAINT_TYPES = [
  'Electrical',
  'Plumbing',
  'Cleaning',
  'Furniture',
  'Internet',
  'Other'
];

export default function GiveComplaints() {
  const { toast } = useToast();
  const { selectedHostelId: globalHostelId } = useHostel();

  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState(globalHostelId?.toString() || '');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [complaintType, setComplaintType] = useState('');
  const [description, setDescription] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    if (globalHostelId && !selectedHostelId) {
      setSelectedHostelId(globalHostelId.toString());
    }
  }, [globalHostelId]);

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (selectedHostelId) {
      fetchRooms(selectedHostelId);
    } else {
      setRooms([]);
      setSelectedRoomId('');
    }
  }, [selectedHostelId]);

  const fetchHostels = async () => {
    try {
      const { data } = await api.get('/hostels');
      setHostels(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRooms = async (hostelId: string) => {
    try {
      setLoadingRooms(true);
      const { data } = await api.get(`/rooms/hostel/${hostelId}`);
      setRooms(data);
      setSelectedRoomId('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRooms(false);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      return await api.post('/complaints', {
        hostelId: parseInt(selectedHostelId),
        roomId: parseInt(selectedRoomId),
        type: complaintType,
        description: description,
      });
    },
    onSuccess: () => {
      toast({ title: 'Complaint submitted successfully' });
      setSelectedHostelId(globalHostelId?.toString() || '');
      setComplaintType('');
      setDescription('');
      setSelectedRoomId('');
    },
    onError: (err: any) => {
      toast({ title: err.response?.data?.message || 'Failed to submit complaint', variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHostelId || !selectedRoomId || !complaintType) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    submitMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-lg self-start sm:self-auto">
          <MessageSquareWarning className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Give Complaint</h1>
          <p className="text-muted-foreground text-sm">Register a new maintenance complaint.</p>
        </div>
      </div>

      <Card className="max-w-2xl border-primary/20 shadow-sm glass-panel bg-card">
        <CardHeader>
          <CardTitle>Submit a New Complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" /> Select Hostel
                </label>
                <select
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                  value={selectedHostelId}
                  onChange={e => setSelectedHostelId(e.target.value)}
                  required
                >
                  <option value="">— Select Hostel —</option>
                  {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <BedDouble className="h-3.5 w-3.5" /> Select Room
                </label>
                <select
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                  value={selectedRoomId}
                  onChange={e => setSelectedRoomId(e.target.value)}
                  disabled={!selectedHostelId || loadingRooms}
                  required
                >
                  <option value="">— Select Room —</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.roomNumber}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Complaint Category
              </label>
              <select
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                value={complaintType}
                onChange={e => setComplaintType(e.target.value)}
                required
              >
                <option value="">— Select Category —</option>
                {COMPLAINT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description (Optional)</label>
              <textarea
                className="w-full flex min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              disabled={submitMutation.isPending} 
              className="w-full sm:w-auto mt-2"
            >
              {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Complaint
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
