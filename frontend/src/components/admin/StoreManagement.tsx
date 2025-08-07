import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
}

interface StoresResponse {
  stores: Store[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

const StoreManagement: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [sorting, setSorting] = useState({
    sortBy: 'name',
    sortOrder: 'ASC'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    fetchStores();
  }, [filters, sorting, pagination.currentPage]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '10',
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        ...(filters.name && { name: filters.name }),
        ...(filters.email && { email: filters.email }),
        ...(filters.address && { address: filters.address })
      });

      const response = await axios.get(`/admin/stores?${params}`);
      const data: StoresResponse = response.data;
      
      setStores(data.stores);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalCount: data.totalCount
      });
      setError('');
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      setError('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleSort = (field: string) => {
    const newOrder = sorting.sortBy === field && sorting.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    setSorting({ sortBy: field, sortOrder: newOrder });
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, currentPage: page });
  };

  const getSortIcon = (field: string) => {
    if (sorting.sortBy !== field) return '↕️';
    return sorting.sortOrder === 'ASC' ? '⬆️' : '⬇️';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(Math.round(rating));
  };

  if (loading && stores.length === 0) {
    return <div className="loading">Loading stores...</div>;
  }

  return (
    <div className="store-management">
      <div className="page-header">
        <h2>Store Management</h2>
        <p>Manage all registered stores on the platform</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by email..."
            value={filters.email}
            onChange={(e) => handleFilterChange('email', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by address..."
            value={filters.address}
            onChange={(e) => handleFilterChange('address', e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchStores}>Retry</button>
        </div>
      )}

      {/* Stores Table */}
      {stores.length > 0 ? (
        <>
          <div className="table-container">
            <table className="stores-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>
                    Name {getSortIcon('name')}
                  </th>
                  <th onClick={() => handleSort('email')}>
                    Email {getSortIcon('email')}
                  </th>
                  <th onClick={() => handleSort('address')}>
                    Address {getSortIcon('address')}
                  </th>
                  <th onClick={() => handleSort('averageRating')}>
                    Rating {getSortIcon('averageRating')}
                  </th>
                  <th onClick={() => handleSort('totalRatings')}>
                    Total Reviews {getSortIcon('totalRatings')}
                  </th>
                  <th onClick={() => handleSort('createdAt')}>
                    Created {getSortIcon('createdAt')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td className="store-name">{store.name}</td>
                    <td>{store.email}</td>
                    <td className="store-address">{store.address}</td>
                    <td className="rating-cell">
                      <div className="rating-info">
                        <span className="rating-value">
                          {store.averageRating ? store.averageRating.toFixed(1) : 'N/A'}
                        </span>
                        {store.averageRating > 0 && (
                          <span className="rating-stars">
                            {getRatingStars(store.averageRating)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="total-ratings">
                      <span className="count">{store.totalRatings}</span>
                      <small>reviews</small>
                    </td>
                    <td>{formatDate(store.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Showing {stores.length} of {pagination.totalCount} stores
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        !loading && (
          <div className="no-data">
            <p>No stores found matching your criteria.</p>
            <button 
              className="create-store-btn"
              onClick={() => window.location.href = '/admin/create-store'}
            >
              Create Your First Store
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default StoreManagement;
