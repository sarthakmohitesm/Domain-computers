# Domain Computers - Electronics & Repair Services Platform

> A comprehensive web application for managing electronics sales, repair services, and technical support operations with advanced task management and staff coordination.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Available Scripts](#available-scripts)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## 🎯 About

Domain Computers is a full-stack web platform designed for managing electronics sales, repair services, and technical support operations. The application provides:

- **Sales Management**: Browse and manage electronics products
- **Service Repair Tracking**: Create, assign, and track repair tasks
- **Staff Coordination**: Manage staff members and their workload
- **Admin Dashboard**: Comprehensive analytics and task oversight
- **Real-time Updates**: Live task status and assignment tracking

## ✨ Features

### Core Features

- **Task Management System**
  - Create repair tasks with customer details
  - Drag-and-drop task assignment to staff members
  - Task status tracking (Not Started, In Progress, Completed, Approved)
  - Task editing and approval workflows
  - Staff comments on tasks

- **Staff Management**
  - Add/remove staff members
  - Enable/disable staff accounts
  - Staff profile management
  - Workload tracking and analytics

- **Admin Dashboard**
  - Real-time task overview
  - Staff performance analytics
  - Task bucket management
  - Approved tasks review

- **User Roles & Authentication**
  - Admin accounts with full system access
  - Staff accounts with task-specific permissions
  - Secure authentication system
  - Role-based access control

- **Responsive UI**
  - Dark/light theme support
  - Mobile-responsive design
  - Modern component library (shadcn-ui)
  - Accessibility features

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **shadcn-ui** - Component library
- **React Router** - Routing
- **React Hook Form** - Form management
- **DnD Kit** - Drag-and-drop functionality
- **Three.js** - 3D rendering

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Supabase** - Authentication and storage
- **Google Sheets API** - Data integration

### Database
- **MongoDB** - NoSQL database
- **Supabase** - PostgreSQL alternative/backup

## 📋 Prerequisites

- **Node.js** (v16 or higher) - [Install Node.js](https://nodejs.org/)
- **npm** or **yarn** package manager
- **MongoDB** instance (local or cloud)
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd domain-s-digital-haven
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Google Sheets API
GOOGLE_SHEETS_API_KEY=your_google_api_key

# Server Configuration
PORT=3001
NODE_ENV=development
```

## ▶️ Running the Application

### Development Mode (Frontend Only)

```bash
npm run dev
```

The frontend will be available at `http://localhost:8080`

### Development Mode (Full Stack)

```bash
npm run dev:all
```

Runs both backend server and frontend in parallel:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3001`

### Backend Server Only

```bash
npm run dev:server
```

### Production Build

```bash
# Build frontend
npm run build

# Preview build
npm run preview
```

## 📁 Project Structure

```
domain-s-digital-haven/
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin dashboard components
│   │   ├── ui/             # Reusable UI components
│   │   └── ...             # Feature components
│   ├── pages/              # Page components (routes)
│   ├── contexts/           # React Context for state
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── integrations/       # External API integrations
│   └── App.tsx             # Main App component
│
├── server/
│   ├── index.js            # Express server entry point
│   ├── config/             # Database and external config
│   ├── middleware/         # Express middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   └── scripts/            # Setup and utility scripts
│
├── supabase/               # Supabase migrations
├── public/                 # Static assets
├── index.html              # HTML entry point
├── package.json            # Project dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🏗️ Architecture

### Authentication Flow
1. User logs in via Supabase authentication
2. JWT token is stored in local storage
3. Protected routes verify authentication before access
4. Role-based access control determines available features

### Task Management Flow
1. Admin creates tasks in Task Bucket
2. Tasks are displayed in unassigned task list
3. Admin drags tasks to assign to staff
4. Staff receives task notifications
5. Staff updates task status
6. Admin reviews and approves completed tasks

## 📝 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev:server` - Start backend server
- `npm run create-admin` - Create admin user
- `npm run check-admin` - Verify admin exists
- `npm run reset-admin-password` - Reset admin password

### Combined
- `npm run dev:all` - Run frontend and backend concurrently

## ⚙️ Configuration

### Database Configuration

Edit `server/config/db.js` for MongoDB connection settings.

### Tailwind CSS

Customize the design system in `tailwind.config.ts`.

### Component Shadcn

UI components are in `src/components/ui/`. Add new components using:

```bash
npx shadcn-ui@latest add [component-name]
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is proprietary software. Unauthorized copying or distribution is prohibited.
