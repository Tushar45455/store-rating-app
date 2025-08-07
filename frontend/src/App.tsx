import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import StoreOwnerDashboard from './components/store/StoreOwnerDashboard';
import Navbar from './components/layout/Navbar';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode, allowedRoles: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Login />
          } />
          <Route path="/register" element={
            user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Register />
          } />
          
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['system_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/user/*" element={
            <ProtectedRoute allowedRoles={['normal_user']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/store-owner/*" element={
            <ProtectedRoute allowedRoles={['store_owner']}>
              <StoreOwnerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/unauthorized" element={
            <div className="unauthorized">
              <h2>Unauthorized</h2>
              <p>You don't have permission to access this page.</p>
            </div>
          } />
          
          <Route path="/" element={
            user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Navigate to="/login" replace />
          } />
          
          <Route path="*" element={
            <div className="not-found">
              <h2>Page Not Found</h2>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'system_admin':
      return '/admin';
    case 'normal_user':
      return '/user';
    case 'store_owner':
      return '/store-owner';
    default:
      return '/login';
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
