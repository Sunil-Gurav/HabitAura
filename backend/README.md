# HabitSpark Backend API

A Node.js/Express REST API for the HabitSpark habit tracking application.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Habit Management**: CRUD operations for habits with progress tracking
- **User Profiles**: User profile management and statistics
- **Security**: Helmet, rate limiting, input validation, and password hashing
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, bcryptjs, express-rate-limit
- **Validation**: express-validator

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/habitspark
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Habit Routes (`/api/habits`)

- `GET /api/habits` - Get all user habits (protected)
- `GET /api/habits/:id` - Get specific habit (protected)
- `POST /api/habits` - Create new habit (protected)
- `PUT /api/habits/:id` - Update habit (protected)
- `DELETE /api/habits/:id` - Delete habit (protected)
- `POST /api/habits/:id/progress` - Add/update progress (protected)

### User Routes (`/api/users`)

- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `GET /api/users/stats` - Get user statistics (protected)
- `DELETE /api/users/account` - Deactivate account (protected)

### Health Check

- `GET /api/health` - API health check

## Data Models

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String
  },
  preferences: {
    theme: String,
    notifications: Object,
    timezone: String
  },
  stats: {
    totalHabits: Number,
    completedHabits: Number,
    currentStreak: Number,
    longestStreak: Number
  },
  isActive: Boolean,
  lastLogin: Date
}
```

### Habit Model
```javascript
{
  user: ObjectId (ref: User),
  title: String (required),
  description: String,
  category: String (enum),
  frequency: String (enum),
  target: {
    value: Number,
    unit: String
  },
  priority: String (enum),
  color: String,
  icon: String,
  reminders: Array,
  progress: [{
    date: Date,
    completed: Boolean,
    value: Number,
    notes: String
  }],
  stats: {
    currentStreak: Number,
    longestStreak: Number,
    totalCompletions: Number,
    completionRate: Number
  },
  isActive: Boolean,
  startDate: Date,
  endDate: Date
}
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: express-validator for request validation
- **Security Headers**: Helmet for security headers
- **CORS**: Configured for frontend domain

## Error Handling

The API includes comprehensive error handling:
- Validation errors with detailed messages
- Authentication and authorization errors
- Database connection errors
- Generic server errors with appropriate status codes

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/habitspark |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.