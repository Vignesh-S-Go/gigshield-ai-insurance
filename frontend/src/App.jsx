import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import DashboardLayout from './layouts/DashboardLayout';
import AIInsightsPage from './pages/AIInsightsPage';
import ClaimsPage from './pages/ClaimsPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import PayoutsPage from './pages/PayoutsPage';
import PoliciesPage from './pages/PoliciesPage';
import WorkerApp from './pages/WorkerApp';
import WorkerDetailPage from './pages/WorkerDetailPage';
import WorkersPage from './pages/WorkersPage';
import ZoneRiskPage from './pages/ZoneRiskPage';
import useStore from './store/useStore';

export default function App() {
  const { darkMode } = useStore();

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
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/worker-app" element={<WorkerApp />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="/workers/:id" element={<WorkerDetailPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/claims" element={<ClaimsPage />} />
          <Route path="/ai-insights" element={<AIInsightsPage />} />
          <Route path="/payouts" element={<PayoutsPage />} />
          <Route path="/zone-risk" element={<ZoneRiskPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
