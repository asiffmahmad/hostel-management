import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import { BankTransactionGrid } from './BankTransactionGrid';
import { TransactionDetailsModal } from './TransactionDetailsModal';

const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

export function BankTransactionSection({ onMapPayment }: { onMapPayment: (txn: any) => void }) {
  const { toast } = useToast();
  
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  
  // Filters
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [transactionType, setTransactionType] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Grid State
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<any>([]);
  
  // Modal State
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      if (transactionType) params.append('transactionType', transactionType);
      if (globalFilter) params.append('globalSearch', globalFilter);
      
      params.append('page', pagination.pageIndex.toString());
      params.append('size', pagination.pageSize.toString());
      
      if (sorting.length > 0) {
        params.append('sortBy', sorting[0].id);
        params.append('sortDir', sorting[0].desc ? 'desc' : 'asc');
      }

      const { data: resData } = await api.get(`/bank-transactions?${params.toString()}`);
      setData(resData.content || []);
      setPageCount(resData.totalPages || 0);

      // Fetch summary if month and year are present
      if (month && year) {
        const { data: sumData } = await api.get(`/bank-transactions/month?month=${month}&year=${year}`);
        setSummary(sumData);
      }
    } catch (error) {
      toast({ title: 'Failed to fetch transactions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [pagination.pageIndex, pagination.pageSize, sorting, month, year, transactionType]);
  
  // Debounce global filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
      fetchTransactions();
    }, 500);
    return () => clearTimeout(timer);
  }, [globalFilter]);

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      if (transactionType) params.append('transactionType', transactionType);
      if (globalFilter) params.append('globalSearch', globalFilter);
      
      // In a real app we would download blob
      toast({ title: `Exporting to ${format.toUpperCase()}...` });
      const { data } = await api.get(`/bank-transactions/export?${params.toString()}`);
      
      // Very basic CSV export logic for frontend
      if (data && data.length > 0) {
         const headers = Object.keys(data[0]).join(',');
         const rows = data.map((row: any) => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
         const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
         const encodedUri = encodeURI(csvContent);
         const link = document.createElement("a");
         link.setAttribute("href", encodedUri);
         link.setAttribute("download", `transactions_${month}_${year}.${format}`);
         document.body.appendChild(link);
         link.click();
         link.remove();
      }
    } catch (e) {
      toast({ title: 'Failed to export', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) return;
    try {
      await api.delete(`/bank-transactions/${id}`);
      toast({ title: "Transaction deleted successfully" });
      fetchTransactions();
    } catch (e: any) {
      toast({ title: e.response?.data?.message || "Failed to delete transaction", variant: 'destructive' });
    }
  };

  const handleViewDetails = (txn: any) => {
    setSelectedTxn(txn);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
              <span className="text-sm font-medium text-muted-foreground">Total Transactions</span>
              <span className="text-2xl font-bold">{summary.totalTransactions}</span>
            </CardContent>
          </Card>
          <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
              <span className="text-sm font-medium text-muted-foreground">Total Credit</span>
              <span className="text-xl font-bold text-green-600">₹{summary.totalCreditAmount?.toLocaleString('en-IN') || 0}</span>
              <span className="text-xs text-muted-foreground">({summary.creditTransactions} txns)</span>
            </CardContent>
          </Card>
          <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
              <span className="text-sm font-medium text-muted-foreground">Total Debit</span>
              <span className="text-xl font-bold text-red-600">₹{summary.totalDebitAmount?.toLocaleString('en-IN') || 0}</span>
              <span className="text-xs text-muted-foreground">({summary.debitTransactions} txns)</span>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
              <span className="text-sm font-medium text-muted-foreground">Mapped</span>
              <span className="text-2xl font-bold text-emerald-600">{summary.mappedTransactions}</span>
            </CardContent>
          </Card>
          <Card className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
              <span className="text-sm font-medium text-muted-foreground">Unmapped</span>
              <span className="text-2xl font-bold text-orange-600">{summary.unmappedTransactions}</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end justify-between">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Month <span className="text-red-500">*</span></label>
                <select
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={month}
                  onChange={e => { setMonth(e.target.value); setPagination(p => ({...p, pageIndex: 0})); }}
                >
                  <option value="">-- Select Month --</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Year</label>
                <select
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={year}
                  onChange={e => { setYear(e.target.value); setPagination(p => ({...p, pageIndex: 0})); }}
                >
                  <option value="">-- Select Year --</option>
                  {[...Array(5)].map((_, i) => {
                    const y = String(new Date().getFullYear() - 2 + i);
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Type</label>
                <select
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={transactionType}
                  onChange={e => { setTransactionType(e.target.value); setPagination(p => ({...p, pageIndex: 0})); }}
                >
                  <option value="">All</option>
                  <option value="CREDIT">Credit</option>
                  <option value="DEBIT">Debit</option>
                </select>
              </div>
              <div className="space-y-1.5 min-w-[250px]">
                <label className="text-sm font-medium">Global Search</label>
                <Input 
                  placeholder="Search UTR, Ref, Description..." 
                  value={globalFilter}
                  onChange={e => setGlobalFilter(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchTransactions()} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="gap-2">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
          </div>
          
          {!month && (
             <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/30 border border-orange-200">
                <AlertCircle className="h-4 w-4" />
                <span>Please select a Month to view transactions.</span>
             </div>
          )}
        </CardContent>
      </Card>

      {/* Grid */}
      <BankTransactionGrid 
        data={data}
        loading={loading}
        onViewDetails={handleViewDetails}
        onMapPayment={onMapPayment}
        onDelete={handleDelete}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        sorting={sorting}
        setSorting={setSorting}
      />

      <TransactionDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTxn}
      />
    </div>
  );
}
