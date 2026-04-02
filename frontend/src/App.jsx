import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import DashboardLayout from './layouts/DashboardLayout';
import AIInsightsPage from './pages/AIInsightsPage';
import ClaimsPage from './pages/ClaimsPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import PayoutsPage from './pages/PayoutsPage';
import ProfilePage from './pages/ProfilePage';
import SignupPage from './pages/SignupPage';
import SmartPolicyPage from './pages/SmartPolicyPage';
import UserManagementPage from './pages/UserManagementPage';
import WorkerApp from './pages/WorkerApp';
import WorkerDetailPage from './pages/WorkerDetailPage';
import WorkersPage from './pages/WorkersPage';
import ZoneRiskPage from './pages/ZoneRiskPage';
import useStore from './store/useStore';

import LiveAlertSystem from './components/LiveAlertSystem';

export default function App() {
  const { darkMode, isAuthenticated, user } = useStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <LiveAlertSystem />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={user?.role?.toLowerCase() === 'worker' ? '/worker-dashboard' : '/dashboard'} />} />
        <Route path="/signup" element={!isAuthenticated ? <SignupPage /> : <Navigate to={user?.role?.toLowerCase() === 'worker' ? '/worker-dashboard' : '/dashboard'} />} />

        <Route path="/worker-dashboard" element={isAuthenticated ? <WorkerApp /> : <Navigate to="/login" />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="/workers/:id" element={<WorkerDetailPage />} />
          <Route path="/policies" element={<SmartPolicyPage />} />
          <Route path="/claims" element={<ClaimsPage />} />
          <Route path="/ai-insights" element={<AIInsightsPage />} />
          <Route path="/payouts" element={<PayoutsPage />} />
          <Route path="/zone-risk" element={<ZoneRiskPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
