import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

interface SystemSetting {
  id: number;
  settingKey: string;
  settingValue: string;
  description: string;
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({ key: '', value: '', description: '' });
  const [editingKey, setEditingKey] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/settings');
      setSettings(data);
    } catch (error) {
      toast({ title: 'Error fetching settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key || !formData.value) return;

    try {
      setIsSubmitting(true);
      if (editingKey) {
        await api.put(`/settings/${editingKey}`, {
          settingKey: formData.key,
          settingValue: formData.value,
          description: formData.description
        });
        toast({ title: 'Setting updated successfully' });
      } else {
        await api.post('/settings', {
          settingKey: formData.key,
          settingValue: formData.value,
          description: formData.description
        });
        toast({ title: 'Setting created successfully' });
      }
      setFormData({ key: '', value: '', description: '' });
      setEditingKey(null);
      fetchSettings();
    } catch (error: any) {
      toast({ 
        title: error.response?.data?.message || 'Failed to save setting', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (setting: SystemSetting) => {
    setEditingKey(setting.settingKey);
    setFormData({
      key: setting.settingKey,
      value: setting.settingValue,
      description: setting.description
    });
  };

  const handleDelete = async (key: string) => {
    if (!window.confirm('Are you sure you want to delete this setting?')) return;
    try {
      await api.delete(`/settings/${key}`);
      toast({ title: 'Setting deleted' });
      fetchSettings();
    } catch (error) {
      toast({ title: 'Failed to delete setting', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingKey ? 'Edit Setting' : 'Add New Setting'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Key</label>
                <Input 
                  placeholder="e.g. DEFAULT_RENT" 
                  value={formData.key}
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  disabled={!!editingKey}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Value</label>
                <Input 
                  placeholder="e.g. 5000" 
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Input 
                  placeholder="Description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingKey ? 'Update' : 'Save'}
              </Button>
              {editingKey && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingKey(null);
                  setFormData({ key: '', value: '', description: '' });
                }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No settings found.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell className="font-medium">{setting.settingKey}</TableCell>
                      <TableCell>{setting.settingValue}</TableCell>
                      <TableCell>{setting.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(setting)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(setting.settingKey)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
