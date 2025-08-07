# Store Rating System

A comprehensive web application that allows users to submit and manage ratings for stores with role-based access control.

## 🏗️ Architecture

- **Backend**: Express.js with PostgreSQL database
- **Frontend**: React with TypeScript
- **Authentication**: JWT-based with role-based authorization
- **Database**: PostgreSQL with Sequelize ORM

## 👥 User Roles

### System Administrator
- Add new stores, users, and admin users
- View dashboard with system statistics (total users, stores, ratings)
- Manage user accounts with filtering and sorting capabilities
- View store listings with ratings and details
- Full CRUD operations on users and stores

### Normal User
- Self-registration and authentication
- Browse and search stores by name and address
- Submit and modify ratings (1-5 scale) for stores
- View personal rating history
- Update account password

### Store Owner
- Access to store-specific dashboard
- View customers who rated their store
- Monitor store's average rating and total reviews
- Password management

## ✨ Features

### Authentication & Security
- Secure user registration and login
- JWT token-based authentication
- Role-based access control
- Password encryption with bcrypt
- Rate limiting on authentication endpoints

### Form Validations
- **Name**: 20-60 characters
- **Email**: Standard email format validation
- **Password**: 8-16 characters with uppercase and special character requirements
- **Address**: Maximum 400 characters

### Data Management
- Advanced filtering and sorting on all listings
- Pagination for large datasets
- Search functionality for stores by name and address
- Real-time rating calculations and updates

### User Interface
- Responsive design for all screen sizes
- Intuitive dashboards for each user role
- Modern CSS with gradient backgrounds and smooth animations
- Loading states and error handling
- Accessible design with keyboard navigation support

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StoreApp
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the backend directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=store_rating_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

4. **Setup Database**
   
   Create a PostgreSQL database named `store_rating_db` or use your preferred name (update .env accordingly).

5. **Start Backend Server**
   ```bash
   npm run dev
   ```
   
   The backend will run on http://localhost:3001

6. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

7. **Configure Frontend Environment (Optional)**
   
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

8. **Start Frontend Development Server**
   ```bash
   npm start
   ```
   
   The frontend will run on http://localhost:3000

## 📋 Default Admin Credentials

The system automatically creates a default admin user:
- **Email**: admin@storerating.com
- **Password**: Admin@123

⚠️ **Important**: Please change this password after first login!

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/update-password` - Update password

### Admin Routes
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `POST /api/admin/users` - Create new user
- `GET /api/admin/users` - List users with filtering
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/stores` - Create new store
- `GET /api/admin/stores` - List stores with filtering

### Store Routes
- `GET /api/stores` - Get all stores (for normal users)
- `POST /api/stores/:storeId/rate` - Submit/update rating
- `GET /api/stores/owner/dashboard` - Store owner dashboard

## 📦 Project Structure

```
StoreApp/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication, validation middleware
│   │   ├── models/          # Sequelize models
│   │   └── routes/          # API route definitions
│   ├── .env                 # Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── server.js           # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── admin/      # Admin dashboard components
│   │   │   ├── auth/       # Login/Register components
│   │   │   ├── layout/     # Navigation components
│   │   │   ├── store/      # Store owner components
│   │   │   └── user/       # User dashboard components
│   │   ├── contexts/       # React context providers
│   │   ├── App.tsx         # Main application component
│   │   └── index.tsx       # React entry point
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── .github/
│   └── copilot-instructions.md
└── README.md
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend Deployment
1. Set production environment variables
2. Install production dependencies: `npm ci --production`
3. Start with PM2: `pm2 start server.js`

### Frontend Deployment
1. Build the application: `npm run build`
2. Serve the build folder using a web server (nginx, Apache, or Vercel)

### Database Migration
The application uses Sequelize with auto-sync enabled in development. For production:
1. Set `NODE_ENV=production`
2. Use Sequelize migrations for schema changes
3. Ensure database backups before updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 Development Checklist

- [x] User authentication and authorization
- [x] Role-based access control
- [x] Admin dashboard with statistics
- [x] User and store management
- [x] Form validation and error handling
- [x] Responsive design
- [x] Database schema with relationships
- [x] API rate limiting and security
- [ ] Store rating functionality (frontend implementation)
- [ ] Store owner dashboard (full implementation)
- [ ] User profile management
- [ ] Advanced search and filtering
- [ ] Email notifications
- [ ] Unit and integration tests
- [ ] API documentation (Swagger)
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 🐛 Known Issues

- Store rating frontend components need full implementation
- Store owner dashboard requires completion
- User profile management is placeholder
- Search functionality needs enhancement

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Express.js and React
- Database powered by PostgreSQL
- Authentication using JWT
- UI inspired by modern dashboard designs
- Icons and emojis for enhanced user experience
# store-rating-app
