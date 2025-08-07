import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import StoreList from './StoreList';
import Profile from './Profile';
import './UserDashboard.css';

const UserDashboard: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(getActiveTab(location.pathname));

  function getActiveTab(pathname: string): string {
    if (pathname.includes('/profile')) return 'profile';
    return 'stores';
  }

  React.useEffect(() => {
    setActiveTab(getActiveTab(location.pathname));
  }, [location.pathname]);

  return (
    <div className="user-dashboard">
      <div className="user-sidebar">
        <h3>User Panel</h3>
        <nav className="user-nav">
          <Link 
            to="/user" 
            className={`nav-link ${activeTab === 'stores' ? 'active' : ''}`}
            onClick={() => setActiveTab('stores')}
          >
            🏪 Browse Stores
          </Link>
          <Link 
            to="/user/profile" 
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 My Profile
          </Link>
        </nav>
      </div>
      
      <div className="user-content">
        <Routes>
          <Route path="/" element={<StoreList />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
};

export default UserDashboard;
