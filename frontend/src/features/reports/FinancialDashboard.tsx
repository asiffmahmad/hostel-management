import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useHostel } from '@/app/HostelContext';
import { useAuth } from '@/app/AuthContext';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface MonthlyData {
  monthYear: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface FinancialReport {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  monthlyData: MonthlyData[];
}

export default function FinancialDashboard() {
  const { selectedHostelId } = useHostel();
  const { user } = useAuth();
  const [months, setMonths] = useState<number>(6); // 1, 3, 6

  // Strict check - only OWNER
  if (user?.roles?.[0] !== 'ROLE_OWNER') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">You do not have access to financial reports.</p>
      </div>
    );
  }

  const { data: report, isLoading, isError } = useQuery<FinancialReport>({
    queryKey: ['financialReport', months, selectedHostelId],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/financial', {
        params: {
          months,
          hostelId: selectedHostelId || undefined
        }
      });
      
      // Let's ensure data is sorted if it's not (e.g. by date).
      // Since it's month strings like "Jul 2026", it's tricky to sort strings directly.
      // We will parse them or rely on the backend. For now, let's reverse them or assume chronological.
      // But we will take only the last `months` elements if there are too many.
      // Actually backend might return all if we didn't slice. Let's slice in frontend.
      if (data.monthlyData && data.monthlyData.length > months) {
          data.monthlyData = data.monthlyData.slice(-months);
      }
      return data;
    },
  });

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? 'text-green-500' : 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        Failed to load financial data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground text-sm">Comprehensive view of revenue, expenses, and profitability.</p>
        </div>
        <div className="flex items-center gap-2 bg-card p-1 rounded-lg border shadow-sm">
          <Button 
            variant={months === 1 ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setMonths(1)}
          >
            1M
          </Button>
          <Button 
            variant={months === 3 ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setMonths(3)}
          >
            3M
          </Button>
          <Button 
            variant={months === 6 ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setMonths(6)}
          >
            6M
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-panel hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-3xl font-bold text-green-600">₹{report?.totalRevenue?.toFixed(2) || 0}</div>
          </CardContent>
        </Card>

        <Card className="glass-panel hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-3xl font-bold text-red-600">₹{report?.totalExpenses?.toFixed(2) || 0}</div>
          </CardContent>
        </Card>

        <Card className={`glass-panel hover:shadow-md transition-shadow`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit/Loss</CardTitle>
            {report && report.netProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-3xl font-bold ${getProfitColor(report?.netProfit || 0)}`}>
              ₹{report?.netProfit?.toFixed(2) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel overflow-hidden border-primary/10 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-6">
          <CardTitle className="text-xl">Financial Trends</CardTitle>
          <CardDescription>Monthly comparison of revenue, expenses, and profit.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[280px] sm:h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={report?.monthlyData || []}
                margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="monthYear" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={13}
                  fontWeight={500}
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={13} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card/95 backdrop-blur-md border border-border/50 p-4 rounded-xl shadow-xl space-y-3 min-w-[200px]">
                          <p className="font-semibold text-foreground border-b pb-2">{label}</p>
                          {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }} />
                                {entry.name}
                              </span>
                              <span className="font-medium text-foreground">
                                ₹{entry.value.toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }} 
                  iconType="circle"
                  iconSize={8}
                />
                
                <Bar 
                  dataKey="revenue" 
                  name="Revenue" 
                  fill="url(#colorRevenue)" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={60} 
                  animationDuration={1500}
                />
                <Bar 
                  dataKey="expenses" 
                  name="Expenses" 
                  fill="url(#colorExpenses)" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={60} 
                  animationDuration={1500}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  name="Net Profit" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  dot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }} 
                  activeDot={{ r: 7, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2, filter: 'url(#glow)' }} 
                  animationDuration={1500}
                  filter="url(#glow)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
