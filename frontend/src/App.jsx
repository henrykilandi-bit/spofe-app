import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import login-pageComponent from '@/pages/login-page';
import RegisterPageComponent from '@/pages/register-page-extended';
import guide-inscription from '@/pages/guide-inscription';
import FAQPage from '@/pages/FAQPage';
import two-factor-auth-page from '@/pages/two-factor-auth-page';
import dashboard-page from '@/pages/dashboard-page';
import chart-of-accountsPage from '@/pages/chart-of-accounts';
import journal-entriesPage from '@/pages/journal-entries';
import financial-reportsPage from '@/pages/financial-reports';
import approval-list from '@/pages/approval-list';
import approval-detail from '@/pages/approval-detail';
import UserApprovalDashboard from '@/pages/dashboard/UserApprovalDashboard';
import banking-connections from '@/pages/banking-connections';
import bank-reconciliation from '@/pages/bank-reconciliation';
import UsersPage from '@/pages/Users';
import apiClient from '@/services/api.config';
import { NotificationCenter } from '@/components/NotificationCenter';

// ============================================================================
// COMPONENTS
// ============================================================================

// Login Page - Utilise maintenant le composant complet depuis pages/LoginPage.jsx
// Le composant contient :
// - Formulaire de connexion complètement stylisé
// - Support 2FA intégré
// - Animations et responsive design
// - Messages d'erreur/succès professionnels
function LoginPageWrapper() {
  return <LoginPageComponent />;
}

// ============================================================================
// HEADER & SIDEBAR
// ============================================================================

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">SPOFE</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-6">
      <nav className="space-y-4">
        <a href="/dashboard" className="block px-4 py-2 rounded-md hover:bg-gray-800 transition">
          📊 Dashboard
        </a>
        <a href="/chart-of-accounts" className="block px-4 py-2 rounded-md hover:bg-gray-800 transition">
          📑 Chart of Accounts
        </a>
        <a href="/journal-entries" className="block px-4 py-2 rounded-md hover:bg-gray-800 transition">
          📝 Journal Entries
        </a>
        <a href="/financial-reports" className="block px-4 py-2 rounded-md hover:bg-gray-800 transition">
          📈 Financial Reports
        </a>
        <a href="/users" className="block px-4 py-2 rounded-md hover:bg-gray-800 transition">
          👥 Users
        </a>
      </nav>
    </aside>
  );
}

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// PRIVATE ROUTE
// ============================================================================

function PrivateRoute({ children }) {
  const { token, loading } = useAuthContext();
  const localToken = localStorage.getItem('authToken') || localStorage.getItem('token');

  console.log('[PrivateRoute] Check - token:', !!token, 'localToken:', !!localToken, 'loading:', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // ✅ Si pas de token ET pas de localToken, rediriger à login
  if (!token && !localToken) {
    console.log('[PrivateRoute] ❌ No token - redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('[PrivateRoute] ✅ Authenticated - rendering layout');
  return <Layout>{children}</Layout>;
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-red-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Oops! Something went wrong</h1>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function AppContent() {
  const { loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <NotificationCenter position="top-right" maxVisible={5} />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
        <Route path="/login" element={<LoginPageWrapper />} />
        <Route path="/register" element={<RegisterPageComponent />} />
        <Route path="/register-extended" element={<RegisterPageComponent />} />
        <Route path="/guide" element={<GuideInscription />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/two-factor-auth" element={<TwoFactorAuthPage />} />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/chart-of-accounts"
          element={
            <PrivateRoute>
              <ChartOfAccountsPage />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/journal-entries"
          element={
            <PrivateRoute>
              <JournalEntriesPage />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/financial-reports"
          element={
            <PrivateRoute>
              <FinancialReportsPage />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UsersPage />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/approvals"
          element={
            <PrivateRoute>
              <ApprovalList />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/approvals/:id"
          element={
            <PrivateRoute>
              <ApprovalDetail />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/banking/connections"
          element={
            <PrivateRoute>
              <BankingConnections />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/banking/reconciliation"
          element={
            <PrivateRoute>
              <BankReconciliation />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/admin/approvals"
          element={
            <PrivateRoute>
              <UserApprovalDashboard />
            </PrivateRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
