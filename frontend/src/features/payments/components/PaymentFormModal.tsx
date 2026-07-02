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
import type { Payment } from '@/types';

const paymentSchema = z.object({
  studentId: z.coerce.number().min(1, 'Student ID is required'),
  amount: z.coerce.number().min(1, 'Amount must be > 0'),
  month: z.string().min(1, 'Month is required'),
  year: z.string().min(4, 'Year is required'),
  status: z.enum(['PAID', 'PENDING', 'OVERDUE']),
  dueDate: z.string().min(1, 'Due date is required'),
  utrNumber: z.string().optional().or(z.literal('')),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Payment;
}

export const PaymentFormModal = ({ isOpen, onClose, initialData }: PaymentFormModalProps) => {
  const queryClient = useQueryClient();

  const form = useForm<PaymentFormValues>({
    // @ts-ignore
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      studentId: initialData?.studentId || 0,
      amount: initialData?.amount || 0,
      month: initialData?.month || new Date().toLocaleString('default', { month: 'long' }),
      year: initialData?.year || new Date().getFullYear().toString(),
      status: initialData?.status || 'PENDING',
      dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
      utrNumber: initialData?.utrNumber || '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        studentId: initialData?.studentId || 0,
        amount: initialData?.amount || 0,
        month: initialData?.month || new Date().toLocaleString('default', { month: 'long' }),
        year: initialData?.year || new Date().getFullYear().toString(),
        status: initialData?.status || 'PENDING',
        dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
        utrNumber: initialData?.utrNumber || '',
      });
    }
  }, [initialData, isOpen, form]);

  const mutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      if (initialData) {
        return await api.put(`/payments/${initialData.id}`, data);
      } else {
        return await api.post('/payments', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      onClose();
      form.reset();
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Payment' : 'Record New Payment'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            
            <FormField
              control={form.control as any}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student System ID (Numeric)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <FormControl>
                      <Input placeholder="January" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input placeholder="2026" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control as any}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...field}
                    >
                      <option value="PAID">PAID</option>
                      <option value="PENDING">PENDING</option>
                      <option value="OVERDUE">OVERDUE</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="utrNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UTR Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Leave blank if N/A" {...field} />
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
