# MongoDB Integration Guide

This project has been migrated from Supabase to MongoDB. Follow these steps to set up and run the application.

## Prerequisites

1. **MongoDB**: Install MongoDB locally or use MongoDB Atlas (cloud)
   - Local: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Atlas: Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Node.js**: Ensure you have Node.js 18+ installed

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/domain-digital-haven
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/domain-digital-haven
JWT_SECRET=your-secret-key-change-in-production
```

For the frontend, create a `.env` file in the root directory (optional, defaults to localhost):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# On Windows
net start MongoDB

# On macOS/Linux
mongod
```

**MongoDB Atlas:**
- No local setup needed, just use your connection string

### 4. Run the Application

**Option 1: Run both frontend and backend together**
```bash
npm run dev:all
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
npm run dev:server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173 (or your Vite port)
- Backend API: http://localhost:5000/api

## Creating Your First Admin User

Since authentication is now handled by MongoDB, you'll need to create an admin user. You can do this by:

1. Using the API directly:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

2. Or modify the signup endpoint temporarily to allow admin creation

## Database Collections

The application uses the following MongoDB collections:

- **users**: Stores user credentials (email, hashed password)
- **profiles**: Stores user profile information
- **tasks**: Stores repair tasks
- **user_roles**: Stores user roles (admin/staff)

## Migration Notes

- All Supabase-specific code has been replaced with MongoDB API calls
- Authentication now uses JWT tokens stored in localStorage
- The frontend communicates with the backend via REST API
- All database operations go through the Express.js backend

## Troubleshooting

1. **MongoDB Connection Error**: Ensure MongoDB is running and the connection string is correct
2. **Port Already in Use**: Change the PORT in server/.env
3. **CORS Errors**: The backend is configured to allow requests from the frontend
4. **Authentication Issues**: Clear localStorage and sign in again

## API Documentation

See `server/README.md` for detailed API endpoint documentation.

