const { User, Store, Rating } = require('../models');
const { Op } = require('sequelize');

// Helper function to handle case-insensitive search across databases
const getCaseInsensitiveOperator = () => {
  const dbDialect = process.env.DB_DIALECT || 'postgres';
  return dbDialect === 'sqlite' ? Op.like : Op.iLike;
};

// Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.count({ where: { role: { [Op.ne]: 'system_admin' } } }),
      Store.count(),
      Rating.count()
    ]);

    res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new user (admin/normal/store owner)
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role, storeId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // If creating store owner, verify store exists and doesn't have an owner
    if (role === 'store_owner') {
      if (!storeId) {
        return res.status(400).json({ message: 'Store ID is required for store owners' });
      }

      const store = await Store.findByPk(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }

      const existingOwner = await User.findOne({ where: { storeId } });
      if (existingOwner) {
        return res.status(400).json({ message: 'Store already has an owner' });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      address,
      role,
      storeId: role === 'store_owner' ? storeId : null
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        storeId: user.storeId
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new store
const createStore = async (req, res) => {
  try {
    const { name, email, address } = req.body;

    // Check if store already exists with same email
    const existingStore = await Store.findOne({ where: { email } });
    if (existingStore) {
      return res.status(400).json({ message: 'Store already exists with this email' });
    }

    // Create store
    const store = await Store.create({
      name,
      email,
      address
    });

    res.status(201).json({
      message: 'Store created successfully',
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: store.averageRating,
        totalRatings: store.totalRatings
      }
    });
  } catch (error) {
    console.error('Create store error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all stores with filtering and sorting
const getStores = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'ASC',
      name,
      email,
      address
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};
    const caseInsensitiveOp = getCaseInsensitiveOperator();

    // Apply filters
    if (name) {
      whereClause.name = { [caseInsensitiveOp]: `%${name}%` };
    }
    if (email) {
      whereClause.email = { [caseInsensitiveOp]: `%${email}%` };
    }
    if (address) {
      whereClause.address = { [caseInsensitiveOp]: `%${address}%` };
    }

    const { count, rows } = await Store.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      stores: rows,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all users with filtering and sorting
const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'ASC',
      name,
      email,
      address,
      role
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      role: { [Op.ne]: 'system_admin' } // Exclude system admins from user list
    };
    const caseInsensitiveOp = getCaseInsensitiveOperator();

    // Apply filters
    if (name) {
      whereClause.name = { [caseInsensitiveOp]: `%${name}%` };
    }
    if (email) {
      whereClause.email = { [caseInsensitiveOp]: `%${email}%` };
    }
    if (address) {
      whereClause.address = { [caseInsensitiveOp]: `%${address}%` };
    }
    if (role && role !== 'all') {
      whereClause.role = role;
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'ownedStore',
          attributes: ['id', 'name', 'averageRating'],
          required: false
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      users: rows,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user details by ID
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'ownedStore',
          attributes: ['id', 'name', 'averageRating'],
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow viewing system admin details
    if (user.role === 'system_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getDashboardStats,
  createUser,
  createStore,
  getStores,
  getUsers,
  getUserDetails
};
