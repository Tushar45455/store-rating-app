const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: false,
    references: {
      model: 'Stores',
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: 1,
        msg: 'Rating must be at least 1'
      },
      max: {
        args: 5,
        msg: 'Rating cannot exceed 5'
      }
    }
  }
}, {
  tableName: 'ratings',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'storeId'],
      name: 'unique_user_store_rating'
    }
  ]
});

module.exports = Rating;
