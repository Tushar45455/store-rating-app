import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'system_admin':
        return 'System Administrator';
      case 'normal_user':
        return 'User';
      case 'store_owner':
        return 'Store Owner';
      default:
        return role;
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>Store Rating System</h2>
        </div>
        
        {user && (
          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{getRoleDisplayName(user.role)}</span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
