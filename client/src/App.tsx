import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './components/admin/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import HoldingsPage from './pages/admin/HoldingsPage';
import AddHoldingPage from './pages/admin/AddHoldingPage';
import EditHoldingPage from './pages/admin/EditHoldingPage';
import PerformancePage from './pages/admin/PerformancePage';
import SettingsPage from './pages/admin/SettingsPage';
import PreviewPage from './pages/admin/PreviewPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import PublicPortfolioPage from './pages/PublicPortfolioPage';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<PublicPortfolioPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/admin" replace /> : <LoginPage />} />

      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="holdings" element={<HoldingsPage />} />
        <Route path="holdings/new" element={<AddHoldingPage />} />
        <Route path="holdings/:ticker/edit" element={<EditHoldingPage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="preview" element={<PreviewPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
