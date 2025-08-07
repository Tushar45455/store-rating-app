const { Sequelize } = require('sequelize');
const path = require('path');

// Load .env from the backend directory
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Use PostgreSQL or MySQL as specified in coding challenge
const dbDialect = process.env.DB_DIALECT || 'postgres'; // postgres, mysql, or sqlite

console.log('Database Configuration:');
console.log('DB_DIALECT:', dbDialect);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);

let sequelize;

if (dbDialect === 'mysql') {
  // MySQL Configuration
  sequelize = new Sequelize(
    process.env.DB_NAME || 'store_rating_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else if (dbDialect === 'sqlite') {
  // SQLite Configuration (for development/testing)
  console.log('Using SQLite for development');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../store_rating_db.sqlite'),
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // PostgreSQL Configuration (default)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'store_rating_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };
