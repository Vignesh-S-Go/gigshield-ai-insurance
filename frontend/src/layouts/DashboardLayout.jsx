import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import useStore from '../store/useStore';

export default function DashboardLayout() {
  const { isAuthenticated, user, sidebarCollapsed, initializeData } = useStore();

  useEffect(() => {
    initializeData();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role?.toLowerCase() === 'worker') {
    return <Navigate to="/worker-dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 transition-colors duration-300">
      <Sidebar />
      <main className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
