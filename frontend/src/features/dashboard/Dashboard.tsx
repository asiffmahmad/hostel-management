import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building, BedDouble, Wallet, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHostel } from '@/app/HostelContext';
import { useAuth } from '@/app/AuthContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { getExpenses } from '@/services/expenses';
import api from '@/services/api';
import type { DashboardStats, Hostel, Expense } from '@/types';

const Dashboard = () => {
  const { selectedHostelId } = useHostel();
  const { user } = useAuth();
  
  const isOwner = user?.roles?.[0] === 'ROLE_OWNER';

  const { data: hostels } = useQuery<Hostel[]>({
    queryKey: ['hostels'],
    queryFn: async () => {
      const res = await api.get('/hostels');
      return res.data;
    },
  });

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats', selectedHostelId],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats', {
        params: { hostelId: selectedHostelId || undefined }
      });
      return data;
    },
    refetchInterval: 30000,
  });

  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ['expenses', selectedHostelId],
    queryFn: async () => {
      const res = await getExpenses(selectedHostelId ? Number(selectedHostelId) : undefined);
      return res.data;
    },
  });

  const totalExpenses = expenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  const selectedHostelName = selectedHostelId 
    ? hostels?.find(h => h.id.toString() === selectedHostelId)?.name || 'Hostel'
    : null;

  const kpiCards = [
    { title: selectedHostelName ? 'Selected Hostel' : 'Total Hostels', value: selectedHostelName || stats?.totalHostels || 0, icon: Building, color: 'text-blue-500' },
    { title: 'Total Beds', value: stats?.totalBeds || 0, icon: BedDouble, color: 'text-orange-500' },
    { title: 'Occupied Beds', value: stats?.occupiedBeds || 0, icon: BedDouble, color: 'text-red-500' },
    { title: 'Vacant Beds', value: stats?.vacantBeds || 0, icon: BedDouble, color: 'text-green-500' },
  ];

  if (isOwner) {
    kpiCards.push(
      { title: 'Monthly Revenue', value: `₹${stats?.monthlyRevenue || 0}`, icon: Wallet, color: 'text-purple-500' },
      { title: 'Total Expenses', value: `₹${totalExpenses.toFixed(2)}`, icon: Wallet, color: 'text-red-500' }
    );
  }

  if (isLoading) {
    return <div className="flex h-full items-center justify-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* Hostel selection is now handled globally via the AppLayout header */}
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-panel hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  Live statistics
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {isOwner && (
          <Card className="lg:col-span-4 glass-panel">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly collection statistics</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 200 : 300}>
                <AreaChart data={stats?.revenueData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className={`glass-panel ${isOwner ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <CardHeader>
            <CardTitle>Hostel Occupancy</CardTitle>
            <CardDescription>Current bed utilization per hostel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 200 : 300}>
              <BarChart data={stats?.occupancyData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                <Bar dataKey="occupied" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} />
                <Bar dataKey="vacant" stackId="a" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {!isOwner && (
          <Card className="lg:col-span-3 glass-panel">
            <CardHeader>
              <CardTitle>Recent Admissions</CardTitle>
              <CardDescription>Latest students added to hostels.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-6">
                  {stats?.recentAdmissions?.map((student: any, i: number) => (
                    <div key={i} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{student.name.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.hostel} • {student.room}</p>
                      </div>
                      <div className="ml-auto font-medium text-sm text-green-500">
                        New
                      </div>
                    </div>
                  ))}
                  {(!stats?.recentAdmissions || stats.recentAdmissions.length === 0) && (
                    <div className="text-center text-muted-foreground pt-4">No recent admissions found.</div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {isOwner && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-7 glass-panel">
          <CardHeader>
            <CardTitle>Recent Admissions</CardTitle>
            <CardDescription>Latest students added to hostels.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-6">
                {stats?.recentAdmissions?.map((student: any, i: number) => (
                  <div key={i} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{student.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.hostel} • {student.room}</p>
                    </div>
                    <div className="ml-auto font-medium text-sm text-green-500">
                      New
                    </div>
                  </div>
                ))}
                {(!stats?.recentAdmissions || stats.recentAdmissions.length === 0) && (
                  <div className="text-center text-muted-foreground pt-4">No recent admissions found.</div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
