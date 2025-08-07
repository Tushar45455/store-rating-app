import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Rating {
  id: number;
  rating: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface StoreStats {
  averageRating: number;
  totalRatings: number;
  ratings: Rating[];
}

const StoreOwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user?.storeId) {
      fetchStoreStats();
    }
  }, [user]);

  const fetchStoreStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/stores/${user?.storeId}/ratings`);
      setStoreStats(response.data);
      setError('');
    } catch (error: any) {
      console.error('Error fetching store stats:', error);
      setError('Failed to load store statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (!user?.storeId) {
    return (
      <div className="store-owner-dashboard">
        <div className="error-message">
          <h2>No Store Associated</h2>
          <p>You are not associated with any store. Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading store statistics...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchStoreStats} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="store-owner-dashboard">
      <div className="dashboard-header">
        <h2>Store Owner Dashboard</h2>
        <p>Manage your store and view customer feedback</p>
      </div>

      <div className="dashboard-content">
        {/* Store Rating Overview */}
        <div className="stats-section">
          <div className="stat-card large">
            <div className="stat-icon">⭐</div>
            <div className="stat-details">
              <h3>Average Rating of Your Store</h3>
              <div className="rating-display">
                <span className="rating-number">{storeStats?.averageRating?.toFixed(1) || 'N/A'}</span>
                <span className="rating-stars">
                  {storeStats?.averageRating ? renderStars(Math.round(storeStats.averageRating)) : 'No ratings yet'}
                </span>
              </div>
              <small>Based on {storeStats?.totalRatings || 0} customer reviews</small>
            </div>
          </div>
        </div>

        {/* User Ratings List */}
        <div className="ratings-section">
          <h3>Users Who Have Submitted Ratings</h3>
          
          {!storeStats?.ratings || storeStats.ratings.length === 0 ? (
            <div className="no-ratings">
              <p>No ratings have been submitted for your store yet.</p>
              <small>Encourage your customers to leave reviews!</small>
            </div>
          ) : (
            <div className="ratings-table">
              <table>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Date Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {storeStats.ratings.map((rating) => (
                    <tr key={rating.id}>
                      <td>{rating.user.name}</td>
                      <td>{rating.user.email}</td>
                      <td>
                        <div className="rating-cell">
                          <span className="rating-stars">{renderStars(rating.rating)}</span>
                          <span className="rating-number">({rating.rating}/5)</span>
                        </div>
                      </td>
                      <td>{formatDate(rating.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{storeStats?.totalRatings || 0}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {storeStats?.ratings ? 
                  Math.max(...storeStats.ratings.map(r => r.rating)) : 'N/A'}
              </div>
              <div className="stat-label">Highest Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {storeStats?.ratings ? 
                  Math.min(...storeStats.ratings.map(r => r.rating)) : 'N/A'}
              </div>
              <div className="stat-label">Lowest Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
