import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Student, Hostel, Room, Bed } from '@/types';

const studentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  parentPhone: z.string().optional().or(z.literal('')),
  fatherName: z.string().optional().or(z.literal('')),
  fatherPhone: z.string().optional().or(z.literal('')),
  motherName: z.string().optional().or(z.literal('')),
  motherPhone: z.string().optional().or(z.literal('')),
  guardianRelation: z.string().optional().or(z.literal('')),
  guardianName: z.string().optional().or(z.literal('')),
  guardianPhone: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  monthlyRent: z.coerce.number().min(0, 'Monthly rent must be >= 0'),
  advanceDeposit: z.coerce.number().min(0, 'Advance deposit must be >= 0'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'GRADUATED']),
  bedId: z.coerce.number().optional().or(z.literal(0)),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Student;
}

export const StudentFormModal = ({ isOpen, onClose, initialData }: StudentFormModalProps) => {
  const queryClient = useQueryClient();

  // State for cascading dropdowns
  const [selectedHostelId, setSelectedHostelId] = useState<number | ''>('');
  const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');

  // Fetch Hostels
  const { data: hostels } = useQuery<Hostel[]>({
    queryKey: ['hostels'],
    queryFn: async () => {
      const res = await api.get('/hostels');
      return res.data;
    },
    enabled: isOpen,
  });

  // Fetch Rooms when Hostel is selected
  const { data: rooms } = useQuery<Room[]>({
    queryKey: ['rooms', selectedHostelId],
    queryFn: async () => {
      const res = await api.get(`/rooms/hostel/${selectedHostelId}`);
      return res.data;
    },
    enabled: !!selectedHostelId && isOpen,
  });

  // Fetch Beds when Room is selected
  const { data: beds } = useQuery<Bed[]>({
    queryKey: ['beds', selectedRoomId],
    queryFn: async () => {
      const res = await api.get(`/beds/room/${selectedRoomId}`);
      return res.data;
    },
    enabled: !!selectedRoomId && isOpen,
  });

  const form = useForm<StudentFormValues>({
    // @ts-ignore
    resolver: zodResolver(studentSchema),
    defaultValues: {
      studentId: initialData?.studentId || '',
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      parentPhone: initialData?.parentPhone || '',
      fatherName: initialData?.fatherName || '',
      fatherPhone: initialData?.fatherPhone || '',
      motherName: initialData?.motherName || '',
      motherPhone: initialData?.motherPhone || '',
      guardianRelation: initialData?.guardianRelation || '',
      guardianName: initialData?.guardianName || '',
      guardianPhone: initialData?.guardianPhone || '',
      notes: initialData?.notes || '',
      email: initialData?.email || '',
      monthlyRent: initialData?.monthlyRent || 0,
      advanceDeposit: initialData?.advanceDeposit || 0,
      status: initialData?.status || 'ACTIVE',
      bedId: initialData?.bedId || 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        studentId: initialData?.studentId || '',
        name: initialData?.name || '',
        phone: initialData?.phone || '',
        parentPhone: initialData?.parentPhone || '',
        email: initialData?.email || '',
        monthlyRent: initialData?.monthlyRent || 0,
        advanceDeposit: initialData?.advanceDeposit || 0,
        status: initialData?.status || 'ACTIVE',
        bedId: initialData?.bedId || 0,
      });
      // Reset dropdowns if it's a new student. If editing, we populate them from the student data.
      setSelectedHostelId(initialData?.hostelId || '');
      setSelectedRoomId(initialData?.roomId || '');
    }
  }, [initialData, isOpen, form]);

  const mutation = useMutation({
    mutationFn: async (data: StudentFormValues) => {
      const payload = { 
        ...initialData, 
        ...data, 
        bedId: data.bedId ? data.bedId : null 
      };
      if (initialData?.id) {
        return await api.put(`/students/${initialData.id}`, payload);
      } else {
        return await api.post('/students', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      onClose();
      form.reset();
    },
  });

  const onSubmit = (data: StudentFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="STU-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control as any}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+91..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="parentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+91..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="monthlyRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rent</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="advanceDeposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        {...field}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="PENDING">PENDING</option>
                        <option value="GRADUATED">GRADUATED</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-3">Assign Accommodation (Optional)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Hostel</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedHostelId}
                    onChange={(e) => {
                      setSelectedHostelId(e.target.value ? Number(e.target.value) : '');
                      setSelectedRoomId('');
                      form.setValue('bedId', 0);
                    }}
                  >
                    <option value="">Select Hostel...</option>
                    {hostels?.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Room</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                    value={selectedRoomId}
                    onChange={(e) => {
                      setSelectedRoomId(e.target.value ? Number(e.target.value) : '');
                      form.setValue('bedId', 0);
                    }}
                    disabled={!selectedHostelId}
                  >
                    <option value="">Select Room...</option>
                    {rooms?.map((r) => (
                      <option key={r.id} value={r.id}>{r.roomNumber}</option>
                    ))}
                  </select>
                </div>

                <FormField
                  control={form.control as any}
                  name="bedId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bed</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                          {...field}
                          disabled={!selectedRoomId}
                        >
                          <option value={0}>Select Bed...</option>
                          {initialData?.bedId && (
                            <option value={initialData.bedId}>Current Assigned Bed</option>
                          )}
                          {beds?.filter((b) => b.status === 'VACANT' || b.id === initialData?.bedId).map((b) => (
                            <option key={b.id} value={b.id}>{b.bedNumber} ({b.status})</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
