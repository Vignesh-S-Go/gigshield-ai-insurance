import {
  Brain,
  ChevronLeft, ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  Moon,
  Shield,
  Smartphone,
  Sun,
  Users,
  Wallet,
  Zap,
  Activity,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/users', icon: Users, label: 'Users' },
  { path: '/workers', icon: Users, label: 'Workers' },
  { path: '/policies', icon: FileText, label: 'Policies' },
  { path: '/claims', icon: Zap, label: 'Claims' },
  { path: '/zeroclaim', icon: Zap, label: 'ZeroClaim Live' },
  { path: '/ai-insights', icon: Brain, label: 'AI Insights' },
  { path: '/payouts', icon: Wallet, label: 'Payouts' },
  { path: '/zone-risk', icon: Map, label: 'Zone Risk' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, darkMode, toggleDarkMode, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={`glass-sidebar fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}`}>
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-dark-200/50 dark:border-dark-700/50 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/25">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="animate-fade-in">
            <h1 className="text-base font-bold text-dark-900 dark:text-white tracking-tight">ZeroClaim</h1>
            <p className="text-[10px] text-dark-400 dark:text-dark-500 font-medium tracking-wider uppercase">Insurance that pays before you ask.</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'text-dark-500 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-white'
              } ${sidebarCollapsed ? 'justify-center' : ''}`
            }
            title={sidebarCollapsed ? label : ''}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="animate-fade-in">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 space-y-1 border-t border-dark-200/50 dark:border-dark-700/50">
        <button
          onClick={toggleDarkMode}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200 text-dark-500 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 ${sidebarCollapsed ? 'justify-center' : ''}`}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!sidebarCollapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-600/10 ${sidebarCollapsed ? 'justify-center' : ''}`}
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>

        <button
          onClick={toggleSidebar}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 ${sidebarCollapsed ? 'justify-center' : ''}`}
          title={sidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
