import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Dashboards
import AdminDashboard from './pages/dashboards/AdminDashboard';
import InventoryDashboard from './pages/dashboards/InventoryDashboard';
import SalesDashboard from './pages/dashboards/SalesDashboard';
import SupportDashboard from './pages/dashboards/SupportDashboard';
import AnalystDashboard from './pages/dashboards/AnalystDashboard';

// Core & AI Pages
import AIBusinessActionCenter from './pages/AIBusinessActionCenter';
import UnifiedIdentityEngine from './pages/UnifiedIdentityEngine';
import AIPredictions from './pages/AIPredictions';
import CustomerManagement from './pages/CustomerManagement';
import ProductManagement from './pages/ProductManagement';
import InventoryManagement from './pages/InventoryManagement';
import OrderManagement from './pages/OrderManagement';
import ReturnsManagement from './pages/ReturnsManagement';
import CustomerSupport from './pages/CustomerSupport';
import WhatIfSimulator from './pages/WhatIfSimulator';
import UserManagement from './pages/UserManagement';
import SettingsPage from './pages/SettingsPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="p-8 text-center bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl max-w-md mx-auto mt-12 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center mb-3">
          !
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Access Restricted</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Your role (<strong className="text-teal-400">{role}</strong>) does not have authorization to view this module.
        </p>
      </div>
    );
  }

  return children;
};

// Root Dashboard Redirector based on user role
const RootRedirector = () => {
  const { user, loading, getDashboardPath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user.role)} replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Protected App Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<RootRedirector />} />

                {/* Role Specific Dashboards */}
                <Route
                  path="dashboards/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="dashboards/inventory"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'inventory_manager', 'analyst']}>
                      <InventoryDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="dashboards/sales"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'sales_manager', 'analyst']}>
                      <SalesDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="dashboards/support"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'support_staff', 'sales_manager']}>
                      <SupportDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="dashboards/analyst"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'analyst', 'sales_manager']}>
                      <AnalystDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* AI Innovations & Core Modules */}
                <Route path="action-center" element={<AIBusinessActionCenter />} />
                <Route path="identity-engine" element={<UnifiedIdentityEngine />} />
                <Route path="predictions" element={<AIPredictions />} />
                <Route path="customers" element={<CustomerManagement />} />
                <Route path="customers/:id" element={<CustomerManagement />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="returns" element={<ReturnsManagement />} />
                <Route path="support-tickets" element={<CustomerSupport />} />
                <Route path="what-if-simulator" element={<WhatIfSimulator />} />
                <Route
                  path="users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
