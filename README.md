<div align="center">

# ⚡ Domain Computers - Electronics & Repair Services Platform

> <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge&logo=github&logoColor=white" alt="Status"/> &nbsp; <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version"/> &nbsp; <img src="https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge" alt="License"/>

**A comprehensive web application for managing electronics sales, repair services, and technical support operations with advanced task management and staff coordination.**

<details open>
<summary><b>⚙️ Quick Navigation</b></summary>

[🎯 About](#-about) • [✨ Features](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [🚀 Get Started](#-installation) • [📚 Documentation](#-project-structure)

</details>

</div>

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

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white;">

**Domain Computers** is a full-stack web platform designed for managing electronics sales, repair services, and technical support operations. The application provides:

</div>

- 🛍️ **Sales Management** - Browse and manage electronics products
- 🔧 **Service Repair Tracking** - Create, assign, and track repair tasks  
- 👥 **Staff Coordination** - Manage staff members and their workload
- 📊 **Admin Dashboard** - Comprehensive analytics and task oversight
- ⚡ **Real-time Updates** - Live task status and assignment tracking

## ✨ Features

<details open>
<summary><b>📌 Task Management System</b></summary>

- ✅ Create repair tasks with customer details
- ✅ Drag-and-drop task assignment to staff members
- ✅ Task status tracking (Not Started → In Progress → Completed → Approved)
- ✅ Task editing and approval workflows
- ✅ Staff comments on tasks

</details>

<details open>
<summary><b>👨‍💼 Staff Management</b></summary>

- ✅ Add/remove staff members
- ✅ Enable/disable staff accounts
- ✅ Staff profile management
- ✅ Workload tracking and analytics

</details>

<details open>
<summary><b>📈 Admin Dashboard</b></summary>

- ✅ Real-time task overview
- ✅ Staff performance analytics
- ✅ Task bucket management
- ✅ Approved tasks review

</details>

<details open>
<summary><b>🔐 User Roles & Authentication</b></summary>

- ✅ Admin accounts with full system access
- ✅ Staff accounts with task-specific permissions
- ✅ Secure authentication system
- ✅ Role-based access control

</details>

<details open>
<summary><b>📱 Responsive UI</b></summary>

- ✅ Dark/light theme support
- ✅ Mobile-responsive design
- ✅ Modern component library (shadcn-ui)
- ✅ Accessibility features

</details>

## 🛠️ Tech Stack

<table align="center">
<tr>
<td>

### 🎨 Frontend
- ![React](https://img.shields.io/badge/React%2018-61DAFB?style=flat-square&logo=react&logoColor=black) UI library
- ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) Type safety
- ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) Build tool
- ![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) Styling
- ![Shadcn](https://img.shields.io/badge/shadcn/ui-000000?style=flat-square&logo=shadcn&logoColor=white) Components
- React Router - Routing
- React Hook Form - Forms
- DnD Kit - Drag & Drop
- Three.js - 3D Rendering

</td>
<td>

### ⚙️ Backend & Database
- ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) Runtime
- ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) Framework
- ![MongoDB](https://img.shields.io/badge/MongoDB-13AA52?style=flat-square&logo=mongodb&logoColor=white) Database
- ![Google APIs](https://img.shields.io/badge/Google%20Sheets%20API-EA4335?style=flat-square&logo=google&logoColor=white) Integration
- JWT Authentication - Secure token-based auth
- REST API - Express.js backend service

</td>
</tr>
</table>

## 📋 Prerequisites

- **Node.js** (v16 or higher) - [Install Node.js](https://nodejs.org/)
- **npm** or **yarn** package manager
- **MongoDB** instance (local or cloud)
- **Git** for version control

## 🚀 Installation

### Step 1️⃣ Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd domain-s-digital-haven
```

### Step 2️⃣ Install Dependencies

```bash
npm install
```

### Step 3️⃣ Environment Configuration

Create a `.env.local` file in the root directory:

```env
# 🗄️ MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# � Google Sheets API
GOOGLE_SHEETS_API_KEY=your_google_api_key

# ⚙️ Server Configuration
PORT=3001
NODE_ENV=development

# 🔑 JWT Configuration
JWT_SECRET=your_jwt_secret_key
```

✨ **Ready to go!** Proceed to the next section.

## ▶️ Running the Application

<table>
<tr>
<td width="50%">

### 🎨 Frontend Development
```bash
npm run dev
```
👉 Available at: `http://localhost:8080`

</td>
<td width="50%">

### ⚙️ Backend Server
```bash
npm run dev:server
```
📡 API available at: `http://localhost:3001`

</td>
</tr>
<tr>
<td width="50%">

### 🚀 Full Stack (Recommended)
```bash
npm run dev:all
```
Runs both frontend & backend!

</td>
<td width="50%">

### 📦 Production Build
```bash
npm run build
npm run preview
```
Optimized build for deployment

</td>
</tr>
</table>

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

### 🔐 Authentication Flow

```
User Login (Email & Password)
    ↓
JWT Token Generated (via Express backend)
    ↓
Token Stored in localStorage
    ↓
Protected Routes Verified
    ↓
Role-Based Access Applied ✅
```

### 📋 Task Management Flow

```
Admin Creates Task
    ↓
Task Stored in MongoDB
    ↓
Task Available in Task Bucket (unassigned)
    ↓
Admin Drags to Assign Staff
    ↓
Task Updated in MongoDB (assigned_to field)
    ↓
Staff Receives & Updates Task
    ↓
Admin Reviews & Approves ✅
```

### 🗄️ Database Schema

**MongoDB Collections:**
- `users` - User credentials and authentication data
- `profiles` - User profile information (email, name, status)
- `user_roles` - User role assignments (admin/staff)
- `tasks` - Repair task records with customer details and status

## 📝 Available Scripts

<details>
<summary><b>🎨 Frontend Scripts</b></summary>

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |

</details>

<details>
<summary><b>⚙️ Backend Scripts</b></summary>

| Command | Description |
|---------|-------------|
| `npm run dev:server` | Start backend Express server |
| `npm run create-admin` | Create new admin user account |
| `npm run check-admin` | Verify admin account exists |
| `npm run reset-admin-password` | Reset admin password |

</details>

<details>
<summary><b>🚀 Combined Mode</b></summary>

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Run frontend + backend concurrently |

</details>

## ⚙️ Configuration

<details>
<summary><b>🗄️ Database Configuration</b></summary>

Edit `server/config/db.js` for MongoDB connection settings.

```javascript
// Example configuration
const mongoURI = process.env.MONGODB_URI;
// Connect to your MongoDB instance
```

</details>

<details>
<summary><b>🎨 Tailwind CSS</b></summary>

Customize the design system in `tailwind.config.ts`.

```javascript
// Extend Tailwind configuration
module.exports = {
  theme: {
    extend: {
      colors: {
        // Your custom colors
      }
    }
  }
}
```

</details>

<details>
<summary><b>🧩 Component Library (Shadcn)</b></summary>

UI components are in `src/components/ui/`. Add new components:

```bash
npx shadcn-ui@latest add [component-name]
```

Available components: Button, Dialog, Form, Select, and more!

</details>

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

```
1. 🍴 Fork the repository
   ↓
2. 🌿 Create feature branch
   git checkout -b feature/amazing-feature
   ↓
3. 💾 Commit changes
   git commit -m 'Add amazing feature'
   ↓
4. 📤 Push to branch
   git push origin feature/amazing-feature
   ↓
5. 🔔 Open a Pull Request
   ✅ Await review and merge!
```

## 📄 License

This project is **proprietary software**. Unauthorized copying or distribution is prohibited.

---

<div align="center">

### 🎉 Thanks for checking out Domain Computers!

<img src="https://img.shields.io/badge/Made%20with-❤️-ff69b4?style=for-the-badge" alt="Made with love"/>

**Questions or suggestions?** Feel free to open an issue! 

<!-- Animated Footer -->
<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" width="100%"/>

![GitHub Stars](https://img.shields.io/github/stars/yourusername/domain-computers?style=social) 
![GitHub Forks](https://img.shields.io/github/forks/yourusername/domain-computers?style=social)
![GitHub Issues](https://img.shields.io/github/issues/yourusername/domain-computers?style=social)

---

**Version 1.0.0** • **Last Updated:** March 2026 • **Status:** ✨ Active Development

</div>
