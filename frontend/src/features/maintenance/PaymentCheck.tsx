import logger from '@/utils/logger';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import {
  Upload, Search, CheckCircle2, AlertCircle, Loader2,
  FileUp, Calendar, Building, BedDouble, Users, 
  IndianRupee, ClipboardCheck, RefreshCw, X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BankTransactionSection } from './components/BankTransactionSection';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ImportResult {
  month: string; year: string; bankName: string; accountNumber: string;
  sourceFile: string; totalRowsRead: number; creditsImported: number;
  debitsSkipped: number; duplicatesSkipped: number; errors: number; message: string;
}

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

const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

export default function PaymentCheck() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [phonePeFile, setPhonePeFile] = useState<File | null>(null);
  const [gpayFile, setGpayFile] = useState<File | null>(null);
  
  const phonePeRef = useRef<HTMLInputElement>(null);
  const gpayRef = useRef<HTMLInputElement>(null);
  
  const [importing, setImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loadingDropdown, setLoadingDropdown] = useState(false);

  // Selected student info
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => { fetchHostels(); }, []);

  useEffect(() => {
    if (selectedHostelId) fetchRooms(selectedHostelId);
    else { setRooms([]); setStudents([]); }
  }, [selectedHostelId]);

  useEffect(() => {
    if (selectedRoomId) fetchStudentsInRoom(selectedRoomId);
    else setStudents([]);
  }, [selectedRoomId]);

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
    } catch (e) { logger.error('Operation failed', e); }
  };

  const fetchRooms = async (hostelId: string) => {
    try {
      setLoadingDropdown(true);
      const { data } = await api.get(`/rooms/hostel/${hostelId}`);
      setRooms(data);
      setSelectedRoomId('');
      setStudents([]);
    } finally { setLoadingDropdown(false); }
  };

  const fetchStudentsInRoom = async (roomId: string) => {
    try {
      setLoadingDropdown(true);
      const { data: beds } = await api.get(`/beds/room/${roomId}`);
      const studentList: Student[] = [];
      for (const bed of beds) {
        if (bed.studentId) {
          try {
            const { data: s } = await api.get(`/students/${bed.studentId}`);
            if (!s.isDeleted && s.status === 'ACTIVE') studentList.push(s);
          } catch (e) { /* skip */ }
        }
      }
      setStudents(studentList);
      setSelectedStudentId('');
    } finally { setLoadingDropdown(false); }
  };

  const fetchStudentPayments = async (studentId: number) => {
    try {
      const { data } = await api.get(`/payments/student/${studentId}`);
      setStudentPayments(data);
    } catch (e) { logger.error('Operation failed', e); }
  };

  // ── Import ──────────────────────────────────────────────────────────────

  const handleImportSubmit = async () => {
    if (!phonePeFile && !gpayFile) {
      toast({ title: 'Please select at least one file to import.', variant: 'destructive' });
      return;
    }

    try {
      setImporting(true);
      setUploadProgress(0);
      setUploadStatus('Starting concurrent bulk import...');
      setImportResult(null);

      let totalCredits = 0;
      let totalRows = 0;
      let totalDebits = 0;
      let totalDuplicates = 0;
      let totalErrors = 0;

      const filesToUpload = [];
      if (gpayFile) filesToUpload.push({ file: gpayFile, provider: 'GPAY' });
      if (phonePeFile) filesToUpload.push({ file: phonePeFile, provider: 'PHONEPE' });

      const totalFiles = filesToUpload.length;
      if (totalFiles === 0) return;

      const progresses = Array(totalFiles).fill(0);

      const uploadPromises = filesToUpload.map(async ({ file, provider }, index) => {
        setUploadStatus(`Uploading ${totalFiles} files concurrently...`);
        
        const formData = new FormData();
        formData.append('file', file);
        
        const providerParam = provider ? `&provider=${provider}` : '';
        const { data } = await api.post(
          `/bank/upload?mode=APPEND${providerParam}`,
          formData,
          { 
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                progresses[index] = (progressEvent.loaded / progressEvent.total) * 100;
                const overallProgress = progresses.reduce((a, b) => a + b, 0) / totalFiles;
                setUploadProgress(Math.round(overallProgress));
                if (progresses.every(p => p === 100)) {
                  setUploadStatus('Processing all files (Extracting details)...');
                }
              }
            }
          }
        );
        totalCredits += data.creditsImported;
        totalRows += data.totalRowsRead;
        totalDebits += data.debitsSkipped;
        totalDuplicates += data.duplicatesSkipped;
        totalErrors += data.errors;
      });

      await Promise.all(uploadPromises);

      setImportResult({
         bankName: 'Multiple Files',
         totalRowsRead: totalRows,
         creditsImported: totalCredits,
         debitsSkipped: totalDebits,
         duplicatesSkipped: totalDuplicates,
         errors: totalErrors,
         message: 'Bulk import completed',
         accountNumber: ''
      } as any);

      toast({ title: `✅ Import complete: ${totalCredits} credits added/updated` });
    } catch (err: any) {
      toast({ title: 'Import failed: ' + (err.response?.data?.message || err.message), variant: 'destructive' });
    } finally {
      setImporting(false);
      setUploadProgress(0);
      setUploadStatus('');
      setPhonePeFile(null);
      setGpayFile(null);
      if (phonePeRef.current) phonePeRef.current.value = '';
      if (gpayRef.current) gpayRef.current.value = '';
    }
  };

  // ── Search ──────────────────────────────────────────────────────────────

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

  // ── Confirm Payment ─────────────────────────────────────────────────────

  const handleConfirmPayment = async () => {
    if (!selectedTxn || !selectedStudentId) {
      toast({ title: 'Select a student to map the payment', variant: 'destructive' });
      return;
    }

    // Find pending payment for current month
    const currentMonth = selectedTxn.month;
    const currentYear = selectedTxn.year;
    const pendingPayment = studentPayments.find(p =>
      p.month.toUpperCase() === currentMonth.toUpperCase() &&
      p.year === currentYear &&
      p.status?.startsWith('PENDING')
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
      // Reset mapping panel
      setSelectedTxn(null);
      setSelectedHostelId('');
      setSelectedStudentId('');
      // Refresh search
      handleSearch();
    } catch (err: any) {
      toast({ title: err.response?.data?.message || 'Failed to confirm payment', variant: 'destructive' });
    } finally { setConfirming(false); }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────

  const pendingPaymentsThisMonth = selectedTxn
    ? studentPayments.filter(p =>
        p.month.toUpperCase() === selectedTxn.month.toUpperCase() &&
        p.year === selectedTxn.year &&
        p.status?.startsWith('PENDING'))
    : [];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-lg self-start sm:self-auto">
          <ClipboardCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Payment Check</h1>
          <p className="text-muted-foreground text-sm">Upload bank statement and view all imported transactions</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="import" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="import">Import Statement</TabsTrigger>
          <TabsTrigger value="grid">Bank Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          {/* ── SECTION 1: Import Statement ── */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileUp className="h-5 w-5 text-primary" />
            Bulk Import Statements
          </CardTitle>
          <CardDescription>Upload PhonePe (PDF) and GPay (PDF) statements all at once. Existing transactions with the same UTR will be safely updated.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* File Selection Row */}
          <div className="flex flex-wrap gap-4 mt-2">
            {/* GPay File */}
            <div className="flex-1 min-w-[250px] space-y-2 border rounded-md p-3">
              <label className="text-sm font-medium block">Google Pay (PDF)</label>
              <input
                ref={gpayRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => e.target.files && setGpayFile(e.target.files[0])}
              />
              <Button
                onClick={() => gpayRef.current?.click()}
                variant="outline"
                className="w-full text-xs h-8"
              >
                {gpayFile ? gpayFile.name : 'Select GPay File'}
              </Button>
            </div>

            {/* PhonePe File */}
            <div className="flex-1 min-w-[250px] space-y-2 border rounded-md p-3">
              <label className="text-sm font-medium block">PhonePe (PDF)</label>
              <input
                ref={phonePeRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => e.target.files && setPhonePeFile(e.target.files[0])}
              />
              <Button
                onClick={() => phonePeRef.current?.click()}
                variant="outline"
                className="w-full text-xs h-8"
              >
                {phonePeFile ? phonePeFile.name : 'Select PhonePe File'}
              </Button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleImportSubmit}
              disabled={importing || (!gpayFile && !phonePeFile)}
              className="gap-2 bg-primary text-primary-foreground min-w-[150px]"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
              {importing ? 'Importing…' : 'Start Bulk Import'}
            </Button>
          </div>

          {/* Progress Bar */}
          {importing && (
            <div className="mt-6 space-y-2 rounded-md bg-secondary/50 p-4 border border-secondary">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>{uploadStatus}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Import Result */}
          {!importing && importResult && (
            <div className="mt-6 rounded-md bg-green-50 p-4 border border-green-200">
              <h3 className="font-semibold text-green-800 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> Import Completed
              </h3>
              <p className="text-sm text-green-700 mt-2 mb-2">
                Processed a total of <strong>{importResult.totalRowsRead} rows</strong> from your statements.
              </p>
              <ul className="text-sm text-green-800 list-disc list-inside space-y-1 ml-1">
                <li><strong>{importResult.creditsImported}</strong> credits successfully imported or updated</li>
                <li><strong>{importResult.debitsSkipped}</strong> debits safely skipped</li>
                <li><strong>{importResult.duplicatesSkipped}</strong> identical duplicates skipped</li>
                {importResult.errors > 0 && <li className="text-red-600"><strong>{importResult.errors}</strong> lines could not be parsed</li>}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="grid">
        <BankTransactionSection onMapPayment={(txn) => {
          setSelectedTxn(txn);
          // Auto switch to import tab by finding the button and clicking it
          const tabButton = document.querySelector('[value="import"]') as HTMLElement;
          if (tabButton) tabButton.click();
          // Clear previous selections just in case
          setSelectedHostelId('');
          setSelectedStudentId('');
        }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
