import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: string;
  createdAt: string;
  ownedStore?: {
    id: number;
    name: string;
    averageRating: number;
  };
}

interface UsersResponse {
  users: User[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: 'all'
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [filters, sorting, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '10',
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        ...(filters.name && { name: filters.name }),
        ...(filters.email && { email: filters.email }),
        ...(filters.address && { address: filters.address }),
        ...(filters.role !== 'all' && { role: filters.role })
      });

      const response = await axios.get(`/admin/users?${params}`);
      const data: UsersResponse = response.data;
      
      setUsers(data.users);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalCount: data.totalCount
      });
      setError('');
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
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

  const viewUserDetails = async (userId: number) => {
    try {
      const response = await axios.get(`/admin/users/${userId}`);
      setSelectedUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const getSortIcon = (field: string) => {
    if (sorting.sortBy !== field) return '↕️';
    return sorting.sortOrder === 'ASC' ? '⬆️' : '⬇️';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && users.length === 0) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h2>User Management</h2>
        <p>Manage all registered users on the platform</p>
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
        <div className="filter-group">
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="normal_user">Normal Users</option>
            <option value="store_owner">Store Owners</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchUsers}>Retry</button>
        </div>
      )}

      {/* Users Table */}
      {users.length > 0 ? (
        <>
          <div className="table-container">
            <table className="users-table">
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
                  <th onClick={() => handleSort('role')}>
                    Role {getSortIcon('role')}
                  </th>
                  <th>Store Rating</th>
                  <th onClick={() => handleSort('createdAt')}>
                    Joined {getSortIcon('createdAt')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {user.ownedStore ? (
                        <div className="store-rating">
                          <span>{user.ownedStore.name}</span>
                          <span className="rating">⭐ {user.ownedStore.averageRating || 'N/A'}</span>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <button 
                        className="action-btn view"
                        onClick={() => viewUserDetails(user.id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Showing {users.length} of {pagination.totalCount} users
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
            <p>No users found matching your criteria.</p>
          </div>
        )
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>User Details</h3>
            <div className="user-details">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Address:</strong> {selectedUser.address}</p>
              <p><strong>Role:</strong> {selectedUser.role.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Joined:</strong> {formatDate(selectedUser.createdAt)}</p>
              {selectedUser.ownedStore && (
                <div>
                  <p><strong>Owned Store:</strong> {selectedUser.ownedStore.name}</p>
                  <p><strong>Store Rating:</strong> ⭐ {selectedUser.ownedStore.averageRating || 'No ratings yet'}</p>
                </div>
              )}
            </div>
            <button 
              className="close-modal"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
