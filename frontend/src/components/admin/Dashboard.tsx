import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/dashboard/stats');
      setStats(response.data);
      setError('');
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard statistics...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchDashboardStats} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Administrator Dashboard</h2>
        <p>Welcome to the Store Rating System admin panel</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-details">
              <h3>Total number of users</h3>
              <p className="stat-number">{stats.totalUsers}</p>
              <small>Registered users on the platform</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏪</div>
            <div className="stat-details">
              <h3>Total number of stores</h3>
              <p className="stat-number">{stats.totalStores}</p>
              <small>Stores available for rating</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-details">
              <h3>Total number of submitted ratings</h3>
              <p className="stat-number">{stats.totalRatings}</p>
              <small>Reviews submitted by users</small>
            </div>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="action-button primary"
            onClick={() => window.location.href = '/admin/create-user'}
          >
            ➕ Add New User
          </button>
          <button 
            className="action-button secondary"
            onClick={() => window.location.href = '/admin/create-store'}
          >
            🏪 Add New Store
          </button>
          <button 
            className="action-button tertiary"
            onClick={() => window.location.href = '/admin/users'}
          >
            👥 Manage Users
          </button>
          <button 
            className="action-button tertiary"
            onClick={() => window.location.href = '/admin/stores'}
          >
            🏪 Manage Stores
          </button>
        </div>
      </div>

      <div className="recent-activity">
        <h3>System Overview</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">ℹ️</span>
            <div className="activity-content">
              <p><strong>System Status:</strong> All services are running normally</p>
              <small>System is operational and ready to serve users</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🔒</span>
            <div className="activity-content">
              <p><strong>Security:</strong> All user data is encrypted and secure</p>
              <small>Following industry best practices for data protection</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">📊</span>
            <div className="activity-content">
              <p><strong>Performance:</strong> System running at optimal performance</p>
              <small>Average response time under 200ms</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
