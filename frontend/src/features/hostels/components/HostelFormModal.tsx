import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Hostel } from '@/types';

const hostelSchema = z.object({
  name: z.string().min(1, 'Hostel name is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']),
  baseRent: z.coerce.number().optional().or(z.literal(0)),
});

type HostelFormValues = z.infer<typeof hostelSchema>;

interface HostelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Hostel;
}

export const HostelFormModal = ({ isOpen, onClose, initialData }: HostelFormModalProps) => {
  const queryClient = useQueryClient();

  const form = useForm<HostelFormValues>({
    // @ts-ignore
    resolver: zodResolver(hostelSchema),
    defaultValues: {
      name: initialData?.name || '',
      status: initialData?.status || 'ACTIVE',
      baseRent: (initialData as any)?.baseRent || 0,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        name: initialData?.name || '',
        status: initialData?.status || 'ACTIVE',
        baseRent: (initialData as any)?.baseRent || 0,
      });
    }
  }, [initialData, isOpen, form]);

  const mutation = useMutation({
    mutationFn: async (data: HostelFormValues) => {
      const payload = { ...initialData, ...data };
      if (initialData) {
        return await api.put(`/hostels/${initialData.id}`, payload);
      } else {
        return await api.post('/hostels', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
      onClose();
      form.reset();
    },
  });

  const onSubmit = (data: HostelFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Hostel' : 'Add New Hostel'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hostel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Boys Hostel A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="baseRent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Rent Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5600" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
