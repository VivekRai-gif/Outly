import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
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
  BookOpen,
  LogOut,
  Home,
  ChevronDown
} from 'lucide-react';
import { checkHealth } from '../services/api';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true },
  { name: 'Upload PDF', path: '/dashboard/upload', icon: FileUp },
  { name: 'Contacts', path: '/dashboard/contacts', icon: Users },
  { name: 'Templates', path: '/dashboard/templates', icon: BookOpen },
  { name: 'Campaigns', path: '/dashboard/campaigns', icon: Send },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({ status: 'checking', message: 'Checking API...' });
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const currentNavItem = navItems.find(item => 
    item.end ? location.pathname === item.path : location.pathname.startsWith(item.path)
  ) || { name: 'Outly Dashboard' };

  return (
    <div className="min-h-screen flex bg-[#020202] text-[#F5F5F5] font-sans selection:bg-white selection:text-black">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[#0E0E0E] border-r border-white/10 flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Outly Logo" className="w-8 h-8 object-contain rounded-lg transition-transform group-hover:scale-105" />
            <div>
              <span className="font-bold text-lg text-[#FBFBFC] tracking-tight block leading-none">Outly</span>
              <span className="text-[10px] text-[#A0A0A0] font-medium uppercase tracking-wider block mt-0.5">Outreach Engine</span>
            </div>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-[#777777] hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Main Page Navigation Button */}
        <div className="px-3 pt-3">
          <Link
            to="/"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1B1A] hover:bg-[#262626] border border-white/10 text-xs font-medium text-[#A0A0A0] hover:text-white transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-[#777777]" />
            <span>Visit Main Landing Page</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive 
                    ? 'bg-[#1A1B1A] text-white font-semibold border border-white/15 shadow-xs' 
                    : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-[#777777]'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer - System Health */}
        <div className="p-4 border-t border-white/10 bg-[#0E0E0E]">
          <div className="flex items-center justify-between text-xs text-[#777777]">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#555555]" />
              <span>Backend API</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                apiStatus.status === 'online' ? 'bg-white animate-pulse' : 'bg-[#777777]'
              }`} />
              <span className="font-medium text-[#A0A0A0]">
                {apiStatus.message}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#020202]">
        {/* Header Bar */}
        <header className="h-16 bg-[#0E0E0E] border-b border-white/10 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#A0A0A0] hover:text-white hover:bg-white/10 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-[#FBFBFC] tracking-tight">
              {currentNavItem.name}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-[#A0A0A0] border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              Monochromatic Engine
            </span>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#1A1B1A] border border-white/20 flex items-center justify-center overflow-hidden text-white font-bold text-xs">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                  )}
                </div>
                <div className="hidden md:block text-left pr-1">
                  <p className="text-xs font-semibold text-[#FBFBFC] leading-none">{user?.name || 'Vivek Rai'}</p>
                  <p className="text-[10px] text-[#A0A0A0] font-medium leading-none mt-1">{user?.email || 'user@outly.ai'}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#777777]" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-[#1A1B1A] border border-white/10 rounded-xl shadow-2xl py-1 z-50 text-xs text-[#F5F5F5]"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="font-semibold text-white">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-[#A0A0A0] truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-[#262626] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#777777]" />
                    <span>Account Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-white hover:bg-[#262626] transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#777777]" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
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
