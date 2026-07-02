import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building, ChevronDown, Loader2 } from 'lucide-react';
import { useHostel } from '@/app/HostelContext';
import api from '@/services/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface Hostel {
  id: number;
  name: string;
}

export default function HostelFilter() {
  const { selectedHostelId, setSelectedHostelId } = useHostel();

  const { data: hostels, isLoading } = useQuery<Hostel[]>({
    queryKey: ['hostels', 'dropdown'],
    queryFn: async () => {
      const { data } = await api.get('/hostels');
      // Only show ACTIVE hostels in the global dropdown
      return data.filter((h: any) => h.status === 'ACTIVE');
    },
  });

  const selectedHostelName = React.useMemo(() => {
    if (!selectedHostelId) return 'ALL HOSTELS';
    const hostel = hostels?.find(h => h.id.toString() === selectedHostelId);
    return hostel ? hostel.name : 'ALL HOSTELS';
  }, [selectedHostelId, hostels]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 h-9 border-primary/20 bg-primary/5 hover:bg-primary/10">
          <Building className="h-4 w-4 text-primary" />
          <span className="font-semibold hidden sm:inline-block max-w-[150px] truncate">
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : selectedHostelName}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem 
          onClick={() => setSelectedHostelId('')}
          className={!selectedHostelId ? 'bg-primary/10 font-medium text-primary' : ''}
        >
          <Building className="h-4 w-4 mr-2 opacity-50" />
          ALL HOSTELS
        </DropdownMenuItem>
        
        {hostels?.map((hostel) => (
          <DropdownMenuItem 
            key={hostel.id} 
            onClick={() => setSelectedHostelId(hostel.id.toString())}
            className={selectedHostelId === hostel.id.toString() ? 'bg-primary/10 font-medium text-primary' : ''}
          >
            {hostel.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
