import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createExpense, updateExpense } from '@/services/expenses';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Expense, Hostel } from '@/types';
import { useHostel } from '@/app/HostelContext';
import api from '@/services/api';

const expenseCategories = [
  'Vegetables',
  'Plumbing & Electrical Works',
  'Grocery Items',
  'Dairy Products',
  'Miscellaneous Bills'
] as const;

const expenseSchema = z.object({
  hostelId: z.coerce.number().optional(),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().min(1, 'Amount must be > 0'),
  expenseDate: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  receiptUrl: z.string().url().optional().or(z.literal('')),
}).refine(data => {
  return true; // We'll handle validation manually in onSubmit for simplicity
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Expense;
}

export const ExpenseFormModal = ({ isOpen, onClose, initialData }: ExpenseFormModalProps) => {
  const queryClient = useQueryClient();
  const { selectedHostelId } = useHostel();

  const { data: hostels } = useQuery<Hostel[]>({
    queryKey: ['hostels'],
    queryFn: async () => {
      const res = await api.get('/hostels');
      return res.data;
    },
  });

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      hostelId: initialData?.hostelId || (selectedHostelId ? Number(selectedHostelId) : undefined),
      category: initialData?.category || 'Miscellaneous Bills',
      amount: initialData?.amount || 0,
      expenseDate: initialData?.expenseDate || new Date().toISOString().split('T')[0],
      description: initialData?.description || '',
      receiptUrl: initialData?.receiptUrl || '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        hostelId: initialData?.hostelId || (selectedHostelId ? Number(selectedHostelId) : undefined),
        category: initialData?.category || 'Miscellaneous Bills',
        amount: initialData?.amount || 0,
        expenseDate: initialData?.expenseDate || new Date().toISOString().split('T')[0],
        description: initialData?.description || '',
        receiptUrl: initialData?.receiptUrl || '',
      });
    }
  }, [initialData, isOpen, form]);

  const mutation = useMutation({
    mutationFn: async (data: ExpenseFormValues) => {
      const finalHostelId = data.hostelId || Number(selectedHostelId);
      if (!finalHostelId) throw new Error("Please select a hostel");

      const payload: Expense = {
        ...data,
        hostelId: finalHostelId,
        recordedBy: 1, // Hardcoded admin user for now as per constraints
      };
      
      if (initialData?.id) {
        return await updateExpense(initialData.id, payload);
      } else {
        return await createExpense(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      onClose();
      form.reset();
    },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    const finalHostelId = data.hostelId || Number(selectedHostelId);
    if (!finalHostelId) {
      form.setError('hostelId', { type: 'manual', message: 'Hostel selection is required' });
      return;
    }
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Expense' : 'Record New Expense'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="hostelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hostel</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                      value={field.value || ''}
                      disabled={!!initialData} // Usually can't change hostel after creation, but disable just in case
                    >
                      <option value="" disabled>Select a hostel...</option>
                      {hostels?.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...field}
                    >
                      {expenseCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expenseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Brief description of the expense..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receiptUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receipt URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
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
