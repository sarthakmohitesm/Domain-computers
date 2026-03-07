# Backend Server - MongoDB API

This is the Express.js backend server for the Domain's Digital Haven application, using MongoDB as the database.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `server` directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/domain-digital-haven
JWT_SECRET=your-secret-key-change-in-production
```

3. Make sure MongoDB is running on your system or use MongoDB Atlas connection string.

## Running the Server

```bash
# Run server only
npm run dev:server

# Run both frontend and backend
npm run dev:all
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Sign up a new user
- `POST /api/auth/signin` - Sign in
- `GET /api/auth/me` - Get current user (requires auth)

### Tasks
- `GET /api/tasks` - Get all tasks (admin only)
- `GET /api/tasks/unassigned` - Get unassigned tasks (admin only)
- `GET /api/tasks/assigned` - Get assigned tasks (admin only)
- `GET /api/tasks/status/:status` - Get tasks by status
- `GET /api/tasks/my-tasks` - Get current user's tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task (admin only)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (admin only)

### Staff
- `GET /api/staff` - Get all staff members (admin only)
- `POST /api/staff` - Create staff member (admin only)
- `PUT /api/staff/:id/status` - Update staff status (admin only)
- `DELETE /api/staff/:id` - Delete staff member (admin only)

### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/:id` - Get profile by ID

## Database Schema

### Users Collection
- `_id`: ObjectId
- `email`: String (unique)
- `password`: String (hashed)
- `created_at`: Date
- `updated_at`: Date

### Profiles Collection
- `_id`: ObjectId
- `id`: String (user ID reference)
- `email`: String (unique)
- `full_name`: String (optional)
- `status`: String ('active' | 'disabled')
- `created_at`: Date
- `updated_at`: Date

### Tasks Collection
- `_id`: ObjectId
- `customer_name`: String
- `contact_number`: String
- `device_name`: String
- `problem_reported`: String
- `assigned_to`: String (user ID, optional)
- `status`: String ('not_started' | 'working' | 'completed' | 'submitted' | 'approved' | 'rejected')
- `staff_notes`: String (optional)
- `rejection_reason`: String (optional)
- `created_by`: String (user ID, optional)
- `created_at`: Date
- `updated_at`: Date

### User Roles Collection
- `_id`: ObjectId
- `user_id`: String (user ID reference)
- `role`: String ('admin' | 'staff')
- `created_at`: Date

