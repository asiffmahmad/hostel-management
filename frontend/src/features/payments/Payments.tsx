import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Filter, Search, Receipt, Plus, FileText, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/services/api';
import type { Payment } from '@/types';
import { PaymentFormModal } from './components/PaymentFormModal';
import { useToast } from '@/hooks/use-toast';

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>(undefined);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await api.get('/payments');
      return res.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      let queryParams = '';
      if (selectedMonth) {
        const [yearStr, monthStr] = selectedMonth.split('-');
        const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
        const monthName = monthNames[parseInt(monthStr) - 1];
        queryParams = `?month=${monthName}&year=${yearStr}`;
      }
      return await api.post(`/payments/generate-monthly${queryParams}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({ title: 'Monthly invoices generated successfully' });
    },
  });

  const filteredPayments = payments?.filter((p: any) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (p.studentId?.toString() || '').includes(term) ||
      (p.id?.toString() || '').includes(term) ||
      (p.studentName || '').toLowerCase().includes(term) ||
      (p.utrNumber || '').toLowerCase().includes(term);
    
    let matchesMonth = true;
    if (selectedMonth) {
      const [yearStr, monthStr] = selectedMonth.split('-');
      const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
      const monthName = monthNames[parseInt(monthStr) - 1];
      matchesMonth = p.month.toUpperCase() === monthName && p.year === yearStr;
    }
    
    return matchesSearch && matchesMonth;
  });

  return (
    <div className="space-y-6 bg-card rounded-2xl p-6 glass-panel border shadow-sm flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Receipts</h1>
          <p className="text-sm text-muted-foreground mt-1">Track fee collections and financial history.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export CSV
          </Button>
          <Button variant="outline" className="gap-2 text-primary border-primary/20 hover:bg-primary/10" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
            <FileText size={16} />
            {generateMutation.isPending ? 'Generating...' : 'Generate Invoices'}
          </Button>
          <Button className="gap-2" onClick={() => { setSelectedPayment(undefined); setIsModalOpen(true); }}>
            <Plus size={16} />
            Record Payment
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0 w-full">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Student Name, UTR Number, ID..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Input 
          type="month"
          className="max-w-[200px] w-full sm:w-auto"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <Button variant="secondary" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border flex-1 overflow-auto bg-background/50">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>UTR Number</TableHead>
              <TableHead className="hidden md:table-cell">Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden lg:table-cell">Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : filteredPayments?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments?.map((payment: any) => (
                <TableRow key={payment.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-primary">PAY-{payment.id}</TableCell>
                  <TableCell>{(payment as any).studentName || `STD-${payment.studentId}`}</TableCell>
                  <TableCell>
                    {(payment as any).utrNumber
                      ? <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{(payment as any).utrNumber}</span>
                      : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {payment.month} {payment.year}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">₹{payment.amount.toFixed(2)}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline" className="text-xs capitalize">
                      {(payment as any).paymentSource === 'BANK_IMPORT' ? '🏦 Bank' : '✍️ Manual'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={payment.status === 'PAID' ? 'default' : payment.status === 'PENDING' ? 'secondary' : 'destructive'}
                      className={
                        payment.status === 'PAID' 
                          ? 'bg-green-500/15 text-green-600 hover:bg-green-500/25 border-none' 
                          : payment.status === 'PENDING'
                            ? 'bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 border-none'
                            : 'bg-red-500/15 text-red-600 hover:bg-red-500/25 border-none'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="gap-1 h-8 text-muted-foreground hover:text-primary" onClick={() => { setSelectedPayment(payment); setIsModalOpen(true); }}>
                        <Edit size={14} /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 h-8 text-destructive hover:text-destructive" onClick={async () => {
                        if (window.confirm('Delete payment?')) {
                          await api.delete(`/payments/${payment.id}`);
                          window.location.reload();
                        }
                      }}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaymentFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={selectedPayment} 
      />
    </div>
  );
};

export default Payments;
