import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, DoorOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/services/api';
import type { Room } from '@/types';
import { RoomFormModal } from './components/RoomFormModal';
import { Edit, Trash2, Plus } from 'lucide-react';

const Rooms = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState<Room | undefined>(undefined);

  const { data: rooms, isLoading } = useQuery<Room[]>({
    queryKey: ['rooms', id],
    queryFn: async () => {
      const res = await api.get(`/rooms/hostel/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/hostels')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground mt-1">Manage rooms and bed availability for this hostel.</p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button className="shrink-0 gap-2" onClick={() => { setSelectedRoom(undefined); setIsModalOpen(true); }}>
          <Plus size={16} />
          Add New Room
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse glass-panel">
              <CardHeader className="h-20 bg-muted/50" />
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {rooms?.map((room, index) => {
            const vacant = room.capacity - (room.occupiedBeds || 0);
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-panel hover:shadow-lg transition-all h-full">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <DoorOpen className="text-primary" size={20} />
                        <CardTitle className="text-xl">Room {room.roomNumber}</CardTitle>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full">
                          {room.type}
                        </span>
                        <div className="flex gap-1">
                           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setSelectedRoom(room); setIsModalOpen(true); }}>
                             <Edit size={12} />
                           </Button>
                           <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={async () => {
                             if (window.confirm('Delete this room?')) {
                               await api.delete(`/rooms/${room.id}`);
                               window.location.reload();
                             }
                           }}>
                             <Trash2 size={12} />
                           </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center gap-1"><Users size={14} /> Capacity</span>
                      <span className="font-medium">{room.capacity}</span>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex">
                       {/* Occupied bar */}
                       <div 
                         className="bg-primary h-full" 
                         style={{ width: `${((room.occupiedBeds || 0) / room.capacity) * 100}%` }}
                       />
                    </div>
                    
                    <div className="flex justify-between text-sm mt-2">
                      <div>
                        <span className="text-muted-foreground">Occupied: </span>
                        <span className="font-medium">{room.occupiedBeds || 0}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vacant: </span>
                        <span className="font-medium text-green-600">{vacant}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          
          {rooms?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
              No rooms found for this hostel.
            </div>
          )}
        </div>
      )}

      {id && (
        <RoomFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          initialData={selectedRoom} 
          hostelId={parseInt(id, 10)} 
        />
      )}
    </div>
  );
};

export default Rooms;
