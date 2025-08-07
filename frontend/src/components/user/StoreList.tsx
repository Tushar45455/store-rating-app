import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  averageRating: number;
  totalRatings: number;
  userRating?: number;
}

const StoreList: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    address: ''
  });
  const [ratingModalStore, setRatingModalStore] = useState<Store | null>(null);
  const [newRating, setNewRating] = useState<number>(0);

  useEffect(() => {
    fetchStores();
  }, [searchFilters]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchFilters.name) params.append('name', searchFilters.name);
      if (searchFilters.address) params.append('address', searchFilters.address);

      const response = await axios.get(`/stores?${params}`);
      setStores(response.data.stores || response.data);
      setError('');
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      setError('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (field: string, value: string) => {
    setSearchFilters({ ...searchFilters, [field]: value });
  };

  const openRatingModal = (store: Store) => {
    setRatingModalStore(store);
    setNewRating(store.userRating || 0); // Start with 0 if no existing rating
  };

  const closeRatingModal = () => {
    setRatingModalStore(null);
    setNewRating(0); // Reset to 0 instead of 1
  };

  const submitRating = async () => {
    if (!ratingModalStore) return;
    
    // Validate that a rating has been selected (must be between 1-5)
    if (newRating < 1 || newRating > 5) {
      alert('Please select a rating from 1 to 5 stars');
      return;
    }

    try {
      await axios.post(`/stores/${ratingModalStore.id}/rate`, {
        rating: newRating
      });
      
      closeRatingModal();
      fetchStores(); // Refresh the stores list
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    }
  };

  const renderStars = (rating: number, clickable: boolean = false, onStarClick?: (star: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'} ${clickable ? 'clickable' : ''}`}
          onClick={() => clickable && onStarClick && onStarClick(i)}
        >
          {i <= rating ? '⭐' : '☆'}
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return <div className="loading">Loading stores...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="store-list">
      <div className="store-list-header">
        <h2>All Registered Stores</h2>
        <p>Browse and rate stores on the platform</p>
      </div>

      {/* Search Filters */}
      <div className="search-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by store name..."
            value={searchFilters.name}
            onChange={(e) => handleSearch('name', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by address..."
            value={searchFilters.address}
            onChange={(e) => handleSearch('address', e.target.value)}
          />
        </div>
      </div>

      {/* Stores List */}
      <div className="stores-grid">
        {stores.length === 0 ? (
          <div className="no-stores">
            <p>No stores found matching your criteria.</p>
          </div>
        ) : (
          stores.map((store) => (
            <div key={store.id} className="store-card">
              <div className="store-info">
                <h3 className="store-name">{store.name}</h3>
                <p className="store-address">{store.address}</p>
                
                <div className="store-ratings">
                  <div className="overall-rating">
                    <strong>Overall Rating:</strong>
                    <div className="rating-display">
                      {renderStars(Math.round(store.averageRating || 0))}
                      <span>({store.averageRating?.toFixed(1) || 'N/A'})</span>
                    </div>
                  </div>
                  
                  {store.userRating && (
                    <div className="user-rating">
                      <strong>Your Rating:</strong>
                      <div className="rating-display">
                        {renderStars(store.userRating)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="store-actions">
                <button 
                  className={`rate-button ${store.userRating ? 'modify' : 'submit'}`}
                  onClick={() => openRatingModal(store)}
                >
                  {store.userRating ? 'Modify Rating' : 'Submit Rating'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rating Modal */}
      {ratingModalStore && (
        <div className="modal-overlay" onClick={closeRatingModal}>
          <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rate {ratingModalStore.name}</h3>
              <button className="close-button" onClick={closeRatingModal}>×</button>
            </div>
            
            <div className="modal-body">
              <p>Select your rating (1-5 stars):</p>
              <div className="rating-selector">
                {renderStars(newRating, true, setNewRating)}
              </div>
              {newRating > 0 ? (
                <p className="rating-text">Your rating: {newRating} out of 5 stars</p>
              ) : (
                <p className="rating-text">Please click on a star to select your rating</p>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeRatingModal}>
                Cancel
              </button>
              <button 
                className="submit-button" 
                onClick={submitRating}
                disabled={newRating === 0}
                style={{ opacity: newRating === 0 ? 0.5 : 1 }}
              >
                {ratingModalStore.userRating ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreList;
