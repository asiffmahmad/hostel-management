import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useHostel } from '@/app/HostelContext';
import api from '@/services/api';
import {
  MessageSquareWarning,
  CheckCircle2,
  Trash2,
  Loader2
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

export default function ViewComplaints() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedHostelId: globalHostelId } = useHostel();

  const { data: complaints, isLoading } = useQuery<Complaint[]>({
    queryKey: ['complaints', globalHostelId],
    queryFn: async () => {
      const { data } = await api.get('/complaints', {
        params: { hostelId: globalHostelId || undefined }
      });
      return data;
    },
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-lg self-start sm:self-auto">
          <MessageSquareWarning className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">View Complaints</h1>
          <p className="text-muted-foreground text-sm">Track and manage maintenance complaints.</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm flex flex-col h-[calc(100vh-12rem)] glass-panel overflow-hidden">
        <div className="flex-1 overflow-auto bg-background/50">
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden lg:table-cell">Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading complaints...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !complaints || complaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No complaints found.
                    </TableCell>
                  </TableRow>
                ) : (
                  complaints.map(c => (
                    <TableRow key={c.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-primary">#{c.id}</TableCell>
                      <TableCell>
                        <div className="font-semibold">{c.hostelName}</div>
                        <div className="text-xs text-muted-foreground">Room: {c.roomNumber}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
                        {c.description || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            c.status === 'RESOLVED' 
                              ? 'bg-green-500/15 text-green-600 hover:bg-green-500/25 border-none'
                              : 'bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 border-none'
                          }
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          {c.status === 'PENDING' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50 h-8"
                              onClick={() => resolveMutation.mutate(c.id)}
                              disabled={resolveMutation.isPending}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Resolve
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                            onClick={() => {
                              if (window.confirm('Delete this complaint?')) {
                                deleteMutation.mutate(c.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden flex flex-col gap-4 p-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground p-8 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading complaints...
              </div>
            ) : !complaints || complaints.length === 0 ? (
              <div className="text-center text-muted-foreground p-8 border rounded-lg bg-muted/20">
                No complaints found.
              </div>
            ) : (
              complaints.map(c => (
                <div key={c.id} className="bg-card border rounded-xl p-4 shadow-sm flex flex-col gap-3 relative">
                  <div className="flex items-start justify-between border-b pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">#{c.id}</Badge>
                        <Badge variant="secondary">{c.type}</Badge>
                      </div>
                      <h3 className="font-semibold mt-2">{c.hostelName}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Room {c.roomNumber}</p>
                    </div>
                    <Badge 
                      className={
                        c.status === 'RESOLVED' 
                          ? 'bg-green-500/15 text-green-600 hover:bg-green-500/25 border-none'
                          : 'bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 border-none'
                      }
                    >
                      {c.status}
                    </Badge>
                  </div>
                  
                  {c.description && (
                    <div className="text-sm bg-muted/30 p-2.5 rounded-md border border-muted/50">
                      {c.description}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span>Submitted on {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t mt-1">
                    {c.status === 'PENDING' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-8 text-xs text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => resolveMutation.mutate(c.id)}
                        disabled={resolveMutation.isPending}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Resolved
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-[0.3] h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (window.confirm('Delete this complaint?')) {
                          deleteMutation.mutate(c.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
