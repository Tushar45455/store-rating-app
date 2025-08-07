import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
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

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      validationErrors.push('Passwords do not match');
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

    // Client-side validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address
      });
      // Navigation is handled by App.tsx
    } catch (error: any) {
      if (error.message.includes('Validation failed')) {
        // Handle server-side validation errors
        setErrors([error.message]);
      } else {
        setErrors([error.message]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register for Store Rating System</h2>
        
        {errors.length > 0 && (
          <div className="error-messages">
            {errors.map((error, index) => (
              <div key={index} className="error-message">{error}</div>
            ))}
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
              placeholder="Enter your full name (20-60 characters)"
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
            />
            <small>8-16 characters, must include uppercase letter and special character</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="Enter your complete address (max 400 characters)"
            />
            <small>{formData.address.length}/400 characters</small>
          </div>

          <button type="submit" disabled={isLoading} className="auth-button">
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
