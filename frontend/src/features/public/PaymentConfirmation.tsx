import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, ShieldCheck, CheckCircle2, IndianRupee, MapPin, BedDouble, User } from 'lucide-react';
import api from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PaymentConfirmation() {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Student details from step 1
  const [student, setStudent] = useState<any>(null);
  
  // Payment details from step 2
  const [utrNumber, setUtrNumber] = useState('');
  const [amount, setAmount] = useState('');
  
  // Default to current month/year
  const currentDate = new Date();
  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  const [selectedMonth, setSelectedMonth] = useState(monthNames[currentDate.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length !== 10) {
      toast({ title: 'Please enter a valid 10-digit phone number', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get(`/public/students/lookup?phone=${phone}`);
      setStudent(data);
      setAmount(data.monthlyRent?.toString() || '');
      setStep(2);
    } catch (err: any) {
      toast({ 
        title: 'Student not found', 
        description: err.response?.data?.message || 'No active student matches this phone number.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber) {
      toast({ title: 'Please enter the UTR Number', variant: 'destructive' });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast({ title: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      await api.post('/public/payments/confirm', {
        studentId: student.id,
        utrNumber,
        amount: Number(amount),
        month: selectedMonth,
        year: selectedYear
      });
      setStep(3);
    } catch (err: any) {
      toast({ 
        title: 'Failed to confirm payment', 
        description: err.response?.data?.message || 'An error occurred.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setPhone('');
    setStudent(null);
    setUtrNumber('');
    setAmount('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-lg z-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 ring-1 ring-primary/20 shadow-sm">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payment Confirmation</h1>
          <p className="text-muted-foreground mt-2 text-lg">Verify your details and submit your UTR number</p>
        </div>

        {step === 1 && (
          <Card className="border-0 shadow-xl shadow-primary/5 bg-white/80 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Step 1: Student Lookup</CardTitle>
              <CardDescription>Enter your registered phone number to find your details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLookup} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Phone Number</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="e.g. 9876543210"
                      className="pl-10 h-12 text-lg bg-white/50 focus:bg-white"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium shadow-md shadow-primary/20" 
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Find Student'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && student && (
          <Card className="border-0 shadow-xl shadow-primary/5 bg-white/80 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Step 2: Confirm Payment</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-muted-foreground hover:text-primary">
                  Change Student
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Student Info Card */}
              <div className="bg-slate-100/80 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200/60">
                  <div className="bg-white p-2 rounded-full shadow-sm text-primary">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{student.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">ID: STU-{student.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="truncate">{student.hostelName || 'No Hostel'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <BedDouble size={16} className="text-slate-400" />
                    <span>Room {student.roomNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleConfirm} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Month</label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="h-11 bg-white/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {monthNames.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Year</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="h-11 bg-white/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 5}, (_, i) => currentDate.getFullYear() - 1 + i).map(y => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Amount Paid (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Amount"
                      className="pl-10 h-11 bg-white/50"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">UTR / Reference Number</label>
                  <Input
                    placeholder="Enter 12-digit UTR from your bank"
                    className="h-11 font-mono text-sm bg-white/50 uppercase"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                  />
                  <p className="text-xs text-muted-foreground">You can find this on your payment receipt (e.g. Google Pay, PhonePe).</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium shadow-md shadow-primary/20" 
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Confirm Payment'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-0 shadow-xl shadow-green-500/10 bg-white/80 backdrop-blur-xl border-t-4 border-t-green-500 text-center py-6">
            <CardHeader>
              <div className="mx-auto bg-green-100 text-green-600 h-20 w-20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={40} />
              </div>
              <CardTitle className="text-2xl text-slate-900">Payment Submitted!</CardTitle>
              <CardDescription className="text-base mt-2">
                Your payment details for <strong className="text-slate-800">{selectedMonth} {selectedYear}</strong> have been received.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-4 rounded-lg inline-block w-full max-w-xs mx-auto mb-2 border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">UTR Number</p>
                <p className="font-mono font-medium text-slate-900 tracking-wider">{utrNumber}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-4 px-4">
                The transaction is currently pending verification. The admin will approve it shortly after verifying with the bank statement.
              </p>
            </CardContent>
            <CardFooter className="justify-center pt-2">
              <Button variant="outline" onClick={resetForm} className="min-w-[150px]">
                Submit Another
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
