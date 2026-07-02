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
import type { Room } from '@/types';

const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  type: z.string().min(1, 'Room type is required'),
  baseRent: z.coerce.number().optional().or(z.literal(0)),
});

type RoomFormValues = z.infer<typeof roomSchema>;

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Room;
  hostelId: number;
}

export const RoomFormModal = ({ isOpen, onClose, initialData, hostelId }: RoomFormModalProps) => {
  const queryClient = useQueryClient();

  const form = useForm<RoomFormValues>({
    // @ts-ignore
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: initialData?.roomNumber || '',
      capacity: initialData?.capacity || 2,
      type: initialData?.type || 'Non-AC',
      baseRent: (initialData as any)?.baseRent || 0,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        roomNumber: initialData?.roomNumber || '',
        capacity: initialData?.capacity || 2,
        type: initialData?.type || 'Non-AC',
        baseRent: (initialData as any)?.baseRent || 0,
      });
    }
  }, [initialData, isOpen, form]);

  const mutation = useMutation({
    mutationFn: async (data: RoomFormValues) => {
      const payload = { ...initialData, ...data, hostelId };
      if (initialData) {
        return await api.put(`/rooms/${initialData.id}`, payload);
      } else {
        return await api.post('/rooms', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', String(hostelId)] });
      onClose();
      form.reset();
    },
  });

  const onSubmit = (data: RoomFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            <FormField
              control={form.control as any}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="AC">AC</option>
                      <option value="Non-AC">Non-AC</option>
                    </select>
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
