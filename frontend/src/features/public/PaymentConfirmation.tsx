import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, ShieldCheck, CheckCircle2, IndianRupee, MapPin, BedDouble, User, Building2 } from 'lucide-react';
import api from '@/services/api';
import { Badge } from '@/components/ui/badge';

export default function PaymentConfirmation() {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');
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

  const currentPayment = student?.payments?.find(
    (p: any) => p.month === selectedMonth && p.year === selectedYear
  );
  
  const isAlreadyPaid = currentPayment?.status === 'PAID' && currentPayment?.dueAmount <= 0;

  const [errorMsg, setErrorMsg] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!phone || phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get(`/public/students/lookup?phone=${phone}`);
      setStudent(data);
      setAmount(data.monthlyRent?.toString() || '');
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'No active student matches this phone number.');
    } finally {
      setLoading(false);
    }
  };

  const [utrErrorMsg, setUtrErrorMsg] = useState('');

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setUtrErrorMsg('');
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length !== 12 || !/^[A-Z0-9]{12}$/.test(cleanUtr)) {
      setUtrErrorMsg('Please enter a valid 12-character UTR number (letters and numbers only).');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setUtrErrorMsg('Please enter a valid amount.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/public/payments/confirm', {
        studentId: student.id,
        utrNumber: cleanUtr,
        amount: Number(amount),
        month: selectedMonth,
        year: selectedYear
      });
      setStep(3);
    } catch (err: any) {
      setUtrErrorMsg(err.response?.data?.message || 'Failed to confirm payment.');
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
    <div className="h-[100dvh] overflow-y-auto bg-background text-foreground relative">
      <div className="min-h-full flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        </div>

      <div className="w-full max-w-lg z-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 ring-1 ring-primary/20 shadow-sm">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Sri Sai Ram Ladies Hostel</h1>
          <p className="text-muted-foreground mt-2 text-lg">Payment Confirmation: Verify your details and submit your UTR number</p>
        </div>

        {step === 1 && (
          <Card className="border-border shadow-xl shadow-primary/5 bg-card/80 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-card-foreground">Step 1: Student Lookup</CardTitle>
              <CardDescription>Enter your registered phone number to find your payment details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLookup} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="e.g. 9876543210"
                      className={`pl-10 sm:pl-10 h-12 sm:h-12 text-base sm:text-base bg-background focus:bg-background ${errorMsg ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                      autoComplete="off"
                    />
                  </div>
                  {errorMsg && <p className="text-sm text-destructive mt-1 font-medium">{errorMsg}</p>}
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium shadow-md shadow-primary/20" 
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Find My Details'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && student && (
          <Card className="border-border shadow-xl shadow-primary/5 bg-card/80 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-card-foreground">Step 2: Confirm Payment</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground">
                  Change Student
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Student Info Card */}
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/60">
                  <div className="bg-background p-2 rounded-full shadow-sm text-primary">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.hostelName || ''}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={16} className="opacity-70" />
                    <span className="truncate">{student.hostelName || 'No Hostel'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BedDouble size={16} className="opacity-70" />
                    <span>Room {student.roomNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleConfirm} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Month</label>
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {monthNames.map((m, index) => {
                        if (selectedYear === currentDate.getFullYear().toString() && index > currentDate.getMonth()) {
                          return null;
                        }
                        return <option key={m} value={m}>{m}</option>;
                      })}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Year</label>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => {
                        const newYear = e.target.value;
                        setSelectedYear(newYear);
                        if (newYear === currentDate.getFullYear().toString()) {
                           const currentMonthIdx = monthNames.indexOf(selectedMonth);
                           if (currentMonthIdx > currentDate.getMonth()) {
                             setSelectedMonth(monthNames[currentDate.getMonth()]);
                           }
                        }
                      }}
                      className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value={(currentDate.getFullYear() - 1).toString()}>{(currentDate.getFullYear() - 1).toString()}</option>
                      <option value={currentDate.getFullYear().toString()}>{currentDate.getFullYear().toString()}</option>
                    </select>
                  </div>
                </div>

                {isAlreadyPaid ? (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-600 p-8 rounded-xl flex flex-col items-center justify-center text-center mt-2">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Fee Already Paid!</h3>
                    <p className="text-base opacity-90">
                      Your fee for <strong>{selectedMonth} {selectedYear}</strong> has already been successfully paid. Select a different month to make a new payment.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Amount (₹)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 5000"
                        className="h-11 sm:h-11 bg-background"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={1}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">UTR / Reference Number</label>
                      <Input
                        placeholder="Enter 12-digit UTR from your bank"
                        className={`h-11 sm:h-11 font-mono text-sm sm:text-sm bg-background uppercase ${utrErrorMsg ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`}
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.toUpperCase().slice(0, 12))}
                        maxLength={12}
                      />
                      <p className="text-xs text-muted-foreground mt-1">You can find this on your payment receipt (e.g. Google Pay, PhonePe).</p>
                      {utrErrorMsg && <p className="text-sm text-destructive mt-1 font-medium">{utrErrorMsg}</p>}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg shadow-md"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Confirm Payment'}
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-border shadow-xl shadow-green-500/10 bg-card/80 backdrop-blur-xl border-t-4 border-t-green-500 text-center py-6">
            <CardHeader>
              <div className="mx-auto bg-green-500/10 text-green-500 h-20 w-20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={40} />
              </div>
              <CardTitle className="text-2xl text-card-foreground">Payment Submitted!</CardTitle>
              <CardDescription className="text-base mt-2">
                Your payment details for <strong className="text-foreground">{selectedMonth} {selectedYear}</strong> have been received.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-background p-4 rounded-lg inline-block w-full max-w-xs mx-auto mb-2 border border-border">
                <p className="text-sm text-muted-foreground mb-1">UTR Number</p>
                <p className="font-mono font-medium text-foreground tracking-wider">{utrNumber}</p>
              </div>
              <p className="text-sm text-green-500 font-medium mt-4 px-4 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                ✅ Payment successfully verified against bank records and applied to your account!
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
    </div>
  );
}
