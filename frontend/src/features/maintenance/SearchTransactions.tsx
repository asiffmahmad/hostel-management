import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import {
  Search, CheckCircle2, AlertCircle, Loader2,
  Building, BedDouble, Users, IndianRupee, X
} from 'lucide-react';

interface BankTxn {
  id: number; utrNumber: string; amount: number; transactionDate: string;
  description: string; bankName: string; accountNumber: string;
  transactionType: string; month: string; year: string;
  isMapped: boolean; mappedPaymentId?: number; mappedStudentId?: number;
  mappedBy?: string; mappedAt?: string;
}

interface Hostel { id: number; name: string; }
interface Room { id: number; roomNumber: string; }
interface Student { id: number; name: string; bedId?: number; monthlyRent?: number; status?: string; advanceDeposit?: number; }
interface Payment { id: number; month: string; year: string; status: string; amount: number; }

export default function SearchTransactions() {
  const { toast } = useToast();

  // Search state
  const [searchUtr, setSearchUtr] = useState('');
  const [searchAmount, setSearchAmount] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BankTxn[]>([]);
  const [searchDone, setSearchDone] = useState(false);

  // Selected transaction for mapping
  const [selectedTxn, setSelectedTxn] = useState<BankTxn | null>(null);

  // Cascading dropdowns
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loadingDropdown, setLoadingDropdown] = useState(false);

  // Selected student info
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => { fetchHostels(); }, []);

  useEffect(() => {
    if (selectedHostelId) fetchStudentsInHostel(selectedHostelId);
    else setStudents([]);
  }, [selectedHostelId]);

  useEffect(() => {
    if (selectedStudentId) {
      const s = students.find(s => s.id === parseInt(selectedStudentId));
      setSelectedStudent(s || null);
      if (s) fetchStudentPayments(s.id);
    } else {
      setSelectedStudent(null);
      setStudentPayments([]);
    }
  }, [selectedStudentId]);

  const fetchHostels = async () => {
    try {
      const { data } = await api.get('/hostels');
      setHostels(data);
    } catch (e) { console.error(e); }
  };

  const fetchStudentsInHostel = async (hostelId: string) => {
    try {
      setLoadingDropdown(true);
      const { data } = await api.get(`/students?hostelId=${hostelId}`);
      const studentList = data.filter((s: any) => !s.isDeleted && s.status === 'ACTIVE');
      setStudents(studentList);
      setSelectedStudentId('');
    } catch (e) {
      console.error(e);
    } finally { 
      setLoadingDropdown(false); 
    }
  };

  const fetchStudentPayments = async (studentId: number) => {
    try {
      const { data } = await api.get(`/payments/student/${studentId}`);
      setStudentPayments(data);
    } catch (e) { console.error(e); }
  };

  const handleSearch = async () => {
    if (!searchUtr && !searchAmount) {
      toast({ title: 'Enter at least UTR Number or Amount to search', variant: 'destructive' });
      return;
    }
    try {
      setSearching(true);
      setSearchDone(false);
      setSelectedTxn(null);
      const params = new URLSearchParams();
      if (searchUtr) params.append('utrNumber', searchUtr);
      if (searchAmount) params.append('amount', searchAmount);
      const { data } = await api.get(`/bank/search?${params.toString()}`);
      setSearchResults(data);
      setSearchDone(true);
    } catch (e) {
      toast({ title: 'Search failed', variant: 'destructive' });
    } finally { setSearching(false); }
  };

  const handleConfirmPayment = async () => {
    if (!selectedTxn || !selectedStudentId) {
      toast({ title: 'Select a student to map the payment', variant: 'destructive' });
      return;
    }

    const currentMonth = selectedTxn.month;
    const currentYear = selectedTxn.year;
    const pendingPayment = studentPayments.find(p =>
      p.month.toUpperCase() === currentMonth.toUpperCase() &&
      p.year === currentYear &&
      p.status === 'PENDING'
    );

    try {
      setConfirming(true);
      await api.post('/bank/map-payment', {
        bankTransactionId: selectedTxn.id,
        studentId: parseInt(selectedStudentId),
        existingPaymentId: pendingPayment?.id ?? null,
        month: currentMonth,
        year: currentYear,
      });
      toast({ title: `✅ Payment confirmed for ${selectedStudent?.name}` });
      setSelectedTxn(null);
      setSelectedHostelId('');
      setSelectedStudentId('');
      handleSearch();
    } catch (err: any) {
      toast({ title: err.response?.data?.message || 'Failed to confirm payment', variant: 'destructive' });
    } finally { setConfirming(false); }
  };

  const pendingPaymentsThisMonth = selectedTxn
    ? studentPayments.filter(p =>
        p.month.toUpperCase() === selectedTxn.month.toUpperCase() &&
        p.year === selectedTxn.year &&
        p.status === 'PENDING')
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-lg self-start sm:self-auto">
          <Search className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Search Transactions</h1>
          <p className="text-muted-foreground text-sm">Search bank transactions and map them to students</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-primary" />
            Find Transactions
          </CardTitle>
          <CardDescription>Search imported transactions by UTR number or amount.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5 flex-1 min-w-48">
              <label className="text-sm font-medium">UTR Number</label>
              <Input
                placeholder="e.g. 618213397873"
                value={searchUtr}
                onChange={e => setSearchUtr(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="space-y-1.5 w-40">
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input
                type="number"
                placeholder="e.g. 5600"
                value={searchAmount}
                onChange={e => setSearchAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={searching} className="gap-2">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
            {searchDone && (
              <Button variant="ghost" size="sm" onClick={() => { setSearchResults([]); setSearchDone(false); setSearchUtr(''); setSearchAmount(''); setSelectedTxn(null); }}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </div>

          {searchDone && (
            <div className="mt-4">
              {searchResults.length === 0 ? (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-muted text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  No transaction found matching the search criteria.
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map(txn => (
                    <div
                      key={txn.id}
                      onClick={() => { if (!txn.isMapped) setSelectedTxn(txn); }}
                      className={`border rounded-lg p-4 transition-all cursor-pointer ${
                        selectedTxn?.id === txn.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : txn.isMapped
                            ? 'border-green-300 bg-green-50 dark:bg-green-950/20 cursor-not-allowed opacity-70'
                            : 'hover:border-primary/40 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-semibold text-sm">{txn.utrNumber || '—'}</span>
                            <Badge variant={txn.isMapped ? 'default' : 'secondary'} className={txn.isMapped ? 'bg-green-500 text-white' : ''}>
                              {txn.isMapped ? '✓ Mapped' : 'Not Mapped'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground max-w-md truncate">{txn.description}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{txn.bankName}</span>
                            <span>•</span>
                            <span>{txn.transactionDate}</span>
                            <span>•</span>
                            <span>{txn.month} {txn.year}</span>
                          </div>
                          {txn.isMapped && txn.mappedBy && (
                            <p className="text-xs text-green-600">Mapped by {txn.mappedBy} on {txn.mappedAt?.split('T')[0]}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600 flex items-center gap-0.5">
                            <IndianRupee className="h-4 w-4" />
                            {Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-muted-foreground">CREDIT</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTxn && (
        <Card className="border-primary/30 shadow-md">
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Map Payment — UTR: <span className="font-mono">{selectedTxn.utrNumber}</span>
              </CardTitle>
              <div className="text-xl font-bold text-green-600 flex items-center gap-1">
                <IndianRupee className="h-5 w-5" />
                {Number(selectedTxn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <CardDescription>
              {selectedTxn.bankName} | {selectedTxn.transactionDate} | {selectedTxn.description?.slice(0, 80)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" /> Select Hostel
                </label>
                <select
                  className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={selectedHostelId}
                  onChange={e => setSelectedHostelId(e.target.value)}
                >
                  <option value="">— Select Hostel —</option>
                  {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Select Student
                </label>
                <select
                  className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  disabled={!selectedHostelId || loadingDropdown}
                >
                  <option value="">— Select Student —</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {selectedStudent && (
              <div className="bg-muted/50 border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  {selectedStudent.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Rent</p>
                    <p className="font-semibold flex items-center gap-0.5">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {selectedStudent.monthlyRent?.toLocaleString('en-IN') || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Transaction Amount</p>
                    <p className="font-semibold text-green-600 flex items-center gap-0.5">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {Number(selectedTxn.amount).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Payments</p>
                    <p className="font-semibold">
                      {pendingPaymentsThisMonth.length > 0
                        ? <Badge variant="destructive">{pendingPaymentsThisMonth.length} pending</Badge>
                        : <Badge variant="secondary">None this month</Badge>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Advance Deposit</p>
                    <p className="font-semibold flex items-center gap-0.5">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {selectedStudent.advanceDeposit?.toLocaleString('en-IN') || '0'}
                    </p>
                  </div>
                </div>

                {pendingPaymentsThisMonth.length > 0 && (
                  <div className="mt-3 p-2 rounded bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 text-xs text-yellow-800 dark:text-yellow-200">
                    Found pending payment for {selectedTxn.month} {selectedTxn.year}. 
                    This transaction will be applied to that payment record.
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleConfirmPayment}
                disabled={!selectedStudentId || confirming}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {confirming
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <CheckCircle2 className="h-4 w-4" />}
                {confirming ? 'Confirming…' : 'Mark as Paid'}
              </Button>
              <Button variant="outline" onClick={() => { setSelectedTxn(null); setSelectedHostelId(''); setSelectedStudentId(''); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
