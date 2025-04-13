# NexMedisSocMed

A simple social media platform built as a fullstack test project for Nexmedis.

## Overview

NexmedisSocMed is a responsive social media platform with basic features including user authentication, posting content (text and images), liking posts, and commenting.

## Tech Stack

### Backend

- Node.js + Express
- Supabase for database and storage

### Frontend

- React.js
- Next.js
- Responsive design

## Features

- **User Authentication**

  - Register with email and password
  - Login with credentials
  - Protected routes

- **Posts**

  - Create posts with text and/or images
  - Update existing posts
  - Delete posts
  - View timeline of posts

- **Interactions**
  - Like posts
  - Comment on posts
  - View likes and comments

## Project Structure

```
nexmedissocmed/
├── fe/                     # Frontend Next.js application
│   ├── app/                # Next.js pages
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── public/             # Static assets
├── be/                     # Backend Express application
│   ├── controllers/        # Request handlers
│   ├── middlewares/        # Express middleware
│   ├── routes/             # API routes
│   ├── views/              # View templates
│   ├── docs/               # API Documentation
│   └── public/             # Public assets
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase

### Installation

1. Clone the repository

```bash
git clone https://github.com/f-chilmi/nexmedis-soc-med.git
cd nexmedis-soc-med
```

2. Set up the backend

```bash
cd be
npm install
npm install -g nodemon
cp .env.example .env
# Edit .env with your database credentials and Supabase details
nodemon
```

3. Set up the frontend

```bash
cd fe
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

4. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## API Documentation

A complete Postman collection for API testing is included in the repository. Import the collection from:

```
/be/docs/NexmedisSocMed.postman_collection.json
```

### Main Endpoints

#### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login

#### Posts

- `GET /api/posts` - Get all posts (timeline)
- `GET /api/posts/:id` - Get a specific post
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post

#### Likes

- `POST /api/likes` - Like a post
- `DELETE /api/likes` - Unlike a post

#### Comments

- `GET /api/comments` - Get comments for a post
- `POST /api/comments` - Add a comment to a post

Deployment
This application is deployed using Render for the backend and Vercel for the frontend:

Frontend: https://nexmedis.vercel.app/
Backend: https://nexmedis-soc-med.onrender.com/
