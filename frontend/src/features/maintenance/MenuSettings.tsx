import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Loader2, Power } from 'lucide-react';
import { useAuth } from '@/app/AuthContext';
import { Navigate } from 'react-router-dom';

const MENUS = [
  { key: 'MENU_HOSTELS_ENABLED', label: 'Hostels', description: 'Manage properties and buildings' },
  { key: 'MENU_STUDENTS_ENABLED', label: 'Students', description: 'Student directory and profiles' },
  { key: 'MENU_PAYMENTS_ENABLED', label: 'Payments', description: 'Fee collection and receipts' },
  { key: 'MENU_EXPENSES_ENABLED', label: 'Expenses', description: 'Track hostel expenses and bills' },
  { key: 'MENU_GIVE_COMPLAINTS_ENABLED', label: 'Give Complaint', description: 'Raise maintenance complaints' },
  { key: 'MENU_VIEW_COMPLAINTS_ENABLED', label: 'View Complaints', description: 'View and resolve complaints' },
  { key: 'MENU_REPORTS_ENABLED', label: 'Reports', description: 'Analytics and financial stats' },
  { key: 'MENU_FINANCIAL_DASHBOARD_ENABLED', label: 'Financial Dashboard', description: 'Track monthly revenue and expenses' },
  { key: 'MENU_ADMISSIONS_ENABLED', label: 'Admissions', description: 'New student admissions and lifecycle' },
  { key: 'MENU_ROOMS_ENABLED', label: 'Room Management', description: 'Create and manage rooms' },
  { key: 'MENU_BEDS_ENABLED', label: 'Bed Management', description: 'Manage beds and allocations' },
  { key: 'MENU_STUDENT_MAPPING_ENABLED', label: 'Student Mapping', description: 'Assign students to specific beds' },
  { key: 'MENU_SEARCH_TRANSACTIONS_ENABLED', label: 'Search Transactions', description: 'Search and map bank transactions to students' },
  { key: 'MENU_PAYMENT_CHECK_ENABLED', label: 'Payment Check', description: 'Bank transaction and reconciliation grid' },
  { key: 'MENU_SYSTEM_SETTINGS_ENABLED', label: 'System Settings', description: 'Manage global hostel configurations' },
];

export default function MenuSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/settings');
      const settingsMap: Record<string, string> = {};
      data.forEach((s: any) => {
        settingsMap[s.settingKey] = s.settingValue;
      });
      setSettings(settingsMap);
    } catch (error) {
      toast({ title: 'Error fetching settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string, currentValue: string, description: string) => {
    // If setting doesn't exist, it's considered 'true' by default
    const isCurrentlyEnabled = currentValue !== 'false';
    const newValue = isCurrentlyEnabled ? 'false' : 'true';
    
    try {
      setProcessingKey(key);
      
      // Check if setting exists in state map to decide POST vs PUT
      if (settings.hasOwnProperty(key)) {
        await api.put(`/settings/${key}`, {
          settingKey: key,
          settingValue: newValue,
          description: description
        });
      } else {
        await api.post('/settings', {
          settingKey: key,
          settingValue: newValue,
          description: description
        });
      }
      
      setSettings(prev => ({ ...prev, [key]: newValue }));
      
      toast({ 
        title: `Menu ${isCurrentlyEnabled ? 'Disabled' : 'Enabled'}`, 
        description: 'Changes will apply on the next page reload for other users.' 
      });
    } catch (error: any) {
      toast({ 
        title: 'Failed to update menu visibility', 
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive' 
      });
    } finally {
      setProcessingKey(null);
    }
  };

  // Strictly restrict to OWNER
  if (user?.roles?.[0] !== 'ROLE_OWNER') {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Enable or disable major application modules. Disabled modules will be hidden from Admins and standard Users.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {MENUS.map((menu) => {
          const value = settings[menu.key];
          const isEnabled = value !== 'false'; // Defaults to true if undefined
          const isProcessing = processingKey === menu.key;
          
          return (
            <Card key={menu.key} className={`glass-panel transition-all ${!isEnabled ? 'opacity-70 grayscale-[0.2]' : ''}`}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{menu.label}</h3>
                  <p className="text-sm text-muted-foreground">{menu.description}</p>
                </div>
                
                <Button 
                  variant={isEnabled ? "default" : "secondary"}
                  className={`w-32 transition-colors ${isEnabled ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={() => handleToggle(menu.key, value, menu.description)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Power className="h-4 w-4" />
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
