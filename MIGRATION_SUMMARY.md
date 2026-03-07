# MongoDB Migration Summary

## What Was Changed

### Backend (New)
- ✅ Created Express.js server in `server/` directory
- ✅ MongoDB connection setup with connection pooling
- ✅ MongoDB models for User, Profile, Task, and UserRole
- ✅ REST API routes for authentication, tasks, staff, and profiles
- ✅ JWT-based authentication middleware
- ✅ Role-based access control (admin/staff)

### Frontend (Updated)
- ✅ Created new API client (`src/integrations/api/client.ts`) to replace Supabase client
- ✅ Updated `AuthContext` to use MongoDB API with JWT tokens
- ✅ Updated all admin components to use MongoDB API:
  - TaskCreation
  - TaskBucket
  - TaskOverview
  - TaskReview
  - ApprovedTasks
  - StaffManagement
  - StaffDropZone
- ✅ Updated dashboard pages (AdminDashboard, StaffDashboard)
- ✅ All Supabase imports replaced with MongoDB API calls

### Configuration
- ✅ Updated `package.json` with MongoDB dependencies
- ✅ Added backend server scripts
- ✅ Created admin user creation script

## Database Schema

### Collections

1. **users** - User credentials
   - `_id`: ObjectId
   - `email`: String (unique)
   - `password`: String (bcrypt hashed)
   - `created_at`, `updated_at`: Date

2. **profiles** - User profiles
   - `_id`: ObjectId
   - `id`: String (references user._id)
   - `email`: String (unique)
   - `full_name`: String (optional)
   - `status`: 'active' | 'disabled'
   - `created_at`, `updated_at`: Date

3. **tasks** - Repair tasks
   - `_id`: ObjectId
   - `customer_name`, `contact_number`, `device_name`, `problem_reported`: String
   - `assigned_to`: String (user ID, optional)
   - `status`: 'not_started' | 'working' | 'completed' | 'submitted' | 'approved' | 'rejected'
   - `staff_notes`, `rejection_reason`: String (optional)
   - `created_by`: String (user ID, optional)
   - `created_at`, `updated_at`: Date

4. **user_roles** - User roles
   - `_id`: ObjectId
   - `user_id`: String (references user._id)
   - `role`: 'admin' | 'staff'
   - `created_at`: Date

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/signin` - Sign in
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - All tasks (admin)
- `GET /api/tasks/unassigned` - Unassigned tasks (admin)
- `GET /api/tasks/assigned` - Assigned tasks (admin)
- `GET /api/tasks/status/:status` - Tasks by status
- `GET /api/tasks/my-tasks` - Current user's tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task (admin)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (admin)

### Staff
- `GET /api/staff` - All staff (admin)
- `POST /api/staff` - Create staff (admin)
- `PUT /api/staff/:id/status` - Update status (admin)
- `DELETE /api/staff/:id` - Delete staff (admin)

### Profiles
- `GET /api/profiles` - All profiles
- `GET /api/profiles/:id` - Get profile by ID

## Setup Instructions

1. Install dependencies: `npm install`
2. Set up MongoDB (local or Atlas)
3. Create `.env` in `server/` directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/domain-digital-haven
   JWT_SECRET=your-secret-key
   ```
4. Create admin user: `npm run create-admin [email] [password] [name]`
5. Run the application: `npm run dev:all`

## Key Differences from Supabase

1. **Authentication**: JWT tokens stored in localStorage instead of Supabase session
2. **Database**: MongoDB instead of PostgreSQL
3. **API**: REST API calls instead of direct Supabase client calls
4. **Backend**: Express.js server required (Supabase was serverless)
5. **Real-time**: No built-in real-time subscriptions (can be added with Socket.io if needed)

## Notes

- All existing functionality has been preserved
- The frontend interface remains unchanged
- Data structure is compatible with the original schema
- MongoDB indexes are automatically created on connection

