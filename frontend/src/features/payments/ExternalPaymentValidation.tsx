import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Search, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ExternalPayment {
  id: number;
  studentId: number;
  studentName: string;
  phone: string;
  hostelName: string;
  month: string;
  year: string;
  utrNumber: string;
  amount: number;
  transactionDate: string;
  validationStatus: string;
  failureReason: string | null;
  totalMonthDue: number;
  totalMonthPaid: number;
  paymentStatus: string;
}

const ExternalPaymentValidation = () => {
  const [payments, setPayments] = useState<ExternalPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [validatingAll, setValidatingAll] = useState(false);
  const [validatingId, setValidatingId] = useState<number | null>(null);

  // Filters
  const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState(MONTHS[new Date().getMonth()]);
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (monthFilter && monthFilter !== 'ALL') params.append('month', monthFilter);
      if (yearFilter && yearFilter !== 'ALL') params.append('year', yearFilter);
      const response = await api.get(`/external-payments?${params.toString()}`);
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch external payments:', error);
      toast.error('Failed to load external payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [monthFilter, yearFilter]);

  const handleValidateAll = async () => {
    setValidatingAll(true);
    try {
      const response = await api.post('/external-payments/validate-all');
      toast.success(response.data.message);
      fetchPayments();
    } catch (error: any) {
      console.error('Bulk validation failed:', error);
      toast.error(error.response?.data?.message || 'Bulk validation failed');
    } finally {
      setValidatingAll(false);
    }
  };

  const handleValidateSingle = async (id: number) => {
    setValidatingId(id);
    try {
      const response = await api.post(`/external-payments/${id}/validate`);
      toast.success(response.data.message);
      fetchPayments();
    } catch (error: any) {
      console.error('Validation failed:', error);
      toast.error(error.response?.data?.message || 'Validation failed');
      fetchPayments(); // Refresh to show FAILED status and reason
    } finally {
      setValidatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALIDATED':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Validated</Badge>;
      case 'FAILED':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="w-3 h-3 mr-1"/> Failed</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-500">Fully Paid</Badge>;
      case 'PARTIALLY_PAID':
        return <Badge variant="secondary" className="bg-blue-500 text-white">Partially Paid</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.utrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.hostelName && p.hostelName.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesStatus = statusFilter === 'ALL' || p.validationStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = payments.filter(p => p.validationStatus === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">External Payment Validation</h1>
          <p className="text-muted-foreground mt-1">Review and validate student UTR submissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPayments} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleValidateAll} 
            disabled={validatingAll || pendingCount === 0}
            className="shadow-md"
          >
            {validatingAll ? 'Validating...' : `Validate All Pending (${pendingCount})`}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>Transactions</CardTitle>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student, UTR..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="w-full sm:w-36 flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <option value="ALL">All Months</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select 
                className="w-full sm:w-32 flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="ALL">All Years</option>
                {[...Array(5)].map((_, i) => {
                  const y = String(new Date().getFullYear() - 2 + i);
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
              <select 
                className="w-full sm:w-36 flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="VALIDATED">Validated</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Hostel / Term</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>UTR Number</TableHead>
                  <TableHead>Submitted Amt</TableHead>
                  <TableHead>Due Amt</TableHead>
                  <TableHead>Validation</TableHead>
                  <TableHead>Month Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      No external payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="font-medium">{payment.studentName}</div>
                        <div className="text-xs text-muted-foreground">{payment.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{payment.hostelName || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{payment.month} {payment.year}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {payment.transactionDate ? new Date(payment.transactionDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{payment.utrNumber}</span>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">₹{payment.amount}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-destructive">
                          ₹{Math.max(0, payment.totalMonthDue - payment.totalMonthPaid)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {getStatusBadge(payment.validationStatus)}
                          {payment.failureReason && (
                            <span className="text-[10px] text-destructive max-w-[150px] truncate" title={payment.failureReason}>
                              {payment.failureReason}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {getPaymentStatusBadge(payment.paymentStatus)}
                          <div className="text-xs text-muted-foreground">
                            Paid: ₹{payment.totalMonthPaid} / ₹{payment.totalMonthDue}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.validationStatus === 'PENDING' && (
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleValidateSingle(payment.id)}
                            disabled={validatingId === payment.id || validatingAll}
                          >
                            {validatingId === payment.id ? '...' : 'Validate'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 md:hidden p-4 bg-muted/20">
            {filteredPayments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No external payments found.
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <Card key={payment.id} className="p-4 flex flex-col gap-3 shadow-sm border-muted">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-lg text-foreground">{payment.studentName}</div>
                      <div className="text-xs text-muted-foreground">{payment.phone} • {payment.hostelName || 'N/A'}</div>
                    </div>
                    <div className="font-bold text-lg text-primary">₹{payment.amount}</div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{payment.utrNumber}</span>
                    <span className="text-muted-foreground text-xs">{payment.month} {payment.year}</span>
                  </div>
                  
                  {payment.failureReason && (
                    <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-md">
                      {payment.failureReason}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2 pt-3 border-t">
                    <div>{getStatusBadge(payment.validationStatus)}</div>
                    {payment.validationStatus === 'PENDING' && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleValidateSingle(payment.id)}
                        disabled={validatingId === payment.id || validatingAll}
                        className="shadow-sm"
                      >
                        {validatingId === payment.id ? '...' : 'Validate UTR'}
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExternalPaymentValidation;
