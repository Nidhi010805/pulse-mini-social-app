# Pulse — Mini Social Post Application

A full-stack MERN social feed application built for the **3W Full Stack Internship Assignment (Round 1)**.

Users can sign up, log in, create text/image/text+image posts, like and comment on posts in real time, and browse a paginated feed — all in a clean, responsive Material UI interface.

> UI is inspired by the general concept of a social feed (similar to TaskPlanet's Social Page) but is an original implementation. No proprietary code, branding, logos, or assets were copied.

**Live Website:** https://pulse-mini-social-app.vercel.app
**Backend API:** https://pulse-mini-social-app.onrender.com
**GitHub Repository:** https://github.com/Nidhi010805/pulse-mini-social-app

---

## Overview

Pulse is a "Mini Social Post Application" that supports the full loop of a lightweight social feed:

- Account creation and login (JWT-based auth)
- Creating posts with text, an image, or both
- Viewing a global feed of posts from all users, paginated
- Liking / unliking posts with an instant UI update
- Commenting on posts with an instant UI update
- Fully responsive layout: 360px mobile → 1440px+ desktop

---

## Features

- 🔐 JWT authentication with bcrypt password hashing
- 📝 Create posts: text-only, image-only, or text + image
- ☁️ Image uploads stored on Cloudinary (no local file persistence)
- ❤️ Like/unlike with optimistic, instant UI updates
- 💬 Comments with instant UI updates and relative timestamps
- 📄 Backend pagination (`Load More`) — the feed never loads the entire collection at once
- 💀 Skeleton loading states, Snackbar notifications, empty states
- 📱 Fully responsive: mobile, tablet, laptop, desktop
- 🗄️ Only **two** MongoDB collections (`users`, `posts`) — likes and comments are embedded documents

---

## Tech Stack

**Frontend:** React.js (Vite), Material UI, React Router DOM, Axios, Context API
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer, Cloudinary
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database), Cloudinary (images)

---

## Project Structure

```
project-root/
├── frontend/                  # React + Vite client
│   ├── src/
│   │   ├── api/api.js         # Centralized Axios instance + endpoints
│   │   ├── components/        # Navbar, CreatePost, PostCard, CommentSection, ...
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/              # Login, Signup, Feed, NotFound
│   │   ├── theme/theme.js      # MUI design system
│   │   ├── utils/formatDate.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vercel.json             # SPA rewrite rule for React Router
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
├── backend/                    # Node + Express API
│   ├── config/                 # db.js, cloudinary.js
│   ├── controllers/            # authController.js, postController.js
│   ├── middleware/             # authMiddleware.js, errorMiddleware.js
│   ├── models/                 # User.js, Post.js
│   ├── routes/                 # authRoutes.js, postRoutes.js
│   ├── utils/generateToken.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

---

## Database Design

Only **two** collections are used, exactly as required by the assignment.

### `users`

| Field       | Type     | Notes                              |
|-------------|----------|-------------------------------------|
| username    | String   | required, unique                    |
| email       | String   | required, unique, stored lowercase  |
| password    | String   | required, bcrypt-hashed, never returned |
| createdAt   | Date     | auto                                 |
| updatedAt   | Date     | auto                                 |

### `posts`

| Field      | Type              | Notes                                   |
|------------|-------------------|-------------------------------------------|
| user       | ObjectId → User   | author reference                          |
| username   | String            | denormalized for fast feed rendering      |
| text       | String            | optional if image present                 |
| image      | String            | Cloudinary URL, optional if text present   |
| likes      | [ { user, username, createdAt } ] | **embedded**, no separate collection |
| comments   | [ { user, username, text, createdAt } ] | **embedded**, no separate collection |
| createdAt  | Date              | auto                                       |
| updatedAt  | Date              | auto                                       |

A post is rejected (`400`) unless it has non-empty `text` and/or an `image`.

---

## API Documentation

Base URL (local): `http://localhost:5000/api`

| Method | Endpoint                    | Auth | Description                          |
|--------|------------------------------|------|----------------------------------------|
| POST   | `/auth/signup`                | No   | Register a new user                    |
| POST   | `/auth/login`                 | No   | Log in and receive a JWT                |
| GET    | `/auth/me`                    | Yes  | Get the currently logged-in user        |
| GET    | `/posts?page=1&limit=10`      | Yes  | Get a paginated feed, newest first      |
| POST   | `/posts`                      | Yes  | Create a post (`multipart/form-data`: `text`, `image`) |
| PUT    | `/posts/:id/like`             | Yes  | Toggle like/unlike on a post            |
| POST   | `/posts/:id/comments`         | Yes  | Add a comment (`{ text }`)              |
| DELETE | `/posts/:id`                  | Yes  | Delete your own post (optional feature) |

All responses follow a consistent shape:

```json
{ "success": true, "message": "Post created successfully", "data": { } }
```

```json
{ "success": false, "message": "Post content cannot be empty" }
```

Authenticated requests must send:

```
Authorization: Bearer <token>
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB instance)
- A Cloudinary account (free tier is fine)

### 1. Clone and install

```bash
git clone https://github.com/Nidhi010805/pulse-mini-social-app.git
cd pulse-mini-social-app

cd backend
npm install

cd ../frontend
npm install
```

### 2. Environment Variables

**backend/.env** (copy from `backend/.env.example`):

```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**frontend/.env** 

```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the application

```bash
# Terminal 1 — backend
cd backend
npm run dev      # starts on http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm run dev       # starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## Deployment

- **MongoDB Atlas:** free M0 cluster, database user created, network access set to `0.0.0.0/0`.
- **Cloudinary:** free account, `Cloud Name` / `API Key` / `API Secret` from the dashboard.
- **Backend (Render):** Root Directory `backend`, Build Command `npm install`, Start Command `npm start`, environment variables set as listed above.
- **Frontend (Vercel):** Root Directory `frontend`, Framework Preset `Vite`, `VITE_API_URL` set to the deployed Render backend URL + `/api`.
- After both are live, the backend's `CLIENT_URL` is set to the Vercel URL so CORS allows requests from the deployed frontend.

---

## Future Improvements

- Post editing and deletion from the UI (delete API already exists)
- User profile pages and avatar image uploads
- Follow/unfollow and a personalized feed
- Real-time updates via WebSockets instead of client-side optimistic updates
- Search and hashtag filtering
- Notification system for likes/comments

-
