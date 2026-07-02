import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, PieChart, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useHostel } from '@/app/HostelContext';

const Reports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedHostelId } = useHostel();

  const reportTypes = [
    { id: 1, name: 'Revenue Report', description: 'Monthly collection, due rents, and expenses.', icon: TrendingUp, color: 'text-green-500', route: '/payments', apiEndpoint: '/payments' },
    { id: 2, name: 'Occupancy Report', description: 'Hostel wise room availability and bed status.', icon: PieChart, color: 'text-blue-500', route: '/hostels', apiEndpoint: '/beds' },
    { id: 3, name: 'Student List', description: 'Complete directory of all admitted students.', icon: Users, color: 'text-orange-500', route: '/students', apiEndpoint: '/students' },
  ];

  const handleExport = async (endpoint: string, reportName: string) => {
    try {
      toast({ title: `Exporting ${reportName}...` });
      
      const params = (endpoint !== '/payments' && selectedHostelId) 
        ? { hostelId: selectedHostelId } 
        : {};
        
      const res = await api.get(endpoint, { params });
      const data = res.data;
      if (!data || data.length === 0) {
        toast({ title: 'No data to export', variant: 'destructive' });
        return;
      }
      
      const keys = Object.keys(data[0]);
      const csvContent = [
        keys.join(','),
        ...data.map((row: any) => keys.map(k => `"${String(row[k]).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportName.toLowerCase().replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Export completed successfully' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to export report', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Generate and export system reports.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reportTypes.map((report) => (
          <Card key={report.id} className="glass-panel group hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className={`p-3 rounded-xl bg-muted group-hover:bg-background transition-colors ${report.color}`}>
                <report.icon size={24} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">{report.name}</CardTitle>
                <CardDescription className="mt-1">{report.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(report.route)}>
                  <FileText size={14} /> Preview
                </Button>
                <Button size="sm" className="gap-2" onClick={() => handleExport(report.apiEndpoint, report.name)}>
                  <Download size={14} /> Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;
