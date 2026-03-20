import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WorkersPage from './pages/WorkersPage';
import WorkerDetailPage from './pages/WorkerDetailPage';
import PoliciesPage from './pages/PoliciesPage';
import ClaimsPage from './pages/ClaimsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import PayoutsPage from './pages/PayoutsPage';
import ZoneRiskPage from './pages/ZoneRiskPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
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
