const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { sequelize, testConnection } = require('./src/config/database');
const { User, Store, Rating } = require('./src/models');

// Import routes
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const storeRoutes = require('./src/routes/stores');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Store Rating API'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'Duplicate entry found',
      errors: error.errors.map(err => ({
        field: err.path,
        message: `${err.path} must be unique`
      }))
    });
  }

  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Database initialization and server startup
const initializeApp = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized successfully');
    
    // Create default admin user if not exists
    await createDefaultAdmin();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Create default system administrator
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ 
      where: { role: 'system_admin' } 
    });
    
    if (!adminExists) {
      await User.create({
        name: 'System Administrator User Account',
        email: 'admin@storerating.com',
        password: 'Admin@123',
        address: '123 Admin Street, System City, SC 12345',
        role: 'system_admin'
      });
      
      console.log('Default admin user created:');
      console.log('Email: admin@storerating.com');
      console.log('Password: Admin@123');
      console.log('Please change this password after first login!');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Gracefully shutting down...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Gracefully shutting down...');
  await sequelize.close();
  process.exit(0);
});

// Initialize the application
initializeApp();

module.exports = app;
