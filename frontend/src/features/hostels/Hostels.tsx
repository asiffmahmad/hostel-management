import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Building, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import api from '@/services/api';
import type { Hostel } from '@/types';
import { useHostel } from '@/app/HostelContext';
import { HostelFormModal } from './components/HostelFormModal';

const Hostels = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | undefined>(undefined);
  const navigate = useNavigate();

  const { data: hostels, isLoading } = useQuery<Hostel[]>({
    queryKey: ['hostels'],
    queryFn: async () => {
      const res = await api.get('/hostels');
      return res.data;
    },
  });

  const { selectedHostelId } = useHostel();

  const filteredHostels = hostels?.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHostel = selectedHostelId ? h.id.toString() === selectedHostelId : true;
    return matchesSearch && matchesHostel;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hostels</h1>
          <p className="text-muted-foreground mt-1">Manage all your hostel properties and configurations.</p>
        </div>
        <Button className="shrink-0 gap-2" onClick={() => { setSelectedHostel(undefined); setIsModalOpen(true); }}>
          <Plus size={16} />
          Add New Hostel
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search hostels..."
            className="pl-9 bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse glass-panel">
              <CardHeader className="h-24 bg-muted/50" />
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredHostels?.map((hostel, index) => (
            <motion.div
              key={hostel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-panel hover:shadow-lg transition-all duration-300 h-full flex flex-col group">
                <CardHeader className="pb-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => { setSelectedHostel(hostel); setIsModalOpen(true); }}>
                      <Edit size={14} />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this hostel?')) {
                        await api.delete(`/hostels/${hostel.id}`);
                        window.location.reload();
                      }
                    }}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                      <Building size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{hostel.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                        <span className={`inline-block w-2 h-2 rounded-full ${hostel.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {hostel.status}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Total Beds</div>
                      <div className="text-2xl font-bold">{hostel.totalBeds || 0}</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Occupied</div>
                      <div className="text-2xl font-bold">{hostel.occupiedBeds || 0}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex items-center justify-between border-t border-border/50 pt-4 mt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Vacant: </span>
                    <span className="font-medium text-green-600">{hostel.vacantBeds || 0}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary" onClick={() => navigate(`/hostels/${hostel.id}/rooms`)}>
                    View Rooms
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <HostelFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={selectedHostel} 
      />
    </div>
  );
};

export default Hostels;
