import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import useStore from '../store/useStore';

export default function DashboardLayout() {
  const { isAuthenticated, sidebarCollapsed } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 transition-colors duration-300">
      <Sidebar />
      <main className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <div className="p-6 lg:p-8 max-w-[1600px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
