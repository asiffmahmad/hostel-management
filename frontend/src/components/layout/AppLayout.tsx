import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/AuthContext';
import { useTheme } from '@/app/ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Building,
  LogOut,
  Menu,
  Moon,
  Sun,
  CreditCard,
  FileText,
  Wrench,
  ChevronDown,
  ChevronRight,
  BedDouble,
  Settings,
  Map,
  Landmark,
  MessageSquareWarning,
  Receipt,
  Search,
  PieChart,
  Link as LinkIcon
} from 'lucide-react';
import HostelFilter from '@/components/HostelFilter';
import api from '@/services/api';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [maintenanceOpen, setMaintenanceOpen] = useState(
    location.pathname.startsWith('/maintenance')
  );

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        const settingsMap: Record<string, string> = {};
        data.forEach((s: any) => {
          settingsMap[s.settingKey] = s.settingValue;
        });
        setSettings(settingsMap);
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    fetchSettings();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Hostels', path: '/hostels-overview', icon: Building, menuKey: 'MENU_HOSTELS_ENABLED' },
    { name: 'Students', path: '/students', icon: Users, menuKey: 'MENU_STUDENTS_ENABLED' },
    { name: 'Payments', path: '/payments', icon: CreditCard, menuKey: 'MENU_PAYMENTS_ENABLED' },
    { name: 'Expenses', path: '/expenses', icon: Receipt, menuKey: 'MENU_EXPENSES_ENABLED' },
    { name: 'Give Complaint', path: '/complaints/give', icon: MessageSquareWarning, menuKey: 'MENU_GIVE_COMPLAINTS_ENABLED' },
    { name: 'View Complaints', path: '/complaints/view', icon: MessageSquareWarning, menuKey: 'MENU_VIEW_COMPLAINTS_ENABLED' },
    { name: 'Reports', path: '/reports', icon: FileText, menuKey: 'MENU_REPORTS_ENABLED' },
    { name: 'Financial Dashboard', path: '/reports/financial', icon: PieChart, menuKey: 'MENU_FINANCIAL_DASHBOARD_ENABLED', ownerOnly: true },
  ];

  const maintenanceItems = [
    { name: 'Admissions', path: '/admin/admissions', icon: Users, menuKey: 'MENU_ADMISSIONS_ENABLED' },
    { name: 'Hostel Mgmt', path: '/maintenance/hostels', icon: Building, menuKey: 'MENU_HOSTELS_ENABLED' },
    { name: 'Room Mgmt', path: '/maintenance/rooms', icon: Building, menuKey: 'MENU_ROOMS_ENABLED' },
    { name: 'Bed Mgmt', path: '/maintenance/beds', icon: BedDouble, menuKey: 'MENU_BEDS_ENABLED' },
    { name: 'Student Mapping', path: '/maintenance/mapping', icon: Map, menuKey: 'MENU_STUDENT_MAPPING_ENABLED' },
    { name: 'Search Transactions', path: '/maintenance/search-transactions', icon: Search, menuKey: 'MENU_SEARCH_TRANSACTIONS_ENABLED' },
    { name: 'Payment Check', path: '/maintenance/payment-check', icon: Landmark, menuKey: 'MENU_PAYMENT_CHECK_ENABLED' },
    { name: 'Public Links', path: '/maintenance/public-links', icon: LinkIcon, menuKey: 'MENU_PUBLIC_LINKS_ENABLED' },
    { name: 'System Settings', path: '/maintenance/settings', icon: Settings, menuKey: 'MENU_SYSTEM_SETTINGS_ENABLED' },
    { name: 'Menu Settings', path: '/maintenance/menu-settings', icon: Settings, ownerOnly: true },
  ];

  const isOwner = user?.roles?.[0] === 'ROLE_OWNER';

  const isMenuVisible = (item: any) => {
    if (item.ownerOnly && !isOwner) return false;
    if (isOwner) return true; // Owner sees all modules (except ownerOnly gets checked above)
    if (!item.menuKey) return true; // Unprotected items
    return settings[item.menuKey] !== 'false';
  };

  const filteredMainNavItems = mainNavItems.filter(isMenuVisible);
  const filteredMaintenanceItems = maintenanceItems.filter(isMenuVisible);

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden relative">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ width: 256 }}
        animate={{ width: sidebarOpen ? 256 : (isMobile ? 0 : 80) }}
        className={`h-full border-r bg-card flex flex-col transition-all duration-300 z-50 shadow-sm ${
          isMobile ? 'fixed inset-y-0 left-0' : 'relative shrink-0'
        } overflow-hidden`}
      >
        <div className="p-4 flex items-center justify-between h-16 border-b shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shrink-0">
              <Building size={24} />
            </div>
            {sidebarOpen && <span className="font-bold text-lg whitespace-nowrap">Hostel OS</span>}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredMainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-md transition-colors text-sm sm:text-base ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
                onClick={() => { if (isMobile) setSidebarOpen(false); }}
              >
                <Icon size={18} className="shrink-0 sm:w-5 sm:h-5" />
                {sidebarOpen && <span>{item.name}</span>}
              </NavLink>
            );
          })}

          {filteredMaintenanceItems.length > 0 && (
            <div className="pt-4 mt-4 border-t border-border">
              {sidebarOpen ? (
                <button
                  onClick={() => setMaintenanceOpen(!maintenanceOpen)}
                  className="w-full flex items-center justify-between px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <Wrench size={18} className="sm:w-5 sm:h-5" />
                    <span>Maintenance</span>
                  </div>
                  {maintenanceOpen ? <ChevronDown size={14} className="sm:w-4 sm:h-4" /> : <ChevronRight size={14} className="sm:w-4 sm:h-4" />}
                </button>
              ) : (
                <div className="flex justify-center py-2 text-muted-foreground">
                  <Wrench size={18} className="sm:w-5 sm:h-5" />
                </div>
              )}
              
              <AnimatePresence>
                {maintenanceOpen && sidebarOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-0.5 sm:space-y-1 mt-1 pl-3 sm:pl-4"
                  >
                    {filteredMaintenanceItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-colors ${
                              isActive
                                ? 'bg-secondary text-secondary-foreground font-medium'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`
                          }
                          onClick={() => { if (isMobile) setSidebarOpen(false); }}
                        >
                          <Icon size={14} className="shrink-0 sm:w-4 sm:h-4" />
                          <span>{item.name}</span>
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        <div className="p-4 border-t shrink-0">
          <div className="flex items-center justify-between gap-2">
            {sidebarOpen && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">{user?.username}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.roles?.[0] || 'User'}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 sm:px-6 z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </Button>
            <h2 className="text-xl font-semibold capitalize hidden sm:block">
              {location.pathname.split('/').pop()?.replace('-', ' ')}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <HostelFilter />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-muted/20 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
