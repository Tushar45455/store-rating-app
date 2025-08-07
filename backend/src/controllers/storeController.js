const { Store, Rating, User } = require('../models');
const { Op } = require('sequelize');

// Helper function to handle case-insensitive search across databases
const getCaseInsensitiveOperator = () => {
  const dbDialect = process.env.DB_DIALECT || 'postgres';
  return dbDialect === 'sqlite' ? Op.like : Op.iLike;
};

// Get all stores for normal users (with user's rating if exists)
const getAllStores = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'ASC',
      name,
      address
    } = req.query;

    const userId = req.user.id;
    const offset = (page - 1) * limit;
    const whereClause = {};
    const caseInsensitiveOp = getCaseInsensitiveOperator();

    // Apply search filters
    if (name) {
      whereClause.name = { [caseInsensitiveOp]: `%${name}%` };
    }
    if (address) {
      whereClause.address = { [caseInsensitiveOp]: `%${address}%` };
    }

    const stores = await Store.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Rating,
          as: 'ratings',
          where: { userId },
          required: false,
          attributes: ['rating']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Transform data to include user's rating
    const storesWithUserRating = stores.rows.map(store => ({
      id: store.id,
      name: store.name,
      address: store.address,
      averageRating: parseFloat(store.averageRating) || 0,
      totalRatings: store.totalRatings,
      userRating: store.ratings && store.ratings.length > 0 ? store.ratings[0].rating : null
    }));

    res.json({
      stores: storesWithUserRating,
      totalCount: stores.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(stores.count / limit)
    });
  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Submit or update rating for a store
const rateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user has already rated this store
    let existingRating = await Rating.findOne({
      where: { userId, storeId }
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      // Create new rating
      await Rating.create({
        userId,
        storeId,
        rating
      });
    }

    // Recalculate store's average rating
    await updateStoreAverageRating(storeId);

    res.json({
      message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('Rate store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get store owner dashboard data
const getOwnerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const storeId = req.user.storeId;

    if (!storeId) {
      return res.status(400).json({ message: 'User is not associated with any store' });
    }

    // Get store details
    const store = await Store.findByPk(storeId, {
      attributes: ['id', 'name', 'averageRating', 'totalRatings']
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Get users who rated this store
    const ratingsWithUsers = await Rating.findAll({
      where: { storeId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const ratedUsers = ratingsWithUsers.map(rating => ({
      userId: rating.user.id,
      userName: rating.user.name,
      userEmail: rating.user.email,
      rating: rating.rating,
      ratedAt: rating.createdAt
    }));

    res.json({
      store: {
        id: store.id,
        name: store.name,
        averageRating: parseFloat(store.averageRating) || 0,
        totalRatings: store.totalRatings
      },
      ratedUsers
    });
  } catch (error) {
    console.error('Get owner dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper function to update store's average rating
const updateStoreAverageRating = async (storeId) => {
  try {
    const ratings = await Rating.findAll({
      where: { storeId },
      attributes: ['rating']
    });

    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings
      : 0;

    await Store.update(
      { 
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalRatings 
      },
      { where: { id: storeId } }
    );
  } catch (error) {
    console.error('Update store average rating error:', error);
    throw error;
  }
};

// Get store ratings for store owner dashboard
const getStoreRatings = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // Verify the user owns this store
    const user = await User.findByPk(userId);
    if (!user || user.storeId != storeId) {
      return res.status(403).json({ message: 'Access denied. You do not own this store.' });
    }

    // Get store with all ratings
    const store = await Store.findByPk(storeId, {
      include: [
        {
          model: Rating,
          as: 'ratings',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json({
      averageRating: parseFloat(store.averageRating) || 0,
      totalRatings: store.totalRatings || 0,
      ratings: store.ratings || []
    });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllStores,
  rateStore,
  getOwnerDashboard,
  getStoreRatings
};
