import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import {
  MessageSquareWarning,
  Building,
  BedDouble,
  CheckCircle2,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Complaint {
  id: number;
  hostelId: number;
  hostelName: string;
  roomId: number;
  roomNumber: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
}

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

export default function Complaints() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form State
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [complaintType, setComplaintType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Fetch Hostels on Load
  useEffect(() => {
    fetchHostels();
  }, []);

  // Fetch Rooms when Hostel changes
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

  // Queries
  const { data: complaints, isLoading } = useQuery<Complaint[]>({
    queryKey: ['complaints'],
    queryFn: async () => {
      const { data } = await api.get('/complaints');
      return data;
    },
  });

  // Mutations
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
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      // Reset Form
      setSelectedHostelId('');
      setComplaintType('');
      setDescription('');
    },
    onError: (err: any) => {
      toast({ title: err.response?.data?.message || 'Failed to submit complaint', variant: 'destructive' });
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.put(`/complaints/${id}/resolve`);
    },
    onSuccess: () => {
      toast({ title: 'Complaint resolved successfully' });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/complaints/${id}`);
    },
    onSuccess: () => {
      toast({ title: 'Complaint deleted' });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-lg self-start sm:self-auto">
          <MessageSquareWarning className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
          <p className="text-muted-foreground text-sm">Register and track maintenance complaints.</p>
        </div>
      </div>

      <Tabs defaultValue="give" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="give">Give Complaint</TabsTrigger>
          <TabsTrigger value="view">View Complaints</TabsTrigger>
        </TabsList>

        {/* TAB 1: Give Complaint */}
        <TabsContent value="give">
          <Card className="max-w-2xl border-primary/20 shadow-sm">
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
                      className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
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
                      className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
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
                    className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
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
                  className="w-full sm:w-auto"
                >
                  {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit Complaint
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: View Complaints */}
        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>All Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : !complaints || complaints.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border rounded-lg bg-muted/20">
                  No complaints found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium rounded-tl-lg">ID</th>
                        <th className="px-4 py-3 font-medium">Location</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium hidden sm:table-cell">Description</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium hidden md:table-cell">Date</th>
                        <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {complaints.map(c => (
                        <tr key={c.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium text-primary">#{c.id}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold">{c.hostelName}</div>
                            <div className="text-xs text-muted-foreground">Room: {c.roomNumber}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">{c.type}</Badge>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell max-w-[200px] truncate">
                            {c.description || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge 
                              className={
                                c.status === 'RESOLVED' 
                                  ? 'bg-green-500/15 text-green-600 hover:bg-green-500/25 border-none'
                                  : 'bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 border-none'
                              }
                            >
                              {c.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {c.status === 'PENDING' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => resolveMutation.mutate(c.id)}
                                  disabled={resolveMutation.isPending}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" /> Resolve
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  if (window.confirm('Delete this complaint?')) {
                                    deleteMutation.mutate(c.id);
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
