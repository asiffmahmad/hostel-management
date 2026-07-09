import logger from '@/utils/logger';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

interface MappingResult {
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  details: Array<{
    studentName: string;
    month: string;
    year: string;
    utrNumber: string;
    success: boolean;
    reason: string;
  }>;
}

export function ManualMappingSection() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<MappingResult | null>(null);

  const [hostels, setHostels] = useState<any[]>([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const { data } = await api.get('/hostels');
        setHostels(data);
      } catch (e) {
        logger.error('Operation failed', e);
      }
    };
    fetchHostels();
  }, []);

  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      const params = new URLSearchParams();
      if (selectedHostel) {
        params.append('hostelId', selectedHostel);
        const h = hostels.find(h => h.id.toString() === selectedHostel);
        if (h) params.append('hostelName', h.name);
      }
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedYear) params.append('year', selectedYear);

      const response = await api.get(`/bank/manual-mapping/template?${params.toString()}`, {
        responseType: 'blob'
      });
      
      let fileName = 'Pending_Payments_UTR_Mapping.xlsx';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) { 
          fileName = matches[1].replace(/['"]/g, '');
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast({ title: "Template downloaded successfully" });
    } catch (error) {
      toast({ title: "Failed to download template", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await api.post('/bank/manual-mapping/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(data);
      toast({ title: `Upload complete: ${data.successfulRows} succeeded, ${data.failedRows} failed` });
    } catch (error: any) {
      toast({ title: error.response?.data?.message || "Failed to upload file", variant: "destructive" });
    } finally {
      setUploading(false);
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" /> Download Template
          </CardTitle>
          <CardDescription>
            Select a hostel, month, and year to download an Excel template containing students with pending payments. Fill in their UTR numbers in the empty column.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <label className="text-sm font-medium">Hostel</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={selectedHostel}
                onChange={e => setSelectedHostel(e.target.value)}
              >
                <option value="">All Hostels</option>
                {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 min-w-[120px]">
              <label className="text-sm font-medium">Month</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 min-w-[100px]">
              <label className="text-sm font-medium">Year</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
              >
                <option value="">All Years</option>
                {[...Array(5)].map((_, i) => {
                  const y = String(new Date().getFullYear() - 2 + i);
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            </div>
          </div>
          <Button onClick={handleDownloadTemplate} disabled={downloading} className="shadow-md">
            {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Download Excel Template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" /> Upload Filled Template
          </CardTitle>
          <CardDescription>
            Upload the completed Excel file here. The system will verify the UTR numbers and automatically map them to the pending payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={e => e.target.files && setFile(e.target.files[0])}
            />
            <Button
              onClick={() => fileRef.current?.click()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {file ? file.name : 'Select Excel File'}
            </Button>
            
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading} 
              className="w-full sm:w-auto shadow-md"
            >
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              Start Mapping
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-t-4 border-t-primary shadow-lg">
          <CardHeader>
            <CardTitle>Mapping Results</CardTitle>
            <div className="flex gap-4 mt-2">
              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none">Total: {result.totalRows}</Badge>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Success: {result.successfulRows}</Badge>
              <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Failed: {result.failedRows}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>UTR Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.details.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No UTRs were processed.</TableCell></TableRow>
                  ) : (
                    result.details.map((row, idx) => (
                      <TableRow key={idx} className={row.success ? 'bg-green-50/20' : 'bg-red-50/20'}>
                        <TableCell className="font-medium">{row.studentName}</TableCell>
                        <TableCell>{row.month} {row.year}</TableCell>
                        <TableCell className="font-mono text-xs">{row.utrNumber}</TableCell>
                        <TableCell>
                          {row.success ? (
                            <Badge className="bg-green-100 text-green-700 border-none flex w-fit items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Success</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-none flex w-fit items-center gap-1"><AlertCircle className="w-3 h-3"/> Failed</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {row.reason}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
