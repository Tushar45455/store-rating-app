import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';
import StoreManagement from './StoreManagement';
import CreateUser from './CreateUser';
import CreateStore from './CreateStore';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(getActiveTab(location.pathname));

  function getActiveTab(pathname: string): string {
    if (pathname.includes('/users')) return 'users';
    if (pathname.includes('/stores')) return 'stores';
    if (pathname.includes('/create-user')) return 'create-user';
    if (pathname.includes('/create-store')) return 'create-store';
    return 'dashboard';
  }

  React.useEffect(() => {
    setActiveTab(getActiveTab(location.pathname));
  }, [location.pathname]);

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h3>Admin Panel</h3>
        <nav className="admin-nav">
          <Link 
            to="/admin" 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </Link>
          <Link 
            to="/admin/users" 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </Link>
          <Link 
            to="/admin/stores" 
            className={`nav-link ${activeTab === 'stores' ? 'active' : ''}`}
            onClick={() => setActiveTab('stores')}
          >
            🏪 Store Management
          </Link>
          <Link 
            to="/admin/create-user" 
            className={`nav-link ${activeTab === 'create-user' ? 'active' : ''}`}
            onClick={() => setActiveTab('create-user')}
          >
            ➕ Create User
          </Link>
          <Link 
            to="/admin/create-store" 
            className={`nav-link ${activeTab === 'create-store' ? 'active' : ''}`}
            onClick={() => setActiveTab('create-store')}
          >
            ➕ Create Store
          </Link>
        </nav>
      </div>
      
      <div className="admin-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/stores" element={<StoreManagement />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/create-store" element={<CreateStore />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
