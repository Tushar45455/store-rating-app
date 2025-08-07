import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Store {
  id: number;
  name: string;
}

const CreateUser: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'normal_user',
    storeId: ''
  });
  const [stores, setStores] = useState<Store[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (formData.role === 'store_owner') {
      fetchAvailableStores();
    }
  }, [formData.role]);

  const fetchAvailableStores = async () => {
    try {
      const response = await axios.get('/admin/stores?limit=100'); // Get all stores
      setStores(response.data.stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
    if (success) {
      setSuccess('');
    }
  };

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    // Name validation
    if (formData.name.length < 20 || formData.name.length > 60) {
      validationErrors.push('Name must be between 20 and 60 characters');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      validationErrors.push('Please provide a valid email address');
    }

    // Password validation
    if (formData.password.length < 8 || formData.password.length > 16) {
      validationErrors.push('Password must be between 8 and 16 characters');
    }
    if (!/(?=.*[A-Z])/.test(formData.password)) {
      validationErrors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) {
      validationErrors.push('Password must contain at least one special character');
    }

    // Address validation
    if (formData.address.length > 400) {
      validationErrors.push('Address cannot exceed 400 characters');
    }
    if (formData.address.length === 0) {
      validationErrors.push('Address is required');
    }

    // Store owner validation
    if (formData.role === 'store_owner' && !formData.storeId) {
      validationErrors.push('Store selection is required for store owners');
    }

    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    setSuccess('');

    // Client-side validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        role: formData.role,
        ...(formData.role === 'store_owner' && { storeId: parseInt(formData.storeId) })
      };

      await axios.post('/admin/users', submitData);
      
      setSuccess('User created successfully!');
      setFormData({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'normal_user',
        storeId: ''
      });
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors.map((err: any) => err.message));
      } else {
        setErrors([error.response?.data?.message || 'Failed to create user']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-user">
      <div className="page-header">
        <h2>Create New User</h2>
        <p>Add a new user to the system</p>
      </div>

      <div className="form-container">
        {errors.length > 0 && (
          <div className="error-messages">
            {errors.map((error, index) => (
              <div key={index} className="error-message">{error}</div>
            ))}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={20}
              maxLength={60}
              placeholder="Enter full name (20-60 characters)"
            />
            <small>Must be between 20 and 60 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              maxLength={16}
              placeholder="Enter password"
            />
            <small>8-16 characters, must include uppercase letter and special character</small>
          </div>

          <div className="form-group">
            <label htmlFor="role">User Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="normal_user">Normal User</option>
              <option value="store_owner">Store Owner</option>
              <option value="system_admin">System Administrator</option>
            </select>
          </div>

          {formData.role === 'store_owner' && (
            <div className="form-group">
              <label htmlFor="storeId">Assign Store *</label>
              <select
                id="storeId"
                name="storeId"
                value={formData.storeId}
                onChange={handleChange}
                required
              >
                <option value="">Select a store...</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              {stores.length === 0 && (
                <small>No available stores. Please create a store first.</small>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              maxLength={400}
              rows={3}
              placeholder="Enter complete address (max 400 characters)"
            />
            <small>{formData.address.length}/400 characters</small>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading ? 'Creating User...' : 'Create User'}
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
