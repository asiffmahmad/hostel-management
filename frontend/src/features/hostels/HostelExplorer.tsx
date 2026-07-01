import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Loader2, ChevronDown, ChevronRight, Building2, BedDouble, User, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Student {
  studentId: string;
  name: string;
  phone: string;
  email: string;
  parentPhone: string;
  fatherName?: string;
  fatherPhone?: string;
  guardianName?: string;
  guardianPhone?: string;
}

interface Bed {
  id: number;
  bedNumber: string;
  status: string;
  studentName?: string;
  studentId?: number;
}

interface Room {
  id: number;
  roomNumber: string;
  roomName: string;
  capacity: number;
  beds?: Bed[];
  isExpanded?: boolean;
  loadingBeds?: boolean;
}

interface Hostel {
  id: number;
  name: string;
  hostelCode: string;
  rooms?: Room[];
  isExpanded?: boolean;
  loadingRooms?: boolean;
}

export default function HostelExplorer() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Cache for student details
  const [studentCache, setStudentCache] = useState<Record<number, Student>>({});

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/hostels');
      setHostels(data);
    } catch (error) {
      toast({ title: 'Error fetching hostels', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleHostel = async (hostelIndex: number) => {
    const newHostels = [...hostels];
    const hostel = newHostels[hostelIndex];
    
    if (hostel.isExpanded) {
      hostel.isExpanded = false;
      setHostels(newHostels);
      return;
    }

    hostel.isExpanded = true;
    if (!hostel.rooms) {
      hostel.loadingRooms = true;
      setHostels([...newHostels]);
      try {
        const { data } = await api.get(`/rooms/hostel/${hostel.id}`);
        hostel.rooms = data;
      } catch (e) {
        toast({ title: 'Error fetching rooms', variant: 'destructive' });
      } finally {
        hostel.loadingRooms = false;
        setHostels([...newHostels]);
      }
    } else {
      setHostels(newHostels);
    }
  };

  const toggleRoom = async (hostelIndex: number, roomIndex: number) => {
    const newHostels = [...hostels];
    const room = newHostels[hostelIndex].rooms![roomIndex];
    
    if (room.isExpanded) {
      room.isExpanded = false;
      setHostels(newHostels);
      return;
    }

    room.isExpanded = true;
    if (!room.beds) {
      room.loadingBeds = true;
      setHostels([...newHostels]);
      try {
        const { data } = await api.get(`/beds/room/${room.id}`);
        room.beds = data;
        
        // Fetch student details for occupied beds
        for (const bed of data) {
          if (bed.status === 'OCCUPIED' && bed.studentId && !studentCache[bed.studentId]) {
             fetchStudentDetails(bed.studentId);
          }
        }
      } catch (e) {
        toast({ title: 'Error fetching beds', variant: 'destructive' });
      } finally {
        room.loadingBeds = false;
        setHostels([...newHostels]);
      }
    } else {
      setHostels(newHostels);
    }
  };
  
  const fetchStudentDetails = async (id: number) => {
    try {
      const { data } = await api.get(`/students/${id}`);
      setStudentCache(prev => ({ ...prev, [id]: data }));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Hostel Explorer</h1>
        <p className="text-muted-foreground">View hostels, rooms, beds and occupants</p>
      </div>

      <div className="space-y-4">
        {hostels.map((hostel, hIdx) => (
          <Card key={hostel.id} className="overflow-hidden">
            <div 
              className="p-4 bg-muted/30 hover:bg-muted/50 cursor-pointer flex items-center justify-between transition-colors"
              onClick={() => toggleHostel(hIdx)}
            >
              <div className="flex items-center gap-3">
                <Building2 className="text-primary w-6 h-6" />
                <h2 className="text-xl font-semibold">{hostel.name}</h2>
              </div>
              {hostel.isExpanded ? <ChevronDown /> : <ChevronRight />}
            </div>
            
            {hostel.isExpanded && (
              <div className="p-4 border-t border-border bg-card">
                {hostel.loadingRooms ? (
                  <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
                ) : hostel.rooms?.length === 0 ? (
                  <p className="text-muted-foreground p-4">No rooms found in this hostel.</p>
                ) : (
                  <div className="space-y-3">
                    {hostel.rooms?.map((room, rIdx) => (
                      <div key={room.id} className="border rounded-lg overflow-hidden">
                        <div 
                          className="p-3 bg-muted/20 hover:bg-muted/40 cursor-pointer flex items-center justify-between transition-colors"
                          onClick={() => toggleRoom(hIdx, rIdx)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-lg">Room {room.roomNumber}</span>
                            <Badge variant="outline">Capacity: {room.capacity}</Badge>
                          </div>
                          {room.isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>

                        {room.isExpanded && (
                          <div className="p-4 bg-background border-t">
                            {room.loadingBeds ? (
                              <div className="flex justify-center p-2"><Loader2 className="animate-spin h-5 w-5 text-primary" /></div>
                            ) : room.beds?.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No beds mapped to this room.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {room.beds?.map(bed => (
                                  <Card key={bed.id} className={`overflow-hidden border-l-4 ${bed.status === 'OCCUPIED' ? 'border-l-primary' : 'border-l-muted'}`}>
                                    <div className="p-3 bg-muted/10 border-b flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <BedDouble size={16} className="text-muted-foreground" />
                                        <span className="font-medium">{bed.bedNumber}</span>
                                      </div>
                                      <Badge variant={bed.status === 'OCCUPIED' ? 'default' : 'secondary'}>{bed.status}</Badge>
                                    </div>
                                    <div className="p-4">
                                      {bed.status === 'OCCUPIED' ? (
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-2">
                                            <User size={16} className="text-primary" />
                                            <span className="font-semibold">{bed.studentName || 'Loading...'}</span>
                                          </div>
                                          {bed.studentId && studentCache[bed.studentId] && (
                                            <div className="space-y-2 mt-2 pt-2 border-t text-sm text-muted-foreground">
                                              <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs font-mono">{studentCache[bed.studentId].studentId}</Badge>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Phone size={14} />
                                                <span>{studentCache[bed.studentId].phone || 'N/A'}</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Mail size={14} />
                                                <span className="truncate">{studentCache[bed.studentId].email || 'N/A'}</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-foreground text-xs">Parent:</span>
                                                <span>{studentCache[bed.studentId].fatherName || studentCache[bed.studentId].guardianName ? `${studentCache[bed.studentId].fatherName || studentCache[bed.studentId].guardianName} (${studentCache[bed.studentId].fatherPhone || studentCache[bed.studentId].guardianPhone || studentCache[bed.studentId].parentPhone || 'N/A'})` : (studentCache[bed.studentId].parentPhone || 'N/A')}</span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-muted-foreground text-sm flex items-center justify-center h-full min-h-[80px]">
                                          Available for assignment
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
