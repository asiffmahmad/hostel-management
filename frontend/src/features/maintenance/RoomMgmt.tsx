import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Loader2, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface Room {
  id: number;
  hostelId: number;
  roomNumber: string;
  roomName: string;
  floor: string;
  capacity: number;
  status: string;
}

interface Bed {
  id: number;
  bedNumber: string;
  status: string;
  studentName?: string;
}

export default function RoomMgmt() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomBeds, setRoomBeds] = useState<Bed[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bedsLoading, setBedsLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data: hostels } = await api.get('/hostels');
      let allRooms: Room[] = [];
      for (const h of hostels) {
        const { data } = await api.get(`/rooms/hostel/${h.id}`);
        allRooms = [...allRooms, ...data];
      }
      setRooms(allRooms);
    } catch (error) {
      toast({ title: 'Error fetching rooms', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOccupants = async (room: Room) => {
    setSelectedRoom(room);
    setIsDialogOpen(true);
    setBedsLoading(true);
    try {
      const { data } = await api.get(`/beds/room/${room.id}`);
      setRoomBeds(data);
    } catch (error) {
      toast({ title: 'Error fetching room details', variant: 'destructive' });
      setRoomBeds([]);
    } finally {
      setBedsLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
        <Button>Add New Room</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No rooms found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hostel ID</TableHead>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.hostelId}</TableCell>
                    <TableCell className="font-medium">{r.roomNumber}</TableCell>
                    <TableCell>{r.roomName}</TableCell>
                    <TableCell>{r.floor}</TableCell>
                    <TableCell>{r.capacity}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'ACTIVE' ? 'default' : 'secondary'}>{r.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewOccupants(r)}>
                          <Users className="w-4 h-4 mr-2" /> View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/hostels/${r.hostelId}/rooms`)}>Manage</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Occupants in {selectedRoom?.roomName || 'Room'}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {bedsLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
            ) : roomBeds.length === 0 ? (
              <p className="text-muted-foreground text-center">No beds found in this room.</p>
            ) : (
              <div className="space-y-4">
                {roomBeds.map(bed => (
                  <div key={bed.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border">
                    <div>
                      <p className="font-semibold text-sm">Bed: {bed.bedNumber}</p>
                      {bed.status === 'OCCUPIED' ? (
                        <p className="text-sm text-primary">{bed.studentName || 'Unknown Student'}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Vacant</p>
                      )}
                    </div>
                    <Badge variant={bed.status === 'OCCUPIED' ? 'default' : 'secondary'}>
                      {bed.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
