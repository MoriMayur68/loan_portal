import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Sidebar from './components/Sidebar';
import AdminLogin from './pages/Login';
import Dashboard from './pages/Dashboard';
import Loans from './pages/Loans';
import LoanDetail from './pages/LoanDetail';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Reports from './pages/Reports';

const ProtectedAdminRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  return admin ? children : <Navigate to="/login" />;
};

const AuthRoute = ({ children }) => {
  const { admin } = useAdminAuth();
  return admin ? <Navigate to="/dashboard" /> : children;
};

const AdminLayout = ({ children }) => (
  <div className="admin-layout">
    <Sidebar />
    <div className="admin-main">
      <div className="topbar">
        <div className="topbar-title">Loan Management & Risk Portal</div>
        <div className="topbar-right">
          <span className="badge badge-active">Admin Operations</span>
        </div>
      </div>
      <main className="admin-content">{children}</main>
    </div>
  </div>
);

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthRoute><AdminLogin /></AuthRoute>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedAdminRoute>
            <AdminLayout><Dashboard /></AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/loans"
        element={
          <ProtectedAdminRoute>
            <AdminLayout><Loans /></AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/loans/:id"
        element={
          <ProtectedAdminRoute>
            <AdminLayout><LoanDetail /></AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedAdminRoute>
            <AdminLayout><Users /></AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedAdminRoute>
            <AdminLayout><Payments /></AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedAdminRoute>
            <AdminLayout><Reports /></AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AdminRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d1120',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '0.875rem',
            },
          }}
        />
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
