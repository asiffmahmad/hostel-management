import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Filter, Search, Plus, Edit, Trash2, PieChart, TrendingUp, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getExpenses, deleteExpense } from '@/services/expenses';
import type { Expense } from '@/types';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { useToast } from '@/hooks/use-toast';
import { useHostel } from '@/app/HostelContext';

const expenseCategories = [
  'Vegetables',
  'Plumbing & Electrical Works',
  'Grocery Items',
  'Dairy Products',
  'Miscellaneous Bills'
] as const;

const ExpensesDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { selectedHostelId } = useHostel();

  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ['expenses', selectedHostelId],
    queryFn: async () => {
      const res = await getExpenses(selectedHostelId ? Number(selectedHostelId) : undefined);
      return res.data;
    },
  });

  const filteredExpenses = expenses?.filter((e: Expense) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (e.id?.toString() || '').includes(term) ||
      (e.category || '').toLowerCase().includes(term) ||
      (e.description || '').toLowerCase().includes(term);
    
    let matchesMonth = true;
    if (selectedMonth) {
      const [yearStr, monthStr] = selectedMonth.split('-');
      const expenseDate = new Date(e.expenseDate);
      matchesMonth = expenseDate.getFullYear().toString() === yearStr && 
                     (expenseDate.getMonth() + 1).toString().padStart(2, '0') === monthStr;
    }
    
    return matchesSearch && matchesMonth;
  });

  // Calculate totals per category dynamically from filtered expenses
  const categoryTotals = expenseCategories.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {} as Record<string, number>);

  let totalExpensesAmount = 0;

  filteredExpenses?.forEach(e => {
    // If the category is one of the predefined ones, add to it. Otherwise add to Miscellaneous.
    const mappedCategory = expenseCategories.includes(e.category as any) ? e.category : 'Miscellaneous Bills';
    categoryTotals[mappedCategory] += e.amount;
    totalExpensesAmount += e.amount;
  });

  const handleExport = () => {
    if (!filteredExpenses || filteredExpenses.length === 0) {
      toast({ title: 'No data to export', variant: 'destructive' });
      return;
    }
    
    const keys = ['id', 'category', 'amount', 'expenseDate', 'description', 'receiptUrl'];
    const csvContent = [
      keys.join(','),
      ...filteredExpenses.map((row: any) => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Export completed successfully' });
  };

  return (
    <div className="space-y-6 bg-card rounded-2xl p-6 glass-panel border shadow-sm flex flex-col h-[calc(100vh-8rem)] overflow-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and categorize hostel operational costs.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download size={16} />
            Export CSV
          </Button>
          <Button className="gap-2" onClick={() => { setSelectedExpense(undefined); setIsModalOpen(true); }}>
            <Plus size={16} />
            Record Expense
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 shrink-0">
        <Card className="glass-panel lg:col-span-1 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex justify-between">
              Total Expenses <IndianRupee className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpensesAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        {expenseCategories.map(cat => (
          <Card key={cat} className="glass-panel lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex justify-between truncate" title={cat}>
                {cat} <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">₹{categoryTotals[cat].toFixed(2)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0 w-full mt-4">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, Category, Description..."
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
      </div>

      <div className="flex-1 overflow-auto bg-background/50 rounded-md border mt-2">
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Loading expenses...
                  </TableCell>
                </TableRow>
              ) : filteredExpenses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No expenses found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses?.map((expense: Expense) => (
                  <TableRow key={expense.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-primary">EXP-{expense.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {expenseCategories.includes(expense.category as any) ? expense.category : 'Miscellaneous Bills'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={expense.description}>
                      {expense.description || <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold text-red-500">-₹{expense.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {expense.receiptUrl ? (
                        <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">View Receipt</a>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="gap-1 h-8 text-muted-foreground hover:text-primary" onClick={() => { setSelectedExpense(expense); setIsModalOpen(true); }}>
                          <Edit size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this expense?')) {
                            if(expense.id) {
                              await deleteExpense(expense.id);
                              queryClient.invalidateQueries({ queryKey: ['expenses'] });
                              toast({ title: 'Expense deleted successfully' });
                            }
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

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4 p-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground p-8">Loading expenses...</div>
          ) : filteredExpenses?.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">No expenses found.</div>
          ) : (
            filteredExpenses?.map((expense: Expense) => (
              <div key={expense.id} className="bg-card border rounded-xl p-4 shadow-sm flex flex-col gap-3 relative">
                <div className="flex items-start justify-between border-b pb-3">
                  <div>
                    <h3 className="font-semibold">{expense.category}</h3>
                    <p className="text-xs font-mono text-primary mt-1">EXP-{expense.id}</p>
                  </div>
                  <div className="font-semibold text-red-500">
                    -₹{expense.amount.toFixed(2)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Date</span>
                    <span>{new Date(expense.expenseDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Receipt</span>
                    {expense.receiptUrl ? <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a> : '—'}
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-xs text-muted-foreground">Description</span>
                    <span className="text-xs">{expense.description || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t mt-1">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1" onClick={() => { setSelectedExpense(expense); setIsModalOpen(true); }}>
                    <Edit size={12} /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-[0.5] h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this expense?')) {
                      if(expense.id) {
                        await deleteExpense(expense.id);
                        queryClient.invalidateQueries({ queryKey: ['expenses'] });
                        toast({ title: 'Expense deleted successfully' });
                      }
                    }
                  }}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ExpenseFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={selectedExpense} 
      />
    </div>
  );
};

export default ExpensesDashboard;
