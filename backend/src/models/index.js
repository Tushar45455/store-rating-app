const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings' });
User.belongsTo(Store, { foreignKey: 'storeId', as: 'ownedStore' });

Store.hasMany(Rating, { foreignKey: 'storeId', as: 'ratings' });
Store.hasOne(User, { foreignKey: 'storeId', as: 'owner' });

Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Rating.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

module.exports = {
  User,
  Store,
  Rating
};
