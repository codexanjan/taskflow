# 🚀 TaskFlow - Modern Full-Stack To-Do Application

A modern, responsive, and feature-rich task management application built with React, Tailwind CSS, Node.js, Express, and MongoDB. Designed to help users organize, prioritize, and track their daily tasks efficiently.

TaskFlow features a sleek **Glassmorphism UI** aesthetic, **Dark/Light Theme toggling**, and **Framer Motion layout animations** for a premium desktop and mobile user experience.

---

## ✨ Features

### 🔐 Authentication
*   User Registration & Login
*   JWT Authentication
*   Password Encryption with `bcryptjs`
*   Protected Routes
*   Google OAuth 2.0 Authentication
*   Secure Session Management
*   Persistent Login Support

### 📝 Task Management
*   Create, Edit, and Delete Tasks
*   Mark Tasks as Complete/Incomplete with spring animations
*   Task Priorities (High, Medium, Low)
*   Due Dates
*   Categories & Tags
*   Search & Filtering

### 📊 Dashboard
*   Task Statistics
*   Completed vs Pending Overview
*   Priority-Based Analytics
*   Productivity Tracking

### 🎨 User Experience
*   Modern UI/UX Design (Glassmorphic cards & glow elements)
*   Dark & Light Mode
*   Responsive Design (Desktop & Mobile optimized layouts)
*   Smooth Animations with Framer Motion
*   Toast Notifications (Offline/Online updates)
*   Drag-and-Drop Task Reordering (HTML5 + Framer Motion layout sync)

---

## 🔑 Google Authentication

Users can securely sign in using their Google account without creating a separate password.

### Features
*   **One-click Google Sign-In** for instant access
*   **Secure OAuth 2.0 Flow** via Passport.js
*   **Automatic Account Creation** on first login
*   **JWT Token Generation** upon verification
*   **Profile Information Sync** (Google Name & Avatar images)
*   **Persistent User Sessions** saved securely

### Google OAuth Tech Stack
*   Google OAuth 2.0
*   Passport.js / Google Strategy
*   JWT Authentication
*   MongoDB User Storage

### User Data Stored
*   Google ID
*   Name
*   Email Address
*   Profile Picture
*   Account Creation Date

### Security Features
*   Secure OAuth Flow redirects
*   JWT Token Validation in middleware
*   Protected API Routes
*   Environment Variable Protection
*   HTTPS Proxy Support for Cloud Deployments

---

## 🛠️ Updated Tech Stack

### Frontend
*   **React.js** (Vite)
*   **Tailwind CSS (v4)**
*   **Framer Motion**
*   **Lucide Icons**
*   **Axios**
*   **React Router DOM**
*   **React Hook Form**

### Backend
*   **Node.js**
*   **Express.js**
*   **MongoDB Atlas**
*   **Mongoose**
*   **JWT Authentication**
*   **bcryptjs**
*   **Passport.js**
*   **Google OAuth 2.0**
*   **dotenv**
*   **CORS**

---

## 🚀 Advanced Features

*   **Google Authentication** integration
*   **Drag-and-Drop Task Management** using native HTML5 and Framer Motion Layouts
*   **Dark & Light Mode** (system-aware switcher)
*   **Analytics Dashboard** (radial SVG progress meters)
*   **Search & Filtering** (by title, description, priority, and completion states)
*   **Categories & Tags** for quick categorization
*   **Due Date Tracking** with flashing overdue warnings
*   **Priority Management** with custom glowing color codes
*   **Responsive Design** adapting beautifully to mobile, tablet, and desktop viewports
*   **Real-Time Notifications** and offline LocalStorage fallback modes

---

## 📂 Project Structure

```bash
todo-app/
├── client/              # React frontend application (Vite)
│   ├── public/          # Manifest.json, sw.js service worker, icons
│   └── src/
│       ├── components/  # Navbar, Dashboard, TaskCard, TaskStats, TaskForm, AuthForm
│       ├── context/     # AuthContext, ThemeContext
│       ├── utils/       # api.js client wrapper with LocalStorage fallback
│       ├── App.jsx      # Main layout router and background floating blobs
│       ├── index.css    # Typography, glassmorphism classes, and keyframe animations
│       └── main.jsx     # App mounting and Service Worker registration
│
├── server/              # Express backend server
│   ├── config/          # Passport.js strategy configuration
│   ├── middleware/      # JWT Authentication guards
│   ├── models/          # Mongoose database models (User, Task)
│   ├── routes/          # Express API controllers (auth, tasks)
│   ├── server.js        # Express app entry and DB connections
│   └── package.json     # Node script configuration
│
├── .vscode/             # IDE settings config
└── package.json         # Workspace root concurrent script runner
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/codexanjan/taskflow.git
cd taskflow
```

### Auto-Install Dependencies
You can install dependencies for both the `client` and `server` folders in one command from the root folder:
```bash
npm run install:all
```

### Environment Variables
Create a `.env` file inside the `server` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
CLIENT_URL=http://localhost:5173
```

---

## 🌐 Running the Application

### Running Concurrently (Recommended)
You can start both the client and server concurrently from the root folder:
```bash
npm run dev
```

### Running Individually

*   **To run the frontend client only:**
    ```bash
    npm run client
    ```
*   **To run the backend server only:**
    ```bash
    npm run server
    ```
    *(Note: If launched alone, the client will automatically notify you and launch in Guest Mode using LocalStorage for all operations).*

---

## 🌐 Deployment

*   **Frontend:** Vercel
*   **Backend:** Render
*   **Database:** MongoDB Atlas

---

## 📸 Screenshots

Add screenshots here after completing the project.

---

## 🎯 Future Enhancements

*   Email Notifications
*   Team Collaboration
*   Calendar Integration
*   Real-Time Updates
*   Mobile App Version
*   AI Task Recommendations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](file:///c:/Users/anjan/OneDrive/Documents/projects/to%20do%20list/LICENSE) file for details.

---

## 👨‍💻 Author

**Anjan Shetty**
*   GitHub: [codexanjan](https://github.com/codexanjan)

⭐ *If you like this project, don't forget to star the repository!*

Made with ❤️ by Anjan Shetty
