const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: {
        args: [20, 60],
        msg: 'Name must be between 20 and 60 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isStrongPassword(value) {
        if (value.length < 8 || value.length > 16) {
          throw new Error('Password must be between 8 and 16 characters');
        }
        if (!/(?=.*[A-Z])/.test(value)) {
          throw new Error('Password must contain at least one uppercase letter');
        }
        if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(value)) {
          throw new Error('Password must contain at least one special character');
        }
      }
    }
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
    validate: {
      len: {
        args: [1, 400],
        msg: 'Address cannot exceed 400 characters'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('system_admin', 'normal_user', 'store_owner'),
    allowNull: false,
    defaultValue: 'normal_user'
  },
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Stores',
      key: 'id'
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
