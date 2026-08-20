import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileUp, 
  Users, 
  Send, 
  Settings, 
  Activity,
  Sparkles,
  Menu,
  X,
  BookOpen
} from 'lucide-react';
import { checkHealth } from '../services/api';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Upload PDF', path: '/upload', icon: FileUp },
  { name: 'Contacts', path: '/contacts', icon: Users },
  { name: 'Templates', path: '/templates', icon: BookOpen },
  { name: 'Campaigns', path: '/campaigns', icon: Send },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({ status: 'checking', message: 'Checking API...' });
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const verifyApi = async () => {
      try {
        const data = await checkHealth();
        if (isMounted) {
          if (data.status === 'ok') {
            setApiStatus({ status: 'online', message: 'API Online' });
          } else {
            setApiStatus({ status: 'offline', message: 'API Offline' });
          }
        }
      } catch {
        if (isMounted) {
          setApiStatus({ status: 'offline', message: 'API Disconnected' });
        }
      }
    };

    verifyApi();
    const interval = setInterval(verifyApi, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const currentNavItem = navItems.find(item => item.path === location.pathname) || { name: 'Outly' };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-slate-200/80 flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none">Outly</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mt-0.5">Outreach Engine</span>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer - System Health */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>Backend API</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                apiStatus.status === 'online' ? 'bg-emerald-500 animate-pulse' : 
                apiStatus.status === 'offline' ? 'bg-rose-500' : 'bg-amber-500'
              }`} />
              <span className={`font-medium ${
                apiStatus.status === 'online' ? 'text-emerald-600' : 
                apiStatus.status === 'offline' ? 'text-rose-600' : 'text-amber-600'
              }`}>
                {apiStatus.message}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentNavItem.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              System Production Ready
            </span>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
