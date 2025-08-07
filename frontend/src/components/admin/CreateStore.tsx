import React, { useState } from 'react';
import axios from 'axios';

const CreateStore: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      validationErrors.push('Store name must be between 20 and 60 characters');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      validationErrors.push('Please provide a valid email address');
    }

    // Address validation
    if (formData.address.length > 400) {
      validationErrors.push('Address cannot exceed 400 characters');
    }
    if (formData.address.length === 0) {
      validationErrors.push('Address is required');
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
      await axios.post('/admin/stores', formData);
      
      setSuccess('Store created successfully!');
      setFormData({
        name: '',
        email: '',
        address: ''
      });
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors.map((err: any) => err.message));
      } else {
        setErrors([error.response?.data?.message || 'Failed to create store']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-store">
      <div className="page-header">
        <h2>Create New Store</h2>
        <p>Add a new store to the platform</p>
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
            <label htmlFor="name">Store Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={20}
              maxLength={60}
              placeholder="Enter store name (20-60 characters)"
            />
            <small>Must be between 20 and 60 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="email">Store Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter store email address"
            />
            <small>This will be used for store communications</small>
          </div>

          <div className="form-group">
            <label htmlFor="address">Store Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              maxLength={400}
              rows={4}
              placeholder="Enter complete store address (max 400 characters)"
            />
            <small>{formData.address.length}/400 characters</small>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading ? 'Creating Store...' : 'Create Store'}
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

        <div className="info-box">
          <h4>ℹ️ Next Steps</h4>
          <p>After creating the store:</p>
          <ul>
            <li>You can assign a store owner from the "Create User" section</li>
            <li>The store will be available for users to rate</li>
            <li>Store owners can view their dashboard and customer ratings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateStore;
